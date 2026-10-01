"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";

// Как поставить устройство на домашний экран: iOS — только через «Поделиться»,
// Chrome на Android — своей кнопкой, остальные — через меню браузера.
type Mode = "installed" | "ios" | "prompt" | "menu";

// Подсказка установки PWA. Уже установленное приложение её не видит.
export function InstallHint() {
  const [mode, setMode] = useState<Mode>("installed");
  const [install, setInstall] = useState<(() => void) | null>(null);

  useEffect(() => {
    if (isStandalone()) return;
    setMode(/iPhone|iPad|iPod/.test(navigator.userAgent) ? "ios" : "menu");

    function onPrompt(event: Event) {
      event.preventDefault();
      if (!("prompt" in event) || typeof event.prompt !== "function") return;
      const prompt = event.prompt.bind(event);
      setInstall(() => () => prompt());
      setMode("prompt");
    }
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  if (mode === "installed") return null;
  return (
    <aside className="flex items-center justify-between gap-3 rounded-[4px] border border-accent px-3 py-2 text-[13px]">
      <span>{HINT[mode]}</span>
      {mode === "prompt" && install != null && (
        <Button variant="primary" size="sm" onClick={install}>
          Установить
        </Button>
      )}
      <Button variant="ghost" size="sm" onClick={() => setMode("installed")}>
        Скрыть
      </Button>
    </aside>
  );
}

const HINT: Record<Exclude<Mode, "installed">, string> = {
  ios: "Поставьте на экран: «Поделиться» → «На экран „Домой“».",
  prompt: "Поставьте устройство на экран — откроется как приложение.",
  menu: "Поставьте на экран: меню браузера → «Установить приложение».",
};

function isStandalone() {
  const iosStandalone = "standalone" in navigator && navigator.standalone;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    iosStandalone === true
  );
}
