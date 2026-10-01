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
      <h1 className="font-heading font-normal text-[46px] leading-[1.12] tracking-[-0.015em]">
        {title}
      </h1>
      <p className="max-w-[680px] text-justify text-[15px] text-neutral-800">
        {summary}
      </p>
    </header>
  );
}
