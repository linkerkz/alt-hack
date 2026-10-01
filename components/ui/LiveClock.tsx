"use client";

import { useEffect, useState } from "react";

// Без timeZone — время в часовом поясе браузера пользователя.
const FORMAT = new Intl.DateTimeFormat("ru-RU", {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
});

const ZONE = new Intl.DateTimeFormat("ru-RU", { timeZoneName: "short" });

export function LiveClock() {
  const [now, setNow] = useState<Date | null>(null);

  // Время считаем только в браузере: на сервере пояс пользователя неизвестен.
  useEffect(() => {
    setNow(new Date());
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <span className="flex items-baseline gap-1.5 border-line border-l pl-5">
      <span className="font-medium text-[18px] leading-none">
        {now == null ? "--:--:--" : FORMAT.format(now)}
      </span>
      {now != null && (
        <span className="text-[11px] text-muted">{zoneName(now)}</span>
      )}
    </span>
  );
}

// Короткое имя пояса: «GMT+5» — чтобы было видно, по какому поясу часы.
function zoneName(date: Date) {
  const parts = ZONE.formatToParts(date);
  return parts.find((part) => part.type === "timeZoneName")?.value ?? "";
}
