import { AutoProcessor, CLIPVisionModelWithProjection, RawImage } from '@xenova/transformers';

const MODELO = 'Xenova/clip-vit-base-patch32';

let procesadorPromesa = null;
let modeloPromesa = null;

function cargarProcesador() {
  if (!procesadorPromesa) {
    procesadorPromesa = AutoProcessor.from_pretrained(MODELO);
  }
  return procesadorPromesa;
}

function cargarModelo() {
  if (!modeloPromesa) {
    modeloPromesa = CLIPVisionModelWithProjection.from_pretrained(MODELO, {
      quantized: true,
    });
  }
  return modeloPromesa;
}

// Recibe un archivo de imagen (File) y devuelve su "huella visual":
// una lista de 512 números que representa el contenido de la foto.
export async function generarEmbedding(archivo) {
  const [procesador, modelo] = await Promise.all([cargarProcesador(), cargarModelo()]);

  const url = URL.createObjectURL(archivo);
  try {
    const imagen = await RawImage.read(url);
    const entradas = await procesador(imagen);
    const { image_embeds } = await modelo(entradas);
    return Array.from(image_embeds.data);
  } finally {
    URL.revokeObjectURL(url);
  }
}

// Igual que generarEmbedding, pero para una foto que ya está en internet
// (por ejemplo, una que ya subiste antes a Supabase), en vez de un archivo
// nuevo que el usuario acaba de elegir en su computadora.
export async function generarEmbeddingDesdeUrl(url) {
  const [procesador, modelo] = await Promise.all([cargarProcesador(), cargarModelo()]);
  const imagen = await RawImage.read(url);
  const entradas = await procesador(imagen);
  const { image_embeds } = await modelo(entradas);
  return Array.from(image_embeds.data);
}
