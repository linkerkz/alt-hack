import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  variant?: "neutral" | "accent" | "outline";
};

const VARIANT_CLASS = {
  neutral: "bg-neutral-100 text-neutral-800",
  accent: "bg-accent-100 text-accent-800",
  outline: "border border-accent text-accent-700",
};

// Небольшая метка: роль, тип станции, «Фокус · И-0417».
export function Tag({ children, variant = "neutral" }: Props) {
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-[3px] px-2.5 py-0.5 text-[11px] tracking-[0.02em] ${VARIANT_CLASS[variant]}`}
    >
      {children}
    </span>
  );
}
