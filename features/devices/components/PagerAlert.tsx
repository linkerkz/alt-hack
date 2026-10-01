"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  // Свежее сообщение без ответа; null — бригаде нечего делать.
  message: { id: string; isCall: boolean } | null;
};

// Сколько держится вспышка нового сообщения.
const FLASH_MS = 5000;
const VIBRATION = [300, 150, 300, 150, 600];

// Сигнал пейджера: пришёл вызов или задача — вибрация, три гудка и вспышка
// на весь экран. Сообщение, которое было на экране при открытии, не сигналит.
// Звук браузер разрешает только после касания — включаем его на первом.
export function PagerAlert({ message }: Props) {
  const id = message?.id ?? null;
  const shown = useRef(id);
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
    const isNew = id != null && id !== shown.current;
    shown.current = id;
    if (!isNew) return;

    navigator.vibrate?.(VIBRATION);
    if (audio.current != null) beep(audio.current);
    setFlash(true);
    const timer = setTimeout(() => setFlash(false), FLASH_MS);
    return () => clearTimeout(timer);
  }, [id]);

  if (!flash || message == null) return null;
  return (
    <button
      type="button"
      onClick={() => setFlash(false)}
      className="fixed inset-0 z-50 flex animate-pulse flex-col items-center justify-center gap-3 border-8 border-device-alert bg-device/95 p-8 text-center"
    >
      <span className="text-[13px] text-device-alert uppercase tracking-[0.16em]">
        {message.isCall ? "■ Вызов" : "▲ Новая задача"}
      </span>
      <span className="font-bold text-[28px] uppercase leading-tight">
        {message.isCall ? "Срочно к стрелке С3" : "Задача от ДСП"}
      </span>
      <span className="text-[12px] text-device-dim">Коснитесь экрана</span>
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
