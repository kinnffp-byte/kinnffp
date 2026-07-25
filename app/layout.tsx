import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "김쁘피 여름 보상 아카이브",
  description: "김쁘피의 누적공약, 방셀룰렛, 한정 굿즈와 여름 의상을 한눈에 확인하세요.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>
        {children}
        <Script src="/fx.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
