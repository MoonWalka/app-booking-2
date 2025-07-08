// src/hooks/structures/useStructureDetails.js
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGenericEntityDetails } from '@/hooks/common';
import { showSuccessToast, showErrorToast } from '@/utils/toasts';
import { useEntreprise } from '@/context/EntrepriseContext';

/**
 * Hook optimisé pour la gestion des détails d'une structure
 * Version améliorée avec une meilleure organisation et détection d'erreurs
 * 
 * @param {string} id - ID de la structure
 * @returns {Object} États et méthodes pour gérer une structure
 */
const useStructureDetails = (id) => {
  const navigate = useNavigate();
  const { currentEntreprise } = useEntreprise();
  
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
    // 🏗️ NIVEAU 1 (Structure) - Charge toutes ses relations sans restriction
    relatedEntities: [
      { 
        name: 'contacts', 
        collection: 'contacts', 
        idField: 'contactsAssocies',
        alternativeIdFields: ['contactIds'], // Support de l'ancien et nouveau format
        type: 'custom', // Utiliser customQuery pour une logique robuste
        essential: true, // Les contacts sont essentiels pour l'affichage de la structure
        loadRelated: false // 🚫 Empêche les contacts de charger leurs relations (évite boucles)
      },
      {
        name: 'lieux',
        collection: 'lieux',
        idField: 'lieuxAssocies',
        alternativeIdFields: ['lieuxIds'],
        type: 'custom', // Utiliser customQuery pour logique de fallback
        essential: true, // CORRECTION: Marquer comme essentiel pour forcer le chargement
        loadRelated: false // 🚫 Empêche les lieux de charger leurs relations (évite boucles)
      },
      {
        name: 'dates',
        collection: 'dates',
        type: 'custom', // Utiliser la customQuery pour une logique plus complexe
        essential: true, // Les dates sont importants pour l'affichage
        loadRelated: false // 🚫 Empêche les dates de charger leurs relations (évite boucles)
      },
      {
        name: 'artistes',
        collection: 'artistes',
        type: 'custom', // Charger via les dates ou directement
        essential: true, // CORRECTION: Marquer comme essentiel pour forcer le chargement
        loadRelated: false // 🚫 Empêche les artistes de charger leurs relations (évite boucles)
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
            
            const constraints = [where('structureId', '==', structureData.id)];
            if (currentEntreprise?.id) {
              constraints.push(where('organizationId', '==', currentEntreprise.id));
            }
            const contactsQuery = query(
              collection(db, 'contacts'),
              ...constraints
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

      dates: async (structureData) => {
        console.log('[DEBUG useStructureDetails] customQuery dates appelée avec:', structureData);
        
        // Importer les services Firebase
        const { collection, query, where, getDocs, doc, getDoc } = await import('@/services/firebase-service');
        const { db } = await import('@/services/firebase-service');
        
        let dates = [];
        
        try {
          // Méthode 1: Vérifier les IDs directs dans la structure (si ils existent)
          const dateIds = structureData.dateIds || structureData.datesAssocies || [];
          
          if (dateIds.length > 0) {
            console.log('[DEBUG] Chargement dates par IDs directs:', dateIds);
            
            // Charger chaque date individuellement
            const datePromises = dateIds.map(async (dateId) => {
              try {
                // S'assurer que dateId est une string
                const idString = typeof dateId === 'object' ? dateId.id : dateId;
                if (!idString || typeof idString !== 'string') {
                  console.error(`ID date invalide:`, dateId);
                  return null;
                }
                
                const dateRef = doc(db, 'dates', idString);
                const dateDoc = await getDoc(dateRef);
                
                if (dateDoc.exists()) {
                  return { id: dateDoc.id, ...dateDoc.data() };
                }
                return null;
              } catch (error) {
                console.error(`Erreur chargement date ${dateId}:`, error);
                return null;
              }
            });
            
            const results = await Promise.all(datePromises);
            dates = results.filter(Boolean);
            
            console.log('[DEBUG] Dates trouvés par IDs directs:', dates.length);
          }
          
          // Méthode 2: Chercher par structureId (référence dans le date)
          const dateConstraints = [where('structureId', '==', structureData.id)];
          if (currentEntreprise?.id) {
            dateConstraints.push(where('organizationId', '==', currentEntreprise.id));
          }
          const datesQuery = query(
            collection(db, 'dates'),
            ...dateConstraints
          );
          
          const querySnapshot = await getDocs(datesQuery);
          
          querySnapshot.forEach((docSnapshot) => {
            const dateData = { id: docSnapshot.id, ...docSnapshot.data() };
            
            // Éviter les doublons si déjà trouvé par ID direct
            const existingDate = dates.find(c => c.id === dateData.id);
            if (!existingDate) {
              dates.push(dateData);
            }
          });
          
          console.log('[DEBUG] Dates trouvés par structureId:', dates.length);
          
          // Méthode 3: Chercher par contact associé (si structure a des contacts)
          // Cette recherche sera fait seulement si les deux premières méthodes n'ont pas trouvé de dates
          if (dates.length === 0) {
            const contactIds = structureData.contactIds || structureData.contactsAssocies || [];
            
            if (contactIds.length > 0) {
              console.log('[DEBUG] Recherche dates via contacts associés:', contactIds);
              
              for (const contactId of contactIds) {
                const datesByProgConstraints = [where('contactIds', 'array-contains', contactId)];
                if (currentEntreprise?.id) {
                  datesByProgConstraints.push(where('organizationId', '==', currentEntreprise.id));
                }
                const datesByProgQuery = query(
                  collection(db, 'dates'),
                  ...datesByProgConstraints
                );
                
                const progDatesSnapshot = await getDocs(datesByProgQuery);
                
                progDatesSnapshot.forEach((docSnapshot) => {
                  const dateData = { id: docSnapshot.id, ...docSnapshot.data() };
                  
                  // Éviter les doublons
                  const existingDate = dates.find(c => c.id === dateData.id);
                  if (!existingDate) {
                    dates.push(dateData);
                  }
                });
              }
              
              console.log('[DEBUG] Dates trouvés via contacts:', dates.length);
            }
          }
          
          console.log('[DEBUG] Total dates retournés:', dates.length);
          return dates;
          
        } catch (error) {
          console.error('[ERROR] useStructureDetails customQuery dates:', error);
          return [];
        }
      },

      lieux: async (structureData) => {
        console.log('[DEBUG useStructureDetails] customQuery lieux appelée avec:', structureData);
        
        // Importer les services Firebase
        const { collection, query, where, getDocs, doc, getDoc } = await import('@/services/firebase-service');
        const { db } = await import('@/services/firebase-service');
        
        let lieux = [];
        
        try {
          // Méthode 1: IDs directs dans la structure
          const lieuIds = structureData.lieuxIds || structureData.lieuxAssocies || [];
          
          if (lieuIds.length > 0) {
            console.log('[DEBUG] Chargement lieux par IDs directs:', lieuIds);
            
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
            
            console.log('[DEBUG] Lieux trouvés par IDs directs:', lieux.length);
          }
          
          // Méthode 2: Recherche par référence inverse (lieux qui référencent cette structure)
          const lieuxConstraints = [where('structureId', '==', structureData.id)];
          if (currentEntreprise?.id) {
            lieuxConstraints.push(where('organizationId', '==', currentEntreprise.id));
          }
          const lieuxQuery = query(
            collection(db, 'lieux'),
            ...lieuxConstraints
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
          
          // Méthode 3: NOUVELLE - Via les dates de cette structure
          console.log('[useStructureDetails] 🔍 Méthode 3: Recherche lieux via dates de la structure');
          const dateConstraints2 = [where('structureId', '==', structureData.id)];
          if (currentEntreprise?.id) {
            dateConstraints2.push(where('organizationId', '==', currentEntreprise.id));
          }
          const datesQuery = query(
            collection(db, 'dates'),
            ...dateConstraints2
          );
          
          const datesSnapshot = await getDocs(datesQuery);
          
          datesSnapshot.forEach((docSnapshot) => {
            const dateData = docSnapshot.data();
            if (dateData.lieuId) {
              // Ajouter le lieu à charger (on le chargera après)
              console.log('[useStructureDetails] 🎵 Date trouvé avec lieu:', dateData.lieuId);
            }
          });
          
          // Charger tous les lieux des dates de cette structure
          const lieuxDesDates = [];
          const datesArray = [];
          datesSnapshot.forEach((docSnapshot) => {
            const dateData = docSnapshot.data();
            datesArray.push(dateData);
            if (dateData.lieuId) {
              lieuxDesDates.push(dateData.lieuId);
            }
          });
          
          // Supprimer les doublons et charger les lieux
          const uniqueLieuxIds = [...new Set(lieuxDesDates)];
          for (const lieuId of uniqueLieuxIds) {
            try {
              const lieuDoc = await getDoc(doc(db, 'lieux', lieuId));
              if (lieuDoc.exists()) {
                const lieuData = { id: lieuDoc.id, ...lieuDoc.data() };
                
                // Éviter les doublons avec les autres méthodes
                const existingLieu = lieux.find(l => l.id === lieuData.id);
                if (!existingLieu) {
                  lieux.push(lieuData);
                  console.log('[useStructureDetails] ✅ Lieu trouvé via dates:', lieuData.nom);
                }
              }
            } catch (error) {
              console.error(`Erreur chargement lieu via dates ${lieuId}:`, error);
            }
          }
          
          console.log('[DEBUG] Total lieux retournés:', lieux.length);
          return lieux;
          
        } catch (error) {
          console.error('[ERROR] useStructureDetails customQuery lieux:', error);
          return [];
        }
      },

      artistes: async (structureData) => {
        console.log('[DEBUG useStructureDetails] customQuery artistes appelée avec:', structureData);
        
        // Importer les services Firebase
        const { collection, query, where, getDocs, doc, getDoc } = await import('@/services/firebase-service');
        const { db } = await import('@/services/firebase-service');
        
        let artistes = [];
        
        try {
          // Méthode 1: IDs directs dans la structure (si ils existent)
          const artisteIds = structureData.artisteIds || structureData.artistesAssocies || [];
          
          if (artisteIds.length > 0) {
            console.log('[DEBUG] Chargement artistes par IDs directs:', artisteIds);
            
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
            
            console.log('[DEBUG] Artistes trouvés par IDs directs:', artistes.length);
          }
          
          // Méthode 2: Charger les artistes via les dates de cette structure
          // D'abord récupérer les dates de cette structure
          const dateConstraints3 = [where('structureId', '==', structureData.id)];
          if (currentEntreprise?.id) {
            dateConstraints3.push(where('organizationId', '==', currentEntreprise.id));
          }
          const datesQuery = query(
            collection(db, 'dates'),
            ...dateConstraints3
          );
          
          const datesSnapshot = await getDocs(datesQuery);
          const artisteIds2 = [];
          
          datesSnapshot.forEach((docSnapshot) => {
            const dateData = docSnapshot.data();
            if (dateData.artisteId) {
              artisteIds2.push(dateData.artisteId);
            }
          });
          
          // Supprimer les doublons
          const uniqueArtisteIds = [...new Set(artisteIds2)];
          
          if (uniqueArtisteIds.length > 0) {
            console.log('[DEBUG] Chargement artistes via dates:', uniqueArtisteIds);
            
            const artistePromises2 = uniqueArtisteIds.map(async (artisteId) => {
              try {
                const artisteRef = doc(db, 'artistes', artisteId);
                const artisteDoc = await getDoc(artisteRef);
                
                if (artisteDoc.exists()) {
                  const artisteData = { id: artisteDoc.id, ...artisteDoc.data() };
                  
                  // Éviter les doublons avec la méthode 1
                  const existingArtiste = artistes.find(a => a.id === artisteData.id);
                  if (!existingArtiste) {
                    return artisteData;
                  }
                }
                return null;
              } catch (error) {
                console.error(`Erreur chargement artiste via date ${artisteId}:`, error);
                return null;
              }
            });
            
            const results2 = await Promise.all(artistePromises2);
            const newArtistes = results2.filter(Boolean);
            artistes = [...artistes, ...newArtistes];
            
            console.log('[DEBUG] Artistes trouvés via dates:', newArtistes.length);
          }
          
          console.log('[DEBUG] Total artistes retournés:', artistes.length);
          return artistes;
          
        } catch (error) {
          console.error('[ERROR] useStructureDetails customQuery artistes:', error);
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
    dates: detailsHook.relatedData?.dates || [],
    loadingDates: detailsHook.loadingRelated?.dates || false,
    artistes: detailsHook.relatedData?.artistes || [],
    loadingArtistes: detailsHook.loadingRelated?.artistes || false
  };
};

export default useStructureDetails;