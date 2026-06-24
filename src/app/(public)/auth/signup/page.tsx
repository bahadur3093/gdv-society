import AuthLayout from "@/components/auth/AuthLayout";
import SignupForm from "./_components/SignupForm";

export const metadata = {
  title: "Sign up — GDV Society Hub",
};

export default function SignupPage() {
  return (
    <AuthLayout tagline="Welcome to the neighborhood. Everything you need for your society, managed in one intelligent platform.">
      <SignupForm />
    </AuthLayout>
  );
}
