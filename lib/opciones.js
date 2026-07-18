export const COLORES = [
  { valor: 'Negro', tipo: 'solido', c1: '#2b2420' },
  { valor: 'Blanco', tipo: 'solido', c1: '#fbf8f2' },
  { valor: 'Marrón', tipo: 'solido', c1: '#8a5a34' },
  { valor: 'Gris', tipo: 'solido', c1: '#9a9a94' },
  { valor: 'Dorado / beige', tipo: 'solido', c1: '#dcb875' },
  { valor: 'Atigrado', tipo: 'rayas', c1: '#c79a5f', c2: '#5c3d20' },
  { valor: 'Manchado (blanco y marrón)', tipo: 'manchas', c1: '#fbf8f2', c2: '#8a5a34' },
  { valor: 'Negro y blanco', tipo: 'manchas', c1: '#fbf8f2', c2: '#2b2420' },
  { valor: 'Tricolor', tipo: 'tricolor', c1: '#fbf8f2', c2: '#8a5a34', c3: '#2b2420' },
  { valor: 'Otro', tipo: 'otro' },
];

export const SEXOS = ['Macho', 'Hembra', 'No se sabe'];

export function buscarColor(valor) {
  return COLORES.find((c) => c.valor === valor);
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
