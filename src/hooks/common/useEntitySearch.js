import { useState, useRef, useEffect, useCallback } from 'react';
import { 
  collection, 
  query, 
  where, 
  limit, 
  getDocs,
  doc,
  setDoc,
  orderBy,
  serverTimestamp,
  db
} from '@/services/firebase-service';

/**
 * Hook générique pour la recherche d'entités (lieux, programmateurs, artistes, concerts, etc.)
 * @param {Object} options - Options de configuration du hook
 * @param {string} options.entityType - Type d'entité à rechercher ('lieux', 'programmateurs', 'artistes', 'concerts')
 * @param {string} options.searchField - Champ sur lequel effectuer la recherche principale (par défaut: 'nom')
 * @param {string[]} options.additionalSearchFields - Champs supplémentaires pour la recherche (optionnel)
 * @param {number} options.maxResults - Nombre maximum de résultats à retourner (par défaut: 10)
 * @param {Function} options.onSelect - Callback appelé quand une entité est sélectionnée (optionnel)
 * @param {Function} options.filterResults - Fonction pour filtrer les résultats (optionnel)
 * @param {boolean} options.allowCreate - Permet la création de nouvelles entités si true (par défaut: true)
 * @param {Function} options.customSearchFunction - Fonction personnalisée pour la recherche (optionnel)
 */
export const useEntitySearch = (options) => {
  // console.log('=== useEntitySearch CALLED ===');
  // console.log('options:', options);
  
  const {
    entityType, 
    searchField = 'nom',
    additionalSearchFields = [],
    maxResults = 10,
    onSelect = null,
    filterResults = null,
    allowCreate = true,
    customSearchFunction = null
  } = options;

  // console.log('Parsed options:', { entityType, searchField, onSelect: !!onSelect });

  // États de base pour la recherche
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState(null);
  
  // console.log('Hook states initialized - setSearchTerm type:', typeof setSearchTerm);
  
  // Références pour la gestion du debounce et du dropdown
  const searchTimeoutRef = useRef(null);
  const dropdownRef = useRef(null);

  // NOUVEAU: Fonction de recherche stabilisée avec useCallback - Finalisation intelligente
  const performSearch = useCallback(async () => {
    try {
      // Si une fonction de recherche personnalisée est fournie, l'utiliser
      if (customSearchFunction) {
        const customResults = await customSearchFunction(searchTerm);
        setResults(customResults);
        setShowResults(customResults.length > 0);
        setIsSearching(false);
        return;
      }
      
      const termLower = searchTerm.toLowerCase();
      
      // Construction de la requête de base
      const entitiesRef = collection(db, entityType);
      
      // Recherche par le champ principal
      let searchQuery;
      
      // Vérifier si le terme de recherche est une date (pour les concerts)
      const isDateFormat = /^\d{4}-\d{2}-\d{2}$/.test(searchTerm);
      
      if (isDateFormat && entityType === 'concerts') {
        // Recherche exacte sur le champ date
        searchQuery = query(
          entitiesRef,
          where('date', '==', searchTerm),
          limit(maxResults)
        );
      } else {
        // Pour une recherche plus large, récupérer plus de résultats et filtrer localement
        // Cela permet de trouver "chez tutu" même en tapant "tutu"
        searchQuery = query(
          entitiesRef,
          orderBy('createdAt', 'desc'),
          limit(maxResults * 5) // Récupérer 5x plus pour permettre un bon filtrage
        );
      }
      
      const snapshot = await getDocs(searchQuery);
      let entitiesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Filtrage local pour toutes les requêtes non-date
      if (!isDateFormat) {
        entitiesData = entitiesData.filter(entity => {
          // Recherche dans le nom (insensible à la casse)
          const entityName = entity.nom || entity.titre || '';
          if (entityName.toLowerCase().includes(termLower)) {
            return true;
          }
          
          // Recherche dans les champs additionnels
          return additionalSearchFields.some(field => 
            entity[field] && 
            typeof entity[field] === 'string' &&
            entity[field].toLowerCase().includes(termLower)
          );
        });
        
        // Trier les résultats pour mettre ceux qui commencent par le terme en premier
        entitiesData.sort((a, b) => {
          const aName = (a.nom || a.titre || '').toLowerCase();
          const bName = (b.nom || b.titre || '').toLowerCase();
          const aStartsWith = aName.startsWith(termLower);
          const bStartsWith = bName.startsWith(termLower);
          
          if (aStartsWith && !bStartsWith) return -1;
          if (!aStartsWith && bStartsWith) return 1;
          
          // Si les deux commencent ou ne commencent pas par le terme, trier alphabétiquement
          return aName.localeCompare(bName);
        });
        
        // Limiter aux maxResults après filtrage et tri
        entitiesData = entitiesData.slice(0, maxResults);
      }
      
      // Appliquer un filtre personnalisé si fourni
      if (filterResults) {
        entitiesData = filterResults(entitiesData);
      }
      
      setResults(entitiesData);
      setShowResults(entitiesData.length > 0);
    } catch (error) {
      console.error(`Erreur lors de la recherche de ${entityType}:`, error);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [searchTerm, entityType, customSearchFunction, maxResults, additionalSearchFields, filterResults]);

  // Référence stable pour performSearch
  const performSearchRef = useRef();
  performSearchRef.current = performSearch;

  // Effet pour déclencher la recherche avec debounce - NOUVEAU: Dépendance performSearch ajoutée
  useEffect(() => {
    if (!searchTerm.trim()) {
      setResults([]);
      setShowResults(false);
      setIsSearching(false);
      return;
    }
    
    setIsSearching(true);
    
    // Debounce de 300ms
    searchTimeoutRef.current = setTimeout(() => {
      performSearchRef.current(); // Utiliser la ref au lieu de la fonction directe
    }, 300);
    
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm]); // Retiré entityType et performSearch des dépendances

  // Nouvel effet pour réinitialiser quand entityType change
  useEffect(() => {
    setResults([]);
    setShowResults(false);
    setSelectedEntity(null);
  }, [entityType]);

  // Gestionnaire pour les clics en dehors du dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fonction pour sélectionner une entité
  const handleSelect = (entity) => {
    setSelectedEntity(entity);
    setSearchTerm(entity[searchField] || '');
    setShowResults(false);
    
    if (onSelect) {
      onSelect(entity);
    }
  };

  // Fonction pour supprimer l'entité sélectionnée
  const handleRemove = () => {
    setSelectedEntity(null);
    setSearchTerm('');
    
    if (onSelect) {
      onSelect(null);
    }
  };

  // Fonction pour créer une nouvelle entité
  const handleCreate = async (callbackOrAdditionalData = {}, additionalData = {}) => {
    // Gérer les paramètres - si le premier paramètre est une fonction, c'est le callback
    let callback = null;
    let entityAdditionalData = {};
    
    if (typeof callbackOrAdditionalData === 'function') {
      callback = callbackOrAdditionalData;
      entityAdditionalData = additionalData;
    } else {
      entityAdditionalData = callbackOrAdditionalData;
    }
    
    console.log(`[DEBUG][useEntitySearch] handleCreate appelé pour ${entityType}`, {
      allowCreate,
      searchTerm,
      callback: !!callback,
      entityAdditionalData
    });
    
    if (!allowCreate) {
      console.warn(`Création non autorisée pour le type d'entité: ${entityType}`);
      return null;
    }
    
    if (!searchTerm.trim()) {
      console.error(`[DEBUG][useEntitySearch] Nom vide pour ${entityType}`);
      alert(`Veuillez saisir un nom avant de créer un nouveau ${entityType.slice(0, -1)}.`);
      return null;
    }
    
    try {
      
      // Données de base pour chaque type d'entité
      let entityData = {
        nom: searchTerm.trim(),
        nomLowercase: searchTerm.trim().toLowerCase(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        ...entityAdditionalData
      };
      
      
      // Données spécifiques selon le type d'entité
      switch (entityType) {
        case 'lieux':
          entityData = {
            ...entityData,
            adresse: '',
            codePostal: '',
            ville: '',
            capacite: '',
            ...entityAdditionalData
          };
          break;
        case 'programmateurs':
          entityData = {
            ...entityData,
            email: '',
            telephone: '',
            structure: '',
            concertsAssocies: [],
            ...entityAdditionalData
          };
          break;
        case 'artistes':
          entityData = {
            ...entityData,
            description: '',
            genre: '',
            membres: [],
            contacts: {
              email: '',
              telephone: '',
              siteWeb: '',
              instagram: '',
              facebook: '',
              ...entityAdditionalData.contacts
            },
            ...entityAdditionalData
          };
          break;
        case 'concerts':
          entityData = {
            ...entityData,
            titre: searchTerm.trim(),
            date: new Date().toISOString().split('T')[0],
            lieuId: null,
            lieuNom: null,
            artisteId: null,
            artisteNom: null,
            ...entityAdditionalData
          };
          break;
        case 'structures':
          entityData = {
            ...entityData,
            adresse: '',
            codePostal: '',
            ville: '',
            siren: '',
            siret: '',
            ...entityAdditionalData
          };
          break;
        default:
          // Ne pas ajouter de champs spécifiques pour les autres types d'entité
          break;
      }
      
      
      // Créer le document dans Firestore
      const newEntityRef = doc(collection(db, entityType));
      
      await setDoc(newEntityRef, entityData);
      
      // Créer l'objet complet avec l'ID
      const newEntityWithId = { 
        id: newEntityRef.id,
        ...entityData
      };
      
      
      // Définir comme entité sélectionnée
      setSelectedEntity(newEntityWithId);
      setShowResults(false);
      
      // Si un callback est fourni, l'appeler avec l'entité créée
      if (callback) {
        callback(newEntityWithId);
      } else if (onSelect) {
        onSelect(newEntityWithId);
      }
      
      // Afficher une alerte de succès
      const entityName = entityType.slice(0, -1); // Enlever le 's' pour avoir le singulier
      const entityNameDisplay = entityName.charAt(0).toUpperCase() + entityName.slice(1);
      const alertMessage = `✅ ${entityNameDisplay} "${searchTerm.trim()}" ajouté avec succès !`;
      
      // Définir les couleurs selon le type d'entité
      let backgroundColor = '#28a745'; // Vert par défaut
      let icon = 'bi-check-circle-fill';
      
      switch (entityType) {
        case 'lieux':
          backgroundColor = '#17a2b8'; // Bleu info
          icon = 'bi-geo-alt-fill';
          break;
        case 'programmateurs':
          backgroundColor = '#6f42c1'; // Violet
          icon = 'bi-person-fill';
          break;
        case 'artistes':
          backgroundColor = '#fd7e14'; // Orange
          icon = 'bi-music-note-beamed';
          break;
        case 'structures':
          backgroundColor = '#20c997'; // Teal
          icon = 'bi-building';
          break;
        default:
          break;
      }
      
      // Créer et afficher l'alerte temporaire
      const alertDiv = document.createElement('div');
      alertDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background-color: ${backgroundColor};
        color: white;
        padding: 16px 24px;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        z-index: 9999;
        font-size: 16px;
        display: flex;
        align-items: center;
        gap: 10px;
        animation: slideIn 0.3s ease-out;
      `;
      alertDiv.innerHTML = `<i class="bi ${icon}"></i> ${alertMessage}`;
      
      // Ajouter l'animation CSS
      const style = document.createElement('style');
      style.textContent = `
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        @keyframes slideOut {
          from {
            transform: translateX(0);
            opacity: 1;
          }
          to {
            transform: translateX(100%);
            opacity: 0;
          }
        }
      `;
      document.head.appendChild(style);
      
      document.body.appendChild(alertDiv);
      
      // Retirer l'alerte après 3 secondes
      setTimeout(() => {
        alertDiv.style.animation = 'slideOut 0.3s ease-in forwards';
        setTimeout(() => {
          document.body.removeChild(alertDiv);
          document.head.removeChild(style);
        }, 300);
      }, 3000);
      
      return newEntityWithId;
    } catch (error) {
      console.error(`[DEBUG][useEntitySearch] ERREUR lors de la création du ${entityType.slice(0, -1)}:`, error);
      console.error(`[DEBUG][useEntitySearch] Stack trace:`, error.stack);
      alert(`Une erreur est survenue lors de la création du ${entityType.slice(0, -1)}.`);
      return null;
    }
  };

  // console.log('=== useEntitySearch RETURNING ===');
  const returnValue = {
    searchTerm,
    setSearchTerm,
    results,
    isSearching,
    showResults,
    setShowResults,
    selectedEntity,
    setSelectedEntity,
    handleSelect,
    handleRemove,
    handleCreate,
    performSearch,
    dropdownRef
  };
  // console.log('Return value:', returnValue);
  // console.log('setSearchTerm in return:', typeof setSearchTerm, setSearchTerm);
  // console.log('===================================');

  return returnValue;
};