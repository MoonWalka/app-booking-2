// src/hooks/concerts/useConcertDetailsWithRoles.js
import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { doc, getDoc, db } from '@/services/firebase-service';

// Import du hook générique
import { useGenericEntityDetails } from '@/hooks/common';

// Import des hooks personnalisés spécifiques aux concerts
import useConcertDetails from '@/hooks/concerts/useConcertDetails';

/**
 * Version améliorée de useConcertDetails qui gère les contacts avec rôles
 * 
 * @param {string} id - ID du concert
 * @param {object} locationParam - Paramètre de location (optionnel)
 * @returns {object} - API du hook enrichie avec les contacts multiples
 */
const useConcertDetailsWithRoles = (id, locationParam) => {
  
  // État pour les contacts avec rôles
  const [contactsWithRoles, setContactsWithRoles] = useState([]);
  
  // Utiliser le hook original
  const originalHookResult = useConcertDetails(id, locationParam);
  
  // Références stables (conservée pour future utilisation)
  // eslint-disable-next-line no-unused-vars
  const loadingContactsRef = useRef(false);
  
  // Configuration étendue pour les relations
  const extendedRelatedEntities = useMemo(() => {
    const baseEntities = [
      {
        name: 'contact',
        collection: 'contacts',
        idField: 'contactIds', // Format migré
        type: 'one-to-many',
        essential: true,
        loadRelated: false
      },
      {
        name: 'lieu',
        collection: 'lieux',
        idField: 'lieuId',
        type: 'one-to-many',
        essential: true,
        loadRelated: false
      },
      {
        name: 'artiste',
        collection: 'artistes',
        idField: 'artisteId',
        type: 'one-to-many',
        essential: false,
        loadRelated: false
      },
      {
        name: 'structure',
        collection: 'structures',
        idField: 'structureId',
        type: 'one-to-many',
        essential: false,
        loadRelated: false,
        customQuery: originalHookResult.customQueries?.structure
      },
      // NOUVEAU : Gérer les contacts avec rôles
      {
        name: 'contactsWithRoles',
        collection: 'contacts',
        idField: 'contactsWithRoles',
        type: 'custom',
        essential: false,
        loadRelated: false,
        customQuery: async (concertData) => {
          console.log('👥 Chargement des contacts avec rôles');
          
          // Nouveau: utiliser contactIds (format migré) avec fallback vers contactId
          let contactsToLoad = [];
          
          if (concertData.contactIds && Array.isArray(concertData.contactIds)) {
            // Nouveau format: charger tous les contacts de contactIds
            contactsToLoad = concertData.contactIds.map(id => ({ contactId: id, role: 'contact', isPrincipal: false }));
            if (contactsToLoad.length > 0) {
              contactsToLoad[0].isPrincipal = true;
              contactsToLoad[0].role = 'coordinateur';
            }
          } else if (concertData.contactId) {
            // Fallback: ancien format contactId
            contactsToLoad = [{ contactId: concertData.contactId, role: 'coordinateur', isPrincipal: true }];
          }
          
          if (contactsToLoad.length === 0) {
            return [];
          }
          
          // Charger tous les contacts
          const contacts = [];
          for (const contactRef of contactsToLoad) {
            try {
              const contactDoc = await getDoc(doc(db, 'contacts', contactRef.contactId));
              if (contactDoc.exists()) {
                contacts.push({
                  ...contactDoc.data(),
                  id: contactDoc.id,
                  role: contactRef.role || 'contact',
                  isPrincipal: contactRef.isPrincipal || false,
                  addedAt: contactRef.addedAt || null
                });
              }
            } catch (err) {
              console.error(`Erreur chargement contact ${contactRef.contactId}:`, err);
            }
          }
          
          // Trier : principal d'abord, puis par rôle
          return contacts.sort((a, b) => {
            if (a.isPrincipal && !b.isPrincipal) return -1;
            if (!a.isPrincipal && b.isPrincipal) return 1;
            return 0;
          });
        }
      }
    ];
    
    return baseEntities;
  }, [originalHookResult.customQueries]);

  // Utiliser le hook générique avec la configuration étendue
  const genericHookResult = useGenericEntityDetails({
    entityId: id,
    entityType: 'concert',
    relatedEntities: extendedRelatedEntities,
    transformData: originalHookResult.transformData,
    validateForm: originalHookResult.validateForm,
    formatValue: originalHookResult.formatValue,
    onSaveSuccess: originalHookResult.handleSaveSuccess,
    onDeleteSuccess: originalHookResult.handleDeleteSuccess,
    computedFields: originalHookResult.computedFields
  });

  // Mettre à jour les contacts avec rôles quand ils sont chargés
  useEffect(() => {
    if (genericHookResult.relatedData?.contactsWithRoles) {
      setContactsWithRoles(genericHookResult.relatedData.contactsWithRoles);
    }
  }, [genericHookResult.relatedData?.contactsWithRoles]);

  // Fonction pour obtenir un contact par rôle
  const getContactByRole = useCallback((role) => {
    return contactsWithRoles.find(c => c.role === role);
  }, [contactsWithRoles]);

  // Fonction pour obtenir tous les contacts d'un rôle
  const getContactsByRole = useCallback((role) => {
    return contactsWithRoles.filter(c => c.role === role);
  }, [contactsWithRoles]);

  // Fonction pour obtenir le contact principal
  const getPrincipalContact = useCallback(() => {
    return contactsWithRoles.find(c => c.isPrincipal) || contactsWithRoles[0];
  }, [contactsWithRoles]);

  // Fonction pour obtenir les libellés de rôles
  const getRoleLabel = useCallback((role) => {
    const roleLabels = {
      coordinateur: 'Coordinateur',
      signataire: 'Signataire',
      technique: 'Technique',
      administratif: 'Administratif',
      commercial: 'Commercial',
      production: 'Production',
      communication: 'Communication',
      autre: 'Autre'
    };
    return roleLabels[role] || role;
  }, []);

  // Combiner tous les contacts pour l'affichage
  const allContacts = useMemo(() => {
    const contacts = [];
    
    // Ajouter le contact principal (compatibilité)
    if (genericHookResult.relatedData?.contact && !contactsWithRoles.find(c => c.id === genericHookResult.relatedData.contact.id)) {
      contacts.push({
        ...genericHookResult.relatedData.contact,
        role: 'coordinateur',
        isPrincipal: true
      });
    }
    
    // Ajouter tous les contacts avec rôles
    contacts.push(...contactsWithRoles);
    
    // Dédupliquer par ID
    const uniqueContacts = contacts.reduce((acc, contact) => {
      if (!acc.find(c => c.id === contact.id)) {
        acc.push(contact);
      }
      return acc;
    }, []);
    
    return uniqueContacts;
  }, [genericHookResult.relatedData?.contact, contactsWithRoles]);

  // Retourner l'API enrichie
  return {
    // Toutes les propriétés du hook original
    ...genericHookResult,
    
    // Propriétés étendues pour les contacts avec rôles
    contactsWithRoles,
    allContacts,
    getContactByRole,
    getContactsByRole,
    getPrincipalContact,
    getRoleLabel,
    
    // Indicateurs
    hasMultipleContacts: allContacts.length > 1,
    hasSignataire: !!getContactByRole('signataire'),
    
    // Pour la compatibilité, garder contact comme le principal
    contact: getPrincipalContact() || genericHookResult.relatedData?.contact
  };
};

export default useConcertDetailsWithRoles;