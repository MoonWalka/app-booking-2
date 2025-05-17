import { useState, useEffect } from 'react';
import { collection, query, where, doc, getDoc, getDocs, updateDoc, db } from '@/firebaseInit';

/**
 * Hook pour gérer les formulaires professionnels envoyés aux programmateurs
 * Différent de useConcertSubmission qui gère le formulaire principal du concert
 *
 * Ce hook s'occupe spécifiquement de :
 * - La récupération des formulaires associés à un concert existant
 * - La gestion du statut de ces formulaires (envoyé, validé, etc.)
 * - La génération de nouveaux formulaires pour les programmateurs
 */
const useConcertFormsManagement = (concertId) => {
  // États pour les données du formulaire
  const [formData, setFormData] = useState(null);
  const [formDataStatus, setFormDataStatus] = useState({
    exists: false,
    isValidated: false,
    hasData: false
  });
  const [showFormGenerator, setShowFormGenerator] = useState(false);
  const [generatedFormLink, setGeneratedFormLink] = useState(null);

  // Récupération des données du formulaire associé
  const fetchFormData = async (concertData) => {
    try {
      if (!concertData) return;
      
      if (concertData.formId) {
        // Cas 1: Le concert a un formId référencé
        const formDoc = await getDoc(doc(db, 'formulaires', concertData.formId));
        if (formDoc.exists()) {
          updateFormDataState(formDoc);
        }
      } else {
        // Cas 2: Recherche d'un formulaire associé au concert par son ID
        const formsQuery = query(
          collection(db, 'formulaires'), 
          where('concertId', '==', concertId)
        );
        const formsSnapshot = await getDocs(formsQuery);
        
        if (!formsSnapshot.empty) {
          const formDoc = formsSnapshot.docs[0];
          updateFormDataState(formDoc);
          
          // Mise à jour du concert avec l'ID du formulaire
          await updateDoc(doc(db, 'concerts', concertId), {
            formId: formDoc.id
          });
        }
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des données du formulaire:', error);
    }
  };

  // Mise à jour des états liés au formulaire
  const updateFormDataState = (formDoc) => {
    const formDataObj = {
      id: formDoc.id,
      ...formDoc.data()
    };
    setFormData(formDataObj);
    
    // Déterminer si le formulaire contient des données
    const hasData = formDataObj.programmateurData || 
      (formDataObj.data && Object.keys(formDataObj.data).length > 0);
    
    setFormDataStatus({
      exists: true,
      isValidated: formDataObj.status === 'validated',
      hasData: hasData
    });
  };

  // Gestionnaire pour le formulaire généré
  const handleFormGenerated = async (formId, formUrl) => {
    console.log('Formulaire généré:', formId, formUrl);
    
    // Stocker le lien généré
    setGeneratedFormLink(formUrl);
    
    // Mettre à jour le concert avec l'ID du formulaire
    try {
      await updateDoc(doc(db, 'concerts', concertId), {
        formId: formId
      });
      
      // Recharger les données du formulaire
      const formDoc = await getDoc(doc(db, 'formulaires', formId));
      if (formDoc.exists()) {
        updateFormDataState(formDoc);
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du concert:', error);
    }
  };

  // Valider un formulaire rempli par le programmateur
  const validateForm = async () => {
    if (!formData) return false;
    
    try {
      await updateDoc(doc(db, 'formulaires', formData.id), {
        status: 'validated',
        validatedAt: new Date().toISOString()
      });
      
      // Mettre à jour l'état local
      setFormData(prev => ({
        ...prev,
        status: 'validated',
        validatedAt: new Date().toISOString()
      }));
      
      setFormDataStatus(prev => ({
        ...prev,
        isValidated: true
      }));
      
      return true;
    } catch (error) {
      console.error('Erreur lors de la validation du formulaire:', error);
      return false;
    }
  };

  return {
    fetchFormData,
    formData,
    formDataStatus,
    showFormGenerator,
    setShowFormGenerator,
    generatedFormLink,
    setGeneratedFormLink,
    handleFormGenerated,
    validateForm
  };
};

export default useConcertFormsManagement;