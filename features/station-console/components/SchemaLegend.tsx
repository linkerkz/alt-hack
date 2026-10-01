import { LegendItem } from "@/components/ui/LegendItem";

// Условные обозначения схемы станции.
export function SchemaLegend() {
  return (
    <ul className="flex flex-wrap gap-x-[18px] gap-y-1 pb-1 text-[11px] text-muted">
      <LegendItem swatch={<span className="h-[3px] w-[22px] bg-neutral-500" />}>
        свободен
      </LegendItem>
      <LegendItem swatch={<span className="h-1.5 w-[22px] bg-ink" />}>
        занят
      </LegendItem>
      <LegendItem swatch={<span className="h-[5px] w-[22px] bg-accent" />}>
        маршрут задан
      </LegendItem>
      <LegendItem
        swatch={
          <span className="w-[22px] border-accent border-t-4 border-dashed" />
        }
      >
        предпросмотр изменения
      </LegendItem>
      <LegendItem
        swatch={
          <span className="w-[22px] border-critical border-t-4 border-dashed" />
        }
      >
        неисправно / закрыто
      </LegendItem>
      <LegendItem
        swatch={
          <span className="h-3 w-[22px] rounded-sm border-[1.5px] border-ink" />
        }
      >
        пассажирский
      </LegendItem>
      <LegendItem
        swatch={<span className="h-3 w-[22px] rounded-sm bg-neutral-700" />}
      >
        грузовой
      </LegendItem>
    </ul>
  );
}
