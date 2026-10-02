"use client";

import { type ReactNode, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Kicker } from "@/components/ui/Kicker";
import { ToggleButton } from "@/components/ui/ToggleButton";
import {
  eventMinutes,
  FLOW_LABEL,
  FLOW_ORDER,
  isInHorizon,
  radarPointTitle,
  TRAIN_KIND_LABEL,
  whenLabel,
} from "../radar";
import type { RadarTrain, TrainFlow, TrainKind } from "../types";
import { RadarChart } from "./RadarChart";

type KindFilter = "all" | TrainKind;
type FlowFilter = "all" | TrainFlow;

const NEAREST_COUNT = 5;

export function TrainRadar({ trains }: { trains: RadarTrain[] }) {
  const [kind, setKind] = useState<KindFilter>("all");
  const [flow, setFlow] = useState<FlowFilter>("all");
  const [hovered, setHovered] = useState<RadarTrain | null>(null);

  const inHorizon = trains.filter(isInHorizon);
  const visible = inHorizon.filter(
    (train) =>
      (kind === "all" || train.kind === kind) &&
      (flow === "all" || train.flow === flow),
  );
  const nearest = visible
    .toSorted((a, b) => eventMinutes(a) - eventMinutes(b))
    .slice(0, NEAREST_COUNT);

  function pickKind(value: KindFilter) {
    setKind(value);
    setHovered(null);
  }

  function pickFlow(value: FlowFilter) {
    setFlow(value);
    setHovered(null);
  }

  return (
    <Card className="flex min-w-0 flex-col gap-4 p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div className="flex flex-col gap-1">
          <Kicker tone="accent">IV · Радар движения поездов</Kicker>
          <h2 className="font-heading font-semibold text-[22px]">
            Горизонт 3 часа
          </h2>
        </div>
        <span className="whitespace-nowrap text-[13px] text-muted">
          Показано {visible.length} из {inHorizon.length}
        </span>
      </div>

      <div className="flex flex-wrap items-start gap-6">
        <div className="max-w-[500px] flex-[1_1_340px]">
          <RadarChart trains={visible} hovered={hovered} onHover={setHovered} />
        </div>

        <div className="flex min-w-0 flex-[1_1_220px] flex-col gap-4">
          <FilterGroup label="Вид поезда">
            <ToggleButton
              active={kind === "all"}
              onClick={() => pickKind("all")}
            >
              Все
            </ToggleButton>
            <ToggleButton
              active={kind === "passenger"}
              onClick={() => pickKind("passenger")}
            >
              Пассажирские
            </ToggleButton>
            <ToggleButton
              active={kind === "freight"}
              onClick={() => pickKind("freight")}
            >
              Грузовые
            </ToggleButton>
          </FilterGroup>

          <FilterGroup label="Направление">
            <ToggleButton
              active={flow === "all"}
              onClick={() => pickFlow("all")}
            >
              Все
            </ToggleButton>
            {FLOW_ORDER.map((value) => (
              <ToggleButton
                key={value}
                active={flow === value}
                onClick={() => pickFlow(value)}
              >
                {FLOW_LABEL[value].label}
              </ToggleButton>
            ))}
          </FilterGroup>

          <ul className="flex gap-4 text-[13px] text-neutral-800">
            <li className="flex items-center gap-1.5">
              <KindSwatch kind="passenger" />
              {TRAIN_KIND_LABEL.passenger}
            </li>
            <li className="flex items-center gap-1.5">
              <KindSwatch kind="freight" />
              {TRAIN_KIND_LABEL.freight}
            </li>
          </ul>

          <div className="min-h-16 border-line border-t pt-3">
            <Kicker className="mb-1">Отметка</Kicker>
            <p className="font-heading text-[17px] leading-snug">
              {hovered == null
                ? "Наведите на отметку на радаре"
                : radarPointTitle(hovered)}
            </p>
          </div>

          <div className="border-line border-t pt-3">
            <Kicker className="mb-1.5">Ближайшие</Kicker>
            {nearest.length === 0 ? (
              <p className="text-[13px] text-muted">
                Нет поездов по выбранному фильтру
              </p>
            ) : (
              <ul>
                {nearest.map((train) => (
                  <li
                    key={`${train.number}-${train.flow}`}
                    className="flex items-center gap-2 border-line border-b py-1.5 text-[13.5px]"
                  >
                    <KindSwatch kind={train.kind} />
                    <span className="min-w-12">№ {train.number}</span>
                    <span className="min-w-0 flex-1 text-muted">
                      {FLOW_LABEL[train.flow].label}
                    </span>
                    <span>{whenLabel(train)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

// Тот же знак, что на радаре: пассажирский — заливка, грузовой — кольцо.
function KindSwatch({ kind }: { kind: TrainKind }) {
  return kind === "passenger" ? (
    <span className="size-2.5 shrink-0 rounded-full bg-neutral-800" />
  ) : (
    <span className="size-2.5 shrink-0 rounded-full border-2 border-neutral-800" />
  );
}

function FilterGroup({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Kicker>{label}</Kicker>
      <div className="flex flex-wrap gap-1">{children}</div>
    </div>
  );
}
