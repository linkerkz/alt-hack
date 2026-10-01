import { Kicker } from "@/components/ui/Kicker";
import type { StationConsoleData } from "../queries";
import { PROGRESS_CLASS } from "../status";

type Props = { chain: StationConsoleData["chain"] };

// Путь решения: кто уже выполнил свою часть, чей ход следующий.
export function DecisionChain({ chain }: Props) {
  return (
    <section className="flex flex-col gap-2">
      <Kicker>Путь решения</Kicker>
      <ol
        className="grid gap-1"
        style={{
          gridTemplateColumns: `repeat(${chain.length}, minmax(0, 1fr))`,
        }}
      >
        {chain.map((link) => {
          const style = PROGRESS_CLASS[link.state];
          return (
            <li
              key={`${link.who}-${link.what}`}
              className="flex flex-col gap-[3px]"
            >
              <span className={`h-[3px] ${style.bar}`} />
              <span
                className={`font-semibold text-[11.5px] [overflow-wrap:anywhere] ${style.text}`}
              >
                {style.mark} {link.who}
              </span>
              <span
                className={`text-[10.5px] leading-tight [overflow-wrap:anywhere] ${style.text}`}
              >
                {link.what}
              </span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
