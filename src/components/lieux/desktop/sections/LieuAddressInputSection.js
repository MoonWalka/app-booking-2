import React from 'react';
import Card from '@/components/ui/Card';
import AddressInput from '@/components/ui/AddressInput';
import styles from '../LieuForm.module.css';

const LieuAddressInputSection = ({ lieu, isEditing = false, handleChange }) => {
  const hasCoordinates = lieu?.latitude && lieu?.longitude;

  // Callback pour quand une adresse complète est sélectionnée via autocomplétion
  const handleAddressSelected = React.useCallback((addressData) => {
    console.log('Adresse sélectionnée:', addressData);
    
    // Mettre à jour tous les champs d'adresse en une seule fois
    const updates = {
      adresse: addressData.adresse || lieu?.adresse || '',
      codePostal: addressData.codePostal || lieu?.codePostal || '',
      ville: addressData.ville || lieu?.ville || '',
      pays: addressData.pays || lieu?.pays || 'France',
      ...(addressData.latitude && { latitude: addressData.latitude }),
      ...(addressData.longitude && { longitude: addressData.longitude })
    };

    // Appeler handleChange pour chaque champ mis à jour
    Object.entries(updates).forEach(([fieldName, value]) => {
      handleChange({ target: { name: fieldName, value } });
    });
  }, [handleChange, lieu]);

  return (
    <Card
      title="Adresse"
      icon={<i className="bi bi-geo-alt"></i>}
      isEditing={isEditing}
      isHoverable={!isEditing}
    >
      {isEditing ? (
        <>
          {/* Utilisation du composant AddressInput commun */}
          <div className={styles.formGroup}>
            <AddressInput
              label="Adresse"
              value={lieu?.adresse || ''}
              onChange={(e) => handleChange({ target: { name: 'adresse', value: e.target.value } })}
              onAddressSelected={handleAddressSelected}
              placeholder="Commencez à taper pour rechercher une adresse..."
            />
          </div>
          
          <div className={styles.formGrid}>
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
                value={lieu?.pays || 'France'}
                onChange={handleChange}
                placeholder="Pays"
                required
              />
            </div>
          </div>
          
          {/* Affichage des coordonnées si disponibles */}
          {hasCoordinates && (
            <div className={styles.coordinatesDisplay}>
              <small>
                <i className="bi bi-geo"></i> Coordonnées : {lieu.latitude}, {lieu.longitude}
              </small>
            </div>
          )}
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

      {/* Section carte - Affichage conditionnel avec Google Maps */}
      {lieu?.adresse && lieu?.ville && (
        <div className={styles.mapContainer}>
          <iframe 
            title={`Carte de localisation de ${lieu.nom || 'ce lieu'}`}
            src={`https://maps.google.com/maps?q=${encodeURIComponent(`${lieu.adresse}, ${lieu.codePostal} ${lieu.ville}`)}&z=13&output=embed`}
            width="100%" 
            height="250" 
            style={{ border: 0, borderRadius: '8px' }}
            allowFullScreen="" 
            loading="lazy" 
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
          
          <div className={styles.mapActions} style={{ marginTop: '10px' }}>
            <a 
              href={`https://maps.google.com/maps?q=${encodeURIComponent(`${lieu.adresse}, ${lieu.codePostal} ${lieu.ville}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-sm btn-outline-primary"
            >
              <i className="bi bi-map me-1"></i>
              Voir en plein écran
            </a>
          </div>
        </div>
      )}
    </Card>
  );
};

export default LieuAddressInputSection;