import { ButtonLink } from "@/components/ui/ButtonLink";
import { Card } from "@/components/ui/Card";
import { Kicker } from "@/components/ui/Kicker";
import { INCIDENT } from "../mock";
import type { StationConsoleData } from "../queries";
import { consoleHref } from "../state";
import type { ConsoleState } from "../types";
import { EventFeed } from "./EventFeed";

type Props = {
  incident: StationConsoleData["incident"];
  state: ConsoleState;
};

// Обзор станции: активные инциденты и лента событий.
export function OverviewPanel({ incident, state }: Props) {
  return (
    <>
      <section className="flex flex-col gap-2.5">
        <Kicker>Активные инциденты</Kicker>
        {incident.isActive ? (
          <Card emphasis="critical" className="flex flex-col gap-1.5 p-3.5">
            <div className="flex justify-between gap-2.5 text-[11px]">
              <span className="text-critical uppercase tracking-[0.08em]">
                ■ Высокая · {incident.code}
              </span>
              <span className="text-muted">{incident.statusName}</span>
            </div>
            <p className="font-heading font-semibold text-[17px] leading-tight">
              {INCIDENT.title}
            </p>
            <p className="text-[13px] text-neutral-800">
              {incident.suggestion}
            </p>
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
      <EventFeed events={incident.feed} />
    </>
  );
}
