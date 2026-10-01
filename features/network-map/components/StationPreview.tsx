import { Button } from "@/components/ui/Button";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Card } from "@/components/ui/Card";
import { Heading } from "@/components/ui/Heading";
import { IndexValue } from "@/components/ui/IndexValue";
import { Kicker } from "@/components/ui/Kicker";
import { STATION_KIND_LABEL, STATUS_LABEL, toStatus } from "../status";
import type { StationTrain, ZoneStation } from "../types";
import { FlowCounters } from "./FlowCounters";
import { IncidentList } from "./IncidentList";
import { StationTrainList } from "./StationTrainList";

type Props = {
  station: ZoneStation;
  trains: StationTrain[];
  canOpenConsole: boolean;
  // null — карточку закрыть нельзя (своя станция ДСП).
  onClose: (() => void) | null;
};

export function StationPreview({
  station,
  trains,
  canOpenConsole,
  onClose,
}: Props) {
  const status = toStatus(station.efficiencyIndex);

  return (
    <Card
      emphasis="accent"
      elevation="md"
      className="flex max-h-full w-[380px] flex-col overflow-hidden"
    >
      <header className="space-y-3 border-line border-b p-4">
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1 space-y-0.5">
            <Kicker tone="accent">
              {STATION_KIND_LABEL[station.kind]} · ЕСР {station.code}
            </Kicker>
            <Heading level={2} className="truncate">
              {station.name}
            </Heading>
          </div>
          {onClose != null && (
            <Button
              size="sm"
              variant="secondary"
              onClick={onClose}
              aria-label="Закрыть карточку станции"
            >
              ✕
            </Button>
          )}
        </div>
        <IndexValue
          value={station.efficiencyIndex}
          tone={status}
          label={STATUS_LABEL[status]}
          caption="индекс эффективности"
        />
      </header>

      <div className="space-y-5 overflow-y-auto p-4">
        <FlowCounters flow={station.flow} size="lg" />
        <StationTrainList trains={trains} />
        <IncidentList incidents={station.incidents} />
      </div>

      <footer className="space-y-2 border-line border-t p-4">
        {canOpenConsole ? (
          <>
            <ButtonLink
              href={`/stations/${station.id}`}
              // Без предзагрузки: иначе каждый выбор станции дёргает сервер и Supabase.
              prefetch={false}
              variant="primary"
              className="w-full"
            >
              Открыть пульт станции
              <span aria-hidden>→</span>
            </ButtonLink>
            <ButtonLink
              href={`/dashboard/${station.id}`}
              prefetch={false}
              variant="secondary"
              className="w-full"
            >
              Открыть dashboard
              <span aria-hidden>→</span>
            </ButtonLink>
          </>
        ) : (
          <p className="text-center text-[12px] text-muted">
            Пульт этой станции вне вашей зоны ответственности
          </p>
        )}
      </footer>
    </Card>
  );
}
