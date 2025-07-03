/**
 * Hook de recherche de contacts pour le modèle relationnel
 * Remplace useContactSearch avec support des nouvelles collections
 */
import { useCallback, useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrganization } from '@/context/OrganizationContext';
import { useContactsRelational } from './useContactsRelational';

/**
 * Fonction utilitaire pour accéder aux propriétés imbriquées d'un objet
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
 * Hook pour la recherche et sélection de contacts dans le modèle relationnel
 */
export const useContactSearchRelational = ({
  onSelect = null,
  initialSearchTerm = '',
  maxResults = 50,
  includeStructures = true,
  includePersonnes = true,
  includePersonnesLibres = true
} = {}) => {
  const navigate = useNavigate();
  const { currentOrganization } = useOrganization();
  const { 
    structures, 
    personnes, 
    liaisons, 
    loading: relationalLoading
  } = useContactsRelational();
  
  const [selectedContact, setSelectedContact] = useState(null);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [sortField, setSortField] = useState('nom');
  const [sortDirection, setSortDirection] = useState('asc');
  const [searchFilters, setSearchFilters] = useState({});

  // Transformer les données du modèle relationnel en format compatible
  const allContacts = useMemo(() => {
    if (!currentOrganization?.id) return [];
    
    const contacts = [];

    // Ajouter les structures
    if (includeStructures) {
      structures.forEach(structure => {
        contacts.push({
          id: structure.id,
          entityType: 'structure',
          type: 'structure',
          nom: structure.raisonSociale || 'Structure sans nom',
          prenom: '',
          email: structure.email || '',
          telephone: structure.telephone1 || '',
          ville: structure.ville || '',
          tags: structure.tags || [],
          isClient: structure.isClient || false,
          displayName: structure.raisonSociale || 'Structure sans nom',
          fullName: structure.raisonSociale || 'Structure sans nom',
          searchableText: [
            structure.raisonSociale,
            structure.email,
            structure.telephone1,
            structure.ville,
            ...(structure.tags || [])
          ].filter(Boolean).join(' ').toLowerCase(),
          structure: {
            raisonSociale: structure.raisonSociale,
            type: structure.type,
            email: structure.email,
            ville: structure.ville,
            isClient: structure.isClient
          },
          createdAt: structure.createdAt,
          updatedAt: structure.updatedAt
        });
      });
    }

    // Ajouter les personnes sans liaison (anciennement "libres")
    if (includePersonnesLibres) {
      // Trouver les personnes qui n'ont pas de liaison active
      const personnesAvecLiaison = new Set(
        liaisons
          .filter(l => l.actif !== false)
          .map(l => l.personneId)
      );
      
      personnes
        .filter(personne => !personnesAvecLiaison.has(personne.id))
        .forEach(personne => {
          contacts.push({
            id: personne.id,
            entityType: 'personne_libre',
            type: 'personne_libre',
            nom: personne.nom || '',
            prenom: personne.prenom || '',
            email: personne.email || '',
            telephone: personne.telephone || '',
            ville: personne.ville || '',
            tags: personne.tags?.includes('indépendant') 
              ? personne.tags 
              : [...(personne.tags || []), 'indépendant'],
            displayName: personne.nom ? 
              `${personne.prenom || ''} ${personne.nom}`.trim() : 
              'Personne sans nom',
            fullName: `${personne.prenom || ''} ${personne.nom || ''}`.trim(),
            searchableText: [
              personne.prenom,
              personne.nom,
              personne.email,
              personne.telephone,
              personne.ville,
              ...(personne.tags || [])
            ].filter(Boolean).join(' ').toLowerCase(),
            personne: {
              prenom: personne.prenom,
              nom: personne.nom,
              email: personne.email,
              telephone: personne.telephone,
              ville: personne.ville
            },
            createdAt: personne.createdAt,
            updatedAt: personne.updatedAt
          });
        });
    }

    // Ajouter les personnes avec liaison (si demandé)
    if (includePersonnes) {
      // On a déjà la liste des personnes avec liaison
      const personnesAvecLiaisonSet = new Set(
        liaisons
          .filter(l => l.actif !== false)
          .map(l => l.personneId)
      );
      
      personnes
        .filter(personne => personnesAvecLiaisonSet.has(personne.id))
        .forEach(personne => {
          // Trouver les structures associées
          const personneStructures = liaisons
            .filter(liaison => liaison.personneId === personne.id && liaison.actif)
            .map(liaison => {
              const structure = structures.find(s => s.id === liaison.structureId);
              return structure ? {
                id: structure.id,
                raisonSociale: structure.raisonSociale,
                fonction: liaison.fonction
              } : null;
            })
            .filter(Boolean);

          contacts.push({
            id: personne.id,
            entityType: 'personne',
            type: 'personne',
            nom: personne.nom || '',
            prenom: personne.prenom || '',
            email: personne.email || '',
            telephone: personne.telephone || '',
            ville: personne.ville || '',
            tags: personne.tags || [],
            displayName: personne.nom ? 
              `${personne.prenom || ''} ${personne.nom}`.trim() : 
              'Personne sans nom',
            fullName: `${personne.prenom || ''} ${personne.nom || ''}`.trim(),
            searchableText: [
              personne.prenom,
              personne.nom,
              personne.email,
              personne.telephone,
              personne.ville,
              ...personneStructures.map(s => s.raisonSociale),
              ...personneStructures.map(s => s.fonction),
              ...(personne.tags || [])
            ].filter(Boolean).join(' ').toLowerCase(),
            personne: {
              prenom: personne.prenom,
              nom: personne.nom,
              email: personne.email,
              telephone: personne.telephone,
              ville: personne.ville
            },
            structures: personneStructures,
            createdAt: personne.createdAt,
            updatedAt: personne.updatedAt
          });
        });
    }

    return contacts;
  }, [structures, personnes, liaisons, currentOrganization, includeStructures, includePersonnes, includePersonnesLibres]);

  // Filtrer et rechercher
  const filteredContacts = useMemo(() => {
    let filtered = [...allContacts];

    // Appliquer la recherche textuelle
    if (searchTerm && searchTerm.length >= 2) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(contact => 
        contact.searchableText.includes(lowerSearchTerm) ||
        contact.displayName.toLowerCase().includes(lowerSearchTerm) ||
        contact.fullName.toLowerCase().includes(lowerSearchTerm)
      );
    }

    // Appliquer les filtres spécifiques
    Object.keys(searchFilters).forEach(filterKey => {
      const filterValue = searchFilters[filterKey];
      if (filterValue !== undefined && filterValue !== null && filterValue !== '') {
        filtered = filtered.filter(contact => {
          const contactValue = getNestedValue(contact, filterKey);
          if (Array.isArray(contactValue)) {
            return contactValue.includes(filterValue);
          }
          return String(contactValue).toLowerCase().includes(String(filterValue).toLowerCase());
        });
      }
    });

    // Trier les résultats
    filtered.sort((a, b) => {
      const aValue = getNestedValue(a, sortField) || '';
      const bValue = getNestedValue(b, sortField) || '';
      
      const comparison = String(aValue).localeCompare(String(bValue), 'fr', { 
        numeric: true, 
        sensitivity: 'base' 
      });
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    // Limiter les résultats
    return filtered.slice(0, maxResults);
  }, [allContacts, searchTerm, searchFilters, sortField, sortDirection, maxResults]);

  // Actions
  const handleSelect = useCallback((contact) => {
    setSelectedContact(contact);
    if (onSelect) {
      onSelect(contact);
    }
  }, [onSelect]);

  const handleNavigate = useCallback((contact) => {
    if (contact?.id) {
      const path = contact.entityType === 'structure' ? 
        `/contacts/structure/${contact.id}` : 
        `/contacts/personne/${contact.id}`;
      navigate(path);
    }
  }, [navigate]);

  const clearSelection = useCallback(() => {
    setSelectedContact(null);
  }, []);

  const updateFilters = useCallback((newFilters) => {
    setSearchFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const clearFilters = useCallback(() => {
    setSearchFilters({});
    setSearchTerm('');
  }, []);

  const updateSort = useCallback((field, direction = 'asc') => {
    setSortField(field);
    setSortDirection(direction);
  }, []);

  // Reset search when organization changes
  useEffect(() => {
    setSearchTerm('');
    setSearchFilters({});
    setSelectedContact(null);
    setError(null);
  }, [currentOrganization?.id]);

  // API publique
  return {
    // Données
    contacts: filteredContacts,
    allContacts,
    selectedContact,
    searchTerm,
    isLoading: relationalLoading,
    error,
    
    // Statistiques
    totalContacts: allContacts.length,
    filteredCount: filteredContacts.length,
    hasResults: filteredContacts.length > 0,
    
    // État de tri et filtrage
    sortField,
    sortDirection,
    searchFilters,
    
    // Actions de recherche
    setSearchTerm,
    updateFilters,
    clearFilters,
    updateSort,
    
    // Actions de sélection
    handleSelect,
    handleNavigate,
    clearSelection,
    
    // Méthodes utilitaires
    getContactById: useCallback((id) => 
      allContacts.find(contact => contact.id === id), [allContacts]),
    
    getContactsByType: useCallback((type) => 
      allContacts.filter(contact => contact.entityType === type), [allContacts]),
    
    searchByTag: useCallback((tag) => 
      allContacts.filter(contact => contact.tags?.includes(tag)), [allContacts])
  };
};

// Alias pour compatibilité
export const useContactSearch = useContactSearchRelational;