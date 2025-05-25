import React from 'react';
import styles from './ContratTemplateInfoSection.module.css';

/**
 * Section d'informations générales pour l'éditeur de modèle de contrat
 */
const ContratTemplateInfoSection = ({ 
  name, 
  setName, 
  templateType, 
  setTemplateType, 
  isDefault, 
  setIsDefault, 
  templateTypes 
}) => {
  return (
    <div className={styles.templateInfoCard}>
      <div className="row">
        <div className="col-md-6">
          <div className="form-group mb-3">
            <label htmlFor="templateName">Nom du modèle</label>
            <input
              type="text"
              id="templateName"
              className="form-control"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Contrat standard de prestation musicale"
            />
          </div>
        </div>
        <div className="col-md-6">
          <div className="form-group mb-3">
            <label htmlFor="templateType">Type de modèle</label>
            <select
              id="templateType"
              className="form-select"
              value={templateType}
              onChange={(e) => setTemplateType(e.target.value)}
            >
              {templateTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      <div className="form-check my-3">
        <input
          type="checkbox"
          id="isDefault"
          className="form-check-input"
          checked={isDefault}
          onChange={(e) => setIsDefault(e.target.checked)}
        />
        <label className="form-check-label" htmlFor="isDefault">
          Utiliser comme modèle par défaut
        </label>
      </div>
    </div>
  );
};

export default ContratTemplateInfoSection;