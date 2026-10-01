-- Наряд для ремонтной службы и его чеклист. Рабочий открывает наряд по QR
-- без входа: доступ даёт uuid в ссылке, в базу ходит сервер секретным
-- ключом. Поэтому RLS включён без политик: напрямую с клиента таблицы закрыты.

create type public.work_order_status as enum (
  'issued',       -- выдан
  'in_progress',  -- в работе
  'done',         -- работы выполнены (отметила служба)
  'returned'      -- объект возвращён в эксплуатацию (решил ДСП)
);

create table public.work_orders (
  id uuid primary key default gen_random_uuid(),
  station_id text not null,
  -- инциденты пока живут в моках, поэтому текст, а не внешний ключ
  incident_id text,
  object_id text not null,
  service text not null check (service in ('signalling', 'track', 'power')),
  title text not null,
  description text not null,
  status public.work_order_status not null default 'issued',
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  started_at timestamptz,
  done_at timestamptz,
  result_note text
);

create table public.work_order_items (
  id uuid primary key default gen_random_uuid(),
  work_order_id uuid not null references public.work_orders (id) on delete cascade,
  position int not null,
  text text not null,
  -- пункт отмечен = есть время отметки
  done_at timestamptz,
  unique (work_order_id, position)
);

alter table public.work_orders enable row level security;
alter table public.work_order_items enable row level security;
