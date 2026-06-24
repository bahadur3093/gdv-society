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
  Tailwind,
  Preview,
  Row,
  Column,
} from "@react-email/components";

interface NewSignupNotificationEmailProps {
  userName: string;
  userEmail: string;
  plotNumber: string | null;
  approveUrl: string;
  adminName?: string;
}

export default function NewSignupNotificationEmail({
  userName,
  userEmail,
  plotNumber,
  approveUrl,
  adminName,
}: NewSignupNotificationEmailProps) {
  const previewText = `New signup: ${userName} is waiting for approval`;

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
            <Section style={{ textAlign: "center", marginBottom: "32px" }}>
              <Heading
                as="h1"
                style={{
                  background:
                    "linear-gradient(135deg, #4F8AFF 0%, #8B5CF6 50%, #EC4899 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  fontSize: "28px",
                  fontWeight: 800,
                  letterSpacing: "-0.02em",
                  margin: 0,
                  padding: 0,
                }}
              >
                GDV Society Hub
              </Heading>
              <Text
                style={{
                  color: "#71717A",
                  fontSize: "12px",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  margin: "4px 0 0 0",
                }}
              >
                Admin Notification
              </Text>
            </Section>

            {/* ─── Main Card ─── */}
            <Section
              style={{
                backgroundColor: "#14141A",
                borderRadius: "16px",
                border: "1px solid rgba(255, 255, 255, 0.06)",
                padding: "32px",
              }}
            >
              {/* Icon */}
              <Section style={{ textAlign: "center", marginBottom: "20px" }}>
                <div
                  style={{
                    display: "inline-block",
                    width: "56px",
                    height: "56px",
                    borderRadius: "50%",
                    backgroundColor: "rgba(52, 211, 153, 0.15)",
                    border: "1px solid rgba(52, 211, 153, 0.3)",
                    textAlign: "center",
                    lineHeight: "56px",
                    fontSize: "24px",
                  }}
                >
                  ✨
                </div>
              </Section>

              {/* Headline */}
              <Heading
                as="h2"
                style={{
                  fontSize: "22px",
                  fontWeight: 700,
                  color: "#F5F5F7",
                  textAlign: "center",
                  margin: "0 0 8px 0",
                  letterSpacing: "-0.01em",
                }}
              >
                New signup awaiting approval
              </Heading>

              {/* Greeting */}
              <Text
                style={{
                  fontSize: "14px",
                  color: "#A1A1AA",
                  textAlign: "center",
                  margin: "0 0 32px 0",
                  lineHeight: 1.5,
                }}
              >
                {adminName ? `Hi ${adminName}, a` : "A"} new resident has
                registered. Review their details and approve their account.
              </Text>

              {/* User Details Card */}
              <Section
                style={{
                  backgroundColor: "#1C1C26",
                  borderRadius: "12px",
                  padding: "20px",
                  marginBottom: "24px",
                }}
              >
                {/* Name row */}
                <Row style={{ marginBottom: "12px" }}>
                  <Column style={{ verticalAlign: "top" }}>
                    <Text
                      style={{
                        fontSize: "11px",
                        color: "#71717A",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        margin: "0 0 2px 0",
                        fontWeight: 600,
                      }}
                    >
                      Name
                    </Text>
                    <Text
                      style={{
                        fontSize: "16px",
                        color: "#F5F5F7",
                        fontWeight: 600,
                        margin: 0,
                      }}
                    >
                      {userName}
                    </Text>
                  </Column>
                </Row>

                {/* Divider */}
                <div
                  style={{
                    borderTop: "1px solid rgba(255, 255, 255, 0.06)",
                    margin: "12px 0",
                  }}
                />

                {/* Email row */}
                <Row style={{ marginBottom: "12px" }}>
                  <Column style={{ verticalAlign: "top" }}>
                    <Text
                      style={{
                        fontSize: "11px",
                        color: "#71717A",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        margin: "0 0 2px 0",
                        fontWeight: 600,
                      }}
                    >
                      Email
                    </Text>
                    <Text
                      style={{
                        fontSize: "14px",
                        color: "#F5F5F7",
                        margin: 0,
                      }}
                    >
                      {userEmail}
                    </Text>
                  </Column>
                </Row>

                {/* Plot row */}
                {plotNumber && (
                  <>
                    <div
                      style={{
                        borderTop: "1px solid rgba(255, 255, 255, 0.06)",
                        margin: "12px 0",
                      }}
                    />
                    <Row>
                      <Column style={{ verticalAlign: "top" }}>
                        <Text
                          style={{
                            fontSize: "11px",
                            color: "#71717A",
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                            margin: "0 0 2px 0",
                            fontWeight: 600,
                          }}
                        >
                          Plot Number
                        </Text>
                        <Text
                          style={{
                            fontSize: "14px",
                            color: "#F5F5F7",
                            fontFamily: "monospace",
                            margin: 0,
                          }}
                        >
                          {plotNumber}
                        </Text>
                      </Column>
                    </Row>
                  </>
                )}
              </Section>

              {/* CTA Button */}

              <Section style={{ textAlign: "center", marginBottom: "20px" }}>
                <Button
                  href={approveUrl}
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
                  Review & approve →
                </Button>
              </Section>

              {/* Alternative link */}
              <Text
                style={{
                  fontSize: "12px",
                  color: "#71717A",
                  textAlign: "center",
                  margin: "0 0 4px 0",
                }}
              >
                Or copy and paste:
              </Text>

              <Link
                href={approveUrl}
                style={{
                  fontSize: "11px",
                  color: "#8B5CF6",
                  wordBreak: "break-all",
                  textAlign: "center",
                  display: "block",
                  textDecoration: "underline",
                }}
              >
                {approveUrl}
              </Link>
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
                fontSize: "11px",
                color: "#71717A",
                textAlign: "center",
                margin: 0,
                lineHeight: 1.6,
              }}
            >
              GDV Society Hub · Admin Notification
              <br />
              You're receiving this because you're listed as an administrator.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
