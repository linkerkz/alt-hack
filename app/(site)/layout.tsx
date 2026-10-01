import { IBM_Plex_Sans } from "next/font/google";

// Один шрифт на всё приложение — IBM Plex Sans: технический гротеск с
// кириллицей, цифры читаются и в мелких подписях. Подключён здесь, а не в
// корне: экраны устройств его не предзагружают.
const plex = IBM_Plex_Sans({
  variable: "--font-plex",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600"],
});

export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <div className={`${plex.variable} flex min-h-0 flex-1 flex-col font-sans`}>
      {children}
    </div>
  );
}
