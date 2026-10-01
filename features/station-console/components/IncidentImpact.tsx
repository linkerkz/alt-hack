import { Kicker } from "@/components/ui/Kicker";

// Влияние инцидента на работу станции: поезда, маршруты, ресурсы, индекс.
export function IncidentImpact() {
  return (
    <section className="flex flex-col gap-2">
      <Kicker>Влияние</Kicker>
      <dl className="grid grid-cols-[110px_1fr] gap-x-3 gap-y-1.5 text-[13px]">
        <dt className="text-muted">Поезда</dt>
        <dd className="flex flex-col gap-0.5">
          <span>
            <b className="font-semibold">101</b> пасс. · путь 3, прибытие 14:12
            → стоит у входного Н
          </span>
          <span>
            <b className="font-semibold">2001</b> груз. · путь 5, прибытие 14:18
          </span>
        </dd>
        <dt className="text-muted">Маршруты</dt>
        <dd>Н → путь 3, Н → путь 5 недоступны</dd>
        <dt className="text-muted">Ресурсы</dt>
        <dd>Бригада поезда 2001 в ожидании</dd>
        <dt className="text-muted">Индекс</dt>
        <dd className="text-critical">
          78 → 48 «Критично» к 14:30, если ничего не менять
        </dd>
      </dl>
    </section>
  );
}
