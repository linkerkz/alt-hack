"use client";

import { useEffect, useState } from "react";
import { Pane } from "react-leaflet";
import type { MovingTrain, Station } from "../types";
import { TrainMarker } from "./TrainMarker";

type Props = {
  trains: MovingTrain[];
  stationById: Map<string, Station>;
};

// Поезд сдвигается раз в секунду: на ближнем зуме это доли пикселя, движение плавное.
const TICK_MS = 1000;

// Поезда едут по своему расписанию в реальном времени, поэтому на любом
// зуме идут с настоящей скоростью — не быстрее поезда. Живость даёт
// «дыхание» значка, а не ускоренное движение.
// Слой поездов — между линиями участков и маркерами станций, под подписями.
export function TrainLayer({ trains, stationById }: Props) {
  const elapsed = useElapsedMinutes();

  return (
    <Pane name="trains" style={{ zIndex: 550 }}>
      {trains.map((train) => {
        const from = stationById.get(train.fromId);
        const to = stationById.get(train.toId);
        if (from == null || to == null || hasArrived(train, elapsed)) {
          return null;
        }
        return (
          <TrainMarker
            key={train.trainId}
            train={train}
            from={from}
            to={to}
            progress={progressOf(train, elapsed)}
          />
        );
      })}
    </Pane>
  );
}

// Минуты с открытия карты. Автообновление присылает то же расписание
// «от текущего момента», а слой живёт дальше — время копится.
function useElapsedMinutes() {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const start = Date.now();
    const timer = setInterval(
      () => setElapsed((Date.now() - start) / 60_000),
      TICK_MS,
    );
    return () => clearInterval(timer);
  }, []);
  return elapsed;
}

// Прибывший поезд уже не в пути. Расписание с сервера не сдвигается, поэтому
// без этой проверки он так и стоял бы значком на станции прибытия.
function hasArrived({ arrival }: MovingTrain, elapsed: number) {
  return elapsed >= arrival;
}

// Доля пройденного участка: 0 — у станции отправления, 1 — прибыл.
function progressOf({ departure, arrival }: MovingTrain, elapsed: number) {
  const share = (elapsed - departure) / (arrival - departure);
  return Math.min(Math.max(share, 0), 1);
}
