-- Corre esto UNA sola vez en el SQL Editor de Supabase.
-- Si alguna columna ya existía, "if not exists" evita que dé error.

alter table animales add column if not exists sexo text;
alter table animales add column if not exists senas text[];
alter table animales add column if not exists foto_urls text[];
alter table animales add column if not exists codigo_edicion text;

-- Permite que cualquiera pueda actualizar un caso
-- (la protección real es que la app exige el código de edición
-- antes de guardar el cambio de estado)
create policy "Cualquiera puede actualizar el estado"
on animales for update
to anon
using (true)
with check (true);
