// Тон — цветовая роль состояния в интерфейсе. Совпадает со словарём
// «Состояние» (Норма / Внимание / Критично), но ui о фичах не знает.
export type Tone = "normal" | "warning" | "critical";

// Значок дублирует цвет формой: состояние читается и без цвета.
export const TONE_GLYPH: Record<Tone, string> = {
  normal: "●",
  warning: "▲",
  critical: "■",
};

// Значения для SVG и Leaflet, где нужен цвет, а не класс. Те же, что в globals.css.
export const TONE_COLOR: Record<Tone, string> = {
  normal: "#337344",
  warning: "#a06f24",
  critical: "#b6322b",
};

// Классы пишем целиком, чтобы сканер Tailwind их нашёл.
export const TONE_TEXT_CLASS: Record<Tone, string> = {
  normal: "text-normal",
  warning: "text-warning",
  critical: "text-critical",
};

export const TONE_BG_CLASS: Record<Tone, string> = {
  normal: "bg-normal",
  warning: "bg-warning",
  critical: "bg-critical",
};

export const TONE_BORDER_CLASS: Record<Tone, string> = {
  normal: "border-normal",
  warning: "border-warning",
  critical: "border-critical",
};
