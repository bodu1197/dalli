import type { Metadata } from "next";
import { type PropsWithChildren } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "달리고 - 빠르게 달리고, 맛있게 도착하고",
  description: "대한민국 최고의 배달 슈퍼앱 달리고. 업계 최저 수수료로 점주님 부담 최소화!",
};

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="ko">
      <body className="font-['Pretendard',-apple-system,BlinkMacSystemFont,system-ui,sans-serif] antialiased">
        {children}
      </body>
    </html>
  );
}
