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
};

// Плашка состояния: «● Норма», «▲ Внимание», «■ Критично» — обводкой и лёгкой подложкой своего цвета.
export function StatusBadge({ tone, label }: Props) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 self-start whitespace-nowrap rounded-full border px-2.5 py-0.5 font-medium text-[12.5px] ${TONE_BORDER_CLASS[tone]} ${TONE_TINT_CLASS[tone]} ${TONE_TEXT_CLASS[tone]}`}
    >
      <StatusGlyph tone={tone} />
      {label}
    </span>
  );
}
