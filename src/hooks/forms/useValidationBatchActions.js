import { useState } from 'react';
import { db } from '@/services/firebase-service';
import { doc, getDoc, updateDoc, collection, addDoc, Timestamp } from '@/services/firebase-service';
import { ensureStructureEntity } from '@/services/structureService';
import { useOrganization } from '@/context/OrganizationContext';
import { useRelancesAutomatiques } from '@/hooks/relances/useRelancesAutomatiques';

const useValidationBatchActions = ({ formId, concertId, validatedFields, setValidated }) => {
  const { currentOrganization } = useOrganization();
  const relancesAuto = useRelancesAutomatiques();
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

      // Récupérer les données de la soumission pour travailler avec
      const formSubmissionDoc = await getDoc(doc(db, 'formSubmissions', formId));
      if (!formSubmissionDoc.exists()) {
        throw new Error("Impossible de trouver les données du formulaire");
      }
      const formData = { ...formSubmissionDoc.data(), id: formSubmissionDoc.id };

      // ==========================================
      // 2. GESTION DU CONTACT/CONTACT
      // ==========================================
      
      // Séparer les champs par catégorie - SUPPORT DES DEUX FORMATS
      const contactFields = {};
      const structureFields = {};
      const lieuFields = {};
      
      // ANCIEN FORMAT : champs avec préfixes (contact., structure., lieu.)
      Object.entries(validatedFields).forEach(([fieldPath, value]) => {
        const [category, field] = fieldPath.split('.');
        
        if (category === 'contact') {
          contactFields[field] = value;
        } else if (category === 'structure') {
          structureFields[field] = value;
        } else if (category === 'lieu') {
          lieuFields[field] = value;
        }
      });

      // NOUVEAU FORMAT : données structurées du formulaire public
      // Si pas de champs préfixés mais des données structurées, les utiliser
      if (Object.keys(contactFields).length === 0 && formData.signataireData) {
        // Mapper signataireData vers contactFields
        const signataire = formData.signataireData;
        if (signataire.nom) contactFields.nom = signataire.nom;
        if (signataire.prenom) contactFields.prenom = signataire.prenom;
        if (signataire.email) contactFields.email = signataire.email;
        if (signataire.telephone) contactFields.telephone = signataire.telephone;
        if (signataire.fonction) contactFields.fonction = signataire.fonction;
        
        console.log("Données signataire mappées vers contact:", contactFields);
      }

      if (Object.keys(structureFields).length === 0 && formData.structureData) {
        // Mapper structureData vers structureFields
        const structure = formData.structureData;
        if (structure.nom) structureFields.nom = structure.nom;
        if (structure.siret) structureFields.siret = structure.siret;
        if (structure.adresse) structureFields.adresse = structure.adresse;
        if (structure.codePostal) structureFields.codePostal = structure.codePostal;
        if (structure.ville) structureFields.ville = structure.ville;
        if (structure.numeroIntracommunautaire) structureFields.numeroIntracommunautaire = structure.numeroIntracommunautaire;
        
        console.log("Données structure mappées:", structureFields);
      }

      if (Object.keys(lieuFields).length === 0 && formData.lieuData) {
        // Mapper lieuData vers lieuFields
        const lieu = formData.lieuData;
        if (lieu.adresse) lieuFields.adresse = lieu.adresse;
        if (lieu.codePostal) lieuFields.codePostal = lieu.codePostal;
        if (lieu.ville) lieuFields.ville = lieu.ville;
        if (lieu.pays) lieuFields.pays = lieu.pays;
        
        console.log("Données lieu mappées:", lieuFields);
      }

      // Récupérer les données du concert pour vérifier s'il a déjà un contact
      const concertDoc = await getDoc(doc(db, 'concerts', concertId));
      const concertData = concertDoc.data();
      
      // Utiliser le contact existant du concert en priorité
      let programmId = concertData.contactId || formData.programmId;
      let structureId = null;
      
      // Gestion du contact (contact)
      if (Object.keys(contactFields).length > 0) {
        if (programmId) {
          // Mise à jour contact existant avec SEULEMENT les données de contact
          const programmUpdateData = {
            ...contactFields,
            updatedAt: Timestamp.now()
          };
          
          await updateDoc(doc(db, 'contacts', programmId), programmUpdateData);
          console.log("Contact existant mis à jour avec les données de contact:", programmUpdateData);
        } else {
          // Création nouveau contact avec SEULEMENT les données de contact
          const newContactData = {
            ...contactFields,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
            ...(currentOrganization?.id && { organizationId: currentOrganization.id })
          };
          
          const newProgRef = await addDoc(collection(db, 'contacts'), newContactData);
          programmId = newProgRef.id;
          
          // Mettre à jour la soumission et le concert avec l'ID du contact créé
          await updateDoc(doc(db, 'formSubmissions', formId), {
            programmId: programmId
          });
          
          await updateDoc(doc(db, 'concerts', concertId), {
            contactId: programmId
          });
          
          console.log("Nouveau contact créé avec les données de contact:", newContactData);
        }
      }

      // ==========================================
      // 3. GESTION DE LA STRUCTURE (ENTITÉ SÉPARÉE)
      // ==========================================
      
      if (Object.keys(structureFields).length > 0) {
        // Préparer les données de structure selon le format attendu
        const structureData = {
          nom: structureFields.raisonSociale || structureFields.nom || '',
          type: structureFields.type || 'association',
          siret: structureFields.siret || '',
          adresse: {
            adresse: structureFields.adresse || '',
            codePostal: structureFields.codePostal || '',
            ville: structureFields.ville || '',
            pays: structureFields.pays || 'France'
          },
          tva: structureFields.tva || '',
          numeroIntracommunautaire: structureFields.numeroIntracommunautaire || '',
          // Initialiser les associations
          contactsAssocies: []
        };

        // Vérifier si le contact a déjà une structure associée
        let existingStructureId = null;
        if (programmId) {
          const progDoc = await getDoc(doc(db, 'contacts', programmId));
          if (progDoc.exists()) {
            const progData = progDoc.data();
            existingStructureId = progData.structureId;
          }
        }

        if (existingStructureId) {
          // Mettre à jour la structure existante
          structureId = existingStructureId;
          await ensureStructureEntity(structureId, structureData, currentOrganization?.id);
          console.log("Structure existante mise à jour:", structureId, structureData);
        } else {
          // Créer une nouvelle structure
          // Utiliser le SIRET comme ID si disponible, sinon générer un ID automatique
          if (structureFields.siret) {
            structureId = structureFields.siret;
            await ensureStructureEntity(structureId, structureData, currentOrganization?.id);
          } else {
            // Créer avec un ID automatique
            const newStructureRef = await addDoc(collection(db, 'structures'), {
              ...structureData,
              createdAt: Timestamp.now(),
              updatedAt: Timestamp.now(),
              ...(currentOrganization?.id && { organizationId: currentOrganization.id })
            });
            structureId = newStructureRef.id;
          }
          
          console.log("Nouvelle structure créée:", structureId, structureData);
        }

        // Associer la structure au contact
        if (programmId && structureId) {
          await updateDoc(doc(db, 'contacts', programmId), {
            structureId: structureId,
            structureNom: structureData.nom,
            updatedAt: Timestamp.now()
          });

          // Ajouter le contact à la liste des contacts associés de la structure
          const structureDoc = await getDoc(doc(db, 'structures', structureId));
          if (structureDoc.exists()) {
            const structureDataFromDB = structureDoc.data();
            const contactsAssocies = structureDataFromDB.contactsAssocies || [];
            
            // Vérifier si le contact n'est pas déjà dans la liste
            const progExists = contactsAssocies.some(prog => prog.id === programmId);
            
            if (!progExists) {
              const progDoc = await getDoc(doc(db, 'contacts', programmId));
              if (progDoc.exists()) {
                const progData = progDoc.data();
                
                contactsAssocies.push({
                  id: programmId,
                  nom: `${progData.prenom || ''} ${progData.nom || ''}`.trim(),
                  dateAssociation: Timestamp.now()
                });

                await updateDoc(doc(db, 'structures', structureId), {
                  contactsAssocies: contactsAssocies,
                  updatedAt: Timestamp.now()
                });
              }
            }
          }
        }
      }

      // ==========================================
      // 4. GESTION DU LIEU (COMME AVANT)
      // ==========================================
      
      if (concertData.lieuId && Object.keys(lieuFields).length > 0) {
        // Mise à jour lieu existant
        const lieuUpdateData = {
          ...lieuFields,
          updatedAt: Timestamp.now()
        };
        
        // Ajouter les coordonnées si disponibles
        if (formData.lieuData && formData.lieuData.latitude && formData.lieuData.longitude) {
          lieuUpdateData.latitude = formData.lieuData.latitude;
          lieuUpdateData.longitude = formData.lieuData.longitude;
        }

        // Ajouter le contact à la liste des contacts associés du lieu
        if (programmId) {
          const progDoc = await getDoc(doc(db, 'contacts', programmId));
          if (progDoc.exists()) {
            const progData = progDoc.data();
            
            const lieuDoc = await getDoc(doc(db, 'lieux', concertData.lieuId));
            const lieuData = lieuDoc.data();
            
            const contactsAssocies = lieuData.contactsAssocies || [];
            const progExists = contactsAssocies.some(prog => prog.id === programmId);
            
            if (!progExists) {
              contactsAssocies.push({
                id: programmId,
                nom: `${progData.prenom || ''} ${progData.nom || ''}`.trim(),
                dateAssociation: Timestamp.now()
              });
              
              lieuUpdateData.contactsAssocies = contactsAssocies;
            }
          }
        }
        
        await updateDoc(doc(db, 'lieux', concertData.lieuId), lieuUpdateData);
        console.log("Lieu existant mis à jour:", lieuUpdateData);
        
      } else if (!concertData.lieuId && lieuFields.nom && lieuFields.ville) {
        // Création nouveau lieu
        const newLieuData = {
          ...lieuFields,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
          contactsAssocies: [],
          // ✅ FIX: Ajouter automatiquement l'organizationId
          ...(currentOrganization?.id && { organizationId: currentOrganization.id })
        };
        
        // Ajouter les coordonnées si disponibles
        if (formData.lieuData && formData.lieuData.latitude && formData.lieuData.longitude) {
          newLieuData.latitude = formData.lieuData.latitude;
          newLieuData.longitude = formData.lieuData.longitude;
        }

        // Initialiser avec le contact actuel si disponible
        if (programmId) {
          const progDoc = await getDoc(doc(db, 'contacts', programmId));
          if (progDoc.exists()) {
            const progData = progDoc.data();
            
            newLieuData.contactsAssocies = [{
              id: programmId,
              nom: `${progData.prenom || ''} ${progData.nom || ''}`.trim(),
              dateAssociation: Timestamp.now()
            }];
          }
        }
        
        const newLieuRef = await addDoc(collection(db, 'lieux'), newLieuData);
        
        // Mettre à jour le concert avec l'ID du lieu
        await updateDoc(doc(db, 'concerts', concertId), {
          lieuId: newLieuRef.id,
          lieuNom: newLieuData.nom,
          lieuVille: newLieuData.ville
        });
        
        console.log("Nouveau lieu créé:", newLieuData);
      }

      // ==========================================
      // 5. MISE À JOUR DU CONCERT AVEC RÉFÉRENCES
      // ==========================================
      
      const concertUpdates = {
        formValidated: true,
        formSubmissionId: formId,
        formValidatedAt: new Date()
      };

      // Ajouter les références aux entités créées/mises à jour
      if (programmId) {
        concertUpdates.contactId = programmId;
      }
      
      if (structureId) {
        concertUpdates.structureId = structureId;
      }

      // Ajouter les champs de contact/structure/lieu pour affichage rapide
      Object.entries(validatedFields).forEach(([fieldPath, value]) => {
        const [category, field] = fieldPath.split('.');
        
        if (category === 'contact') {
          concertUpdates[`contact${field.charAt(0).toUpperCase() + field.slice(1)}`] = value;
        } else if (category === 'structure') {
          concertUpdates[`structure${field.charAt(0).toUpperCase() + field.slice(1)}`] = value;
        } else if (category === 'lieu') {
          concertUpdates[`lieu${field.charAt(0).toUpperCase() + field.slice(1)}`] = value;
        }
      });
      
      await updateDoc(doc(db, 'concerts', concertId), concertUpdates);
      console.log("Concert mis à jour avec les références:", concertUpdates);

      if (setValidated) {
        setValidated(true);
      }
      
      // Déclencher les relances automatiques après validation du formulaire
      try {
        // Récupérer les données du concert mis à jour
        const concertDoc = await getDoc(doc(db, 'concerts', concertId));
        if (concertDoc.exists()) {
          const concertData = { id: concertId, ...concertDoc.data() };
          const formulaireData = { 
            id: formId, 
            ...formData, 
            statut: 'valide',
            dateValidation: new Date()
          };
          
          console.log("🔄 Déclenchement des relances automatiques après validation formulaire");
          await relancesAuto.onFormulaireValide(concertData, formulaireData);
        }
      } catch (relanceError) {
        console.error("⚠️ Erreur lors de la gestion des relances automatiques:", relanceError);
        // Ne pas faire échouer la validation si les relances échouent
      }
      
      setValidationInProgress(false);
      
      console.log("✅ Validation terminée avec succès !");
      console.log("- Contact ID:", programmId);
      console.log("- Structure ID:", structureId);
      console.log("- Concert ID:", concertId);
      
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
