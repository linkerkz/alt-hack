import type { ReactNode } from "react";

type Props = {
  // Образец знака на карте: линия, точка, значок.
  swatch: ReactNode;
  children: ReactNode;
};

// Строка легенды: образец в колонке 22px и пояснение.
export function LegendItem({ swatch, children }: Props) {
  return (
    <li className="grid grid-cols-[22px_1fr] items-center gap-2">
      <span className="flex justify-center">{swatch}</span>
      <span>{children}</span>
    </li>
  );
}
