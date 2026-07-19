'use client';

import { useState } from 'react';
import { buscarColor, etiquetaEstado } from '@/lib/opciones';
import MuestraColor from './MuestraColor';
import Reportes from './Reportes';

export default function ModalAnimal({ animal, onClose }) {
  const [indiceFoto, setIndiceFoto] = useState(0);

  const fecha = animal.creado_en
    ? new Date(animal.creado_en).toLocaleDateString('es', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    : '';

  const colores = animal.colores?.length ? animal.colores : animal.color ? [animal.color] : [];
  const fotos = animal.foto_urls?.length ? animal.foto_urls : animal.foto_url ? [animal.foto_url] : [];

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
              {colores.map((c) => {
                const info = buscarColor(c);
                return info ? <MuestraColor key={c} color={info} tamano="16px" /> : null;
              })}
              {colores.join(', ') || 'No especificado'}
              {animal.color_otro ? ` (${animal.color_otro})` : ''}
            </dd>
          </div>
          <div className="detalle-fila">
            <dt>Raza</dt>
            <dd>{animal.raza || 'No se sabe'}</dd>
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
        {animal.telefono && <p className="detalle-contacto">{animal.telefono}</p>}
        {animal.contacto_otro && (
          <p className="detalle-contacto" style={{ marginTop: 6 }}>{animal.contacto_otro}</p>
        )}
        {!animal.telefono && !animal.contacto_otro && animal.contacto && (
          <p className="detalle-contacto">{animal.contacto}</p>
        )}

        <div className="bloque-estado">
          <Reportes animalId={animal.id} animalNombre={animal.nombre || animal.tipo} />
        </div>
      </div>
    </div>
  );
}
