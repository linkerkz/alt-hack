import { ButtonLink } from "@/components/ui/ButtonLink";
import { Card } from "@/components/ui/Card";
import { Kicker } from "@/components/ui/Kicker";
import { TONE_GLYPH, TONE_TEXT_CLASS } from "@/components/ui/tone";
import type { StationConsoleData } from "../queries";
import { consoleHref } from "../state";
import type { ConsoleState, ConsoleViewer } from "../types";
import { DspObjects } from "./DspObjects";
import { EventFeed } from "./EventFeed";
import { OperationsCard } from "./OperationsCard";
import { PagerCard } from "./PagerCard";

type Props = {
  data: StationConsoleData;
  state: ConsoleState;
  viewer: ConsoleViewer;
};

// Вкладка «Станция»: активный инцидент коротко, ближайшие операции по плану
// с поручениями бригаде, объекты, пейджер и лента событий.
export function OverviewPanel({ data, state, viewer }: Props) {
  const { incident } = data;
  const { turn } = incident;

  return (
    <>
      <section className="flex flex-col gap-2.5">
        <Kicker>Активные инциденты</Kicker>
        {incident.isActive ? (
          <Card
            emphasis={incident.tone === "critical" ? "critical" : "accent"}
            className="flex flex-col gap-1.5 p-3.5"
          >
            <div className="flex justify-between gap-2.5 text-[11px] uppercase tracking-[0.08em]">
              <span className={TONE_TEXT_CLASS[incident.tone]}>
                {TONE_GLYPH[incident.tone]} {incident.code}
              </span>
              <span className="text-muted">{incident.progress.current}</span>
            </div>
            <p className="font-heading font-semibold text-[17px] leading-tight">
              {incident.fault.title}
            </p>
            {turn != null && (
              <p
                className={`text-[13px] ${turn.owner === viewer ? "text-accent-700" : "text-neutral-800"}`}
              >
                {turn.owner === viewer
                  ? `▲ Ваш ход: ${turn.title}`
                  : turn.waiting}
              </p>
            )}
            <ButtonLink
              href={consoleHref(state, { tab: "incident", focus: true })}
              scroll={false}
              variant="primary"
              className="mt-1 self-start"
            >
              Открыть инцидент
            </ButtonLink>
          </Card>
        ) : (
          <p className="border-line border-y py-3 text-[14px] text-muted">
            Активных инцидентов нет. Станция работает по плану.
          </p>
        )}
      </section>
      <OperationsCard
        stationId={data.stationId}
        operations={data.pager.operations}
        canAssign={viewer === "dsp"}
      />
      <DspObjects objects={data.objects} />
      <PagerCard
        stationId={data.stationId}
        pager={data.pager}
        canSend={viewer === "dsp"}
      />
      <EventFeed events={incident.feed} />
    </>
  );
}
