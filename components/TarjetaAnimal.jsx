import { buscarColor, etiquetaEstado } from '@/lib/opciones';
import MuestraColor from './MuestraColor';

export default function TarjetaAnimal({ animal, onClick }) {
  const fecha = animal.creado_en
    ? new Date(animal.creado_en).toLocaleDateString('es', { day: '2-digit', month: 'short' })
    : '';
  const colorInfo = buscarColor(animal.color);
  const fotos = animal.foto_urls?.length ? animal.foto_urls : animal.foto_url ? [animal.foto_url] : [];

  return (
    <article className="tarjeta" onClick={onClick} role="button" tabIndex={0}>
      <div className="chincheta" />
      <span className={`etiqueta-estado ${animal.estado}`}>
        {etiquetaEstado(animal.estado)}
      </span>

      {fotos.length > 0 ? (
        <div style={{ position: 'relative' }}>
          <img className="foto-animal" src={fotos[0]} alt={animal.nombre || animal.tipo} />
          {fotos.length > 1 && <span className="contador-fotos">📷 {fotos.length}</span>}
        </div>
      ) : (
        <div className="foto-vacia">Sin foto</div>
      )}

      <h3 className="nombre-animal">{animal.nombre || animal.tipo}</h3>
      <p className="meta-animal">
        {animal.tipo} ·{' '}
        {colorInfo && <MuestraColor color={colorInfo} tamano="13px" />}{' '}
        {animal.color || 'color no especificado'} · {animal.tamano || 'tamaño no especificado'}
        {animal.sexo ? ` · ${animal.sexo}` : ''}
        <br />
        Zona: {animal.zona}
        {animal.descripcion ? <><br />{animal.descripcion}</> : null}
      </p>

      <div className="tiras">
        <span>{fecha}</span>
        <span>{animal.contacto}</span>
      </div>
    </article>
  );
}
