// «14:08» из записи в базе: время симуляции станции, по Алматы (UTC+5).
export function simClock(at: string) {
  return new Date(at).toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Almaty",
  });
}
