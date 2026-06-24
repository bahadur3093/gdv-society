import AuthLayout from "@/components/auth/AuthLayout";
import SigninForm from "./_components/SigninForm";

export const metadata = {
  title: "Sign in — GDV Society Hub",
};

export default function SigninPage() {
  return (
    <AuthLayout tagline="Maintenance made simple for modern residential communities.">
      <SigninForm />
    </AuthLayout>
  );
}
