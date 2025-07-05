import React, { useState, useEffect, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import CardSection from '@/components/ui/CardSection';
import SearchDropdown from '@/components/concerts/sections/SearchDropdown';
import SelectedEntityCard from '@/components/concerts/sections/SelectedEntityCard';
import { concertService } from '@/services/concertService';
import { useOrganization } from '@/context/OrganizationContext';
import { useNavigate } from 'react-router-dom';
import styles from './UnifiedConcertSelector.module.css'; // Réutiliser les styles existants

/**
 * Composant pour la sélection de concerts utilisant le nouveau système
 * Remplace UnifiedConcertSelector
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
const ConcertSelectorRelational = ({
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
  // État local
  const [concertsList, setConcertsList] = useState([]);
  const [showAddConcert, setShowAddConcert] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  
  const dropdownRef = useRef(null);
  const searchTimeoutRef = useRef(null);
  const { currentOrganization } = useOrganization();
  const navigate = useNavigate();

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
          
          try {
            const concert = await concertService.getConcertById(concertId);
            return concert;
          } catch (error) {
            console.error(`Erreur chargement concert ${concertId}:`, error);
            return null;
          }
        });

        const loadedConcerts = (await Promise.all(concertPromises)).filter(Boolean);
        setConcertsList(loadedConcerts);
      } catch (error) {
        console.error('Erreur lors du chargement des concerts:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadExistingConcerts();
  }, [value]);

  // Recherche de concerts
  const handleSearch = useCallback(async (searchValue) => {
    if (!currentOrganization?.id) return;
    
    setIsSearching(true);
    try {
      // Rechercher dans tous les concerts de l'organisation
      const concerts = await concertService.searchConcerts(currentOrganization.id, searchValue);
      
      // Filtrer les concerts déjà sélectionnés si mode multiple
      const filteredResults = multiple 
        ? concerts.filter(c => !concertsList.some(selected => selected.id === c.id))
        : concerts;
      
      setSearchResults(filteredResults);
      setShowResults(true);
    } catch (error) {
      console.error('Erreur recherche concerts:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [currentOrganization?.id, multiple, concertsList]);

  // Débounce de la recherche
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchTerm.trim()) {
      searchTimeoutRef.current = setTimeout(() => {
        handleSearch(searchTerm);
      }, 300);
    } else {
      setSearchResults([]);
      setShowResults(false);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm, handleSearch]);

  // Fermer le dropdown au clic extérieur
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sélectionner un concert
  const handleSelectConcert = useCallback((concert) => {
    if (multiple) {
      const newList = [...concertsList, concert];
      setConcertsList(newList);
      onChange(newList.map(c => c.id));
    } else {
      setConcertsList([concert]);
      onChange(concert.id);
      setShowAddConcert(false);
    }
    
    setSearchTerm('');
    setShowResults(false);
  }, [multiple, concertsList, onChange]);

  // Supprimer un concert
  const handleRemoveConcert = useCallback((concertId) => {
    if (multiple) {
      const newList = concertsList.filter(c => c.id !== concertId);
      setConcertsList(newList);
      onChange(newList.map(c => c.id));
    } else {
      setConcertsList([]);
      onChange(null);
      setShowAddConcert(true);
    }
  }, [multiple, concertsList, onChange]);

  // Créer un nouveau concert
  const handleCreateConcert = useCallback(() => {
    navigate('/concerts/nouveau');
  }, [navigate]);

  // Formater la date d'un concert
  const formatConcertDate = (date) => {
    if (!date) return 'Date non définie';
    try {
      return format(new Date(date), 'dd MMMM yyyy', { locale: fr });
    } catch {
      return 'Date invalide';
    }
  };

  // Ne pas afficher en mode non-édition s'il n'y a pas de concerts
  if (!isEditing && concertsList.length === 0) {
    return null;
  }

  // Préparer les options de résultats de recherche
  const searchOptions = searchResults.map(concert => ({
    id: concert.id,
    nom: concert.nom || 'Concert sans nom',
    subtitle: formatConcertDate(concert.date),
    icon: 'bi-calendar-event'
  }));

  return (
    <CardSection title={label} className={className}>
      <div className={styles.selectorContainer}>
        {/* Concerts sélectionnés */}
        {concertsList.length > 0 && (
          <div className={styles.selectedList}>
            {concertsList.map(concert => (
              <SelectedEntityCard
                key={concert.id}
                entity={{
                  ...concert,
                  subtitle: formatConcertDate(concert.date)
                }}
                isEditing={isEditing}
                onRemove={() => handleRemoveConcert(concert.id)}
                onClick={() => navigate(`/concerts/${concert.id}`)}
                icon="bi-calendar-event"
              />
            ))}
          </div>
        )}

        {/* Zone de recherche */}
        {isEditing && (multiple || showAddConcert) && (
          <div ref={dropdownRef} className={styles.searchContainer}>
            <SearchDropdown
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              results={searchOptions}
              showResults={showResults}
              setShowResults={setShowResults}
              isSearching={isSearching}
              handleSelectEntity={handleSelectConcert}
              handleCreate={handleCreateConcert}
              placeholder="Rechercher un concert..."
              createLabel="Créer un nouveau concert"
              emptyMessage="Aucun concert trouvé"
            />
          </div>
        )}

        {/* Message de chargement */}
        {isLoading && (
          <div className={styles.loadingMessage}>
            <i className="bi bi-hourglass-split me-2"></i>
            Chargement des concerts...
          </div>
        )}

        {/* Message si vide et requis */}
        {!isEditing && concertsList.length === 0 && required && (
          <div className={styles.emptyMessage}>
            <i className="bi bi-exclamation-circle me-2"></i>
            Aucun concert sélectionné
          </div>
        )}
      </div>
    </CardSection>
  );
};

ConcertSelectorRelational.propTypes = {
  multiple: PropTypes.bool,
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.string)
  ]),
  onChange: PropTypes.func.isRequired,
  isEditing: PropTypes.bool,
  entityId: PropTypes.string,
  entityType: PropTypes.string,
  label: PropTypes.string,
  required: PropTypes.bool,
  className: PropTypes.string
};

export default ConcertSelectorRelational;