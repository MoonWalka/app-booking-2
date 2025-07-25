import { useState, useEffect, useCallback } from 'react'; // NOUVEAU: useEffect et useCallback utilisés pour synchronisation automatique et stabilisation
import { collection, query, where, doc, getDoc, getDocs, updateDoc, db } from '@/services/firebase-service';

/**
 * Hook pour gérer les formulaires professionnels envoyés aux contacts
 * Gère spécifiquement les formulaires associés aux dates existants
 *
 * Ce hook s'occupe spécifiquement de :
 * - La récupération des formulaires associés à un date existant
 * - La gestion du statut de ces formulaires (envoyé, validé, etc.)
 * - La génération de nouveaux formulaires pour les contacts
 * - NOUVEAU: Synchronisation automatique et surveillance des changements
 */
const useDateFormsManagement = (dateId) => {
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
    const requiredFields = ['contactNom', 'contactEmail', 'lieuNom', 'date'];
    const optionalFields = ['description', 'montant', 'conditions'];
    
    let completedFields = 0;
    const missingFields = [];
    const validationErrors = [];
    
    // Analyser les champs requis
    requiredFields.forEach(field => {
      const value = data.contactData?.[field] || data.data?.[field];
      if (value && value.toString().trim()) {
        completedFields++;
      } else {
        missingFields.push(field);
      }
    });
    
    // Analyser les champs optionnels
    optionalFields.forEach(field => {
      const value = data.contactData?.[field] || data.data?.[field];
      if (value && value.toString().trim()) {
        completedFields++;
      }
    });
    
    // Validation spécifique
    const email = data.contactData?.contactEmail || data.data?.contactEmail;
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
    const hasData = formDataObj.contactData || 
      (formDataObj.data && Object.keys(formDataObj.data).length > 0);
    
    setFormDataStatus({
      exists: true,
      isValidated: formDataObj.status === 'validated',
      hasData: hasData
    });
  }, []);

  // Récupération des données du formulaire associé - Stabilisée avec useCallback
  const fetchFormData = useCallback(async (dateData) => {
    try {
      if (!dateData) return;
      
      if (dateData.formId) {
        // Cas 1: Le date a un formId référencé
        const formDoc = await getDoc(doc(db, 'formulaires', dateData.formId));
        if (formDoc.exists()) {
          updateFormDataState(formDoc);
        }
      } else {
        // Cas 2: Recherche d'un formulaire associé au date par son ID
        const formsQuery = query(
          collection(db, 'formulaires'), 
          where('dateId', '==', dateId)
        );
        const formsSnapshot = await getDocs(formsQuery);
        
        if (!formsSnapshot.empty) {
          const formDoc = formsSnapshot.docs[0];
          updateFormDataState(formDoc);
          
          // Mise à jour du date avec l'ID du formulaire
          await updateDoc(doc(db, 'dates', dateId), {
            formId: formDoc.id
          });
        }
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des données du formulaire:', error);
    }
  }, [dateId, updateFormDataState]);

  // NOUVEAU: Effet pour la synchronisation automatique initiale
  useEffect(() => {
    if (dateId) {
      setIsLoading(true);
      
      // Charger les données initiales
      const initializeFormData = async () => {
        try {
          // Récupérer d'abord les données du date
          const dateDoc = await getDoc(doc(db, 'dates', dateId));
          if (dateDoc.exists()) {
            await fetchFormData(dateDoc.data());
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
  }, [dateId, fetchFormData]);

  // NOUVEAU: Effet pour la surveillance des changements de formulaire
  useEffect(() => {
    if (formData) {
      
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
            dateId,
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
  }, [formData, dateId, analyzeFormData, determineSubmissionStatus]);

  // NOUVEAU: Fonction de synchronisation manuelle
  const syncFormData = async () => {
    if (!dateId) return;
    
    setIsLoading(true);
    try {
      const dateDoc = await getDoc(doc(db, 'dates', dateId));
      if (dateDoc.exists()) {
        await fetchFormData(dateDoc.data());
        setLastSyncTime(new Date().toISOString());
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
    
    // Mettre à jour le date avec l'ID du formulaire
    try {
      await updateDoc(doc(db, 'dates', dateId), {
        formId: formId
      });
      
      // Recharger les données du formulaire
      const formDoc = await getDoc(doc(db, 'formulaires', formId));
      if (formDoc.exists()) {
        updateFormDataState(formDoc);
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du date:', error);
    }
  };

  // Valider un formulaire rempli par le contact
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

export default useDateFormsManagement; 