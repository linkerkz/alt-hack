-- Роли КТЖ и профиль пользователя: кто он и к какой станции / диспетчерскому
-- кругу привязан. Права на экраны считает приложение, RLS закрывает данные.

create type public.app_role as enum (
  'dsp',              -- ДСП, дежурный по станции
  'dscs',             -- ДСЦС, станционный диспетчер
  'dnc',              -- ДНЦ, поездной диспетчер
  'ds',               -- ДС, начальник станции
  'dsc',              -- ДСЦ, маневровый диспетчер (развитие)
  'shunter',          -- составитель поездов (развитие)
  'shunting_driver'   -- машинист маневрового локомотива (развитие)
);

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null,
  role public.app_role not null,
  -- id станции из сети: для ролей, работающих на одной станции
  station_id text,
  -- id диспетчерского круга: для ДНЦ
  dispatch_area_id text,
  constraint profiles_scope check (
    (role = 'dnc' and dispatch_area_id is not null)
    or (role <> 'dnc' and station_id is not null)
  )
);

alter table public.profiles enable row level security;

-- Пишет в profiles только сид / администратор (в обход RLS), пользователь
-- может лишь прочитать свой профиль.
create policy "Пользователь читает свой профиль"
  on public.profiles for select
  to authenticated
  using ((select auth.uid()) = id);
