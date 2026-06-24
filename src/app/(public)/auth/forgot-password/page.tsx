import AuthLayout from '@/components/auth/AuthLayout';
import ForgotPasswordForm from './_components/ForgotPasswordForm';

export const metadata = {
  title: 'Reset password — GDV Society Hub',
};

export default function ForgotPasswordPage() {
  return (
    <AuthLayout
      tagline="Don't worry, it happens. Security is our priority."
      brandVariant="security"
    >
      <ForgotPasswordForm />
    </AuthLayout>
  );
}