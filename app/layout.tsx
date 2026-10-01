import type { Metadata } from "next";
import { Cormorant_Garamond, Lora } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  weight: ["400", "600"],
  subsets: ["latin", "cyrillic"],
});

const lora = Lora({
  variable: "--font-lora",
  weight: ["400", "600"],
  subsets: ["latin", "cyrillic"],
});

export const metadata: Metadata = {
  title: "Цифровая станция",
  description:
    "Диспетчерская система планирования работы железнодорожных станций",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ru"
      className={`${cormorant.variable} ${lora.variable} h-full antialiased`}
    >
      <body className="flex h-full flex-col font-body">{children}</body>
    </html>
  );
}
