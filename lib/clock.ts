// «14:08» из записи в базе: время симуляции станции, по Алматы (UTC+5).
export function simClock(at: string) {
  return new Date(at).toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Almaty",
  });
}

// «14:12» → минуты от полуночи и обратно: время плана станции.
export function toMinutes(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

export function toClock(total: number) {
  const hours = String(Math.floor(total / 60)).padStart(2, "0");
  return `${hours}:${String(total % 60).padStart(2, "0")}`;
}
