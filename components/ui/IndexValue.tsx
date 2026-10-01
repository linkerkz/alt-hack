import type { ReactNode } from "react";
import { StatusBadge } from "./StatusBadge";
import { TONE_TEXT_CLASS, type Tone } from "./tone";

type Props = {
  value: number;
  tone: Tone;
  // Подпись состояния в плашке: «Норма».
  label: string;
  // Что за число: «индекс эффективности».
  caption?: ReactNode;
  size?: "md" | "lg";
  // Знаменатель рядом со значением: «100 / 100».
  max?: number;
};

const SIZE_CLASS = {
  md: "text-[36px]",
  lg: "text-[44px]",
};

// Крупное число в цвете состояния, рядом — плашка и подпись.
export function IndexValue({
  value,
  tone,
  label,
  caption,
  size = "lg",
  max,
}: Props) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex items-baseline gap-2">
        <span
          className={`font-heading font-semibold leading-none tracking-[-0.02em] ${SIZE_CLASS[size]} ${TONE_TEXT_CLASS[tone]}`}
        >
          {value}
        </span>
        {max != null && (
          <span className="font-medium text-[16px] text-muted">/ {max}</span>
        )}
      </span>
      <div className="flex flex-col gap-1">
        <StatusBadge tone={tone} label={label} />
        {caption != null && (
          <span className="text-[11px] text-muted leading-snug">{caption}</span>
        )}
      </div>
    </div>
  );
}
