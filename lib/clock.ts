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

// Минуты плана могут выйти за сутки (вчера — меньше нуля, завтра — больше
// 1440): на часах это то же время суток.
export function toClock(total: number) {
  const day = 24 * 60;
  const minutes = ((total % day) + day) % day;
  const hours = String(Math.floor(minutes / 60)).padStart(2, "0");
  return `${hours}:${String(minutes % 60).padStart(2, "0")}`;
}

// Минуты от полуночи станции (Алматы, UTC+5) для момента at.
export function stationMinutes(at: Date) {
  return toMinutes(simClock(at.toISOString()));
}
