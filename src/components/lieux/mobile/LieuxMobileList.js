import React from 'react';
import { useNavigate } from 'react-router-dom';
import Spinner from '@/components/common/Spinner';
import Button from '@/components/ui/Button';
import { toast } from 'react-toastify';

// Migration vers les hooks optimisés maintenant disponibles
import { useLieuxQuery, useLieuxFilters, useLieuDelete } from '@/hooks/lieux';
import styles from './LieuxList.module.css';

/**
 * LieuxMobileList Component - Mobile version
 * Affiche une liste filtrée des lieux avec interface optimisée pour mobile
 * Architecture responsive avec UI tactile et notifications
 */
const LieuxMobileList = () => {
  const navigate = useNavigate();
  
  // Use custom hooks to manage data and state
  const { lieux, loading, error, stats, setLieux } = useLieuxQuery();
  const { 
    searchTerm, 
    setSearchTerm, 
    filterType, 
    setFilterType, 
    sortOption, 
    setSortOption, 
    filteredLieux 
  } = useLieuxFilters(lieux);

  // Handle deletion of lieux avec notifications mobiles
  const { handleDeleteLieu } = useLieuDelete((deletedId) => {
    // Remove the deleted lieu from the local state
    setLieux(lieux.filter(lieu => lieu.id !== deletedId));
    
    // Notification de succès mobile
    toast.success('🗑️ Lieu supprimé avec succès', {
      position: 'bottom-center',
      autoClose: 2000,
      hideProgressBar: true,
      style: {
        fontSize: '14px',
        borderRadius: '8px',
      }
    });
  });

  // Clear search with haptic feedback
  const handleClearSearch = () => {
    setSearchTerm('');
    // Haptic feedback for iOS devices
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
  };

  // Navigation handlers avec notifications
  const handleNavigateToForm = () => {
    toast.info('📝 Création d\'un nouveau lieu', {
      position: 'bottom-center',
      autoClose: 1500,
      hideProgressBar: true,
    });
    navigate('/lieux/nouveau');
  };

  const handleNavigateToDetails = (id) => {
    navigate(`/lieux/${id}`);
  };

  const handleEditLieu = (e, id) => {
    e.stopPropagation();
    toast.info('✏️ Passage en mode édition', {
      position: 'bottom-center',
      autoClose: 1500,
      hideProgressBar: true,
    });
    navigate(`/lieux/${id}/edit`);
  };

  const handleDeleteWithConfirmation = (e, lieu) => {
    e.stopPropagation();
    
    // Interface de confirmation mobile-friendly
    const confirmed = window.confirm(
      `Êtes-vous sûr de vouloir supprimer le lieu "${lieu.nom}" ?\n\nCette action est irréversible.`
    );
    
    if (confirmed) {
      handleDeleteLieu(lieu.id);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className={styles.mobileContainer}>
        <div className={styles.spinnerContainer || "d-flex justify-content-center align-items-center p-5"}>
          <Spinner variant="primary" message="Chargement des lieux..." />
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className={styles.mobileContainer}>
        <div className="alert alert-danger d-flex align-items-center gap-2 m-3">
          <i className="bi bi-exclamation-triangle-fill"></i>
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.mobileContainer}>
      {/* Header avec titre et bouton d'ajout */}
      <div className={styles.headerContainer}>
        <h1 className={styles.modernTitle}>Lieux</h1>
        <button 
          className={styles.modernAddBtn}
          onClick={handleNavigateToForm}
          type="button"
          aria-label="Ajouter un nouveau lieu"
        >
          <i className="bi bi-plus fs-4"></i>
        </button>
      </div>

      {/* Barre de recherche mobile-optimized */}
      <div className={styles.searchFilterContainer}>
        <div className={styles.searchBar}>
          <div className="input-group">
            <span className={styles.inputGroupText}>
              <i className="bi bi-search"></i>
            </span>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Rechercher un lieu..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                type="button"
                className={styles.clearSearch}
                onClick={handleClearSearch}
                aria-label="Effacer la recherche"
              >
                <i className="bi bi-x-circle-fill"></i>
              </button>
            )}
          </div>
        </div>

        {/* NOUVEAU: Interface mobile de filtrage et tri */}
        <div className={styles.filterSortContainer || "d-flex gap-2 mt-3"}>
          {/* Filtre par type */}
          <div className={styles.filterGroup || "flex-1"}>
            <select
              className={styles.filterSelect || "form-select form-select-sm"}
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              aria-label="Filtrer par type de lieu"
            >
              <option value="">Tous les types</option>
              <option value="salle">Salle de concert</option>
              <option value="theatre">Théâtre</option>
              <option value="club">Club</option>
              <option value="bar">Bar/Café</option>
              <option value="festival">Site de festival</option>
              <option value="autre">Autre</option>
            </select>
          </div>

          {/* Tri */}
          <div className={styles.sortGroup || "flex-1"}>
            <select
              className={styles.sortSelect || "form-select form-select-sm"}
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              aria-label="Trier les lieux"
            >
              <option value="nom-asc">Nom (A-Z)</option>
              <option value="nom-desc">Nom (Z-A)</option>
              <option value="capacite-desc">Capacité (max-min)</option>
              <option value="capacite-asc">Capacité (min-max)</option>
              <option value="date-desc">Récents d'abord</option>
              <option value="date-asc">Anciens d'abord</option>
            </select>
          </div>

          {/* Reset filtres */}
          {(filterType || sortOption !== 'nom-asc') && (
            <button
              type="button"
              className={styles.resetFilters || "btn btn-outline-secondary btn-sm"}
              onClick={() => {
                setFilterType('');
                setSortOption('nom-asc');
              }}
              aria-label="Réinitialiser filtres"
            >
              <i className="bi bi-arrow-clockwise"></i>
            </button>
          )}
        </div>

        {/* NOUVEAU: Affichage des statistiques */}
        {stats && (
          <div className={styles.statsContainer || "d-flex justify-content-between mt-2 text-muted small"}>
            <span>Total: {stats.total || lieux.length}</span>
            {stats.byType && Object.keys(stats.byType).length > 0 && (
              <span>Types: {Object.keys(stats.byType).length}</span>
            )}
            {stats.avgCapacity && (
              <span>Capacité moy: {Math.round(stats.avgCapacity)}</span>
            )}
          </div>
        )}

        {/* Compteur de résultats amélioré */}
        <div className={styles.resultsCount}>
          {filteredLieux.length} lieu{filteredLieux.length !== 1 ? 'x' : ''} 
          {lieux.length !== filteredLieux.length && ` sur ${lieux.length}`}
          {(filterType || sortOption !== 'nom-asc') && (
            <span className={styles.filteredIndicator || "ms-2 text-primary"}>
              <i className="bi bi-funnel-fill"></i>
            </span>
          )}
        </div>
      </div>

      {/* Liste des lieux ou état vide */}
      {filteredLieux.length > 0 ? (
        <div className={styles.lieuCardsContainer}>
          {filteredLieux.map((lieu) => (
            <div
              key={lieu.id}
              className={styles.lieuCard}
              onClick={() => handleNavigateToDetails(lieu.id)}
            >
              {/* Header de la carte */}
              <div className={styles.lieuCardHeader}>
                <h2 className={styles.lieuCardTitle}>
                  <i className="bi bi-geo-alt-fill me-2"></i>
                  {lieu.nom}
                </h2>
              </div>

              {/* Body de la carte */}
              <div className={styles.lieuCardBody}>
                {/* Type et capacité */}
                <div className={styles.lieuInfoItem}>
                  <div className={styles.lieuInfoIcon}>
                    <i className="bi bi-building"></i>
                  </div>
                  <div className={styles.lieuInfoText}>
                    {lieu.type || "Type non spécifié"}
                    {lieu.capacite && ` • ${lieu.capacite} places`}
                  </div>
                </div>

                {/* Adresse */}
                <div className={styles.lieuInfoItem}>
                  <div className={styles.lieuInfoIcon}>
                    <i className="bi bi-map"></i>
                  </div>
                  <div className={styles.lieuInfoText}>
                    {lieu.adresse ? (
                      <>
                        {lieu.adresse}
                        {(lieu.codePostal || lieu.ville) && (
                          <br />
                        )}
                        {lieu.codePostal && lieu.ville && `${lieu.codePostal} ${lieu.ville}`}
                      </>
                    ) : (
                      "Adresse non spécifiée"
                    )}
                  </div>
                </div>

                {/* Contact */}
                {(lieu.contactEmail || lieu.contactTelephone) && (
                  <div className={styles.lieuInfoItem}>
                    <div className={styles.lieuInfoIcon}>
                      <i className="bi bi-person"></i>
                    </div>
                    <div className={styles.lieuInfoText}>
                      {lieu.contactNom && `${lieu.contactNom} • `}
                      {lieu.contactEmail && (
                        <a 
                          href={`mailto:${lieu.contactEmail}`}
                          className={styles.lieuContactLink}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {lieu.contactEmail}
                        </a>
                      )}
                      {lieu.contactEmail && lieu.contactTelephone && " • "}
                      {lieu.contactTelephone && (
                        <a 
                          href={`tel:${lieu.contactTelephone}`}
                          className={styles.lieuContactLink}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {lieu.contactTelephone}
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className={styles.lieuCardActions || "d-flex justify-content-end gap-2 mt-3"}>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={(e) => handleEditLieu(e, lieu.id)}
                    className={styles.lieuActionBtn || ""}
                    icon={<i className="bi bi-pencil"></i>}
                  />
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={(e) => handleDeleteWithConfirmation(e, lieu)}
                    className={styles.lieuActionBtn || ""}
                    icon={<i className="bi bi-trash"></i>}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* État vide */
        <div className={styles.emptyState}>
          <div className={styles.emptyStateIcon}>
            <i className="bi bi-geo-alt"></i>
          </div>
          <div className={styles.emptyStateText}>
            {searchTerm ? (
              <>Aucun lieu ne correspond à votre recherche "{searchTerm}"</>
            ) : (
              <>Aucun lieu n'a encore été créé</>
            )}
          </div>
          {!searchTerm && (
            <button
              className={styles.emptyStateButton}
              onClick={handleNavigateToForm}
              type="button"
            >
              <i className="bi bi-plus-circle me-2"></i>
              Créer le premier lieu
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default LieuxMobileList; 