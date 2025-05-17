import React from 'react';
import Card from '@/components/ui/Card';
import styles from '../LieuForm.module.css';

const LieuContactSection = ({ lieu, contact, isEditing = false, handleChange }) => {
  return (
    <Card
      title="Contact"
      icon={<i className="bi bi-person-vcard"></i>}
      isEditing={isEditing}
      isHoverable={!isEditing}
    >
      {isEditing ? (
        <div className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label htmlFor="contact.nom" className={styles.formLabel}>Nom du contact</label>
            <input
              id="contact.nom"
              className={styles.formInput}
              name="contact.nom"
              value={contact?.nom || ''}
              onChange={handleChange}
              placeholder="Nom complet"
            />
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="contact.telephone" className={styles.formLabel}>Téléphone</label>
            <input
              id="contact.telephone"
              className={styles.formInput}
              name="contact.telephone"
              value={contact?.telephone || ''}
              onChange={handleChange}
              placeholder="Numéro de téléphone"
              type="tel"
            />
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="contact.email" className={styles.formLabel}>Email</label>
            <input
              id="contact.email"
              className={styles.formInput}
              name="contact.email"
              value={contact?.email || ''}
              onChange={handleChange}
              placeholder="Adresse email"
              type="email"
            />
          </div>
        </div>
      ) : (
        <>
          <div className="row mb-4">
            <div className="col-md-12">
              <div className={styles.formGroup}>
                <label className={styles.cardLabel}>Nom du contact</label>
                <p className="form-control-plaintext">
                  {contact?.nom || 'Non spécifié'}
                </p>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-md-6">
              <div className={styles.formGroup}>
                <label className={styles.cardLabel}>Téléphone</label>
                <p className="form-control-plaintext">
                  {contact?.telephone ? (
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
            <div className="col-md-6">
              <div className={styles.formGroup}>
                <label className={styles.cardLabel}>Email</label>
                <p className="form-control-plaintext">
                  {contact?.email ? (
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
          </div>
        </>
      )}
    </Card>
  );
};

export default LieuContactSection;
