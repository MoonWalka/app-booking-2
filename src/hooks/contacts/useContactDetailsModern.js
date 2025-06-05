// src/hooks/contacts/useContactDetailsModern.js
import { useCallback, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGenericEntityDetails } from '@/hooks/common';
import { showSuccessToast, showErrorToast } from '@/utils/toasts';

/**
 * Hook optimisé pour la gestion des détails d'un contact
 * Version moderne utilisant le pattern standardisé de useConcertDetails
 * 
 * @param {string} id - ID du contact à afficher
 * @returns {Object} API pour gérer les détails d'un contact
 */
const useContactDetailsModern = (id) => {
  const navigate = useNavigate();
  
  // Configuration stabilisée avec useRef pour éviter les re-renders
  const customQueriesRef = useRef({
    structure: async (contactData) => {
      console.log('[DEBUG useContactDetailsModern] customQuery structure appelée avec:', contactData);
      
      if (!contactData) return null;
      
      try {
        const { doc, getDoc, db } = await import('@/services/firebase-service');
        
        // Méthode: structureId direct dans le contact
        if (contactData.structureId) {
          console.log('[useContactDetailsModern] Tentative chargement structure via structureId:', contactData.structureId);
          const structureDoc = await getDoc(doc(db, 'structures', contactData.structureId));
          if (structureDoc.exists()) {
            const structure = { id: structureDoc.id, ...structureDoc.data() };
            console.log('[useContactDetailsModern] ✅ Structure trouvée via structureId:', structure);
            return structure;
          }
        }
        
        console.log('[useContactDetailsModern] ❌ Aucune structure trouvée pour ce contact');
        return null;
      } catch (error) {
        console.error('[useContactDetailsModern] Erreur lors du chargement de la structure:', error);
        return null;
      }
    },

    concerts: async (contactData) => {
      console.log('[DEBUG useContactDetailsModern] customQuery concerts appelée avec:', contactData);
      
      if (!contactData) return [];
      
      try {
        const { collection, query, where, getDocs } = await import('@/services/firebase-service');
        const { db } = await import('@/services/firebase-service');
        
        let concerts = [];
        
        // Méthode 1: IDs directs dans le contact (si ils existent)
        if (contactData.concertsIds?.length > 0 || contactData.concertsAssocies?.length > 0) {
          const concertIds = contactData.concertsIds || contactData.concertsAssocies || [];
          console.log('[useContactDetailsModern] Chargement concerts par IDs directs:', concertIds);
          
          const concertPromises = concertIds.map(async (concertId) => {
            try {
              const idString = typeof concertId === 'object' ? concertId.id : concertId;
              if (!idString || typeof idString !== 'string') {
                console.error(`ID concert invalide:`, concertId);
                return null;
              }
              
              const { doc, getDoc } = await import('@/services/firebase-service');
              const concertDoc = await getDoc(doc(db, 'concerts', idString));
              
              if (concertDoc.exists()) {
                return { id: concertDoc.id, ...concertDoc.data() };
              }
              return null;
            } catch (error) {
              console.error(`Erreur chargement concert ${concertId}:`, error);
              return null;
            }
          });
          
          const results = await Promise.all(concertPromises);
          concerts = results.filter(Boolean);
        }
        
        // Méthode 2: Recherche par référence inverse (concerts avec contactId)
        const concertsQuery = query(
          collection(db, 'concerts'),
          where('contactId', '==', contactData.id)
        );
        
        const querySnapshot = await getDocs(concertsQuery);
        
        querySnapshot.forEach((docSnapshot) => {
          const concertData = { id: docSnapshot.id, ...docSnapshot.data() };
          
          // Éviter les doublons si déjà trouvé par ID direct
          const existingConcert = concerts.find(c => c.id === concertData.id);
          if (!existingConcert) {
            concerts.push(concertData);
          }
        });
        
        console.log('[useContactDetailsModern] ✅ Concerts trouvés:', concerts.length);
        return concerts;
        
      } catch (error) {
        console.error('[useContactDetailsModern] Erreur lors du chargement des concerts:', error);
        return [];
      }
    },

    lieux: async (contactData) => {
      console.log('[DEBUG useContactDetailsModern] customQuery lieux appelée avec:', contactData);
      
      if (!contactData) return [];
      
      try {
        const { collection, query, where, getDocs, doc, getDoc } = await import('@/services/firebase-service');
        const { db } = await import('@/services/firebase-service');
        
        let lieux = [];
        
        // Méthode 1: IDs directs dans le contact
        if (contactData.lieuxIds?.length > 0 || contactData.lieuxAssocies?.length > 0) {
          const lieuIds = contactData.lieuxIds || contactData.lieuxAssocies || [];
          console.log('[useContactDetailsModern] Chargement lieux par IDs directs:', lieuIds);
          
          const lieuPromises = lieuIds.map(async (lieuId) => {
            try {
              const idString = typeof lieuId === 'object' ? lieuId.id : lieuId;
              if (!idString || typeof idString !== 'string') {
                console.error(`ID lieu invalide:`, lieuId);
                return null;
              }
              
              const lieuRef = doc(db, 'lieux', idString);
              const lieuDoc = await getDoc(lieuRef);
              
              if (lieuDoc.exists()) {
                return { id: lieuDoc.id, ...lieuDoc.data() };
              }
              return null;
            } catch (error) {
              console.error(`Erreur chargement lieu ${lieuId}:`, error);
              return null;
            }
          });
          
          const results = await Promise.all(lieuPromises);
          lieux = results.filter(Boolean);
        }
        
        // Méthode 2: Recherche par référence inverse
        const lieuxQuery = query(
          collection(db, 'lieux'),
          where('contactId', '==', contactData.id)
        );
        
        const querySnapshot = await getDocs(lieuxQuery);
        
        querySnapshot.forEach((docSnapshot) => {
          const lieuData = { id: docSnapshot.id, ...docSnapshot.data() };
          
          // Éviter les doublons
          const existingLieu = lieux.find(l => l.id === lieuData.id);
          if (!existingLieu) {
            lieux.push(lieuData);
          }
        });
        
        // Méthode 3: NOUVELLE - Via les concerts de ce contact
        console.log('[useContactDetailsModern] 🔍 Méthode 3: Recherche lieux via concerts du contact');
        const concertsQuery = query(
          collection(db, 'concerts'),
          where('contactId', '==', contactData.id)
        );
        
        const concertsSnapshot = await getDocs(concertsQuery);
        
        concertsSnapshot.forEach((docSnapshot) => {
          const concertData = docSnapshot.data();
          if (concertData.lieuId) {
            console.log('[useContactDetailsModern] 🎵 Concert trouvé avec lieu:', concertData.lieuId);
          }
        });
        
        // Charger tous les lieux des concerts de ce contact
        const lieuxDesConcerts = [];
        concertsSnapshot.forEach((docSnapshot) => {
          const concertData = docSnapshot.data();
          if (concertData.lieuId) {
            lieuxDesConcerts.push(concertData.lieuId);
          }
        });
        
        // Supprimer les doublons et charger les lieux
        const uniqueLieuxIds = [...new Set(lieuxDesConcerts)];
        for (const lieuId of uniqueLieuxIds) {
          try {
            const lieuDoc = await getDoc(doc(db, 'lieux', lieuId));
            if (lieuDoc.exists()) {
              const lieuData = { id: lieuDoc.id, ...lieuDoc.data() };
              
              // Éviter les doublons avec les autres méthodes
              const existingLieu = lieux.find(l => l.id === lieuData.id);
              if (!existingLieu) {
                lieux.push(lieuData);
                console.log('[useContactDetailsModern] ✅ Lieu trouvé via concerts:', lieuData.nom);
              }
            }
          } catch (error) {
            console.error(`Erreur chargement lieu via concerts ${lieuId}:`, error);
          }
        }
        
        console.log('[useContactDetailsModern] ✅ Lieux trouvés:', lieux.length);
        return lieux;
        
      } catch (error) {
        console.error('[useContactDetailsModern] Erreur lors du chargement des lieux:', error);
        return [];
      }
    },

    artistes: async (contactData) => {
      console.log('[DEBUG useContactDetailsModern] customQuery artistes appelée avec:', contactData);
      
      if (!contactData) return [];
      
      try {
        const { collection, query, where, getDocs, doc, getDoc } = await import('@/services/firebase-service');
        const { db } = await import('@/services/firebase-service');
        
        let artistes = [];
        
        // Méthode 1: IDs directs dans le contact (si ils existent)
        if (contactData.artisteIds?.length > 0 || contactData.artistesAssocies?.length > 0) {
          const artisteIds = contactData.artisteIds || contactData.artistesAssocies || [];
          console.log('[useContactDetailsModern] Chargement artistes par IDs directs:', artisteIds);
          
          const artistePromises = artisteIds.map(async (artisteId) => {
            try {
              const idString = typeof artisteId === 'object' ? artisteId.id : artisteId;
              if (!idString || typeof idString !== 'string') {
                console.error(`ID artiste invalide:`, artisteId);
                return null;
              }
              
              const artisteRef = doc(db, 'artistes', idString);
              const artisteDoc = await getDoc(artisteRef);
              
              if (artisteDoc.exists()) {
                return { id: artisteDoc.id, ...artisteDoc.data() };
              }
              return null;
            } catch (error) {
              console.error(`Erreur chargement artiste ${artisteId}:`, error);
              return null;
            }
          });
          
          const results = await Promise.all(artistePromises);
          artistes = results.filter(Boolean);
        }
        
        // Méthode 2: Recherche par référence inverse
        const artistesQuery = query(
          collection(db, 'artistes'),
          where('contactId', '==', contactData.id)
        );
        
        const querySnapshot = await getDocs(artistesQuery);
        
        querySnapshot.forEach((docSnapshot) => {
          const artisteData = { id: docSnapshot.id, ...docSnapshot.data() };
          
          // Éviter les doublons
          const existingArtiste = artistes.find(a => a.id === artisteData.id);
          if (!existingArtiste) {
            artistes.push(artisteData);
          }
        });
        
        console.log('[useContactDetailsModern] ✅ Artistes trouvés:', artistes.length);
        return artistes;
        
      } catch (error) {
        console.error('[useContactDetailsModern] Erreur lors du chargement des artistes:', error);
        return [];
      }
    }
  });

  // Configuration stabilisée des entités liées avec useMemo
  const relatedEntities = useMemo(() => [
    { 
      name: 'structure', 
      collection: 'structures',
      idField: 'structureId',
      nameField: 'nom',
      type: 'custom', // Force l'utilisation de la customQuery
      essential: true // Important pour l'affichage du contact
    },
    {
      name: 'concerts',
      collection: 'concerts',
      type: 'custom', // Requête inverse pour trouver les concerts de ce contact
      essential: true // Important pour l'affichage
    },
    {
      name: 'lieux',
      collection: 'lieux',
      type: 'custom', // Charger via référence inverse
      essential: true // CORRECTION: Marquer comme essentiel pour forcer le chargement
    },
    {
      name: 'artistes',
      collection: 'artistes', 
      type: 'custom', // Charger via référence inverse
      essential: true // CORRECTION: Marquer comme essentiel pour forcer le chargement
    }
  ], []); // Pas de dépendances car la configuration est statique
  
  // Configuration de base pour le hook générique - MODE LECTURE SEULE
  const detailsHook = useGenericEntityDetails({
    // Configuration générale
    entityType: 'contact',
    collectionName: 'contacts',
    id,
    initialMode: 'view', // Toujours en mode vue
    
    // Transformation des données
    transformData: (data) => {
      if (!data) return null;
      return data;
    },
    
    // Formatage des valeurs pour l'affichage
    formatValue: (field, value) => {
      switch (field) {
        case 'createdAt':
        case 'updatedAt':
          return value ? new Date(value).toLocaleDateString() : 'Non spécifié';
        default:
          return value !== undefined && value !== null && value !== '' ? value : 'Non spécifié';
      }
    },
    
    // Validation avant sauvegarde (non utilisée en mode lecture)
    validateFormFn: (formData) => {
      const errors = {};
      if (!formData?.nom) errors.nom = 'Le nom est obligatoire';
      return { isValid: Object.keys(errors).length === 0, errors };
    },
    
    // Configuration des entités liées
    relatedEntities,
    
    // Requêtes personnalisées pour les entités liées - STABILISÉES
    customQueries: customQueriesRef.current,
    
    // Chargement automatique des entités liées
    autoLoadRelated: true,
    
    // Callbacks pour les opérations
    onSaveSuccess: (data) => {
      showSuccessToast(`Le contact ${data.nom || ''} a été mis à jour avec succès`);
    },
    onSaveError: (error) => {
      console.error(`[useContactDetailsModern] Erreur de sauvegarde:`, error);
      showErrorToast(`Erreur lors de la sauvegarde du contact: ${error.message}`);
    },
    onDeleteSuccess: () => {
      showSuccessToast(`Le contact a été supprimé avec succès`);
      navigate('/contacts');
    },
    onDeleteError: (error) => {
      console.error(`[useContactDetailsModern] Erreur de suppression:`, error);
      showErrorToast(`Erreur lors de la suppression du contact: ${error.message}`);
    },
    
    // Navigation
    navigate,
    returnPath: '/contacts',
    editPath: `/contacts/${id}/edit`,
    
    // Options avancées
    realtime: false,
    cacheEnabled: true,
    useDeleteModal: true,
  });
  
  // Fonctions de navigation
  const handleEdit = useCallback(() => {
    navigate(`/contacts/${id}/edit`);
  }, [navigate, id]);
  
  const handleCancel = useCallback(() => {
    navigate(`/contacts/${id}`);
  }, [navigate, id]);
  
  // Fonction pour gérer la suppression
  const handleDeleteClick = useCallback(() => {
    if (detailsHook?.handleDelete) {
      detailsHook.handleDelete();
    }
  }, [detailsHook]);
  
  // Retourner l'API du hook (comme useConcertDetails)
  return {
    // Données principales
    contact: detailsHook?.entity || null,
    structure: detailsHook?.relatedData?.structure || null,
    concerts: detailsHook?.relatedData?.concerts || [],
    lieux: detailsHook?.relatedData?.lieux || [],
    artistes: detailsHook?.relatedData?.artistes || [],
    loading: detailsHook?.loading || false,
    isLoading: detailsHook?.loading || false,
    isSubmitting: detailsHook?.isSubmitting || false,
    error: detailsHook?.error || null,
    
    // Données du formulaire
    formData: detailsHook?.formData || {},
    isEditMode: false, // Toujours en mode lecture
    isDirty: detailsHook?.isDirty || false,
    hasChanges: detailsHook?.isDirty || false,
    errors: detailsHook?.errors || {},
    
    // États d'opérations
    isDeleting: detailsHook?.isDeleting || false,
    showDeleteModal: detailsHook?.showDeleteModal || false,
    
    // Données liées accessibles aussi via relatedData pour compatibilité
    relatedData: detailsHook?.relatedData || {},
    loadingRelated: detailsHook?.loadingRelated || {},
    
    // Actions de base
    handleEdit,
    handleCancel,
    handleChange: detailsHook?.handleChange || (() => {}),
    handleDeleteClick,
    handleCloseDeleteModal: detailsHook?.handleCancelDelete || (() => {}),
    handleConfirmDelete: detailsHook?.handleConfirmDelete || (() => {}),
    
    // Utilitaires
    formatValue: detailsHook?.formatValue || ((field, value) => {
      switch (field) {
        case 'createdAt':
        case 'updatedAt':
          return value ? new Date(value).toLocaleDateString() : 'Non spécifié';
        default:
          return value !== undefined && value !== null && value !== '' ? value : 'Non spécifié';
      }
    }),
  };
};

export default useContactDetailsModern;