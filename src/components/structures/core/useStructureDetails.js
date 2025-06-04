// src/components/structures/core/useStructureDetails.js
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  doc, 
  getDoc, 
  updateDoc, 
  deleteDoc 
} from 'firebase/firestore';
import { db } from '@/services/firebase-service';

/**
 * Hook contenant la logique partagée pour l'affichage et la gestion des détails d'une structure
 * Utilisable à la fois par les versions desktop et mobile
 * 
 * @param {string} id - Identifiant de la structure à afficher
 * @returns {Object} - États et fonctions pour gérer les détails de structure
 */
export const useStructureDetailsCore = (id) => {
  const navigate = useNavigate();
  const [structure, setStructure] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [loadingContacts, setLoadingContacts] = useState(false);
  
  // Chargement des données de la structure
  useEffect(() => {
    const fetchStructure = async () => {
      setLoading(true);
      try {
        const structureDoc = await getDoc(doc(db, 'structures', id));
        if (structureDoc.exists()) {
          const structureData = {
            id: structureDoc.id,
            ...structureDoc.data()
          };
          setStructure(structureData);
          
          // Charger les contacts associés si nécessaire
          if (structureData.contactsAssocies?.length > 0) {
            fetchContacts(structureData.contactsAssocies);
          }
        } else {
          setError('Structure non trouvée');
          navigate('/structures');
        }
      } catch (error) {
        console.error('Erreur lors du chargement de la structure:', error);
        setError('Une erreur est survenue lors du chargement des données');
      } finally {
        setLoading(false);
      }
    };

    fetchStructure();
  }, [id, navigate]);

  // Chargement des contacts associés
  const fetchContacts = async (contactsIds) => {
    setLoadingContacts(true);
    try {
      const contactsData = [];
      
      for (const progId of contactsIds) {
        const progDoc = await getDoc(doc(db, 'contacts', progId));
        if (progDoc.exists()) {
          contactsData.push({
            id: progDoc.id,
            ...progDoc.data()
          });
        }
      }
      
      setContacts(contactsData);
    } catch (error) {
      console.error('Erreur lors du chargement des contacts:', error);
    } finally {
      setLoadingContacts(false);
    }
  };

  // Formatage des valeurs pour l'affichage
  const formatValue = useCallback((value) => {
    if (value === undefined || value === null || value === '') {
      return 'Non spécifié';
    }
    return value;
  }, []);

  // Gestion de la suppression
  const handleDelete = async () => {
    setDeleting(true);
    try {
      // Vérifier s'il y a des associations avec des contacts
      if (structure.contactsAssocies?.length > 0) {
        // Mise à jour des contacts pour retirer la référence à cette structure
        for (const progId of structure.contactsAssocies) {
          const progRef = doc(db, 'contacts', progId);
          const progDoc = await getDoc(progRef);
          
          if (progDoc.exists()) {
            const progData = progDoc.data();
            
            // Si le contact a une structureId correspondant à cette structure,
            // mettre à jour pour enlever cette référence
            if (progData.structureId === id) {
              await updateDoc(progRef, {
                structureId: null,
                structureNom: null,
                updatedAt: new Date()
              });
            }
          }
        }
      }
      
      // Supprimer la structure
      await deleteDoc(doc(db, 'structures', id));
      navigate('/structures');
    } catch (error) {
      console.error('Erreur lors de la suppression de la structure:', error);
      setError('Une erreur est survenue lors de la suppression');
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  // Fonction pour obtenir le libellé correspondant au type de structure
  const getTypeLabel = useCallback((type) => {
    switch (type) {
      case 'association':
        return 'Association';
      case 'entreprise':
        return 'Entreprise';
      case 'administration':
        return 'Administration';
      case 'collectivite':
        return 'Collectivité';
      default:
        return 'Autre';
    }
  }, []);

  // Fonctions pour la navigation
  const navigateToEdit = useCallback(() => {
    navigate(`/structures/${id}/edit`);
  }, [navigate, id]);

  const navigateToList = useCallback(() => {
    navigate('/structures');
  }, [navigate]);

  return {
    // États
    structure,
    loading,
    error,
    showDeleteModal,
    setShowDeleteModal,
    deleting,
    contacts,
    loadingContacts,
    
    // Fonctions utilitaires
    formatValue,
    getTypeLabel,
    
    // Actions
    handleDelete,
    navigateToEdit,
    navigateToList
  };
};

export default useStructureDetailsCore;