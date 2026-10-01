import Link from "next/link";
import { GeneratedText } from "@/components/ui/GeneratedText";
import { StatusGlyph } from "@/components/ui/StatusGlyph";
import { TONE_TEXT_CLASS } from "@/components/ui/tone";
import type { StationConsoleData } from "../queries";
import { consoleHref } from "../state";
import type { ChosenOption, ConsoleState } from "../types";

type Props = {
  comparison: StationConsoleData["comparison"];
  state: ConsoleState;
};

type Head = Props["comparison"]["heads"][number];

// Вариант, который можно выбрать: не «ничего не менять».
type OptionHead = Head & { id: ChosenOption };

// Выбор варианта в ходе ДСЦС: плитки А / Б с главными цифрами рядом с
// «ничего не менять», что меняет выбранный и рекомендация ИИ. Переключение — только вид
// (URL); в базу уходит кнопка «Принять».
export function OptionPicker({ comparison, state }: Props) {
  const { heads, selected } = comparison;
  const baseline = heads.find((head) => head.id === "none");
  const options = heads.filter(
    (head): head is OptionHead => head.id !== "none",
  );

  return (
    <div className="flex flex-col gap-2.5">
      {baseline != null && (
        <p className="text-[12px] text-muted">
          Если ничего не менять — индекс{" "}
          <span className={TONE_TEXT_CLASS[baseline.status]}>
            <StatusGlyph tone={baseline.status} /> {baseline.index}
          </span>
          , задержка до {baseline.maxDelay} мин
        </p>
      )}
      <div className="grid grid-cols-2 gap-1.5">
        {options.map((head) => (
          <OptionTile key={head.id} head={head} state={state} />
        ))}
      </div>
      <dl className="grid grid-cols-[44px_1fr] gap-x-2.5 gap-y-1 text-[13px]">
        {selected.changes.map((change) => (
          <div key={change.train} className="contents">
            <dt className="font-semibold">{change.train}</dt>
            <dd>{change.text}</dd>
          </div>
        ))}
      </dl>
      <GeneratedText
        text={selected.why}
        storageKey={selected.adviceKey}
        className="text-[12.5px] text-neutral-800 italic"
      />
    </div>
  );
}

function OptionTile({
  head,
  state,
}: {
  head: OptionHead;
  state: ConsoleState;
}) {
  return (
    <Link
      prefetch={false}
      href={consoleHref(state, { option: head.id })}
      scroll={false}
      aria-current={head.selected ? "true" : undefined}
      className={`flex flex-col gap-0.5 rounded border px-3 py-2 ${head.selected ? "border-accent-700 bg-accent-100 shadow-[inset_0_0_0_1px_var(--color-accent-700)]" : "border-line hover:border-accent"}`}
    >
      <span className="flex items-baseline justify-between gap-2">
        <span className="font-heading font-semibold text-[16px]">
          {head.name}
        </span>
        <span
          className={`font-heading text-[22px] leading-none ${TONE_TEXT_CLASS[head.status]}`}
        >
          {head.index}
        </span>
      </span>
      <span className="text-[11px] text-accent-700">{head.caption}</span>
      <span className="text-[11.5px] text-neutral-800">
        задержка до {head.maxDelay} мин · ДНЦ: {head.dncApproval}
      </span>
    </Link>
  );
}
