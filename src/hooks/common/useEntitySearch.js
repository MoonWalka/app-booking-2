import { useState, useRef, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  limit, 
  getDocs,
  doc,
  setDoc
} from 'firebase/firestore';
import { db } from '@/firebaseInit';

/**
 * Hook générique pour la recherche d'entités (lieux, programmateurs, artistes, etc.)
 * @param {string} entityType - Type d'entité à rechercher ('lieux', 'programmateurs', 'artistes')
 * @param {string} searchField - Champ sur lequel effectuer la recherche (généralement 'nom')
 * @param {number} maxResults - Nombre maximum de résultats à retourner
 */
export const useEntitySearch = (entityType, searchField = 'nom', maxResults = 10) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState(null);
  
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
      const termLower = searchTerm.toLowerCase();
      
      const entitiesRef = collection(db, entityType);
      const searchQuery = query(
        entitiesRef,
        where(searchField, '>=', termLower),
        where(searchField, '<=', termLower + '\uf8ff'),
        limit(maxResults)
      );
      
      const snapshot = await getDocs(searchQuery);
      const entitiesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setResults(entitiesData);
      setShowResults(true);
    } catch (error) {
      console.error(`Erreur lors de la recherche de ${entityType}:`, error);
    } finally {
      setIsSearching(false);
    }
  };

  // Fonction pour sélectionner une entité
  const handleSelect = (entity) => {
    setSelectedEntity(entity);
    setSearchTerm(entity[searchField]);
    setShowResults(false);
  };

  // Fonction pour supprimer l'entité sélectionnée
  const handleRemove = () => {
    setSelectedEntity(null);
    setSearchTerm('');
  };

  // Fonction pour créer une nouvelle entité
  const handleCreate = async (additionalData = {}) => {
    if (!searchTerm.trim()) {
      alert(`Veuillez saisir un nom avant de créer un nouveau ${entityType.slice(0, -1)}.`);
      return null;
    }
    
    try {
      // Données de base pour chaque type d'entité
      let entityData = {
        nom: searchTerm.trim(),
        nomLowercase: searchTerm.trim().toLowerCase(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...additionalData
      };
      
      // Données spécifiques selon le type d'entité
      if (entityType === 'lieux') {
        entityData = {
          ...entityData,
          adresse: '',
          codePostal: '',
          ville: '',
          capacite: '',
          ...additionalData
        };
      } else if (entityType === 'programmateurs') {
        entityData = {
          ...entityData,
          email: '',
          telephone: '',
          structure: '',
          concertsAssocies: [],
          ...additionalData
        };
      } else if (entityType === 'artistes') {
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
    dropdownRef
  };
};

export default useEntitySearch;