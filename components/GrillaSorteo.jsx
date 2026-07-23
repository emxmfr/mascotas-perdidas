'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { enlaceWhatsApp } from '@/lib/ubicacion';

export default function GrillaSorteo({ sorteo, numeros, onActualizar }) {
  const [numeroElegido, setNumeroElegido] = useState(null);
  const [nombre, setNombre] = useState('');
  const [contacto, setContacto] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');
  const [confirmado, setConfirmado] = useState(null);

  async function reservar(e) {
    e.preventDefault();
    if (!nombre.trim() || !contacto.trim()) {
      setError('Completa tu nombre y contacto.');
      return;
    }

    setEnviando(true);
    setError('');

    const { data, error: errorUpdate } = await supabase
      .from('numeros_sorteo')
      .update({
        estado: 'reservado',
        nombre_comprador: nombre.trim(),
        contacto_comprador: contacto.trim(),
        actualizado_en: new Date().toISOString(),
      })
      .eq('id', numeroElegido.id)
      .eq('estado', 'disponible')
      .select();

    setEnviando(false);

    if (errorUpdate) {
      setError('Algo falló. Intenta de nuevo.');
      return;
    }

    if (!data || data.length === 0) {
      setError('Justo se acaba de apartar ese número. Elige otro.');
      onActualizar();
      setNumeroElegido(null);
      return;
    }

    setConfirmado(numeroElegido.numero);
    onActualizar();
  }

  function cerrar() {
    setNumeroElegido(null);
    setNombre('');
    setContacto('');
    setError('');
    setConfirmado(null);
  }

  return (
    <div className="sorteo-tarjeta">
      <h2 className="nombre-animal" style={{ fontSize: 22 }}>{sorteo.titulo}</h2>
      {sorteo.descripcion && <p className="sorteo-texto">{sorteo.descripcion}</p>}
      {sorteo.premios && (
        <p className="sorteo-texto"><strong>Premios:</strong> {sorteo.premios}</p>
      )}
      <div className="sorteo-meta">
        {sorteo.fecha_sorteo && (
          <span>🗓️ Sorteo: {new Date(sorteo.fecha_sorteo + 'T12:00:00').toLocaleDateString('es', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
        )}
        {sorteo.precio_numero && <span>💵 {sorteo.precio_numero}</span>}
      </div>

      <div className="leyenda-sorteo">
        <span><i className="punto-leyenda disponible" /> Disponible</span>
        <span><i className="punto-leyenda reservado" /> Reservado</span>
        <span><i className="punto-leyenda pagado" /> Vendido</span>
      </div>

      <div className="grilla-numeros">
        {numeros.map((n) => (
          <button
            key={n.id}
            type="button"
            className={`numero-sorteo ${n.estado}`}
            disabled={n.estado !== 'disponible'}
            onClick={() => setNumeroElegido(n)}
          >
            {String(n.numero).padStart(2, '0')}
          </button>
        ))}
      </div>

      {numeroElegido && (
        <div className="fondo-modal" onClick={cerrar}>
          <div className="tarjeta-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 380 }}>
            <button className="cerrar-modal" onClick={cerrar} aria-label="Cerrar">×</button>

            {confirmado === null ? (
              <>
                <h3 className="nombre-animal" style={{ fontSize: 20 }}>
                  Apartar el número {String(numeroElegido.numero).padStart(2, '0')}
                </h3>
                <p className="ayuda-fotos">
                  Esto no confirma el pago todavía. Después de apartar, te vamos a pedir que
                  envíes tu comprobante por WhatsApp para confirmarlo.
                </p>
                {error && <div className="mensaje error">{error}</div>}
                <form onSubmit={reservar}>
                  <div className="campo">
                    <label>Tu nombre</label>
                    <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} />
                  </div>
                  <div className="campo">
                    <label>Tu teléfono o contacto</label>
                    <input type="text" value={contacto} onChange={(e) => setContacto(e.target.value)} />
                  </div>
                  <button className="boton-poster rojo" type="submit" disabled={enviando} style={{ width: '100%' }}>
                    {enviando ? 'Apartando...' : 'Apartar este número'}
                  </button>
                </form>
              </>
            ) : (
              <>
                <h3 className="nombre-animal" style={{ fontSize: 20 }}>
                  ¡Número {String(confirmado).padStart(2, '0')} apartado! 🎉
                </h3>
                <p className="ayuda-fotos">
                  Envía tu comprobante de pago por WhatsApp para confirmar tu número.
                </p>
                <a
                  className="boton-poster rojo"
                  style={{ width: '100%', textAlign: 'center', display: 'block' }}
                  target="_blank"
                  rel="noopener noreferrer"
                  href={enlaceWhatsApp(
                    sorteo.whatsapp,
                    `Hola! Aparté el número ${String(confirmado).padStart(2, '0')} del sorteo "${sorteo.titulo}". Mi nombre es ${nombre}. Aquí les envío mi comprobante de pago.`
                  )}
                >
                  📲 Enviar comprobante por WhatsApp
                </a>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
