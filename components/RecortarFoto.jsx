'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import Cropper from 'react-easy-crop';
import { recortarImagen } from '@/lib/recorteImagen';

export default function RecortarFoto({ archivo, onConfirmar, onCancelar }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [areaPixeles, setAreaPixeles] = useState(null);
  const [procesando, setProcesando] = useState(false);

  const url = useMemo(() => URL.createObjectURL(archivo), [archivo]);

  useEffect(() => {
    return () => URL.revokeObjectURL(url);
  }, [url]);

  const onCropComplete = useCallback((_, areaEnPixeles) => {
    setAreaPixeles(areaEnPixeles);
  }, []);

  async function confirmar() {
    if (!areaPixeles) return;
    setProcesando(true);
    const archivoRecortado = await recortarImagen(url, areaPixeles, archivo.name);
    setProcesando(false);
    onConfirmar(archivoRecortado);
  }

  return (
    <div className="fondo-modal">
      <div className="tarjeta-modal recortador-tarjeta">
        <p className="detalle-etiqueta" style={{ marginTop: 0 }}>
          Ajusta el encuadre de la foto
        </p>

        <div className="recortador-lienzo">
          <Cropper
            image={url}
            crop={crop}
            zoom={zoom}
            aspect={1}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>

        <div className="recortador-zoom">
          <label>Acercar / alejar</label>
          <input
            type="range"
            min={1}
            max={3}
            step={0.1}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
          />
        </div>

        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          <button
            type="button"
            className="boton-poster rojo"
            onClick={confirmar}
            disabled={procesando}
            style={{ flex: 1 }}
          >
            {procesando ? 'Procesando...' : 'Usar esta foto'}
          </button>
          <button type="button" className="boton-poster" onClick={onCancelar} style={{ flex: 1 }}>
            Omitir esta foto
          </button>
        </div>
      </div>
    </div>
  );
}
