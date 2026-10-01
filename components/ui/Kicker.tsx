import type { ReactNode } from "react";
import { TONE_TEXT_CLASS, type Tone } from "./tone";

type Props = {
  children: ReactNode;
  // Тон состояния — для надзаголовков-итогов: «■ Отклонено», «● Согласовано».
  tone?: "muted" | "accent" | Tone;
  className?: string;
};

const TONE_CLASS: Record<NonNullable<Props["tone"]>, string> = {
  muted: "text-muted",
  accent: "text-accent-700",
  ...TONE_TEXT_CLASS,
};

// Надзаголовок капителью: «Зона ответственности», «Наша станция · ведёт система».
export function Kicker({ children, tone = "muted", className = "" }: Props) {
  return (
    <p
      className={`text-[10.5px] uppercase leading-tight tracking-[0.1em] ${TONE_CLASS[tone]} ${className}`}
    >
      {children}
    </p>
  );
}
