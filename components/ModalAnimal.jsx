'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { buscarColor, etiquetaEstado } from '@/lib/opciones';
import MuestraColor from './MuestraColor';

export default function ModalAnimal({ animal, onClose, onActualizado }) {
  const [indiceFoto, setIndiceFoto] = useState(0);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [codigo, setCodigo] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [mensaje, setMensaje] = useState(null);

  const fecha = animal.creado_en
    ? new Date(animal.creado_en).toLocaleDateString('es', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    : '';

  const colorInfo = buscarColor(animal.color);
  const fotos = animal.foto_urls?.length ? animal.foto_urls : animal.foto_url ? [animal.foto_url] : [];

  const siguienteEstado = animal.estado === 'perdido' ? 'encontrado' : 'en_casa';
  const textoBoton = animal.estado === 'perdido' ? 'Marcar como encontrado' : 'Marcar que regresó a casa';

  async function confirmarCambioEstado() {
    if (!codigo.trim()) {
      setMensaje({ tipo: 'error', texto: 'Ingresa el código que se te dio al registrar el caso.' });
      return;
    }

    setEnviando(true);
    setMensaje(null);

    const { data, error } = await supabase
      .from('animales')
      .update({ estado: siguienteEstado })
      .eq('id', animal.id)
      .eq('codigo_edicion', codigo.trim().toUpperCase())
      .select();

    setEnviando(false);

    if (error) {
      setMensaje({ tipo: 'error', texto: 'Algo falló al actualizar. Intenta de nuevo.' });
      return;
    }

    if (!data || data.length === 0) {
      setMensaje({ tipo: 'error', texto: 'El código no coincide con este caso.' });
      return;
    }

    setMensaje({ tipo: 'ok', texto: '¡Estado actualizado!' });
    onActualizado?.({ ...animal, estado: siguienteEstado });
  }

  return (
    <div className="fondo-modal" onClick={onClose}>
      <div className="tarjeta-modal" onClick={(e) => e.stopPropagation()}>
        <button className="cerrar-modal" onClick={onClose} aria-label="Cerrar">
          ×
        </button>

        <span className={`etiqueta-estado ${animal.estado}`}>
          {etiquetaEstado(animal.estado)}
        </span>

        {fotos.length > 0 ? (
          <div className="carrusel">
            <img
              className="foto-animal foto-modal"
              src={fotos[indiceFoto]}
              alt={animal.nombre || animal.tipo}
            />
            {fotos.length > 1 && (
              <>
                <button
                  type="button"
                  className="flecha-carrusel izquierda"
                  onClick={() => setIndiceFoto((i) => (i === 0 ? fotos.length - 1 : i - 1))}
                  aria-label="Foto anterior"
                >
                  ‹
                </button>
                <button
                  type="button"
                  className="flecha-carrusel derecha"
                  onClick={() => setIndiceFoto((i) => (i === fotos.length - 1 ? 0 : i + 1))}
                  aria-label="Foto siguiente"
                >
                  ›
                </button>
                <div className="puntos-carrusel">
                  {fotos.map((_, i) => (
                    <span key={i} className={i === indiceFoto ? 'punto activo' : 'punto'} />
                  ))}
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="foto-vacia foto-modal">Sin foto</div>
        )}

        <h2 className="nombre-animal" style={{ fontSize: 24, marginTop: 14 }}>
          {animal.nombre || animal.tipo}
        </h2>

        <dl className="detalle-lista">
          <div className="detalle-fila">
            <dt>Tipo</dt>
            <dd>{animal.tipo}</dd>
          </div>
          <div className="detalle-fila">
            <dt>Color</dt>
            <dd className="detalle-color">
              {colorInfo && <MuestraColor color={colorInfo} />}
              {animal.color || 'No especificado'}
            </dd>
          </div>
          <div className="detalle-fila">
            <dt>Tamaño</dt>
            <dd>{animal.tamano || 'No especificado'}</dd>
          </div>
          <div className="detalle-fila">
            <dt>Sexo</dt>
            <dd>{animal.sexo || 'No se sabe'}</dd>
          </div>
          <div className="detalle-fila">
            <dt>Zona</dt>
            <dd>{animal.zona}</dd>
          </div>
          <div className="detalle-fila">
            <dt>Reportado</dt>
            <dd>{fecha}</dd>
          </div>
        </dl>

        {animal.senas && animal.senas.length > 0 && (
          <>
            <p className="detalle-etiqueta">Señas particulares</p>
            <ul className="lista-senas">
              {animal.senas.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </>
        )}

        {animal.descripcion && (
          <>
            <p className="detalle-etiqueta">Descripción</p>
            <p className="detalle-descripcion">{animal.descripcion}</p>
          </>
        )}

        <p className="detalle-etiqueta">Contacto</p>
        <p className="detalle-contacto">{animal.contacto}</p>

        {animal.estado !== 'en_casa' && (
          <div className="bloque-estado">
            {!mostrarForm ? (
              <button
                type="button"
                className="boton-poster"
                onClick={() => setMostrarForm(true)}
              >
                {textoBoton}
              </button>
            ) : (
              <div className="form-estado">
                <p className="detalle-etiqueta" style={{ marginTop: 0 }}>
                  ¿Es tu reporte? Ingresa el código que te dimos al registrarlo
                </p>
                {mensaje && <div className={`mensaje ${mensaje.tipo}`}>{mensaje.texto}</div>}
                <div className="fila-codigo">
                  <input
                    type="text"
                    placeholder="Ej. AB12CD"
                    value={codigo}
                    onChange={(e) => setCodigo(e.target.value)}
                  />
                  <button
                    type="button"
                    className="boton-poster rojo"
                    onClick={confirmarCambioEstado}
                    disabled={enviando}
                  >
                    {enviando ? 'Enviando...' : 'Confirmar'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
