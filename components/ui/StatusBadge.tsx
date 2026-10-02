import { StatusGlyph } from "./StatusGlyph";
import {
  TONE_BORDER_CLASS,
  TONE_TEXT_CLASS,
  TONE_TINT_CLASS,
  type Tone,
} from "./tone";

type Props = {
  tone: Tone;
  label: string;
  // lg — итог экрана: «Состояние станции» в шапке отчёта.
  size?: "md" | "lg";
};

const SIZE_CLASS = {
  md: "gap-1.5 px-2.5 py-0.5 font-medium text-[12.5px]",
  lg: "gap-2 px-4 py-1 font-heading font-semibold text-[20px]",
};

// Плашка состояния: «● Норма», «▲ Внимание», «■ Критично» — обводкой и лёгкой подложкой своего цвета.
export function StatusBadge({ tone, label, size = "md" }: Props) {
  return (
    <span
      className={`inline-flex items-center self-start whitespace-nowrap rounded-full border ${SIZE_CLASS[size]} ${TONE_BORDER_CLASS[tone]} ${TONE_TINT_CLASS[tone]} ${TONE_TEXT_CLASS[tone]}`}
    >
      <StatusGlyph tone={tone} />
      {label}
    </span>
  );
}
