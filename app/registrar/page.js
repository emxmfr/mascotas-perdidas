'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { SEXOS, SENAS, RAZAS } from '@/lib/opciones';
import SelectorColor from '@/components/SelectorColor';
import RecortarFoto from '@/components/RecortarFoto';

const MAX_FOTOS = 3;

export default function Registrar() {
  const router = useRouter();
  const [enviando, setEnviando] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  const [fotos, setFotos] = useState([]);
  const [colaRecorte, setColaRecorte] = useState([]);
  const [senasElegidas, setSenasElegidas] = useState([]);
  const [colores, setColores] = useState([]);
  const [colorOtro, setColorOtro] = useState('');
  const [telefono, setTelefono] = useState('');
  const [contactoOtro, setContactoOtro] = useState('');

  function alternarSena(sena) {
    setSenasElegidas((prev) =>
      prev.includes(sena) ? prev.filter((s) => s !== sena) : [...prev, sena]
    );
  }

  function alternarColor(color) {
    setColores((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
    );
  }

  function elegirFotos(lista) {
    const archivos = Array.from(lista).slice(0, MAX_FOTOS);
    setFotos([]);
    setColaRecorte(archivos);
  }

  function confirmarRecorte(archivoRecortado) {
    setFotos((prev) => [...prev, archivoRecortado]);
    setColaRecorte((prev) => prev.slice(1));
  }

  function omitirRecorte() {
    setColaRecorte((prev) => prev.slice(1));
  }

  function manejarTelefono(valor) {
    setTelefono(valor.replace(/\D/g, '').slice(0, 9));
  }

  async function manejarEnvio(e) {
    e.preventDefault();

    if (colores.length === 0) {
      setMensaje({ tipo: 'error', texto: 'Elige al menos un color/patrón de pelaje.' });
      return;
    }

    if (telefono && telefono.length !== 9) {
      setMensaje({ tipo: 'error', texto: 'El teléfono debe tener 9 dígitos (Perú).' });
      return;
    }

    if (!telefono && !contactoOtro.trim()) {
      setMensaje({ tipo: 'error', texto: 'Deja al menos un dato de contacto: teléfono, email o red social.' });
      return;
    }

    setEnviando(true);
    setMensaje(null);

    const form = new FormData(e.target);
    const datos = {
      nombre: form.get('nombre'),
      tipo: form.get('tipo'),
      colores,
      color_otro: colorOtro.trim() || null,
      raza: form.get('raza'),
      tamano: form.get('tamano'),
      sexo: form.get('sexo'),
      zona: form.get('zona'),
      estado: form.get('estado'),
      descripcion: form.get('descripcion'),
      telefono: telefono || null,
      contacto_otro: contactoOtro.trim() || null,
      contacto: telefono || contactoOtro.trim(),
      senas: senasElegidas,
    };

    try {
      const urls = [];

      for (const archivo of fotos) {
        const nombreArchivo = `${Date.now()}-${archivo.name}`;
        const { error: errorSubida } = await supabase.storage
          .from('fotos')
          .upload(nombreArchivo, archivo);

        if (errorSubida) throw errorSubida;

        const { data } = supabase.storage.from('fotos').getPublicUrl(nombreArchivo);
        urls.push(data.publicUrl);
      }

      const { error: errorInsert } = await supabase
        .from('animales')
        .insert([{ ...datos, foto_url: urls[0] || null, foto_urls: urls }]);

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
    <>
      {colaRecorte.length > 0 && (
        <RecortarFoto
          archivo={colaRecorte[0]}
          onConfirmar={confirmarRecorte}
          onCancelar={omitirRecorte}
        />
      )}

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
        <label>Raza</label>
        <select name="raza" defaultValue="No se sabe / mestizo">
          {RAZAS.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </div>

      <div className="campo">
        <label>Color / patrón de pelaje (puedes elegir varios)</label>
        <SelectorColor
          valores={colores}
          onToggle={alternarColor}
          otroTexto={colorOtro}
          onOtroTexto={setColorOtro}
        />
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
        <textarea name="descripcion" placeholder="Comportamiento, dónde se le vio por última vez..." />
      </div>

      <div className="fila-doble">
        <div className="campo">
          <label>Teléfono (Perú, 9 dígitos)</label>
          <input
            type="tel"
            inputMode="numeric"
            placeholder="9XXXXXXXX"
            value={telefono}
            onChange={(e) => manejarTelefono(e.target.value)}
          />
        </div>
        <div className="campo">
          <label>Email, Instagram o Facebook</label>
          <input
            type="text"
            placeholder="Ej. @usuario o correo@ejemplo.com"
            value={contactoOtro}
            onChange={(e) => setContactoOtro(e.target.value)}
          />
        </div>
      </div>

      <div className="campo">
        <label>Fotos (hasta {MAX_FOTOS})</label>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => elegirFotos(e.target.files)}
        />
        {fotos.length > 0 && (
          <p className="ayuda-fotos">{fotos.length} foto{fotos.length > 1 ? 's' : ''} seleccionada{fotos.length > 1 ? 's' : ''}</p>
        )}
      </div>

      <button className="boton-poster rojo" type="submit" disabled={enviando} style={{ width: '100%', marginTop: 6 }}>
        {enviando ? 'Registrando...' : 'Registrar caso'}
      </button>
    </form>
    </>
  );
}
