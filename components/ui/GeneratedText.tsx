"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  text: string;
  // Что «сгенерировано»: показав раз, в этой вкладке выводим сразу.
  storageKey: string;
  // Что пишем, пока ИИ «думает».
  pending?: string;
  className?: string;
};

// Пауза «ИИ анализирует» и скорость печати.
const THINK_MS = 2500;
const TICK_MS = 20;
const CHARS_PER_TICK = 2;

const STORAGE_PREFIX = "generated:";

// Текст, который будто пишет ИИ: сначала пауза, затем печать по буквам.
// Автообновление может прислать текст с новыми цифрами — печать не
// начинается заново, а дописывает уже новый текст.
export function GeneratedText({
  text,
  storageKey,
  pending = "ИИ анализирует варианты…",
  className = "",
}: Props) {
  const [chars, setChars] = useState<number | null>(null);
  const length = useRef(text.length);
  length.current = text.length;

  useEffect(() => {
    if (wasShown(storageKey)) {
      setChars(Number.POSITIVE_INFINITY);
      return;
    }
    setChars(null);
    let typed = 0;
    let timer: ReturnType<typeof setInterval> | undefined;
    const think = setTimeout(() => {
      timer = setInterval(() => {
        typed += CHARS_PER_TICK;
        setChars(typed);
        if (typed >= length.current) {
          clearInterval(timer);
          remember(storageKey);
        }
      }, TICK_MS);
    }, THINK_MS);
    return () => {
      clearTimeout(think);
      clearInterval(timer);
    };
  }, [storageKey]);

  if (chars == null) {
    return (
      <p className={`text-muted motion-safe:animate-pulse ${className}`}>
        {pending}
      </p>
    );
  }
  const isTyping = chars < text.length;
  return (
    <p className={className} aria-busy={isTyping}>
      {text.slice(0, chars)}
      {isTyping && <span aria-hidden>▍</span>}
    </p>
  );
}

// Хранилище может быть недоступно (приватное окно) — тогда просто печатаем.
function wasShown(key: string) {
  try {
    return sessionStorage.getItem(STORAGE_PREFIX + key) != null;
  } catch {
    return false;
  }
}

function remember(key: string) {
  try {
    sessionStorage.setItem(STORAGE_PREFIX + key, "1");
  } catch {
    // Не запомнили — в следующий раз напечатаем снова.
  }
}
