import { Kicker } from "@/components/ui/Kicker";
import type { StationConsoleData } from "../queries";

type Props = { reports: StationConsoleData["dsp"]["reports"] };

// Донесения, которые ДСП уже отправил ДНЦ, машинистам и службам.
export function DspReports({ reports }: Props) {
  return (
    <section className="flex flex-col gap-1">
      <Kicker className="mb-1">Отправленные донесения</Kicker>
      <ul>
        {reports.map((report) => (
          <li
            key={`${report.time}-${report.text}`}
            className="grid grid-cols-[44px_1fr] gap-2 border-line border-t py-[5px] text-[12.5px]"
          >
            <span className="text-neutral-600">{report.time}</span>
            <span>{report.text}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
