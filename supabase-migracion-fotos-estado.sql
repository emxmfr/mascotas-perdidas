-- Columnas nuevas
alter table animales add column if not exists foto_urls text[];
alter table animales add column if not exists codigo_edicion text;

-- Permitir que cualquiera pueda ACTUALIZAR un registro
-- (la protección real está en que hace falta conocer el codigo_edicion,
-- que se revisa desde la app antes de guardar el cambio)
create policy "Cualquiera puede actualizar el estado"
on animales for update
to anon
using (true)
with check (true);
