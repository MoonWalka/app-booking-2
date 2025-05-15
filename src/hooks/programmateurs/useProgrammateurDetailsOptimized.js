// src/hooks/programmateurs/useProgrammateurDetailsOptimized.js
import { useCallback, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  db,
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  getDoc,
  query,
  collection,
  where,
  getDocs
} from '@/firebaseInit';
import { useGenericEntityDetails } from '@/hooks/common';
import { validateProgrammateurForm } from '@/utils/validation';
import { showSuccessToast, showErrorToast } from '@/utils/toasts';

/**
 * Hook optimisé pour la gestion des détails d'un programmateur
 * Implémentation conforme à l'originale pour garantir la compatibilité
 * avec les composants existants
 * 
 * @param {string} id - ID du programmateur
 * @returns {Object} États et méthodes pour gérer un programmateur
 */
const useProgrammateurDetailsOptimized = (id) => {
  console.log('[TRACE-UNIQUE][useProgrammateurDetailsOptimized] Entrée hook avec id:', id);
  const navigate = useNavigate();
  
  // État pour les lieux associés avec chargement personnalisé
  const [lieux, setLieux] = useState([]);
  const [loadingLieux, setLoadingLieux] = useState(false);
  const [errorLieux, setErrorLieux] = useState(null);
  
  // États pour les concerts associés avec chargement personnalisé
  const [concerts, setConcerts] = useState([]);
  const [loadingConcerts, setLoadingConcerts] = useState(false);
  const [errorConcerts, setErrorConcerts] = useState(null);

  // Fonction pour formater les champs date - IDENTIQUE À L'ORIGINALE
  const formatFields = {
    createdAt: (value) => value ? format(new Date(value), 'PPP à HH:mm', { locale: fr }) : '-',
    updatedAt: (value) => value ? format(new Date(value), 'PPP à HH:mm', { locale: fr }) : '-',
    derniereActivite: (value) => value ? format(new Date(value), 'PPP', { locale: fr }) : '-',
  };

  // Fonction pour transformer les données - IDENTIQUE À L'ORIGINALE
  const transformData = useCallback((data) => {
    if (!data) return null;
    
    return {
      ...data,
      // Ajouter des champs calculés comme dans l'original
      displayName: data.prenom && data.nom ? `${data.prenom} ${data.nom}` : (data.nom || 'Sans nom'),
      nombreContacts: data.contacts ? data.contacts.length : 0,
      nombreStructures: data.structureIds ? data.structureIds.length : 0,
      // S'assurer que ces tableaux sont toujours disponibles
      contacts: data.contacts || [],
      structureIds: data.structureIds || [],
      concertsAssocies: data.concertsAssocies || [],
      lieux: data.lieux || []
    };
  }, []);

  // Requête personnalisée pour charger les structures - IDENTIQUE À L'ORIGINALE
  const customQueries = {
    structures: async (programmateurData) => {
      try {
        if (!programmateurData.structureIds || programmateurData.structureIds.length === 0) {
          return [];
        }
        const structuresPromises = programmateurData.structureIds.map(async (structureId) => {
          try {
            const structureDoc = await getDoc(doc(db, 'structures', structureId));
            return structureDoc.exists() ? { id: structureDoc.id, ...structureDoc.data() } : null;
          } catch (err) {
            console.error('Erreur getDoc structure:', err);
            return null;
          }
        });
        const structures = await Promise.all(structuresPromises);
        return structures.filter(s => s !== null);
      } catch (error) {
        console.error('Erreur customQueries.structures:', error);
        return [];
      }
    }
  };

  // Fonction de vérification de la permission de suppression - IDENTIQUE À L'ORIGINALE
  const checkDeletePermission = useCallback(async (programmateurId) => {
    // Vérifier si le programmateur est utilisé dans des lieux
    const lieuxQuery = query(
      collection(db, 'lieux'),
      where('programmateurId', '==', programmateurId)
    );
    
    const lieuxSnapshot = await getDocs(lieuxQuery);
    if (!lieuxSnapshot.empty) {
      return false;
    }
    
    // Vérifier si le programmateur est utilisé dans des concerts
    const concertsQuery = query(
      collection(db, 'concerts'),
      where('programmateurId', '==', programmateurId)
    );
    
    const concertsSnapshot = await getDocs(concertsQuery);
    return concertsSnapshot.empty;
  }, []);

  // Handler avant soumission - IDENTIQUE À L'ORIGINALE
  const onBeforeSubmit = useCallback(async (formData, originalData) => {
    // Vérifier si la structure a changé
    if (formData.structureId !== originalData.structureId) {
      // Supprimer de l'ancienne structure
      if (originalData.structureId) {
        try {
          const oldStructureRef = doc(db, 'structures', originalData.structureId);
          await updateDoc(oldStructureRef, {
            programmateurIds: arrayRemove(id)
          });
        } catch (err) {
          console.error("Erreur lors de la mise à jour de l'ancienne structure:", err);
        }
      }
      
      // Ajouter à la nouvelle structure
      if (formData.structureId) {
        try {
          const newStructureRef = doc(db, 'structures', formData.structureId);
          await updateDoc(newStructureRef, {
            programmateurIds: arrayUnion(id)
          });
        } catch (err) {
          console.error("Erreur lors de la mise à jour de la nouvelle structure:", err);
        }
      }
    }
    
    return formData;
  }, [id]);

  // Callbacks pour les opérations réussies ou en erreur - IDENTIQUE À L'ORIGINALE
  const onSaveSuccess = useCallback((data) => {
    showSuccessToast(`Le programmateur ${data.prenom || ''} ${data.nom || ''} a été mis à jour avec succès`);
  }, []);

  const onSaveError = useCallback((error) => {
    showErrorToast(`Erreur lors de la sauvegarde du programmateur: ${error.message}`);
  }, []);

  const onDeleteSuccess = useCallback(() => {
    showSuccessToast(`Le programmateur a été supprimé avec succès`);
    navigate('/programmateurs');
  }, [navigate]);

  const onDeleteError = useCallback((error) => {
    showErrorToast(`Erreur lors de la suppression du programmateur: ${error.message}`);
  }, []);

  // Configuration du hook générique - IDENTIQUE À L'ORIGINALE
  const genericDetails = useGenericEntityDetails({
    // Configuration de base
    entityType: 'programmateur',
    collectionName: 'programmateurs',
    id,
    
    // Configuration des entités liées
    relatedEntities: [
      { 
        name: 'structure', 
        idField: 'structureId', 
        collection: 'structures',
        essential: true // La structure principale est essentielle
      },
      {
        name: 'structures',
        idField: 'structureIds',
        collection: 'structures',
        type: 'one-to-many',
        essential: false // Les structures secondaires peuvent être chargées à la demande
      }
      // Lieux et concerts sont gérés manuellement
    ],
    customQueries,
    
    // Transformateurs et validations
    transformData,
    validateFormFn: validateProgrammateurForm,
    formatValue: (field, value) => formatFields[field] ? formatFields[field](value) : value,
    checkDeletePermission,
    
    // Callbacks
    onBeforeSubmit,
    onSaveSuccess,
    onSaveError,
    onDeleteSuccess,
    onDeleteError,
    
    // Navigation
    navigate,
    returnPath: '/programmateurs',
    editPath: '/programmateurs/:id/edit',
    
    // Options
    disableCache: false
  });

  console.log('[TRACE-UNIQUE][useProgrammateurDetailsOptimized] genericDetails:', {
    loading: genericDetails.loading,
    entity: genericDetails.entity,
    error: genericDetails.error,
    relatedData: genericDetails.relatedData
  });

  // === Fonctions spécifiques aux programmateurs - IDENTIQUE À L'ORIGINALE ===
  
  // Gérer le changement de structure principale
  const handleStructureChange = useCallback(async (newStructure) => {
    if (!genericDetails.formData) return;
    
    try {
      if (newStructure) {
        genericDetails.updateFormData({
          ...genericDetails.formData,
          structureId: newStructure.id,
          structure: {
            id: newStructure.id,
            nom: newStructure.nom
          }
        });
      } else {
        genericDetails.updateFormData({
          ...genericDetails.formData,
          structureId: null,
          structure: null
        });
      }
    } catch (error) {
      console.error("Erreur lors du changement de structure:", error);
      showErrorToast(`Erreur lors du changement de structure: ${error.message}`);
    }
  }, [genericDetails]);

  // Ajouter une structure secondaire - EXACTEMENT COMME L'ORIGINALE
  const addStructureSecondaire = useCallback(async (structure) => {
    if (!structure || !structure.id) return;
    
    try {
      // Vérifier si la structure est déjà associée
      const currentStructureIds = genericDetails.formData.structureIds || [];
      if (currentStructureIds.includes(structure.id)) {
        showErrorToast("Cette structure est déjà associée au programmateur");
        return;
      }
      
      // Mettre à jour le programmateur
      const newStructureIds = [...currentStructureIds, structure.id];
      
      genericDetails.updateFormData({
        ...genericDetails.formData,
        structureIds: newStructureIds
      });
      
      // Mettre à jour la structure également (relation bidirectionnelle)
      const structureRef = doc(db, 'structures', structure.id);
      await updateDoc(structureRef, {
        programmateurIds: arrayUnion(id)
      });
      
      // Rafraîchir la liste des structures liées
      genericDetails.refresh();
    } catch (error) {
      console.error("Erreur lors de l'ajout d'une structure secondaire:", error);
      showErrorToast(`Erreur lors de l'ajout d'une structure: ${error.message}`);
    }
  }, [genericDetails, id]);

  // Retirer une structure secondaire - EXACTEMENT COMME L'ORIGINALE
  const removeStructureSecondaire = useCallback(async (structureId) => {
    if (!structureId) return;
    
    try {
      // Mettre à jour le programmateur
      const currentStructureIds = genericDetails.formData.structureIds || [];
      const newStructureIds = currentStructureIds.filter(id => id !== structureId);
      
      genericDetails.updateFormData({
        ...genericDetails.formData,
        structureIds: newStructureIds
      });
      
      // Mettre à jour la structure également (relation bidirectionnelle)
      const structureRef = doc(db, 'structures', structureId);
      await updateDoc(structureRef, {
        programmateurIds: arrayRemove(id)
      });
      
      // Rafraîchir la liste des structures liées
      genericDetails.refresh();
    } catch (error) {
      console.error("Erreur lors du retrait d'une structure secondaire:", error);
      showErrorToast(`Erreur lors du retrait d'une structure: ${error.message}`);
    }
  }, [genericDetails, id]);

  // Ajouter un contact - EXACTEMENT COMME L'ORIGINALE
  const addContact = useCallback((contact) => {
    const currentContacts = genericDetails.formData.contacts || [];
    const newContact = { 
      ...contact, 
      id: Date.now().toString() 
    };
    
    genericDetails.updateFormData({
      ...genericDetails.formData,
      contacts: [...currentContacts, newContact]
    });
  }, [genericDetails]);

  // Modifier un contact - EXACTEMENT COMME L'ORIGINALE
  const updateContact = useCallback((contactId, updatedContact) => {
    const currentContacts = genericDetails.formData.contacts || [];
    const updatedContacts = currentContacts.map(contact => 
      contact.id === contactId ? { ...contact, ...updatedContact } : contact
    );
    
    genericDetails.updateFormData({
      ...genericDetails.formData,
      contacts: updatedContacts
    });
  }, [genericDetails]);

  // Supprimer un contact - EXACTEMENT COMME L'ORIGINALE
  const removeContact = useCallback((contactId) => {
    const currentContacts = genericDetails.formData.contacts || [];
    const updatedContacts = currentContacts.filter(contact => contact.id !== contactId);
    
    genericDetails.updateFormData({
      ...genericDetails.formData,
      contacts: updatedContacts
    });
  }, [genericDetails]);

  // Chargement personnalisé des lieux associés
  useEffect(() => {
    const fetchLieuxAssocies = async () => {
      if (!id || !genericDetails.entity) return;
      
      try {
        setLoadingLieux(true);
        console.log(`[DIAGNOSTIC] useProgrammateurDetailsOptimized - Chargement des lieux pour programmateur ${id}`);
        
        // Vérifier d'abord si le programmateur a des lieuxIds ou lieuxAssocies dans ses données
        if (genericDetails.entity.lieuxIds?.length > 0 || genericDetails.entity.lieuxAssocies?.length > 0) {
          const lieuxRefs = genericDetails.entity.lieuxIds || genericDetails.entity.lieuxAssocies || [];
          console.log(`[DIAGNOSTIC] useProgrammateurDetailsOptimized - ${lieuxRefs.length} références de lieux trouvées dans le programmateur`);
          
          const lieuxPromises = lieuxRefs.map(lieuRef => {
            const lieuId = typeof lieuRef === 'object' ? lieuRef.id : lieuRef;
            return getDoc(doc(db, 'lieux', lieuId)).then(snapshot => {
              if (snapshot.exists()) {
                return { id: snapshot.id, ...snapshot.data() };
              }
              return null;
            });
          });
          
          const lieuxResults = await Promise.all(lieuxPromises);
          const validLieux = lieuxResults.filter(lieu => lieu !== null);
          console.log(`[DIAGNOSTIC] useProgrammateurDetailsOptimized - ${validLieux.length} lieux chargés depuis les références`);
          
          setLieux(validLieux);
        } else {
          // Si pas de référence directe, chercher par référence inverse
          console.log(`[DIAGNOSTIC] useProgrammateurDetailsOptimized - Pas de références directes, recherche par référence inverse`);
          
          // Méthode 1: Chercher les lieux avec ce programmateur dans 'programmateurs'
          let lieuxQuery = query(
            collection(db, 'lieux'),
            where('programmateurs', 'array-contains', id)
          );
          let querySnapshot = await getDocs(lieuxQuery);
          let lieuxLoaded = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          
          // Méthode 2: Si rien trouvé, chercher par programmateurId
          if (lieuxLoaded.length === 0) {
            console.log(`[DIAGNOSTIC] useProgrammateurDetailsOptimized - Pas de résultat avec 'programmateurs', essai avec 'programmateurId'`);
            lieuxQuery = query(
              collection(db, 'lieux'),
              where('programmateurId', '==', id)
            );
            querySnapshot = await getDocs(lieuxQuery);
            lieuxLoaded = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          }
          
          console.log(`[DIAGNOSTIC] useProgrammateurDetailsOptimized - ${lieuxLoaded.length} lieux trouvés par référence inverse`, { 
            lieuxIds: lieuxLoaded.map(lieu => lieu.id) 
          });
          
          setLieux(lieuxLoaded);
        }
        
      } catch (error) {
        console.error('[ERROR] useProgrammateurDetailsOptimized - Erreur lors du chargement des lieux:', error);
        setErrorLieux(error.message);
      } finally {
        setLoadingLieux(false);
      }
    };
    
    fetchLieuxAssocies();
  }, [id, genericDetails.entity]);
  
  // Chargement personnalisé des concerts associés
  useEffect(() => {
    const fetchConcertsAssocies = async () => {
      if (!id || !genericDetails.entity) return;
      
      try {
        setLoadingConcerts(true);
        console.log(`[DIAGNOSTIC] useProgrammateurDetailsOptimized - Chargement des concerts pour programmateur ${id}`);
        
        // Méthode 1: Vérifier si le programmateur a des concertsIds ou concertsAssocies dans ses données
        if (genericDetails.entity.concertsIds?.length > 0 || genericDetails.entity.concertsAssocies?.length > 0) {
          const concertRefs = genericDetails.entity.concertsIds || genericDetails.entity.concertsAssocies || [];
          console.log(`[DIAGNOSTIC] useProgrammateurDetailsOptimized - ${concertRefs.length} références de concerts trouvées dans le programmateur`);
          
          const concertPromises = concertRefs.map(concertRef => {
            // Si c'est déjà un objet avec ID et des infos basiques, on peut l'utiliser directement
            if (typeof concertRef === 'object' && concertRef.id && concertRef.titre) {
              return Promise.resolve(concertRef);
            }
            
            // Sinon on charge les détails complets
            const concertId = typeof concertRef === 'object' ? concertRef.id : concertRef;
            return getDoc(doc(db, 'concerts', concertId)).then(snapshot => {
              if (snapshot.exists()) {
                return { id: snapshot.id, ...snapshot.data() };
              }
              return null;
            });
          });
          
          const concertResults = await Promise.all(concertPromises);
          const validConcerts = concertResults.filter(concert => concert !== null);
          console.log(`[DIAGNOSTIC] useProgrammateurDetailsOptimized - ${validConcerts.length} concerts chargés depuis les références`);
          
          setConcerts(validConcerts);
        } else {
          // Méthode 2: Chercher par référence inverse dans la collection concerts
          console.log(`[DIAGNOSTIC] useProgrammateurDetailsOptimized - Pas de références directes, recherche par référence inverse`);
          
          // Chercher les concerts avec ce programmateur comme programmateurId
          let concertsQuery = query(
            collection(db, 'concerts'),
            where('programmateurId', '==', id)
          );
          let querySnapshot = await getDocs(concertsQuery);
          let concertsLoaded = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          
          // Si aucun résultat, essayer avec le champ programmateurs (array-contains)
          if (concertsLoaded.length === 0) {
            console.log(`[DIAGNOSTIC] useProgrammateurDetailsOptimized - Pas de résultat avec 'programmateurId', essai avec 'programmateurs'`);
            concertsQuery = query(
              collection(db, 'concerts'),
              where('programmateurs', 'array-contains', id)
            );
            querySnapshot = await getDocs(concertsQuery);
            concertsLoaded = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          }
          
          console.log(`[DIAGNOSTIC] useProgrammateurDetailsOptimized - ${concertsLoaded.length} concerts trouvés par référence inverse`, { 
            concertIds: concertsLoaded.map(concert => concert.id) 
          });
          
          setConcerts(concertsLoaded);
        }
        
      } catch (error) {
        console.error('[ERROR] useProgrammateurDetailsOptimized - Erreur lors du chargement des concerts:', error);
        setErrorConcerts(error.message);
      } finally {
        setLoadingConcerts(false);
      }
    };
    
    fetchConcertsAssocies();
  }, [id, genericDetails.entity]);

  // Retourner exactement la même structure que l'originale
  return {
    // Toutes les fonctionnalités du hook générique
    ...genericDetails,
    // Alias pour compatibilité avec les vues existantes
    programmateur: genericDetails.entity,
    // Fonctionnalités spécifiques aux programmateurs
    handleStructureChange,
    addStructureSecondaire,
    removeStructureSecondaire,
    addContact,
    updateContact,
    removeContact,
    // Ajouter les données des lieux et concerts chargés manuellement
    lieux,
    loadingLieux,
    errorLieux,
    concerts,
    loadingConcerts,
    errorConcerts,
    // Pour compatibilité avec le composant existant
    concertsAssocies: concerts
  };
};

export default useProgrammateurDetailsOptimized;