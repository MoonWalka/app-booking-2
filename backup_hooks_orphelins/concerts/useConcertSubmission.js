// src/hooks/concerts/useConcertSubmission.js
import { useNavigate } from 'react-router-dom';
import useFormSubmission from '@/hooks/forms/useFormSubmission';

/**
 * Hook spécifique pour gérer la soumission des formulaires de concerts
 * @param {string} concertId - ID du concert (ou 'nouveau')
 * @param {Object} formData - Données du formulaire de concert
 * @param {Object} selectedEntities - Entités sélectionnées (lieu, programmateur, artiste)
 * @returns {Object} - États et fonctions pour gérer la soumission du formulaire de concert
 */
const useConcertSubmission = (concertId, formData, selectedEntities) => {
  const navigate = useNavigate();
  const {
    selectedLieu,
    selectedProgrammateur,
    selectedArtiste,
    initialProgrammateurId,
    initialArtisteId,
    initialLieuId
  } = selectedEntities;

  // Configuration des associations bidirectionnelles
  const associations = {
    programmateur: {
      targetCollection: 'programmateurs',
      targetField: 'concertIds',
      sourceField: 'programmateurId',
      oldValue: initialProgrammateurId,
      newValue: selectedProgrammateur?.id
    },
    artiste: {
      targetCollection: 'artistes',
      targetField: 'concertIds',
      sourceField: 'artisteId',
      oldValue: initialArtisteId,
      newValue: selectedArtiste?.id
    }
  };
  
  // Utiliser le hook générique
  const formSubmission = useFormSubmission({
    collection: 'concerts',
    onSuccess: () => navigate('/concerts'),
    onError: (error) => console.error('Erreur lors de la gestion du concert:', error),
    
    // Validation spécifique aux concerts
    validate: (data) => {
      if (!data.date) return false;
      if (!data.montant) return false;
      if (!selectedLieu) return false;
      return true;
    },
    
    // Transformation des données spécifique aux concerts
    transformData: (data) => {
      return {
        ...data,
        // Lieu
        lieuId: selectedLieu?.id || null,
        lieuNom: selectedLieu?.nom || null,
        lieuAdresse: selectedLieu?.adresse || null,
        lieuCodePostal: selectedLieu?.codePostal || null,
        lieuVille: selectedLieu?.ville || null,
        lieuCapacite: selectedLieu?.capacite || null,
        
        // Programmateur
        programmateurId: selectedProgrammateur?.id || null,
        programmateurNom: selectedProgrammateur?.nom || null,
        
        // Artiste
        artisteId: selectedArtiste?.id || null,
        artisteNom: selectedArtiste?.nom || null,
      };
    },
    
    // Configuration des associations
    associations,
    
    // Hooks de cycle de vie
    beforeDelete: async (id) => {
      console.log(`Préparation à la suppression du concert ${id}...`);
    },
    
    // Émettre un événement après la sauvegarde pour déclencher le rafraîchissement de la liste
    afterSubmit: async (id, data) => {
      try {
        const event = new CustomEvent('concertUpdated', { 
          detail: { id, data, timestamp: Date.now() } 
        });
        window.dispatchEvent(event);
        console.log(`Événement concertUpdated émis pour le concert ${id}`);
      } catch (e) {
        console.warn('Impossible d\'émettre l\'événement de mise à jour', e);
      }
    },
    
    // Émettre un événement après la suppression
    afterDelete: async (id) => {
      try {
        const event = new CustomEvent('concertUpdated', { 
          detail: { id, deleted: true, timestamp: Date.now() } 
        });
        window.dispatchEvent(event);
        console.log(`Événement concertUpdated (suppression) émis pour le concert ${id}`);
      } catch (e) {
        console.warn('Impossible d\'émettre l\'événement de suppression', e);
      }
    }
  });
  
  // Adapter la fonction de soumission pour le formulaire de concert
  const handleSubmit = (e) => {
    e.preventDefault();
    const id = concertId !== 'nouveau' ? concertId : null;
    formSubmission.submitToFirestore(formData, id);
  };
  
  return {
    ...formSubmission,
    handleSubmit
  };
};

export default useConcertSubmission;