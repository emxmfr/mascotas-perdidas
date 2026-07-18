-- Permite que cualquiera pueda SUBIR archivos al bucket "fotos"
create policy "Cualquiera puede subir fotos"
on storage.objects for insert
to anon
with check (bucket_id = 'fotos');

-- Permite que cualquiera pueda VER/DESCARGAR las fotos del bucket "fotos"
create policy "Cualquiera puede ver fotos"
on storage.objects for select
to anon
using (bucket_id = 'fotos');
