/**
 * Email utility functions for sending various types of emails
 * Note: These are placeholder implementations. In production, integrate with
 * an email service like SendGrid, AWS SES, or Nodemailer.
 */

/**
 * Send welcome email to new user
 * @param email - User's email address
 * @param name - User's name
 */
export async function sendWelcomeEmail(
  email: string,
  name: string
): Promise<void> {
  console.log(`[EMAIL] Sending welcome email to ${email} (${name})`);
  // TODO: Implement actual email sending logic
  // Example: await emailService.send({ to: email, template: 'welcome', data: { name } });
}

/**
 * Send password reset request notification to admin
 * @param userEmail - User's email address
 * @param userName - User's name
 */
export async function sendPasswordResetRequestToAdmin(
  userEmail: string,
  userName: string
): Promise<void> {
  console.log(
    `[EMAIL] Sending password reset request notification to admin for user ${userEmail} (${userName})`
  );
  // TODO: Implement actual email sending logic
}

/**
 * Send password reset link to user
 * @param email - User's email address
 * @param resetToken - Password reset token
 */
export async function sendPasswordResetLink(
  email: string,
  resetToken: string
): Promise<void> {
  const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${resetToken}`;
  console.log(
    `[EMAIL] Sending password reset link to ${email}: ${resetUrl}`
  );
  // TODO: Implement actual email sending logic
}

/**
 * Send password reset denied notification to user
 * @param email - User's email address
 * @param reason - Reason for denial (optional)
 */
export async function sendPasswordResetDenied(
  email: string,
  reason?: string
): Promise<void> {
  console.log(
    `[EMAIL] Sending password reset denied notification to ${email}${reason ? `: ${reason}` : ''}`
  );
  // TODO: Implement actual email sending logic
}
