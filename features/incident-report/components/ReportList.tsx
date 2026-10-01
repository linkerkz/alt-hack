import { Heading } from "@/components/ui/Heading";

type Props = { title: string; items: string[] };

// Раздел отчёта простым списком: решения, согласования, работы.
export function ReportList({ title, items }: Props) {
  return (
    <section className="flex flex-col gap-1 text-[13px]">
      <Heading className="mb-1">{title}</Heading>
      <ul className="flex flex-col gap-1">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}
