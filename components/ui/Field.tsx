import type { ComponentProps } from "react";

type Props = ComponentProps<"input"> & {
  label: string;
};

// Поле формы: подпись над рамкой, фокус — акцентом.
export function Field({ label, className = "", ...props }: Props) {
  return (
    <label className="block">
      <span className="mb-1 block text-[12px] text-ink/70">{label}</span>
      <input
        className={`min-h-9 w-full rounded border border-line bg-transparent px-2.5 py-1.5 text-[14px] text-ink caret-accent outline-none hover:border-ink/45 focus-visible:border-accent ${className}`}
        {...props}
      />
    </label>
  );
}
