import type { ComponentProps } from "react";

type Props = ComponentProps<"div"> & {
  // accent — главная карточка экрана («наша станция»), обводка акцентом;
  // critical — карточка сбоя, обводка цветом «Критично».
  emphasis?: "default" | "accent" | "critical";
  elevation?: "none" | "sm" | "md" | "lg";
};

const EMPHASIS_CLASS = {
  default: "border-line",
  accent: "border-accent-300 ring-1 ring-accent-300",
  critical: "border-critical/60 ring-1 ring-critical/60",
};

const ELEVATION_CLASS = {
  none: "",
  sm: "shadow-sm",
  md: "shadow-md",
  lg: "shadow-lg",
};

// Белая поверхность на светлом фоне: тонкая рамка, тень — едва заметная.
export function Card({
  emphasis = "default",
  elevation = "none",
  className = "",
  ...props
}: Props) {
  return (
    <div
      className={`rounded-lg border bg-card ${EMPHASIS_CLASS[emphasis]} ${ELEVATION_CLASS[elevation]} ${className}`}
      {...props}
    />
  );
}
