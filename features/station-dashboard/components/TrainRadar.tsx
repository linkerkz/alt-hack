"use client";

import * as echarts from "echarts";
import dynamic from "next/dynamic";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Kicker } from "@/components/ui/Kicker";
import { LegendItem } from "@/components/ui/LegendItem";
import {
  FLOW_LABEL,
  FLOW_ORDER,
  layoutRadar,
  RADAR_HORIZON_MINUTES,
  radarPointTitle,
  TRAIN_KIND_LABEL,
} from "../radar";
import type { RadarTrain, TrainFlow, TrainKind } from "../types";

// Канвас echarts не умеет рисовать на сервере — переносим монтирование в браузер.
const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

const KIND_COLOR: Record<TrainKind, string> = {
  passenger: "#b68235", // accent — тот же акцент, что и в остальном интерфейсе
  freight: "#3a6ea5",
};

type KindFilter = "all" | TrainKind;
type FlowFilter = "all" | TrainFlow;

export function TrainRadar({ trains }: { trains: RadarTrain[] }) {
  const [kind, setKind] = useState<KindFilter>("all");
  const [flow, setFlow] = useState<FlowFilter>("all");

  const visible = trains.filter(
    (train) =>
      (kind === "all" || train.kind === kind) &&
      (flow === "all" || train.flow === flow),
  );

  const option = useMemo(() => buildOption(visible), [visible]);

  return (
    <Card className="space-y-4 p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <Kicker>Радар движения поездов · горизонт 3 ч</Kicker>
        <span className="text-[11px] text-muted">
          Показано {visible.length} из {trains.length}
        </span>
      </div>

      <div className="flex flex-wrap gap-4">
        <FilterGroup label="Поезда">
          <FilterButton active={kind === "all"} onClick={() => setKind("all")}>
            Все
          </FilterButton>
          <FilterButton
            active={kind === "passenger"}
            onClick={() => setKind("passenger")}
          >
            {TRAIN_KIND_LABEL.passenger}
          </FilterButton>
          <FilterButton
            active={kind === "freight"}
            onClick={() => setKind("freight")}
          >
            {TRAIN_KIND_LABEL.freight}
          </FilterButton>
        </FilterGroup>

        <FilterGroup label="Направление">
          <FilterButton active={flow === "all"} onClick={() => setFlow("all")}>
            Все
          </FilterButton>
          {FLOW_ORDER.map((value) => (
            <FilterButton
              key={value}
              active={flow === value}
              onClick={() => setFlow(value)}
            >
              {FLOW_LABEL[value].icon} {FLOW_LABEL[value].label}
            </FilterButton>
          ))}
        </FilterGroup>
      </div>

      {trains.length === 0 ? (
        <p className="py-6 text-center text-[13px] text-muted">
          Поездов за горизонт нет
        </p>
      ) : visible.length === 0 ? (
        <p className="py-6 text-center text-[13px] text-muted">
          Нет поездов по выбранному фильтру
        </p>
      ) : (
        <div className="flex flex-col items-center gap-2">
          <ReactECharts
            option={option}
            style={{ height: 420, width: "100%" }}
            opts={{ renderer: "svg" }}
          />
          <ul className="flex flex-wrap gap-x-5 gap-y-1 text-[12px] text-muted">
            <LegendItem
              swatch={
                <span
                  className="size-2.5 rounded-full"
                  style={{ background: KIND_COLOR.passenger }}
                />
              }
            >
              {TRAIN_KIND_LABEL.passenger}
            </LegendItem>
            <LegendItem
              swatch={
                <span
                  className="size-2.5 rounded-full"
                  style={{ background: KIND_COLOR.freight }}
                />
              }
            >
              {TRAIN_KIND_LABEL.freight}
            </LegendItem>
          </ul>
        </div>
      )}
    </Card>
  );
}

function buildOption(trains: RadarTrain[]) {
  const points = layoutRadar(trains);
  const kinds: TrainKind[] = ["passenger", "freight"];

  return {
    polar: { center: ["50%", "52%"], radius: "70%" },
    angleAxis: {
      type: "value",
      min: 0,
      max: 360,
      interval: 120,
      axisLabel: { show: false },
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: {
        lineStyle: { color: "#201f1d", opacity: 0.16, type: "dashed" },
      },
    },
    radiusAxis: {
      type: "value",
      min: 0,
      max: RADAR_HORIZON_MINUTES,
      interval: 60,
      axisLabel: {
        formatter: (value: number) =>
          value === 0 ? "сейчас" : `${value / 60} ч`,
        color: "#605d5d",
        fontFamily: "Lora, Georgia, serif",
        fontSize: 11,
      },
      axisLine: { lineStyle: { color: "#201f1d", opacity: 0.16 } },
      splitLine: { lineStyle: { color: "#201f1d", opacity: 0.12 } },
      splitArea: {
        show: true,
        areaStyle: { color: ["rgba(182,130,53,0.05)", "rgba(182,130,53,0)"] },
      },
    },
    tooltip: {
      trigger: "item",
      backgroundColor: "#f3f2f2",
      borderColor: "#201f1d",
      borderWidth: 1,
      textStyle: { color: "#201f1d", fontFamily: "Lora, Georgia, serif" },
      formatter: (params: { data: { title: string } }) => params.data.title,
    },
    series: kinds.map((seriesKind) => ({
      name: TRAIN_KIND_LABEL[seriesKind],
      type: "scatter",
      coordinateSystem: "polar",
      symbolSize: (value: number[]) => symbolSizeFor(value[0]),
      itemStyle: {
        color: glow(KIND_COLOR[seriesKind]),
        shadowBlur: 10,
        shadowColor: `${KIND_COLOR[seriesKind]}55`,
      },
      emphasis: {
        scale: 1.3,
        itemStyle: { shadowBlur: 18, shadowColor: KIND_COLOR[seriesKind] },
      },
      data: points
        .filter((point) => point.kind === seriesKind)
        .map((point) => ({
          // Полярный scatter в echarts ждёт [радиус, угол], а не [угол, радиус].
          value: [point.radiusMinutes, point.angle],
          title: radarPointTitle(point),
        })),
    })),
  };
}

// Ближе к «сейчас» — крупнее точка: подчёркивает, что скоро произойдёт.
function symbolSizeFor(radiusMinutes: number) {
  return 16 - (radiusMinutes / RADAR_HORIZON_MINUTES) * 8;
}

// Объёмная точка вместо плоской заливки — чуть светлее по центру.
function glow(color: string) {
  return new echarts.graphic.RadialGradient(0.35, 0.3, 0.7, [
    { offset: 0, color: lighten(color) },
    { offset: 1, color },
  ]);
}

function lighten(hex: string) {
  const value = Number.parseInt(hex.slice(1), 16);
  const channel = (shift: number) =>
    Math.min(255, ((value >> shift) & 0xff) + 70);
  return `rgb(${channel(16)}, ${channel(8)}, ${channel(0)})`;
}

function FilterGroup({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <p className="text-[10px] uppercase tracking-[0.08em] text-muted">
        {label}
      </p>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <Button
      size="sm"
      variant={active ? "primary" : "secondary"}
      onClick={onClick}
    >
      {children}
    </Button>
  );
}
