import { buttonClass } from "@/components/ui/Button";

// Скачивание отчёта файлом. Обычная ссылка, а не next/link: это файл,
// а не страница приложения.
export function ReportPdfLink({ href }: { href: string }) {
  return (
    <a
      href={href}
      download
      className={`${buttonClass("secondary", "sm")} shrink-0`}
    >
      Скачать PDF
    </a>
  );
}
