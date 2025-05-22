import React from 'react';
import { Link } from 'react-router-dom';
import styles from './ConcertGeneralInfo.module.css';
import CardSection from '@/components/ui/CardSection';

/**
 * Composant d'informations générales d'un concert
 */
const ConcertGeneralInfo = ({
  concert,
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
    <CardSection
      title="Informations générales"
      icon={<i className="bi bi-info-circle"></i>}
      isEditing={isEditMode}
      className={styles.formCard}
    >
      <div className={styles.cardBody}>
        {isEditMode ? (
          <>
            <div className={styles.formGroup}>
              <label htmlFor="titre" className={styles.formLabel}>Titre du concert</label>
              <input
                type="text"
                className="form-control"
                id="titre"
                name="titre"
                value={formData.titre || ''}
                onChange={onChange}
                placeholder="Ex: Concert de jazz, Festival d'été, etc."
              />
            </div>

            <div className="row">
              <div className="col-md-6">
                <div className={styles.formGroup}>
                  <label htmlFor="date" className={styles.formLabel}>Date du concert <span className={styles.required}>*</span></label>
                  <input
                    type="date"
                    className="form-control"
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
                    className="form-control"
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
                className="form-select"
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
                className="form-control"
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
                <div className="mb-3">
                  <div className="fw-bold">Titre:</div>
                  <div>{concert.titre || "Sans titre"}</div>
                </div>
                <div className="mb-3">
                  <div className="fw-bold">Date:</div>
                  <div className={isDatePassed(concert.date) ? "text-muted" : ""}>
                    {formatDate(concert.date)}
                    {isDatePassed(concert.date) && <span className="badge bg-secondary ms-2">Passé</span>}
                  </div>
                </div>
                <div className="mb-3">
                  <div className="fw-bold">Montant:</div>
                  <div>{formatMontant(concert.montant)}</div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-3">
                  <div className="fw-bold">Artiste:</div>
                  <div>
                    {artiste ? (
                      <Link to={`/artistes/${artiste.id}`} className="artiste-link">
                        <i className="bi bi-music-note me-1"></i>
                        {artiste.nom}
                      </Link>
                    ) : (
                      concert.artisteNom ? concert.artisteNom : <span className="text-muted">Non spécifié</span>
                    )}
                  </div>
                </div>
                <div className="mb-3">
                  <div className="fw-bold">Statut:</div>
                  <div className={styles.statusDisplay}>
                    <span className={`badge ${
                      concert.statut === 'contrat' ? 'bg-success' :
                      concert.statut === 'preaccord' ? 'bg-primary' :
                      concert.statut === 'acompte' ? 'bg-warning' :
                      concert.statut === 'solde' ? 'bg-info' :
                      concert.statut === 'annule' ? 'bg-danger' :
                      'bg-secondary'
                    } me-2`}>
                      {concert.statut || 'Non défini'}
                    </span>
                    {statusInfo.actionNeeded && (
                      <div className={styles.actionNeeded}>
                        <i className="bi bi-exclamation-circle text-warning me-1"></i>
                        {statusInfo.message}
                      </div>
                    )}
                  </div>
                </div>
                <div className="mb-3">
                  <div className="fw-bold">Formulaire:</div>
                  <div>
                    {!formDataStatus ? (
                      <span className="badge bg-warning me-2">
                        <i className="bi bi-exclamation-triangle me-1"></i>
                        Non envoyé
                      </span>
                    ) : formDataStatus === 'validated' ? (
                      <span className="badge bg-success me-2">
                        <i className="bi bi-check-circle me-1"></i>
                        Formulaire validé
                      </span>
                    ) : formDataStatus === 'filled' ? (
                      <span className="badge bg-info me-2">
                        <i className="bi bi-hourglass-split me-1"></i>
                        Formulaire rempli, à valider
                      </span>
                    ) : (
                      <span className="badge bg-primary me-2">
                        <i className="bi bi-envelope me-1"></i>
                        Formulaire envoyé
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {concert.notes && (
              <div className="row mt-3">
                <div className="col-12">
                  <div className="mb-3">
                    <div className="fw-bold">Notes:</div>
                    <div className={`mt-2 p-2 bg-light rounded ${styles.notesContent}`}>
                      {concert.notes}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </CardSection>
  );
};

export default ConcertGeneralInfo;