import { STATUS_DOT_CLASS, STATUS_LABEL, STATUS_ORDER } from "../status";

export function MapLegend() {
  return (
    <div className="space-y-2 rounded-lg border border-line bg-surface-1/90 p-3 text-[11px] shadow-lg backdrop-blur">
      <p className="font-semibold text-muted uppercase tracking-widest">
        Легенда
      </p>
      <ul className="space-y-1.5">
        {STATUS_ORDER.map((status) => (
          <li key={status} className="flex items-center gap-2 text-zinc-300">
            <span
              className={`size-2.5 rounded-full ${STATUS_DOT_CLASS[status]}`}
            />
            Станция · {STATUS_LABEL[status]}
          </li>
        ))}
        <li className="flex items-center gap-2 text-zinc-300">
          <span className="h-0.5 w-4 bg-slate-500" />
          Участок
        </li>
        <li className="flex items-center gap-2 text-zinc-300">
          <span className="h-0.5 w-4 border-rose-500 border-t-2 border-dashed" />
          Участок с затруднением
        </li>
      </ul>
      <p className="text-muted">Крупная точка — сортировочная станция</p>
    </div>
  );
}
