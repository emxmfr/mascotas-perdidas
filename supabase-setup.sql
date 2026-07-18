-- 1. Crear la tabla donde se guardan los registros de animales
create table animales (
  id uuid primary key default gen_random_uuid(),
  creado_en timestamp with time zone default now(),
  nombre text,
  tipo text not null,            -- perro, gato, otro
  color text,
  tamano text,                   -- pequeño, mediano, grande
  zona text not null,            -- barrio / distrito donde se vio
  estado text not null default 'perdido',  -- perdido | encontrado
  descripcion text,
  contacto text not null,        -- teléfono o email de contacto
  foto_url text
);

-- 2. Activar seguridad a nivel de fila (obligatorio en Supabase)
alter table animales enable row level security;

-- 3. Permitir que cualquiera pueda LEER los registros (el sitio es público)
create policy "Cualquiera puede leer animales"
on animales for select
to anon
using (true);

-- 4. Permitir que cualquiera pueda REGISTRAR un animal (subir un caso)
create policy "Cualquiera puede registrar animales"
on animales for insert
to anon
with check (true);
