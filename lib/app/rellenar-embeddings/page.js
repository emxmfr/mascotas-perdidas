'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { generarEmbeddingDesdeUrl } from '@/lib/embeddings';

export default function RellenarEmbeddings() {
  const [procesando, setProcesando] = useState(false);
  const [log, setLog] = useState([]);

  function agregarLog(linea) {
    setLog((prev) => [...prev, linea]);
  }

  async function rellenar() {
    setProcesando(true);
    setLog([]);

    const { data: animales, error } = await supabase
      .from('animales')
      .select('id, nombre, foto_url, foto_urls')
      .is('embedding', null);

    if (error) {
      agregarLog(`Error cargando casos: ${error.message}`);
      setProcesando(false);
      return;
    }

    agregarLog(`Encontrados ${animales.length} casos sin huella visual.`);

    for (const animal of animales) {
      const foto = animal.foto_urls?.[0] || animal.foto_url;
      if (!foto) {
        agregarLog(`⚠️ ${animal.nombre || animal.id}: no tiene foto, se salta.`);
        continue;
      }
      try {
        const embedding = await generarEmbeddingDesdeUrl(foto);
        const { error: errorUpdate } = await supabase
          .from('animales')
          .update({ embedding })
          .eq('id', animal.id);
        if (errorUpdate) throw errorUpdate;
        agregarLog(`✅ ${animal.nombre || animal.id}: listo.`);
      } catch (err) {
        agregarLog(`❌ ${animal.nombre || animal.id}: ${err.message || err}`);
      }
    }

    agregarLog('Terminado.');
    setProcesando(false);
  }

  return (
    <div style={{ padding: 30, maxWidth: 600, margin: '0 auto' }}>
      <h2>Rellenar huellas visuales de casos viejos</h2>
      <p>
        Esto revisa los casos que no tienen huella visual todavía y se la
        calcula usando la foto que ya tienen guardada. No hace falta volver
        a registrarlos.
      </p>
      <button
        type="button"
        className="boton-poster"
        onClick={rellenar}
        disabled={procesando}
      >
        {procesando ? 'Procesando...' : 'Rellenar huellas faltantes'}
      </button>

      <ul style={{ marginTop: 20, fontFamily: 'monospace', fontSize: 14 }}>
        {log.map((linea, i) => (
          <li key={i}>{linea}</li>
        ))}
      </ul>
    </div>
  );
}
