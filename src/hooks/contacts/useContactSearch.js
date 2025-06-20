/**
 * Hook optimisé pour la recherche de contacts
 * basé sur useGenericEntitySearch
 * 
 * Cette implémentation suit l'approche RECOMMANDÉE pour les nouveaux développements
 * en utilisant directement les hooks génériques.
 */
import { useCallback, useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
// import { useGenericEntitySearch } from '@/hooks/common'; // Retiré car non utilisé dans cette version simplifiée
import { collection, getDocs, db, doc, getDoc, query, where } from '@/services/firebase-service';
import { debugLog } from '@/utils/logUtils';
import { useOrganization } from '@/context/OrganizationContext';

/**
 * Fonction utilitaire pour accéder aux propriétés imbriquées d'un objet
 * @param {Object} obj - L'objet à explorer
 * @param {string} path - Le chemin de la propriété (ex: "structure.nom")
 * @returns {*} - La valeur trouvée ou une chaîne vide si non trouvée
 */
const getNestedValue = (obj, path) => {
  if (!obj) return '';
  const fieldParts = path.split('.');
  let value = obj;
  for (const part of fieldParts) {
    value = value?.[part];
    if (value === undefined) return '';
  }
  return value || '';
};

/**
 * Hook optimisé pour la recherche et la sélection de contacts
 * 
 * @param {Object} options - Options de configuration
 * @param {Function} [options.onSelect=null] - Callback appelé quand un contact est sélectionné
 * @param {string} [options.initialSearchTerm=''] - Terme de recherche initial
 * @param {number} [options.maxResults=50] - Nombre maximum de résultats à afficher
 * @returns {Object} API pour la recherche et la sélection de contacts
 */
export const useContactSearch = ({
  onSelect = null,
  initialSearchTerm = '',
  maxResults = 50,
} = {}) => {
  const navigate = useNavigate();
  const { currentOrganization } = useOrganization();
  const [selectedContact, setSelectedContact] = useState(null);
  const [error, setError] = useState(null);
  const [allContacts, setAllContacts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // États supplémentaires pour la gestion du tri et du filtrage
  const [sortField, setSortField] = useState('nom');
  const [sortDirection, setSortDirection] = useState('asc');
  const [searchFilters, setSearchFilters] = useState({});
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  
  // 🔧 FIX: Chargement initial avec structures associées
  useEffect(() => {
    const loadContacts = async () => {
      if (allContacts.length > 0) return; // Éviter les rechargements
      
      setIsLoading(true);
      try {
        debugLog('[useContactSearch] Chargement des contacts', 'info');
        
        // Vérifier qu'on a une organisation
        if (!currentOrganization?.id) {
          console.warn('⚠️ Pas d\'organisation sélectionnée pour les contacts');
          setAllContacts([]);
          setIsLoading(false);
          return;
        }
        
        const contactsQuery = query(
          collection(db, 'contacts'),
          where('organizationId', '==', currentOrganization.id)
        );
        const snapshot = await getDocs(contactsQuery);
        const contacts = await Promise.all(
          snapshot.docs.map(async (docSnap) => {
            const data = docSnap.data();
            let structureData = null;
            
            // Charger la structure si elle existe
            if (data.structureId) {
              try {
                const structureDoc = await getDoc(doc(db, 'structures', data.structureId));
                if (structureDoc.exists()) {
                  structureData = { id: structureDoc.id, ...structureDoc.data() };
                }
              } catch (err) {
                console.error(`Erreur lors du chargement de la structure ${data.structureId}:`, err);
              }
            }
            
            return {
              id: docSnap.id,
              ...data,
              structure: structureData,
              // Format d'affichage standardisé
              displayName: data.nom ? 
                `${data.prenom || ''} ${data.nom}${structureData ? ` (${structureData.nom})` : ''}` : 
                'Contact sans nom',
              fullName: `${data.prenom || ''} ${data.nom || ''}`
            };
          })
        );
        
        setAllContacts(contacts);
        debugLog(`[useContactSearch] ${contacts.length} contacts chargés`, 'info');
      } catch (error) {
        debugLog(`[useContactSearch] Erreur lors du chargement: ${error.message}`, 'error');
        setError(error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadContacts();
  }, [allContacts.length, currentOrganization]); // 🔧 FIX: Ajouter les dépendances manquantes
  
  // 🔧 FIX: Filtrage et tri mémorisés pour éviter les recalculs
  const filteredAndSortedContacts = useMemo(() => {
    let filtered = allContacts;
    
    // Filtrage par terme de recherche
    if (searchTerm && typeof searchTerm === 'string' && searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(p => 
        (p.nom && p.nom.toLowerCase().includes(term)) ||
        (p.prenom && p.prenom.toLowerCase().includes(term)) ||
        (p.email && p.email.toLowerCase().includes(term)) ||
        (p.structure && p.structure.nom && p.structure.nom.toLowerCase().includes(term))
      );
    }
    
    // Application des filtres avancés
    Object.entries(searchFilters).forEach(([key, value]) => {
      if (!value || value === 'all') return;
      
      switch (key) {
        case 'actif':
          filtered = filtered.filter(p => String(p.actif) === value);
          break;
        case 'hasEmail':
          filtered = filtered.filter(p => value === 'true' ? !!p.email : !p.email);
          break;
        case 'hasTelephone':
          filtered = filtered.filter(p => value === 'true' ? !!p.telephone : !p.telephone);
          break;
        case 'fonction':
          filtered = filtered.filter(p => p.fonction && p.fonction.toLowerCase().includes(value.toLowerCase()));
          break;
        case 'ville':
          filtered = filtered.filter(p => p.ville && p.ville.toLowerCase().includes(value.toLowerCase()));
          break;
        default:
          break;
      }
    });
    
    // Tri
    filtered.sort((a, b) => {
      const valA = getNestedValue(a, sortField) || '';
      const valB = getNestedValue(b, sortField) || '';
      
      const comparison = String(valA).toLowerCase().localeCompare(String(valB).toLowerCase());
      return sortDirection === 'asc' ? comparison : -comparison;
    });
    
    return filtered.slice(0, maxResults);
  }, [allContacts, searchTerm, searchFilters, sortField, sortDirection, maxResults]);
  
  // 🔧 FIX: Fonctions de gestion simplifiées
  const handleContactSelect = useCallback((contact) => {
    setSelectedContact(contact);
    if (onSelect && typeof onSelect === 'function') {
      onSelect(contact);
    }
  }, [onSelect]);
  
  const handleCreateContact = useCallback(() => {
    navigate('/contacts/nouveau');
  }, [navigate]);
  
  const navigateToContactDetails = useCallback((contactId) => {
    if (contactId) {
      navigate(`/contacts/${contactId}`);
    }
  }, [navigate]);
  
  const clearSelection = useCallback(() => {
    setSelectedContact(null);
  }, []);

  const handleSearch = useCallback((term = searchTerm, filters = searchFilters) => {
    setSearchTerm(term);
    setSearchFilters(filters);
  }, [searchTerm, searchFilters]);
  
  const resetSearch = useCallback(() => {
    setSearchTerm('');
    setSearchFilters({});
  }, []);
  
  return {
    // Données principales
    contacts: filteredAndSortedContacts,
    contact: selectedContact,
    loading: isLoading,
    error,
    
    // États de recherche et filtrage
    searchTerm,
    setSearchTerm,
    searchFilters,
    setSearchFilters,
    
    // États de tri
    sortField,
    setSortField,
    sortDirection, 
    setSortDirection,
    
    // Fonctions
    handleSearch,
    resetSearch,
    setContact: handleContactSelect,
    clearContact: clearSelection,
    handleCreateContact,
    navigateToContactDetails,
    
    // Fonction pour mettre à jour la liste (nécessaire pour la suppression)
    setContacts: setAllContacts,
    
    // Aliases pour compatibilité
    results: filteredAndSortedContacts,
    isSearching: isLoading,
    searchError: error,
    selectedEntity: selectedContact,
    setSelectedEntity: handleContactSelect,
    clearSelection,
    refreshSearch: () => handleSearch(),
    clearSearch: resetSearch
  };
};

export default useContactSearch;