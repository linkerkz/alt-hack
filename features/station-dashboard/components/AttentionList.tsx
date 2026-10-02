import { Card } from "@/components/ui/Card";
import { Kicker } from "@/components/ui/Kicker";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { StatusGlyph } from "@/components/ui/StatusGlyph";
import { Tag } from "@/components/ui/Tag";
import { STATUS_LABEL } from "../status";
import type { AttentionItem } from "../types";

export function AttentionList({ items }: { items: AttentionItem[] }) {
  return (
    <Card className="flex flex-col gap-2 p-6">
      <div className="flex items-baseline justify-between gap-2">
        <Kicker tone="accent">V · Требует внимания</Kicker>
        <span className="text-[13px] text-muted">
          {items.length} {pluralItems(items.length)}
        </span>
      </div>

      {items.length === 0 ? (
        <p className="py-2 font-heading text-[20px] text-normal">
          <StatusGlyph tone="normal" /> Активных проблем нет
        </p>
      ) : (
        <ul>
          {items.map((item) => (
            <li
              key={item.id}
              className="flex items-start gap-3 border-line border-t py-2.5 first:border-t-0"
            >
              <span className="w-3 pt-0.5 text-[15px] leading-tight">
                {item.severity === "pending" ? (
                  <span className="text-muted">○</span>
                ) : (
                  <StatusGlyph tone={item.severity} />
                )}
              </span>
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="text-[15px] leading-snug">{item.title}</span>
                <span className="text-[12.5px] text-muted">{metaOf(item)}</span>
              </div>
              {item.severity === "pending" ? (
                <Tag>Ожидает</Tag>
              ) : (
                <StatusBadge
                  tone={item.severity}
                  label={STATUS_LABEL[item.severity]}
                />
              )}
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

function metaOf(item: AttentionItem) {
  const parts = [item.detail, item.time == null ? null : `в ${item.time}`];
  return parts.filter((part) => part != null).join(" · ");
}

function pluralItems(count: number) {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return "пункт";
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return "пункта";
  return "пунктов";
}
