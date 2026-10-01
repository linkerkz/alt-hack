import type { AttentionItem, AttentionSeverity } from "../types";

const SEVERITY_ICON: Record<AttentionSeverity, string> = {
  critical: "⚠",
  warning: "⚠",
  pending: "○",
};

const SEVERITY_CLASS: Record<AttentionSeverity, string> = {
  critical: "border-rose-500 bg-rose-500/10 text-rose-300",
  warning: "border-amber-400 bg-amber-400/10 text-amber-300",
  pending: "border-line bg-surface-0/60 text-zinc-300",
};

export function AttentionList({ items }: { items: AttentionItem[] }) {
  if (items.length === 0) {
    return (
      <section className="rounded-lg border border-line bg-surface-1 p-5">
        <p className="text-[11px] text-muted uppercase tracking-widest">
          Требует внимания
        </p>
        <p className="mt-3 rounded border border-emerald-400/20 bg-emerald-400/5 px-3 py-2 text-emerald-300 text-sm">
          Активных проблем нет
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-3 rounded-lg border border-line bg-surface-1 p-5">
      <p className="text-[11px] text-muted uppercase tracking-widest">
        Требует внимания · {items.length}
      </p>
      <ul className="space-y-2">
        {items.map((item) => (
          <li
            key={item.id}
            className={`rounded border-l-2 px-3 py-2 ${SEVERITY_CLASS[item.severity]}`}
          >
            <div className="flex items-baseline justify-between gap-2 text-sm">
              <span className="font-medium">
                {SEVERITY_ICON[item.severity]} {item.title}
              </span>
              {item.time != null && (
                <span className="shrink-0 font-mono text-[11px] text-muted">
                  {item.time}
                </span>
              )}
            </div>
            {item.detail != null && (
              <p className="mt-0.5 text-muted text-xs">{item.detail}</p>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
