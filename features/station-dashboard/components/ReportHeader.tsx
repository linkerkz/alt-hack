import { ButtonLink } from "@/components/ui/ButtonLink";
import { Heading } from "@/components/ui/Heading";
import { Kicker } from "@/components/ui/Kicker";
import { LiveClock } from "@/components/ui/LiveClock";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { STATUS_LABEL, toStatus } from "../status";

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
    <header className="flex flex-wrap items-end justify-between gap-4 border-line border-b pb-5">
      <div className="space-y-1">
        <Kicker tone="accent">Оперативный отчёт · ЕСР {stationCode}</Kicker>
        <div className="flex flex-wrap items-center gap-3">
          <Heading level={1}>{stationName}</Heading>
          <StatusBadge tone={status} label={STATUS_LABEL[status]} />
        </div>
        <p className="text-[13px] text-muted">
          {REPORT_DATE_FORMAT.format(new Date())}
        </p>
      </div>

      <div className="flex items-center gap-4">
        <LiveClock />
        <ButtonLink href={`/?station=${stationId}`} size="sm">
          ← К карте сети
        </ButtonLink>
      </div>
    </header>
  );
}
