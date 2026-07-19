-- Este script se puede correr varias veces sin error (es "seguro" de repetir)

alter table animales add column if not exists colores text[];
alter table animales add column if not exists color_otro text;
alter table animales add column if not exists raza text;
alter table animales add column if not exists telefono text;
alter table animales add column if not exists contacto_otro text;

create table if not exists avistamientos (
  id uuid primary key default gen_random_uuid(),
  animal_id uuid references animales(id) on delete cascade,
  creado_en timestamp with time zone default now(),
  tipo text default 'avistamiento',
  mensaje text,
  evidencia_url text,
  contacto text
);

alter table avistamientos enable row level security;

drop policy if exists "Cualquiera puede leer reportes" on avistamientos;
create policy "Cualquiera puede leer reportes"
on avistamientos for select
to anon
using (true);

drop policy if exists "Cualquiera puede crear reportes" on avistamientos;
create policy "Cualquiera puede crear reportes"
on avistamientos for insert
to anon
with check (true);
