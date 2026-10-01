import { JetBrains_Mono } from "next/font/google";

// Экраны полевых устройств выглядят как прошивка: тёмный экран и
// моноширинный шрифт. С остальным приложением их ничего не связывает.
const mono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "700"],
});

export default function DeviceLayout({ children }: LayoutProps<"/">) {
  return (
    <div
      className={`${mono.variable} fixed inset-0 overflow-y-auto bg-device font-mono text-device-ink text-[14px] leading-snug`}
    >
      {children}
    </div>
  );
}
