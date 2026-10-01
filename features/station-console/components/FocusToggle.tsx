"use client";

import { buttonClass } from "@/components/ui/Button";
import { Tag } from "@/components/ui/Tag";
import { ConsoleLink } from "./ConsoleLink";
import { useConsoleView } from "./ConsoleView";

// Над схемой: включить фокус на инциденте или показать всю станцию.
export function FocusToggle({ incidentCode }: { incidentCode: string }) {
  const { canFocus, isFocused } = useConsoleView();
  if (!canFocus) return null;

  return (
    <div className="ml-auto flex flex-none items-center gap-2.5">
      {isFocused && <Tag variant="outline">Фокус · {incidentCode}</Tag>}
      <ConsoleLink
        patch={{ focus: !isFocused }}
        className={buttonClass("ghost", "sm")}
      >
        {isFocused ? "Показать всю станцию" : "Фокус на инциденте"}
      </ConsoleLink>
    </div>
  );
}
