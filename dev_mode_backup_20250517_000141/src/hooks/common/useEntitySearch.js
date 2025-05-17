import { useState, useRef, useEffect } from 'react';
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
} from '@/firebaseInit';

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

  // États de base pour la recherche
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState(null);
  
  // Références pour la gestion du debounce et du dropdown
  const searchTimeoutRef = useRef(null);
  const dropdownRef = useRef(null);

  // Effet pour la recherche avec debounce
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    if (searchTerm.length >= 2) {
      setIsSearching(true);
      searchTimeoutRef.current = setTimeout(() => {
        performSearch();
      }, 300);
    } else {
      setResults([]);
      setIsSearching(false);
    }
    
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm, entityType]);

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

  // Fonction de recherche dans Firestore
  const performSearch = async () => {
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
      } else if (searchField === 'nom' || searchField.endsWith('Lowercase')) {
        // Recherche avec préfixe pour les champs de type nom
        const queryField = searchField === 'nom' ? 'nomLowercase' : searchField;
        searchQuery = query(
          entitiesRef,
          where(queryField, '>=', termLower),
          where(queryField, '<=', termLower + '\uf8ff'),
          orderBy(queryField),
          limit(maxResults)
        );
      } else {
        // Recherche générale ordonnée par date de création décroissante
        searchQuery = query(
          entitiesRef,
          orderBy('createdAt', 'desc'),
          limit(maxResults * 2) // Récupérer plus de résultats pour permettre le filtrage local
        );
      }
      
      const snapshot = await getDocs(searchQuery);
      let entitiesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Filtrage local pour les requêtes non spécifiques
      if (!isDateFormat && !(searchField === 'nom' || searchField.endsWith('Lowercase'))) {
        entitiesData = entitiesData.filter(entity => {
          // Recherche dans le champ principal
          if (entity[searchField] && 
              typeof entity[searchField] === 'string' &&
              entity[searchField].toLowerCase().includes(termLower)) {
            return true;
          }
          
          // Recherche dans les champs additionnels
          return additionalSearchFields.some(field => 
            entity[field] && 
            typeof entity[field] === 'string' &&
            entity[field].toLowerCase().includes(termLower)
          );
        });
        
        // Limiter aux maxResults après filtrage
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
  };

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
  const handleCreate = async (additionalData = {}) => {
    if (!allowCreate) {
      console.warn(`Création non autorisée pour le type d'entité: ${entityType}`);
      return null;
    }
    
    if (!searchTerm.trim()) {
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
        ...additionalData
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
            ...additionalData
          };
          break;
        case 'programmateurs':
          entityData = {
            ...entityData,
            email: '',
            telephone: '',
            structure: '',
            concertsAssocies: [],
            ...additionalData
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
              ...additionalData.contacts
            },
            ...additionalData
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
            ...additionalData
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
            ...additionalData
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
      
      if (onSelect) {
        onSelect(newEntityWithId);
      }
      
      return newEntityWithId;
    } catch (error) {
      console.error(`Erreur lors de la création du ${entityType.slice(0, -1)}:`, error);
      alert(`Une erreur est survenue lors de la création du ${entityType.slice(0, -1)}.`);
      return null;
    }
  };

  return {
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
};

export default useEntitySearch;