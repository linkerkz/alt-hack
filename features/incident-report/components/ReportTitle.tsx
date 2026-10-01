import { Kicker } from "@/components/ui/Kicker";
import { REPORT_STATE_LABEL } from "../status";
import type { IncidentReport } from "../types";

type Props = Pick<IncidentReport, "code" | "state" | "title" | "summary">;

export function ReportTitle({ code, state, title, summary }: Props) {
  return (
    <header className="flex flex-col gap-1.5">
      <Kicker tone="accent">
        Отчёт по инциденту {code} · {REPORT_STATE_LABEL[state]}
      </Kicker>
      <h1 className="font-heading font-semibold text-[34px] leading-[1.15] tracking-[-0.02em]">
        {title}
      </h1>
      <p className="max-w-[680px] text-justify text-[15px] text-neutral-800">
        {summary}
      </p>
    </header>
  );
}
