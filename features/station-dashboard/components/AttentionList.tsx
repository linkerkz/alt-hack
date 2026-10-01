import { Card } from "@/components/ui/Card";
import { Kicker } from "@/components/ui/Kicker";
import { StatusGlyph } from "@/components/ui/StatusGlyph";
import type { AttentionItem } from "../types";

export function AttentionList({ items }: { items: AttentionItem[] }) {
  if (items.length === 0) {
    return (
      <Card className="space-y-2 p-5">
        <Kicker>Требует внимания</Kicker>
        <p className="rounded border border-normal px-3 py-2 text-[13px] text-normal">
          <StatusGlyph tone="normal" /> Активных проблем нет
        </p>
      </Card>
    );
  }

  return (
    <Card className="space-y-3 p-5">
      <Kicker>Требует внимания · {items.length}</Kicker>
      <ul className="space-y-2">
        {items.map((item) => (
          <li
            key={item.id}
            className="border-line border-t pt-2 first:border-t-0 first:pt-0"
          >
            <div className="flex items-baseline justify-between gap-2 text-[13px]">
              <span className="font-medium">
                {item.severity === "pending" ? (
                  <span className="text-muted">○</span>
                ) : (
                  <StatusGlyph tone={item.severity} />
                )}{" "}
                {item.title}
              </span>
              {item.time != null && (
                <span className="shrink-0 text-[11px] text-muted">
                  {item.time}
                </span>
              )}
            </div>
            {item.detail != null && (
              <p className="mt-0.5 text-[12px] text-muted">{item.detail}</p>
            )}
          </li>
        ))}
      </ul>
    </Card>
  );
}
