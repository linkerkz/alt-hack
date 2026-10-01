import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  tone?: "muted" | "accent";
  className?: string;
};

// Надзаголовок капителью: «Зона ответственности», «Наша станция · ведёт система».
export function Kicker({ children, tone = "muted", className = "" }: Props) {
  const color = tone === "accent" ? "text-accent-700" : "text-muted";
  return (
    <p
      className={`text-[10.5px] uppercase leading-tight tracking-[0.1em] ${color} ${className}`}
    >
      {children}
    </p>
  );
}
