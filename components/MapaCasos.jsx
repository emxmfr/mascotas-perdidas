'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export default function MapaCasos({ animales, onSeleccionar }) {
  const conUbicacion = animales.filter((a) => a.latitud && a.longitud);

  if (conUbicacion.length === 0) {
    return (
      <p className="vacio">
        Ningún caso visible tiene ubicación guardada todavía. Al registrar un caso nuevo,
        usa el botón "Usar mi ubicación actual" para que aparezca aquí.
      </p>
    );
  }

  const centro = [conUbicacion[0].latitud, conUbicacion[0].longitud];

  return (
    <div className="mapa-contenedor">
      <MapContainer center={centro} zoom={12} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {conUbicacion.map((a) => (
          <Marker key={a.id} position={[a.latitud, a.longitud]}>
            <Popup>
              <strong>{a.nombre || a.tipo}</strong>
              <br />
              {a.estado === 'perdido' ? 'Perdido' : a.estado === 'encontrado' ? 'Encontrado' : 'En casa'}
              <br />
              <button
                type="button"
                onClick={() => onSeleccionar(a)}
                style={{
                  marginTop: 6,
                  background: '#4f772d',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 6,
                  padding: '5px 10px',
                  cursor: 'pointer',
                }}
              >
                Ver caso
              </button>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
