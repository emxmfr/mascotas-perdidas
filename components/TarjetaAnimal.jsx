export default function TarjetaAnimal({ animal, onClick }) {
  const fecha = animal.creado_en
    ? new Date(animal.creado_en).toLocaleDateString('es', { day: '2-digit', month: 'short' })
    : '';

  return (
    <article className="tarjeta" onClick={onClick} role="button" tabIndex={0}>
      <div className="chincheta" />
      <span className={`etiqueta-estado ${animal.estado}`}>
        {animal.estado === 'encontrado' ? 'Encontrado' : 'Perdido'}
      </span>

      {animal.foto_url ? (
        <img className="foto-animal" src={animal.foto_url} alt={animal.nombre || animal.tipo} />
      ) : (
        <div className="foto-vacia">Sin foto</div>
      )}

      <h3 className="nombre-animal">{animal.nombre || animal.tipo}</h3>
      <p className="meta-animal">
        {animal.tipo} · {animal.color || 'color no especificado'} · {animal.tamano || 'tamaño no especificado'}
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
