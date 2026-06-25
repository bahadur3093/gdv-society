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
  Tailwind,
  Preview,
} from "@react-email/components";

interface PaymentReminderEmailProps {
  residentName: string;
  villaNo: number | null;
  outstandingAmount: number;
  payUrl: string;
  unpaidBills?: Array<{ description: string; amount: number }>;
}

export default function PaymentReminderEmail({
  residentName,
  villaNo,
  outstandingAmount,
  payUrl,
  unpaidBills,
}: PaymentReminderEmailProps) {
  const previewText = `Friendly reminder: ₹${outstandingAmount.toLocaleString("en-IN")} outstanding`;

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
            {/* Brand header */}
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
            </Section>

            {/* Main card */}
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
                    backgroundColor: "rgba(251, 191, 36, 0.15)",
                    border: "1px solid rgba(251, 191, 36, 0.3)",
                    textAlign: "center",
                    lineHeight: "56px",
                    fontSize: "24px",
                  }}
                >
                  🔔
                </div>
              </Section>

              <Heading
                as="h2"
                style={{
                  fontSize: "22px",
                  fontWeight: 700,
                  color: "#F5F5F7",
                  textAlign: "center",
                  margin: "0 0 8px 0",
                }}
              >
                Friendly payment reminder
              </Heading>

              <Text
                style={{
                  fontSize: "14px",
                  color: "#A1A1AA",
                  textAlign: "center",
                  margin: "0 0 32px 0",
                  lineHeight: 1.5,
                }}
              >
                Hi {residentName}, this is a gentle reminder that you have an
                outstanding maintenance balance.
              </Text>

              {/* Amount card */}
              <Section
                style={{
                  backgroundColor: "#1C1C26",
                  borderRadius: "12px",
                  padding: "24px",
                  marginBottom: "24px",
                  textAlign: "center",
                }}
              >
                <Text
                  style={{
                    fontSize: "11px",
                    color: "#71717A",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    margin: "0 0 4px 0",
                    fontWeight: 600,
                  }}
                >
                  {villaNo !== null ? `Villa ${villaNo}` : "Outstanding"}
                </Text>
                <Text
                  style={{
                    fontSize: "32px",
                    fontWeight: 800,
                    color: "#F87171",
                    fontFamily: "monospace",
                    margin: 0,
                    letterSpacing: "-0.02em",
                  }}
                >
                  ₹{outstandingAmount.toLocaleString("en-IN")}
                </Text>
              </Section>

              {/* CTA */}
              <Section style={{ textAlign: "center", marginBottom: "24px" }}>
                <Button
                  href={payUrl}
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
                  Pay now →
                </Button>
              </Section>

              <Text
                style={{
                  fontSize: "13px",
                  color: "#71717A",
                  textAlign: "center",
                  margin: 0,
                  lineHeight: 1.5,
                }}
              >
                If you&apos;ve already paid, please ignore this message — your
                payment may still be processing.
              </Text>
            </Section>

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
              GDV Society Hub · Maintenance Reminder
              <br />
              Questions? Reply to this email or contact your society admin.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
