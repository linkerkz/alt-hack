import { qrPath } from "@/lib/qr";

type Props = {
  url: string;
  className?: string;
};

// QR-код ссылки: чёрные модули на бумаге, размер задаёт className.
export function QrCode({ url, className = "" }: Props) {
  const { size, path } = qrPath(url);
  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      shapeRendering="crispEdges"
      role="img"
      aria-label={`QR-код: ${url}`}
      className={className}
    >
      <path d={path} fill="#000" />
    </svg>
  );
}
