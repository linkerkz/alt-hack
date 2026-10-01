import { buttonClass } from "@/components/ui/Button";
import {
  TONE_BORDER_CLASS,
  TONE_GLYPH,
  TONE_TEXT_CLASS,
  type Tone,
} from "@/components/ui/tone";
import { INCIDENT } from "../mock";
import { ConsoleLink } from "./ConsoleLink";

type Props = {
  code: string;
  title: string;
  suggestion: string;
  tone: Tone;
};

// Полоса над пультом: новый инцидент, пока диспетчер на вкладке обзора.
export function IncidentBanner(props: Props) {
  const { code, title, suggestion, tone } = props;
  return (
    <div
      className={`flex flex-wrap items-center gap-x-[18px] gap-y-2 border-t-2 border-b px-5 py-2.5 ${TONE_BORDER_CLASS[tone]}`}
    >
      <span
        className={`whitespace-nowrap text-[11px] uppercase tracking-[0.08em] ${TONE_TEXT_CLASS[tone]}`}
      >
        {TONE_GLYPH[tone]} Новый инцидент · {code} · {INCIDENT.detectedAt}
      </span>
      <span className="font-heading font-semibold text-[19px]">{title}</span>
      <span className="text-[13px] text-neutral-800">{suggestion}</span>
      <ConsoleLink
        patch={{ tab: "incident", focus: true, panel: true }}
        className={`${buttonClass("primary", "md")} ml-auto`}
      >
        Открыть инцидент
      </ConsoleLink>
    </div>
  );
}
