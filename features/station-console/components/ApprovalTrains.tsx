import { Table } from "@/components/ui/Table";
import type { ApprovalTrain } from "../approval";

// Затронутые поезда: задержка с удержанием (выделена) и если ничего не менять.
export function ApprovalTrains({ trains }: { trains: ApprovalTrain[] }) {
  return (
    <Table>
      <thead>
        <tr>
          <th>Затронутые поезда</th>
          <th className="bg-accent-100 text-accent-700!">С удержанием</th>
          <th>Не менять</th>
        </tr>
      </thead>
      <tbody>
        {trains.map((train) => (
          <tr key={train.train}>
            <td>
              <span className="font-semibold">{train.train}</span> {train.kind}{" "}
              · {train.what}
            </td>
            <td className={`bg-accent-100 ${delayClass(train.withHold)}`}>
              {delayText(train.withHold)}
            </td>
            <td className={delayClass(train.without)}>
              {delayText(train.without)}
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}

function delayText(minutes: number) {
  return minutes === 0 ? "0" : `+${minutes} мин`;
}

function delayClass(minutes: number) {
  return minutes > 0 ? "text-critical" : "text-ink";
}
