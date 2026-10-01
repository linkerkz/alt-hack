import { toClock } from "@/lib/clock";
import { activePlan } from "./activePlan";
import { DAMAGE, OBSTRUCTION } from "./fault";
import { INCIDENT, STEP } from "./mock";
import { participantsOf } from "./participants";
import { incidentProgress } from "./progress";
import { snapshotOf } from "./snapshot";
import { trainEvents } from "./trainEvents";
import { turnOf } from "./turn";
import type {
  ConsoleState,
  Live,
  Neighbors,
  ScenarioEvent,
  Status,
} from "./types";

// Карточка инцидента в правой панели: где мы (прогресс), чей ход и
// подробности — снимок, варианты, участники, хронология.

export function incidentCard(
  state: ConsoleState,
  neighbors: Neighbors,
  live: Live,
) {
  const { step } = state;
  const incidentId = live.incident?.id;
  const feed = feedOf(live);
  // Путейцы нашли повреждение: инцидент уже не про предмет, а про ремонт.
  const damaged = step >= STEP.escalated;
  const tone: Status = damaged ? "critical" : "warning";

  return {
    code: live.incident?.code ?? INCIDENT.id,
    detectedAt: live.anchor == null ? "" : toClock(live.anchor),
    fault: damaged ? { ...OBSTRUCTION, ...DAMAGE } : OBSTRUCTION,
    tone,
    snapshot: snapshotOf(live.incident),
    analysis: live.incident?.analysis ?? null,
    isActive: step >= STEP.suspected && step <= STEP.restored,
    progress: incidentProgress(state),
    turn: turnOf(state, live, neighbors),
    suggestion: suggestionAt(step),
    sections: sectionsAt(step),
    participants: participantsOf(state, neighbors, live),
    events: live.events.filter((event) => event.incidentId === incidentId),
    feed,
  };
}

// Лента станции: хронология и движение поездов вперемешку, свежие сверху.
function feedOf(live: Live): ScenarioEvent[] {
  return [...live.events, ...trainEvents(activePlan(live), live.now)].toSorted(
    (a, b) => b.time.localeCompare(a.time),
  );
}

// Подробности под ходом: какие есть на этом этапе и какие раскрыты.
// Раскрыт тот раздел, который нужен для хода сейчас.
function sectionsAt(step: number) {
  return {
    evidence: { open: step <= STEP.escalated },
    // Варианты нужны, только когда стрелку будут чинить.
    options:
      step >= STEP.escalated
        ? { open: step === STEP.choosing || step === STEP.approval }
        : null,
    participants:
      step >= STEP.dispatched ? { open: step >= STEP.decided } : null,
  };
}

function suggestionAt(step: number) {
  if (step <= STEP.dispatched) {
    return "Путейцы уберут предмет — перепланирование пока не нужно.";
  }
  if (step <= STEP.choosing) {
    return "Система рассчитала варианты перепланирования — выберите на вкладке инцидента.";
  }
  if (step === STEP.approval) return "Вариант Б ждёт согласования ДНЦ.";
  if (step <= STEP.repairing) return "Решение принято, идут работы.";
  if (step === STEP.repaired) {
    return "Работы выполнены. Ждёт возвращения в эксплуатацию ДСП.";
  }
  return "Предложено вернуться к исходному плану.";
}
