'use server';

import { hash } from 'bcryptjs';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { validatePassword } from '@/lib/auth/common-passwords';
import { validateResetToken } from '@/components/auth/reset-tokens';

export interface ResetPasswordState {
  status: 'idle' | 'success' | 'error';
  message?: string;
  errors?: {
    password?: string;
    confirmPassword?: string;
  };
}

// ─────────────────────────────────────────────────────────────
//  Helpers
// ─────────────────────────────────────────────────────────────

async function getClientIp(): Promise<string | null> {
  try {
    const headersList = await headers();
    return (
      headersList.get('x-forwarded-for')?.split(',')[0]?.trim() ??
      headersList.get('x-real-ip') ??
      headersList.get('cf-connecting-ip') ??
      null
    );
  } catch {
    return null;
  }
}

interface AuditEvent {
  event:
    | 'password_reset_success'
    | 'password_reset_invalid_token'
    | 'password_reset_validation_failed';
  email?: string;
  ip: string | null;
  reason?: string;
  userId?: string;
}

function logAuditEvent(event: AuditEvent): void {
  console.log(
    JSON.stringify({
      timestamp: new Date().toISOString(),
      ...event,
    })
  );
}

// ─────────────────────────────────────────────────────────────
//  Reset password action
// ─────────────────────────────────────────────────────────────

export async function resetPasswordAction(
  _prev: ResetPasswordState,
  formData: FormData
): Promise<ResetPasswordState> {
  const token = (formData.get('token') as string)?.trim() ?? '';
  const password = (formData.get('password') as string) ?? '';
  const confirmPassword = (formData.get('confirmPassword') as string) ?? '';
  const ip = await getClientIp();

  // ─── Validate password ───
  const errors: NonNullable<ResetPasswordState['errors']> = {};

  if (!password) {
    errors.password = 'Password is required';
  } else {
    const passwordErrors = validatePassword(password);
    if (passwordErrors.length > 0) {
      errors.password = passwordErrors[0];
    }
  }

  if (!confirmPassword) {
    errors.confirmPassword = 'Please confirm your password';
  } else if (password && password !== confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }

  if (Object.keys(errors).length > 0) {
    logAuditEvent({
      event: 'password_reset_validation_failed',
      ip,
      reason: 'password_validation',
    });
    return {
      status: 'error',
      message: 'Please fix the errors below',
      errors,
    };
  }

  // ─── Validate token ───
  const tokenValidation = await validateResetToken(token);

  if (!tokenValidation.valid) {
    logAuditEvent({
      event: 'password_reset_invalid_token',
      ip,
      reason: tokenValidation.reason,
    });

    const messages = {
      not_found:
        'This reset link is invalid. Please request a new one.',
      expired:
        'This reset link has expired. Please request a new one.',
      used:
        'This reset link has already been used. Please request a new one if needed.',
      no_user:
        'Account not found. Please contact the society admin.',
    };

    return {
      status: 'error',
      message: messages[tokenValidation.reason],
    };
  }

  try {
    // ─── Hash new password ───
    const hashedPassword = await hash(password, 12);

    // ─── Update user + mark token used (atomic) ───
    await prisma.$transaction([
      prisma.user.update({
        where: { id: tokenValidation.userId },
        data: { password: hashedPassword },
      }),
      prisma.passwordResetRequest.update({
        where: { id: tokenValidation.requestId },
        data: { status: 'COMPLETED' },
      }),
    ]);

    logAuditEvent({
      event: 'password_reset_success',
      email: tokenValidation.userEmail,
      userId: tokenValidation.userId,
      ip,
    });

    return {
      status: 'success',
      message: 'Password updated successfully',
    };
  } catch (error) {
    console.error('[resetPasswordAction] failed', error);
    return {
      status: 'error',
      message: 'Something went wrong. Please try again.',
    };
  }
}