import Link from "next/link";
import { STEP } from "../mock";
import { consoleHref } from "../state";
import type { ConsoleState } from "../types";

type Props = {
  state: ConsoleState;
  stepName: string;
};

// Пульт демо: листает сценарий за участников, чьих экранов ещё нет (ДСП, ДНЦ,
// ремонтная служба). Шаг хранится в URL.
export function DemoBar({ state, stepName }: Props) {
  const { step } = state;

  return (
    <div className="fixed bottom-3.5 left-1/2 z-40 flex max-w-[calc(100vw-28px)] -translate-x-1/2 flex-wrap items-center gap-2.5 whitespace-nowrap rounded-[7px] bg-neutral-900 px-3 py-2 text-[13px] text-neutral-100 shadow-lg">
      <span className="p-1 text-[10px] text-accent-400 uppercase tracking-[0.14em]">
        Демо
      </span>
      <DemoLink
        href={consoleHref(state, { step: step - 1 })}
        disabled={step === STEP.normal}
      >
        ←
      </DemoLink>
      <div className="flex min-w-[170px] flex-col leading-tight">
        <span className="text-[10px] text-neutral-400">
          Шаг {step} из {STEP.closed}
        </span>
        <span className="font-heading font-semibold text-[15px]">
          {stepName}
        </span>
      </div>
      <DemoLink
        href={consoleHref(state, { step: step + 1 })}
        disabled={step === STEP.closed}
        accent
      >
        Далее →
      </DemoLink>
      <span className="w-px self-stretch bg-neutral-700" />
      <DemoLink
        href={consoleHref(state, {
          step: STEP.normal,
          tab: "overview",
          focus: true,
        })}
      >
        Сброс
      </DemoLink>
    </div>
  );
}

type DemoLinkProps = {
  href: string;
  children: string;
  disabled?: boolean;
  accent?: boolean;
};

function DemoLink({
  href,
  children,
  disabled = false,
  accent = false,
}: DemoLinkProps) {
  const color = accent
    ? "border-accent-400 text-accent-300"
    : "border-neutral-600 text-neutral-100";
  const className = `rounded border px-2.5 py-1.5 font-heading font-semibold ${color}`;

  if (disabled) {
    return <span className={`${className} opacity-45`}>{children}</span>;
  }
  return (
    <Link
      href={href}
      scroll={false}
      className={`${className} hover:bg-neutral-100/10`}
    >
      {children}
    </Link>
  );
}
