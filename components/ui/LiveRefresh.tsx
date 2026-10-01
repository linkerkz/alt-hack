"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

// Как часто экран перечитывает базу: участники видят действия друг друга
// без перезагрузки.
const INTERVAL_MS = 3000;

// Автообновление экрана: серверные компоненты перерисовываются по свежим
// данным, состояние на клиенте (раскрытые списки, прокрутка) сохраняется.
// Скрытая вкладка базу не опрашивает.
export function LiveRefresh() {
  const router = useRouter();

  useEffect(() => {
    const timer = setInterval(() => {
      if (document.visibilityState === "visible") router.refresh();
    }, INTERVAL_MS);
    return () => clearInterval(timer);
  }, [router]);

  return null;
}
