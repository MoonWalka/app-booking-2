import { useState, useEffect, useCallback } from 'react'; // NOUVEAU: useEffect et useCallback utilisés pour synchronisation automatique et stabilisation
import { collection, query, where, doc, getDoc, getDocs, updateDoc, db } from '@/firebaseInit';

/**
 * Hook pour gérer les formulaires professionnels envoyés aux programmateurs
 * Différent de useConcertSubmission qui gère le formulaire principal du concert
 *
 * Ce hook s'occupe spécifiquement de :
 * - La récupération des formulaires associés à un concert existant
 * - La gestion du statut de ces formulaires (envoyé, validé, etc.)
 * - La génération de nouveaux formulaires pour les programmateurs
 * - NOUVEAU: Synchronisation automatique et surveillance des changements
 */
const useConcertFormsManagement = (concertId) => {
  // États pour les données du formulaire
  const [formData, setFormData] = useState(null);
  const [formDataStatus, setFormDataStatus] = useState({
    exists: false,
    isValidated: false,
    hasData: false,
    completionRate: 0, // NOUVEAU: Taux de completion
    missingFields: [], // NOUVEAU: Champs manquants
    validationErrors: [], // NOUVEAU: Erreurs de validation
    lastUpdate: null, // NOUVEAU: Dernière mise à jour
    submissionStatus: 'pending' // NOUVEAU: Statut de soumission
  });
  const [showFormGenerator, setShowFormGenerator] = useState(false);
  const [generatedFormLink, setGeneratedFormLink] = useState(null);
  const [isLoading, setIsLoading] = useState(false); // NOUVEAU: État de chargement
  const [lastSyncTime, setLastSyncTime] = useState(null); // NOUVEAU: Dernière synchronisation

  // NOUVEAU: Fonction pour analyser les données du formulaire - Stabilisée avec useCallback
  const analyzeFormData = useCallback((data) => {
    const requiredFields = ['programmateurNom', 'programmateurEmail', 'lieuNom', 'date'];
    const optionalFields = ['description', 'montant', 'conditions'];
    
    let completedFields = 0;
    const missingFields = [];
    const validationErrors = [];
    
    // Analyser les champs requis
    requiredFields.forEach(field => {
      const value = data.programmateurData?.[field] || data.data?.[field];
      if (value && value.toString().trim()) {
        completedFields++;
      } else {
        missingFields.push(field);
      }
    });
    
    // Analyser les champs optionnels
    optionalFields.forEach(field => {
      const value = data.programmateurData?.[field] || data.data?.[field];
      if (value && value.toString().trim()) {
        completedFields++;
      }
    });
    
    // Validation spécifique
    const email = data.programmateurData?.programmateurEmail || data.data?.programmateurEmail;
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      validationErrors.push('Email invalide');
    }
    
    const totalFields = requiredFields.length + optionalFields.length;
    const completionRate = Math.round((completedFields / totalFields) * 100);
    
    return {
      completionRate,
      missingFields,
      validationErrors
    };
  }, []);

  // NOUVEAU: Fonction pour déterminer le statut de soumission - Stabilisée avec useCallback
  const determineSubmissionStatus = useCallback((data, analysis) => {
    if (data.status === 'validated') return 'validated';
    if (analysis.validationErrors.length > 0) return 'errors';
    if (analysis.completionRate === 100) return 'complete';
    if (analysis.completionRate > 0) return 'partial';
    return 'pending';
  }, []);

  // Mise à jour des états liés au formulaire - Stabilisée avec useCallback
  const updateFormDataState = useCallback((formDoc) => {
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
  }, []);

  // Récupération des données du formulaire associé - Stabilisée avec useCallback
  const fetchFormData = useCallback(async (concertData) => {
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
  }, [concertId, updateFormDataState]);

  // NOUVEAU: Effet pour la synchronisation automatique initiale
  useEffect(() => {
    if (concertId) {
      console.log(`[SYNC] Initialisation de la synchronisation pour concert ${concertId}`);
      setIsLoading(true);
      
      // Charger les données initiales
      const initializeFormData = async () => {
        try {
          // Récupérer d'abord les données du concert
          const concertDoc = await getDoc(doc(db, 'concerts', concertId));
          if (concertDoc.exists()) {
            await fetchFormData(concertDoc.data());
          }
          setLastSyncTime(new Date().toISOString());
        } catch (error) {
          console.error('[SYNC] Erreur lors de l\'initialisation:', error);
        } finally {
          setIsLoading(false);
        }
      };
      
      initializeFormData();
    }
  }, [concertId, fetchFormData]);

  // NOUVEAU: Effet pour la surveillance des changements de formulaire
  useEffect(() => {
    if (formData) {
      console.log(`[SYNC] Analyse des données du formulaire ${formData.id}`);
      
      // Calculer le taux de completion et analyser les données
      const analysisResult = analyzeFormData(formData);
      
      setFormDataStatus(prev => ({
        ...prev,
        completionRate: analysisResult.completionRate,
        missingFields: analysisResult.missingFields,
        validationErrors: analysisResult.validationErrors,
        lastUpdate: formData.updatedAt || formData.createdAt,
        submissionStatus: determineSubmissionStatus(formData, analysisResult)
      }));
      
      // NOUVEAU: Émettre un événement de changement pour les autres composants
      try {
        const changeEvent = new CustomEvent('formDataChanged', {
          detail: {
            concertId,
            formId: formData.id,
            status: formData.status,
            completionRate: analysisResult.completionRate,
            timestamp: Date.now()
          }
        });
        window.dispatchEvent(changeEvent);
      } catch (error) {
        console.warn('[SYNC] Erreur lors de l\'émission de l\'événement:', error);
      }
    }
  }, [formData, concertId, analyzeFormData, determineSubmissionStatus]);

  // NOUVEAU: Fonction de synchronisation manuelle
  const syncFormData = async () => {
    if (!concertId) return;
    
    setIsLoading(true);
    try {
      const concertDoc = await getDoc(doc(db, 'concerts', concertId));
      if (concertDoc.exists()) {
        await fetchFormData(concertDoc.data());
        setLastSyncTime(new Date().toISOString());
        console.log(`[SYNC] Synchronisation manuelle terminée pour concert ${concertId}`);
      }
    } catch (error) {
      console.error('[SYNC] Erreur lors de la synchronisation manuelle:', error);
    } finally {
      setIsLoading(false);
    }
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
    validateForm,
    // NOUVEAU: Fonctions et données de synchronisation
    syncFormData,
    isLoading,
    lastSyncTime,
    analyzeFormData
  };
};

export default useConcertFormsManagement; 