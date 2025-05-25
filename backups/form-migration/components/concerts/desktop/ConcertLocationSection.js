import React, { useRef, useState } from 'react';
import styles from './ConcertLocationSection.module.css';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import CardSection from '@/components/ui/CardSection';

/**
 * Composant pour la section Lieu du détail d'un concert
 * Affiche les informations du lieu et permet de les modifier en mode édition
 */
const ConcertLocationSection = ({
  concertId,
  lieu,
  isEditMode,
  selectedLieu,
  lieuSearchTerm: propLieuSearchTerm,
  setLieuSearchTerm: propSetLieuSearchTerm,
  showLieuResults = false,
  lieuResults = [],
  isSearchingLieux = false,
  handleSelectLieu = () => {},
  handleRemoveLieu = () => {},
  handleCreateLieu = () => {},
  navigateToLieuDetails
}) => {
  const lieuDropdownRef = useRef(null);
  
  // État local pour le terme de recherche si pas fourni en props
  const [localSearchTerm, setLocalSearchTerm] = useState('');
  
  // Utiliser les props si fournies, sinon l'état local
  const lieuSearchTerm = propLieuSearchTerm !== undefined ? propLieuSearchTerm : localSearchTerm;
  const setLieuSearchTerm = propSetLieuSearchTerm || setLocalSearchTerm;
  
  // Déterminer si on est en mode recherche fonctionnel
  const hasSearchFunctionality = !!propSetLieuSearchTerm;

  return (
    <CardSection
      title={isEditMode ? 'Lieu *' : 'Lieu'}
      icon={<i className="bi bi-geo-alt"></i>}
      headerActions={lieu && !isEditMode ? (
        <Button
          onClick={() => navigateToLieuDetails(lieu.id)}
          variant="outline-primary"
          size="sm"
          className={`tc-btn-outline-primary btn-sm ${styles.cardHeaderAction}`}
        >
          <i className="bi bi-eye"></i>
          <span>Voir détails</span>
        </Button>
      ) : null}
      className={styles.formCard}
    >
      <div className={styles.cardBody}>
        {isEditMode ? (
          <div className={styles.formGroup} ref={lieuDropdownRef}>
            <label className={styles.formLabel}>Rechercher un lieu</label>
            
            {/* Vérifier si les props de recherche sont fournies */}
            {hasSearchFunctionality ? (
              !selectedLieu ? (
                <div className={styles.lieuSearchContainer}>
                  <div className="input-group">
                    <span className="input-group-text"><i className="bi bi-search"></i></span>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Rechercher un lieu par nom..."
                      value={lieuSearchTerm}
                      onChange={(e) => setLieuSearchTerm(e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="outline-secondary"
                      className="tc-btn-outline-secondary"
                      onClick={() => handleCreateLieu()}
                    >
                      Créer un lieu
                    </Button>
                  </div>
                  
                  {isSearchingLieux && (
                    <div className="dropdown-menu show w-100">
                      <div className="dropdown-item text-center">
                        <div className="spinner-border spinner-border-sm text-primary" role="status">
                          <span className="visually-hidden">Recherche en cours...</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {showLieuResults && lieuResults.length > 0 && (
                    <div className="dropdown-menu show w-100">
                      {lieuResults.map(lieu => (
                        <div 
                          key={lieu.id} 
                          className={`dropdown-item ${styles.lieuItem}`}
                          onClick={() => handleSelectLieu(lieu)}
                        >
                          <div className={styles.lieuName}>{lieu.nom}</div>
                          <div className={styles.lieuDetails}>
                            {lieu.adresse && lieu.ville && (
                              <span className={styles.lieuAddress}>
                                {lieu.adresse}, {lieu.codePostal} {lieu.ville}
                              </span>
                            )}
                            {lieu.capacite && (
                              <span className={styles.lieuCapacity}>
                                Capacité: {lieu.capacite} personnes
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {showLieuResults && lieuResults.length === 0 && !isSearchingLieux && lieuSearchTerm.length >= 2 && (
                    <div className="dropdown-menu show w-100">
                      <div className="dropdown-item text-center text-muted">
                        Aucun lieu trouvé
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className={styles.selectedLieu}>
                  <div className={styles.lieuCard}>
                    <div className={styles.lieuInfo}>
                      <span className={styles.lieuName}>{selectedLieu.nom}</span>
                      {selectedLieu.adresse && (
                        <div className={styles.lieuAddress}>
                          <i className="bi bi-geo-alt-fill"></i> {selectedLieu.adresse}<br />
                          {selectedLieu.codePostal} {selectedLieu.ville}
                        </div>
                      )}
                      {selectedLieu.capacite && (
                        <div className={styles.lieuCapacity}>
                          <i className="bi bi-people-fill"></i> Capacité: {selectedLieu.capacite} personnes
                        </div>
                      )}
                    </div>
                    <Button 
                      type="button" 
                      variant="outline-danger"
                      size="sm"
                      className="tc-btn-outline-danger btn-sm"
                      onClick={handleRemoveLieu}
                      aria-label="Supprimer ce lieu"
                    >
                      <i className="bi bi-x-lg"></i>
                    </Button>
                  </div>
                </div>
              )
            ) : (
              <Alert variant="info">
                Mode édition des lieux non disponible dans cette vue. 
                Veuillez utiliser le formulaire de création/modification dédié.
              </Alert>
            )}
            
            <small className="form-text text-muted">
              Tapez au moins 2 caractères pour rechercher un lieu par nom.
            </small>
          </div>
        ) : lieu ? (
          <>
            <div className="row">
              <div className="col-md-6">
                <div className="mb-3">
                  <div className="fw-bold">Nom:</div>
                  <div>{lieu.nom}</div>
                </div>
                <div className="mb-3">
                  <div className="fw-bold">Adresse:</div>
                  <div>{lieu.adresse}</div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-3">
                  <div className="fw-bold">Ville:</div>
                  <div>{lieu.codePostal} {lieu.ville}</div>
                </div>
                {lieu.capacite && (
                  <div className="mb-3">
                    <div className="fw-bold">Capacité:</div>
                    <div>{lieu.capacite} personnes</div>
                  </div>
                )}
              </div>
            </div>
            {/* Intégration de la carte Google Maps */}
            <div className="mt-3">
              <div className={`mb-3 ${styles.mapContainer}`}>
                <iframe 
                  title={`Carte de localisation de ${lieu.nom} - ${lieu.adresse}, ${lieu.codePostal} ${lieu.ville}`}
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(`${lieu.adresse}, ${lieu.codePostal} ${lieu.ville}`)}&z=6&output=embed`}
                  width="100%" 
                  height="250" 
                  className={styles.mapIframe}
                  allowFullScreen="" 
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>
              <a 
                href={`https://maps.google.com/maps?q=${encodeURIComponent(`${lieu.adresse}, ${lieu.codePostal} ${lieu.ville}`)}`}
                target="_blank"
                rel="noopener noreferrer" 
                className="tc-btn-outline-info btn-sm"
              >
                <i className="bi bi-map me-1"></i>
                Voir en plein écran
              </a>
            </div>
          </>
        ) : (
          <Alert variant="warning">
            Aucun lieu n'est associé à ce concert.
          </Alert>
        )}
      </div>
    </CardSection>
  );
};

export default ConcertLocationSection;