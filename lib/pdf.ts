import path from "node:path";
import { Font, renderToBuffer } from "@react-pdf/renderer";

// PDF собираем на сервере через @react-pdf/renderer. Встроенные шрифты PDF
// без кириллицы, поэтому подключаем IBM Plex Sans — шрифт темы — из файлов
// в lib/fonts (OFL). Файлы попадают в сборку через outputFileTracingIncludes.
export const PDF_FONT = "IBM Plex Sans";

const FONTS_DIR = path.join(process.cwd(), "lib/fonts");

Font.register({
  family: PDF_FONT,
  fonts: [
    { src: fontPath("IBMPlexSans-Regular.woff") },
    { src: fontPath("IBMPlexSans-SemiBold.woff"), fontWeight: 600 },
    { src: fontPath("IBMPlexSans-Italic.woff"), fontStyle: "italic" },
  ],
});

// Переносы по слогам у react-pdf — только английские: русские слова не рвём.
Font.registerHyphenationCallback((word) => [word]);

export function renderPdf(document: Parameters<typeof renderToBuffer>[0]) {
  return renderToBuffer(document);
}

function fontPath(file: string) {
  return path.join(FONTS_DIR, file);
}
