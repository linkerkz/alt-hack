-- Демо-пользователи: по одному на роль, станция Алматы-1 и Алматинский
-- диспетчерский круг. Запускать после миграций; повторный запуск безопасен.
-- Пароль общий для всех — demo2026; для публичного демо смени его здесь.

drop table if exists demo_users;
create temp table demo_users (
  id uuid,
  email text,
  full_name text,
  role public.app_role,
  station_id text,
  dispatch_area_id text
);

insert into demo_users values
  ('a0000000-0000-4000-8000-000000000001', 'dsp@station.demo',  'Ерлан Ахметов',    'dsp',  'almaty-1', null),
  ('a0000000-0000-4000-8000-000000000002', 'dscs@station.demo', 'Айгерим Сейткали', 'dscs', 'almaty-1', null),
  ('a0000000-0000-4000-8000-000000000003', 'dnc@station.demo',  'Нурлан Жумабеков', 'dnc',  null,       'almaty'),
  ('a0000000-0000-4000-8000-000000000004', 'ds@station.demo',   'Динара Касымова',  'ds',   'almaty-1', null);

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  -- GoTrue не умеет читать NULL в этих полях — нужны пустые строки
  confirmation_token, recovery_token, email_change, email_change_token_new
)
select
  '00000000-0000-0000-0000-000000000000', id, 'authenticated', 'authenticated',
  email, extensions.crypt('demo2026', extensions.gen_salt('bf')), now(),
  '{"provider": "email", "providers": ["email"]}',
  jsonb_build_object('full_name', full_name), now(), now(),
  '', '', '', ''
from demo_users
on conflict (id) do nothing;

insert into auth.identities (
  id, user_id, provider_id, provider, identity_data,
  last_sign_in_at, created_at, updated_at
)
select
  gen_random_uuid(), id, id::text, 'email',
  jsonb_build_object('sub', id::text, 'email', email, 'email_verified', true),
  now(), now(), now()
from demo_users
on conflict (provider_id, provider) do nothing;

insert into public.profiles (id, full_name, role, station_id, dispatch_area_id)
select id, full_name, role, station_id, dispatch_area_id
from demo_users
on conflict (id) do update set
  full_name = excluded.full_name,
  role = excluded.role,
  station_id = excluded.station_id,
  dispatch_area_id = excluded.dispatch_area_id;

drop table demo_users;

-- Станция Алматы-1 для демо (docs/case_solution.md §4): один парк, нечётная
-- горловина — стрелки С1, С3, С5, С7, чётная — С2, С4, С6, С8. Пути 1–2 главные,
-- 3–5 приёмо-отправочные, 6 — тупик маневрового локомотива; платформа у 1 и 3.
-- План — час 14:00–15:00 в штатном режиме, инцидентов нет.

insert into public.stations (id, name, dispatch_area_id) values
  ('almaty-1', 'Алматы-1', 'almaty')
on conflict (id) do update set
  name = excluded.name,
  dispatch_area_id = excluded.dispatch_area_id;

insert into public.tracks (station_id, number, kind, has_platform) values
  ('almaty-1', 1, 'main',      true),
  ('almaty-1', 2, 'main',      false),
  ('almaty-1', 3, 'receiving', true),
  ('almaty-1', 4, 'receiving', false),
  ('almaty-1', 5, 'receiving', false),
  ('almaty-1', 6, 'dead_end',  false)
on conflict (station_id, number) do update set
  kind = excluded.kind,
  has_platform = excluded.has_platform;

insert into public.switches (station_id, id, throat) values
  ('almaty-1', 'С1', 'odd'),  ('almaty-1', 'С3', 'odd'),
  ('almaty-1', 'С5', 'odd'),  ('almaty-1', 'С7', 'odd'),
  ('almaty-1', 'С2', 'even'), ('almaty-1', 'С4', 'even'),
  ('almaty-1', 'С6', 'even'), ('almaty-1', 'С8', 'even')
on conflict (station_id, id) do update set throat = excluded.throat;

insert into public.routes (station_id, id, signal, throat, track, switches) values
  ('almaty-1', 'Н-1',  'Н',  'odd',  1, '{С1}'),
  ('almaty-1', 'Н-3',  'Н',  'odd',  3, '{С1,С3}'),
  ('almaty-1', 'Н-5',  'Н',  'odd',  5, '{С1,С3,С5}'),
  ('almaty-1', 'НП-2', 'НП', 'odd',  2, '{С7}'),
  ('almaty-1', 'НП-4', 'НП', 'odd',  4, '{С7}'),
  ('almaty-1', 'Ч-2',  'Ч',  'even', 2, '{С2}'),
  ('almaty-1', 'Ч-4',  'Ч',  'even', 4, '{С2,С4}'),
  ('almaty-1', 'ЧП-1', 'ЧП', 'even', 1, '{С6}'),
  ('almaty-1', 'ЧП-3', 'ЧП', 'even', 3, '{С6,С8}'),
  ('almaty-1', 'ЧП-5', 'ЧП', 'even', 5, '{С6,С8}')
on conflict (station_id, id) do update set
  signal = excluded.signal,
  throat = excluded.throat,
  track = excluded.track,
  switches = excluded.switches;

insert into public.trains (number, kind) values
  ('7015', 'passenger'), ('101', 'passenger'), ('3412', 'passenger'),
  ('7016', 'passenger'), ('3307', 'freight'),  ('2114', 'freight'),
  ('2001', 'freight'),   ('3308', 'freight')
on conflict (number) do update set kind = excluded.kind;

insert into public.track_plan
  (station_id, train_number, track, entry_route, exit_route, arrives_at, departs_at)
values
  ('almaty-1', '2114', 4, 'НП-4', 'Ч-4',  '13:50', '14:45'),
  ('almaty-1', '7015', 3, 'Н-3',  'ЧП-3', '13:55', '14:05'),
  ('almaty-1', '3307', 2, 'НП-2', 'Ч-2',  '14:03', '14:04'),
  ('almaty-1', '101',  3, 'Н-3',  'ЧП-3', '14:12', '14:20'),
  ('almaty-1', '2001', 5, 'Н-5',  'ЧП-5', '14:18', '14:40'),
  ('almaty-1', '3308', 2, 'Ч-2',  'НП-2', '14:30', '14:31'),
  ('almaty-1', '3412', 1, 'Н-1',  'ЧП-1', '14:35', '14:36'),
  ('almaty-1', '7016', 1, 'ЧП-1', 'Н-1',  '14:48', '14:52')
on conflict (station_id, train_number) do update set
  track = excluded.track,
  entry_route = excluded.entry_route,
  exit_route = excluded.exit_route,
  arrives_at = excluded.arrives_at,
  departs_at = excluded.departs_at;

insert into public.resources (station_id, id, kind, name, train_number) values
  ('almaty-1', 'tem2-0412', 'shunting_locomotive', 'ТЭМ2-0412', null),
  ('almaty-1', 'crew-1',    'crew',                'Бригада 1', '2001'),
  ('almaty-1', 'crew-2',    'crew',                'Бригада 2', '2114')
on conflict (station_id, id) do update set
  kind = excluded.kind,
  name = excluded.name,
  train_number = excluded.train_number;

-- Демо-наряд электромеханику СЦБ на стрелку С3 (сценарий «отказ стрелки»).
-- Фиксированный id — его QR печатаем на демо. Повторный запуск сбрасывает
-- наряд: статус «выдан», галочки пустые.
delete from public.work_orders
where id = 'b0000000-0000-4000-8000-000000000001';

insert into public.work_orders (
  id, station_id, incident_id, object_id, service, title, description, created_by
) values (
  'b0000000-0000-4000-8000-000000000001',
  'almaty-1',
  null,
  'С3',
  'signalling',
  'Восстановить контроль стрелки С3',
  'Стрелка С3 в нечётной горловине потеряла контроль положения. Маршруты через неё закрыты, поезда принимаются по варианту перепланирования.',
  'a0000000-0000-4000-8000-000000000001'
);

insert into public.work_order_items (work_order_id, position, text)
select 'b0000000-0000-4000-8000-000000000001', position, text
from (values
  (1, 'Получить разрешение ДСП, записать в журнал ДУ-46'),
  (2, 'Осмотреть стрелку С3: остряки, тяги, замыкатель'),
  (3, 'Проверить электропривод и автопереключатель'),
  (4, 'Измерить напряжение в цепи контроля'),
  (5, 'Перевести стрелку с пульта, проверить контроль в плюсе и минусе')
) as items (position, text);
