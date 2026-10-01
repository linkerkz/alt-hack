import { Kicker } from "@/components/ui/Kicker";
import { StatusGlyph } from "@/components/ui/StatusGlyph";
import { TONE_TEXT_CLASS } from "@/components/ui/tone";
import type { StationConsoleData } from "../queries";
import { ConsoleLink } from "./ConsoleLink";
import { SelectedOption } from "./SelectedOption";

type Props = {
  comparison: StationConsoleData["comparison"];
};

type Head = StationConsoleData["comparison"]["heads"][number];

// Варианты перепланирования рядом с «ничего не менять»: колонка на вариант,
// лучшее значение в строке выделено. Пока решение не принято, вариант можно выбрать.
export function OptionComparison({ comparison }: Props) {
  const { note, decided, heads, rows, selected } = comparison;

  return (
    <section className="flex flex-col gap-2.5">
      <div className="flex items-baseline justify-between gap-2">
        <Kicker>Варианты перепланирования</Kicker>
        <span className="text-[11px] text-accent-700">{note}</span>
      </div>
      <div className={decided ? "opacity-75" : ""}>
        <div className="grid grid-cols-[100px_repeat(3,minmax(0,1fr))] text-[12.5px]">
          <span />
          {heads.map((head) => (
            <OptionHead key={head.id} head={head} />
          ))}
          {rows.map((row) => (
            <div key={row.label} className="contents">
              <span className="border-line border-t py-[5px] pr-1.5 text-[12px] text-muted">
                {row.label}
              </span>
              {row.cells.map((cell, i) => (
                <span
                  key={heads[i].id}
                  className={`border-line border-t px-2 py-[5px] ${heads[i].selected ? "bg-accent-100" : ""} ${cell.best ? "font-semibold" : ""} ${cell.status == null ? "" : TONE_TEXT_CLASS[cell.status]}`}
                >
                  {cell.status != null && <StatusGlyph tone={cell.status} />}{" "}
                  {cell.text}
                </span>
              ))}
            </div>
          ))}
        </div>
        <SelectedOption option={selected} />
      </div>
    </section>
  );
}

function OptionHead({ head }: { head: Head }) {
  const className = `flex flex-col gap-0.5 border-t-2 px-2 pt-2 pb-1.5 text-left ${
    head.selected ? "border-accent bg-accent-100" : "border-transparent"
  }`;
  const content = (
    <>
      <span className="font-heading font-semibold text-[15px] leading-tight">
        {head.name}
      </span>
      <span
        className={`text-[10.5px] ${head.recommended ? "text-accent-700" : "text-neutral-600"}`}
      >
        {head.caption}
      </span>
    </>
  );

  if (!head.selectable || head.id === "none") {
    return <div className={className}>{content}</div>;
  }
  return (
    <ConsoleLink
      patch={{ option: head.id }}
      aria-current={head.selected ? "true" : undefined}
      className={`${className} hover:bg-accent-100`}
    >
      {content}
    </ConsoleLink>
  );
}
