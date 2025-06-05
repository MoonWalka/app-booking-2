import { useState, useCallback, useMemo } from 'react';
import { 
  db,
  collection, 
  doc, 
  addDoc, 
  updateDoc 
} from '@/services/firebase-service';
import { useAuth } from '@/context/AuthContext';
import { useOrganization } from '@/context/OrganizationContext';

/**
 * Hook pour gérer le formulaire de création/édition de relance
 */
const useRelanceForm = () => {
  const { user } = useAuth();
  const { currentOrganization } = useOrganization();

  // État initial du formulaire
  const initialFormData = useMemo(() => ({
    titre: '',
    description: '',
    dateEcheance: '',
    priorite: 'medium',
    entityType: '',
    entityId: '',
    entityName: ''
  }), []);

  const [formData, setFormData] = useState(initialFormData);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Réinitialiser le formulaire
   */
  const resetForm = useCallback(() => {
    setFormData(initialFormData);
    setError(null);
  }, [initialFormData]);

  /**
   * Valider les données du formulaire
   */
  const validateForm = useCallback(() => {
    const errors = [];

    if (!formData.titre.trim()) {
      errors.push('Le titre est requis');
    }

    if (!formData.dateEcheance) {
      errors.push('La date d\'échéance est requise');
    }

    if (!formData.priorite) {
      errors.push('La priorité est requise');
    }

    // Vérifier que la date d'échéance n'est pas dans le passé pour une nouvelle relance
    const selectedDate = new Date(formData.dateEcheance);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      errors.push('La date d\'échéance ne peut pas être dans le passé');
    }

    return errors;
  }, [formData]);

  /**
   * Sauvegarder la relance (création ou mise à jour)
   */
  const saveRelance = useCallback(async (relanceId = null) => {
    console.log('[useRelanceForm] saveRelance - État actuel:', {
      user: user?.uid,
      currentOrganization: currentOrganization?.id,
      formData
    });
    
    if (!user || !currentOrganization) {
      console.error('[useRelanceForm] Données manquantes:', {
        user: !!user,
        currentOrganization: !!currentOrganization,
        currentOrgId: currentOrganization?.id
      });
      throw new Error('Utilisateur ou organisation non défini');
    }

    // Valider le formulaire
    const errors = validateForm();
    if (errors.length > 0) {
      setError(errors.join(', '));
      throw new Error(errors.join(', '));
    }

    setSaving(true);
    setError(null);

    try {
      const relanceData = {
        ...formData,
        organizationId: currentOrganization.id,
        userId: user.uid,
        status: 'pending',
        updatedAt: new Date().toISOString()
      };

      let result;

      if (relanceId) {
        // Mise à jour d'une relance existante
        const relanceRef = doc(db, 'relances', relanceId);
        await updateDoc(relanceRef, relanceData);
        result = { id: relanceId, ...relanceData };
      } else {
        // Création d'une nouvelle relance
        relanceData.createdAt = new Date().toISOString();
        const docRef = await addDoc(collection(db, 'relances'), relanceData);
        result = { id: docRef.id, ...relanceData };
      }

      resetForm();
      setSaving(false);
      return result;
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la relance:', error);
      setError(error.message);
      setSaving(false);
      throw error;
    }
  }, [user, currentOrganization, formData, validateForm, resetForm]);

  /**
   * Charger les données d'une relance existante dans le formulaire
   */
  const loadRelance = useCallback((relance) => {
    setFormData({
      titre: relance.titre || '',
      description: relance.description || '',
      dateEcheance: relance.dateEcheance || '',
      priorite: relance.priorite || 'medium',
      entityType: relance.entityType || '',
      entityId: relance.entityId || '',
      entityName: relance.entityName || ''
    });
  }, []);

  /**
   * Mettre à jour un champ spécifique du formulaire
   */
  const updateField = useCallback((field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  return {
    formData,
    setFormData,
    saving,
    error,
    saveRelance,
    resetForm,
    loadRelance,
    updateField,
    validateForm
  };
};

export default useRelanceForm;