"use client";

import { useEffect, useState } from "react";

const FORMAT = new Intl.DateTimeFormat("ru-RU", {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  timeZone: "Europe/Moscow",
});

export function LiveClock() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <span className="font-heading text-ink text-lg tabular-nums">
      {now == null ? "--:--:--" : FORMAT.format(now)}
      <span className="ml-1.5 font-body text-[10px] text-muted">МСК</span>
    </span>
  );
}
