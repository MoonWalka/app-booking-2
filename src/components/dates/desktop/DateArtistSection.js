import React, { useRef } from 'react';
import styles from './DateArtistSection.module.css';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';

/**
 * Composant pour la section Artiste du détail d'un date
 * Adapté de la maquette datedetail.md
 */
const DateArtistSection = ({
  dateId,
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

  const headerActions = artiste && !isEditMode ? (
    <button
      onClick={() => navigateToArtisteDetails(artiste.id)}
      className="tc-btn tc-btn-outline-primary tc-btn-sm"
    >
      <i className="bi bi-eye"></i>
      <span>Voir détails</span>
    </button>
  ) : null;

  return (
    <Card
      title="Artiste"
      icon={<i className="bi bi-music-note"></i>}
      headerClassName="artiste"
      headerActions={headerActions}
      isEditing={isEditMode}
    >
        {isEditMode ? (
          <div className={styles.formGroup} ref={artisteDropdownRef}>
            <label className={styles.formLabel}>Associer un artiste</label>
            
            {!selectedArtiste ? (
              <div className={styles.artisteSearchContainer}>
                <div className="input-group">
                  <span className="input-group-text"><i className="bi bi-search"></i></span>
                  <input
                    type="text"
                    className={styles.formField}
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
            
            <small className={styles.helpText}>
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
                <div className="mb-3">
                  <div className="fw-bold">Genre:</div>
                  <div>{artiste.genre || 'Non spécifié'}</div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-3">
                  <div className="fw-bold">Email:</div>
                  <div>
                    {artiste.contacts?.email || artiste.email ? (
                      <a href={`mailto:${artiste.contacts?.email || artiste.email}`} className="contact-link">
                        <i className="bi bi-envelope"></i>
                        {artiste.contacts?.email || artiste.email}
                      </a>
                    ) : (
                      <span className="text-muted">Non spécifié</span>
                    )}
                  </div>
                </div>
                <div className="mb-3">
                  <div className="fw-bold">Téléphone:</div>
                  <div>
                    {artiste.contacts?.telephone || artiste.telephone ? (
                      <a href={`tel:${artiste.contacts?.telephone || artiste.telephone}`} className="contact-link">
                        <i className="bi bi-telephone"></i>
                        {artiste.contacts?.telephone || artiste.telephone}
                      </a>
                    ) : (
                      <span className="text-muted">Non spécifié</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {artiste.description && (
              <div className="row mt-3">
                <div className="col-12">
                  <div className="mb-3">
                    <div className="fw-bold mb-2">Description:</div>
                    <div className="notes-content">
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
                    <div className="fw-bold mb-2">Membres:</div>
                    <ul className="list-group">
                      {artiste.membres.map((membre, index) => (
                        <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                          {membre.nom}
                          {membre.role && (
                            <span className="badge bg-primary rounded-pill">{membre.role}</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
            
            {/* Réseaux sociaux - adapté de la maquette */}
            {(artiste.contacts?.siteWeb || 
              artiste.contacts?.instagram || 
              artiste.contacts?.facebook) && (
              <div className="mt-4">
                <div className="fw-bold mb-2">Réseaux sociaux:</div>
                <div className="social-links">
                  {artiste.contacts?.siteWeb && (
                    <a 
                      href={artiste.contacts.siteWeb} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="social-link social-link-website"
                    >
                      <i className="bi bi-globe"></i>
                      <span>Site web</span>
                    </a>
                  )}
                  {artiste.contacts?.instagram && (
                    <a 
                      href={artiste.contacts.instagram} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="social-link social-link-instagram"
                    >
                      <i className="bi bi-instagram"></i>
                      <span>Instagram</span>
                    </a>
                  )}
                  {artiste.contacts?.facebook && (
                    <a 
                      href={artiste.contacts.facebook} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="social-link social-link-facebook"
                    >
                      <i className="bi bi-facebook"></i>
                      <span>Facebook</span>
                    </a>
                  )}
                </div>
              </div>
            )}
          </>
        ) : (
          <Alert variant="warning">
            Aucun artiste n'est associé à ce date.
          </Alert>
        )}
    </Card>
  );
};

export default DateArtistSection;