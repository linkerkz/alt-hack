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
