import {
  forecastUntil,
  type PlanSource,
  scoreBaseline,
  scorePlan,
} from "./efficiency";
import type { PlanScore } from "./metrics";
import { replanOptions, STEP } from "./mock";
import { formatNumber, indexStatus } from "./status";
import type {
  ConsoleState,
  Live,
  Neighbors,
  OptionId,
  ReplanOption,
  Status,
} from "./types";

// Сравнение вариантов перепланирования с исходным сценарием «ничего не менять».

export type ComparisonCell = {
  text: string;
  // Лучшее значение в строке — выделяем начертанием.
  best: boolean;
  status: Status | null;
};

const ORDER: OptionId[] = ["none", "A", "B"];
const RECOMMENDED: OptionId = "B";

type ScoredOption = ReplanOption & PlanScore;

export function optionComparison(
  state: ConsoleState,
  live: Live,
  neighbors: Neighbors,
) {
  const { step, option } = state;
  const options = scoredOptions(live, neighbors);
  const decided = step >= STEP.decided;
  const selectable = step === STEP.escalated || step === STEP.choosing;
  const selected = options[option];

  return {
    note: noteAt(step, selected.name),
    impact: {
      before: scoreBaseline(live).index,
      after: options.none.index,
      status: indexStatus(options.none.index),
      until: forecastUntil(),
    },
    decided,
    heads: ORDER.map((id) => ({
      id,
      name: options[id].name,
      caption: captionOf(id, decided && id === option),
      recommended: id === RECOMMENDED,
      selected: id === option,
      selectable: id !== "none" && selectable,
    })),
    rows: comparisonRows(ORDER.map((id) => options[id])),
    selected: {
      ...selected,
      recommendation:
        option === RECOMMENDED ? "★ рекомендован системой" : "альтернатива",
    },
  };
}

// Варианты вместе с показателями их планов.
export function scoredOptions(live: PlanSource, neighbors: Neighbors) {
  const options = replanOptions(neighbors);
  const score = (id: OptionId): ScoredOption => ({
    ...options[id],
    ...scorePlan({ live, neighbors, option: id }),
  });
  return { none: score("none"), A: score("A"), B: score("B") };
}

function noteAt(step: number, name: string) {
  if (step === STEP.escalated) {
    return "Предварительно: ждёт отправки ремонтной бригады";
  }
  if (step >= STEP.decided) return `Решение принято: ${name.toLowerCase()}`;
  return "Нажмите на вариант, чтобы увидеть изменения";
}

function captionOf(id: OptionId, accepted: boolean) {
  if (id === "none") return "исходный сценарий";
  const base = id === RECOMMENDED ? "★ рекомендован" : "без ДНЦ";
  return accepted ? `${base} · принят` : base;
}

function comparisonRows(options: ScoredOption[]) {
  return [
    numberRow(options, {
      label: "Индекс",
      read: (o) => o.index,
      better: "max",
      withStatus: true,
    }),
    numberRow(options, {
      label: "Пропускная",
      read: (o) => o.values[0],
      unit: "%",
      better: "max",
    }),
    numberRow(options, {
      label: "Отклонение",
      read: (o) => o.values[1],
      unit: " мин",
    }),
    numberRow(options, {
      label: "Загрузка путей",
      read: (o) => o.values[2],
      unit: "%",
    }),
    numberRow(options, { label: "Конфликты", read: (o) => o.values[3] }),
    numberRow(options, {
      label: "Простой",
      read: (o) => o.values[4],
      unit: " мин",
    }),
    numberRow(options, {
      label: "Макс. задержка",
      read: (o) => o.maxDelay,
      unit: " мин",
    }),
    numberRow(options, {
      label: "Задержка пасс.",
      read: (o) => o.passengerDelay,
      unit: " мин",
    }),
    {
      label: "Согласование ДНЦ",
      cells: options.map((o) => ({
        text: o.dncApproval,
        best: false,
        status: null,
      })),
    },
  ];
}

type RowParams = {
  label: string;
  read: (option: ScoredOption) => number;
  unit?: string;
  // Какое значение лучше; по умолчанию — меньшее.
  better?: "max" | "min";
  // Значение — индекс: показываем состояние значком и цветом.
  withStatus?: boolean;
};

function numberRow(
  options: ScoredOption[],
  { label, read, unit = "", better = "min", withStatus = false }: RowParams,
) {
  const values = options.map(read);
  const best = better === "max" ? Math.max(...values) : Math.min(...values);
  const cells: ComparisonCell[] = values.map((value) => ({
    text: formatNumber(value) + unit,
    best: value === best,
    status: withStatus ? indexStatus(value) : null,
  }));
  return { label, cells };
}
