// src/hooks/lieux/useLieuDetails.js
import { useCallback, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useGenericEntityDetails } from '@/hooks/common';
import { useOrganization } from '@/context/OrganizationContext';
import { showSuccessToast, showErrorToast } from '@/utils/toasts';

/**
 * Hook optimisé pour la gestion des détails d'un lieu
 * Mode lecture seule - l'édition se fait dans LieuForm (comme les concerts)
 * 
 * @param {string} id - ID du lieu à afficher
 * @param {object} locationParam - Objet location de React Router (optionnel)
 * @returns {Object} API pour gérer les détails d'un lieu
 */
const useLieuDetails = (id, locationParam) => {
  const navigate = useNavigate();
  const locationData = useLocation();
  // eslint-disable-next-line no-unused-vars
  const { currentOrganization } = useOrganization();
  
  // Support du paramètre locationParam optionnel (pour compatibilité future)
  // eslint-disable-next-line no-unused-vars
  const location = locationParam || locationData;
  
  // Mode lecture seule - pas d'édition dans ce composant
  const isEditMode = false;
  
  // SUPPRIMÉ: Les entités liées sont maintenant gérées par customQueries dans useGenericEntityDetails
  

  // SUPPRIMÉ: loadRelatedEntities - Les entités sont maintenant chargées automatiquement par customQueries
  
  // Fonction pour formater les dates de manière cohérente
  const formatDate = useCallback((value) => {
    return value ? format(new Date(value), 'PPP à HH:mm', { locale: fr }) : '-';
  }, []);
  
  // Fonction pour transformer les données du lieu
  const transformLieuData = useCallback((data) => {
    if (!data) return null;
    
    return {
      ...data,
      // Champs calculés pour l'affichage
      displayName: data.nom ? `${data.nom} (${data.ville || 'Ville non spécifiée'})` : 'Lieu sans nom',
      capaciteFormatee: data.capacite ? `${data.capacite} personnes` : 'Capacité non spécifiée',
    };
  }, []);
  
  // Fonction pour valider le formulaire de lieu (non utilisée en mode lecture)
  const validateLieuFormData = useCallback((formData) => {
    const errors = {};
    
    if (!formData?.nom) errors.nom = 'Le nom est obligatoire';
    if (!formData?.ville) errors.ville = 'La ville est obligatoire';
    if (!formData?.adresse) errors.adresse = 'L\'adresse est obligatoire';
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }, []);
  
  // Fonction pour formater les valeurs d'affichage
  const formatLieuValue = useCallback((field, value) => {
    switch (field) {
      case 'createdAt':
      case 'updatedAt':
      case 'dateOuverture':
        return formatDate(value);
      case 'capacite':
        return value ? `${value} personnes` : 'Non spécifiée';
      default:
        return value;
    }
  }, [formatDate]);
  
  // Configuration stabilisée avec useRef pour éviter les re-renders (comme dans useConcertDetails)
  const customQueriesRef = useRef({
    contact: async (lieuData) => {
      console.log('🔥🔥🔥 CUSTOM CONTACT QUERY APPELÉE 🔥🔥🔥');
      if (!lieuData) return null;
      
      console.log('[useLieuDetails] Custom contact query - lieu data:', {
        id: lieuData.id,
        contactId: lieuData.contactId,
        contactsAssocies: lieuData.contactsAssocies,
        allFields: Object.keys(lieuData)
      });
      
      try {
        const { collection, query, where, getDocs, doc, getDoc, db } = await import('@/services/firebase-service');
        
        // Méthode 1: contactId direct
        if (lieuData.contactId) {
          console.log('[useLieuDetails] Tentative chargement contact via contactId:', lieuData.contactId);
          const contactDoc = await getDoc(doc(db, 'contacts', lieuData.contactId));
          if (contactDoc.exists()) {
            const contact = { id: contactDoc.id, ...contactDoc.data() };
            console.log('[useLieuDetails] ✅ Contact trouvé via contactId:', contact);
            return contact;
          } else {
            console.log('[useLieuDetails] ❌ Contact avec contactId non trouvé');
          }
        }
        
        // Méthode 2: contactsAssocies array (compatibilité ancienne)
        if (lieuData.contactsAssocies && Array.isArray(lieuData.contactsAssocies) && lieuData.contactsAssocies.length > 0) {
          const premierContactId = lieuData.contactsAssocies[0];
          const contactId = typeof premierContactId === 'object' ? premierContactId.id : premierContactId;
          
          if (contactId && typeof contactId === 'string') {
            const contactDoc = await getDoc(doc(db, 'contacts', contactId));
            if (contactDoc.exists()) {
              const contact = { id: contactDoc.id, ...contactDoc.data() };
              console.log('[useLieuDetails] ✅ Contact trouvé via contactsAssocies:', contact);
              return contact;
            }
          }
        }
        
        // Méthode 1bis: contactIds array (nouvelle méthode)
        if (lieuData.contactIds && Array.isArray(lieuData.contactIds) && lieuData.contactIds.length > 0) {
          console.log('[useLieuDetails] Tentative chargement contact via contactIds:', lieuData.contactIds);
          const premierContactId = lieuData.contactIds[0];
          
          if (premierContactId && typeof premierContactId === 'string') {
            const contactDoc = await getDoc(doc(db, 'contacts', premierContactId));
            if (contactDoc.exists()) {
              const contact = { id: contactDoc.id, ...contactDoc.data() };
              console.log('[useLieuDetails] ✅ Contact trouvé via contactIds:', contact);
              return contact;
            }
          }
        }
        
        // Méthode 2bis: NOUVELLE - Recherche contact qui contient ce lieu
        console.log('[useLieuDetails] 🔍 Méthode 2bis: Recherche contact qui contient ce lieu');
        
        // Récupérer l'organizationId depuis le localStorage ou sessionStorage
        // qui est géré par le contexte OrganizationContext
        let organizationId = null;
        try {
          // Récupérer l'organisation courante depuis le stockage local de l'application
          const storedOrg = localStorage.getItem('currentOrganization');
          if (storedOrg) {
            const orgData = JSON.parse(storedOrg);
            organizationId = orgData?.id;
          }
        } catch (error) {
          console.warn('[useLieuDetails] Impossible de récupérer l\'organizationId depuis localStorage:', error);
        }
        
        const contactsConstraints = [where('lieuxIds', 'array-contains', lieuData.id)];
        if (organizationId) {
          contactsConstraints.push(where('organizationId', '==', organizationId));
        }
        const contactsQuery = query(
          collection(db, 'contacts'),
          ...contactsConstraints
        );
        
        let contactsSnapshot = await getDocs(contactsQuery);
        
        // Fallback: essayer avec lieuxAssocies
        if (contactsSnapshot.empty) {
          const contactsConstraints2 = [where('lieuxAssocies', 'array-contains', lieuData.id)];
          if (organizationId) {
            contactsConstraints2.push(where('organizationId', '==', organizationId));
          }
          const contactsQuery2 = query(
            collection(db, 'contacts'),
            ...contactsConstraints2
          );
          contactsSnapshot = await getDocs(contactsQuery2);
        }
        
        if (!contactsSnapshot.empty) {
          const premierContact = contactsSnapshot.docs[0];
          const contact = { id: premierContact.id, ...premierContact.data() };
          console.log('[useLieuDetails] ✅ Contact trouvé via référence inverse:', contact);
          return contact;
        }
        
        // Méthode 3: NOUVELLE - Trouver le contact via les concerts de ce lieu
        console.log('[useLieuDetails] 🔍 Méthode 3: Recherche contact via concerts du lieu');
        const concertsConstraints = [where('lieuId', '==', lieuData.id)];
        if (organizationId) {
          concertsConstraints.push(where('organizationId', '==', organizationId));
        }
        const concertsQuery = query(
          collection(db, 'concerts'),
          ...concertsConstraints
        );
        
        const concertsSnapshot = await getDocs(concertsQuery);
        
        if (!concertsSnapshot.empty) {
          // Prendre le premier concert et récupérer son contact
          const premierConcert = concertsSnapshot.docs[0].data();
          console.log('[useLieuDetails] 🎵 Premier concert trouvé:', premierConcert);
          
          if (premierConcert.contactId) {
            console.log('[useLieuDetails] 🚀 Chargement contact via concert:', premierConcert.contactId);
            const contactDoc = await getDoc(doc(db, 'contacts', premierConcert.contactId));
            if (contactDoc.exists()) {
              const contact = { id: contactDoc.id, ...contactDoc.data() };
              console.log('[useLieuDetails] ✅ Contact trouvé via concert:', contact);
              return contact;
            }
          }
        }
        
        console.log('[useLieuDetails] ❌ Aucun contact trouvé pour ce lieu');
        return null;
      } catch (error) {
        console.error('[useLieuDetails] Erreur lors du chargement du contact:', error);
        return null;
      }
    },

    structure: async (lieuData) => {
      console.log('[DEBUG useLieuDetails] customQuery structure appelée avec:', lieuData);
      
      if (!lieuData) return null;
      
      try {
        const { collection, query, where, getDocs, doc, getDoc, db } = await import('@/services/firebase-service');
        
        // Méthode 1: structureId direct dans le lieu
        if (lieuData.structureId) {
          console.log('[useLieuDetails] Tentative chargement structure via structureId:', lieuData.structureId);
          const structureDoc = await getDoc(doc(db, 'structures', lieuData.structureId));
          if (structureDoc.exists()) {
            const structure = { id: structureDoc.id, ...structureDoc.data() };
            console.log('[useLieuDetails] ✅ Structure trouvée via structureId:', structure);
            return structure;
          }
        }
        
        // Méthode 2: Via le contact direct du lieu
        if (lieuData.contactId) {
          console.log('[useLieuDetails] Tentative chargement structure via contact direct:', lieuData.contactId);
          const contactDoc = await getDoc(doc(db, 'contacts', lieuData.contactId));
          if (contactDoc.exists()) {
            const contactData = contactDoc.data();
            if (contactData.structureId) {
              const structureDoc = await getDoc(doc(db, 'structures', contactData.structureId));
              if (structureDoc.exists()) {
                const structure = { id: structureDoc.id, ...structureDoc.data() };
                console.log('[useLieuDetails] ✅ Structure trouvée via contact direct:', structure);
                return structure;
              }
            }
          }
        }
        
        // Méthode 3: NOUVELLE - Via le contact des concerts de ce lieu
        console.log('[useLieuDetails] 🔍 Méthode 3: Recherche structure via contact des concerts');
        
        // Récupérer l'organizationId depuis le localStorage
        let organizationId = null;
        try {
          const storedOrg = localStorage.getItem('currentOrganization');
          if (storedOrg) {
            const orgData = JSON.parse(storedOrg);
            organizationId = orgData?.id;
          }
        } catch (error) {
          console.warn('[useLieuDetails] Impossible de récupérer l\'organizationId depuis localStorage:', error);
        }
        
        const concertsConstraints = [where('lieuId', '==', lieuData.id)];
        if (organizationId) {
          concertsConstraints.push(where('organizationId', '==', organizationId));
        }
        const concertsQuery = query(
          collection(db, 'concerts'),
          ...concertsConstraints
        );
        
        const concertsSnapshot = await getDocs(concertsQuery);
        
        if (!concertsSnapshot.empty) {
          // Prendre le premier concert et récupérer sa structure via le contact
          const premierConcert = concertsSnapshot.docs[0].data();
          console.log('[useLieuDetails] 🎵 Premier concert pour structure:', premierConcert);
          
          if (premierConcert.contactId) {
            console.log('[useLieuDetails] 🚀 Chargement contact du concert:', premierConcert.contactId);
            const contactDoc = await getDoc(doc(db, 'contacts', premierConcert.contactId));
            if (contactDoc.exists()) {
              const contactData = contactDoc.data();
              console.log('[useLieuDetails] 📋 Données contact:', contactData);
              
              if (contactData.structureId) {
                console.log('[useLieuDetails] 🚀 Chargement structure via contact du concert:', contactData.structureId);
                const structureDoc = await getDoc(doc(db, 'structures', contactData.structureId));
                if (structureDoc.exists()) {
                  const structure = { id: structureDoc.id, ...structureDoc.data() };
                  console.log('[useLieuDetails] ✅ Structure trouvée via contact du concert:', structure);
                  return structure;
                }
              }
            }
          }
        }
        
        console.log('[useLieuDetails] ❌ Aucune structure trouvée pour ce lieu');
        return null;
      } catch (error) {
        console.error('[useLieuDetails] Erreur lors du chargement de la structure:', error);
        return null;
      }
    },

    concerts: async (lieuData) => {
      console.log('[DEBUG useLieuDetails] customQuery concerts appelée avec:', lieuData);
      
      if (!lieuData) return [];
      
      try {
        const { collection, query, where, getDocs } = await import('@/services/firebase-service');
        const { db } = await import('@/services/firebase-service');
        
        // 🔒 CORRECTION CRITIQUE: Ajouter le filtre organizationId
        const organizationId = localStorage.getItem('currentOrganizationId');
        const constraints = [where('lieuId', '==', lieuData.id)];
        if (organizationId) {
          constraints.push(where('organizationId', '==', organizationId));
        }
        
        // Rechercher tous les concerts qui ont ce lieu
        const concertsQuery = query(
          collection(db, 'concerts'),
          ...constraints
        );
        
        const querySnapshot = await getDocs(concertsQuery);
        const concerts = [];
        
        querySnapshot.forEach((docSnapshot) => {
          concerts.push({
            id: docSnapshot.id,
            ...docSnapshot.data()
          });
        });
        
        console.log('[useLieuDetails] ✅ Concerts trouvés:', concerts.length);
        return concerts;
        
      } catch (error) {
        console.error('[useLieuDetails] Erreur lors du chargement des concerts:', error);
        return [];
      }
    },

    artistes: async (lieuData) => {
      console.log('[DEBUG useLieuDetails] customQuery artistes appelée avec:', lieuData);
      
      if (!lieuData) return [];
      
      try {
        const { collection, query, where, getDocs, doc, getDoc } = await import('@/services/firebase-service');
        const { db } = await import('@/services/firebase-service');
        
        // 🔒 CORRECTION CRITIQUE: Ajouter le filtre organizationId pour les artistes
        const organizationId = localStorage.getItem('currentOrganizationId');
        const constraints = [where('lieuId', '==', lieuData.id)];
        if (organizationId) {
          constraints.push(where('organizationId', '==', organizationId));
        }
        
        // D'abord récupérer tous les concerts de ce lieu
        const concertsQuery = query(
          collection(db, 'concerts'),
          ...constraints
        );
        
        const concertsSnapshot = await getDocs(concertsQuery);
        const artisteIds = [];
        
        concertsSnapshot.forEach((docSnapshot) => {
          const concertData = docSnapshot.data();
          if (concertData.artisteId) {
            artisteIds.push(concertData.artisteId);
          }
        });
        
        // Supprimer les doublons
        const uniqueArtisteIds = [...new Set(artisteIds)];
        
        if (uniqueArtisteIds.length === 0) {
          console.log('[useLieuDetails] ❌ Aucun artiste trouvé pour ce lieu');
          return [];
        }
        
        console.log('[useLieuDetails] Chargement artistes:', uniqueArtisteIds);
        
        // Charger tous les artistes
        const artistePromises = uniqueArtisteIds.map(async (artisteId) => {
          try {
            const artisteDoc = await getDoc(doc(db, 'artistes', artisteId));
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
        const artistes = results.filter(Boolean);
        
        console.log('[useLieuDetails] ✅ Artistes trouvés:', artistes.length);
        return artistes;
        
      } catch (error) {
        console.error('[useLieuDetails] Erreur lors du chargement des artistes:', error);
        return [];
      }
    }
  });

  // Configuration stabilisée des entités liées avec useMemo
  // 🏗️ NIVEAU 3 (Lieu) - Charge contact + concerts + artistes, ÉVITE structure direct (via contact)
  const relatedEntities = useMemo(() => [
    { 
      name: 'contact', 
      collection: 'contacts',
      idField: 'contactId',
      alternativeIdFields: ['contactsAssocies'], // Champs alternatifs pour compatibilité
      nameField: 'nom',
      type: 'custom', // Force l'utilisation de la customQuery même sans contactId
      essential: true, // CORRECTION: Marquer comme essentiel pour forcer le chargement
      loadRelated: false // 🚫 Empêche le contact de charger ses relations (évite boucles)
    },
    {
      name: 'structure',
      collection: 'structures',
      idField: 'structureId',
      type: 'custom', // Charger via le contact ou directement
      essential: true, // IMPORTANT: Marquer comme essentiel pour forcer le chargement
      loadRelated: false // 🚫 SÉCURITÉ: Empêche la structure de charger ses relations (évite boucles)
    },
    {
      name: 'concerts',
      collection: 'concerts',
      idField: 'lieuId',
      type: 'custom', // Requête inverse pour trouver les concerts dans ce lieu
      essential: true, // Très important pour un lieu
      loadRelated: false // 🚫 Empêche les concerts de charger leurs relations (évite boucles)
    },
    {
      name: 'artistes',
      collection: 'artistes', 
      type: 'custom', // Charger via les concerts de ce lieu
      essential: true, // CORRECTION: Marquer comme essentiel pour forcer le chargement
      loadRelated: false // 🚫 Empêche les artistes de charger leurs relations (évite boucles)
    }
  ], []); // Pas de dépendances car la configuration est statique
  
  // Configuration de base pour le hook générique - MODE LECTURE SEULE
  const detailsHook = useGenericEntityDetails({
    // Configuration générale
    entityType: 'lieu',
    collectionName: 'lieux',
    id,
    initialMode: 'view', // Toujours en mode vue
    
    // Transformation des données
    transformData: transformLieuData,
    
    // Formatage des valeurs pour l'affichage
    formatValue: formatLieuValue,
    
    // Validation avant sauvegarde (non utilisée)
    validateFormFn: validateLieuFormData,
    
    // Configuration des entités liées (seulement les relations directes)
    relatedEntities,
    
    // Requêtes personnalisées pour les entités liées - STABILISÉES
    customQueries: customQueriesRef.current,
    
    // Chargement automatique des entités liées
    autoLoadRelated: true,
    
    // Callbacks pour les opérations
    onSaveSuccess: (data) => {
      showSuccessToast(`Le lieu ${data.nom || ''} a été mis à jour avec succès`);
    },
    onSaveError: (error) => {
      console.error(`[useLieuDetails] Erreur de sauvegarde:`, error);
      showErrorToast(`Erreur lors de la sauvegarde du lieu: ${error.message}`);
    },
    onDeleteSuccess: () => {
      showSuccessToast(`Le lieu a été supprimé avec succès`);
      navigate('/lieux');
    },
    onDeleteError: (error) => {
      console.error(`[useLieuDetails] Erreur de suppression:`, error);
      showErrorToast(`Erreur lors de la suppression du lieu: ${error.message}`);
    },
    
    // Navigation
    navigate,
    returnPath: '/lieux',
    editPath: `/lieux/${id}/edit`, // Navigation vers LieuForm
    
    // Options avancées
    realtime: false, // Chargement ponctuel plutôt qu'en temps réel
    cacheEnabled: true, // Réactiver le cache pour de meilleures performances
    useDeleteModal: true, // Utiliser un modal pour confirmer la suppression
  });
  
  // Callbacks pour les événements de sauvegarde et suppression (comme dans useConcertDetails)
  const handleSaveSuccess = useCallback((data) => {
    // Émettre un événement personnalisé pour notifier les autres composants
    try {
      const event = new CustomEvent('lieuUpdated', { 
        detail: { 
          id, 
          data: data
        } 
      });
      window.dispatchEvent(event);
    } catch (e) {
      console.warn('Impossible de déclencher l\'événement de mise à jour', e);
    }
  }, [id]);
  
  const handleDeleteSuccess = useCallback(() => {
    // Notifier les autres composants
    try {
      const event = new CustomEvent('lieuDeleted', { detail: { id } });
      window.dispatchEvent(event);
    } catch (e) {
      console.warn('Impossible de déclencher l\'événement de suppression', e);
    }
    navigate('/lieux');
  }, [id, navigate]);
  
  // Mettre à jour les callbacks dans detailsHook
  const updateDetailsOptions = useCallback(() => {
    if (detailsHook && detailsHook.updateOptions) {
      detailsHook.updateOptions({
        onSaveSuccess: handleSaveSuccess,
        onDeleteSuccess: handleDeleteSuccess
      });
    }
  }, [detailsHook, handleSaveSuccess, handleDeleteSuccess]);

  useEffect(() => {
    updateDetailsOptions();
  }, [updateDetailsOptions]);
  
  // SUPPRIMÉ: L'effet pour charger les entités - Maintenant géré automatiquement par useGenericEntityDetails
  
  
  // Fonctions de navigation (comme dans useConcertDetails)
  const handleEdit = useCallback(() => {
    navigate(`/lieux/${id}/edit`); // Navigation vers LieuForm
  }, [navigate, id]);
  
  const handleCancel = useCallback(() => {
    navigate(`/lieux/${id}`); // Retour vers la vue
  }, [navigate, id]);
  
  // Pas de handleSave car l'édition se fait dans LieuForm
  const handleSave = useCallback(async (e) => {
    console.warn('[useLieuDetails] handleSave appelé mais l\'édition se fait dans LieuForm');
  }, []);
  
  // Fonctions additionnelles spécifiques aux lieux
  
  // Gestion du contact
  const handleContactChange = useCallback((newContact) => {
    if (!detailsHook?.setFormData) return;
    
    if (newContact) {
      detailsHook.setFormData(prev => ({
        ...prev,
        contactId: newContact.id,
        // Données du contact directement à la racine avec préfixe
        contactNom: newContact.nom,
        contactPrenom: newContact.prenom,
        contactFullName: `${newContact.prenom} ${newContact.nom}`.trim()
      }));
    } else {
      detailsHook.setFormData(prev => ({
        ...prev,
        contactId: null,
        // Réinitialiser les données du contact
        contactNom: null,
        contactPrenom: null,
        contactFullName: null
      }));
    }
  }, [detailsHook]);
  
  // Mise à jour des coordonnées géographiques
  const updateCoordinates = useCallback((lat, lng) => {
    if (!detailsHook?.handleChange) return;
    
    detailsHook.handleChange({
      target: {
        name: 'coordinates',
        value: { lat, lng }
      }
    });
  }, [detailsHook]);
  
  // Fonctions utilitaires pour la gestion d'équipements
  const addEquipement = useCallback((equipement) => {
    if (!detailsHook?.setFormData) return;
    
    detailsHook.setFormData(prev => ({
      ...prev,
      equipements: [...(prev?.equipements || []), equipement]
    }));
  }, [detailsHook]);
  
  const removeEquipement = useCallback((equipement) => {
    if (!detailsHook?.setFormData) return;
    
    detailsHook.setFormData(prev => ({
      ...prev,
      equipements: (prev?.equipements || []).filter(e => e !== equipement)
    }));
  }, [detailsHook]);
  
  // Fonction pour gérer la suppression
  const handleDeleteClick = useCallback(() => {
    if (detailsHook?.handleDelete) {
      detailsHook.handleDelete();
    }
  }, [detailsHook]);
  
  // Retourner l'API du hook (comme useConcertDetails)
  return {
    // Données principales
    lieu: detailsHook?.entity || null,
    contact: detailsHook?.relatedData?.contact || null,
    structure: detailsHook?.relatedData?.structure || null,
    concerts: detailsHook?.relatedData?.concerts || [],
    artistes: detailsHook?.relatedData?.artistes || [],
    loading: detailsHook?.loading || false,
    isLoading: detailsHook?.loading || false,
    isSubmitting: detailsHook?.isSubmitting || false,
    error: detailsHook?.error || null,
    
    // Données du formulaire
    formData: detailsHook?.formData || {},
    isEditMode,
    isDirty: detailsHook?.isDirty || false,
    hasChanges: detailsHook?.isDirty || false,
    errors: detailsHook?.errors || {},
    
    // États d'opérations
    isDeleting: detailsHook?.isDeleting || false,
    showDeleteModal: detailsHook?.showDeleteModal || false,
    
    // Données liées
    relatedData: detailsHook?.relatedData || {},
    loadingRelated: detailsHook?.loadingRelated || {},
    
    // Actions de base
    handleEdit,
    handleCancel,
    handleSave,
    handleChange: detailsHook?.handleChange || (() => {}),
    handleDeleteClick,
    handleCloseDeleteModal: detailsHook?.handleCancelDelete || (() => {}),
    handleConfirmDelete: detailsHook?.handleConfirmDelete || (() => {}),
    
    // Fonctions spécifiques aux lieux
    handleContactChange,
    updateCoordinates,
    addEquipement,
    removeEquipement,
    
    // Utilitaires
    formatDate,
    validateForm: validateLieuFormData,
    
    // Compatibilité avec l'ancien système - SUPPRIMÉ
    // Le système des lieux utilise maintenant la navigation vers des formulaires séparés
  };
};

export default useLieuDetails;