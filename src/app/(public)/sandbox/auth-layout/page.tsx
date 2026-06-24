import AuthLayout from '@/components/auth/AuthLayout';
import AuthForm from '@/components/auth/AuthForm';

export default function AuthLayoutSandbox() {
  return (
    <AuthLayout tagline="Maintenance made simple">
      <AuthForm
        headline="Welcome back"
        subheading="Sign in to your society account"
        footer={
          <>
            New to GDV?{' '}
            <span className="text-brand-primary font-medium">Create account</span>
          </>
        }
      >
        <div className="p-8 text-center text-text-muted">
          [Form content goes here in real pages]
        </div>
      </AuthForm>
    </AuthLayout>
  );
}