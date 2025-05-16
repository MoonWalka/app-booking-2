import React from 'react';
import Card from '@/components/ui/Card';
import styles from '../LieuForm.module.css';

const LieuInfoSection = ({ lieu, isEditing = false, handleChange }) => {
  const typeOptions = [
    { value: '', label: 'Sélectionner un type' },
    { value: 'salle', label: 'Salle de concert' },
    { value: 'bar', label: 'Bar' },
    { value: 'plein_air', label: 'Plein air' },
    { value: 'theatre', label: 'Théâtre' },
    { value: 'mjo', label: 'MJO/MJC' },
    { value: 'autre', label: 'Autre' }
  ];

  // Format date for display
  const formatDate = (timestamp) => {
    if (!timestamp) return 'Non spécifiée';
    const date = timestamp instanceof Date ? timestamp : new Date(timestamp.seconds ? timestamp.seconds * 1000 : timestamp);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card
      title="Informations additionnelles"
      icon={<i className="bi bi-info-circle"></i>}
      isEditing={isEditing}
      isHoverable={!isEditing}
    >
      {isEditing ? (
        <div className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label htmlFor="nom" className={styles.formLabel}>Nom du lieu *</label>
            <input
              id="nom"
              className={styles.formInput}
              name="nom"
              value={lieu.nom}
              onChange={handleChange}
              placeholder="Nom du lieu"
              required
            />
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="type" className={styles.formLabel}>Type de lieu</label>
            <select
              id="type"
              className={styles.formInput}
              name="type"
              value={lieu.type}
              onChange={handleChange}
            >
              {typeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="capacite" className={styles.formLabel}>Capacité</label>
            <input
              id="capacite"
              className={styles.formInput}
              name="capacite"
              value={lieu.capacite}
              onChange={handleChange}
              placeholder="Nombre de personnes"
              type="number"
            />
          </div>
        </div>
      ) : (
        <>
          <div className="row mb-3">
            <div className="col-md-6">
              <div className={styles.formGroup}>
                <label className={styles.cardLabel}>Date de création</label>
                <p className="form-control-plaintext">
                  {lieu.createdAt ? formatDate(lieu.createdAt) : 'Non spécifiée'}
                </p>
              </div>
            </div>
            <div className="col-md-6">
              <div className={styles.formGroup}>
                <label className={styles.cardLabel}>Dernière modification</label>
                <p className="form-control-plaintext">
                  {lieu.updatedAt ? formatDate(lieu.updatedAt) : 'Non spécifiée'}
                </p>
              </div>
            </div>
          </div>
          
          <div className="row">
            <div className="col-md-12">
              <div className={styles.formGroup}>
                <label className={styles.cardLabel}>Identifiant</label>
                <p className="form-control-plaintext font-monospace small">
                  {lieu.id || ''}
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </Card>
  );
};

export default LieuInfoSection;
