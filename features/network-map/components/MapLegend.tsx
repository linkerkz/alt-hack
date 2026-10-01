import { Card } from "@/components/ui/Card";
import { LegendItem } from "@/components/ui/LegendItem";
import { StatusGlyph } from "@/components/ui/StatusGlyph";
import { HORIZON_MINUTES } from "../flows";
import {
  FLOW_LABEL,
  FLOW_ORDER,
  STATUS_LABEL,
  STATUS_ORDER,
  TRAIN_KIND_FILL,
} from "../status";
import type { TrainKind } from "../types";

export function MapLegend() {
  return (
    <Card elevation="sm" className="text-[11.5px] text-muted">
      <details className="group p-3">
        <summary className="cursor-pointer list-none text-[10.5px] uppercase tracking-[0.1em] hover:text-accent-700">
          Легенда <span className="group-open:hidden">+</span>
          <span className="hidden group-open:inline">−</span>
        </summary>
        <ul className="mt-2 space-y-1.5">
          {STATUS_ORDER.map((status) => (
            <LegendItem key={status} swatch={<StatusGlyph tone={status} />}>
              Станция · {STATUS_LABEL[status]}
            </LegendItem>
          ))}
          <LegendItem
            swatch={<span className="size-2 rounded-full bg-neutral-500" />}
          >
            Соседняя станция вне зоны
          </LegendItem>
          <LegendItem swatch={<span className="h-[1.5px] w-full bg-muted" />}>
            Участок
          </LegendItem>
          <LegendItem
            swatch={
              <span className="w-full border-critical border-t-[3px] border-dashed" />
            }
          >
            Участок с затруднением
          </LegendItem>
          <LegendItem swatch={<span className="h-[3px] w-full bg-accent" />}>
            Участки выбранной станции
          </LegendItem>
          <LegendItem swatch={<TrainSwatch kind="passenger" />}>
            Пассажирский поезд в пути
          </LegendItem>
          <LegendItem swatch={<TrainSwatch kind="freight" />}>
            Грузовой поезд в пути — по расписанию, в реальном времени
          </LegendItem>
        </ul>
        <p className="mt-2 border-line border-t pt-2">
          Поезда станции в пути или выйдут за {HORIZON_MINUTES / 60} ч, каждый —
          в одном счётчике:
        </p>
        <ul className="mt-1 space-y-0.5">
          {FLOW_ORDER.map((key) => (
            <li key={key}>
              {FLOW_LABEL[key].icon} {FLOW_LABEL[key].label.toLowerCase()} —{" "}
              {FLOW_LABEL[key].hint}
            </li>
          ))}
        </ul>
        <p className="mt-2">
          На участке: <span className="text-accent-700">➜&nbsp;3</span> — все
          поезда по стрелке, включая проездом
        </p>
      </details>
    </Card>
  );
}

// Образец значка поезда — та же заливка, что у маркера на карте.
function TrainSwatch({ kind }: { kind: TrainKind }) {
  return (
    <span
      className={`size-2.5 rounded-full border border-paper ${TRAIN_KIND_FILL[kind]}`}
    />
  );
}
