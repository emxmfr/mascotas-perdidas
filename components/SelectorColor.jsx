import MuestraColor from './MuestraColor';
import { COLORES } from '@/lib/opciones';

export default function SelectorColor({ valores, onToggle, otroTexto, onOtroTexto }) {
  const incluyeOtro = valores.includes('Otro');

  return (
    <div>
      <div className="selector-color">
        {COLORES.map((color) => (
          <button
            key={color.valor}
            type="button"
            className={`opcion-color ${valores.includes(color.valor) ? 'elegida' : ''}`}
            onClick={() => onToggle(color.valor)}
          >
            <MuestraColor color={color} />
            <span>{color.valor}</span>
          </button>
        ))}
      </div>

      {incluyeOtro && (
        <input
          type="text"
          className="campo-especificar"
          placeholder="Especifica el color (opcional)"
          value={otroTexto}
          onChange={(e) => onOtroTexto(e.target.value)}
        />
      )}
    </div>
  );
}
