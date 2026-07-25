import ubigeoPeru from 'ubigeo-peru';

const filas = ubigeoPeru.reniec;

const departamentos = {};
filas
  .filter((f) => f.provincia === '00' && f.distrito === '00')
  .forEach((f) => {
    departamentos[f.departamento] = f.nombre;
  });

export const PROVINCIAS = filas
  .filter((f) => f.provincia !== '00' && f.distrito === '00')
  .map((f) => ({
    codigo: f.departamento + f.provincia,
    nombre: f.nombre,
    departamento: departamentos[f.departamento] || '',
  }))
  .sort((a, b) => a.departamento.localeCompare(b.departamento) || a.nombre.localeCompare(b.nombre));

export const DISTRITOS = filas
  .filter((f) => f.distrito !== '00')
  .map((f) => ({
    codigo: f.departamento + f.provincia + f.distrito,
    nombre: f.nombre,
    provinciaCodigo: f.departamento + f.provincia,
  }))
  .sort((a, b) => a.nombre.localeCompare(b.nombre));

export function provinciasAgrupadas() {
  const grupos = {};
  PROVINCIAS.forEach((p) => {
    if (!grupos[p.departamento]) grupos[p.departamento] = [];
    grupos[p.departamento].push(p);
  });
  return Object.entries(grupos).map(([departamento, provincias]) => ({ departamento, provincias }));
}

export function distritosDeProvincia(codigoProvincia) {
  return DISTRITOS.filter((d) => d.provinciaCodigo === codigoProvincia);
}

export function buscarProvincia(codigo) {
  return PROVINCIAS.find((p) => p.codigo === codigo);
}

export function buscarDistrito(codigo) {
  return DISTRITOS.find((d) => d.codigo === codigo);
}
