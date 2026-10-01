import { ButtonLink } from "@/components/ui/ButtonLink";
import { Card } from "@/components/ui/Card";
import { Kicker } from "@/components/ui/Kicker";
import { StatusGlyph } from "@/components/ui/StatusGlyph";

type Props = { incidents: ShiftIncident[] };

// Адрес отчёта собирает страница: отчёт — другая фича.
type ShiftIncident = {
  code: string;
  title: string;
  startedAt: string;
  reportHref: string;
};

// Открытые инциденты станции со ссылкой на черновик отчёта по каждому.
export function IncidentsCard({ incidents }: Props) {
  if (incidents.length === 0) {
    return (
      <Card className="space-y-2 p-5">
        <Kicker>Инциденты</Kicker>
        <p className="text-[13px] text-muted">Открытых инцидентов нет</p>
      </Card>
    );
  }

  return (
    <Card className="space-y-3 p-5">
      <Kicker>Инциденты · {incidents.length}</Kicker>
      <ul>
        {incidents.map((incident) => (
          <li
            key={incident.code}
            className="flex flex-wrap items-center justify-between gap-3 border-line border-t py-2 first:border-t-0 first:pt-0"
          >
            <span className="text-[13px]">
              <StatusGlyph tone="critical" /> {incident.code} · {incident.title}
              <span className="ml-2 text-[11px] text-muted">
                с {incident.startedAt}
              </span>
            </span>
            <ButtonLink href={incident.reportHref} size="sm">
              Отчёт по инциденту →
            </ButtonLink>
          </li>
        ))}
      </ul>
    </Card>
  );
}
