"use client";

import Link from "next/link";
import type { ComponentProps, MouseEvent } from "react";
import type { ViewPatch } from "../view";
import { useConsoleView } from "./ConsoleView";

type Props = Omit<ComponentProps<"a">, "href" | "onClick"> & {
  patch: ViewPatch;
};

// Ссылка на другой вид пульта. Вкладка, фокус и панель меняются через
// History API — мгновенно, без запроса к серверу. Смена варианта пересчитывает
// данные, поэтому идёт обычным переходом Next.
export function ConsoleLink({ patch, ...props }: Props) {
  const { hrefFor } = useConsoleView();
  const href = hrefFor(patch);

  if (patch.option != null) {
    return <Link prefetch={false} scroll={false} href={href} {...props} />;
  }

  function open(event: MouseEvent<HTMLAnchorElement>) {
    if (!isPlainClick(event)) return;
    event.preventDefault();
    window.history.pushState(null, "", href);
  }
  return <a href={href} onClick={open} {...props} />;
}

// Клик с модификатором открывает ссылку в новой вкладке — его не трогаем.
function isPlainClick(event: MouseEvent) {
  const { button, metaKey, ctrlKey, shiftKey, altKey } = event;
  return button === 0 && !metaKey && !ctrlKey && !shiftKey && !altKey;
}
