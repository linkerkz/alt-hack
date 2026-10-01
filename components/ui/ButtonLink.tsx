import Link from "next/link";
import type { ComponentProps } from "react";
import { type ButtonSize, type ButtonVariant, buttonClass } from "./Button";

type Props = ComponentProps<typeof Link> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

// Переход, который выглядит как кнопка: «Открыть пульт станции →».
// Без предзагрузки: страницы приложения динамические, а на экранах с
// LiveRefresh каждое обновление заново предзагружало бы все ссылки.
export function ButtonLink({
  variant = "secondary",
  size = "md",
  className = "",
  prefetch = false,
  ...props
}: Props) {
  return (
    <Link
      className={`${buttonClass(variant, size)} ${className}`}
      prefetch={prefetch}
      {...props}
    />
  );
}
