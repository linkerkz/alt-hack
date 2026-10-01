import { Cormorant_Garamond, Lora } from "next/font/google";

// Заголовки и крупные числа — Cormorant Garamond, текст — Lora. Шрифты
// подключены здесь, а не в корне: экраны устройств их не предзагружают.
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

export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <div
      className={`${cormorant.variable} ${lora.variable} flex min-h-0 flex-1 flex-col font-sans`}
    >
      {children}
    </div>
  );
}
