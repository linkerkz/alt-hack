import { Kicker } from "@/components/ui/Kicker";
import { QrCode } from "@/components/ui/QrCode";
import { SERVICE_LABEL } from "../status";
import type { WorkOrder } from "../types";

type Props = {
  order: WorkOrder;
  stationName: string;
  // Адрес чеклиста, который откроет QR.
  checklistUrl: string;
};

// Печатный наряд A4: что сделать — списком, где отметить — по QR.
export function WorkOrderSheet({ order, stationName, checklistUrl }: Props) {
  return (
    <article className="mx-auto w-full max-w-[190mm] space-y-6 bg-paper p-8 text-ink print:p-0">
      <header className="flex items-start justify-between gap-6 border-line border-b pb-5">
        <div className="space-y-2">
          <Kicker tone="accent">
            Наряд № {shortNumber(order.id)} · {SERVICE_LABEL[order.service]}
          </Kicker>
          <h1 className="font-heading font-semibold text-[30px] leading-tight">
            {order.title}
          </h1>
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 text-[14px]">
            <dt className="text-muted">Станция</dt>
            <dd>{stationName}</dd>
            <dt className="text-muted">Объект</dt>
            <dd>{order.objectId}</dd>
            <dt className="text-muted">Выдан</dt>
            <dd>{formatIssued(order.createdAt)}</dd>
          </dl>
        </div>
        <figure className="flex w-[42mm] shrink-0 flex-col items-center gap-1.5 text-center">
          <QrCode url={checklistUrl} className="size-[38mm]" />
          <figcaption className="text-[11px] leading-snug text-muted">
            Отсканируйте и отмечайте пункты на телефоне
          </figcaption>
        </figure>
      </header>

      <section className="space-y-1.5">
        <Kicker>Что случилось</Kicker>
        <p className="text-[14px]">{order.description}</p>
      </section>

      {order.window != null && (
        <section className="space-y-1.5">
          <Kicker>Окно работ</Kicker>
          <p className="text-[14px]">{order.window}</p>
        </section>
      )}

      {order.safety.length > 0 && (
        <section className="space-y-1.5">
          <Kicker>Меры безопасности</Kicker>
          <ul className="list-disc space-y-1 pl-5 text-[14px]">
            {order.safety.map((rule) => (
              <li key={rule}>{rule}</li>
            ))}
          </ul>
        </section>
      )}

      <section className="space-y-2">
        <Kicker>Что сделать</Kicker>
        <ol className="divide-y divide-line border-line border-y">
          {order.items.map((item, index) => (
            <li key={item.id} className="flex items-start gap-3 py-2.5">
              <span
                aria-hidden
                className="mt-1 size-4 shrink-0 border border-ink"
              />
              <span className="w-5 shrink-0 text-muted">{index + 1}.</span>
              <span>{item.text}</span>
            </li>
          ))}
        </ol>
      </section>

      <footer className="grid grid-cols-2 gap-8 pt-6 text-[13px] text-muted">
        <Signature label="Выдал (ДСП)" />
        <Signature label="Принял (исполнитель)" />
      </footer>
      <p className="break-all text-[11px] text-muted">{checklistUrl}</p>
    </article>
  );
}

function Signature({ label }: { label: string }) {
  return (
    <div className="space-y-1">
      <div className="h-8 border-ink border-b" />
      <p>{label} · подпись, время</p>
    </div>
  );
}

// Номер для бумаги: первые символы uuid, полный id — в QR.
function shortNumber(id: string) {
  return id.slice(0, 8).toUpperCase();
}

function formatIssued(iso: string) {
  return new Date(iso).toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Almaty",
  });
}
