-- ============================================================
-- HubJr V4 — Initial Schema
-- ============================================================

-- ── PROFILES ──────────────────────────────────────────────────
create table if not exists public.profiles (
  id             uuid primary key references auth.users(id) on delete cascade,
  full_name      text not null,
  role           text not null check (role in ('jefe', 'residente')),
  initial        text,
  color          text,
  bg_color       text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer
set search_path = public as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'role', 'residente')
  );
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── PATIENTS ──────────────────────────────────────────────────
create table if not exists public.patients (
  id             text primary key,
  age            integer not null,
  sex            char(1) not null check (sex in ('M', 'F')),
  sector         text not null,
  status         text not null check (status in ('internado', 'ambulatorio', 'guardia', 'alta')),
  diagnosis      text not null,
  created_by     uuid references public.profiles(id),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create table if not exists public.patient_assignments (
  patient_id     text not null references public.patients(id) on delete cascade,
  profile_id     uuid not null references public.profiles(id) on delete cascade,
  primary key (patient_id, profile_id)
);

-- ── EVOLUTIONS ────────────────────────────────────────────────
create table if not exists public.evolutions (
  id             uuid primary key default gen_random_uuid(),
  patient_id     text not null references public.patients(id) on delete cascade,
  author_id      uuid not null references public.profiles(id),
  text           text not null,
  created_at     timestamptz not null default now()
);

-- ── TASKS ─────────────────────────────────────────────────────
create table if not exists public.tasks (
  id             uuid primary key default gen_random_uuid(),
  title          text not null,
  assigned_to    uuid not null references public.profiles(id),
  status         text not null default 'pendiente' check (status in ('pendiente', 'en_curso', 'completada')),
  priority       text not null default 'media' check (priority in ('alta', 'media', 'baja')),
  due_date       date,
  type           text not null default 'clinica' check (type in ('clinica', 'academica', 'presentacion', 'clase', 'admin')),
  created_by     uuid not null references public.profiles(id),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- ── EVENTS ────────────────────────────────────────────────────
create table if not exists public.events (
  id             uuid primary key default gen_random_uuid(),
  title          text not null,
  event_date     date not null,
  event_time     time,
  type           text not null check (type in ('ateneo', 'clase', 'guardia', 'presentacion')),
  location       text,
  presenter_id   uuid references public.profiles(id),
  description    text,
  created_by     uuid references public.profiles(id),
  created_at     timestamptz not null default now()
);

-- ── READINGS ──────────────────────────────────────────────────
create table if not exists public.readings (
  id             uuid primary key default gen_random_uuid(),
  title          text not null,
  journal        text,
  type           text not null check (type in ('guia', 'articulo', 'revision')),
  mandatory      boolean not null default false,
  url            text,
  created_by     uuid references public.profiles(id),
  created_at     timestamptz not null default now()
);

create table if not exists public.reading_assignments (
  reading_id     uuid not null references public.readings(id) on delete cascade,
  profile_id     uuid not null references public.profiles(id) on delete cascade,
  primary key (reading_id, profile_id)
);

-- ── ROW LEVEL SECURITY ────────────────────────────────────────
alter table public.profiles            enable row level security;
alter table public.patients            enable row level security;
alter table public.patient_assignments enable row level security;
alter table public.evolutions          enable row level security;
alter table public.tasks               enable row level security;
alter table public.events              enable row level security;
alter table public.readings            enable row level security;
alter table public.reading_assignments enable row level security;

create or replace function public.current_role_is(r text)
returns boolean language sql security definer
set search_path = public as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = r
  );
$$;

-- profiles
create policy "profiles_select" on public.profiles
  for select using (auth.uid() = id or public.current_role_is('jefe'));
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- patients
create policy "patients_select" on public.patients
  for select using (auth.role() = 'authenticated');
create policy "patients_insert" on public.patients
  for insert with check (auth.role() = 'authenticated');
create policy "patients_update" on public.patients
  for update using (auth.role() = 'authenticated');

-- patient_assignments
create policy "assignments_select" on public.patient_assignments
  for select using (auth.role() = 'authenticated');
create policy "assignments_insert" on public.patient_assignments
  for insert with check (auth.role() = 'authenticated');
create policy "assignments_delete" on public.patient_assignments
  for delete using (auth.role() = 'authenticated');

-- evolutions
create policy "evolutions_select" on public.evolutions
  for select using (auth.role() = 'authenticated');
create policy "evolutions_insert" on public.evolutions
  for insert with check (auth.role() = 'authenticated');
create policy "evolutions_delete" on public.evolutions
  for delete using (auth.uid() = author_id or public.current_role_is('jefe'));

-- tasks
create policy "tasks_select" on public.tasks
  for select using (auth.role() = 'authenticated');
create policy "tasks_insert" on public.tasks
  for insert with check (public.current_role_is('jefe'));
create policy "tasks_update" on public.tasks
  for update using (auth.uid() = assigned_to or public.current_role_is('jefe'));
create policy "tasks_delete" on public.tasks
  for delete using (public.current_role_is('jefe'));

-- events
create policy "events_select" on public.events
  for select using (auth.role() = 'authenticated');
create policy "events_insert" on public.events
  for insert with check (public.current_role_is('jefe'));
create policy "events_update" on public.events
  for update using (public.current_role_is('jefe'));
create policy "events_delete" on public.events
  for delete using (public.current_role_is('jefe'));

-- readings
create policy "readings_select" on public.readings
  for select using (auth.role() = 'authenticated');
create policy "readings_insert" on public.readings
  for insert with check (public.current_role_is('jefe'));
create policy "readings_delete" on public.readings
  for delete using (public.current_role_is('jefe'));

-- reading_assignments
create policy "reading_assignments_select" on public.reading_assignments
  for select using (auth.role() = 'authenticated');
create policy "reading_assignments_insert" on public.reading_assignments
  for insert with check (public.current_role_is('jefe'));
create policy "reading_assignments_delete" on public.reading_assignments
  for delete using (public.current_role_is('jefe'));

-- ── UPDATED_AT TRIGGERS ───────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger patients_updated_at
  before update on public.patients
  for each row execute procedure public.set_updated_at();

create trigger tasks_updated_at
  before update on public.tasks
  for each row execute procedure public.set_updated_at();

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();
