import AuthLayout from "@/components/auth/AuthLayout";
import { validateResetToken } from "@/components/auth/reset-tokens";
import InvalidTokenView from "./_components/InvalidTokenView";
import ResetPasswordForm from "./_components/ResetPasswordForm";

interface PageProps {
  searchParams: Promise<{ token?: string }>;
}

export const metadata = {
  title: "Set new password — GDV Society Hub",
};

export const dynamic = "force-dynamic";

export default async function ResetPasswordPage({ searchParams }: PageProps) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <AuthLayout tagline="Security is our priority" brandVariant="security">
        <InvalidTokenView reason="not_found" />
      </AuthLayout>
    );
  }

  // Validate token server-side BEFORE rendering form
  const validation = await validateResetToken(token);

  if (!validation.valid) {
    return (
      <AuthLayout tagline="Security is our priority" brandVariant="security">
        <InvalidTokenView reason={validation.reason} />
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      tagline="Choose a strong new password to secure your account"
      brandVariant="security"
    >
      <ResetPasswordForm
        token={token}
        userEmail={validation.userEmail}
        userName={validation.userName}
      />
    </AuthLayout>
  );
}
