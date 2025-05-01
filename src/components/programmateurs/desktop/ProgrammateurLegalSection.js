import React from 'react';
import styles from './ProgrammateurLegalSection.module.css';

const ProgrammateurLegalSection = ({
  programmateur,
  formData,
  handleChange,
  isEditing,
  formatValue
}) => {
  // Get structure info from programmateur when in view mode
  const structure = isEditing ? null : {
    raisonSociale: programmateur?.structure || '',
    type: programmateur?.structureType || '',
    adresse: programmateur?.structureAdresse || '',
    codePostal: programmateur?.structureCodePostal || '',
    ville: programmateur?.structureVille || '',
    pays: programmateur?.structurePays || 'France',
    siret: programmateur?.siret || '',
    tva: programmateur?.tva || ''
  };

  return (
    <div className={styles.cardWrapper}>
      <div className={styles.cardHeader}>
        <i className="bi bi-building text-primary"></i>
        <h5 className="mb-0">Structure juridique</h5>
      </div>
      <div className={styles.cardBody}>
        {isEditing ? (
          // Edit mode
          <>
            {/* Première ligne: Raison sociale et Type */}
            <div className="row mb-4">
              <div className="col-md-7">
                <div className={styles.formGroup}>
                  <label htmlFor="structure.raisonSociale" className={styles.cardLabel}>Raison sociale</label>
                  <input
                    type="text"
                    className="form-control"
                    id="structure.raisonSociale"
                    name="structure.raisonSociale"
                    value={formData.structure.raisonSociale}
                    onChange={handleChange}
                    placeholder="Ex: Association Culturelle XYZ"
                  />
                </div>
              </div>
              <div className="col-md-5">
                <div className={styles.formGroup}>
                  <label htmlFor="structure.type" className={styles.cardLabel}>Type de structure</label>
                  <select
                    className="form-select"
                    id="structure.type"
                    name="structure.type"
                    value={formData.structure.type}
                    onChange={handleChange}
                  >
                    <option value="">Sélectionnez un type</option>
                    <option value="association">Association</option>
                    <option value="mairie">Mairie / Collectivité</option>
                    <option value="entreprise">Entreprise</option>
                    <option value="auto-entrepreneur">Auto-entrepreneur</option>
                    <option value="autre">Autre</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Adresse complète */}
            <div className={styles.formGroup}>
              <label htmlFor="structure.adresse" className={styles.cardLabel}>Adresse complète</label>
              <input
                type="text"
                className="form-control"
                id="structure.adresse"
                name="structure.adresse"
                value={formData.structure.adresse}
                onChange={handleChange}
                placeholder="Numéro et nom de rue"
              />
            </div>

            {/* Code postal, Ville, Pays */}
            <div className="row mb-4">
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
              <div className="col-md-5">
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
              <div className="col-md-3">
                <div className={styles.formGroup}>
                  <label htmlFor="structure.pays" className={styles.cardLabel}>Pays</label>
                  <input
                    type="text"
                    className="form-control"
                    id="structure.pays"
                    name="structure.pays"
                    value={formData.structure.pays}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* SIRET et TVA */}
            <div className="row">
              <div className="col-md-6">
                <div className={styles.formGroup}>
                  <label htmlFor="structure.siret" className={styles.cardLabel}>SIRET</label>
                  <input
                    type="text"
                    className={`form-control ${styles.cardValueCode}`}
                    id="structure.siret"
                    name="structure.siret"
                    value={formData.structure.siret}
                    onChange={handleChange}
                    placeholder="Ex: 123 456 789 00012"
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className={styles.formGroup}>
                  <label htmlFor="structure.tva" className={styles.cardLabel}>
                    N° TVA intracommunautaire <span className={styles.optionalText}>(facultatif)</span>
                  </label>
                  <input
                    type="text"
                    className={`form-control ${styles.cardValueCode}`}
                    id="structure.tva"
                    name="structure.tva"
                    value={formData.structure.tva}
                    onChange={handleChange}
                    placeholder="Ex: FR123456789"
                  />
                </div>
              </div>
            </div>
          </>
        ) : (
          // View mode
          <>
            <div className="row mb-4">
              <div className="col-md-7">
                <div className={styles.formGroup}>
                  <label className={styles.cardLabel}>Raison sociale</label>
                  <p className="form-control-plaintext">{formatValue ? formatValue(structure.raisonSociale) : structure.raisonSociale || 'Non spécifié'}</p>
                </div>
              </div>
              <div className="col-md-5">
                <div className={styles.formGroup}>
                  <label className={styles.cardLabel}>Type de structure</label>
                  <p className="form-control-plaintext">
                    {formatValue ? formatValue(structure.type ? (
                      <span>
                        {structure.type === 'association' ? 'Association' :
                         structure.type === 'mairie' ? 'Mairie / Collectivité' :
                         structure.type === 'entreprise' ? 'Entreprise' :
                         structure.type === 'auto-entrepreneur' ? 'Auto-entrepreneur' :
                         structure.type}
                      </span>
                    ) : '') : (structure.type || 'Non spécifié')}
                  </p>
                </div>
              </div>
            </div>

            <div className={styles.formSection}>
              <label className={styles.cardLabel}>Adresse complète</label>
              <p className="form-control-plaintext">{formatValue ? formatValue(structure.adresse) : structure.adresse || 'Non spécifié'}</p>
            </div>

            <div className="row mb-4">
              <div className="col-md-4">
                <div className={styles.formGroup}>
                  <label className={styles.cardLabel}>Code postal</label>
                  <p className="form-control-plaintext">{formatValue ? formatValue(structure.codePostal) : structure.codePostal || 'Non spécifié'}</p>
                </div>
              </div>
              <div className="col-md-5">
                <div className={styles.formGroup}>
                  <label className={styles.cardLabel}>Ville</label>
                  <p className="form-control-plaintext">{formatValue ? formatValue(structure.ville) : structure.ville || 'Non spécifié'}</p>
                </div>
              </div>
              <div className="col-md-3">
                <div className={styles.formGroup}>
                  <label className={styles.cardLabel}>Pays</label>
                  <p className="form-control-plaintext">{formatValue ? formatValue(structure.pays) : structure.pays || 'Non spécifié'}</p>
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-md-6">
                <div className={styles.formGroup}>
                  <label className={styles.cardLabel}>SIRET</label>
                  <p className="form-control-plaintext">{formatValue ? formatValue(structure.siret) : structure.siret || 'Non spécifié'}</p>
                </div>
              </div>
              <div className="col-md-6">
                <div className={styles.formGroup}>
                  <label className={styles.cardLabel}>N° TVA intracommunautaire</label>
                  <p className="form-control-plaintext">{formatValue ? formatValue(structure.tva) : structure.tva || 'Non spécifié'}</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ProgrammateurLegalSection;
