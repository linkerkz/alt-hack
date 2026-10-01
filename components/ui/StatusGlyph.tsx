import { TONE_GLYPH, TONE_TEXT_CLASS, type Tone } from "./tone";

// Только значок состояния — для строк списков и подписей на карте.
export function StatusGlyph({ tone }: { tone: Tone }) {
  return (
    <span aria-hidden className={`text-[0.75em] ${TONE_TEXT_CLASS[tone]}`}>
      {TONE_GLYPH[tone]}
    </span>
  );
}
