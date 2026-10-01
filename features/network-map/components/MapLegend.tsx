import { HORIZON_MINUTES } from "../flows";
import {
  FLOW_LABEL,
  FLOW_ORDER,
  STATUS_DOT_CLASS,
  STATUS_LABEL,
  STATUS_ORDER,
} from "../status";

export function MapLegend() {
  return (
    <details className="group rounded-lg border border-line bg-surface-1/90 p-3 text-[11px] shadow-lg backdrop-blur">
      <summary className="cursor-pointer list-none font-semibold text-muted uppercase tracking-widest hover:text-white">
        Легенда <span className="group-open:hidden">+</span>
        <span className="hidden group-open:inline">−</span>
      </summary>
      <ul className="mt-2 space-y-1.5">
        {STATUS_ORDER.map((status) => (
          <li key={status} className="flex items-center gap-2 text-zinc-300">
            <span
              className={`size-2.5 rounded-full ${STATUS_DOT_CLASS[status]}`}
            />
            Станция · {STATUS_LABEL[status]}
          </li>
        ))}
        <li className="flex items-center gap-2 text-zinc-400">
          <span className="size-2 rounded-full bg-zinc-500 opacity-60" />
          Соседняя станция вне зоны
        </li>
        <li className="flex items-center gap-2 text-zinc-300">
          <span className="h-0.5 w-4 border-rose-500 border-t-2 border-dashed" />
          Участок с затруднением
        </li>
      </ul>
      <p className="mt-2 border-line border-t pt-2 text-muted">
        Поезда станции в пути или выйдут за {HORIZON_MINUTES / 60} ч, каждый — в
        одном счётчике:
      </p>
      <ul className="mt-1 space-y-0.5 text-muted">
        {FLOW_ORDER.map((key) => (
          <li key={key}>
            {FLOW_LABEL[key].icon} {FLOW_LABEL[key].label.toLowerCase()} —{" "}
            {FLOW_LABEL[key].hint}
          </li>
        ))}
      </ul>
      <p className="mt-2 text-muted">
        На участке: <span className="text-sky-300">➜&nbsp;3</span> — все поезда
        по стрелке, включая проездом
      </p>
    </details>
  );
}
