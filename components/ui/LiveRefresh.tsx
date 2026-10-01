"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

// Как часто экран перечитывает базу: пульт, пейджер и чеклист по QR видят
// действия друг друга без перезагрузки.
const INTERVAL_MS = 3000;

// Автообновление экрана: серверные компоненты перерисовываются по свежим
// данным, состояние на клиенте (раскрытые списки, прокрутка) сохраняется.
// Скрытая вкладка базу не опрашивает, а вернувшись — обновляется сразу.
export function LiveRefresh() {
  const router = useRouter();

  useEffect(() => {
    function refresh() {
      if (document.visibilityState === "visible") router.refresh();
    }
    const timer = setInterval(refresh, INTERVAL_MS);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [router]);

  return null;
}
