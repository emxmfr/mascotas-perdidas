'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { SEXOS, SENAS } from '@/lib/opciones';
import SelectorColor from '@/components/SelectorColor';

export default function Registrar() {
  const router = useRouter();
  const [enviando, setEnviando] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  const [foto, setFoto] = useState(null);
  const [senasElegidas, setSenasElegidas] = useState([]);
  const [color, setColor] = useState('');

  function alternarSena(sena) {
    setSenasElegidas((prev) =>
      prev.includes(sena) ? prev.filter((s) => s !== sena) : [...prev, sena]
    );
  }

  async function manejarEnvio(e) {
    e.preventDefault();

    if (!color) {
      setMensaje({ tipo: 'error', texto: 'Elige el color/patrón de pelaje que más se parece.' });
      return;
    }

    setEnviando(true);
    setMensaje(null);

    const form = new FormData(e.target);
    const datos = {
      nombre: form.get('nombre'),
      tipo: form.get('tipo'),
      color,
      tamano: form.get('tamano'),
      sexo: form.get('sexo'),
      zona: form.get('zona'),
      estado: form.get('estado'),
      descripcion: form.get('descripcion'),
      contacto: form.get('contacto'),
      senas: senasElegidas,
    };

    try {
      let foto_url = null;

      if (foto) {
        const nombreArchivo = `${Date.now()}-${foto.name}`;
        const { error: errorSubida } = await supabase.storage
          .from('fotos')
          .upload(nombreArchivo, foto);

        if (errorSubida) throw errorSubida;

        const { data } = supabase.storage.from('fotos').getPublicUrl(nombreArchivo);
        foto_url = data.publicUrl;
      }

      const { error: errorInsert } = await supabase
        .from('animales')
        .insert([{ ...datos, foto_url }]);

      if (errorInsert) throw errorInsert;

      setMensaje({ tipo: 'ok', texto: 'Caso registrado. Redirigiendo al tablón...' });
      setTimeout(() => router.push('/'), 1200);
    } catch (err) {
      setMensaje({ tipo: 'error', texto: 'Algo falló al registrar el caso. Revisa los datos e intenta de nuevo.' });
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form className="formulario" onSubmit={manejarEnvio}>
      <h2 className="nombre-animal" style={{ marginBottom: 18 }}>Registrar un caso</h2>

      {mensaje && <div className={`mensaje ${mensaje.tipo}`}>{mensaje.texto}</div>}

      <div className="campo">
        <label>Nombre (si se conoce)</label>
        <input name="nombre" type="text" placeholder="Ej. Toby" />
      </div>

      <div className="fila-doble">
        <div className="campo">
          <label>Tipo de animal</label>
          <select name="tipo" required defaultValue="perro">
            <option value="perro">Perro</option>
            <option value="gato">Gato</option>
            <option value="otro">Otro</option>
          </select>
        </div>
        <div className="campo">
          <label>Estado</label>
          <select name="estado" required defaultValue="perdido">
            <option value="perdido">Perdido</option>
            <option value="encontrado">Encontrado</option>
          </select>
        </div>
      </div>

      <div className="campo">
        <label>Color / patrón de pelaje</label>
        <SelectorColor valor={color} onChange={setColor} />
      </div>

      <div className="campo">
        <label>Tamaño</label>
        <select name="tamano" defaultValue="mediano">
          <option value="pequeño">Pequeño</option>
          <option value="mediano">Mediano</option>
          <option value="grande">Grande</option>
        </select>
      </div>

      <div className="fila-doble">
        <div className="campo">
          <label>Sexo</label>
          <select name="sexo" defaultValue="No se sabe">
            {SEXOS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div className="campo">
          <label>Zona / barrio donde se vio</label>
          <input name="zona" type="text" required placeholder="Ej. Miraflores" />
        </div>
      </div>

      <div className="campo">
        <label>Señas particulares (marca las que apliquen)</label>
        <div className="grupo-casillas">
          {SENAS.map((sena) => (
            <label key={sena} className="casilla">
              <input
                type="checkbox"
                checked={senasElegidas.includes(sena)}
                onChange={() => alternarSena(sena)}
              />
              {sena}
            </label>
          ))}
        </div>
      </div>

      <div className="campo">
        <label>Descripción adicional</label>
        <textarea name="descripcion" placeholder="Señas particulares, collar, comportamiento..." />
      </div>

      <div className="campo">
        <label>Contacto (teléfono o email)</label>
        <input name="contacto" type="text" required placeholder="Ej. 999 999 999" />
      </div>

      <div className="campo">
        <label>Foto</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFoto(e.target.files?.[0] || null)}
        />
      </div>

      <button className="boton-poster rojo" type="submit" disabled={enviando} style={{ width: '100%', marginTop: 6 }}>
        {enviando ? 'Registrando...' : 'Registrar caso'}
      </button>
    </form>
  );
}
