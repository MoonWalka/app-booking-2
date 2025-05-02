import React from 'react';
import styles from './ProgrammateurContactSection.module.css';

const ProgrammateurContactSection = ({ 
  programmateur, 
  formData, 
  handleChange, 
  isEditing, 
  formatValue 
}) => {
  // Get contact info from programmateur when in view mode
  const contact = isEditing ? null : {
    nom: programmateur?.nom?.split(' ')[0] || '',
    prenom: programmateur?.prenom || (programmateur?.nom?.includes(' ') ? programmateur.nom.split(' ').slice(1).join(' ') : ''),
    fonction: programmateur?.fonction || '',
    email: programmateur?.email || '',
    telephone: programmateur?.telephone || ''
  };

  return (
    <div className={styles.cardWrapper}>
      <div className={styles.cardHeader}>
        <i className="bi bi-person-vcard text-primary"></i>
        <h5 className="mb-0">Informations du contact</h5>
      </div>
      <div className={styles.cardBody}>
        {isEditing ? (
          // Edit mode
          <>
            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <div className={styles.formGroup}>
                  <label htmlFor="contact.nom" className={styles.cardLabel}>Nom <span className="text-danger">*</span></label>
                  <input
                    type="text"
                    className="form-control"
                    id="contact.nom"
                    name="contact.nom"
                    value={formData.contact.nom}
                    onChange={handleChange}
                    required
                    placeholder="Ex: Dupont"
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className={styles.formGroup}>
                  <label htmlFor="contact.prenom" className={styles.cardLabel}>Prénom</label>
                  <input
                    type="text"
                    className="form-control"
                    id="contact.prenom"
                    name="contact.prenom"
                    value={formData.contact.prenom}
                    onChange={handleChange}
                    placeholder="Ex: Jean"
                  />
                </div>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="contact.fonction" className={styles.cardLabel}>Fonction</label>
              <input
                type="text"
                className="form-control"
                id="contact.fonction"
                name="contact.fonction"
                value={formData.contact.fonction}
                onChange={handleChange}
                placeholder="Ex: Directeur artistique"
              />
            </div>

            <div className="row g-3">
              <div className="col-md-6">
                <div className={styles.formGroup}>
                  <label htmlFor="contact.email" className={styles.cardLabel}>Email</label>
                  <div className="input-group">
                    <span className="input-group-text"><i className="bi bi-envelope"></i></span>
                    <input
                      type="email"
                      className="form-control"
                      id="contact.email"
                      name="contact.email"
                      value={formData.contact.email}
                      onChange={handleChange}
                      placeholder="Ex: jean.dupont@example.com"
                    />
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className={styles.formGroup}>
                  <label htmlFor="contact.telephone" className={styles.cardLabel}>Téléphone</label>
                  <div className="input-group">
                    <span className="input-group-text"><i className="bi bi-telephone"></i></span>
                    <input
                      type="tel"
                      className="form-control"
                      id="contact.telephone"
                      name="contact.telephone"
                      value={formData.contact.telephone}
                      onChange={handleChange}
                      placeholder="Ex: 01 23 45 67 89"
                    />
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          // View mode
          <>
            <div className="row g-3">
              <div className="col-md-6">
                <div className={styles.formGroup}>
                  <label className={styles.cardLabel}>Nom</label>
                  <p className={`${styles.fieldValue} ${styles.fieldValueHighlight}`}>
                    {formatValue ? formatValue(contact.nom) : contact.nom || 'Non spécifié'}
                  </p>
                </div>
              </div>
              <div className="col-md-6">
                <div className={styles.formGroup}>
                  <label className={styles.cardLabel}>Prénom</label>
                  <p className={`${styles.fieldValue} ${styles.fieldValueHighlight}`}>
                    {formatValue ? formatValue(contact.prenom) : contact.prenom || 'Non spécifié'}
                  </p>
                </div>
              </div>
            </div>

            <div className={styles.formSection}>
              <label className={styles.cardLabel}>Fonction</label>
              <p className={styles.fieldValue}>
                {formatValue ? formatValue(contact.fonction) : contact.fonction || 'Non spécifié'}
              </p>
            </div>

            <div className="row g-3">
              <div className="col-md-6">
                <div className={styles.formGroup}>
                  <label className={styles.cardLabel}>Email</label>
                  <p className={styles.fieldValue}>
                    {contact.email ? (
                      <a href={`mailto:${contact.email}`} className="text-decoration-none">
                        <i className="bi bi-envelope me-1"></i>
                        {contact.email}
                      </a>
                    ) : (
                      <span className={styles.fieldEmpty}>Non spécifié</span>
                    )}
                  </p>
                </div>
              </div>
              <div className="col-md-6">
                <div className={styles.formGroup}>
                  <label className={styles.cardLabel}>Téléphone</label>
                  <p className={styles.fieldValue}>
                    {contact.telephone ? (
                      <a href={`tel:${contact.telephone}`} className="text-decoration-none">
                        <i className="bi bi-telephone me-1"></i>
                        {contact.telephone}
                      </a>
                    ) : (
                      <span className={styles.fieldEmpty}>Non spécifié</span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ProgrammateurContactSection;
