'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { TIPOS_REPORTE } from '@/lib/opciones';

export default function Reportes({ animalId, animalNombre, estadoAnimal }) {
  const [reportes, setReportes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [mensajeEstado, setMensajeEstado] = useState(null);

  const [tipo, setTipo] = useState('avistamiento');
  const [mensaje, setMensaje] = useState('');
  const [contacto, setContacto] = useState('');
  const [evidencia, setEvidencia] = useState(null);

  async function cargarReportes() {
    setCargando(true);
    const { data } = await supabase
      .from('avistamientos')
      .select('*')
      .eq('animal_id', animalId)
      .eq('tipo', 'avistamiento')
      .order('creado_en', { ascending: false });
    setReportes(data || []);
    setCargando(false);
  }

  useEffect(() => {
    cargarReportes();
  }, [animalId]);

  async function notificarPorCorreo({ tipoReporte, mensajeTexto, contactoTexto, evidenciaUrl }) {
    const clave = process.env.NEXT_PUBLIC_WEB3FORMS_KEY;
    if (!clave) return;

    try {
      await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_key: clave,
          subject: `${tipoReporte === 'encontrado' ? '✅ ENCONTRADO' : '👀 Avistamiento'}: ${animalNombre || 'un caso'}`,
          from_name: 'Mascotas Perdidas',
          message:
            `Caso: ${animalNombre || 'Sin nombre'}\n` +
            `Tipo de reporte: ${tipoReporte === 'encontrado' ? 'Ya fue encontrado' : 'Avistamiento'}\n` +
            `Mensaje: ${mensajeTexto}\n` +
            `Contacto de quien reporta: ${contactoTexto || 'No dejó contacto'}\n` +
            `Evidencia: ${evidenciaUrl || 'No adjuntó'}\n\n` +
            `Entra al tablón y busca este caso para actualizar su estado.`,
        }),
      });
    } catch {
      // si falla el correo, no interrumpe el registro del reporte
    }
  }

  async function enviarReporte(e) {
    e.preventDefault();

    if (!mensaje.trim()) {
      setMensajeEstado({ tipo: 'error', texto: 'Cuéntanos qué viste o qué información tienes.' });
      return;
    }

    setEnviando(true);
    setMensajeEstado(null);

    try {
      let evidencia_url = null;

      if (evidencia) {
        const nombreArchivo = `${Date.now()}-${evidencia.name}`;
        const { error: errorSubida } = await supabase.storage
          .from('fotos')
          .upload(nombreArchivo, evidencia);
        if (errorSubida) throw errorSubida;
        const { data } = supabase.storage.from('fotos').getPublicUrl(nombreArchivo);
        evidencia_url = data.publicUrl;
      }

      const { error } = await supabase.from('avistamientos').insert([
        {
          animal_id: animalId,
          tipo,
          mensaje: mensaje.trim(),
          contacto: contacto.trim() || null,
          evidencia_url,
        },
      ]);

      if (error) throw error;

      notificarPorCorreo({
        tipoReporte: tipo,
        mensajeTexto: mensaje.trim(),
        contactoTexto: contacto.trim(),
        evidenciaUrl: evidencia_url,
      });

      const esEncontrado = tipo === 'encontrado';

      setMensaje('');
      setContacto('');
      setEvidencia(null);
      setTipo('avistamiento');
      setMostrarForm(false);
      setMensajeEstado({
        tipo: 'ok',
        texto: esEncontrado
          ? '¡Gracias! Se lo notificamos directamente al equipo para que lo confirme.'
          : '¡Gracias! Tu avistamiento ya está visible en el caso.',
      });
      cargarReportes();
    } catch (err) {
      setMensajeEstado({ tipo: 'error', texto: 'Algo falló al enviar el reporte. Intenta de nuevo.' });
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="bloque-reportes">
      <p className="detalle-etiqueta" style={{ marginTop: 0 }}>
        Avistamientos {reportes.length > 0 ? `(${reportes.length})` : ''}
      </p>

      {cargando && <p className="ayuda-fotos">Cargando...</p>}

      {!cargando && reportes.length === 0 && (
        <p className="ayuda-fotos">Todavía no hay avistamientos reportados para este caso.</p>
      )}

      <ul className="lista-reportes">
        {reportes.map((r) => (
          <li key={r.id} className={`reporte ${r.tipo}`}>
            <div className="reporte-cabecera">
              <span>👀 Avistamiento</span>
              <span>
                {new Date(r.creado_en).toLocaleString('es', {
                  day: '2-digit',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
            <p>{r.mensaje}</p>
            {r.evidencia_url && (
              <img src={r.evidencia_url} alt="Evidencia" className="foto-evidencia" />
            )}
            {r.contacto && <p className="reporte-contacto">Contacto: {r.contacto}</p>}
          </li>
        ))}
      </ul>

      {estadoAnimal === 'en_casa' ? (
        <p className="ayuda-fotos" style={{ marginTop: 8 }}>
          🎉 Este caso ya se resolvió, ¡gracias a todos los que ayudaron! Ya no se aceptan más reportes.
        </p>
      ) : !mostrarForm ? (
        <button type="button" className="boton-poster" onClick={() => setMostrarForm(true)}>
          Reportar avistamiento / actualización
        </button>
      ) : (
        <form className="form-reporte" onSubmit={enviarReporte}>
          {mensajeEstado && <div className={`mensaje ${mensajeEstado.tipo}`}>{mensajeEstado.texto}</div>}

          <div className="campo">
            <label>Tipo de reporte</label>
            <select value={tipo} onChange={(e) => setTipo(e.target.value)}>
              {TIPOS_REPORTE.map((t) => (
                <option key={t.valor} value={t.valor}>{t.etiqueta}</option>
              ))}
            </select>
          </div>

          <div className="campo">
            <label>Cuéntanos qué pasó</label>
            <textarea
              placeholder="Ej. Lo vi cerca del parque, o: ya está con su dueño, hablé con él por WhatsApp"
              value={mensaje}
              onChange={(e) => setMensaje(e.target.value)}
            />
          </div>

          <div className="campo">
            <label>Evidencia (opcional): foto, captura de chat, etc.</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setEvidencia(e.target.files?.[0] || null)}
            />
          </div>

          <div className="campo">
            <label>Tu contacto (opcional, por si necesitan más info)</label>
            <input
              type="text"
              placeholder="Teléfono, email o red social"
              value={contacto}
              onChange={(e) => setContacto(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button type="submit" className="boton-poster rojo" disabled={enviando}>
              {enviando ? 'Enviando...' : 'Enviar reporte'}
            </button>
            <button type="button" className="boton-poster" onClick={() => setMostrarForm(false)}>
              Cancelar
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
