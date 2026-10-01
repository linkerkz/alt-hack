"use client";

import { useEffect, useState } from "react";

const CLOCK = new Intl.DateTimeFormat("ru-RU", {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
});

// Связь и время устройства в строке статуса. До первого кадра в браузере —
// прочерки: на сервере ни сети телефона, ни его часов не видно.
export function LinkStatus() {
  const [now, setNow] = useState<Date | null>(null);
  const [online, setOnline] = useState(true);

  useEffect(() => {
    const update = () => {
      setNow(new Date());
      setOnline(navigator.onLine);
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <span className="flex items-center gap-2 whitespace-nowrap">
      <span className={online ? "text-device-ok" : "text-device-alert"}>
        {online ? "● В СЕТИ" : "■ НЕТ СЕТИ"}
      </span>
      <span className="text-device-ink">
        {now == null ? "--:--:--" : CLOCK.format(now)}
      </span>
    </span>
  );
}
