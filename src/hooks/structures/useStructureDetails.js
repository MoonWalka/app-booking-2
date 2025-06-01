// src/hooks/structures/useStructureDetails.js
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGenericEntityDetails } from '@/hooks/common';
import { showSuccessToast, showErrorToast } from '@/utils/toasts';

/**
 * Hook optimisé pour la gestion des détails d'une structure
 * Version améliorée avec une meilleure organisation et détection d'erreurs
 * 
 * @param {string} id - ID de la structure
 * @returns {Object} États et méthodes pour gérer une structure
 */
const useStructureDetails = (id) => {
  const navigate = useNavigate();
  
  // Configuration de base pour le hook générique
  const detailsHook = useGenericEntityDetails({
    // Configuration générale
    entityType: 'structure',
    collectionName: 'structures',
    id,
    
    // Transformation des données
    transformData: (data) => {
      if (!data) return null;
      
      // S'assurer que les tableaux sont toujours initialisés
      return {
        ...data,
        programmateursAssocies: data.programmateursAssocies || [],
        lieuxAssocies: data.lieuxAssocies || [],
        artistesAssocies: data.artistesAssocies || []
      };
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
    
    // Configuration des entités liées avec requêtes personnalisées
    relatedEntities: [
      { 
        name: 'programmateurs', 
        collection: 'programmateurs', 
        idField: 'programmateursAssocies',
        alternativeIdFields: ['programmateurIds'], // Support de l'ancien et nouveau format
        type: 'one-to-many',
        essential: true // Les programmateurs sont essentiels pour l'affichage de la structure
      },
      {
        name: 'lieux',
        collection: 'lieux',
        idField: 'lieuxAssocies',
        type: 'one-to-many',
        essential: false // Les lieux peuvent être chargés à la demande
      },
      {
        name: 'concerts',
        collection: 'concerts',
        type: 'custom', // Utiliser la customQuery pour une logique plus complexe
        essential: true // Les concerts sont importants pour l'affichage
      }
    ],
    
    // Requêtes personnalisées pour gérer les relations complexes
    customQueries: {
      programmateurs: async (structureData) => {
        console.log('[DEBUG useStructureDetails] customQuery programmateurs appelée avec:', structureData);
        
        // Importer les services Firebase
        const { collection, query, where, getDocs, doc, getDoc } = await import('@/services/firebase-service');
        const { db } = await import('@/services/firebase-service');
        
        let programmateurs = [];
        
        try {
          // Méthode 1: Vérifier les IDs directs dans la structure (format actuel et ancien)
          const programmateurIds = structureData.programmateurIds || structureData.programmateursAssocies || [];
          
          if (programmateurIds.length > 0) {
            console.log('[DEBUG] Chargement programmateurs par IDs directs:', programmateurIds);
            
            // Charger chaque programmateur individuellement
            const programmateurPromises = programmateurIds.map(async (progId) => {
              try {
                const progRef = doc(db, 'programmateurs', progId);
                const progDoc = await getDoc(progRef);
                
                if (progDoc.exists()) {
                  return { id: progDoc.id, ...progDoc.data() };
                }
                return null;
              } catch (error) {
                console.error(`Erreur chargement programmateur ${progId}:`, error);
                return null;
              }
            });
            
            const results = await Promise.all(programmateurPromises);
            programmateurs = results.filter(Boolean);
            
            console.log('[DEBUG] Programmateurs trouvés par IDs directs:', programmateurs.length);
          }
          
          // Méthode 2: Si aucun programmateur trouvé par IDs directs, 
          // chercher par référence inverse (programmateurs avec structureId)
          if (programmateurs.length === 0) {
            console.log('[DEBUG] Recherche par référence inverse (structureId)');
            
            const programmateursQuery = query(
              collection(db, 'programmateurs'),
              where('structureId', '==', structureData.id)
            );
            
            const querySnapshot = await getDocs(programmateursQuery);
            
            querySnapshot.forEach((docSnapshot) => {
              programmateurs.push({
                id: docSnapshot.id,
                ...docSnapshot.data()
              });
            });
            
            console.log('[DEBUG] Programmateurs trouvés par référence inverse:', programmateurs.length);
          }
          
          console.log('[DEBUG] Total programmateurs retournés:', programmateurs.length);
          return programmateurs;
          
        } catch (error) {
          console.error('[ERROR] useStructureDetails customQuery programmateurs:', error);
          return [];
        }
      },

      concerts: async (structureData) => {
        console.log('[DEBUG useStructureDetails] customQuery concerts appelée avec:', structureData);
        
        // Importer les services Firebase
        const { collection, query, where, getDocs, doc, getDoc } = await import('@/services/firebase-service');
        const { db } = await import('@/services/firebase-service');
        
        let concerts = [];
        
        try {
          // Méthode 1: Vérifier les IDs directs dans la structure (si ils existent)
          const concertIds = structureData.concertIds || structureData.concertsAssocies || [];
          
          if (concertIds.length > 0) {
            console.log('[DEBUG] Chargement concerts par IDs directs:', concertIds);
            
            // Charger chaque concert individuellement
            const concertPromises = concertIds.map(async (concertId) => {
              try {
                const concertRef = doc(db, 'concerts', concertId);
                const concertDoc = await getDoc(concertRef);
                
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
            
            console.log('[DEBUG] Concerts trouvés par IDs directs:', concerts.length);
          }
          
          // Méthode 2: Chercher par structureId (référence dans le concert)
          const concertsQuery = query(
            collection(db, 'concerts'),
            where('structureId', '==', structureData.id)
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
          
          console.log('[DEBUG] Concerts trouvés par structureId:', concerts.length);
          
          // Méthode 3: Chercher par programmateur associé (si structure a des programmateurs)
          // Cette recherche sera fait seulement si les deux premières méthodes n'ont pas trouvé de concerts
          if (concerts.length === 0) {
            const programmateurIds = structureData.programmateurIds || structureData.programmateursAssocies || [];
            
            if (programmateurIds.length > 0) {
              console.log('[DEBUG] Recherche concerts via programmateurs associés:', programmateurIds);
              
              for (const programmateurId of programmateurIds) {
                const concertsByProgQuery = query(
                  collection(db, 'concerts'),
                  where('programmateurId', '==', programmateurId)
                );
                
                const progConcertsSnapshot = await getDocs(concertsByProgQuery);
                
                progConcertsSnapshot.forEach((docSnapshot) => {
                  const concertData = { id: docSnapshot.id, ...docSnapshot.data() };
                  
                  // Éviter les doublons
                  const existingConcert = concerts.find(c => c.id === concertData.id);
                  if (!existingConcert) {
                    concerts.push(concertData);
                  }
                });
              }
              
              console.log('[DEBUG] Concerts trouvés via programmateurs:', concerts.length);
            }
          }
          
          console.log('[DEBUG] Total concerts retournés:', concerts.length);
          return concerts;
          
        } catch (error) {
          console.error('[ERROR] useStructureDetails customQuery concerts:', error);
          return [];
        }
      }
    },
    
    // Callbacks pour les opérations
    onSaveSuccess: () => {
      showSuccessToast(`La structure a été enregistrée avec succès`);
    },
    onSaveError: (error) => {
      console.error(`[useStructureDetails] Erreur de sauvegarde:`, error);
      showErrorToast(`Erreur lors de l'enregistrement de la structure: ${error.message}`);
    },
    onDeleteSuccess: () => {
      showSuccessToast(`La structure a été supprimée avec succès`);
      navigate('/structures');
    },
    onDeleteError: (error) => {
      console.error(`[useStructureDetails] Erreur de suppression:`, error);
      showErrorToast(`Erreur lors de la suppression de la structure: ${error.message}`);
    },
    
    // Navigation
    navigate,
    returnPath: '/structures',
    
    // Options avancées
    autoLoadRelated: true, // Charger automatiquement les entités liées
    cacheEnabled: true,    // Activer le cache pour de meilleures performances
    realtime: false,       // Chargement ponctuel plutôt qu'en temps réel
    useDeleteModal: true   // Utiliser un modal pour confirmer la suppression
  });

  // Fonction pour ajouter un programmateur à la structure
  const addProgrammateur = useCallback((programmateur) => {
    if (!programmateur || !programmateur.id) return;
    
    // Vérifier si le programmateur n'est pas déjà associé
    const programmateursAssocies = detailsHook.formData.programmateursAssocies || [];
    if (programmateursAssocies.includes(programmateur.id)) return;
    
    detailsHook.setFormData(prev => ({
      ...prev,
      programmateursAssocies: [...programmateursAssocies, programmateur.id]
    }));
    
    // Mettre à jour les données liées
    detailsHook.loadRelatedEntity('programmateurs', programmateur.id);
  }, [detailsHook]);

  // Fonction pour retirer un programmateur de la structure
  const removeProgrammateur = useCallback((programmateurId) => {
    if (!programmateurId) return;
    
    const programmateursAssocies = detailsHook.formData.programmateursAssocies || [];
    
    detailsHook.setFormData(prev => ({
      ...prev,
      programmateursAssocies: programmateursAssocies.filter(id => id !== programmateurId)
    }));
  }, [detailsHook]);
  
  // Fonction pour ajouter un lieu à la structure
  const addLieu = useCallback((lieu) => {
    if (!lieu || !lieu.id) return;
    
    // Vérifier si le lieu n'est pas déjà associé
    const lieuxAssocies = detailsHook.formData.lieuxAssocies || [];
    if (lieuxAssocies.includes(lieu.id)) return;
    
    detailsHook.setFormData(prev => ({
      ...prev,
      lieuxAssocies: [...lieuxAssocies, lieu.id]
    }));
    
    // Mettre à jour les données liées
    detailsHook.loadRelatedEntity('lieux', lieu.id);
  }, [detailsHook]);

  // Fonction pour retirer un lieu de la structure
  const removeLieu = useCallback((lieuId) => {
    if (!lieuId) return;
    
    const lieuxAssocies = detailsHook.formData.lieuxAssocies || [];
    
    detailsHook.setFormData(prev => ({
      ...prev,
      lieuxAssocies: lieuxAssocies.filter(id => id !== lieuId)
    }));
  }, [detailsHook]);

  return {
    // Base du hook générique
    ...detailsHook,
    
    // Fonctionnalités spécifiques aux structures
    addProgrammateur,
    removeProgrammateur,
    addLieu,
    removeLieu,
    
    // Raccourcis pour une meilleure expérience développeur
    structure: detailsHook.entity,
    loading: detailsHook.loading,
    error: detailsHook.error,
    isEditing: detailsHook.isEditing,
    formData: detailsHook.formData,
    hasChanges: detailsHook.isDirty,
    
    // Fonction de formatage des valeurs
    formatValue: detailsHook.formatValue || ((field, value) => {
      switch (field) {
        case 'createdAt':
        case 'updatedAt':
          return value ? new Date(value).toLocaleDateString() : 'Non spécifié';
        default:
          return value !== undefined && value !== null && value !== '' ? value : 'Non spécifié';
      }
    }),
    
    // Accès simplifié aux entités liées
    programmateurs: detailsHook.relatedData?.programmateurs || [],
    loadingProgrammateurs: detailsHook.loadingRelated?.programmateurs || false,
    lieux: detailsHook.relatedData?.lieux || [],
    loadingLieux: detailsHook.loadingRelated?.lieux || false,
    concerts: detailsHook.relatedData?.concerts || [],
    loadingConcerts: detailsHook.loadingRelated?.concerts || false
  };
};

export default useStructureDetails;