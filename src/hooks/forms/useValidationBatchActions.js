import { useState } from 'react';
import { db } from '@/firebaseInit';
import { doc, getDoc, updateDoc, collection, addDoc, Timestamp } from 'firebase/firestore';

const useValidationBatchActions = ({ formId, concertId, validatedFields, setValidated }) => {
  const [validationInProgress, setValidationInProgress] = useState(false);

  // Valider le formulaire et mettre à jour les données
  const validateForm = async () => {
    if (!formId) return;
    
    try {
      setValidationInProgress(true);
      
      // 1. Mettre à jour le statut de la soumission
      await updateDoc(doc(db, 'formSubmissions', formId), {
        status: 'validated',
        validatedAt: new Date(),
        validatedFields: validatedFields
      });
      
      // 2. Mettre à jour les données du concert avec les champs validés
      // Transformer les champs validés pour qu'ils correspondent à la structure du concert
      const concertUpdates = {};
      
      // Pour chaque champ validé, créer la mise à jour correspondante
      Object.entries(validatedFields).forEach(([fieldPath, value]) => {
        const [category, field] = fieldPath.split('.');
        
        if (category === 'contact') {
          // Exemple: contact.nom => programmateurNom
          concertUpdates[`programmateur${field.charAt(0).toUpperCase() + field.slice(1)}`] = value;
        } else if (category === 'structure') {
          // Exemple: structure.raisonSociale => structureRaisonSociale
          concertUpdates[`structure${field.charAt(0).toUpperCase() + field.slice(1)}`] = value;
        } else if (category === 'lieu') {
          // Exemple: lieu.nom => lieuNom
          concertUpdates[`lieu${field.charAt(0).toUpperCase() + field.slice(1)}`] = value;
        } else {
          // Autres champs
          concertUpdates[field] = value;
        }
      });
      
      // Ajouter des informations de formulaire validé
      concertUpdates.formValidated = true;
      concertUpdates.formSubmissionId = formId;
      concertUpdates.formValidatedAt = new Date();
      
      await updateDoc(doc(db, 'concerts', concertId), concertUpdates);

      // Récupérer les données de la soumission pour travailler avec
      const formSubmissionDoc = await getDoc(doc(db, 'formSubmissions', formId));
      if (!formSubmissionDoc.exists()) {
        throw new Error("Impossible de trouver les données du formulaire");
      }
      const formData = { ...formSubmissionDoc.data(), id: formSubmissionDoc.id };

      // 3. Si un programmateur est associé, mettre à jour ses informations
      // Vérifier si un programmateur existant est associé
      let programmId = formData.programmId;
      
      if (programmId) {
        // Si programmateur existant, mise à jour
        const programmUpdateData = {};
        
        // Traiter les champs contact
        Object.entries(validatedFields).forEach(([fieldPath, value]) => {
          const [category, field] = fieldPath.split('.');
          
          if (category === 'contact') {
            programmUpdateData[field] = value;
          } else if (category === 'structure') {
            if (field === 'raisonSociale') {
              programmUpdateData.structure = value;
            } else if (['type', 'adresse', 'codePostal', 'ville', 'pays'].includes(field)) {
              programmUpdateData[`structure${field.charAt(0).toUpperCase() + field.slice(1)}`] = value;
            } else {
              programmUpdateData[field] = value;
            }
          }
        });
        
        // Récupérer les données du concert pour obtenir le lieuId
        const concertDoc = await getDoc(doc(db, 'concerts', concertId));
        const concertData = concertDoc.data();
        
        // NOUVEAU: Ajouter le lieu à la liste des lieux associés du programmateur
        if (concertData?.lieuId) {
          const lieuDoc = await getDoc(doc(db, 'lieux', concertData.lieuId));
          if (lieuDoc.exists()) {
            const lieuData = lieuDoc.data();
            
            // Préparer l'objet lieu à ajouter
            const lieuRef = {
              id: concertData.lieuId,
              nom: lieuData.nom || '',
              ville: lieuData.ville || '',
              dateAssociation: Timestamp.now()
            };
            
            // Récupérer la liste actuelle des lieux associés
            const progDoc = await getDoc(doc(db, 'programmateurs', programmId));
            const progData = progDoc.data();
            
            // Initialiser lieuxAssocies s'il n'existe pas
            const lieuxAssocies = progData.lieuxAssocies || [];
            
            // Vérifier si le lieu est déjà associé
            const lieuExistant = lieuxAssocies.findIndex(lieu => lieu.id === concertData.lieuId);
            
            if (lieuExistant === -1) {
              // Ajouter le nouveau lieu à la liste
              programmUpdateData.lieuxAssocies = [...lieuxAssocies, lieuRef];
            } else {
              // Mettre à jour l'entrée existante
              const updatedLieuxAssocies = [...lieuxAssocies];
              updatedLieuxAssocies[lieuExistant] = lieuRef;
              programmUpdateData.lieuxAssocies = updatedLieuxAssocies;
            }
          }
        }
        
        // Ajouter timestamp de mise à jour
        programmUpdateData.updatedAt = Timestamp.now();
        
        await updateDoc(doc(db, 'programmateurs', programmId), programmUpdateData);
      } else {
        // Si pas de programmateur existant, on en crée un nouveau
        const newProgrammateurData = {};
        
        // Extraire les champs validés
        Object.entries(validatedFields).forEach(([fieldPath, value]) => {
          const [category, field] = fieldPath.split('.');
          
          if (category === 'contact') {
            // L'email n'est plus obligatoire pour la création d'un programmateur
            newProgrammateurData[field] = value || '';
          } else if (category === 'structure') {
            if (field === 'raisonSociale') {
              newProgrammateurData.structure = value;
            } else if (['type', 'adresse', 'codePostal', 'ville', 'pays'].includes(field)) {
              newProgrammateurData[`structure${field.charAt(0).toUpperCase() + field.slice(1)}`] = value;
            } else {
              newProgrammateurData[field] = value;
            }
          }
        });
        
        // Ajouter timestamps
        newProgrammateurData.createdAt = Timestamp.now();
        newProgrammateurData.updatedAt = Timestamp.now();
        
        // Créer le nouveau programmateur
        const newProgRef = await addDoc(collection(db, 'programmateurs'), newProgrammateurData);
        
        // Mettre à jour la soumission avec l'ID du programmateur créé
        await updateDoc(doc(db, 'formSubmissions', formId), {
          programmId: newProgRef.id
        });
        
        // Mettre à jour le concert avec l'ID du programmateur
        await updateDoc(doc(db, 'concerts', concertId), {
          programmateurId: newProgRef.id
        });
        
        // Mettre à jour programmId pour les opérations suivantes
        programmId = newProgRef.id;
      }
      
      // 4. Gestion du lieu
      // Récupérer les données du concert à jour
      const concertDoc = await getDoc(doc(db, 'concerts', concertId));
      const concertData = concertDoc.data();
      
      if (concertData.lieuId) {
        const lieuUpdateData = {};
        
        // Extraire les champs du lieu
        Object.entries(validatedFields).forEach(([fieldPath, value]) => {
          const [category, field] = fieldPath.split('.');
          if (category === 'lieu') {
            lieuUpdateData[field] = value;
          }
        });
        
        // Ajouter les coordonnées si disponibles
        if (formData.lieuData && formData.lieuData.latitude && formData.lieuData.longitude) {
          lieuUpdateData.latitude = formData.lieuData.latitude;
          lieuUpdateData.longitude = formData.lieuData.longitude;
        }
        
        // NOUVEAU: Ajouter le programmateur à la liste des programmateurs associés
        if (programmId) {
          // Récupérer les données du programmateur
          const progDoc = await getDoc(doc(db, 'programmateurs', programmId));
          if (progDoc.exists()) {
            const progData = progDoc.data();
            
            // Préparer l'objet programmateur à ajouter
            const progRef = {
              id: programmId,
              nom: progData.nom || '',
              dateAssociation: Timestamp.now()
            };
            
            // Récupérer la liste actuelle des programmateurs associés
            const lieuDoc = await getDoc(doc(db, 'lieux', concertData.lieuId));
            const lieuData = lieuDoc.data();
            
            // Initialiser programmateursAssocies s'il n'existe pas
            const programmateursAssocies = lieuData.programmateursAssocies || [];
            
            // Vérifier si le programmateur est déjà associé
            const progExistant = programmateursAssocies.findIndex(prog => prog.id === programmId);
            
            if (progExistant === -1) {
              // Ajouter le nouveau programmateur à la liste
              lieuUpdateData.programmateursAssocies = [...programmateursAssocies, progRef];
            } else {
              // Mettre à jour l'entrée existante
              const updatedProgrammateurs = [...programmateursAssocies];
              updatedProgrammateurs[progExistant] = progRef;
              lieuUpdateData.programmateursAssocies = updatedProgrammateurs;
            }
          }
        }
        
        // Ajouter timestamp de mise à jour
        lieuUpdateData.updatedAt = Timestamp.now();
        
        // Ne mettre à jour que si des changements sont présents
        if (Object.keys(lieuUpdateData).length > 0) {
          console.log("Mise à jour du lieu avec les données:", lieuUpdateData);
          await updateDoc(doc(db, 'lieux', concertData.lieuId), lieuUpdateData);
        }
      } else if (validatedFields['lieu.nom'] && validatedFields['lieu.ville']) {
        // Si aucun lieu n'est associé mais que des informations sont présentes, créer un nouveau lieu
        const newLieuData = {};
        
        Object.entries(validatedFields).forEach(([fieldPath, value]) => {
          const [category, field] = fieldPath.split('.');
          if (category === 'lieu') {
            newLieuData[field] = value;
          }
        });
        
        // Ajouter les coordonnées si disponibles
        if (formData.lieuData && formData.lieuData.latitude && formData.lieuData.longitude) {
          newLieuData.latitude = formData.lieuData.latitude;
          newLieuData.longitude = formData.lieuData.longitude;
        }
        
        // NOUVEAU: Initialiser programmateursAssocies si un programmateur est associé
        if (programmId) {
          const progDoc = await getDoc(doc(db, 'programmateurs', programmId));
          if (progDoc.exists()) {
            const progData = progDoc.data();
            
            // Initialiser programmateursAssocies avec le programmateur actuel
            newLieuData.programmateursAssocies = [{
              id: programmId,
              nom: progData.nom || '',
              dateAssociation: Timestamp.now()
            }];
          }
        } else {
          // Initialiser à un tableau vide si pas de programmateur
          newLieuData.programmateursAssocies = [];
        }
        
        // Ajouter timestamps
        newLieuData.createdAt = Timestamp.now();
        newLieuData.updatedAt = Timestamp.now();
        
        // Créer le nouveau lieu
        const newLieuRef = await addDoc(collection(db, 'lieux'), newLieuData);
        
        // Mettre à jour le concert avec l'ID du lieu
        await updateDoc(doc(db, 'concerts', concertId), {
          lieuId: newLieuRef.id,
          lieuNom: newLieuData.nom,
          lieuVille: newLieuData.ville
        });
        
        // NOUVEAU: Si un programmateur est associé, mettre à jour sa liste de lieux
        if (programmId) {
          const progDoc = await getDoc(doc(db, 'programmateurs', programmId));
          if (progDoc.exists()) {
            const progData = progDoc.data();
            
            // Créer ou mettre à jour lieuxAssocies avec le nouveau lieu
            const lieuxAssocies = progData.lieuxAssocies || [];
            
            // Ajouter le nouveau lieu
            const lieuRef = {
              id: newLieuRef.id,
              nom: newLieuData.nom,
              ville: newLieuData.ville,
              dateAssociation: Timestamp.now()
            };
            
            // Mettre à jour le programmateur
            await updateDoc(doc(db, 'programmateurs', programmId), {
              lieuxAssocies: [...lieuxAssocies, lieuRef],
              updatedAt: Timestamp.now()
            });
          }
        }
      }
      
      if (setValidated) {
        setValidated(true);
      }
      setValidationInProgress(false);
      
      return true;
    } catch (err) {
      console.error("Erreur lors de la validation du formulaire:", err);
      setValidationInProgress(false);
      return false;
    }
  };
  
  return {
    validateForm,
    validationInProgress
  };
};

export default useValidationBatchActions;
