import React from 'react';
import styles from './LieuContactSection.module.css';

const LieuContactSection = ({ contact, handleChange }) => {
  return (
    <div className={styles.formCard}>
      <div className={styles.cardHeader}>
        <i className="bi bi-person-lines-fill"></i>
        <h3>Informations de contact</h3>
      </div>
      <div className={styles.cardBody}>
        <div className="mb-3">
          <label htmlFor="contact.nom" className="form-label">Personne à contacter</label>
          <input
            type="text"
            className="form-control"
            id="contact.nom"
            name="contact.nom"
            value={contact?.nom || ''}
            onChange={handleChange}
            placeholder="Nom et prénom du contact"
          />
        </div>

        <div className="row mb-3">
          <div className="col-md-6">
            <div className="mb-md-0">
              <label htmlFor="contact.telephone" className="form-label">Téléphone</label>
              <div className="input-group">
                <span className="input-group-text"><i className="bi bi-telephone"></i></span>
                <input
                  type="tel"
                  className="form-control"
                  id="contact.telephone"
                  name="contact.telephone"
                  value={contact?.telephone || ''}
                  onChange={handleChange}
                  placeholder="Ex: 01 23 45 67 89"
                />
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="mb-md-0">
              <label htmlFor="contact.email" className="form-label">Email</label>
              <div className="input-group">
                <span className="input-group-text"><i className="bi bi-envelope"></i></span>
                <input
                  type="email"
                  className="form-control"
                  id="contact.email"
                  name="contact.email"
                  value={contact?.email || ''}
                  onChange={handleChange}
                  placeholder="Ex: contact@exemple.fr"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LieuContactSection;
