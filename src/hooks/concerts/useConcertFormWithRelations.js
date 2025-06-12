/**
 * Hook enrichi pour le formulaire de concert avec chargement des entités liées
 * Wrapper autour de useConcertForm qui ajoute le chargement automatique des relations
 */

import { useState, useEffect } from 'react';
import { doc, getDoc, db } from '@/services/firebase-service';
import useConcertForm from './useConcertForm';

/**
 * Hook pour gérer le formulaire de concert avec ses entités liées
 * @param {string} concertId - ID du concert ou 'nouveau' pour un nouveau concert
 * @returns {Object} - États et fonctions pour gérer le formulaire avec les entités liées
 */
export const useConcertFormWithRelations = (concertId) => {
  // Utiliser le hook de base
  const baseHook = useConcertForm(concertId);
  
  // États pour les entités liées
  const [lieu, setLieu] = useState(null);
  const [artiste, setArtiste] = useState(null);
  const [contacts, setContacts] = useState([]); // Changé en array pour multi-contacts
  const [structure, setStructure] = useState(null);
  const [loadingRelations, setLoadingRelations] = useState(false);
  
  // Charger les entités liées quand les IDs changent
  useEffect(() => {
    const loadRelatedEntities = async () => {
      if (!baseHook.formData) return;
      
      setLoadingRelations(true);
      
      try {
        // Charger le lieu
        if (baseHook.formData.lieuId) {
          const lieuDoc = await getDoc(doc(db, 'lieux', baseHook.formData.lieuId));
          if (lieuDoc.exists()) {
            setLieu({ id: lieuDoc.id, ...lieuDoc.data() });
          }
        } else {
          setLieu(null);
        }
        
        // Charger l'artiste
        if (baseHook.formData.artisteId) {
          const artisteDoc = await getDoc(doc(db, 'artistes', baseHook.formData.artisteId));
          if (artisteDoc.exists()) {
            setArtiste({ id: artisteDoc.id, ...artisteDoc.data() });
          }
        } else {
          setArtiste(null);
        }
        
        // Charger les contacts (multi-contacts)
        // Gérer la rétrocompatibilité : contactId (string) et contactIds (array)
        let contactIdsToLoad = [];
        
        if (baseHook.formData.contactIds && Array.isArray(baseHook.formData.contactIds)) {
          contactIdsToLoad = baseHook.formData.contactIds;
        } else if (baseHook.formData.contactId) {
          contactIdsToLoad = [baseHook.formData.contactId];
        }
        
        if (contactIdsToLoad.length > 0) {
          const contactPromises = contactIdsToLoad.map(async (contactId) => {
            const contactDoc = await getDoc(doc(db, 'contacts', contactId));
            if (contactDoc.exists()) {
              return { id: contactDoc.id, ...contactDoc.data() };
            }
            return null;
          });
          
          const loadedContacts = (await Promise.all(contactPromises)).filter(Boolean);
          setContacts(loadedContacts);
        } else {
          setContacts([]);
        }
        
        // Charger la structure
        if (baseHook.formData.structureId) {
          const structDoc = await getDoc(doc(db, 'structures', baseHook.formData.structureId));
          if (structDoc.exists()) {
            setStructure({ id: structDoc.id, ...structDoc.data() });
          }
        } else {
          setStructure(null);
        }
        
      } catch (error) {
        console.error('Erreur lors du chargement des entités liées:', error);
      } finally {
        setLoadingRelations(false);
      }
    };
    
    if (!baseHook.isNewConcert && baseHook.formData) {
      loadRelatedEntities();
    }
  }, [
    baseHook.formData?.lieuId, 
    baseHook.formData?.artisteId, 
    baseHook.formData?.contactId,
    baseHook.formData?.contactIds,  // Ajout pour multi-contacts
    baseHook.formData?.structureId,
    baseHook.isNewConcert,
    baseHook.formData
  ]);
  
  // Surcharger les méthodes de changement pour mettre à jour les entités
  const handleLieuChange = (newLieu) => {
    setLieu(newLieu);
    baseHook.handleLieuChange(newLieu);
  };
  
  const handleArtisteChange = (newArtiste) => {
    setArtiste(newArtiste);
    baseHook.handleArtisteChange(newArtiste);
  };
  
  // Gérer le changement de contacts (multi-contacts)
  const handleContactsChange = (contactIds) => {
    // Utiliser la méthode du hook de base
    baseHook.handleContactsChange(contactIds);
    
    // Mettre à jour l'état local des contacts si nécessaire
    // (sera rechargé automatiquement par l'effet)
  };
  
  // Garder handleContactChange pour rétrocompatibilité
  const handleContactChange = (newContact) => {
    if (newContact) {
      // Convertir en array pour le nouveau système
      handleContactsChange([newContact.id]);
    } else {
      handleContactsChange([]);
    }
  };
  
  const handleStructureChange = (newStructure) => {
    setStructure(newStructure);
    // Appeler la méthode de base si elle existe
    if (baseHook.handleStructureChange) {
      baseHook.handleStructureChange(newStructure);
    } else {
      // Sinon, mettre à jour manuellement
      baseHook.setFormData(prev => ({
        ...prev,
        structureId: newStructure?.id || null,
        structureNom: newStructure?.nom || newStructure?.raisonSociale || ''
      }));
    }
  };
  
  // Retourner le hook enrichi avec les entités liées
  return {
    ...baseHook,
    // Surcharger avec nos versions qui mettent à jour les états locaux
    handleLieuChange,
    handleArtisteChange,
    handleContactsChange,     // Nouveau : pour multi-contacts
    handleContactChange,      // Gardé pour rétrocompatibilité
    handleStructureChange,
    // Ajouter les entités liées
    lieu,
    artiste,
    contacts,                 // Array de contacts
    contact: contacts[0] || null,  // Rétrocompatibilité : premier contact
    structure,
    // Ajouter l'état de chargement des relations
    loading: baseHook.loading || loadingRelations
  };
};

export default useConcertFormWithRelations; 