import { useState } from 'react';

const useFieldActions = (validatedFields, setValidatedFields) => {
  // Gérer la validation d'un champ spécifique
  const handleValidateField = (category, fieldName, value) => {
    // Créer un objet qui représente le chemin complet du champ
    // Par exemple: contact.nom, structure.raisonSociale, lieu.adresse, etc.
    const fieldPath = `${category}.${fieldName}`;
    
    // Mettre à jour l'état local des champs validés
    setValidatedFields(prev => ({
      ...prev,
      [fieldPath]: value
    }));
  };

  // Copier la valeur du formulaire vers la valeur finale
  const copyFormValueToFinal = (fieldPath, formValue) => {
    setValidatedFields(prev => ({
      ...prev,
      [fieldPath]: formValue
    }));
  };

  return {
    handleValidateField,
    copyFormValueToFinal
  };
};

export default useFieldActions;
