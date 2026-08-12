'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { TIPOS_REPORTE } from '@/lib/opciones';
import { enlaceWhatsApp } from '@/lib/ubicacion';

export default function Reportes({ animalId, animalNombre, estadoAnimal, telefonoDueno, correoDueno }) {
  const [reportes, setReportes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [mensajeEstado, setMensajeEstado] = useState(null);
  const [reporteEnviado, setReporteEnviado] = useState(null);

  const [tipo, setTipo] = useState('avistamiento');
  const [mensaje, setMensaje] = useState('');
  const [contactoWhatsapp, setContactoWhatsapp] = useState('');
  const [contactoCorreo, setContactoCorreo] = useState('');
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

  function manejarWhatsapp(valor) {
    setContactoWhatsapp(valor.replace(/\D/g, '').slice(0, 9));
  }

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
          from_name: 'Huellitas Maleñas',
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

      const contactoPartes = [
        contactoWhatsapp ? `WhatsApp: ${contactoWhatsapp}` : null,
        contactoCorreo.trim() ? `Correo: ${contactoCorreo.trim()}` : null,
      ].filter(Boolean);
      const contactoGuardado = contactoPartes.join(' · ') || null;

      const { error } = await supabase.from('avistamientos').insert([
        {
          animal_id: animalId,
          tipo,
          mensaje: mensaje.trim(),
          contacto: contactoGuardado,
          evidencia_url,
        },
      ]);

      if (error) throw error;

      notificarPorCorreo({
        tipoReporte: tipo,
        mensajeTexto: mensaje.trim(),
        contactoTexto: contactoGuardado,
        evidenciaUrl: evidencia_url,
      });

      const esEncontrado = tipo === 'encontrado';

      setReporteEnviado({ mensaje: mensaje.trim(), contacto: contactoGuardado });

      setMensaje('');
      setContactoWhatsapp('');
      setContactoCorreo('');
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

  const origen = typeof window !== 'undefined' ? window.location.origin : '';
  const mensajeParaDueno = reporteEnviado
    ? `Hola! Te escribo desde Huellitas Maleñas 🐾\n\n` +
      `En Huellitas Maleñas alguien reportó información sobre "${animalNombre}":\n"${reporteEnviado.mensaje}"\n\n` +
      (reporteEnviado.contacto ? `Contacto de quien reportó: ${reporteEnviado.contacto}\n\n` : '') +
      `Revisa el caso completo aquí: ${origen}/?caso=${animalId}`
    : '';

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

      {mensajeEstado?.tipo === 'ok' && reporteEnviado && (
        <div className="mensaje ok" style={{ marginTop: 4 }}>
          <p style={{ margin: '0 0 10px' }}>{mensajeEstado.texto}</p>
          {telefonoDueno ? (
            
              className="boton-poster rojo"
              style={{ width: '100%', textAlign: 'center', display: 'block' }}
              target="_blank"
              rel="noopener noreferrer"
              href={enlaceWhatsApp(`51${telefonoDueno}`, mensajeParaDueno)}
            >
              📲 Enviar detalles al dueño por WhatsApp
            </a>
          ) : correoDueno ? (
            
              className="boton-poster"
              style={{ width: '100%', textAlign: 'center', display: 'block' }}
              href={`mailto:${correoDueno}?subject=${encodeURIComponent(
                `Huellitas Maleñas: información sobre ${animalNombre}`
              )}&body=${encodeURIComponent(mensajeParaDueno)}`}
            >
              ✉️ Enviar detalles al dueño por correo
            </a>
          ) : (
            <p className="ayuda-fotos" style={{ margin: 0 }}>
              Quien registró este caso no dejó una forma directa de contactarlo, pero tu reporte ya
              quedó visible más arriba.
            </p>
          )}
        </div>
      )}

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
          {mensajeEstado?.tipo === 'error' && <div className="mensaje error">{mensajeEstado.texto}</div>}

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

          <div className="fila-doble">
            <div className="campo">
              <label>Tu WhatsApp (opcional, 9 dígitos)</label>
              <input
                type="tel"
                inputMode="numeric"
                placeholder="9XXXXXXXX"
                value={contactoWhatsapp}
                onChange={(e) => manejarWhatsapp(e.target.value)}
              />
            </div>
            <div className="campo">
              <label>O tu correo (opcional)</label>
              <input
                type="email"
                placeholder="correo@ejemplo.com"
                value={contactoCorreo}
                onChange={(e) => setContactoCorreo(e.target.value)}
              />
            </div>
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
