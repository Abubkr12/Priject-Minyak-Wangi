'use client';

import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect, useState } from 'react';

// Fix Leaflet marker icon issue in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function LocationMarker({ position, setPosition }: { position: [number, number], setPosition: (pos: [number, number]) => void }) {
  const map = useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });

  useEffect(() => {
    if (position) {
      map.flyTo(position, map.getZoom());
    }
  }, [position, map]);

  return position === null ? null : (
    <Marker position={position}></Marker>
  );
}

export default function MapComponent({ 
  position, 
  setPosition 
}: { 
  position: [number, number]; 
  setPosition: (pos: [number, number]) => void; 
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div style={{ height: '300px', width: '100%', background: 'var(--c-surface-1)', borderRadius: 'var(--r-lg)' }}></div>;

  return (
    <MapContainer center={position} zoom={13} scrollWheelZoom={true} style={{ height: '300px', width: '100%', borderRadius: 'var(--r-lg)', zIndex: 0 }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <LocationMarker position={position} setPosition={setPosition} />
    </MapContainer>
  );
}
