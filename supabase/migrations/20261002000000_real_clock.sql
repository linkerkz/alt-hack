-- Хронология — по реальным часам: сценарий сбоя больше не идёт в демо-часе
-- 14:00. Триггеры ответов путейцев и этапов наряда по-прежнему зовут
-- sim_at(minute), но время теперь — момент записи; минуту не используем.
create or replace function public.sim_at(minute int) returns timestamptz
language sql stable
set search_path = ''
as $$
  select now()
$$;
