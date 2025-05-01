import React from 'react';
import styles from './LieuContactSection.module.css';

/**
 * Contact information section for a venue
 */
const LieuContactSection = ({ lieu, formData, isEditing, handleChange }) => {
  return (
    <div className={styles.formCard}>
      <div className={styles.cardHeader}>
        <i className="bi bi-person-lines-fill"></i>
        <h3>Informations de contact</h3>
      </div>
      <div className={styles.cardBody}>
        {isEditing ? (
          <>
            <div className={styles.formGroup}>
              <label htmlFor="contact.nom" className={styles.formLabel}>Personne à contacter</label>
              <input
                type="text"
                className="form-control"
                id="contact.nom"
                name="contact.nom"
                value={formData.contact?.nom || ''}
                onChange={handleChange}
                placeholder="Nom et prénom du contact"
              />
            </div>

            <div className="row">
              <div className="col-md-6">
                <div className={styles.formGroup}>
                  <label htmlFor="contact.telephone" className={styles.formLabel}>Téléphone</label>
                  <div className="input-group">
                    <span className="input-group-text"><i className="bi bi-telephone"></i></span>
                    <input
                      type="tel"
                      className="form-control"
                      id="contact.telephone"
                      name="contact.telephone"
                      value={formData.contact?.telephone || ''}
                      onChange={handleChange}
                      placeholder="Ex: 01 23 45 67 89"
                    />
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className={styles.formGroup}>
                  <label htmlFor="contact.email" className={styles.formLabel}>Email</label>
                  <div className="input-group">
                    <span className="input-group-text"><i className="bi bi-envelope"></i></span>
                    <input
                      type="email"
                      className="form-control"
                      id="contact.email"
                      name="contact.email"
                      value={formData.contact?.email || ''}
                      onChange={handleChange}
                      placeholder="Ex: contact@exemple.fr"
                    />
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          lieu.contact && (lieu.contact.nom || lieu.contact.telephone || lieu.contact.email) ? (
            <>
              {lieu.contact.nom && (
                <div className={styles.infoRow}>
                  <div className={styles.infoLabel}>
                    <i className="bi bi-person text-primary"></i>
                    Personne à contacter
                  </div>
                  <div className={styles.infoValue}>{lieu.contact.nom}</div>
                </div>
              )}
              {lieu.contact.telephone && (
                <div className={styles.infoRow}>
                  <div className={styles.infoLabel}>
                    <i className="bi bi-telephone text-primary"></i>
                    Téléphone
                  </div>
                  <div className={styles.infoValue}>
                    <a href={`tel:${lieu.contact.telephone}`} className={styles.contactLink}>
                      {lieu.contact.telephone}
                    </a>
                  </div>
                </div>
              )}
              {lieu.contact.email && (
                <div className={styles.infoRow}>
                  <div className={styles.infoLabel}>
                    <i className="bi bi-envelope text-primary"></i>
                    Email
                  </div>
                  <div className={styles.infoValue}>
                    <a href={`mailto:${lieu.contact.email}`} className={styles.contactLink}>
                      {lieu.contact.email}
                    </a>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className={styles.textEmpty}>Aucune information de contact renseignée pour ce lieu.</div>
          )
        )}
      </div>
    </div>
  );
};

export default LieuContactSection;