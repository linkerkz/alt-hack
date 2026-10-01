import Link from "next/link";

type Props = {
  stationName: string;
  // Время сценария: часы симуляции, а не реальные.
  clock: string;
  mapHref: string | null;
  // Камеры и пейджеры станции с QR — открыть их на телефонах.
  devicesHref: string;
};

// Строка над пультом: где мы (участок › станция) и время симуляции.
export function ConsoleBar({
  stationName,
  clock,
  mapHref,
  devicesHref,
}: Props) {
  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-1 border-line border-b px-5 py-2">
      <span className="flex gap-1 text-[12px] text-muted">
        {mapHref != null && (
          <Link
            href={mapHref}
            className="text-accent-700 underline underline-offset-2 hover:text-accent-600"
          >
            Участок
          </Link>
        )}
        <span>
          {mapHref != null && "› "}ст. {stationName} · 6 путей
        </span>
      </span>
      <Link
        href={devicesHref}
        className="text-[12px] text-accent-700 underline underline-offset-2 hover:text-accent-600"
      >
        Полевые устройства
      </Link>
      <span className="ml-auto flex items-baseline gap-2">
        <span className="font-heading text-[24px] leading-none">{clock}</span>
        <span className="text-[11px] text-muted">
          симуляция · 1 час ≈ 5 мин
        </span>
      </span>
    </div>
  );
}
