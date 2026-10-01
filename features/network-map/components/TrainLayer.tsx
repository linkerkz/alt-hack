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

// Поезда едут по симуляции в реальном времени, поэтому на любом зуме идут
// с настоящей скоростью — не быстрее поезда. Живость даёт «дыхание» значка,
// а не ускоренное движение.
// Слой поездов — между линиями участков и маркерами станций, под подписями.
export function TrainLayer({ trains, stationById }: Props) {
  const now = useNow();

  return (
    <Pane name="trains" style={{ zIndex: 550 }}>
      {trains.map((train) => {
        const from = stationById.get(train.fromId);
        const to = stationById.get(train.toId);
        if (from == null || to == null || hasArrived(train, now)) {
          return null;
        }
        return (
          <TrainMarker
            key={train.trainId}
            train={train}
            from={from}
            to={to}
            progress={progressOf(train, now)}
          />
        );
      })}
    </Pane>
  );
}

// Часы браузера, мс. Карта грузится только в браузере, поэтому расхождения
// с серверной разметкой нет.
function useNow() {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), TICK_MS);
    return () => clearInterval(timer);
  }, []);
  return now;
}

// Прибывший поезд уже не в пути. Сервер уберёт его при ближайшем
// автообновлении, а до тех пор значок не должен стоять на станции прибытия.
function hasArrived({ arrivesAt }: MovingTrain, now: number) {
  return now >= arrivesAt;
}

// Доля пройденного участка: 0 — у станции отправления, 1 — прибыл.
function progressOf({ departsAt, arrivesAt }: MovingTrain, now: number) {
  const share = (now - departsAt) / (arrivesAt - departsAt);
  return Math.min(Math.max(share, 0), 1);
}
