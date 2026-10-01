import type { ConsoleState } from "./types";

// Приём поездов по новому плану: что ДСП уже подтвердил (из базы).
export function routeDone({ done }: ConsoleState) {
  return {
    r101: done.includes("r101"),
    r2001: done.includes("r2001"),
  };
}
