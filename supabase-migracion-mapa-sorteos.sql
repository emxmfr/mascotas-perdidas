-- Ubicación para el mapa y búsqueda por cercanía
alter table animales add column if not exists latitud double precision;
alter table animales add column if not exists longitud double precision;

-- ===== SISTEMA DE SORTEOS =====

create table if not exists sorteos (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  descripcion text,
  premios text,
  fecha_sorteo date,
  precio_numero text,
  whatsapp text,
  estado text default 'activo',
  creado_en timestamp with time zone default now()
);

create table if not exists numeros_sorteo (
  id uuid primary key default gen_random_uuid(),
  sorteo_id uuid references sorteos(id) on delete cascade,
  numero int not null,
  estado text default 'disponible',
  nombre_comprador text,
  contacto_comprador text,
  actualizado_en timestamp with time zone default now(),
  unique (sorteo_id, numero)
);

alter table sorteos enable row level security;
alter table numeros_sorteo enable row level security;

drop policy if exists "Cualquiera puede leer sorteos" on sorteos;
create policy "Cualquiera puede leer sorteos"
on sorteos for select to anon using (true);

drop policy if exists "Cualquiera puede leer numeros" on numeros_sorteo;
create policy "Cualquiera puede leer numeros"
on numeros_sorteo for select to anon using (true);

-- La gente puede RESERVAR un número (poner su nombre/contacto),
-- pero nunca puede marcarlo como "pagado" por sí misma: eso solo lo
-- haces tú manualmente en Supabase después de confirmar el pago.
drop policy if exists "Cualquiera puede reservar numeros" on numeros_sorteo;
create policy "Cualquiera puede reservar numeros"
on numeros_sorteo for update
to anon
using (true)
with check (estado in ('disponible', 'reservado'));

-- ===== Cómo crear un sorteo nuevo (ejemplo) =====
-- 1) Copia este bloque, cambia los datos, y córrelo en el SQL Editor.
-- 2) Automáticamente crea los 100 números (00 al 99) para ese sorteo.
--
-- with nuevo as (
--   insert into sorteos (titulo, descripcion, premios, fecha_sorteo, precio_numero, whatsapp)
--   values (
--     'Sorteo Huellitas Maleñas',
--     'Ayúdanos a seguir rescatando animales en Mala',
--     '1er premio: Combo veterinario. 2do premio: Kit de accesorios',
--     '2026-08-15',
--     'S/ 10 por número',
--     '51999999999'
--   )
--   returning id
-- )
-- insert into numeros_sorteo (sorteo_id, numero)
-- select nuevo.id, n
-- from nuevo, generate_series(0, 99) as n;
