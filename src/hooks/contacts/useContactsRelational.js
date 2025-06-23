import { useState, useEffect, useCallback, useMemo } from 'react';
import { onSnapshot, collection, query, where } from 'firebase/firestore';
import { db } from '@/services/firebase-service';
import { useAuth } from '@/context/AuthContext';
import { useOrganization } from '@/context/OrganizationContext';
import structuresService from '@/services/contacts/structuresService';
import personnesService from '@/services/contacts/personnesService';
import liaisonsService from '@/services/contacts/liaisonsService';
import debug from '@/utils/debugTagsComments';

/**
 * Hook unifié pour gérer les contacts avec le nouveau modèle relationnel
 * Fournit une interface simple pour travailler avec structures, personnes et liaisons
 */
export function useContactsRelational() {
  const { currentUser } = useAuth();
  const { currentOrganization } = useOrganization();
  
  // États pour les données
  const [structures, setStructures] = useState([]);
  const [personnes, setPersonnes] = useState([]);
  const [liaisons, setLiaisons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // États pour les filtres
  const [filters, setFilters] = useState({
    showInactive: false,
    showClients: null,
    tags: [],
    searchTerm: ''
  });

  // Abonnements temps réel
  useEffect(() => {
    if (!currentOrganization?.id) {
      setLoading(false);
      return;
    }

    const unsubscribers = [];

    try {
      // Abonnement aux structures
      const structuresQuery = query(
        collection(db, 'structures'),
        where('organizationId', '==', currentOrganization.id)
      );
      
      const unsubStructures = onSnapshot(structuresQuery, (snapshot) => {
        const structuresData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // DEBUG: Tracer les mises à jour Firebase pour les structures
        snapshot.docChanges().forEach(change => {
          if (change.type === 'modified') {
            const data = change.doc.data();
            debug.tags.firebaseListener(change.doc.id, data);
            debug.comments.firebaseListener(change.doc.id, data);
          }
        });
        
        setStructures(structuresData);
      });
      unsubscribers.push(unsubStructures);

      // Abonnement aux personnes
      const personnesQuery = query(
        collection(db, 'personnes'),
        where('organizationId', '==', currentOrganization.id)
      );
      
      const unsubPersonnes = onSnapshot(personnesQuery, (snapshot) => {
        const personnesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // DEBUG: Tracer les mises à jour Firebase pour les personnes
        snapshot.docChanges().forEach(change => {
          if (change.type === 'modified') {
            const data = change.doc.data();
            debug.tags.firebaseListener(change.doc.id, data);
            debug.comments.firebaseListener(change.doc.id, data);
          }
        });
        
        setPersonnes(personnesData);
      });
      unsubscribers.push(unsubPersonnes);

      // Abonnement aux liaisons
      const liaisonsQuery = query(
        collection(db, 'liaisons'),
        where('organizationId', '==', currentOrganization.id)
      );
      
      const unsubLiaisons = onSnapshot(liaisonsQuery, (snapshot) => {
        const liaisonsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setLiaisons(liaisonsData);
      });
      unsubscribers.push(unsubLiaisons);

      setLoading(false);
    } catch (err) {
      console.error('Erreur lors du chargement des contacts:', err);
      setError(err.message);
      setLoading(false);
    }

    // Cleanup
    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }, [currentOrganization?.id]);

  // ==================== MÉTHODES STRUCTURES ====================

  const createStructure = useCallback(async (data) => {
    if (!currentOrganization?.id || !currentUser?.uid) return;
    
    try {
      const result = await structuresService.createStructure(
        data,
        currentOrganization.id,
        currentUser.uid
      );
      return result;
    } catch (error) {
      console.error('Erreur création structure:', error);
      throw error;
    }
  }, [currentOrganization?.id, currentUser?.uid]);

  const updateStructure = useCallback(async (structureId, updates) => {
    if (!currentUser?.uid) return;
    
    try {
      const result = await structuresService.updateStructure(
        structureId,
        updates,
        currentUser.uid
      );
      return result;
    } catch (error) {
      console.error('Erreur mise à jour structure:', error);
      throw error;
    }
  }, [currentUser?.uid]);

  const deleteStructure = useCallback(async (structureId) => {
    try {
      const result = await structuresService.deleteStructure(structureId);
      return result;
    } catch (error) {
      console.error('Erreur suppression structure:', error);
      throw error;
    }
  }, []);

  // ==================== MÉTHODES PERSONNES ====================

  const createPersonne = useCallback(async (data) => {
    if (!currentOrganization?.id || !currentUser?.uid) return;
    
    try {
      const result = await personnesService.createPersonne(
        data,
        currentOrganization.id,
        currentUser.uid
      );
      return result;
    } catch (error) {
      console.error('Erreur création personne:', error);
      throw error;
    }
  }, [currentOrganization?.id, currentUser?.uid]);

  const updatePersonne = useCallback(async (personneId, updates) => {
    if (!currentUser?.uid) return;
    
    try {
      const result = await personnesService.updatePersonne(
        personneId,
        updates,
        currentUser.uid
      );
      return result;
    } catch (error) {
      console.error('Erreur mise à jour personne:', error);
      throw error;
    }
  }, [currentUser?.uid]);

  const deletePersonne = useCallback(async (personneId) => {
    try {
      const result = await personnesService.deletePersonne(personneId);
      return result;
    } catch (error) {
      console.error('Erreur suppression personne:', error);
      throw error;
    }
  }, []);

  // ==================== MÉTHODES LIAISONS ====================

  const associatePersonToStructure = useCallback(async (structureId, personneId, data = {}) => {
    if (!currentOrganization?.id || !currentUser?.uid) return;
    
    try {
      const liaisonData = {
        organizationId: currentOrganization.id,
        structureId,
        personneId,
        fonction: data.fonction || '',
        actif: true,
        prioritaire: data.prioritaire || false,
        interesse: data.interesse || false,
        dateDebut: data.dateDebut || new Date(),
        notes: data.notes || ''
      };
      
      const result = await liaisonsService.createLiaison(
        liaisonData,
        currentUser.uid
      );
      return result;
    } catch (error) {
      console.error('Erreur association:', error);
      throw error;
    }
  }, [currentOrganization?.id, currentUser?.uid]);

  const dissociatePersonFromStructure = useCallback(async (liaisonId) => {
    if (!currentUser?.uid) return;
    
    try {
      const result = await liaisonsService.dissociate(liaisonId, currentUser.uid);
      return result;
    } catch (error) {
      console.error('Erreur dissociation:', error);
      throw error;
    }
  }, [currentUser?.uid]);

  const updateLiaison = useCallback(async (liaisonId, updates) => {
    if (!currentUser?.uid) return;
    
    try {
      const result = await liaisonsService.updateLiaison(
        liaisonId,
        updates,
        currentUser.uid
      );
      return result;
    } catch (error) {
      console.error('Erreur mise à jour liaison:', error);
      throw error;
    }
  }, [currentUser?.uid]);

  const setPrioritaire = useCallback(async (structureId, personneId) => {
    if (!currentUser?.uid) return;
    
    try {
      const result = await liaisonsService.setPrioritaire(
        structureId,
        personneId,
        currentUser.uid
      );
      return result;
    } catch (error) {
      console.error('Erreur set prioritaire:', error);
      throw error;
    }
  }, [currentUser?.uid]);

  // ==================== MÉTHODES UTILITAIRES ====================

  /**
   * Récupérer une structure avec ses personnes associées
   */
  const getStructureWithPersonnes = useCallback((structureId) => {
    const structure = structures.find(s => s.id === structureId);
    if (!structure) return null;

    // Trouver les liaisons actives de cette structure
    const structureLiaisons = liaisons.filter(l => 
      l.structureId === structureId && 
      (filters.showInactive || l.actif)
    );

    // Récupérer les personnes correspondantes
    const structurePersonnes = structureLiaisons.map(liaison => {
      const personne = personnes.find(p => p.id === liaison.personneId);
      if (!personne) return null;

      // Combiner les données de la personne et de la liaison
      return {
        ...personne,
        liaison: {
          id: liaison.id,
          fonction: liaison.fonction,
          actif: liaison.actif,
          prioritaire: liaison.prioritaire,
          interesse: liaison.interesse,
          dateDebut: liaison.dateDebut,
          dateFin: liaison.dateFin,
          notes: liaison.notes
        }
      };
    }).filter(Boolean);

    // Trier : prioritaires en premier, puis par nom
    structurePersonnes.sort((a, b) => {
      if (a.liaison.prioritaire && !b.liaison.prioritaire) return -1;
      if (!a.liaison.prioritaire && b.liaison.prioritaire) return 1;
      return `${a.nom} ${a.prenom}`.localeCompare(`${b.nom} ${b.prenom}`);
    });

    return {
      ...structure,
      personnes: structurePersonnes
    };
  }, [structures, personnes, liaisons, filters.showInactive]);

  /**
   * Récupérer une personne avec ses structures associées
   */
  const getPersonneWithStructures = useCallback((personneId) => {
    console.log('🔍 [getPersonneWithStructures] Recherche personne ID:', personneId);
    console.log('📚 [getPersonneWithStructures] Personnes disponibles:', personnes.map(p => ({ id: p.id, nom: p.nom, prenom: p.prenom })));
    const personne = personnes.find(p => p.id === personneId);
    if (!personne) {
      console.warn('⚠️ [getPersonneWithStructures] Personne non trouvée dans le cache');
      return null;
    }

    // Trouver les liaisons de cette personne
    const personneLiaisons = liaisons.filter(l => 
      l.personneId === personneId && 
      (filters.showInactive || l.actif)
    );

    // Récupérer les structures correspondantes
    const personneStructures = personneLiaisons.map(liaison => {
      const structure = structures.find(s => s.id === liaison.structureId);
      if (!structure) return null;

      return {
        ...structure,
        liaison: {
          id: liaison.id,
          fonction: liaison.fonction,
          actif: liaison.actif,
          prioritaire: liaison.prioritaire,
          interesse: liaison.interesse,
          dateDebut: liaison.dateDebut,
          dateFin: liaison.dateFin,
          notes: liaison.notes
        }
      };
    }).filter(Boolean);

    return {
      ...personne,
      structures: personneStructures
    };
  }, [structures, personnes, liaisons, filters.showInactive]);

  /**
   * Récupérer les personnes libres (sans structure)
   */
  const getPersonnesLibres = useCallback(() => {
    // Personnes qui n'ont aucune liaison active
    const personnesAvecLiaisons = new Set(
      liaisons
        .filter(l => l.actif)
        .map(l => l.personneId)
    );

    return personnes.filter(p => !personnesAvecLiaisons.has(p.id));
  }, [personnes, liaisons]);

  /**
   * Recherche unifiée dans structures et personnes
   */
  const searchContacts = useCallback((searchTerm) => {
    const term = searchTerm.toLowerCase();

    // Recherche dans les structures
    const matchingStructures = structures.filter(s => 
      s.raisonSociale?.toLowerCase().includes(term) ||
      s.email?.toLowerCase().includes(term) ||
      s.ville?.toLowerCase().includes(term) ||
      s.tags?.some(tag => tag.toLowerCase().includes(term))
    );

    // Recherche dans les personnes
    const matchingPersonnes = personnes.filter(p => {
      const nomComplet = `${p.prenom} ${p.nom}`.toLowerCase();
      return (
        nomComplet.includes(term) ||
        p.email?.toLowerCase().includes(term) ||
        p.fonction?.toLowerCase().includes(term)
      );
    });

    return {
      structures: matchingStructures,
      personnes: matchingPersonnes
    };
  }, [structures, personnes]);

  // ==================== DONNÉES FILTRÉES ====================

  const filteredData = useMemo(() => {
    let filteredStructures = [...structures];
    let filteredPersonnesLibres = getPersonnesLibres();

    // Filtre par client
    if (filters.showClients !== null) {
      filteredStructures = filteredStructures.filter(s => 
        s.isClient === filters.showClients
      );
    }

    // Filtre par tags
    if (filters.tags.length > 0) {
      filteredStructures = filteredStructures.filter(s =>
        s.tags?.some(tag => filters.tags.includes(tag))
      );
      filteredPersonnesLibres = filteredPersonnesLibres.filter(p =>
        p.tags?.some(tag => filters.tags.includes(tag))
      );
    }

    // Filtre par recherche
    if (filters.searchTerm) {
      const searchResults = searchContacts(filters.searchTerm);
      filteredStructures = filteredStructures.filter(s =>
        searchResults.structures.some(rs => rs.id === s.id)
      );
      filteredPersonnesLibres = filteredPersonnesLibres.filter(p =>
        searchResults.personnes.some(rp => rp.id === p.id)
      );
    }

    // Enrichir avec les personnes associées
    const enrichedStructures = filteredStructures.map(s =>
      getStructureWithPersonnes(s.id)
    );

    return {
      structures: enrichedStructures,
      personnesLibres: filteredPersonnesLibres,
      total: enrichedStructures.length + filteredPersonnesLibres.length
    };
  }, [structures, filters, getPersonnesLibres, searchContacts, getStructureWithPersonnes]);

  // ==================== STATISTIQUES ====================

  const statistics = useMemo(() => {
    const activeLiaisons = liaisons.filter(l => l.actif);
    
    return {
      totalStructures: structures.length,
      totalPersonnes: personnes.length,
      totalLiaisons: liaisons.length,
      liaisonsActives: activeLiaisons.length,
      personnesLibres: getPersonnesLibres().length,
      clients: structures.filter(s => s.isClient).length,
      contactsPrioritaires: activeLiaisons.filter(l => l.prioritaire).length,
      contactsInteresses: activeLiaisons.filter(l => l.interesse).length
    };
  }, [structures, personnes, liaisons, getPersonnesLibres]);

  return {
    // Données
    structures,
    personnes,
    liaisons,
    filteredData,
    statistics,
    
    // États
    loading,
    error,
    filters,
    setFilters,
    
    // Méthodes structures
    createStructure,
    updateStructure,
    deleteStructure,
    
    // Méthodes personnes
    createPersonne,
    updatePersonne,
    deletePersonne,
    
    // Méthodes liaisons
    associatePersonToStructure,
    dissociatePersonFromStructure,
    updateLiaison,
    setPrioritaire,
    
    // Méthodes utilitaires
    getStructureWithPersonnes,
    getPersonneWithStructures,
    getPersonnesLibres,
    searchContacts
  };
}