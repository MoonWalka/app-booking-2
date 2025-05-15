import React, { useState } from 'react';
import styles from './ProgrammateurAddressSection.module.css';
import { useAdresseValidation } from '@/hooks/programmateurs';
import Card from '../../../components/ui/Card';

const ProgrammateurAddressSection = ({
  programmateur,
  formData,
  handleChange,
  isEditing
}) => {
  const [showValidation, setShowValidation] = useState(false);
  const adresseData = isEditing 
    ? formData.structure 
    : {
        adresse: programmateur?.structureAdresse || '',
        codePostal: programmateur?.structureCodePostal || '',
        ville: programmateur?.structureVille || '',
        pays: programmateur?.structurePays || 'France'
      };
      
  const { 
    isValidating,
    suggestions,
    validationMessage,
    validateAdresse,
    selectSuggestion,
    formatFullAddress
  } = useAdresseValidation(adresseData);

  // Check address validity
  const handleValidateAddress = async () => {
    setShowValidation(true);
    await validateAdresse(
      formData.structure.adresse,
      formData.structure.codePostal,
      formData.structure.ville,
      formData.structure.pays
    );
  };

  // Select a suggested address
  const handleSelectSuggestion = (suggestion) => {
    const addressComponents = selectSuggestion(suggestion);
    
    // Update form data with selected address
    if (handleChange) {
      const syntheticEvent = (name, value) => ({ target: { name, value } });
      
      handleChange(syntheticEvent('structure.adresse', addressComponents.adresse));
      handleChange(syntheticEvent('structure.codePostal', addressComponents.codePostal));
      handleChange(syntheticEvent('structure.ville', addressComponents.ville));
      handleChange(syntheticEvent('structure.pays', addressComponents.pays));
    }
    
    setShowValidation(false);
  };

  // Format full address for display
  const getFullAddress = () => {
    if (!programmateur) return 'Adresse non spécifiée';
    
    const addrParts = [];
    
    if (programmateur.structureAdresse) addrParts.push(programmateur.structureAdresse);
    
    let cityPart = '';
    if (programmateur.structureCodePostal) cityPart += programmateur.structureCodePostal;
    if (programmateur.structureVille) {
      if (cityPart) cityPart += ' ';
      cityPart += programmateur.structureVille;
    }
    
    if (cityPart) addrParts.push(cityPart);
    if (programmateur.structurePays && programmateur.structurePays !== 'France') {
      addrParts.push(programmateur.structurePays);
    }
    
    return addrParts.length > 0 ? addrParts.join(', ') : 'Adresse non spécifiée';
  };

  // Contenu de la section d'adresse
  const addressContent = (
    <>
      {isEditing ? (
        <>
          <div className={styles.formGroup}>
            <label htmlFor="structure.adresse" className={styles.cardLabel}>Adresse complète</label>
            <div className="input-group">
              <input
                type="text"
                className="form-control"
                id="structure.adresse"
                name="structure.adresse"
                value={formData.structure.adresse}
                onChange={handleChange}
                placeholder="Numéro et nom de rue"
              />
              <button
                className="btn btn-outline-secondary"
                type="button"
                onClick={handleValidateAddress}
                disabled={!formData.structure.adresse || isValidating}
              >
                {isValidating ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                    Validation...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check2-circle me-1"></i>
                    Valider
                  </>
                )}
              </button>
            </div>
          </div>
          
          <div className="row mb-3">
            <div className="col-md-4">
              <div className={styles.formGroup}>
                <label htmlFor="structure.codePostal" className={styles.cardLabel}>Code postal</label>
                <input
                  type="text"
                  className="form-control"
                  id="structure.codePostal"
                  name="structure.codePostal"
                  value={formData.structure.codePostal}
                  onChange={handleChange}
                  placeholder="Ex: 75001"
                />
              </div>
            </div>
            <div className="col-md-8">
              <div className={styles.formGroup}>
                <label htmlFor="structure.ville" className={styles.cardLabel}>Ville</label>
                <input
                  type="text"
                  className="form-control"
                  id="structure.ville"
                  name="structure.ville"
                  value={formData.structure.ville}
                  onChange={handleChange}
                  placeholder="Ex: Paris"
                />
              </div>
            </div>
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="structure.pays" className={styles.cardLabel}>Pays</label>
            <input
              type="text"
              className="form-control"
              id="structure.pays"
              name="structure.pays"
              value={formData.structure.pays}
              onChange={handleChange}
              placeholder="Ex: France"
            />
          </div>
          
          {/* Address validation results */}
          {showValidation && validationMessage && (
            <div className={`alert ${validationMessage.includes('error') ? 'alert-danger' : 'alert-warning'} mt-3`}>
              {validationMessage}
            </div>
          )}
          
          {/* Address suggestions */}
          {showValidation && suggestions && suggestions.length > 0 && (
            <div className={styles.suggestionsContainer}>
              <h6 className="mt-3 mb-2">Suggestions d'adresses :</h6>
              <div className={styles.suggestionsList}>
                {suggestions.slice(0, 5).map((suggestion, index) => (
                  <div 
                    key={index}
                    className={styles.suggestionItem}
                    onClick={() => handleSelectSuggestion(suggestion)}
                  >
                    <i className="bi bi-geo-alt-fill me-2"></i>
                    <span>{suggestion.display_name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className={styles.addressDisplay}>
          <p className="mb-3 fs-5">{getFullAddress()}</p>
          
          {programmateur?.structureAdresse && (
            <a 
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(getFullAddress())}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-sm btn-outline-secondary"
            >
              <i className="bi bi-map me-2"></i>
              Voir sur la carte
            </a>
          )}
        </div>
      )}
    </>
  );

  // Utilisation du composant Card standardisé au lieu de la structure personnalisée
  return (
    <Card
      title="Adresse"
      icon={<i className="bi bi-geo-alt"></i>}
      className={styles.addressCard}
      isEditing={isEditing}
    >
      {addressContent}
    </Card>
  );
};

export default ProgrammateurAddressSection;
