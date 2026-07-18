import { buscarColor } from '@/lib/opciones';
import MuestraColor from './MuestraColor';

export default function ModalAnimal({ animal, onClose }) {
  const fecha = animal.creado_en
    ? new Date(animal.creado_en).toLocaleDateString('es', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    : '';

  const colorInfo = buscarColor(animal.color);

  return (
    <div className="fondo-modal" onClick={onClose}>
      <div className="tarjeta-modal" onClick={(e) => e.stopPropagation()}>
        <button className="cerrar-modal" onClick={onClose} aria-label="Cerrar">
          ×
        </button>

        <span className={`etiqueta-estado ${animal.estado}`}>
          {animal.estado === 'encontrado' ? 'Encontrado' : 'Perdido'}
        </span>

        {animal.foto_url ? (
          <img className="foto-modal" src={animal.foto_url} alt={animal.nombre || animal.tipo} />
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
      </div>
    </div>
  );
}
