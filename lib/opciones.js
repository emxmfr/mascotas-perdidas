export const COLORES = [
  { valor: 'Negro', tipo: 'solido', c1: '#2b2420' },
  { valor: 'Blanco', tipo: 'solido', c1: '#fbf8f2' },
  { valor: 'Marrón', tipo: 'solido', c1: '#8a5a34' },
  { valor: 'Gris', tipo: 'solido', c1: '#9a9a94' },
  { valor: 'Dorado / beige', tipo: 'solido', c1: '#dcb875' },
  { valor: 'Atigrado', tipo: 'rayas', c1: '#c79a5f', c2: '#5c3d20' },
  { valor: 'Negro y blanco', tipo: 'manchas', c1: '#fbf8f2', c2: '#2b2420' },
  { valor: 'Marrón y blanco', tipo: 'manchas', c1: '#fbf8f2', c2: '#8a5a34' },
  { valor: 'Gris y blanco', tipo: 'manchas', c1: '#fbf8f2', c2: '#9a9a94' },
  { valor: 'Dorado y blanco', tipo: 'manchas', c1: '#fbf8f2', c2: '#dcb875' },
  { valor: 'Tricolor', tipo: 'tricolor', c1: '#fbf8f2', c2: '#8a5a34', c3: '#2b2420' },
  { valor: 'Peludo / tipo peluche', tipo: 'peluche', c1: '#dcb875' },
  { valor: 'Otro', tipo: 'otro' },
];

export function buscarColor(valor) {
  return COLORES.find((c) => c.valor === valor);
}

export const SEXOS = ['Macho', 'Hembra', 'No se sabe'];

export const RAZAS = [
  'No se sabe / mestizo',
  'Criollo / combinado',
  'Perro peruano (sin pelo)',
  'Labrador',
  'Golden Retriever',
  'Pastor Alemán',
  'Poodle / Caniche',
  'Chihuahua',
  'Pitbull / Terrier',
  'Salchicha (Dachshund)',
  'Bulldog',
  'Husky',
  'Gato común europeo',
  'Persa',
  'Siamés',
  'Otro',
];

export const ESTADOS = [
  { valor: 'perdido', etiqueta: 'Perdido' },
  { valor: 'encontrado', etiqueta: 'Encontrado' },
  { valor: 'en_casa', etiqueta: 'En casa' },
];

export function etiquetaEstado(valor) {
  return ESTADOS.find((e) => e.valor === valor)?.etiqueta || valor;
}

export const SENAS = [
  'Tiene collar',
  'Tiene placa/chapa',
  'Tiene manchas',
  'Pelo largo',
  'Pelo corto',
  'Orejas caídas',
  'Cojea o tiene una herida visible',
  'Está esterilizado (cicatriz)',
  'Muy tímido / se esconde',
  'Muy cariñoso / se deja agarrar',
];

export const TIPOS_REPORTE = [
  { valor: 'avistamiento', etiqueta: 'Vi a este animal' },
  { valor: 'encontrado', etiqueta: 'Ya fue encontrado / está a salvo' },
];
