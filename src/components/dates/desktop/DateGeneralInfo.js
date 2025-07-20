import React from 'react';
import { Link } from 'react-router-dom';
import Card from '@/components/ui/Card';
import styles from './DateGeneralInfo.module.css';

/**
 * Composant d'informations générales d'un date
 * Adapté de la maquette datedetail.md
 */
const DateGeneralInfo = ({
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
  return (
    <Card
      title="Informations générales"
      icon={<i className="bi bi-info-circle"></i>}
      headerClassName="info"
      isEditing={isEditMode}
    >
        {isEditMode ? (
          <>
            <div className={styles.formGroup}>
              <label htmlFor="titre" className={styles.formLabel}>Titre du date</label>
              <input
                type="text"
                className={styles.formField}
                id="titre"
                name="titre"
                value={formData.titre || ''}
                onChange={onChange}
                placeholder="Ex: Date de jazz, Festival d'été, etc."
              />
            </div>

            <div className="row">
              <div className="col-md-6">
                <div className={styles.formGroup}>
                  <label htmlFor="date" className={styles.formLabel}>Date du date <span className={styles.required}>*</span></label>
                  <input
                    type="date"
                    className={styles.formField}
                    id="date"
                    name="date"
                    value={formData.date}
                    onChange={onChange}
                    required
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className={styles.formGroup}>
                  <label htmlFor="montant" className={styles.formLabel}>Montant (€) <span className={styles.required}>*</span></label>
                  <input
                    type="number"
                    className={styles.formField}
                    id="montant"
                    name="montant"
                    value={formData.montant}
                    onChange={onChange}
                    required
                  />
                </div>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="statut" className={styles.formLabel}>Statut</label>
              <select
                className={styles.formSelect}
                id="statut"
                name="statut"
                value={formData.statut}
                onChange={onChange}
              >
                <option value="En attente">En attente</option>
                <option value="Confirmé">Confirmé</option>
                <option value="Annulé">Annulé</option>
                <option value="Terminé">Terminé</option>
                <option value="contact">Contact</option>
                <option value="preaccord">Pré-accord</option>
                <option value="contrat">Contrat</option>
                <option value="acompte">Acompte</option>
                <option value="solde">Solde</option>
              </select>
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="notes" className={styles.formLabel}>Notes</label>
              <textarea
                className={styles.formField}
                id="notes"
                name="notes"
                rows="3"
                value={formData.notes || ''}
                onChange={onChange}
                placeholder="Informations complémentaires, remarques..."
              ></textarea>
            </div>
          </>
        ) : (
          <>
            <div className="row">
              <div className="col-md-6">
                <div className="mb-4">
                  <div className="fw-bold mb-1">Titre:</div>
                  <div>{date?.titre || "Sans titre"}</div>
                </div>
                <div className="mb-4">
                  <div className="fw-bold mb-1">Date:</div>
                  <div className={isDatePassed(date?.date) ? "text-muted" : ""}>
                    {formatDate(date?.date)}
                    {isDatePassed(date?.date) && <span className="badge bg-secondary ms-2">Passé</span>}
                  </div>
                </div>
                <div className="mb-4">
                  <div className="fw-bold mb-1">Montant:</div>
                  <div>{formatMontant(date?.montant)}</div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-4">
                  <div className="fw-bold mb-1">Artiste:</div>
                  <div>
                    {artiste ? (
                      <Link to={`/artistes/${artiste.id}`} className="artiste-link">
                        <i className="bi bi-music-note"></i>
                        {artiste.artisteNom}
                      </Link>
                    ) : (
                      date?.artisteNom ? date.artisteNom : <span className="text-muted">Non spécifié</span>
                    )}
                  </div>
                </div>
                <div className="mb-4">
                  <div className="fw-bold mb-1">Statut:</div>
                  <div className="status-display">
                    <span className={`badge ${
                      date?.statut === 'contrat' ? 'bg-success' :
                      date?.statut === 'preaccord' ? 'bg-primary' :
                      date?.statut === 'acompte' ? 'bg-warning' :
                      date?.statut === 'solde' ? 'bg-info' :
                      date?.statut === 'annule' ? 'bg-danger' :
                      'bg-secondary'
                    }`}>
                      {date?.statut === 'contrat' ? 'Contrat' :
                       date?.statut === 'preaccord' ? 'Pré-accord' :
                       date?.statut === 'acompte' ? 'Acompte' :
                       date?.statut === 'solde' ? 'Soldé' :
                       date?.statut === 'annule' ? 'Annulé' :
                       date?.statut || 'Non défini'}
                    </span>
                  </div>
                </div>
                <div className="mb-4">
                  <div className="fw-bold mb-1">Formulaire:</div>
                  <div>
                    {!formDataStatus ? (
                      <span className="badge bg-warning">
                        <i className="bi bi-exclamation-triangle me-1"></i>
                        Non envoyé
                      </span>
                    ) : formDataStatus === 'validated' ? (
                      <span className="badge bg-success">
                        <i className="bi bi-check-circle me-1"></i>
                        Formulaire validé
                      </span>
                    ) : formDataStatus === 'filled' ? (
                      <span className="badge bg-info">
                        <i className="bi bi-hourglass-split me-1"></i>
                        Formulaire rempli, à valider
                      </span>
                    ) : (
                      <span className="badge bg-primary">
                        <i className="bi bi-envelope me-1"></i>
                        Formulaire envoyé
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {date?.notes && (
              <div className="row mt-3">
                <div className="col-12">
                  <div className="mb-3">
                    <div className="fw-bold mb-2">Notes:</div>
                    <div className="notes-content">
                      {date.notes}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
    </Card>
  );
};

export default DateGeneralInfo;