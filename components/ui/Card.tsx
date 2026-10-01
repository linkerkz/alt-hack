import type { ComponentProps } from "react";

type Props = ComponentProps<"div"> & {
  // accent — главная карточка экрана («наша станция»), обводка акцентом.
  emphasis?: "default" | "accent";
  elevation?: "none" | "sm" | "md" | "lg";
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
  const border = emphasis === "accent" ? "border-accent" : "border-line";
  return (
    <div
      className={`rounded border bg-paper ${border} ${ELEVATION_CLASS[elevation]} ${className}`}
      {...props}
    />
  );
}
