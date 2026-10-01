-- Полевые устройства: камера в горловине и пейджер ремонтной бригады.
-- Устройство открывают по ссылке без входа: доступ даёт uuid, в базу ходит
-- сервер секретным ключом. Поэтому политик записи нет, как у нарядов.

create type public.device_kind as enum (
  'camera',  -- следит за объектом и сообщает о препятствии
  'pager'    -- показывает бригаде наряд её службы
);

create table public.devices (
  id uuid primary key default gen_random_uuid(),
  station_id text not null references public.stations (id),
  kind public.device_kind not null,
  name text not null,
  -- Камера: за каким объектом следит («С3»).
  object_id text,
  -- Пейджер: наряды какой службы показывает.
  service text check (service in ('signalling', 'track', 'power')),
  -- Последний сигнал устройства: видно, что оно на связи.
  last_seen_at timestamptz,
  constraint devices_kind_fields check (
    (kind = 'camera' and object_id is not null)
    or (kind = 'pager' and service is not null)
  )
);

alter table public.devices enable row level security;

-- Имя устройства пульт показывает источником инцидента.
create policy "Вошедший пользователь читает" on public.devices
  for select to authenticated using (true);

alter table public.incidents
  -- Устройство, которое заметило проблему; null — датчик ЭЦ или человек.
  add column device_id uuid references public.devices (id) on delete set null,
  -- Снимок с камеры в момент обнаружения (data URL JPEG).
  add column snapshot text;

-- Этапы наряда пишем от имени его службы: наряд от камеры получают путейцы.
create or replace function public.work_order_stage() returns trigger
language plpgsql
set search_path = public
as $$
declare
  station text := new.station_id;
  crew text := case new.service
    when 'track' then 'Путейская служба'
    when 'power' then 'Служба электроснабжения'
    else 'Служба СЦБ'
  end;
begin
  if new.incident_id is null or new.status = old.status then
    return new;
  end if;

  if new.status = 'in_progress' then
    update incidents set status = 'repairing'
    where id = new.incident_id and status = 'decided';
    insert into timeline_events (station_id, incident_id, at, actor, text)
    values (station, new.incident_id, sim_at(16), 'repair_crew',
      crew || ' взяла наряд в работу: ' || new.object_id);
  elsif new.status = 'done' then
    insert into timeline_events (station_id, incident_id, at, actor, text, level)
    values (station, new.incident_id, sim_at(27), 'repair_crew',
      'Работы выполнены'
        || coalesce(' «' || new.result_note || '»', '')
        || '. Ждёт возвращения в эксплуатацию ДСП',
      'warning');
  end if;
  return new;
end;
$$;
