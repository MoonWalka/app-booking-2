import { db, doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs, serverTimestamp } from '@/firebaseInit';

/**
 * Service pour gérer la synchronisation entre les informations descriptives de structure
 * et les entités Structure à part entière
 * Note temporaire: La gestion bidirectionnelle a été désactivée pour diagnostic
 */
const structureService = {
  /**
   * Assure qu'un programmateur avec des informations de structure est correctement lié à une entité Structure
   * - Si un structureId existe déjà, vérifie que l'entité existe et la met à jour si nécessaire
   * - Si aucun structureId n'existe mais qu'il y a des informations de structure, crée une nouvelle entité
   * NOTE: La gestion bidirectionnelle a été temporairement désactivée
   * 
   * @param {Object} programmateur - L'objet programmateur complet ou formData
   * @returns {Promise<string|null>} - L'ID de l'entité Structure associée ou null
   */
  ensureStructureEntity: async (programmateur) => {
    // Conversion des champs en fonction du format d'entrée (programmateur ou formData)
    const structureName = programmateur.structure?.raisonSociale || programmateur.structure || programmateur.structureNom || '';
    const structureType = programmateur.structure?.type || programmateur.structureType || '';
    const structureAddress = programmateur.structure?.adresse || programmateur.structureAdresse || '';
    const structurePostalCode = programmateur.structure?.codePostal || programmateur.structureCodePostal || '';
    const structureCity = programmateur.structure?.ville || programmateur.structureVille || '';
    const structureCountry = programmateur.structure?.pays || programmateur.structurePays || 'France';
    const structureSiret = programmateur.structure?.siret || programmateur.structureSiret || '';
    const structureTva = programmateur.structure?.tva || programmateur.structureTva || '';
    const structureId = programmateur.structureId || '';
    const programmId = programmateur.id || '';
    
    // Si pas d'informations de structure, rien à faire
    if (!structureName) {
      return null;
    }
    
    try {
      console.log("[DIAGNOSTIC] Début de ensureStructureEntity avec désactivation bidirectionnelle");
      
      // Cas 1: Le programmateur a déjà un structureId
      if (structureId) {
        // Vérifier que l'entité existe
        const structureRef = doc(db, 'structures', structureId);
        const structureDoc = await getDoc(structureRef);
        
        if (structureDoc.exists()) {
          // Mettre à jour l'entité si nécessaire
          const structureData = structureDoc.data();
          const updates = {};
          let needsUpdate = false;
          
          // Vérifier chaque champ pour des mises à jour nécessaires
          if (structureName !== (structureData.nom || structureData.raisonSociale)) {
            updates.nom = structureName;
            needsUpdate = true;
          }
          
          if (structureType && structureType !== structureData.type) {
            updates.type = structureType;
            needsUpdate = true;
          }
          
          if (structureAddress && structureAddress !== structureData.adresse) {
            updates.adresse = structureAddress;
            needsUpdate = true;
          }
          
          if (structurePostalCode && structurePostalCode !== structureData.codePostal) {
            updates.codePostal = structurePostalCode;
            needsUpdate = true;
          }
          
          if (structureCity && structureCity !== structureData.ville) {
            updates.ville = structureCity;
            needsUpdate = true;
          }
          
          if (structureCountry && structureCountry !== structureData.pays) {
            updates.pays = structureCountry;
            needsUpdate = true;
          }
          
          if (structureSiret && structureSiret !== structureData.siret) {
            updates.siret = structureSiret;
            needsUpdate = true;
          }
          
          if (structureTva && structureTva !== structureData.tva) {
            updates.tva = structureTva;
            needsUpdate = true;
          }
          
          /* DÉSACTIVATION TEMPORAIRE DE LA GESTION BIDIRECTIONNELLE
          // Si programmateur ID fourni, s'assurer qu'il est dans la liste des programmateurs associés
          if (programmId) {
            const programmateursAssocies = structureData.programmateursAssocies || [];
            if (!programmateursAssocies.includes(programmId)) {
              updates.programmateursAssocies = [...programmateursAssocies, programmId];
              needsUpdate = true;
            }
          }
          */
          
          if (needsUpdate) {
            updates.updatedAt = serverTimestamp();
            await updateDoc(structureRef, updates);
            console.log(`Structure ${structureId} mise à jour via structureService`);
          }
          
          /* DÉSACTIVATION TEMPORAIRE DE LA GESTION BIDIRECTIONNELLE
          // Si un ID de programmateur est fourni, mettre à jour sa référence vers cette structure
          if (programmId) {
            await updateDoc(doc(db, 'programmateurs', programmId), {
              structureId: structureId,
              updatedAt: serverTimestamp()
            });
          }
          */
          
          return structureId;
        } else {
          // La référence existe mais l'entité a disparu, il faut en créer une nouvelle
          console.warn(`Structure ${structureId} référencée mais inexistante, création d'une nouvelle`);
        }
      }
      
      // Cas 2: Rechercher une structure existante avec le même nom
      if (structureName) {
        const structuresQuery = query(
          collection(db, 'structures'), 
          where('nom', '==', structureName)
        );
        
        const existingStructures = await getDocs(structuresQuery);
        if (!existingStructures.empty) {
          // Utiliser la première structure trouvée
          const existingStructure = existingStructures.docs[0];
          const newStructureId = existingStructure.id;
          
          console.log(`Structure existante trouvée avec le nom "${structureName}": ${newStructureId}`);
          
          // Mettre à jour les données de la structure si nécessaire
          const structureData = existingStructure.data();
          const updates = {};
          let needsUpdate = false;
          
          if (structureType && structureType !== structureData.type) {
            updates.type = structureType;
            needsUpdate = true;
          }
          
          if (structureAddress && structureAddress !== structureData.adresse) {
            updates.adresse = structureAddress;
            needsUpdate = true;
          }
          
          if (structurePostalCode && structurePostalCode !== structureData.codePostal) {
            updates.codePostal = structurePostalCode;
            needsUpdate = true;
          }
          
          if (structureCity && structureCity !== structureData.ville) {
            updates.ville = structureCity;
            needsUpdate = true;
          }
          
          if (structureSiret && structureSiret !== structureData.siret) {
            updates.siret = structureSiret;
            needsUpdate = true;
          }
          
          if (structureTva && structureTva !== structureData.tva) {
            updates.tva = structureTva;
            needsUpdate = true;
          }
          
          /* DÉSACTIVATION TEMPORAIRE DE LA GESTION BIDIRECTIONNELLE
          // Si programmateur ID fourni, s'assurer qu'il est dans la liste des programmateurs associés
          if (programmId) {
            const programmateursAssocies = structureData.programmateursAssocies || [];
            if (!programmateursAssocies.includes(programmId)) {
              updates.programmateursAssocies = [...programmateursAssocies, programmId];
              needsUpdate = true;
            }
          }
          */
          
          if (needsUpdate) {
            updates.updatedAt = serverTimestamp();
            await updateDoc(doc(db, 'structures', newStructureId), updates);
            console.log(`Structure existante ${newStructureId} mise à jour via structureService`);
          }
          
          /* DÉSACTIVATION TEMPORAIRE DE LA GESTION BIDIRECTIONNELLE
          // Si un ID de programmateur est fourni, mettre à jour sa référence vers cette structure
          if (programmId) {
            await updateDoc(doc(db, 'programmateurs', programmId), {
              structureId: newStructureId,
              updatedAt: serverTimestamp()
            });
            console.log(`Programmateur ${programmId} associé à la structure ${newStructureId}`);
          }
          */
          
          return newStructureId;
        }
      }
      
      // Cas 3: Créer une nouvelle entité Structure
      const structureData = {
        nom: structureName,
        type: structureType || 'Non spécifié',
        adresse: structureAddress || '',
        codePostal: structurePostalCode || '',
        ville: structureCity || '',
        pays: structureCountry || 'France',
        siret: structureSiret || '',
        tva: structureTva || '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      
      /* DÉSACTIVATION TEMPORAIRE DE LA GESTION BIDIRECTIONNELLE
      // Ajouter le programmateur à la liste des programmateurs associés si ID fourni
      if (programmId) {
        structureData.programmateursAssocies = [programmId];
      }
      */
      
      // Créer la nouvelle entité
      const newStructureRef = doc(collection(db, 'structures'));
      await setDoc(newStructureRef, structureData);
      console.log(`Nouvelle structure créée: ${newStructureRef.id} via structureService`);
      
      /* DÉSACTIVATION TEMPORAIRE DE LA GESTION BIDIRECTIONNELLE
      // Si un ID de programmateur est fourni, mettre à jour sa référence vers cette structure
      if (programmId) {
        await updateDoc(doc(db, 'programmateurs', programmId), {
          structureId: newStructureRef.id,
          updatedAt: serverTimestamp()
        });
        console.log(`Programmateur ${programmId} associé à la nouvelle structure ${newStructureRef.id}`);
      }
      */
      
      return newStructureRef.id;
    } catch (error) {
      console.error('Erreur lors de la synchronisation de la structure via structureService:', error);
      return null;
    }
  },
  
  /**
   * Synchronise les changements apportés à une entité Structure vers les informations descriptives
   * dans les programmateurs associés
   * NOTE: Temporairement désactivée pour diagnostic
   * 
   * @param {string} structureId - L'ID de la structure
   * @returns {Promise<void>}
   */
  syncStructureToAssociatedProgrammateurs: async (structureId) => {
    console.log("[DIAGNOSTIC] syncStructureToAssociatedProgrammateurs désactivée temporairement");
    /* DÉSACTIVATION TEMPORAIRE DE LA FONCTION COMPLÈTE
    try {
      // Récupérer la structure
      const structureDoc = await getDoc(doc(db, 'structures', structureId));
      if (!structureDoc.exists()) {
        console.warn(`Structure ${structureId} introuvable`);
        return;
      }
      
      const structureData = structureDoc.data();
      
      // Récupérer tous les programmateurs associés
      const programmateurIds = structureData.programmateursAssocies || [];
      
      for (const progId of programmateurIds) {
        const progRef = doc(db, 'programmateurs', progId);
        const progDoc = await getDoc(progRef);
        
        if (progDoc.exists()) {
          // Mettre à jour les informations descriptives
          await updateDoc(progRef, {
            structure: structureData.nom || structureData.raisonSociale,
            structureType: structureData.type,
            structureAdresse: structureData.adresse,
            structureCodePostal: structureData.codePostal,
            structureVille: structureData.ville,
            structurePays: structureData.pays,
            structureSiret: structureData.siret,
            structureTva: structureData.tva,
            updatedAt: serverTimestamp()
          });
          
          console.log(`Programmateur ${progId} mis à jour avec les données de structure ${structureId}`);
        }
      }
    } catch (error) {
      console.error(`Erreur lors de la synchronisation des programmateurs avec la structure ${structureId}:`, error);
    }
    */
  }
};

export default structureService;