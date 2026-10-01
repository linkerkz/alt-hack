-- Модель сети вместо моков карты: диспетчерские круги, станции с координатами
-- и показателями, участки, поезда с остановками. Время остановок — минуты от
-- текущего момента: демо-сеть всегда «живёт сейчас». Данные — в seed-network.sql.

create type public.station_kind as enum ('sorting', 'passenger', 'freight', 'junction');

-- Сбои других станций сети: на них нет живого сценария, но карта их показывает.
alter type public.incident_kind add value 'breakdown';
alter type public.incident_kind add value 'route_conflict';
alter type public.incident_kind add value 'resource_shortage';

create table public.dispatch_areas (
  id text primary key,
  name text not null
);

-- Деление сети на круги условное, под демо; станции ссылаются на круг.
insert into public.dispatch_areas (id, name) values
  ('almaty', 'Алматинский круг'),
  ('semey', 'Семейский круг'),
  ('shymkent', 'Шымкентский круг'),
  ('kyzylorda', 'Кызылординский круг'),
  ('aktobe', 'Западный круг'),
  ('karaganda', 'Карагандинский круг'),
  ('astana', 'Астанинский круг');

alter table public.stations
  add constraint stations_dispatch_area_fk foreign key (dispatch_area_id)
    references public.dispatch_areas (id);

-- Показатели станции — снимок под демо; индекс живой станции считает пульт.
alter table public.stations
  add column code text,
  add column kind public.station_kind,
  add column lat double precision,
  add column lon double precision,
  add column efficiency_index int check (efficiency_index between 0 and 100),
  add column train_count int,
  add column track_load int,
  add column avg_delay_minutes int,
  add column conflict_count int;

create table public.sections (
  id text primary key,                 -- «almaty-1--shu»
  from_id text not null references public.stations (id),
  to_id text not null references public.stations (id),
  status public.status not null default 'normal',
  note text
);

-- Маршрут поезда по сети. arrival_min = departure_min — проходит без остановки.
create table public.train_stops (
  train_number text not null references public.trains (number) on delete cascade,
  position int not null,
  station_id text not null references public.stations (id),
  arrival_min int not null,
  departure_min int not null,
  primary key (train_number, position),
  constraint train_stops_order check (arrival_min <= departure_min)
);

alter table public.dispatch_areas enable row level security;
alter table public.sections enable row level security;
alter table public.train_stops enable row level security;

create policy "Вошедший пользователь читает" on public.dispatch_areas
  for select to authenticated using (true);
create policy "Вошедший пользователь читает" on public.sections
  for select to authenticated using (true);
create policy "Вошедший пользователь читает" on public.train_stops
  for select to authenticated using (true);
