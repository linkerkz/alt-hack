-- Пейджер станционной бригады: вызовы по инциденту и обычные задачи ДСП.
-- Сценарий «камера → путейцы → ремонтная бригада»: камера видит предмет,
-- ДСП вызывает путейцев на пейджер, путейцы убирают предмет или сообщают
-- о повреждении — тогда ДСП отправляет ремонтную бригаду с нарядом и QR.
-- Пишет сервер секретным ключом (пульт и пейджер по ссылке без входа),
-- поэтому политик записи нет.

alter type public.incident_status add value if not exists 'dispatched' after 'suspected';  -- путейцы вызваны
alter type public.incident_status add value if not exists 'escalated' after 'dispatched';  -- путейцы: стрелка повреждена

-- Пейджер один на станцию и показывает всё, что ДСП отправил бригаде:
-- служба у пейджера больше не нужна.
alter table public.devices drop constraint devices_kind_fields;
alter table public.devices drop column service;
alter table public.devices add constraint devices_camera_object
  check (kind <> 'camera' or object_id is not null);

create type public.pager_message_status as enum (
  'sent',       -- отправлено, бригада ещё не ответила
  'accepted',   -- вызов принят, бригада идёт
  'done',       -- устранено (вызов) или выполнено (задача)
  'escalated',  -- вызов: нужна ремонтная бригада
  'cancelled'   -- вызов: отбой, камера видит, что стало свободно
);

create table public.pager_messages (
  id uuid primary key default gen_random_uuid(),
  station_id text not null references public.stations (id),
  -- Вызов по инциденту; null — обычная задача ДСП.
  incident_id uuid references public.incidents (id) on delete cascade,
  text text not null,
  status public.pager_message_status not null default 'sent',
  created_at timestamptz not null default now(),
  answered_at timestamptz
);

create index pager_messages_station_idx
  on public.pager_messages (station_id, created_at desc);

alter table public.pager_messages enable row level security;

create policy "Вошедший пользователь читает" on public.pager_messages
  for select to authenticated using (true);

-- Ответ бригады на вызов двигает инцидент и пишется в хронологию здесь, в
-- базе: бригада отвечает с пейджера, а не с пульта. Отбой пишет камера.
create function public.pager_message_answer() returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.incident_id is null or new.status = old.status then
    return new;
  end if;

  if new.status = 'accepted' then
    insert into timeline_events (station_id, incident_id, at, actor, text)
    values (new.station_id, new.incident_id, sim_at(8), 'repair_crew',
      'Путейцы приняли вызов, идут к стрелке С3');
  elsif new.status = 'done' then
    update incidents set status = 'closed', closed_at = now()
    where id = new.incident_id and status in ('suspected', 'dispatched');
    insert into timeline_events (station_id, incident_id, at, actor, text, level)
    values (new.station_id, new.incident_id, sim_at(9), 'repair_crew',
      'Путейцы: предмет убран, стрелка свободна. Инцидент закрыт', 'normal');
  elsif new.status = 'escalated' then
    update incidents set status = 'escalated'
    where id = new.incident_id and status = 'dispatched';
    insert into timeline_events (station_id, incident_id, at, actor, text, level)
    values (new.station_id, new.incident_id, sim_at(9), 'repair_crew',
      'Путейцы: стрелка С3 повреждена, нужна ремонтная бригада', 'critical');
  end if;
  return new;
end;
$$;

create trigger pager_message_answer
  after update of status on public.pager_messages
  for each row execute function public.pager_message_answer();

-- Наряд по инциденту теперь всегда у ремонтной бригады.
create or replace function public.work_order_stage() returns trigger
language plpgsql
set search_path = public
as $$
declare
  station text := new.station_id;
begin
  if new.incident_id is null or new.status = old.status then
    return new;
  end if;

  if new.status = 'in_progress' then
    update incidents set status = 'repairing'
    where id = new.incident_id and status = 'decided';
    insert into timeline_events (station_id, incident_id, at, actor, text)
    values (station, new.incident_id, sim_at(16), 'repair_crew',
      'Ремонтная бригада взяла наряд в работу: ' || new.object_id);
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
