import { ButtonLink } from "@/components/ui/ButtonLink";
import type { ConsoleAction } from "../incident";
import { consoleHref } from "../state";
import type { ConsoleState } from "../types";

type Props = {
  action: ConsoleAction;
  statusName: string;
  state: ConsoleState;
  // Карта участка; null — роли карта недоступна.
  mapHref: string | null;
};

// «Сейчас»: что ДСЦС делает на этом этапе или чьего решения ждёт.
// Закреплена сверху панели, пока карточку прокручивают.
export function ActionCard({ action, statusName, state, mapHref }: Props) {
  const { text, primary, secondary, waiting, showMap } = action;

  return (
    <div className="sticky -top-4 z-10 flex flex-col gap-2 rounded border border-accent bg-paper p-3.5 shadow-sm">
      <span className="text-[11px] text-accent-700 uppercase tracking-[0.08em]">
        Сейчас · {statusName}
      </span>
      <p className="text-justify text-[14px]">{text}</p>
      <div className="flex flex-wrap items-center gap-2">
        {primary != null && (
          <ButtonLink
            href={consoleHref(state, { step: primary.step })}
            scroll={false}
            variant="primary"
          >
            {primary.label}
          </ButtonLink>
        )}
        {secondary != null && (
          <ButtonLink
            href={consoleHref(state, { step: secondary.step })}
            scroll={false}
          >
            {secondary.label}
          </ButtonLink>
        )}
        {showMap && mapHref != null && (
          <ButtonLink href={mapHref}>Открыть карту участка</ButtonLink>
        )}
        {waiting != null && (
          <span className="flex items-center gap-2 text-[13px] text-accent-700">
            <span className="size-3.5 animate-spin rounded-full border-2 border-accent-300 border-t-accent-600" />
            {waiting}
          </span>
        )}
      </div>
    </div>
  );
}
