import { buscarColor, etiquetaEstado } from '@/lib/opciones';
import MuestraColor from './MuestraColor';

export default function TarjetaAnimal({ animal, onClick }) {
  const fecha = animal.creado_en
    ? new Date(animal.creado_en).toLocaleDateString('es', { day: '2-digit', month: 'short' })
    : '';
  const colores = animal.colores?.length ? animal.colores : animal.color ? [animal.color] : [];
  const fotos = animal.foto_urls?.length ? animal.foto_urls : animal.foto_url ? [animal.foto_url] : [];

  return (
    <article className="tarjeta" onClick={onClick} role="button" tabIndex={0}>
      <div className="chincheta" />
      <span className={`etiqueta-estado ${animal.estado}`}>
        {etiquetaEstado(animal.estado)}
      </span>

      {fotos.length > 0 ? (
        <div style={{ position: 'relative', zIndex: 1 }}>
          <img className="foto-animal" src={fotos[0]} alt={animal.nombre || animal.tipo} />
          {fotos.length > 1 && <span className="contador-fotos">📷 {fotos.length}</span>}
        </div>
      ) : (
        <div className="foto-vacia">Sin foto</div>
      )}

      <h3 className="nombre-animal">{animal.nombre || animal.tipo}</h3>
      <p className="meta-animal">
        {animal.tipo} ·{' '}
        {colores.slice(0, 2).map((c) => {
          const info = buscarColor(c);
          return info ? <MuestraColor key={c} color={info} tamano="13px" /> : null;
        })}{' '}
        {colores.join(', ') || 'color no especificado'} · {animal.tamano || 'tamaño no especificado'}
        {animal.sexo ? ` · ${animal.sexo}` : ''}
        <br />
        Zona: {animal.zona}
        {animal.descripcion ? <><br />{animal.descripcion}</> : null}
      </p>

      <div className="tiras">
        <span>{fecha}</span>
        <span>{animal.telefono || animal.contacto_otro || animal.contacto}</span>
      </div>
    </article>
  );
}
