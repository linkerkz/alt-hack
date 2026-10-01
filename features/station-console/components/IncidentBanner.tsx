import { ButtonLink } from "@/components/ui/ButtonLink";
import {
  TONE_BORDER_CLASS,
  TONE_GLYPH,
  TONE_TEXT_CLASS,
  type Tone,
} from "@/components/ui/tone";
import { consoleHref } from "../state";
import type { ConsoleState } from "../types";

type Props = {
  code: string;
  detectedAt: string;
  title: string;
  suggestion: string;
  tone: Tone;
  state: ConsoleState;
};

// Полоса над пультом: новый инцидент, пока диспетчер на вкладке обзора.
export function IncidentBanner(props: Props) {
  const { code, detectedAt, title, suggestion, tone, state } = props;
  return (
    <div
      className={`flex flex-wrap items-center gap-x-[18px] gap-y-2 border-t-2 border-b px-5 py-2.5 ${TONE_BORDER_CLASS[tone]}`}
    >
      <span
        className={`whitespace-nowrap text-[11px] uppercase tracking-[0.08em] ${TONE_TEXT_CLASS[tone]}`}
      >
        {TONE_GLYPH[tone]} Новый инцидент · {code} · {detectedAt}
      </span>
      <span className="font-heading font-semibold text-[19px]">{title}</span>
      <span className="text-[13px] text-neutral-800">{suggestion}</span>
      <ButtonLink
        href={consoleHref(state, { tab: "incident", focus: true, panel: true })}
        scroll={false}
        variant="primary"
        className="ml-auto"
      >
        Открыть инцидент
      </ButtonLink>
    </div>
  );
}
