import Script from "next/script";
import type { Metadata } from "next";
import TMANav from "./_components/TMANav";

export const metadata: Metadata = {
  title: "GDV Admin",
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
      <div className="https://telegram.org/js/telegram-web-app.js text-text-primary pb-20">
        {children}
        <TMANav />
      </div>
    </>
  );
}
