import React, { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import {  collection, getDocs, query, where, limit  } from '@/services/firebase-service';
import { db } from '../../services/firebase-service';
import { useOrganization } from '@/context/OrganizationContext';
import styles from './EntitySelector.module.css';

/**
 * Composant générique pour la sélection d'entités
 * Utilisé pour sélectionner des contacts, artistes, lieux, etc.
 * 
 * @param {Object} props - Propriétés du composant
 * @param {string} props.entityType - Type d'entité (artistes, contacts, lieux, etc.)
 * @param {string} props.label - Label du sélecteur
 * @param {Object} props.selectedEntity - Entité sélectionnée
 * @param {Function} props.onSelect - Fonction appelée lors de la sélection (reçoit l'entité complète)
 * @param {string} props.idField - Nom du champ ID dans l'entité (défaut: 'id')
 * @param {string} props.displayField - Nom du champ à afficher (défaut: 'nom')
 * @param {Object} props.filters - Filtres Firestore à appliquer {field: value, ...}
 * @param {string} props.orderByField - Champ pour le tri (défaut: displayField)
 * @param {string} props.placeholder - Texte d'indication
 * @param {boolean} props.required - Si la sélection est requise
 * @param {string} props.className - Classes additionnelles
 * @param {boolean} props.disabled - Si le sélecteur est désactivé
 * @param {boolean} props.allowClear - Autorise l'effacement de la sélection
 * @param {number} props.maxResults - Nombre maximum de résultats (défaut: 25)
 * @return {JSX.Element} Composant de sélection d'entité
 */
const EntitySelector = ({
  entityType,
  label,
  selectedEntity,
  onSelect,
  idField = 'id',
  displayField = 'nom',
  filters = {},
  orderByField,
  placeholder = 'Sélectionner...',
  required = false,
  className = '',
  disabled = false,
  allowClear = true,
  maxResults = 25,
  error,
  helperText,
}) => {
  const [entities, setEntities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  
  const { currentOrganization } = useOrganization();

  // Configuration des types d'entités supportés
  const entityConfigs = useMemo(() => ({
    artistes: {
      collection: 'artistes',
      displayField: 'nom',
      icon: 'bi-music-note',
      idField: 'id',
    },
    contacts: {
      collection: 'contacts',
      displayField: 'nom',
      icon: 'bi-person',
      idField: 'id',
    },
    lieux: {
      collection: 'lieux',
      displayField: 'nom',
      icon: 'bi-geo-alt',
      idField: 'id',
    },
    structures: {
      collection: 'structures',
      displayField: 'raisonSociale',
      icon: 'bi-building',
      idField: 'id',
    },
    contrats: {
      collection: 'contrats',
      displayField: 'reference',
      icon: 'bi-file-text',
      idField: 'id',
    },
    concerts: {
      collection: 'concerts',
      displayField: 'titre',
      icon: 'bi-calendar-event',
      idField: 'id',
    },
  }), []);

  // Récupération de la configuration pour le type d'entité
  const config = useMemo(() => {
    // Si une configuration existe pour ce type d'entité
    if (entityConfigs[entityType]) {
      return entityConfigs[entityType];
    }
    
    // Sinon, utiliser les valeurs par défaut ou fournies en props
    return {
      collection: entityType,
      displayField,
      icon: 'bi-box',
      idField,
    };
  }, [entityType, displayField, idField, entityConfigs]);

  // Mémoriser les clés des filtres pour éviter les re-renders inutiles
  const filterKeys = useMemo(() => {
    return filters ? Object.keys(filters).sort().join(',') : '';
  }, [filters]);

  // Chargement initial des entités
  useEffect(() => {
    if (!entityType) return;
    
    const loadEntities = async () => {
      setLoading(true);
      try {
        // Obtenir la config directement ici pour éviter les problèmes de dépendances
        const currentConfig = entityConfigs[entityType] || {
          collection: entityType,
          displayField: displayField || 'nom',
          icon: 'bi-box',
          idField: idField || 'id',
        };
        
        console.log('[EntitySelector] Loading entities:', { 
          entityType, 
          currentConfig, 
          currentOrganization,
          entrepriseId: currentOrganization?.id,
          filters 
        });
        const collectionRef = collection(db, currentConfig.collection || entityType);
        
        // Construction de la requête avec filtre organisation
        const queryConditions = [];
        
        // Ajouter le filtre organisation si disponible
        if (currentOrganization?.id) {
          queryConditions.push(where('entrepriseId', '==', currentOrganization.id));
        }
        
        // Ajout des filtres supplémentaires
        if (filters) {
          Object.entries(filters).forEach(([field, value]) => {
            if (value !== undefined && value !== null) {
              queryConditions.push(where(field, '==', value));
            }
          });
        }
        
        // Ajouter la limite
        queryConditions.push(limit(maxResults));
        
        // Construire la requête
        const q = queryConditions.length > 0 
          ? query(collectionRef, ...queryConditions)
          : query(collectionRef, limit(maxResults));
        
        // Exécution de la requête
        const querySnapshot = await getDocs(q);
        console.log('[EntitySelector] Query results:', {
          size: querySnapshot.size,
          collection: currentConfig.collection || entityType,
          organizationFilter: currentOrganization?.id,
          queryConditions: queryConditions.length
        });
        
        // Transformation des documents
        const loadedEntities = querySnapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id // Toujours utiliser 'id' comme identifiant
        }));
        
        console.log('[EntitySelector] Loaded entities:', {
          count: loadedEntities.length,
          entities: loadedEntities.slice(0, 3), // Afficher les 3 premières pour debug
          hasEntrepriseId: loadedEntities.length > 0 ? loadedEntities[0].entrepriseId : 'no entities'
        });
        
        // Tri côté client pour éviter les problèmes d'index Firestore
        const sortField = orderByField || currentConfig.displayField;
        loadedEntities.sort((a, b) => {
          const aValue = String(a[sortField] || '').toLowerCase();
          const bValue = String(b[sortField] || '').toLowerCase();
          return aValue.localeCompare(bValue);
        });
        
        setEntities(loadedEntities);
      } catch (error) {
        console.error(`[EntitySelector] Erreur lors du chargement des ${entityType}:`, error);
        setEntities([]);
      } finally {
        setLoading(false);
      }
    };
    
    loadEntities();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entityType, currentOrganization?.id, orderByField, maxResults, displayField, idField, filterKeys, entityConfigs]);

  // Filtrage des entités basé sur la recherche
  const filteredEntities = useMemo(() => {
    if (!search.trim()) return entities;
    
    const searchLower = search.toLowerCase();
    return entities.filter(entity => {
      const displayValue = String(entity[config.displayField] || '').toLowerCase();
      return displayValue.includes(searchLower);
    });
  }, [entities, search, config.displayField]);

  // Gestion de la sélection
  const handleSelect = (entity) => {
    onSelect(entity);
    setIsOpen(false);
    setSearch('');
  };

  // Effacement de la sélection
  const handleClear = (e) => {
    e.stopPropagation();
    onSelect(null);
  };

  // Affichage de la valeur sélectionnée
  const getDisplayValue = () => {
    if (!selectedEntity) return '';
    return selectedEntity[config.displayField] || '';
  };

  return (
    <div className={`${styles.container} ${className}`}>
      {label && (
        <label className={styles.label}>
          {label}
          {required && <span className={styles.required}>*</span>}
        </label>
      )}
      
      <div 
        className={`${styles.selector} ${isOpen ? styles.open : ''} ${error ? styles.error : ''} ${disabled ? styles.disabled : ''}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <div className={styles.selectedValue}>
          {selectedEntity ? (
            <>
              <i className={`bi ${config.icon} ${styles.icon}`}></i>
              <span>{getDisplayValue()}</span>
              {allowClear && !disabled && (
                <button 
                  className={styles.clearButton}
                  onClick={handleClear}
                  type="button"
                  aria-label="Effacer"
                >
                  <i className="bi bi-x"></i>
                </button>
              )}
            </>
          ) : (
            <span className={styles.placeholder}>{placeholder}</span>
          )}
          <i className={`bi bi-chevron-down ${styles.arrow} ${isOpen ? styles.up : ''}`}></i>
        </div>
        
        {isOpen && (
          <div className={styles.dropdown}>
            <input
              type="text"
              className={styles.search}
              placeholder="Rechercher..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              autoFocus
            />
            
            <div className={styles.itemsList}>
              {loading ? (
                <div className={styles.loading}>
                  <i className="bi bi-hourglass-split"></i>
                  <span>Chargement...</span>
                </div>
              ) : filteredEntities.length > 0 ? (
                filteredEntities.map((entity) => (
                  <div 
                    key={entity[config.idField]} 
                    className={styles.item}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelect(entity);
                    }}
                  >
                    <i className={`bi ${config.icon} ${styles.itemIcon}`}></i>
                    <span>{entity[config.displayField]}</span>
                  </div>
                ))
              ) : (
                <div className={styles.noResults}>
                  <i className="bi bi-search"></i>
                  <span>Aucun résultat</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      {helperText && (
        <div className={`${styles.helperText} ${error ? styles.errorText : ''}`}>
          {helperText}
        </div>
      )}
    </div>
  );
};

EntitySelector.propTypes = {
  entityType: PropTypes.string.isRequired,
  label: PropTypes.string,
  selectedEntity: PropTypes.object,
  onSelect: PropTypes.func.isRequired,
  idField: PropTypes.string,
  displayField: PropTypes.string,
  filters: PropTypes.object,
  orderByField: PropTypes.string,
  placeholder: PropTypes.string,
  required: PropTypes.bool,
  className: PropTypes.string,
  disabled: PropTypes.bool,
  allowClear: PropTypes.bool,
  maxResults: PropTypes.number,
  error: PropTypes.bool,
  helperText: PropTypes.string
};

export default EntitySelector;