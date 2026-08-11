'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { supabase } from '@/lib/supabaseClient';
import { generarEmbedding } from '@/lib/embeddings';
import { SEXOS, SENAS, RAZAS } from '@/lib/opciones';
import SelectorColor from '@/components/SelectorColor';
import RecortarFoto from '@/components/RecortarFoto';
import { provinciasAgrupadas, distritosDeProvincia, buscarProvincia, buscarDistrito } from '@/lib/ubigeo';

const SeleccionarUbicacion = dynamic(() => import('@/components/SeleccionarUbicacion'), { ssr: false });

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
  const [ubicacion, setUbicacion] = useState(null);
  const [mostrarMapa, setMostrarMapa] = useState(false);
  const [contactoOtro, setContactoOtro] = useState('');
  const [provinciaCodigo, setProvinciaCodigo] = useState('');
  const [distritoCodigo, setDistritoCodigo] = useState('');
  const [barrio, setBarrio] = useState('');

  function cambiarProvincia(codigo) {
    setProvinciaCodigo(codigo);
    setDistritoCodigo('');
  }

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

    if (!provinciaCodigo || !distritoCodigo) {
      setMensaje({ tipo: 'error', texto: 'Elige la provincia y el distrito donde se vio al animal.' });
      return;
    }

    if (colores.length === 0) {
      setMensaje({ tipo: 'error', texto: 'Elige al menos un color/patrón de pelaje.' });
      return;
    }

    if (!telefono || telefono.length !== 9) {
      setMensaje({ tipo: 'error', texto: 'El teléfono es obligatorio y debe tener 9 dígitos (Perú).' });
      return;
    }

    if (fotos.length === 0) {
      setMensaje({ tipo: 'error', texto: 'Sube al menos una foto del animal.' });
      return;
    }

    setEnviando(true);
    setMensaje(null);

    const form = new FormData(e.target);

    const provinciaObj = buscarProvincia(provinciaCodigo);
    const distritoObj = buscarDistrito(distritoCodigo);
    const zona = barrio.trim()
      ? `${barrio.trim()}, ${distritoObj.nombre} - ${provinciaObj.nombre}`
      : `${distritoObj.nombre} - ${provinciaObj.nombre}`;

    const datos = {
      nombre: form.get('nombre'),
      tipo: form.get('tipo'),
      colores,
      color_otro: colorOtro.trim() || null,
      raza: form.get('raza'),
      tamano: form.get('tamano'),
      sexo: form.get('sexo'),
      zona,
      estado: form.get('estado'),
      descripcion: form.get('descripcion'),
      telefono: telefono || null,
      contacto_otro: contactoOtro.trim() || null,
      contacto: telefono || contactoOtro.trim(),
      latitud: ubicacion?.lat ?? null,
      longitud: ubicacion?.lng ?? null,
      senas: senasElegidas,
    };

    try {
      let embedding = null;
      try {
        embedding = await generarEmbedding(fotos[0]);
      } catch (errEmbedding) {
        console.error('No se pudo analizar la foto para búsqueda visual:', errEmbedding);
      }

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
        <label>Nombre *</label>
        <input name="nombre" type="text" required placeholder="Ej. Toby (si no lo sabes, escribe 'Se desconoce')" />
      </div>

      <div className="fila-doble">
        <div className="campo">
          <label>Tipo de animal *</label>
          <select name="tipo" required defaultValue="perro">
            <option value="perro">Perro</option>
            <option value="gato">Gato</option>
            <option value="otro">Otro</option>
          </select>
        </div>
        <div className="campo">
          <label>Estado *</label>
          <select name="estado" required defaultValue="perdido">
            <option value="perdido">Perdido</option>
            <option value="encontrado">Encontrado</option>
          </select>
        </div>
      </div>

      <div className="campo">
        <label>Raza *</label>
        <select name="raza" required defaultValue="No se sabe / mestizo">
          {RAZAS.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </div>

      <div className="campo">
        <label>Color / patrón de pelaje (puedes elegir varios) *</label>
        <SelectorColor
          valores={colores}
          onToggle={alternarColor}
          otroTexto={colorOtro}
          onOtroTexto={setColorOtro}
        />
      </div>

      <div className="campo">
        <label>Tamaño *</label>
        <select name="tamano" required defaultValue="mediano">
          <option value="pequeño">Pequeño</option>
          <option value="mediano">Mediano</option>
          <option value="grande">Grande</option>
        </select>
      </div>

      <div className="fila-doble">
        <div className="campo">
          <label>Sexo *</label>
          <select name="sexo" required defaultValue="No se sabe">
            {SEXOS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div className="campo">
          <label>Provincia *</label>
          <select
            required
            value={provinciaCodigo}
            onChange={(e) => cambiarProvincia(e.target.value)}
          >
            <option value="" disabled>Selecciona una provincia...</option>
            {provinciasAgrupadas().map((grupo) => (
              <optgroup key={grupo.departamento} label={grupo.departamento}>
                {grupo.provincias.map((p) => (
                  <option key={p.codigo} value={p.codigo}>{p.nombre}</option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
      </div>

      <div className="fila-doble">
        <div className="campo">
          <label>Distrito *</label>
          <select
            required
            value={distritoCodigo}
            onChange={(e) => setDistritoCodigo(e.target.value)}
            disabled={!provinciaCodigo}
          >
            <option value="" disabled>
              {provinciaCodigo ? 'Selecciona un distrito...' : 'Elige primero una provincia'}
            </option>
            {distritosDeProvincia(provinciaCodigo).map((d) => (
              <option key={d.codigo} value={d.codigo}>{d.nombre}</option>
            ))}
          </select>
        </div>
        <div className="campo">
          <label>Barrio / urbanización (opcional)</label>
          <input
            type="text"
            placeholder="Ej. San Juan I Etapa"
            value={barrio}
            onChange={(e) => setBarrio(e.target.value)}
          />
        </div>
      </div>

      <div className="campo">
        <label>Ubicación en el mapa (opcional, ayuda a que aparezca en "cerca de mí" y en el mapa)</label>
        <button
          type="button"
          className="boton-poster"
          onClick={() => setMostrarMapa((v) => !v)}
          style={{ fontSize: 12.5, padding: '7px 14px' }}
        >
          📍 {mostrarMapa ? 'Ocultar mapa' : ubicacion ? 'Ubicación marcada · editar' : 'Marcar ubicación en el mapa'}
        </button>

        {mostrarMapa && (
          <div style={{ marginTop: 8 }}>
            <p className="ayuda-fotos">
              El mapa se centra solo en tu ubicación actual (si das el permiso). Haz clic donde viste
              al animal, o arrastra el pin para ajustarlo.
            </p>
            <SeleccionarUbicacion posicion={ubicacion} onCambio={setUbicacion} />
          </div>
        )}
      </div>

      <div className="campo">
        <label>Señas particulares (opcional, marca las que apliquen)</label>
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
        <label>Descripción adicional (opcional)</label>
        <textarea name="descripcion" placeholder="Comportamiento, dónde se le vio por última vez..." />
      </div>

      <div className="fila-doble">
        <div className="campo">
          <label>Teléfono (Perú, 9 dígitos) *</label>
          <input
            type="tel"
            inputMode="numeric"
            required
            placeholder="9XXXXXXXX"
            value={telefono}
            onChange={(e) => manejarTelefono(e.target.value)}
          />
        </div>
        <div className="campo">
          <label>Email, Instagram o Facebook (opcional)</label>
          <input
            type="text"
            placeholder="Ej. @usuario o correo@ejemplo.com"
            value={contactoOtro}
            onChange={(e) => setContactoOtro(e.target.value)}
          />
        </div>
      </div>

      <div className="campo">
        <label>Fotos (hasta {MAX_FOTOS}) *</label>
        <input
          type="file"
          accept="image/*"
          multiple
          required={fotos.length === 0}
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
