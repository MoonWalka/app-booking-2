import React, { useRef } from 'react';
import styles from './ConcertArtistSection.module.css';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import CardSection from '@/components/ui/CardSection';

/**
 * Composant pour la section Artiste du détail d'un concert
 * Affiche les informations de l'artiste et permet de les modifier en mode édition
 */
const ConcertArtistSection = ({
  concertId,
  artiste,
  isEditMode,
  selectedArtiste,
  artisteSearchTerm,
  setArtisteSearchTerm,
  showArtisteResults,
  artisteResults,
  isSearchingArtistes,
  handleSelectArtiste,
  handleRemoveArtiste,
  handleCreateArtiste,
  navigateToArtisteDetails
}) => {
  const artisteDropdownRef = useRef(null);

  return (
    <CardSection
      title="Artiste"
      icon={<i className="bi bi-music-note"></i>}
      headerActions={artiste && !isEditMode ? (
        <Button
          onClick={() => navigateToArtisteDetails(artiste.id)}
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
          <div className={styles.formGroup} ref={artisteDropdownRef}>
            <label className={styles.formLabel}>Associer un artiste</label>
            
            {!selectedArtiste ? (
              <div className={styles.artisteSearchContainer}>
                <div className="input-group">
                  <span className="input-group-text"><i className="bi bi-search"></i></span>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Rechercher un artiste par nom..."
                    value={artisteSearchTerm}
                    onChange={(e) => setArtisteSearchTerm(e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="outline-secondary"
                    className="tc-btn-outline-secondary"
                    onClick={() => handleCreateArtiste()}
                  >
                    Créer un artiste
                  </Button>
                </div>
                
                {isSearchingArtistes && (
                  <div className="dropdown-menu show w-100">
                    <div className="dropdown-item text-center">
                      <div className="spinner-border spinner-border-sm text-primary" role="status">
                        <span className="visually-hidden">Recherche en cours...</span>
                      </div>
                    </div>
                  </div>
                )}
                
                {showArtisteResults && artisteResults.length > 0 && (
                  <div className="dropdown-menu show w-100">
                    {artisteResults.map(artiste => (
                      <div 
                        key={artiste.id} 
                        className={`dropdown-item ${styles.artisteItem}`}
                        onClick={() => handleSelectArtiste(artiste)}
                      >
                        <div className={styles.artisteName}>{artiste.nom}</div>
                        <div className={styles.artisteDetails}>
                          {artiste.genre && <span className={styles.artisteGenre}>{artiste.genre}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {showArtisteResults && artisteResults.length === 0 && !isSearchingArtistes && artisteSearchTerm.length >= 2 && (
                  <div className="dropdown-menu show w-100">
                    <div className="dropdown-item text-center text-muted">
                      Aucun artiste trouvé
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className={styles.selectedArtiste}>
                <div className={styles.artisteCard}>
                  <div className={styles.artisteInfo}>
                    <span className={styles.artisteName}>{selectedArtiste.nom}</span>
                    {selectedArtiste.genre && (
                      <span className={styles.artisteGenre}>Genre: {selectedArtiste.genre}</span>
                    )}
                    {selectedArtiste.description && (
                      <div className={styles.artisteDescription}>{selectedArtiste.description}</div>
                    )}
                  </div>
                  <Button 
                    type="button" 
                    variant="outline-danger"
                    size="sm"
                    className="tc-btn-outline-danger btn-sm"
                    onClick={handleRemoveArtiste}
                    aria-label="Supprimer cet artiste"
                  >
                    <i className="bi bi-x-lg"></i>
                  </Button>
                </div>
              </div>
            )}
            
            <small className="form-text text-muted">
              Tapez au moins 2 caractères pour rechercher un artiste par nom.
            </small>
          </div>
        ) : artiste ? (
          <>
            <div className="row">
              <div className="col-md-6">
                <div className="mb-3">
                  <div className="fw-bold">Nom:</div>
                  <div>{artiste.nom}</div>
                </div>
                {artiste.genre && (
                  <div className="mb-3">
                    <div className="fw-bold">Genre:</div>
                    <div>{artiste.genre}</div>
                  </div>
                )}
              </div>
              <div className="col-md-6">
                {artiste.contacts?.email && (
                  <div className="mb-3">
                    <div className="fw-bold">Email:</div>
                    <div>
                      <a href={`mailto:${artiste.contacts.email}`} className={styles.contactLink}>
                        <i className="bi bi-envelope me-1"></i>
                        {artiste.contacts.email}
                      </a>
                    </div>
                  </div>
                )}
                {artiste.contacts?.telephone && (
                  <div className="mb-3">
                    <div className="fw-bold">Téléphone:</div>
                    <div>
                      <a href={`tel:${artiste.contacts.telephone}`} className={styles.contactLink}>
                        <i className="bi bi-telephone me-1"></i>
                        {artiste.contacts.telephone}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {artiste.description && (
              <div className="row mt-3">
                <div className="col-12">
                  <div className="mb-3">
                    <div className="fw-bold">Description:</div>
                    <div className="mt-2 p-2 bg-light rounded">
                      {artiste.description}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {artiste.membres && artiste.membres.length > 0 && (
              <div className="row mt-3">
                <div className="col-12">
                  <div className="mb-3">
                    <div className="fw-bold">Membres:</div>
                    <ul className="list-group mt-2">
                      {artiste.membres.map((membre, index) => (
                        <li key={index} className="list-group-item">
                          {membre.nom}
                          {membre.role && <span className="text-muted ms-2">({membre.role})</span>}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
            
            {/* Réseaux sociaux */}
            {(artiste.contacts?.siteWeb || 
              artiste.contacts?.instagram || 
              artiste.contacts?.facebook) && (
              <div className="mt-3">
                <div className="fw-bold mb-2">Réseaux sociaux:</div>
                <div className="d-flex gap-2">
                  {artiste.contacts.siteWeb && (
                    <a href={artiste.contacts.siteWeb} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="tc-btn-outline-secondary btn-sm"
                    >
                      <i className="bi bi-globe"></i>
                      <span className="ms-1">Site web</span>
                    </a>
                  )}
                  {artiste.contacts.instagram && (
                    <a href={artiste.contacts.instagram} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="tc-btn-outline-danger btn-sm"
                    >
                      <i className="bi bi-instagram"></i>
                      <span className="ms-1">Instagram</span>
                    </a>
                  )}
                  {artiste.contacts.facebook && (
                    <a href={artiste.contacts.facebook} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="tc-btn-outline-primary btn-sm"
                    >
                      <i className="bi bi-facebook"></i>
                      <span className="ms-1">Facebook</span>
                    </a>
                  )}
                </div>
              </div>
            )}
          </>
        ) : (
          <Alert variant="warning">
            Aucun artiste n'est associé à ce concert.
          </Alert>
        )}
      </div>
    </CardSection>
  );
};

export default ConcertArtistSection;