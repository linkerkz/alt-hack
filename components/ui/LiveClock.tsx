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
    <span className="flex items-baseline gap-1.5 border-line border-l pl-5">
      <span className="font-heading text-[24px] leading-none">
        {now == null ? "--:--:--" : FORMAT.format(now)}
      </span>
      <span className="text-[11px] text-muted">МСК</span>
    </span>
  );
}
