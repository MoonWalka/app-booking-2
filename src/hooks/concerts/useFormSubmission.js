import { useState } from 'react';
import { db } from '../../firebaseInit';
import {
  doc, setDoc, updateDoc, deleteDoc, collection,
  getDoc, arrayUnion, arrayRemove
} from 'firebase/firestore';

/**
 * Hook personnalisé pour gérer la soumission et suppression des concerts
 * 
 * @param {string} id - Identifiant du concert (ou 'nouveau')
 * @param {Object} formData - Données du formulaire
 * @param {Function} navigate - Fonction de navigation
 * @param {Object} selectedEntities - Les entités sélectionnées (lieu, programmateur, artiste)
 * @returns {Object} États et fonctions pour gérer la soumission du formulaire
 */
const useFormSubmission = (id, formData, navigate, selectedEntities) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const {
    selectedLieu,
    selectedProgrammateur,
    selectedArtiste,
    initialProgrammateurId,
    initialArtisteId
  } = selectedEntities;
  
  // Fonction pour valider le formulaire
  const validateForm = () => {
    if (!formData.date) return false;
    if (!formData.montant) return false;
    if (!selectedLieu) return false;
    return true;
  };
  
  // Fonction pour mettre à jour l'association entre le programmateur et le concert
  const updateProgrammateurAssociation = async (concertId, concertData, newProgrammateurId, oldProgrammateurId) => {
    try {
      // Si l'ancien programmateur est différent du nouveau, supprimer l'association
      if (oldProgrammateurId && oldProgrammateurId !== newProgrammateurId) {
        const oldProgRef = doc(db, 'programmateurs', oldProgrammateurId);
        await updateDoc(oldProgRef, {
          concertIds: arrayRemove(concertId)
        });
        console.log(`Association supprimée avec l'ancien programmateur ${oldProgrammateurId}`);
      }
      
      // Si un nouveau programmateur est sélectionné, créer l'association
      if (newProgrammateurId) {
        const progRef = doc(db, 'programmateurs', newProgrammateurId);
        const progDoc = await getDoc(progRef);
        
        if (progDoc.exists()) {
          // Vérifier si l'association existe déjà
          const progData = progDoc.data();
          const concertIds = progData.concertIds || [];
          
          if (!concertIds.includes(concertId)) {
            await updateDoc(progRef, {
              concertIds: arrayUnion(concertId),
              updatedAt: new Date().toISOString()
            });
            console.log(`Association créée avec le programmateur ${newProgrammateurId}`);
          }
        }
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour des associations programmateur-concert:', error);
      throw error;
    }
  };
  
  // Fonction pour mettre à jour l'association entre l'artiste et le concert
  const updateArtisteAssociation = async (concertId, concertData, newArtisteId, oldArtisteId) => {
    try {
      // Si l'ancien artiste est différent du nouveau, supprimer l'association
      if (oldArtisteId && oldArtisteId !== newArtisteId) {
        const oldArtisteRef = doc(db, 'artistes', oldArtisteId);
        await updateDoc(oldArtisteRef, {
          concertIds: arrayRemove(concertId)
        });
        console.log(`Association supprimée avec l'ancien artiste ${oldArtisteId}`);
      }
      
      // Si un nouvel artiste est sélectionné, créer l'association
      if (newArtisteId) {
        const artisteRef = doc(db, 'artistes', newArtisteId);
        const artisteDoc = await getDoc(artisteRef);
        
        if (artisteDoc.exists()) {
          // Vérifier si l'association existe déjà
          const artisteData = artisteDoc.data();
          const concertIds = artisteData.concertIds || [];
          
          if (!concertIds.includes(concertId)) {
            await updateDoc(artisteRef, {
              concertIds: arrayUnion(concertId),
              updatedAt: new Date().toISOString()
            });
            console.log(`Association créée avec l'artiste ${newArtisteId}`);
          }
        }
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour des associations artiste-concert:', error);
      throw error;
    }
  };
  
  // Fonction de soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Valider le formulaire
    if (!validateForm()) {
      alert('Veuillez remplir tous les champs obligatoires (date, montant, lieu).');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Préparer les données du concert
      const concertData = {
        ...formData,
        
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
        
        updatedAt: new Date().toISOString()
      };
      
      let concertId = id;
      
      // Créer ou mettre à jour le concert
      if (id && id !== 'nouveau') {
        // Mise à jour d'un concert existant
        const concertRef = doc(db, 'concerts', id);
        await updateDoc(concertRef, concertData);
        console.log('Concert mis à jour:', id);
      } else {
        // Création d'un nouveau concert
        concertData.createdAt = new Date().toISOString();
        const newConcertRef = doc(collection(db, 'concerts'));
        concertId = newConcertRef.id;
        await setDoc(newConcertRef, concertData);
        console.log('Nouveau concert créé:', concertId);
      }
      
      // Mettre à jour les associations bidirectionnelles
      if (selectedProgrammateur?.id || initialProgrammateurId) {
        await updateProgrammateurAssociation(
          concertId,
          concertData,
          selectedProgrammateur?.id || null,
          initialProgrammateurId
        );
      }
      
      if (selectedArtiste?.id || initialArtisteId) {
        await updateArtisteAssociation(
          concertId,
          concertData,
          selectedArtiste?.id || null,
          initialArtisteId
        );
      }
      
      // Redirection vers la liste des concerts
      navigate('/concerts');
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement du concert:', error);
      alert('Une erreur est survenue lors de l\'enregistrement du concert.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Fonction pour supprimer un concert
  const handleDelete = async () => {
    if (id === 'nouveau') {
      navigate('/concerts');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Supprimer les associations avec le programmateur
      if (selectedProgrammateur?.id) {
        const progRef = doc(db, 'programmateurs', selectedProgrammateur.id);
        await updateDoc(progRef, {
          concertIds: arrayRemove(id)
        });
        console.log(`Association supprimée avec le programmateur ${selectedProgrammateur.id}`);
      }
      
      // Supprimer les associations avec l'artiste
      if (selectedArtiste?.id) {
        const artisteRef = doc(db, 'artistes', selectedArtiste.id);
        await updateDoc(artisteRef, {
          concertIds: arrayRemove(id)
        });
        console.log(`Association supprimée avec l'artiste ${selectedArtiste.id}`);
      }
      
      // Supprimer le concert
      await deleteDoc(doc(db, 'concerts', id));
      console.log('Concert supprimé:', id);
      
      // Redirection vers la liste des concerts
      navigate('/concerts');
    } catch (error) {
      console.error('Erreur lors de la suppression du concert:', error);
      alert('Une erreur est survenue lors de la suppression du concert.');
    } finally {
      setIsSubmitting(false);
      setShowDeleteConfirm(false);
    }
  };
  
  return {
    isSubmitting,
    showDeleteConfirm,
    setShowDeleteConfirm,
    validateForm,
    handleSubmit,
    handleDelete
  };
};

export default useFormSubmission;
