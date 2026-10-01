import type { ComponentProps } from "react";
import { FIREFOX_NO_RESTORE } from "./noRestore";

type Props = ComponentProps<"button"> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

// primary — главное действие экрана, единственная заливка в теме;
// secondary — тонкая линия, ghost — только текст акцентом.
export type ButtonVariant = "primary" | "secondary" | "ghost";
export type ButtonSize = "md" | "sm" | "icon";

export function Button({
  variant = "secondary",
  size = "md",
  className = "",
  type = "button",
  ...props
}: Props) {
  return (
    <button
      type={type}
      {...FIREFOX_NO_RESTORE}
      className={`${buttonClass(variant, size)} ${className}`}
      {...props}
    />
  );
}

const BASE =
  "inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-md border font-medium leading-tight transition-colors disabled:cursor-not-allowed disabled:opacity-45";

const VARIANT_CLASS: Record<ButtonVariant, string> = {
  primary:
    "border-accent-600 bg-accent-600 text-white shadow-sm hover:border-accent-700 hover:bg-accent-700 active:bg-accent-800",
  secondary:
    "border-neutral-300 bg-card text-ink hover:border-neutral-400 hover:bg-neutral-100 active:bg-neutral-200",
  ghost:
    "border-transparent text-accent-700 hover:bg-accent/10 active:bg-accent/18",
};

const SIZE_CLASS: Record<ButtonSize, string> = {
  md: "px-4 py-2 text-[14px]",
  sm: "px-2.5 py-1 text-[12.5px]",
  icon: "size-9 text-lg",
};

// Общий вид кнопки: им же оформлены ссылки-кнопки (ButtonLink).
export function buttonClass(variant: ButtonVariant, size: ButtonSize) {
  return `${BASE} ${VARIANT_CLASS[variant]} ${SIZE_CLASS[size]}`;
}
