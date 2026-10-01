import Link from "next/link";
import type { ComponentProps } from "react";
import { type ButtonSize, type ButtonVariant, buttonClass } from "./Button";

type Props = ComponentProps<typeof Link> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

// Переход, который выглядит как кнопка: «Открыть пульт станции →».
export function ButtonLink({
  variant = "secondary",
  size = "md",
  className = "",
  ...props
}: Props) {
  return (
    <Link className={`${buttonClass(variant, size)} ${className}`} {...props} />
  );
}
