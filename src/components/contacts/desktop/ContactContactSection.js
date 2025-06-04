import React from 'react';
import styles from './ContactSection.module.css';
import Card from '../../../components/ui/Card';

const ContactSection = ({ 
  contact, 
  formData, 
  handleChange, 
  isEditing, 
  formatValue,
  showCardWrapper = true // Nouvelle prop avec valeur par défaut à true pour rétrocompatibilité
}) => {
  // Get contact info from contact when in view mode
  const contactInfo = isEditing ? null : {
    nom: contact?.nom?.split(' ')[0] || '',
    prenom: contact?.prenom || (contact?.nom?.includes(' ') ? contact.nom.split(' ').slice(1).join(' ') : ''),
    fonction: contact?.fonction || '',
    email: contact?.email || '',
    telephone: contact?.telephone || ''
  };

  // Contenu principal de la section
  const sectionContent = (
    <>
      {isEditing ? (
        // Edit mode
        <>
          <div className="row g-3 mb-3">
            <div className="col-md-6">
              <div className={styles.formGroup}>
                <label htmlFor="contact.nom" className={styles.cardLabel}>Nom <span className="text-danger">*</span></label>
                <input
                  type="text"
                  className={styles.formField}
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
                  className={styles.formField}
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
              className={styles.formField}
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
                    className={styles.formField}
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
                    className={styles.formField}
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
                  {formatValue ? formatValue(contactInfo.nom) : contactInfo.nom || 'Non spécifié'}
                </p>
              </div>
            </div>
            <div className="col-md-6">
              <div className={styles.formGroup}>
                <label className={styles.cardLabel}>Prénom</label>
                <p className={`${styles.fieldValue} ${styles.fieldValueHighlight}`}>
                  {formatValue ? formatValue(contactInfo.prenom) : contactInfo.prenom || 'Non spécifié'}
                </p>
              </div>
            </div>
          </div>

          <div className={styles.formSection}>
            <label className={styles.cardLabel}>Fonction</label>
            <p className={styles.fieldValue}>
              {formatValue ? formatValue(contactInfo.fonction) : contactInfo.fonction || 'Non spécifié'}
            </p>
          </div>

          <div className="row g-3">
            <div className="col-md-6">
              <div className={styles.formGroup}>
                <label className={styles.cardLabel}>Email</label>
                <p className={styles.fieldValue}>
                  {contactInfo.email ? (
                    <a href={`mailto:${contactInfo.email}`} className="text-decoration-none">
                      <i className="bi bi-envelope me-1"></i>
                      {contactInfo.email}
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
                  {contactInfo.telephone ? (
                    <a href={`tel:${contactInfo.telephone}`} className="text-decoration-none">
                      <i className="bi bi-telephone me-1"></i>
                      {contactInfo.telephone}
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
    </>
  );

  // Si on ne veut pas le wrapper de carte, on retourne directement le contenu
  if (!showCardWrapper) {
    return sectionContent;
  }

  // Utilisation du composant Card standardisé au lieu de la structure personnalisée
  return (
    <Card
      title="Informations du contact"
      icon={<i className="bi bi-person-vcard"></i>}
      className={styles.contactCard}
      isEditing={isEditing}
    >
      {sectionContent}
    </Card>
  );
};

export default ContactSection;
