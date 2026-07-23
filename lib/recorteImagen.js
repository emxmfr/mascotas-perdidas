export function cargarImagen(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.addEventListener('load', () => resolve(img));
    img.addEventListener('error', reject);
    img.setAttribute('crossOrigin', 'anonymous');
    img.src = url;
  });
}

export async function recortarImagen(archivoUrl, areaPixeles, nombreArchivo) {
  const imagen = await cargarImagen(archivoUrl);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  canvas.width = areaPixeles.width;
  canvas.height = areaPixeles.height;

  ctx.drawImage(
    imagen,
    areaPixeles.x,
    areaPixeles.y,
    areaPixeles.width,
    areaPixeles.height,
    0,
    0,
    areaPixeles.width,
    areaPixeles.height
  );

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(new File([blob], nombreArchivo, { type: 'image/jpeg' }));
    }, 'image/jpeg', 0.9);
  });
}
