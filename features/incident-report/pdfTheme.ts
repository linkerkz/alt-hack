import { TONE_COLOR } from "@/components/ui/tone";

// Цвета темы для PDF: react-pdf не знает классов Tailwind, поэтому значения —
// те же, что в app/globals.css.
export const PDF_COLOR = {
  ink: "#141b26",
  muted: "#5a6577",
  secondary: "#6b7586",
  body: "#363f4d",
  line: "#dcdee1",
  paper: "#f4f6f9",
  accent: "#1d50b4",
  ...TONE_COLOR,
};
