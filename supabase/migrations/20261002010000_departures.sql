-- Отправление поезда: ДСП задал маршрут отправления и уведомил машиниста.
-- Пишется в хронологию станции с ключом операции плана: по нему пульт
-- видит, что отправление уже дано, и уводит поезд со схемы.

alter table public.timeline_events
  -- Операция плана: «2114-departure»; null — событие не по операции.
  add column operation text;

create index timeline_events_operation_idx
  on public.timeline_events (station_id, at)
  where operation is not null;
