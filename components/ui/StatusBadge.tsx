import { StatusGlyph } from "./StatusGlyph";
import { TONE_BORDER_CLASS, TONE_TEXT_CLASS, type Tone } from "./tone";

type Props = {
  tone: Tone;
  label: string;
};

// Плашка состояния: «● Норма», «▲ Внимание», «■ Критично» — обводкой, без заливки.
export function StatusBadge({ tone, label }: Props) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 self-start whitespace-nowrap rounded-[3px] border px-2.5 py-0.5 text-[13px] ${TONE_BORDER_CLASS[tone]} ${TONE_TEXT_CLASS[tone]}`}
    >
      <StatusGlyph tone={tone} />
      {label}
    </span>
  );
}
