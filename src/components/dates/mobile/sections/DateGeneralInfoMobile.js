import React from 'react';
import { Card, Form, Badge } from 'react-bootstrap';
import styles from './DateGeneralInfoMobile.module.css';

/**
 * Affiche les informations générales d'un date en version mobile
 */
const DateGeneralInfoMobile = ({
  date,
  isEditMode,
  formData,
  onChange,
  formatDate,
  formatMontant,
  isDatePassed,
  statusInfo,
  artiste,
  formDataStatus
}) => {
  // Options pour le statut du date
  const statutOptions = [
    { value: 'contact', label: 'Contact' },
    { value: 'preaccord', label: 'Pré-accord' },
    { value: 'contrat', label: 'Contrat' },
    { value: 'acompte', label: 'Acompte' },
    { value: 'solde', label: 'Solde' }
  ];

  // Définition des couleurs pour les badges de statut
  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'contact': return 'secondary';
      case 'preaccord': return 'info';
      case 'contrat': return 'primary';
      case 'acompte': return 'warning';
      case 'solde': return 'success';
      default: return 'light';
    }
  };

  // Get status label
  const getStatusLabel = (status) => {
    const option = statutOptions.find(opt => opt.value === status);
    return option ? option.label : status;
  };

  return (
    <div className={styles.generalInfoContainer}>
      {isEditMode ? (
        /* Mode édition des informations générales */
        <Card className={styles.infoCard}>
          <Card.Body>
            {/* Titre */}
            <Form.Group className={styles.formGroup}>
              <Form.Label className={styles.formLabel}>Titre</Form.Label>
              <Form.Control
                type="text"
                name="titre"
                value={formData.titre || ''}
                onChange={onChange}
                placeholder="Titre du date"
              />
            </Form.Group>

            {/* Date */}
            <Form.Group className={styles.formGroup}>
              <Form.Label className={styles.formLabel}>Date</Form.Label>
              <Form.Control
                type="date"
                name="date"
                value={formData.formattedDate || ''}
                onChange={onChange}
              />
            </Form.Group>

            {/* Statut */}
            <Form.Group className={styles.formGroup}>
              <Form.Label className={styles.formLabel}>Statut</Form.Label>
              <Form.Select
                name="statut"
                value={formData.statut || 'contact'}
                onChange={onChange}
              >
                {statutOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            {/* Montant */}
            <Form.Group className={styles.formGroup}>
              <Form.Label className={styles.formLabel}>Montant</Form.Label>
              <Form.Control
                type="number"
                name="montant"
                value={formData.montant || ''}
                onChange={onChange}
                placeholder="Montant en euros"
              />
            </Form.Group>

            {/* Notes */}
            <Form.Group className={styles.formGroup}>
              <Form.Label className={styles.formLabel}>Notes</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                name="notes"
                value={formData.notes || ''}
                onChange={onChange}
                placeholder="Notes concernant le date"
                className={styles.textareaField}
              />
            </Form.Group>
          </Card.Body>
        </Card>
      ) : (
        /* Mode affichage des informations générales */
        <Card className={styles.infoCard}>
          <Card.Body>
            {/* Statut avec couleur et action à réaliser */}
            <div className={styles.statusContainer}>
              <Badge 
                bg={getStatusBadgeVariant(date.statut)}
                className={styles.statusBadge}
              >
                {getStatusLabel(date.statut)}
              </Badge>
              
              {statusInfo.actionNeeded && (
                <div className={styles.actionNeeded}>
                  <i className="bi bi-exclamation-circle me-1"></i>
                  {statusInfo.message}
                </div>
              )}
            </div>

            {/* Titre (si présent) */}
            {date.titre && (
              <div className={styles.infoGroup}>
                <span className={styles.infoLabel}>Titre</span>
                <span className={styles.infoValue}>{date.titre}</span>
              </div>
            )}

            {/* Date */}
            <div className={styles.infoGroup}>
              <span className={styles.infoLabel}>Date</span>
              <span className={`${styles.infoValue} ${isDatePassed(date.date) ? styles.passedDate : ''}`}>
                {formatDate(date.date)}
                {isDatePassed(date.date) && (
                  <span className={styles.passedBadge}>Passé</span>
                )}
              </span>
            </div>

            {/* Montant */}
            <div className={styles.infoGroup}>
              <span className={styles.infoLabel}>Montant</span>
              <span className={styles.infoValue}>{formatMontant(date.montant)}</span>
            </div>

            {/* Notes (si présentes) */}
            {date.notes && (
              <div className={styles.notesGroup}>
                <span className={styles.infoLabel}>Notes</span>
                <div className={styles.notesContent}>
                  {date.notes}
                </div>
              </div>
            )}

            {/* État du formulaire (si défini) */}
            {formDataStatus && formDataStatus.exists && (
              <div className={styles.formStatusIndicator}>
                <i className={`bi ${formDataStatus.isValidated ? 'bi-check-circle-fill' : formDataStatus.hasData ? 'bi-hourglass-split' : 'bi-envelope'} me-1`}></i>
                {formDataStatus.isValidated ? 'Formulaire validé' : formDataStatus.hasData ? `Formulaire rempli (${formDataStatus.completionRate || 0}%)` : 'Formulaire envoyé'}
              </div>
            )}
          </Card.Body>
        </Card>
      )}
    </div>
  );
};

export default DateGeneralInfoMobile;