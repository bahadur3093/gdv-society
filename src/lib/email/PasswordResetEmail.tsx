import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Heading,
  Text,
  Button,
  Hr,
  Link,
  Img,
  Tailwind,
  Preview,
} from "@react-email/components";

interface PasswordResetEmailProps {
  /** Recipient's display name */
  userName: string;
  /** Full reset URL with token */
  resetUrl: string;
  /** Hours until token expires (default 24) */
  expiresInHours?: number;
}

export default function PasswordResetEmail({
  userName,
  resetUrl,
  expiresInHours = 24,
}: PasswordResetEmailProps) {
  const previewText = `Reset your GDV Society Hub password`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body
          style={{
            backgroundColor: "#0A0A0C",
            color: "#F5F5F7",
            fontFamily:
              '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            margin: 0,
            padding: 0,
          }}
        >
          <Container
            style={{
              maxWidth: "560px",
              margin: "0 auto",
              padding: "40px 20px",
            }}
          >
            {/* ─── Brand Header ─── */}
            <Section style={{ textAlign: "center", marginBottom: "40px" }}>
              <Heading
                as="h1"
                style={{
                  background:
                    "linear-gradient(135deg, #4F8AFF 0%, #8B5CF6 50%, #EC4899 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  fontSize: "32px",
                  fontWeight: 800,
                  letterSpacing: "-0.02em",
                  margin: 0,
                  padding: 0,
                }}
              >
                GDV Society Hub
              </Heading>
            </Section>

            {/* ─── Main Card ─── */}
            <Section
              style={{
                backgroundColor: "#14141A",
                borderRadius: "16px",
                border: "1px solid rgba(255, 255, 255, 0.06)",
                padding: "40px 32px",
              }}
            >
              {/* Lock icon (text-based for email compat) */}
              <Section style={{ textAlign: "center", marginBottom: "24px" }}>
                <div
                  style={{
                    display: "inline-block",
                    width: "64px",
                    height: "64px",
                    borderRadius: "50%",
                    backgroundColor: "rgba(139, 92, 246, 0.15)",
                    border: "1px solid rgba(139, 92, 246, 0.3)",
                    textAlign: "center",
                    lineHeight: "64px",
                    fontSize: "28px",
                  }}
                >
                  🔐
                </div>
              </Section>

              {/* Headline */}
              <Heading
                as="h2"
                style={{
                  fontSize: "24px",
                  fontWeight: 700,
                  color: "#F5F5F7",
                  textAlign: "center",
                  margin: "0 0 12px 0",
                  letterSpacing: "-0.01em",
                }}
              >
                Reset your password
              </Heading>

              {/* Greeting */}
              <Text
                style={{
                  fontSize: "15px",
                  color: "#A1A1AA",
                  textAlign: "center",
                  margin: "0 0 32px 0",
                  lineHeight: 1.6,
                }}
              >
                Hi {userName}, we received a request to reset your password.
                Click the button below to choose a new one.
              </Text>

              {/* CTA Button */}
              <Section style={{ textAlign: "center", marginBottom: "32px" }}>
                <Button
                  href={resetUrl}
                  style={{
                    background:
                      "linear-gradient(135deg, #4F8AFF 0%, #8B5CF6 50%, #EC4899 100%)",
                    color: "#FFFFFF",
                    padding: "14px 32px",
                    borderRadius: "999px",
                    fontSize: "15px",
                    fontWeight: 600,
                    textDecoration: "none",
                    display: "inline-block",
                  }}
                >
                  Reset password
                </Button>
              </Section>

              {/* Expiry notice */}
              <Section
                style={{
                  backgroundColor: "#1C1C26",
                  borderRadius: "8px",
                  padding: "16px",
                  marginBottom: "24px",
                }}
              >
                <Text
                  style={{
                    fontSize: "13px",
                    color: "#A1A1AA",
                    margin: 0,
                    lineHeight: 1.5,
                  }}
                >
                  ⏱️ This link will expire in{" "}
                  <strong style={{ color: "#F5F5F7" }}>
                    {expiresInHours} hours
                  </strong>{" "}
                  for your security.
                </Text>
              </Section>

              {/* Alternative link */}
              <Text
                style={{
                  fontSize: "13px",
                  color: "#71717A",
                  margin: "0 0 8px 0",
                }}
              >
                Or copy and paste this link in your browser:
              </Text>
              <Link
                href={resetUrl}
                style={{
                  fontSize: "13px",
                  color: "#8B5CF6",
                  wordBreak: "break-all",
                  textDecoration: "underline",
                }}
              >
                {resetUrl}
              </Link>
            </Section>

            {/* ─── Security Notice ─── */}
            <Section
              style={{
                marginTop: "32px",
                padding: "20px",
                backgroundColor: "#14141A",
                border: "1px solid rgba(255, 255, 255, 0.06)",
                borderRadius: "12px",
              }}
            >
              <Text
                style={{
                  fontSize: "13px",
                  color: "#A1A1AA",
                  lineHeight: 1.6,
                  margin: 0,
                }}
              >
                <strong style={{ color: "#F5F5F7" }}>
                  Didn't request this?
                </strong>{" "}
                You can safely ignore this email — your password won't change
                unless you click the link above. If you're concerned, contact
                the society admin.
              </Text>
            </Section>

            {/* ─── Footer ─── */}
            <Hr
              style={{
                borderColor: "rgba(255, 255, 255, 0.06)",
                margin: "32px 0 24px 0",
              }}
            />
            <Text
              style={{
                fontSize: "12px",
                color: "#71717A",
                textAlign: "center",
                margin: 0,
                lineHeight: 1.6,
              }}
            >
              GDV Society Hub · Society maintenance made simple
              <br />
              This is an automated message — please don't reply.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
