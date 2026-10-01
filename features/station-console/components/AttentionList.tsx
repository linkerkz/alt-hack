import type { AttentionItem, AttentionSeverity } from "../types";

const SEVERITY_ICON: Record<AttentionSeverity, string> = {
  critical: "⚠",
  warning: "⚠",
  pending: "○",
};

const SEVERITY_CLASS: Record<AttentionSeverity, string> = {
  critical: "border-status-critical text-status-critical",
  warning: "border-status-warning text-status-warning",
  pending: "border-line text-muted",
};

export function AttentionList({ items }: { items: AttentionItem[] }) {
  if (items.length === 0) {
    return (
      <section className="rounded-md border border-line p-5">
        <p className="text-[10px] text-muted uppercase tracking-widest">
          Требует внимания
        </p>
        <p className="mt-3 rounded border border-status-normal/30 px-3 py-2 text-status-normal text-sm">
          Активных проблем нет
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-3 rounded-md border border-line p-5">
      <p className="text-[10px] text-muted uppercase tracking-widest">
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
                <span className="shrink-0 text-[11px] text-muted tabular-nums">
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
