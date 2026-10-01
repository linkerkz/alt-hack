import { STEP } from "./mock";
import type { ConsoleState } from "./types";

// Приём поездов по новому плану: что ДСП уже подтвердил. К шагу «Работы идут»
// всё считается выполненным, даже если демо пролистали мимо.
export function routeDone({ step, done }: ConsoleState) {
  const allDone = step >= STEP.repairing;
  return {
    r101: allDone || done.includes("r101"),
    r2001: allDone || done.includes("r2001"),
  };
}
