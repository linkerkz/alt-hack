"use client";

import { useEffect } from "react";

// Экран устройства не гаснет, пока оно открыто: камера следит, пейджер ждёт
// наряд. Браузер снимает блокировку, когда вкладку скрыли, — берём заново.
export function KeepAwake() {
  useEffect(() => {
    let lock: WakeLockSentinel | null = null;

    async function request() {
      if (document.visibilityState !== "visible") return;
      if (!("wakeLock" in navigator)) return;
      try {
        lock = await navigator.wakeLock.request("screen");
      } catch {
        // Батарея на исходе или запрет браузера — экран просто погаснет сам.
      }
    }

    request();
    document.addEventListener("visibilitychange", request);
    return () => {
      document.removeEventListener("visibilitychange", request);
      lock?.release();
    };
  }, []);

  return null;
}
