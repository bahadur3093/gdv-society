import Script from "next/script";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "GDV Admin Dashboard",
  // No-index — this is a closed app
  robots: { index: false, follow: false },
};

export default function TelegramAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Script
        src="https://telegram.org/js/telegram-web-app.js"
        strategy="beforeInteractive"
      />
      <div className="min-h-screen bg-bg-base text-text-primary">
        {children}
      </div>
    </>
  );
}
