import { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/firebaseInit';

/**
 * Hook pour gérer les formulaires liés aux concerts
 * Gère l'envoi, le suivi et les réponses des formulaires
 */
export const useConcertForm = (concertId, programmateurId) => {
  const [formData, setFormData] = useState(null);
  const [showFormGenerator, setShowFormGenerator] = useState(false);
  const [generatedFormLink, setGeneratedFormLink] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  // Fonction pour déterminer le statut du formulaire
  const getFormDataStatus = () => {
    if (!formData) return null;
    
    if (formData.statut === 'valide') return 'validated';
    
    if (formData.programmateurData || (formData.data && Object.keys(formData.data).length > 0)) 
      return 'filled';
    
    return 'sent';
  };

  // Fonction pour gérer la génération réussie d'un formulaire
  const handleFormGenerated = async (formId, formUrl) => {
    // Stocker le lien généré
    setGeneratedFormLink(formUrl);
    
    // Mettre à jour le concert avec l'ID du formulaire
    try {
      await updateDoc(doc(db, 'concerts', concertId), {
        formId: formId
      });
      
      // Charger les données du formulaire
      await loadFormData(formId);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du concert:', error);
    }
  };

  // Fonction pour charger les données d'un formulaire
  const loadFormData = async (formId) => {
    try {
      setFormLoading(true);
      const formDoc = await getDoc(doc(db, 'formulaires', formId));
      if (formDoc.exists()) {
        setFormData({
          id: formDoc.id,
          ...formDoc.data()
        });
      }
    } catch (error) {
      console.error('Erreur lors du chargement du formulaire:', error);
    } finally {
      setFormLoading(false);
    }
  };

  // Fonction pour copier le lien dans le presse-papiers
  const copyToClipboard = (text) => {
    if (!navigator.clipboard) {
      // Fallback pour les anciens navigateurs
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      try {
        document.execCommand('copy');
        alert('Lien copié dans le presse-papiers !');
      } catch (err) {
        console.error('Erreur lors de la copie:', err);
      }
      
      document.body.removeChild(textArea);
      return;
    }
    
    navigator.clipboard.writeText(text)
      .then(() => {
        alert('Lien copié dans le presse-papiers !');
      })
      .catch(err => {
        console.error('Erreur lors de la copie dans le presse-papiers:', err);
      });
  };

  return {
    formData,
    formDataStatus: getFormDataStatus(),
    showFormGenerator,
    setShowFormGenerator,
    generatedFormLink,
    setGeneratedFormLink,
    handleFormGenerated,
    copyToClipboard,
    formLoading
  };
};

export default useConcertForm;