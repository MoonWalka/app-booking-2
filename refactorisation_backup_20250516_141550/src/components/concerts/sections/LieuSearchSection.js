import React from 'react';
import styles from './LieuSearchSection.module.css';
import SearchDropdown from './SearchDropdown';
import SelectedEntityCard from './SelectedEntityCard';
import Card from '@/components/ui/Card';

/**
 * LieuSearchSection - Section de recherche et sélection de lieu
 * 
 * @param {Object} props - Les propriétés du composant
 * @param {string} props.lieuSearchTerm - Terme de recherche pour le lieu
 * @param {Function} props.setLieuSearchTerm - Fonction pour mettre à jour le terme de recherche
 * @param {Array} props.lieuResults - Résultats de la recherche de lieux
 * @param {boolean} props.showLieuResults - Indique si les résultats doivent être affichés
 * @param {boolean} props.isSearchingLieux - Indique si une recherche est en cours
 * @param {Object} props.lieuDropdownRef - Référence pour gérer le clic en dehors du dropdown
 * @param {Object} props.selectedLieu - Lieu sélectionné
 * @param {Function} props.handleSelectLieu - Fonction pour sélectionner un lieu
 * @param {Function} props.handleRemoveLieu - Fonction pour désélectionner le lieu
 * @param {Function} props.handleCreateLieu - Fonction pour créer un nouveau lieu
 */
const LieuSearchSection = ({ 
  lieuSearchTerm, 
  setLieuSearchTerm,
  lieuResults,
  showLieuResults,
  isSearchingLieux,
  lieuDropdownRef,
  selectedLieu,
  handleSelectLieu,
  handleRemoveLieu,
  handleCreateLieu
}) => {
  return (
    <Card
      title="Lieu"
      icon={<i className="bi bi-geo-alt"></i>}
      className={styles.lieuSearchSection}
    >
      <div className={styles.searchContainer} ref={lieuDropdownRef}>
        {!selectedLieu ? (
          <>
            <label className={styles.formLabel}>Rechercher un lieu</label>
            <SearchDropdown
              searchTerm={lieuSearchTerm}
              setSearchTerm={setLieuSearchTerm}
              results={lieuResults}
              showResults={showLieuResults}
              isSearching={isSearchingLieux}
              placeholder="Rechercher un lieu par nom..."
              onSelect={handleSelectLieu}
              onCreate={() => handleCreateLieu(lieuSearchTerm, handleSelectLieu)}
              createButtonText="Nouveau lieu"
              emptyResultsText="Aucun lieu trouvé"
              entityType="lieu"
            />
            <small className={styles.formHelpText}>
              Tapez au moins 2 caractères pour rechercher un lieu par nom.
            </small>
          </>
        ) : (
          <>
            <label className={styles.formLabel}>Lieu sélectionné</label>
            <SelectedEntityCard
              entity={selectedLieu}
              entityType="lieu"
              onRemove={handleRemoveLieu}
              primaryField="nom"
              secondaryFields={[
                { 
                  icon: "bi-geo-alt-fill", 
                  value: selectedLieu.adresse, 
                  suffix: selectedLieu.codePostal && selectedLieu.ville
                    ? `, ${selectedLieu.codePostal} ${selectedLieu.ville}`
                    : ''
                },
                { 
                  icon: "bi-people-fill", 
                  prefix: "Capacité: ", 
                  value: selectedLieu.capacite || 'Non spécifiée',
                  suffix: selectedLieu.capacite ? " personnes" : ""
                }
              ]}
            />
          </>
        )}
      </div>
    </Card>
  );
};

export default LieuSearchSection;
