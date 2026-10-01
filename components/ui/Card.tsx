import type { ComponentProps } from "react";

type Props = ComponentProps<"div"> & {
  // accent — главная карточка экрана («наша станция»), обводка акцентом;
  // critical — карточка сбоя, обводка цветом «Критично».
  emphasis?: "default" | "accent" | "critical";
  elevation?: "none" | "sm" | "md" | "lg";
};

const EMPHASIS_CLASS = {
  default: "border-line",
  accent: "border-accent",
  critical: "border-critical",
};

const ELEVATION_CLASS = {
  none: "",
  sm: "shadow-sm",
  md: "shadow-md",
  lg: "shadow-lg",
};

// Поверхность без заливки: тонкая рамка на бумаге, тень — едва заметная.
export function Card({
  emphasis = "default",
  elevation = "none",
  className = "",
  ...props
}: Props) {
  return (
    <div
      className={`rounded border bg-paper ${EMPHASIS_CLASS[emphasis]} ${ELEVATION_CLASS[elevation]} ${className}`}
      {...props}
    />
  );
}
