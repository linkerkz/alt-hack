import type { Metadata } from "next";
import { Cormorant_Garamond, Lora } from "next/font/google";
import "./globals.css";

// Заголовки и крупные числа — Cormorant Garamond, текст — Lora.
const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "600"],
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "600"],
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
      <body className="flex h-full flex-col font-sans">{children}</body>
    </html>
  );
}
