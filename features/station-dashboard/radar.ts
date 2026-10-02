import type { RadarTrain, TrainFlow } from "./types";

// Горизонт совпадает с картой сети (features/network-map/flows.ts), чтобы
// радар показывал те же поезда, что и счётчики станции на карте.
export const RADAR_HORIZON_MINUTES = 180;

export const FLOW_ORDER: TrainFlow[] = ["arriving", "departing", "passing"];

export const FLOW_LABEL: Record<TrainFlow, { icon: string; label: string }> = {
  arriving: { icon: "↓", label: "К нам" },
  departing: { icon: "↑", label: "От нас" },
  passing: { icon: "⇢", label: "Проездом" },
};

export const TRAIN_KIND_LABEL: Record<RadarTrain["kind"], string> = {
  passenger: "Пассажирский",
  freight: "Грузовой",
};

export const SECTOR_SPAN_DEG = 360 / FLOW_ORDER.length;
const SECTOR_MARGIN_DEG = 14;

// Точка радара в полярных координатах: angle — градусы по часовой стрелке
// от 12 часов, radiusMinutes — минуты до события, 0…RADAR_HORIZON_MINUTES.
type RadarPoint = RadarTrain & { angle: number; radiusMinutes: number };

// Три равных сектора по направлению (К нам / От нас / Проездом). Внутри
// сектора поезда разложены по углу равномерно, чтобы не накладывались друг
// на друга, — радиус несёт время.
export function layoutRadar(trains: RadarTrain[]): RadarPoint[] {
  return FLOW_ORDER.flatMap((flow, sectorIndex) =>
    placeInSector(
      trains.filter((train) => train.flow === flow),
      sectorIndex,
    ),
  );
}

// Полярные координаты → точка SVG: 0° — вверх, по часовой стрелке.
// Округляем: Math.sin на сервере и в браузере расходится в последнем знаке,
// и атрибуты SVG не совпали бы при гидратации.
export function toCartesian(angle: number, radius: number, center: number) {
  const radians = (angle * Math.PI) / 180;
  return {
    x: round(center + radius * Math.sin(radians)),
    y: round(center - radius * Math.cos(radians)),
  };
}

function round(value: number) {
  return Math.round(value * 100) / 100;
}

// На радаре — только то, что случится за горизонт: прошедшее и дальнее
// легло бы в центр и на край кучей и закрыло бы подписи секторов.
export function isInHorizon(train: RadarTrain) {
  const minutes = eventMinutes(train);
  return minutes >= 0 && minutes <= RADAR_HORIZON_MINUTES;
}

export function eventMinutes(train: RadarTrain) {
  return train.flow === "departing" ? train.departure : train.arrival;
}

export function radarPointTitle(train: RadarTrain): string {
  const { icon, label } = FLOW_LABEL[train.flow];
  return `№ ${train.number} · ${TRAIN_KIND_LABEL[train.kind].toLowerCase()} · ${icon} ${label.toLowerCase()} · ${whenLabel(train)}`;
}

export function whenLabel(train: RadarTrain): string {
  const minutes = eventMinutes(train);
  return minutes <= 0 ? "сейчас" : `через ${formatHours(minutes)}`;
}

function formatHours(minutes: number): string {
  if (minutes < 60) return `${minutes} мин`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0 ? `${hours} ч` : `${hours} ч ${rest} мин`;
}

function placeInSector(
  trains: RadarTrain[],
  sectorIndex: number,
): RadarPoint[] {
  const start = sectorIndex * SECTOR_SPAN_DEG + SECTOR_MARGIN_DEG;
  const end = (sectorIndex + 1) * SECTOR_SPAN_DEG - SECTOR_MARGIN_DEG;
  const sorted = trains.toSorted((a, b) => eventMinutes(a) - eventMinutes(b));

  return sorted.map((train, index) => {
    const angle =
      sorted.length === 1
        ? (start + end) / 2
        : start + ((end - start) * index) / (sorted.length - 1);
    const radiusMinutes = Math.min(
      Math.max(eventMinutes(train), 0),
      RADAR_HORIZON_MINUTES,
    );
    return { ...train, angle, radiusMinutes };
  });
}
