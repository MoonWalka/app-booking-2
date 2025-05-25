/**
 * Script de création de la collection "structures"
 * 
 * Ce script extrait les données de structures des programmateurs et crée 
 * des documents dans la collection "structures" en évitant les doublons.
 * 
 * Utilisation: node create-structures-collection.js [--dry-run]
 */

// Importer notre initialisation Firebase pour Node.js
const {
  db, collection, doc, getDoc, getDocs, 
  setDoc, updateDoc, query, where, writeBatch
} = require('./firebase-node');

// Options par défaut
const options = {
  dryRun: process.argv.includes('--dry-run')
};

/**
 * Trouve les structures uniques à partir des programmateurs
 */
async function findUniqueStructures() {
  console.log('Recherche des structures uniques...');
  
  try {
    // Récupérer tous les programmateurs qui ont des informations de structure
    const q = query(collection(db, 'programmateurs'));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      console.log('Aucun programmateur trouvé.');
      return [];
    }
    
    console.log(`${snapshot.size} programmateurs trouvés. Analyse des données de structure...`);
    
    // Map pour stocker les structures uniques
    // Clé: identifiant unique (raisonSociale_type ou raisonSociale seule si pas de type)
    // Valeur: données de la structure
    const uniqueStructuresMap = new Map();
    
    // Pour chaque programmateur
    for (const docSnapshot of snapshot.docs) {
      const programmateurData = docSnapshot.data();
      
      // Vérifier si le programmateur a des données de structure
      const hasStructureData = programmateurData.structureRaisonSociale || 
                              programmateurData.structure || 
                              programmateurData.structureId;
      
      if (hasStructureData) {
        // Extraire les données de structure
        const structureData = {
          raisonSociale: programmateurData.structureRaisonSociale || programmateurData.structure || 'Structure Sans Nom',
          type: programmateurData.structureType || 'Non spécifié',
          adresse: programmateurData.structureAdresse || '',
          codePostal: programmateurData.structureCodePostal || '',
          ville: programmateurData.structureVille || '',
          pays: programmateurData.structurePays || 'France',
          siret: programmateurData.structureSiret || '',
          tva: programmateurData.structureTva || '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          programmateurIds: [docSnapshot.id]
        };
        
        // Clé unique pour la structure (permettant la déduplication)
        const structureKey = `${structureData.raisonSociale}_${structureData.type}_${structureData.ville}`.toLowerCase().replace(/\s+/g, '');
        
        // Si cette structure existe déjà dans notre map, fusionner les programmateurs associés
        if (uniqueStructuresMap.has(structureKey)) {
          const existingStructure = uniqueStructuresMap.get(structureKey);
          
          // Ajouter le programmateur à la liste des programmateurs associés
          if (!existingStructure.programmateurIds.includes(docSnapshot.id)) {
            existingStructure.programmateurIds.push(docSnapshot.id);
          }
          
          // Prendre les données les plus complètes entre les deux structures
          if (!existingStructure.adresse && structureData.adresse) {
            existingStructure.adresse = structureData.adresse;
          }
          if (!existingStructure.codePostal && structureData.codePostal) {
            existingStructure.codePostal = structureData.codePostal;
          }
          if (!existingStructure.ville && structureData.ville) {
            existingStructure.ville = structureData.ville;
          }
          if (!existingStructure.siret && structureData.siret) {
            existingStructure.siret = structureData.siret;
          }
          if (!existingStructure.tva && structureData.tva) {
            existingStructure.tva = structureData.tva;
          }
        } else {
          // Sinon, ajouter cette nouvelle structure à notre map
          uniqueStructuresMap.set(structureKey, structureData);
        }
      }
    }
    
    // Convertir la map en tableau de structures
    const uniqueStructures = Array.from(uniqueStructuresMap.values());
    console.log(`${uniqueStructures.length} structures uniques identifiées.`);
    
    return uniqueStructures;
  } catch (error) {
    console.error('Erreur lors de la recherche des structures uniques:', error);
    return [];
  }
}

/**
 * Crée ou met à jour les documents dans la collection "structures"
 */
async function createStructuresCollection(uniqueStructures) {
  if (uniqueStructures.length === 0) {
    console.log('Aucune structure à créer.');
    return { created: 0, updated: 0 };
  }
  
  console.log(`Création/mise à jour de ${uniqueStructures.length} structures...`);
  
  // Statistiques
  let created = 0;
  let updated = 0;
  
  try {
    // Créer un batch pour les écritures
    let batch = writeBatch(db);
    let batchCount = 0;
    const BATCH_SIZE = 400; // Limité par Firestore (max 500)
    
    // Pour chaque structure unique
    for (const structureData of uniqueStructures) {
      // Rechercher d'abord si une structure avec ce nom existe déjà
      const structureName = structureData.raisonSociale;
      const searchQuery = query(
        collection(db, 'structures'), 
        where('raisonSociale', '==', structureName)
      );
      
      const existingStructures = await getDocs(searchQuery);
      let docRef;
      
      if (!existingStructures.empty) {
        // Mettre à jour la structure existante
        const existingStructure = existingStructures.docs[0];
        docRef = existingStructure.ref;
        
        if (!options.dryRun) {
          batch.update(docRef, structureData);
        } else {
          console.log(`[MODE SIMULATION] Mise à jour de la structure existante "${structureName}" (${existingStructure.id})`);
        }
        
        updated++;
      } else {
        // Créer une nouvelle structure
        docRef = doc(collection(db, 'structures'));
        
        if (!options.dryRun) {
          batch.set(docRef, structureData);
        } else {
          console.log(`[MODE SIMULATION] Création d'une nouvelle structure "${structureName}" (${docRef.id})`);
        }
        
        created++;
      }
      
      batchCount++;
      
      // Si le batch est plein, l'exécuter et en créer un nouveau
      if (!options.dryRun && batchCount >= BATCH_SIZE) {
        await batch.commit();
        batch = writeBatch(db);
        batchCount = 0;
        console.log(`Batch de ${BATCH_SIZE} opérations exécuté`);
      }
    }
    
    // Exécuter le dernier batch s'il n'est pas vide
    if (!options.dryRun && batchCount > 0) {
      await batch.commit();
      console.log(`Dernier batch de ${batchCount} opérations exécuté`);
    }
    
    return { created, updated };
  } catch (error) {
    console.error('Erreur lors de la création/mise à jour des structures:', error);
    return { created, updated, error: true };
  }
}

/**
 * Met à jour les références de structure dans les programmateurs
 */
async function updateProgrammateurReferences(uniqueStructures) {
  if (uniqueStructures.length === 0 || options.dryRun) {
    if (options.dryRun) {
      console.log('[MODE SIMULATION] Les références dans les programmateurs ne sont pas mises à jour en mode simulation.');
    }
    return { updated: 0 };
  }
  
  console.log('Mise à jour des références de structure dans les programmateurs...');
  
  let updated = 0;
  
  try {
    // Map des programmateurs vers leurs structures
    // Clé: ID du programmateur
    // Valeur: ID de la structure
    const programmateursToStructures = new Map();
    
    // Récupérer les structures créées
    const structures = await getDocs(collection(db, 'structures'));
    
    // Pour chaque structure
    for (const structureDoc of structures.docs) {
      const structureData = structureDoc.data();
      
      // Pour chaque programmateur associé à cette structure
      if (structureData.programmateurIds && Array.isArray(structureData.programmateurIds)) {
        for (const programmateurId of structureData.programmateurIds) {
          programmateursToStructures.set(programmateurId, structureDoc.id);
        }
      }
    }
    
    // Créer un batch pour les mises à jour
    let batch = writeBatch(db);
    let batchCount = 0;
    const BATCH_SIZE = 400; // Limité par Firestore (max 500)
    
    // Pour chaque programmateur à mettre à jour
    for (const [programmateurId, structureId] of programmateursToStructures.entries()) {
      const programmateurRef = doc(db, 'programmateurs', programmateurId);
      
      // Mettre à jour la référence et le cache
      batch.update(programmateurRef, {
        structureId,
        updatedAt: new Date().toISOString()
      });
      
      batchCount++;
      updated++;
      
      // Si le batch est plein, l'exécuter et en créer un nouveau
      if (batchCount >= BATCH_SIZE) {
        await batch.commit();
        batch = writeBatch(db);
        batchCount = 0;
        console.log(`Batch de ${BATCH_SIZE} mises à jour de programmateurs exécuté`);
      }
    }
    
    // Exécuter le dernier batch s'il n'est pas vide
    if (batchCount > 0) {
      await batch.commit();
      console.log(`Dernier batch de ${batchCount} mises à jour de programmateurs exécuté`);
    }
    
    return { updated };
  } catch (error) {
    console.error('Erreur lors de la mise à jour des références dans les programmateurs:', error);
    return { updated, error: true };
  }
}

/**
 * Exécute la création de la collection "structures"
 */
async function main() {
  console.log('Démarrage de la création de la collection "structures"...');
  console.log('Date: ' + new Date().toISOString());
  console.log('Mode: ' + (options.dryRun ? 'SIMULATION' : 'RÉEL'));
  
  if (options.dryRun) {
    console.log('⚠️  Mode simulation: aucune modification ne sera écrite dans Firebase');
  }
  
  // Étape 1: Trouver les structures uniques à partir des programmateurs
  const uniqueStructures = await findUniqueStructures();
  
  if (uniqueStructures.length === 0) {
    console.log('Aucune structure trouvée. Fin du script.');
    process.exit(0);
  }
  
  // Étape 2: Créer/mettre à jour les documents dans la collection "structures"
  const structureResults = await createStructuresCollection(uniqueStructures);
  
  // Étape 3: Mettre à jour les références de structure dans les programmateurs
  const referenceResults = await updateProgrammateurReferences(uniqueStructures);
  
  // Afficher le résumé
  console.log('\n======== Résumé ========');
  console.log(`Structures créées: ${structureResults.created}`);
  console.log(`Structures mises à jour: ${structureResults.updated}`);
  console.log(`Programmateurs mis à jour: ${referenceResults.updated}`);
  
  if (options.dryRun) {
    console.log('\n⚠️  C\'était une simulation. Pour effectuer les modifications réelles, exécuter sans --dry-run');
  }
  
  process.exit(0);
}

// Exécuter le script
main().catch(error => {
  console.error('Erreur dans le script de création des structures:', error);
  process.exit(1);
});