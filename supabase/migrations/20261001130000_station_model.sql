-- Модель станции: инфраструктура, план движения, ресурсы, инциденты и
-- хронология. Над ней система создаёт инцидент и считает его влияние.
-- Доступность объекта не хранится флагом: объект недоступен, пока по нему
-- открыт инцидент (статус не restored и не closed).

create type public.throat as enum ('odd', 'even');                -- горловина: нечётная / чётная
create type public.track_kind as enum ('main', 'receiving', 'dead_end'); -- главный / приёмо-отправочный / тупик
create type public.train_kind as enum ('passenger', 'freight');
create type public.resource_kind as enum ('shunting_locomotive', 'crew');
create type public.status as enum ('normal', 'warning', 'critical'); -- Норма / Внимание / Критично

create type public.incident_kind as enum (
  'switch_fault',    -- отказ стрелки
  'train_delay',     -- опоздание поезда
  'track_closure'    -- закрытие пути
);

-- Статусы по порядку жизни инцидента.
create type public.incident_status as enum (
  'suspected',       -- подозрение: обнаружен автоматически, объект уже закрыт
  'confirmed',       -- подтверждён ДСП или службой
  'decided',         -- решение принято
  'repairing',       -- работы выполняются
  'restored',        -- объект возвращён в эксплуатацию
  'closed'
);

create type public.incident_severity as enum ('low', 'medium', 'high');

-- Кто зафиксировал проблему.
create type public.incident_source as enum ('iot', 'dsp', 'repair_crew');

-- Кто совершил событие хронологии.
create type public.actor as enum (
  'system', 'iot', 'dsp', 'dscs', 'dnc', 'ds', 'repair_crew', 'driver'
);

create table public.stations (
  id text primary key,                 -- id станции в сети, как в profiles.station_id
  name text not null
);

create table public.tracks (
  station_id text not null references public.stations (id),
  number int not null,
  kind public.track_kind not null,
  has_platform boolean not null default false,
  primary key (station_id, number)
);

create table public.switches (
  station_id text not null references public.stations (id),
  id text not null,                    -- «С3»
  throat public.throat not null,
  primary key (station_id, id)
);

-- Маршрут между путём и горловиной: по нему поезд и прибывает, и
-- отправляется. Неисправна любая стрелка маршрута — маршрут недоступен.
create table public.routes (
  station_id text not null references public.stations (id),
  id text not null,                    -- «Н-3»: светофор и путь
  signal text not null,                -- входной светофор со стороны горловины
  throat public.throat not null,
  track int not null,
  switches text[] not null,
  primary key (station_id, id),
  foreign key (station_id, track) references public.tracks (station_id, number)
);

create table public.trains (
  number text primary key,
  kind public.train_kind not null
);

-- План занятости путей: поезд занимает путь с прибытия до отправления.
-- Время — часы демо-дня; время в симуляции ускорено.
create table public.track_plan (
  station_id text not null references public.stations (id),
  train_number text not null references public.trains (number),
  track int not null,
  entry_route text not null,
  exit_route text not null,
  arrives_at time not null,
  departs_at time not null,
  primary key (station_id, train_number),
  foreign key (station_id, track) references public.tracks (station_id, number),
  foreign key (station_id, entry_route) references public.routes (station_id, id),
  foreign key (station_id, exit_route) references public.routes (station_id, id),
  constraint track_plan_order check (arrives_at <= departs_at)
);

-- Ресурсы станции: маневровый локомотив и бригады. Бригада закреплена за поездом.
create table public.resources (
  station_id text not null references public.stations (id),
  id text not null,
  kind public.resource_kind not null,
  name text not null,
  train_number text references public.trains (number),
  primary key (station_id, id)
);

create sequence public.incident_code_seq start 417;

create table public.incidents (
  id uuid primary key default gen_random_uuid(),
  code text not null unique
    default 'И-' || lpad(nextval('public.incident_code_seq')::text, 4, '0'),
  station_id text not null references public.stations (id),
  kind public.incident_kind not null,
  object_id text not null,             -- стрелка, путь или номер поезда — по kind
  status public.incident_status not null default 'suspected',
  -- Считается по исходному сценарию «ничего не менять»; до оценки — null.
  severity public.incident_severity,
  source public.incident_source not null,
  title text not null,
  description text not null default '',
  detected_at timestamptz not null default now(),
  closed_at timestamptz
);

-- Единая хронология: основа аудита, отчётов и просмотра прошлого.
create table public.timeline_events (
  id bigint generated always as identity primary key,
  station_id text not null references public.stations (id),
  incident_id uuid references public.incidents (id),
  at timestamptz not null default now(),
  actor public.actor not null,
  text text not null,
  level public.status
);

create index incidents_open_idx on public.incidents (station_id)
  where status not in ('restored', 'closed');
create index timeline_events_station_at_idx on public.timeline_events (station_id, at);

-- Читает любой вошедший пользователь: станция одна на демо, ДНЦ смотрит
-- станции своего круга. Политики записи появятся с вебхуком и Server Actions.
alter table public.stations enable row level security;
alter table public.tracks enable row level security;
alter table public.switches enable row level security;
alter table public.routes enable row level security;
alter table public.trains enable row level security;
alter table public.track_plan enable row level security;
alter table public.resources enable row level security;
alter table public.incidents enable row level security;
alter table public.timeline_events enable row level security;

create policy "Вошедший пользователь читает" on public.stations
  for select to authenticated using (true);
create policy "Вошедший пользователь читает" on public.tracks
  for select to authenticated using (true);
create policy "Вошедший пользователь читает" on public.switches
  for select to authenticated using (true);
create policy "Вошедший пользователь читает" on public.routes
  for select to authenticated using (true);
create policy "Вошедший пользователь читает" on public.trains
  for select to authenticated using (true);
create policy "Вошедший пользователь читает" on public.track_plan
  for select to authenticated using (true);
create policy "Вошедший пользователь читает" on public.resources
  for select to authenticated using (true);
create policy "Вошедший пользователь читает" on public.incidents
  for select to authenticated using (true);
create policy "Вошедший пользователь читает" on public.timeline_events
  for select to authenticated using (true);
