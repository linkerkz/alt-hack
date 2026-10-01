import { useEffect, useRef } from "react";
import { TICK_MS } from "./watch";

// Пауза между кадрами, даже если модель не успевает: экран должен отвечать.
const MIN_GAP_MS = 50;

// Зовёт look раз в тик, пока active. Следующий тик — через TICK_MS после
// начала текущего, но не вплотную: на медленном телефоне модель не забирает
// весь поток. Всегда зовёт свежий look — пересоздавать таймер не нужно.
export function useTick(look: () => void, active: boolean) {
  const latest = useRef(look);
  useEffect(() => {
    latest.current = look;
  });

  useEffect(() => {
    if (!active) return;
    let timer: ReturnType<typeof setTimeout>;
    function tick() {
      const started = performance.now();
      latest.current();
      const spent = performance.now() - started;
      timer = setTimeout(tick, Math.max(MIN_GAP_MS, TICK_MS - spent));
    }
    timer = setTimeout(tick, TICK_MS);
    return () => clearTimeout(timer);
  }, [active]);
}
