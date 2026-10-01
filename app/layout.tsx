import type { Metadata } from "next";
import "./globals.css";

// Корень без шрифтов: у сайта они в app/(site), у устройств — свои в
// app/(device).
export const metadata: Metadata = {
  title: "Цифровая станция",
  description:
    "Диспетчерская система планирования работы железнодорожных станций",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ru" className="h-full antialiased">
      <body className="flex h-full flex-col">{children}</body>
    </html>
  );
}
