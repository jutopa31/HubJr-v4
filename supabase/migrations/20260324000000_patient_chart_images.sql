-- Historia clínica estructurada: una fila por paciente
create table if not exists public.patient_charts (
  patient_id               text primary key references public.patients(id) on delete cascade,
  antecedentes             text not null default '',
  motivo_consulta          text not null default '',
  examen_fisico            text not null default '',
  estudios_complementarios text not null default '',
  diagnostico              text not null default '',
  plan                     text not null default '',
  pendientes               text not null default '',
  updated_at               timestamptz not null default now(),
  updated_by               uuid references public.profiles(id)
);

create trigger patient_charts_updated_at
  before update on public.patient_charts
  for each row execute procedure public.set_updated_at();

-- Imágenes asociadas a pacientes
create table if not exists public.patient_images (
  id            uuid primary key default gen_random_uuid(),
  patient_id    text not null references public.patients(id) on delete cascade,
  thumbnail_url text not null,
  full_url      text not null,
  storage_path  text not null,
  uploaded_at   timestamptz not null default now(),
  uploaded_by   uuid references public.profiles(id)
);

-- Storage bucket privado para imágenes médicas
insert into storage.buckets (id, name, public)
values ('ward-images', 'ward-images', false)
on conflict (id) do nothing;

-- RLS: patient_charts
alter table public.patient_charts enable row level security;

create policy "charts_select" on public.patient_charts
  for select using (auth.role() = 'authenticated');

create policy "charts_insert" on public.patient_charts
  for insert with check (auth.role() = 'authenticated');

create policy "charts_update" on public.patient_charts
  for update using (auth.role() = 'authenticated');

-- RLS: patient_images
alter table public.patient_images enable row level security;

create policy "images_select" on public.patient_images
  for select using (auth.role() = 'authenticated');

create policy "images_insert" on public.patient_images
  for insert with check (auth.role() = 'authenticated');

create policy "images_delete" on public.patient_images
  for delete using (
    auth.uid() = uploaded_by
    or public.current_role_is('jefe')
  );

-- RLS: storage
create policy "storage_insert" on storage.objects
  for insert with check (
    bucket_id = 'ward-images'
    and auth.role() = 'authenticated'
  );

create policy "storage_select" on storage.objects
  for select using (
    bucket_id = 'ward-images'
    and auth.role() = 'authenticated'
  );

create policy "storage_delete" on storage.objects
  for delete using (
    bucket_id = 'ward-images'
    and auth.role() = 'authenticated'
  );
