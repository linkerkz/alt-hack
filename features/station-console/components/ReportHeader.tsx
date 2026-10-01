import Link from "next/link";
import { LiveClock } from "@/components/ui/LiveClock";
import { STATUS_BADGE_CLASS, STATUS_LABEL, toStatus } from "@/lib/status";

type Props = {
  stationId: string;
  stationName: string;
  stationCode: string;
  efficiencyIndex: number;
};

const REPORT_DATE_FORMAT = new Intl.DateTimeFormat("ru-RU", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

export function ReportHeader({
  stationId,
  stationName,
  stationCode,
  efficiencyIndex,
}: Props) {
  const status = toStatus(efficiencyIndex);

  return (
    <header className="flex flex-wrap items-start justify-between gap-4 border-line border-b pb-4">
      <div>
        <p className="font-mono text-[11px] text-muted uppercase tracking-widest">
          Оперативный отчёт · ЕСР {stationCode}
        </p>
        <h1 className="mt-1 font-semibold text-2xl text-white">
          {stationName}
        </h1>
        <p className="mt-1 text-muted text-sm">
          {REPORT_DATE_FORMAT.format(new Date())}
        </p>
      </div>

      <div className="flex items-center gap-4">
        <span
          className={`inline-flex rounded border px-2.5 py-1 font-medium text-xs uppercase tracking-wider ${STATUS_BADGE_CLASS[status]}`}
        >
          {STATUS_LABEL[status]}
        </span>
        <LiveClock />
        <Link
          href={`/?station=${stationId}`}
          className="rounded border border-line px-3 py-1.5 text-sm text-zinc-300 hover:bg-surface-2 hover:text-white"
        >
          ← К карте сети
        </Link>
      </div>
    </header>
  );
}
