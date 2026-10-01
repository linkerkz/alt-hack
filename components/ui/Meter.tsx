type Props = {
  // Части полосы: доля 0–100 и класс заливки (TONE_BG_CLASS или bg-accent).
  parts: { value: number; className: string }[];
  label?: string;
};

// Тонкая полоса долей: заполнение показателя или разбивка по состояниям.
export function Meter({ parts, label }: Props) {
  return (
    <div
      role="img"
      aria-label={label}
      className="flex h-1 overflow-hidden rounded-full bg-neutral-200"
    >
      {parts.map((part, index) => (
        <div
          // Порядок частей фиксирован вызывающим кодом.
          // biome-ignore lint/suspicious/noArrayIndexKey: части без собственного id
          key={index}
          className={part.className}
          style={{ width: `${part.value}%` }}
        />
      ))}
    </div>
  );
}
