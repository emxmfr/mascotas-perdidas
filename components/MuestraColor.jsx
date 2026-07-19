export default function MuestraColor({ color, tamano }) {
  const { tipo, c1, c2, c3 } = color;
  const estiloTamano = tamano ? { width: tamano, height: tamano, minWidth: tamano } : undefined;

  if (tipo === 'solido') {
    return <span className="muestra-color" style={{ background: c1, ...estiloTamano }} />;
  }

  if (tipo === 'rayas') {
    return (
      <span
        className="muestra-color"
        style={{
          background: `repeating-linear-gradient(35deg, ${c1} 0 5px, ${c2} 5px 8px)`,
          ...estiloTamano,
        }}
      />
    );
  }

  if (tipo === 'manchas') {
    return (
      <span
        className="muestra-color"
        style={{
          background: `
            radial-gradient(circle at 25% 30%, ${c2} 0 22%, transparent 23%),
            radial-gradient(circle at 70% 20%, ${c2} 0 18%, transparent 19%),
            radial-gradient(circle at 60% 65%, ${c2} 0 26%, transparent 27%),
            radial-gradient(circle at 20% 75%, ${c2} 0 16%, transparent 17%),
            ${c1}
          `,
          ...estiloTamano,
        }}
      />
    );
  }

  if (tipo === 'tricolor') {
    return (
      <span
        className="muestra-color"
        style={{
          background: `conic-gradient(${c1} 0deg 120deg, ${c2} 120deg 240deg, ${c3} 240deg 360deg)`,
          ...estiloTamano,
        }}
      />
    );
  }

  if (tipo === 'peluche') {
    return (
      <span
        className="muestra-color"
        style={{
          background: `
            radial-gradient(circle at 20% 20%, rgba(255,255,255,0.5) 0 3px, transparent 4px),
            radial-gradient(circle at 55% 15%, rgba(255,255,255,0.5) 0 3px, transparent 4px),
            radial-gradient(circle at 80% 30%, rgba(255,255,255,0.5) 0 3px, transparent 4px),
            radial-gradient(circle at 30% 55%, rgba(255,255,255,0.5) 0 3px, transparent 4px),
            radial-gradient(circle at 70% 65%, rgba(255,255,255,0.5) 0 3px, transparent 4px),
            radial-gradient(circle at 45% 85%, rgba(255,255,255,0.5) 0 3px, transparent 4px),
            radial-gradient(circle at 15% 80%, rgba(255,255,255,0.5) 0 3px, transparent 4px),
            ${c1}
          `,
          ...estiloTamano,
        }}
      />
    );
  }

  return (
    <span className="muestra-color muestra-otro" style={estiloTamano}>?</span>
  );
}
