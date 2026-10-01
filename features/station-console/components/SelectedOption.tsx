import { GeneratedText } from "@/components/ui/GeneratedText";
import type { StationConsoleData } from "../queries";

type Props = { option: StationConsoleData["comparison"]["selected"] };

// Что меняет выбранный вариант: поезд за поездом и почему.
export function SelectedOption({ option }: Props) {
  return (
    <div className="mt-3 flex flex-col gap-2 rounded border border-accent px-3.5 py-3">
      <div className="flex items-baseline justify-between gap-2">
        <span className="font-heading font-semibold text-[18px]">
          {option.name}: что меняется
        </span>
        <span className="text-[11px] text-accent-700">
          {option.recommendation}
        </span>
      </div>
      <dl className="grid grid-cols-[52px_1fr] gap-x-2.5 gap-y-1 text-[13px]">
        {option.changes.map((change) => (
          <div key={change.train} className="contents">
            <dt className="font-semibold">{change.train}</dt>
            <dd>{change.text}</dd>
          </div>
        ))}
      </dl>
      <GeneratedText
        text={option.why}
        storageKey={option.adviceKey}
        className="text-justify text-[12.5px] text-neutral-800 italic"
      />
      <span className="text-[11px] text-neutral-600">
        Новый маршрут показан пунктиром на схеме и в плане.
      </span>
    </div>
  );
}
