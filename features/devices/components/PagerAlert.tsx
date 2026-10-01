"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  // Наряд на экране; null — нарядов нет.
  orderId: string | null;
};

// Сколько держится вспышка «Новый наряд».
const FLASH_MS = 5000;
const VIBRATION = [300, 150, 300, 150, 600];

// Сигнал пейджера: пришёл новый наряд — вибрация, три гудка и вспышка на
// весь экран. Наряд, который был на экране при открытии, не сигналит.
// Звук браузер разрешает только после касания — включаем его на первом.
export function PagerAlert({ orderId }: Props) {
  const shown = useRef(orderId);
  const audio = useRef<AudioContext | null>(null);
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    function unlock() {
      audio.current ??= new AudioContext();
    }
    window.addEventListener("pointerdown", unlock, { once: true });
    return () => window.removeEventListener("pointerdown", unlock);
  }, []);

  useEffect(() => {
    const isNew = orderId != null && orderId !== shown.current;
    shown.current = orderId;
    if (!isNew) return;

    navigator.vibrate?.(VIBRATION);
    if (audio.current != null) beep(audio.current);
    setFlash(true);
    const timer = setTimeout(() => setFlash(false), FLASH_MS);
    return () => clearTimeout(timer);
  }, [orderId]);

  if (!flash) return null;
  return (
    <button
      type="button"
      onClick={() => setFlash(false)}
      className="fixed inset-0 z-50 flex animate-pulse flex-col items-center justify-center gap-2 border-8 border-critical bg-paper/95 p-8 text-center"
    >
      <span className="text-[13px] text-critical uppercase tracking-[0.12em]">
        ■ Новый наряд
      </span>
      <span className="font-heading font-semibold text-[34px] leading-tight">
        Откройте наряд и возьмите его в работу
      </span>
    </button>
  );
}

// Три коротких гудка 880 Гц.
function beep(context: AudioContext) {
  for (const offset of [0, 0.35, 0.7]) {
    const tone = context.createOscillator();
    const gain = context.createGain();
    tone.frequency.value = 880;
    gain.gain.value = 0.2;
    tone.connect(gain).connect(context.destination);
    tone.start(context.currentTime + offset);
    tone.stop(context.currentTime + offset + 0.2);
  }
}
