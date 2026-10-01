-- Живой пульт: ход решения по инциденту хранится в самом инциденте, а не в
-- URL. Шаг сценария на пульте выводится из статуса инцидента и его наряда.
-- Пишет только сервер (Server Actions пульта) секретным ключом, проверив роль,
-- поэтому политик записи нет: с клиента таблицы по-прежнему только читаются.

alter table public.incidents
  -- Выбранный ДСЦС вариант перепланирования; null — ещё не выбран.
  add column option text check (option in ('A', 'B')),
  -- Вариант Б задерживает поезд у соседа и требует согласования ДНЦ.
  add column dnc_approved_at timestamptz,
  -- Поезда, приём которых ДСП подтвердил по новому плану: «r101», «r2001».
  add column route_tasks text[] not null default '{}';

-- Наряды по инциденту ищем по его uuid (в work_orders.incident_id — текстом).
create index work_orders_incident_idx on public.work_orders (incident_id);
