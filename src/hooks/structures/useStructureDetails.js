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
        contactsAssocies: data.contactsAssocies || [],
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
        name: 'contacts', 
        collection: 'contacts', 
        idField: 'contactsAssocies',
        alternativeIdFields: ['contactIds'], // Support de l'ancien et nouveau format
        type: 'one-to-many',
        essential: true // Les contacts sont essentiels pour l'affichage de la structure
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
      contacts: async (structureData) => {
        console.log('[DEBUG useStructureDetails] customQuery contacts appelée avec:', structureData);
        
        // Importer les services Firebase
        const { collection, query, where, getDocs, doc, getDoc } = await import('@/services/firebase-service');
        const { db } = await import('@/services/firebase-service');
        
        let contacts = [];
        
        try {
          // Méthode 1: Vérifier les IDs directs dans la structure (format actuel et ancien)
          const contactIds = structureData.contactIds || structureData.contactsAssocies || [];
          
          if (contactIds.length > 0) {
            console.log('[DEBUG] Chargement contacts par IDs directs:', contactIds);
            
            // Charger chaque contact individuellement
            const contactPromises = contactIds.map(async (progId) => {
              try {
                // S'assurer que progId est une string
                const idString = typeof progId === 'object' ? progId.id : progId;
                if (!idString || typeof idString !== 'string') {
                  console.error(`ID contact invalide:`, progId);
                  return null;
                }
                
                const progRef = doc(db, 'contacts', idString);
                const progDoc = await getDoc(progRef);
                
                if (progDoc.exists()) {
                  return { id: progDoc.id, ...progDoc.data() };
                }
                return null;
              } catch (error) {
                console.error(`Erreur chargement contact ${progId}:`, error);
                return null;
              }
            });
            
            const results = await Promise.all(contactPromises);
            contacts = results.filter(Boolean);
            
            console.log('[DEBUG] Contacts trouvés par IDs directs:', contacts.length);
          }
          
          // Méthode 2: Si aucun contact trouvé par IDs directs, 
          // chercher par référence inverse (contacts avec structureId)
          if (contacts.length === 0) {
            console.log('[DEBUG] Recherche par référence inverse (structureId)');
            
            const contactsQuery = query(
              collection(db, 'contacts'),
              where('structureId', '==', structureData.id)
            );
            
            const querySnapshot = await getDocs(contactsQuery);
            
            querySnapshot.forEach((docSnapshot) => {
              contacts.push({
                id: docSnapshot.id,
                ...docSnapshot.data()
              });
            });
            
            console.log('[DEBUG] Contacts trouvés par référence inverse:', contacts.length);
          }
          
          console.log('[DEBUG] Total contacts retournés:', contacts.length);
          return contacts;
          
        } catch (error) {
          console.error('[ERROR] useStructureDetails customQuery contacts:', error);
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
                // S'assurer que concertId est une string
                const idString = typeof concertId === 'object' ? concertId.id : concertId;
                if (!idString || typeof idString !== 'string') {
                  console.error(`ID concert invalide:`, concertId);
                  return null;
                }
                
                const concertRef = doc(db, 'concerts', idString);
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
          
          // Méthode 3: Chercher par contact associé (si structure a des contacts)
          // Cette recherche sera fait seulement si les deux premières méthodes n'ont pas trouvé de concerts
          if (concerts.length === 0) {
            const contactIds = structureData.contactIds || structureData.contactsAssocies || [];
            
            if (contactIds.length > 0) {
              console.log('[DEBUG] Recherche concerts via contacts associés:', contactIds);
              
              for (const contactId of contactIds) {
                const concertsByProgQuery = query(
                  collection(db, 'concerts'),
                  where('contactId', '==', contactId)
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
              
              console.log('[DEBUG] Concerts trouvés via contacts:', concerts.length);
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

  // Fonction pour ajouter un contact à la structure
  const addContact = useCallback((contact) => {
    if (!contact || !contact.id) return;
    
    // Vérifier si le contact n'est pas déjà associé
    const contactsAssocies = detailsHook.formData.contactsAssocies || [];
    if (contactsAssocies.includes(contact.id)) return;
    
    detailsHook.setFormData(prev => ({
      ...prev,
      contactsAssocies: [...contactsAssocies, contact.id]
    }));
    
    // Mettre à jour les données liées
    detailsHook.loadRelatedEntity('contacts', contact.id);
  }, [detailsHook]);

  // Fonction pour retirer un contact de la structure
  const removeContact = useCallback((contactId) => {
    if (!contactId) return;
    
    const contactsAssocies = detailsHook.formData.contactsAssocies || [];
    
    detailsHook.setFormData(prev => ({
      ...prev,
      contactsAssocies: contactsAssocies.filter(id => id !== contactId)
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
    addContact,
    removeContact,
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
    contacts: detailsHook.relatedData?.contacts || [],
    loadingContacts: detailsHook.loadingRelated?.contacts || false,
    lieux: detailsHook.relatedData?.lieux || [],
    loadingLieux: detailsHook.loadingRelated?.lieux || false,
    concerts: detailsHook.relatedData?.concerts || [],
    loadingConcerts: detailsHook.loadingRelated?.concerts || false
  };
};

export default useStructureDetails;