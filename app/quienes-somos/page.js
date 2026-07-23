export default function QuienesSomos() {
  return (
    <div className="formulario" style={{ maxWidth: 640 }}>
      <h2 className="nombre-animal" style={{ fontSize: 26, marginBottom: 6 }}>
        Quiénes somos
      </h2>
      <p style={{ fontSize: 14.5, lineHeight: 1.7, color: 'var(--ink-soft)' }}>
        Mascotas Perdidas es un tablón comunitario creado por vecinos, para vecinos.
        No somos una organización ni una empresa: somos una herramienta simple y
        gratuita para que cualquiera pueda reportar una mascota perdida o encontrada,
        y para que la comunidad ayude a reunir a los animales con sus familias lo más
        rápido posible.
      </p>

      <p className="detalle-etiqueta" style={{ marginTop: 20 }}>¿Cómo funciona?</p>
      <p style={{ fontSize: 14.5, lineHeight: 1.7, color: 'var(--ink-soft)' }}>
        Cualquiera puede registrar un caso con fotos y detalles, y cualquiera puede
        reportar un avistamiento o confirmar que un animal ya fue encontrado. Toda la
        información queda visible para que más ojos ayuden a buscar.
      </p>

      <p className="detalle-etiqueta" style={{ marginTop: 20 }}>¿Cómo puedes ayudar?</p>
      <ul style={{ fontSize: 14.5, lineHeight: 1.8, color: 'var(--ink-soft)', paddingLeft: 20 }}>
        <li>Comparte los casos de tu zona en tus redes o grupos de vecinos</li>
        <li>Si ves un animal parecido a alguno del tablón, repórtalo</li>
        <li>Sé paciente y amable: detrás de cada caso hay una familia preocupada</li>
      </ul>

      <p className="detalle-etiqueta" style={{ marginTop: 20 }}>¿Cómo puedes ayudarnos?</p>
      <p style={{ fontSize: 14.5, lineHeight: 1.7, color: 'var(--ink-soft)' }}>
        Somos parte de <strong>Huellitas Maleñas</strong>, un albergue de animales en Mala.
        De vez en cuando organizamos <strong>sorteos</strong> para recaudar fondos y seguir
        rescatando y cuidando animales — puedes participar y ver los sorteos activos en la
        sección <a href="/sorteos" style={{ color: 'var(--acento)', fontWeight: 700 }}>Sorteos</a>.
      </p>
      <p style={{ fontSize: 14.5, lineHeight: 1.7, color: 'var(--ink-soft)' }}>
        También ayudas muchísimo compartiendo los casos del tablón, reportando avistamientos,
        y difundiendo la página entre tus vecinos.
      </p>

      <p style={{ fontSize: 13, color: 'var(--ink-soft)', marginTop: 24 }}>
        ¿Tienes dudas, sugerencias o encontraste un error en el sitio? Escríbenos.
      </p>
    </div>
  );
}
