import { ButtonLink } from "@/components/ui/ButtonLink";
import { Kicker } from "@/components/ui/Kicker";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { STATUS_LABEL, toStatus } from "../status";

type Props = {
  stationId: string;
  stationName: string;
  stationCode: string;
  efficiencyIndex: number;
};

const REPORT_DATE_FORMAT = new Intl.DateTimeFormat("ru-RU", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "Asia/Almaty",
});

// Часы — только в шапке приложения (docs/ui.md), здесь — дата смены.
export function ReportHeader({
  stationId,
  stationName,
  stationCode,
  efficiencyIndex,
}: Props) {
  const status = toStatus(efficiencyIndex);

  return (
    <header className="flex flex-wrap items-end justify-between gap-6 border-line border-b pb-6">
      <div className="flex min-w-0 flex-col gap-2">
        <Kicker tone="accent">Оперативный отчёт · ЕСР {stationCode}</Kicker>
        <h1 className="font-heading font-semibold text-[40px] leading-none tracking-[-0.015em] sm:text-[52px]">
          {stationName}
        </h1>
        <p className="text-[13px] text-muted first-letter:uppercase">
          {REPORT_DATE_FORMAT.format(new Date())}
        </p>
      </div>

      <div className="flex flex-wrap items-end gap-6">
        <ButtonLink href={`/?station=${stationId}`} size="sm">
          ← К карте сети
        </ButtonLink>
        <div className="flex flex-col items-end gap-1.5 border-line border-l pl-6">
          <Kicker>Состояние станции</Kicker>
          <StatusBadge tone={status} label={STATUS_LABEL[status]} size="lg" />
        </div>
      </div>
    </header>
  );
}
