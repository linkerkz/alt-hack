-- Наряд привязан к инциденту по-настоящему: инциденты теперь живут в базе.
-- Этапы наряда (взят в работу, работы выполнены) двигают инцидент и пишутся
-- в хронологию здесь, в базе: рабочий меняет наряд по QR, а не с пульта.

-- Связь текстом осталась от моков: демо-наряд из сида ссылался на «inc-s3».
update public.work_orders
set incident_id = null
where incident_id !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';

-- Наряды удалённых инцидентов (сброс демо) больше никуда не ведут.
delete from public.work_orders w
where w.incident_id is not null
  and not exists (
    select 1 from public.incidents i where i.id::text = w.incident_id
  );

alter table public.work_orders
  alter column incident_id type uuid using incident_id::uuid,
  add constraint work_orders_incident_fk foreign key (incident_id)
    references public.incidents (id) on delete cascade;

-- Время хронологии — время симуляции, как пишет пульт: сегодня 14:MM по Алматы.
create function public.sim_at(minute int) returns timestamptz
language sql stable
set search_path = ''
as $$
  select ((now() at time zone 'Asia/Almaty')::date + make_time(14, minute, 0))
    at time zone 'Asia/Almaty'
$$;

-- Наряд взят в работу: решение принято — инцидент переходит в «работы идут».
-- Работы выполнены: инцидент ждёт, когда ДСП вернёт объект в эксплуатацию.
create function public.work_order_stage() returns trigger
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
      'Служба СЦБ взяла наряд в работу: ' || new.object_id);
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

create trigger work_order_stage
  after update of status on public.work_orders
  for each row execute function public.work_order_stage();

-- Решение принято, а служба уже работает (взяла наряд раньше): сразу «работы идут».
create function public.incident_decided() returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.status = 'decided' and exists (
    select 1 from work_orders
    where incident_id = new.id and status in ('in_progress', 'done')
  ) then
    new.status := 'repairing';
  end if;
  return new;
end;
$$;

create trigger incident_decided
  before update of status on public.incidents
  for each row execute function public.incident_decided();
