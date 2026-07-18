import MuestraColor from './MuestraColor';
import { COLORES } from '@/lib/opciones';

export default function SelectorColor({ valor, onChange }) {
  return (
    <div className="selector-color">
      {COLORES.map((color) => (
        <button
          key={color.valor}
          type="button"
          className={`opcion-color ${valor === color.valor ? 'elegida' : ''}`}
          onClick={() => onChange(color.valor)}
        >
          <MuestraColor color={color} />
          <span>{color.valor}</span>
        </button>
      ))}
    </div>
  );
}
