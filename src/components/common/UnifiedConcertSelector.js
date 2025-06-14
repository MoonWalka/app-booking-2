import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import CardSection from '@/components/ui/CardSection';
import SearchDropdown from '@/components/concerts/sections/SearchDropdown';
import SelectedEntityCard from '@/components/concerts/sections/SelectedEntityCard';
import { useEntitySearch } from '@/hooks/common';
import { doc, getDoc, db } from '@/services/firebase-service';
import styles from './UnifiedConcertSelector.module.css';

/**
 * Composant unifié pour la sélection de concerts
 * Gère à la fois le mode mono-concert et multi-concerts
 * 
 * @param {Object} props
 * @param {boolean} props.multiple - Si true, permet la sélection de plusieurs concerts
 * @param {string|Array} props.value - ID(s) du/des concert(s) sélectionné(s)
 * @param {Function} props.onChange - Callback appelé lors du changement (reçoit un ID ou un tableau d'IDs)
 * @param {boolean} props.isEditing - Si true, affiche en mode édition
 * @param {string} props.entityId - ID de l'entité parente (pour les relations bidirectionnelles)
 * @param {string} props.entityType - Type de l'entité parente ('structure', 'lieu', etc.)
 * @param {string} props.label - Label à afficher
 * @param {boolean} props.required - Si true, au moins un concert est requis
 */
const UnifiedConcertSelector = ({
  multiple = false,
  value,
  onChange,
  isEditing = false,
  entityId,
  entityType,
  label = 'Concert(s)',
  required = false,
  className = ''
}) => {
  // État local pour la liste des concerts
  const [concertsList, setConcertsList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Hook de recherche de concerts
  const {
    searchTerm,
    setSearchTerm,
    results,
    showResults,
    setShowResults,
    isSearching,
    handleCreate: handleCreateConcert
  } = useEntitySearch({
    entityType: 'concerts',
    searchField: 'titre',
    additionalSearchFields: ['lieuNom', 'artisteNom', 'description'],
    maxResults: 10
  });

  // Charger les concerts existants au montage
  useEffect(() => {
    const loadExistingConcerts = async () => {
      // Normaliser la valeur en tableau pour simplifier la logique
      const normalizedValue = Array.isArray(value) 
        ? value 
        : (value ? [value] : []);

      if (normalizedValue.length === 0) {
        setConcertsList([]);
        return;
      }

      setIsLoading(true);
      try {
        const concertPromises = normalizedValue.map(async (concertId) => {
          if (!concertId) return null;
          const concertDoc = await getDoc(doc(db, 'concerts', concertId));
          if (concertDoc.exists()) {
            return { id: concertDoc.id, ...concertDoc.data() };
          }
          return null;
        });

        const loadedConcerts = await Promise.all(concertPromises);
        const validConcerts = loadedConcerts.filter(concert => concert !== null);
        setConcertsList(validConcerts);
      } catch (error) {
        console.error('Erreur lors du chargement des concerts:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadExistingConcerts();
  }, [value]);

  // Formater une date de concert
  const formatConcertDate = useCallback((date) => {
    if (!date) return 'Date non définie';
    try {
      const dateObj = date.seconds ? new Date(date.seconds * 1000) : new Date(date);
      return format(dateObj, 'dd MMM yyyy', { locale: fr });
    } catch (error) {
      return 'Date invalide';
    }
  }, []);

  // Gérer la sélection d'un concert
  const handleSelectConcert = useCallback((concert) => {
    if (!concert || !concert.id) return;

    if (multiple) {
      // Mode multi-concerts
      const currentIds = concertsList.map(c => c.id);
      if (!currentIds.includes(concert.id)) {
        const newConcertsList = [...concertsList, concert];
        setConcertsList(newConcertsList);
        onChange(newConcertsList.map(c => c.id));
      }
    } else {
      // Mode mono-concert
      setConcertsList([concert]);
      onChange(concert.id);
    }

    // Réinitialiser la recherche
    setSearchTerm('');
    setShowResults(false);
  }, [concertsList, multiple, onChange, setSearchTerm, setShowResults]);

  // Gérer la suppression d'un concert
  const handleRemoveConcert = useCallback((concertId) => {
    const newConcertsList = concertsList.filter(c => c.id !== concertId);
    setConcertsList(newConcertsList);
    
    if (multiple) {
      onChange(newConcertsList.map(c => c.id));
    } else {
      onChange(newConcertsList.length > 0 ? newConcertsList[0].id : null);
    }
  }, [concertsList, multiple, onChange]);

  // Gérer la création d'un nouveau concert
  const handleCreateNewConcert = useCallback(() => {
    if (handleCreateConcert) {
      handleCreateConcert();
    }
  }, [handleCreateConcert]);

  // Renderiser un concert sélectionné
  const renderSelectedConcert = useCallback((concert) => {
    const secondaryInfo = [
      concert.date && formatConcertDate(concert.date),
      concert.lieuNom,
      concert.artisteNom
    ].filter(Boolean).join(' • ');

    return (
      <SelectedEntityCard
        key={concert.id}
        entity={{
          id: concert.id,
          title: concert.titre || 'Concert sans titre',
          subtitle: secondaryInfo,
          icon: 'bi-music-note'
        }}
        onRemove={isEditing ? () => handleRemoveConcert(concert.id) : null}
        linkTo={`/concerts/${concert.id}`}
        isEditing={isEditing}
      />
    );
  }, [formatConcertDate, handleRemoveConcert, isEditing]);


  return (
    <div className={`${styles.unifiedConcertSelector} ${className}`}>
      <CardSection 
        title={`${label} ${concertsList.length > 0 ? `(${concertsList.length})` : ''}`}
        icon="bi-music-note-list"
        isEditing={isEditing}
      >
        {/* Concerts sélectionnés */}
        {concertsList.length > 0 && (
          <div className={styles.selectedConcerts}>
            {concertsList.map(renderSelectedConcert)}
          </div>
        )}

        {/* Interface de recherche en mode édition */}
        {isEditing && (
          <div className={styles.searchSection}>
            <SearchDropdown
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              showResults={showResults}
              setShowResults={setShowResults}
              isSearching={isSearching}
              placeholder={`Rechercher ${multiple ? 'des concerts' : 'un concert'}...`}
              onCreate={handleCreateNewConcert}
              createButtonText="Nouveau concert"
              entityType="concerts"
            />
            {/* Custom results rendering for concerts */}
            {showResults && results.length > 0 && (
              <div className={styles.searchResults}>
                {results.map((concert) => {
                  const isAlreadySelected = concertsList.some(c => c.id === concert.id);
                  
                  return (
                    <div
                      key={concert.id}
                      className={`${styles.searchResultItem} ${isAlreadySelected ? styles.disabled : ''}`}
                      onClick={!isAlreadySelected ? () => handleSelectConcert(concert) : undefined}
                    >
                      <div className={styles.concertInfo}>
                        <div className={styles.concertTitle}>
                          <i className="bi bi-music-note me-2"></i>
                          {concert.titre || 'Concert sans titre'}
                        </div>
                        <div className={styles.concertDetails}>
                          {concert.date && (
                            <span className={styles.concertDate}>
                              <i className="bi bi-calendar me-1"></i>
                              {formatConcertDate(concert.date)}
                            </span>
                          )}
                          {concert.lieuNom && (
                            <span className={styles.concertLieu}>
                              <i className="bi bi-geo-alt me-1"></i>
                              {concert.lieuNom}
                            </span>
                          )}
                          {concert.artisteNom && (
                            <span className={styles.concertArtiste}>
                              <i className="bi bi-person me-1"></i>
                              {concert.artisteNom}
                            </span>
                          )}
                        </div>
                      </div>
                      {isAlreadySelected && (
                        <div className={styles.alreadySelected}>
                          <i className="bi bi-check-circle text-success"></i>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Message vide */}
        {!isLoading && concertsList.length === 0 && !isEditing && (
          <div className={styles.emptyState}>
            <i className="bi bi-music-note text-muted me-2"></i>
            <span className="text-muted">Aucun concert associé</span>
          </div>
        )}

        {/* Loading state */}
        {isLoading && (
          <div className={styles.loadingState}>
            <div className="spinner-border spinner-border-sm me-2" role="status">
              <span className="visually-hidden">Chargement...</span>
            </div>
            Chargement des concerts...
          </div>
        )}
      </CardSection>
    </div>
  );
};

UnifiedConcertSelector.propTypes = {
  multiple: PropTypes.bool,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
  onChange: PropTypes.func.isRequired,
  isEditing: PropTypes.bool,
  entityId: PropTypes.string,
  entityType: PropTypes.string,
  label: PropTypes.string,
  required: PropTypes.bool,
  className: PropTypes.string
};

export default UnifiedConcertSelector;