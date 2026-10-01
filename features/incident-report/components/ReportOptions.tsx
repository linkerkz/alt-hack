import { Heading } from "@/components/ui/Heading";
import { Table } from "@/components/ui/Table";
import { approvalLabel } from "../status";
import type { ReportOption } from "../types";

// Рассмотренные варианты перепланирования; выбранный — с пометкой «принят».
export function ReportOptions({ options }: { options: ReportOption[] }) {
  return (
    <section className="flex flex-col gap-1.5">
      <Heading>Рассмотренные варианты</Heading>
      <Table>
        <thead>
          <tr>
            <th>Вариант</th>
            <th>Индекс</th>
            <th>Макс. задержка</th>
            <th>ДНЦ</th>
          </tr>
        </thead>
        <tbody>
          {options.map((option) => (
            <tr key={option.name}>
              <td>
                {option.chosen ? (
                  <>
                    <span className="font-semibold">{option.name}</span> ·
                    принят
                  </>
                ) : (
                  option.name
                )}
              </td>
              <td>{option.index}</td>
              <td>{option.maxDelayMinutes} мин</td>
              <td>{approvalLabel(option.needsApproval)}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </section>
  );
}
