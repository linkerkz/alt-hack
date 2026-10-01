"use client";

import { Button } from "@/components/ui/Button";

// PDF — через печать браузера: «Сохранить как PDF» в диалоге печати.
export function PrintButton() {
  return (
    <Button variant="primary" onClick={() => window.print()}>
      Печать / PDF
    </Button>
  );
}
