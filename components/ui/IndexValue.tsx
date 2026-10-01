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
};

const SIZE_CLASS = {
  md: "text-[40px]",
  lg: "text-[52px]",
};

// Крупное серифное число в цвете состояния, рядом — плашка и подпись.
export function IndexValue({
  value,
  tone,
  label,
  caption,
  size = "lg",
}: Props) {
  return (
    <div className="flex items-center gap-3">
      <span
        className={`font-heading leading-none ${SIZE_CLASS[size]} ${TONE_TEXT_CLASS[tone]}`}
      >
        {value}
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
