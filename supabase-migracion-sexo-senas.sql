-- Agrega las columnas nuevas a la tabla que ya existe
alter table animales add column if not exists sexo text;
alter table animales add column if not exists senas text[];
