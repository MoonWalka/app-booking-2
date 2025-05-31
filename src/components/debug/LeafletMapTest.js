import React from 'react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix universel des icônes Leaflet (évite les 404 distmarker-*.png)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const LeafletMapTest = () => {
  const position = [46.603354, 1.888334]; // Centre de la France

  return (
    <div style={{ padding: '20px', border: '1px solid #ddd', margin: '20px' }}>
      <h3>Test de la carte Leaflet</h3>
      <p>Position: {position[0]}, {position[1]}</p>
      
      <div style={{ height: '400px', border: '1px solid #ccc', borderRadius: '8px', overflow: 'hidden' }}>
        <MapContainer 
          center={position} 
          zoom={6} 
          scrollWheelZoom={false}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <Marker position={position} />
        </MapContainer>
      </div>
      
      <div style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>
        <p>✅ Si vous voyez une carte ici, Leaflet fonctionne correctement</p>
        <p>❌ Si vous ne voyez rien, il y a un problème avec la configuration Leaflet</p>
      </div>
    </div>
  );
};

export default LeafletMapTest;