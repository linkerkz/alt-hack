import { Kicker } from "@/components/ui/Kicker";

// Пейджер без наряда: ждёт, экран обновляется сам.
export function PagerIdle() {
  return (
    <section className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
      <span className="size-3 animate-pulse rounded-full bg-normal" />
      <Kicker>На связи</Kicker>
      <p className="font-heading font-semibold text-[30px] leading-tight">
        Нарядов нет
      </p>
      <p className="max-w-xs text-[14px] text-muted">
        Новый наряд придёт сам — со звуком и вибрацией. Коснитесь экрана один
        раз, чтобы браузер разрешил звук.
      </p>
    </section>
  );
}
