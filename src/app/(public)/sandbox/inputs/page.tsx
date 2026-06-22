"use client";

import { useState } from "react";
import {
  Search,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Calendar,
  AtSign,
} from "lucide-react";
import Input from "@/components/atoms/Input";
import FormField from "@/components/atoms/FormField";
import Button from "@/components/atoms/Button";

export default function InputsSandbox() {
  const [showPassword, setShowPassword] = useState(false);
  const [amount, setAmount] = useState("");
  const [emailValue, setEmailValue] = useState("");

  // Live validation example
  const emailError =
    emailValue && !emailValue.includes("@")
      ? "Please enter a valid email address"
      : undefined;

  return (
    <div className="max-w-2xl mx-auto p-8 space-y-12">
      <header>
        <h1 className="text-h1 text-text-primary">Input + FormField</h1>
        <p className="text-body-lg text-text-secondary mt-2">
          The form foundation — accessible by default, theme-aware, fully
          composable.
        </p>
      </header>

      {/* ─── Sizes ─── */}
      <Section title="Sizes">
        <div className="space-y-3 max-w-sm">
          <Input inputSize="sm" placeholder="Small input" />
          <Input inputSize="md" placeholder="Medium input (default)" />
          <Input inputSize="lg" placeholder="Large input" />
        </div>
      </Section>

      {/* ─── With Icons ─── */}
      <Section title="With Icons">
        <div className="space-y-3 max-w-sm">
          <Input leadingIcon={<Search />} placeholder="Search villas..." />
          <Input
            leadingIcon={<Mail />}
            type="email"
            placeholder="you@example.com"
          />
          <Input
            leadingIcon={<Lock />}
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            trailingIcon={
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="pointer-events-auto"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            }
          />
        </div>
      </Section>

      {/* ─── With Prefix/Suffix ─── */}
      <Section title="With Prefix and Suffix">
        <div className="space-y-3 max-w-sm">
          <Input
            prefix="₹"
            type="number"
            placeholder="3600"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <Input suffix="sqft" type="number" placeholder="1200" />
          <Input prefix="@" placeholder="username" />
          <Input suffix="%" type="number" placeholder="20" />
        </div>
      </Section>

      {/* ─── States ─── */}
      <Section title="States">
        <div className="space-y-3 max-w-sm">
          <Input state="default" placeholder="Default state" />
          <Input
            state="error"
            placeholder="Error state"
            defaultValue="invalid"
          />
          <Input
            state="success"
            placeholder="Success state"
            defaultValue="valid"
          />
          <Input
            disabled
            placeholder="Disabled"
            defaultValue="Can't edit this"
          />
        </div>
      </Section>

      {/* ─── Wrapped in FormField ─── */}
      <Section title="With FormField (the proper way)">
        <div className="space-y-5 max-w-md">
          <FormField label="Email address" required>
            <Input type="email" placeholder="you@example.com" />
          </FormField>

          <FormField
            label="Password"
            required
            helperText="Must be at least 8 characters"
          >
            <Input type="password" placeholder="Enter password" />
          </FormField>

          <FormField label="Amount" required helperText="Outstanding: ₹6,320">
            <Input prefix="₹" type="number" placeholder="0" inputSize="lg" />
          </FormField>

          <FormField
            label="Phone number"
            helperText="We'll use this for OTP verification"
          >
            <Input type="tel" placeholder="+91 98765 43210" />
          </FormField>
        </div>
      </Section>

      {/* ─── With Errors (live validation) ─── */}
      <Section title="Live Validation">
        <div className="space-y-5 max-w-md">
          <FormField
            label="Email address"
            required
            errorText={emailError}
            helperText="We'll never share your email"
          >
            <Input
              type="email"
              placeholder="you@example.com"
              value={emailValue}
              onChange={(e) => setEmailValue(e.target.value)}
              leadingIcon={<Mail />}
            />
          </FormField>
          <p className="text-body-sm text-text-muted">
            Try typing something without @ to see error state
          </p>
        </div>
      </Section>

      {/* ─── Label Action ─── */}
      <Section title="With Label Action">
        <div className="max-w-md">
          <FormField
            label="Password"
            required
            labelAction={
              <a href="#" className="text-brand-primary hover:underline">
                Forgot?
              </a>
            }
          >
            <Input
              type="password"
              leadingIcon={<Lock />}
              placeholder="••••••••"
            />
          </FormField>
        </div>
      </Section>

      {/* ─── Hidden Label ─── */}
      <Section title="Hidden Label (visually) — still accessible">
        <div className="max-w-md">
          <FormField label="Search villas" hideLabel>
            <Input
              leadingIcon={<Search />}
              placeholder="Search by villa number, name..."
              inputSize="lg"
            />
          </FormField>
          <p className="text-body-sm text-text-muted mt-2">
            Screen readers still hear &quot;Search villas&quot;
          </p>
        </div>
      </Section>

      {/* ─── Different Types ─── */}
      <Section title="Input Types">
        <div className="space-y-3 max-w-sm">
          <Input type="text" placeholder="Text" />
          <Input type="email" leadingIcon={<AtSign />} placeholder="Email" />
          <Input type="tel" placeholder="+91 98765 43210" />
          <Input type="number" placeholder="123" />
          <Input type="date" />
          <Input type="time" />
          <Input type="url" placeholder="https://example.com" />
          <Input type="password" placeholder="Password" />
        </div>
      </Section>

      {/* ─── Real-World: Sign In Form ─── */}
      <Section title="Real-World: Sign In Form">
        <form
          className="max-w-md p-6 bg-bg-elevated border border-border-subtle rounded-lg space-y-5"
          onSubmit={(e) => e.preventDefault()}
        >
          <div>
            <h3 className="text-h3 text-text-primary">Sign in</h3>
            <p className="text-body-sm text-text-secondary mt-1">
              Welcome back to GDV Society Hub
            </p>
          </div>

          <FormField label="Email" required>
            <Input
              type="email"
              leadingIcon={<Mail />}
              placeholder="you@example.com"
            />
          </FormField>

          <FormField
            label="Password"
            required
            labelAction={
              <a href="#" className="text-brand-primary hover:underline">
                Forgot?
              </a>
            }
          >
            <Input
              type="password"
              leadingIcon={<Lock />}
              placeholder="••••••••"
            />
          </FormField>

          <Button variant="gradient" size="lg" shape="pill" fullWidth>
            Sign in
          </Button>

          <p className="text-body-sm text-center text-text-secondary">
            Don&apos;t have an account?{" "}
            <a href="#" className="text-brand-primary hover:underline">
              Sign up
            </a>
          </p>
        </form>
      </Section>

      {/* ─── Real-World: Record Payment Form ─── */}
      <Section title="Real-World: Record Payment">
        <form
          className="max-w-md p-6 bg-bg-elevated border border-border-subtle rounded-lg space-y-5"
          onSubmit={(e) => e.preventDefault()}
        >
          <h3 className="text-h3 text-text-primary">Record Payment</h3>

          <FormField label="Amount" required helperText="Outstanding: ₹6,320">
            <Input
              prefix="₹"
              type="number"
              placeholder="0"
              inputSize="lg"
              defaultValue="3600"
            />
          </FormField>

          <FormField
            label="Reference (optional)"
            helperText="UPI ref / cheque number"
          >
            <Input placeholder="UPI-XYZ-12345" />
          </FormField>

          <FormField label="Payment date" required>
            <Input type="date" trailingIcon={<Calendar />} />
          </FormField>

          <div className="flex gap-3">
            <Button variant="gradient" fullWidth>
              Record Payment
            </Button>
            <Button variant="ghost" fullWidth>
              Cancel
            </Button>
          </div>
        </form>
      </Section>
    </div>
  );
}

// ─── Section helper ───
function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <h2 className="text-h3 text-text-primary border-b border-border-subtle pb-2">
        {title}
      </h2>
      {children}
    </section>
  );
}
