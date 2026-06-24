import "server-only";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "./resend";
import NewSignupNotificationEmail from "@/emails/NewSignupNotificationEmail";

interface NotifyAdminOfSignupOptions {
  newUserName: string;
  newUserEmail: string;
  newUserPlotNumber: string | null;
  newUserId: string;
}

export async function notifyAdminOfSignup(
  options: NotifyAdminOfSignupOptions,
): Promise<void> {
  try {
    // ─── Resolve admin email + name ───
    const envAdminEmail = process.env.NOTIFICATION_ADMIN_EMAIL?.trim();
    let adminEmail: string | null = null;
    let adminName: string | undefined = undefined;

    if (envAdminEmail) {
      adminEmail = envAdminEmail;

      // Try to find their name in DB for personalization
      const adminUser = await prisma.user.findUnique({
        where: { email: envAdminEmail.toLowerCase() },
        select: { name: true },
      });
      adminName = adminUser?.name;
    } else {
      // Fallback: find first APPROVED admin
      const firstAdmin = await prisma.user.findFirst({
        where: {
          role: "ADMIN",
          accountStatus: "APPROVED",
        },
        select: { email: true, name: true },
        orderBy: { createdAt: "asc" },
      });

      if (firstAdmin) {
        adminEmail = firstAdmin.email;
        adminName = firstAdmin.name;
      }
    }

    if (!adminEmail) {
      console.warn(
        "[notify-admins] No admin email configured. Skipping notification.",
      );
      return;
    }

    // ─── Build deep link to user's profile ───
    const baseUrl = (
      process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
    ).replace(/\/$/, "");
    const approveUrl = `${baseUrl}/admin/residents/${options.newUserId}`;

    // ─── Send the email ───
    const result = await sendEmail({
      to: adminEmail,
      subject: `🆕 New signup: ${options.newUserName} awaiting approval`,
      react: NewSignupNotificationEmail({
        userName: options.newUserName,
        userEmail: options.newUserEmail,
        plotNumber: options.newUserPlotNumber,
        approveUrl,
        adminName,
      }),
    });

    if (!result.success) {
      console.error("[notify-admins] Email send failed:", result.error);
      // Don't throw — signup should still succeed
    } else {
      console.log(
        JSON.stringify({
          timestamp: new Date().toISOString(),
          event: "admin_signup_notification_sent",
          to: adminEmail,
          newUserId: options.newUserId,
          newUserEmail: options.newUserEmail,
          messageId: result.id,
        }),
      );
    }
  } catch (error) {
    // Catch-all: notification failure must NOT affect signup
    console.error("[notify-admins] Unexpected error:", error);
  }
}
