import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import styles from './LieuMapDisplay.module.css';

// Fix Leaflet's default icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const LieuMapDisplay = ({ lieu, setLieu }) => {
  // Check if we have coordinates to display
  if (!lieu.latitude || !lieu.longitude) {
    return null;
  }

  // Create position array for Leaflet
  const position = [parseFloat(lieu.latitude), parseFloat(lieu.longitude)];

  return (
    <div className={styles.mapPreview}>
      <div className={styles.interactiveMapContainer}>
        <MapContainer 
          center={position} 
          zoom={16} 
          style={{ height: '300px', width: '100%', borderRadius: '4px' }}
          attributionControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={position}>
            <Popup>
              <strong>{lieu.nom || 'Nouveau lieu'}</strong><br />
              {lieu.adresse}<br />
              {lieu.codePostal} {lieu.ville}
            </Popup>
          </Marker>
        </MapContainer>
      </div>
      <small className="form-text text-muted mt-2">
        <i className="bi bi-info-circle me-1"></i>
        Emplacement basé sur l'adresse sélectionnée.
      </small>
    </div>
  );
};

export default LieuMapDisplay;
