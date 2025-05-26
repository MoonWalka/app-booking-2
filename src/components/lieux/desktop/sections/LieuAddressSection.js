import React from 'react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import styles from '../LieuForm.module.css';

// Fix universel des icônes Leaflet (évite les 404 distmarker-*.png)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const LieuAddressSection = ({ lieu, isEditing = false, handleChange, addressSearch = {} }) => {
  // Add default empty object to prevent destructuring errors
  const {
    query = '',
    setQuery = () => {},
    suggestions = [],
    isLoading = false,
    handleSearch = () => {},
    selectAddress = () => {},
    geocodeCurrentAddress = () => {}
  } = addressSearch || {};

  const hasCoordinates = lieu?.latitude && lieu?.longitude;
  const mapPosition = hasCoordinates ? [lieu.latitude, lieu.longitude] : [46.603354, 1.888334]; // Centre de la France

  return (
    <Card
      title="Adresse"
      icon={<i className="bi bi-geo-alt"></i>}
      isEditing={isEditing}
      isHoverable={!isEditing}
    >
      {isEditing ? (
        <>
          <div className={styles.searchContainer}>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Rechercher une adresse..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                handleSearch(e.target.value);
              }}
            />
            {isLoading && <div className={styles.spinner}></div>}
            
            {suggestions.length > 0 && (
              <ul className={styles.searchSuggestions}>
                {suggestions.map((suggestion, index) => (
                  <li 
                    key={`${suggestion.place_id || index}`}
                    onClick={() => selectAddress(suggestion)}
                    className={styles.suggestionItem}
                  >
                    {suggestion.display_name}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label htmlFor="adresse" className={styles.formLabel}>Adresse *</label>
              <input
                id="adresse"
                className={styles.formInput}
                name="adresse"
                value={lieu?.adresse || ''}
                onChange={handleChange}
                placeholder="Rue, numéro"
                required
              />
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="codePostal" className={styles.formLabel}>Code postal *</label>
              <input
                id="codePostal"
                className={styles.formInput}
                name="codePostal"
                value={lieu?.codePostal || ''}
                onChange={handleChange}
                placeholder="Code postal"
                required
              />
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="ville" className={styles.formLabel}>Ville *</label>
              <input
                id="ville"
                className={styles.formInput}
                name="ville"
                value={lieu?.ville || ''}
                onChange={handleChange}
                placeholder="Ville"
                required
              />
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="pays" className={styles.formLabel}>Pays *</label>
              <input
                id="pays"
                className={styles.formInput}
                name="pays"
                value={lieu?.pays || ''}
                onChange={handleChange}
                placeholder="Pays"
                required
              />
            </div>
          </div>

          <div className={styles.geolocationActions}>
            <Button 
              type="button"
              variant="secondary"
              onClick={geocodeCurrentAddress}
              disabled={!lieu?.adresse || !lieu?.ville || isLoading}
            >
              <i className="bi bi-geo-alt"></i> Géolocaliser cette adresse
            </Button>
          </div>
        </>
      ) : (
        <>
          <div className="row mb-4">
            <div className="col-md-12">
              <div className={styles.formGroup}>
                <label className={styles.cardLabel}>Adresse complète</label>
                <p className="form-control-plaintext">
                  {lieu?.adresse || 'Non spécifié'}
                </p>
              </div>
            </div>
          </div>

          <div className="row mb-4">
            <div className="col-md-4">
              <div className={styles.formGroup}>
                <label className={styles.cardLabel}>Code postal</label>
                <p className="form-control-plaintext">
                  {lieu?.codePostal || 'Non spécifié'}
                </p>
              </div>
            </div>
            <div className="col-md-5">
              <div className={styles.formGroup}>
                <label className={styles.cardLabel}>Ville</label>
                <p className="form-control-plaintext">
                  {lieu?.ville || 'Non spécifié'}
                </p>
              </div>
            </div>
            <div className="col-md-3">
              <div className={styles.formGroup}>
                <label className={styles.cardLabel}>Pays</label>
                <p className="form-control-plaintext">
                  {lieu?.pays || 'Non spécifié'}
                </p>
              </div>
            </div>
          </div>
        </>
      )}

      {hasCoordinates && (
        <div className={styles.mapContainer}>
          <MapContainer 
            center={mapPosition} 
            zoom={13} 
            scrollWheelZoom={false}
            className={styles.leafletMapComponent}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <Marker position={mapPosition} />
          </MapContainer>
          
          <div className={styles.coordinatesDisplay}>
            <span>Latitude: {lieu.latitude}</span>
            <span>Longitude: {lieu.longitude}</span>
          </div>
        </div>
      )}
    </Card>
  );
};

export default LieuAddressSection;
