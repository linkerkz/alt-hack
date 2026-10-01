-- Запрос на согласование: ДНЦ отвечает на вариант Б с карты сети, а не с
-- пульта станции. Пишет по-прежнему только сервер секретным ключом.

alter table public.incidents
  -- ДНЦ отклонил вариант Б: ДСЦС выбирает другой; null — не отклонял.
  add column dnc_rejected_at timestamptz,
  -- Комментарий ДНЦ для станции к согласованию или отказу.
  add column dnc_comment text check (char_length(dnc_comment) <= 200);

-- Диспетчерский круг станции: сервер пускает ответить только ДНЦ этого круга.
alter table public.stations add column dispatch_area_id text;

update public.stations set dispatch_area_id = 'almaty' where id = 'almaty-1';
