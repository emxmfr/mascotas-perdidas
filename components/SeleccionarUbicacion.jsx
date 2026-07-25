'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { obtenerUbicacion } from '@/lib/ubicacion';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function ClicMapa({ onClic }) {
  useMapEvents({
    click(e) {
      onClic(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function CentrarAlInicio() {
  const map = useMap();
  useEffect(() => {
    obtenerUbicacion()
      .then((coords) => map.setView([coords.lat, coords.lng], 15))
      .catch(() => {});
  }, [map]);
  return null;
}

export default function SeleccionarUbicacion({ posicion, onCambio }) {
  const centro = posicion ? [posicion.lat, posicion.lng] : [-12.8, -76.63];

  return (
    <div className="mapa-selector">
      <MapContainer center={centro} zoom={posicion ? 15 : 10} style={{ height: '260px', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {!posicion && <CentrarAlInicio />}
        <ClicMapa onClic={(lat, lng) => onCambio({ lat, lng })} />
        {posicion && (
          <Marker
            position={[posicion.lat, posicion.lng]}
            draggable
            eventHandlers={{
              dragend: (e) => {
                const { lat, lng } = e.target.getLatLng();
                onCambio({ lat, lng });
              },
            }}
          />
        )}
      </MapContainer>
    </div>
  );
}
