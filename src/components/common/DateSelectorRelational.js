import React, { useState, useEffect, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import CardSection from '@/components/ui/CardSection';
import SearchDropdown from '@/components/dates/sections/SearchDropdown';
import SelectedEntityCard from '@/components/dates/sections/SelectedEntityCard';
import { datesService } from '@/services/dateService';
import { useEntreprise } from '@/context/EntrepriseContext';
import { useNavigate } from 'react-router-dom';
import styles from './ContactSelectorRelational.module.css'; // Réutiliser les mêmes styles

/**
 * Composant pour la sélection de dates utilisant le nouveau système
 * Remplace UnifiedDateSelector
 * 
 * @param {Object} props
 * @param {boolean} props.multiple - Si true, permet la sélection de plusieurs dates
 * @param {string|Array} props.value - ID(s) du/des date(s) sélectionné(s)
 * @param {Function} props.onChange - Callback appelé lors du changement (reçoit un ID ou un tableau d'IDs)
 * @param {boolean} props.isEditing - Si true, affiche en mode édition
 * @param {string} props.entityId - ID de l'entité parente (pour les relations bidirectionnelles)
 * @param {string} props.entityType - Type de l'entité parente ('structure', 'lieu', etc.)
 * @param {string} props.label - Label à afficher
 * @param {boolean} props.required - Si true, au moins un date est requis
 */
const DateSelectorRelational = ({
  multiple = false,
  value,
  onChange,
  isEditing = false,
  entityId,
  entityType,
  label = 'Date(s)',
  required = false,
  className = ''
}) => {
  // État local
  const [datesList, setDatesList] = useState([]);
  const [showAddDate, setShowAddDate] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  
  const dropdownRef = useRef(null);
  const searchTimeoutRef = useRef(null);
  const { currentEntreprise } = useEntreprise();
  const navigate = useNavigate();

  // Charger les dates existants au montage
  useEffect(() => {
    const loadExistingDates = async () => {
      // Normaliser la valeur en tableau pour simplifier la logique
      const normalizedValue = Array.isArray(value) 
        ? value 
        : (value ? [value] : []);

      if (normalizedValue.length === 0) {
        setDatesList([]);
        return;
      }

      setIsLoading(true);
      try {
        const datePromises = normalizedValue.map(async (dateId) => {
          if (!dateId) return null;
          
          try {
            const date = await datesService.getDateById(dateId);
            return date;
          } catch (error) {
            console.error(`Erreur chargement date ${dateId}:`, error);
            return null;
          }
        });

        const loadedDates = (await Promise.all(datePromises)).filter(Boolean);
        setDatesList(loadedDates);
      } catch (error) {
        console.error('Erreur lors du chargement des dates:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadExistingDates();
  }, [value]);

  // Recherche de dates
  const handleSearch = useCallback(async (searchValue) => {
    if (!currentEntreprise?.id) return;
    
    setIsSearching(true);
    try {
      // Rechercher dans tous les dates de l'organisation
      const dates = await datesService.searchDates(currentEntreprise.id, searchValue);
      
      // Filtrer les dates déjà sélectionnés si mode multiple
      const filteredResults = multiple 
        ? dates.filter(c => !datesList.some(selected => selected.id === c.id))
        : dates;
      
      setSearchResults(filteredResults);
      setShowResults(true);
    } catch (error) {
      console.error('Erreur recherche dates:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [currentEntreprise?.id, multiple, datesList]);

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

  // Sélectionner un date
  const handleSelectDate = useCallback((date) => {
    if (multiple) {
      const newList = [...datesList, date];
      setDatesList(newList);
      onChange(newList.map(c => c.id));
    } else {
      setDatesList([date]);
      onChange(date.id);
      setShowAddDate(false);
    }
    
    setSearchTerm('');
    setShowResults(false);
  }, [multiple, datesList, onChange]);

  // Supprimer un date
  const handleRemoveDate = useCallback((dateId) => {
    if (multiple) {
      const newList = datesList.filter(c => c.id !== dateId);
      setDatesList(newList);
      onChange(newList.map(c => c.id));
    } else {
      setDatesList([]);
      onChange(null);
      setShowAddDate(true);
    }
  }, [multiple, datesList, onChange]);

  // Créer un nouveau date
  const handleCreateDate = useCallback(() => {
    navigate('/dates/nouveau');
  }, [navigate]);

  // Formater la date d'un date
  const formatDateDate = (date) => {
    if (!date) return 'Date non définie';
    try {
      return format(new Date(date), 'dd MMMM yyyy', { locale: fr });
    } catch {
      return 'Date invalide';
    }
  };

  // Ne pas afficher en mode non-édition s'il n'y a pas de dates
  if (!isEditing && datesList.length === 0) {
    return null;
  }

  // Préparer les options de résultats de recherche
  const searchOptions = searchResults.map(date => ({
    id: date.id,
    nom: date.nom || 'Date sans nom',
    subtitle: formatDateDate(date.date),
    icon: 'bi-calendar-event'
  }));

  return (
    <CardSection title={label} className={className}>
      <div className={styles.selectorContainer}>
        {/* Dates sélectionnés */}
        {datesList.length > 0 && (
          <div className={styles.selectedList}>
            {datesList.map(date => (
              <SelectedEntityCard
                key={date.id}
                entity={{
                  ...date,
                  subtitle: formatDateDate(date.date)
                }}
                isEditing={isEditing}
                onRemove={() => handleRemoveDate(date.id)}
                onClick={() => navigate(`/dates/${date.id}`)}
                icon="bi-calendar-event"
              />
            ))}
          </div>
        )}

        {/* Zone de recherche */}
        {isEditing && (multiple || showAddDate) && (
          <div ref={dropdownRef} className={styles.searchContainer}>
            <SearchDropdown
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              results={searchOptions}
              showResults={showResults}
              setShowResults={setShowResults}
              isSearching={isSearching}
              handleSelectEntity={handleSelectDate}
              handleCreate={handleCreateDate}
              placeholder="Rechercher un date..."
              createLabel="Créer un nouveau date"
              emptyMessage="Aucun date trouvé"
            />
          </div>
        )}

        {/* Message de chargement */}
        {isLoading && (
          <div className={styles.loadingMessage}>
            <i className="bi bi-hourglass-split me-2"></i>
            Chargement des dates...
          </div>
        )}

        {/* Message si vide et requis */}
        {!isEditing && datesList.length === 0 && required && (
          <div className={styles.emptyMessage}>
            <i className="bi bi-exclamation-circle me-2"></i>
            Aucun date sélectionné
          </div>
        )}
      </div>
    </CardSection>
  );
};

DateSelectorRelational.propTypes = {
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

export default DateSelectorRelational;