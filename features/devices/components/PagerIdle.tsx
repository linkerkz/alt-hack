// Пейджер без открытых сообщений: ждёт, экран обновляется сам.
export function PagerIdle() {
  return (
    <section className="flex flex-1 flex-col items-center justify-center gap-3 py-8 text-center">
      <span className="size-3 animate-pulse rounded-full bg-device-ok" />
      <p className="font-bold text-[26px] uppercase tracking-[0.06em]">
        Заданий нет
      </p>
      <p className="max-w-xs text-[13px] text-device-dim">
        Вызов или задача от ДСП придёт со звуком и вибрацией — коснитесь экрана,
        чтобы включить звук сигнала.
      </p>
    </section>
  );
}
