#!/usr/bin/env node

/**
 * Script de Migration : contactId → contactIds
 * 
 * Convertit tous les concerts ayant un contactId vers le nouveau système contactIds (array)
 * Maintient la compatibilité et les relations bidirectionnelles
 * 
 * Usage:
 *   node scripts/migrate-contact-to-contacts.js [--dry-run] [--verbose]
 * 
 * Options:
 *   --dry-run   Simulation sans modification des données
 *   --verbose   Affichage détaillé des opérations
 * 
 * Créé le : Janvier 2025
 * Dans le cadre de l'unification du système de contacts
 */

const { initializeApp } = require('firebase/app');
const { 
  getFirestore, 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  updateDoc, 
  getDoc,
  serverTimestamp,
  writeBatch 
} = require('firebase/firestore');

// Configuration Firebase (à adapter selon votre environnement)
const firebaseConfig = {
  // Configuration sera chargée depuis l'environnement
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || 'tourcraft-dev',
  // Autres configurations selon besoin
};

// Initialisation
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Variables de configuration
const DRY_RUN = process.argv.includes('--dry-run');
const VERBOSE = process.argv.includes('--verbose') || DRY_RUN;
const BATCH_SIZE = 50; // Traiter par lots pour éviter les timeouts

// Statistiques de migration
const stats = {
  totalConcerts: 0,
  concertsToMigrate: 0,
  concertsMigrated: 0,
  concertsSkipped: 0,
  errors: [],
  bidirectionalUpdates: 0
};

/**
 * Fonction principale de migration
 */
async function migrateConcertContacts() {
  console.log('🚀 Migration contactId → contactIds');
  console.log('=====================================');
  console.log(`Mode: ${DRY_RUN ? '🧪 DRY-RUN (simulation)' : '⚡ LIVE'}`);
  console.log(`Verbeux: ${VERBOSE ? 'Oui' : 'Non'}`);
  console.log('');

  try {
    // Phase 1: Analyse des données existantes
    await analyzeExistingData();

    // Phase 2: Migration des concerts
    if (stats.concertsToMigrate > 0) {
      await migrateConcerts();
    } else {
      console.log('✅ Aucun concert à migrer trouvé');
    }

    // Phase 3: Vérification post-migration
    if (!DRY_RUN && stats.concertsMigrated > 0) {
      await verifyMigration();
    }

    // Rapport final
    printFinalReport();

  } catch (error) {
    console.error('❌ Erreur fatale during migration:', error);
    process.exit(1);
  }
}

/**
 * Analyse les données existantes pour identifier les concerts à migrer
 */
async function analyzeExistingData() {
  console.log('🔍 Phase 1: Analyse des données existantes...');

  try {
    // Compter tous les concerts
    const allConcertsSnapshot = await getDocs(collection(db, 'concerts'));
    stats.totalConcerts = allConcertsSnapshot.size;

    // Identifier les concerts avec contactId mais sans contactIds
    const concertsToMigrate = [];
    
    allConcertsSnapshot.forEach(doc => {
      const data = doc.data();
      const hasContactId = data.contactId && typeof data.contactId === 'string';
      const hasContactIds = data.contactIds && Array.isArray(data.contactIds) && data.contactIds.length > 0;

      if (hasContactId && !hasContactIds) {
        concertsToMigrate.push({
          id: doc.id,
          contactId: data.contactId,
          nom: data.nom || 'Concert sans nom',
          date: data.date || 'Date inconnue'
        });
      }
    });

    stats.concertsToMigrate = concertsToMigrate.length;

    console.log(`   📊 Concerts totaux: ${stats.totalConcerts}`);
    console.log(`   🎯 Concerts à migrer: ${stats.concertsToMigrate}`);

    if (VERBOSE && concertsToMigrate.length > 0) {
      console.log('\n   📋 Liste des concerts à migrer:');
      concertsToMigrate.forEach((concert, index) => {
        console.log(`      ${index + 1}. ${concert.nom} (${concert.id}) → contact: ${concert.contactId}`);
      });
    }

    return concertsToMigrate;

  } catch (error) {
    console.error('❌ Erreur lors de l\'analyse:', error);
    throw error;
  }
}

/**
 * Migre les concerts par lots
 */
async function migrateConcerts() {
  console.log('\n🔄 Phase 2: Migration des concerts...');

  try {
    // Récupérer la liste des concerts à migrer
    const concertsQuery = query(
      collection(db, 'concerts'),
      where('contactId', '!=', null)
    );
    const concertsSnapshot = await getDocs(concertsQuery);

    const batches = [];
    let currentBatch = [];

    // Traitement par lots
    for (const docSnapshot of concertsSnapshot.docs) {
      const concertData = docSnapshot.data();
      
      // Vérifier si migration nécessaire
      if (concertData.contactId && (!concertData.contactIds || concertData.contactIds.length === 0)) {
        currentBatch.push({
          id: docSnapshot.id,
          data: concertData
        });

        if (currentBatch.length >= BATCH_SIZE) {
          batches.push([...currentBatch]);
          currentBatch = [];
        }
      }
    }

    // Ajouter le dernier lot s'il n'est pas vide
    if (currentBatch.length > 0) {
      batches.push(currentBatch);
    }

    // Migrer chaque lot
    for (let i = 0; i < batches.length; i++) {
      await migrateBatch(batches[i], i + 1, batches.length);
    }

  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
    throw error;
  }
}

/**
 * Migre un lot de concerts
 */
async function migrateBatch(batch, batchNumber, totalBatches) {
  console.log(`   📦 Lot ${batchNumber}/${totalBatches} (${batch.length} concerts)`);

  if (DRY_RUN) {
    // Simulation
    for (const concert of batch) {
      console.log(`      🧪 [DRY-RUN] Concert ${concert.data.nom} : contactId=${concert.data.contactId} → contactIds=[${concert.data.contactId}]`);
      stats.concertsMigrated++;
    }
    return;
  }

  // Migration réelle avec batch Firestore
  const firestoreBatch = writeBatch(db);

  for (const concert of batch) {
    try {
      const concertRef = doc(db, 'concerts', concert.id);
      
      // Préparer les nouvelles données
      const updateData = {
        contactIds: [concert.data.contactId],
        updatedAt: serverTimestamp(),
        // Garder contactId temporairement pour compatibilité
        contactId_migrated: concert.data.contactId
      };

      // Supprimer l'ancien contactId
      updateData.contactId = null;

      firestoreBatch.update(concertRef, updateData);

      if (VERBOSE) {
        console.log(`      ✅ Concert ${concert.data.nom} préparé pour migration`);
      }

      stats.concertsMigrated++;

    } catch (error) {
      console.error(`      ❌ Erreur concert ${concert.id}:`, error);
      stats.errors.push({
        concertId: concert.id,
        error: error.message
      });
    }
  }

  // Exécuter le batch
  try {
    await firestoreBatch.commit();
    console.log(`      ✅ Lot ${batchNumber} migré avec succès`);

    // Mettre à jour les relations bidirectionnelles
    for (const concert of batch) {
      await updateBidirectionalRelation(concert.id, concert.data.contactId);
    }

  } catch (error) {
    console.error(`      ❌ Erreur lors du commit du lot ${batchNumber}:`, error);
    throw error;
  }
}

/**
 * Met à jour la relation bidirectionnelle dans le contact
 */
async function updateBidirectionalRelation(concertId, contactId) {
  try {
    const contactRef = doc(db, 'contacts', contactId);
    const contactDoc = await getDoc(contactRef);

    if (!contactDoc.exists()) {
      if (VERBOSE) {
        console.log(`      ⚠️  Contact ${contactId} non trouvé pour concert ${concertId}`);
      }
      return;
    }

    const contactData = contactDoc.data();
    let concertsIds = contactData.concertsIds || [];

    // Ajouter l'ID du concert s'il n'est pas déjà présent
    if (!concertsIds.includes(concertId)) {
      concertsIds.push(concertId);

      if (!DRY_RUN) {
        await updateDoc(contactRef, {
          concertsIds: concertsIds,
          updatedAt: serverTimestamp()
        });
      }

      stats.bidirectionalUpdates++;

      if (VERBOSE) {
        console.log(`      🔗 Relation bidirectionnelle mise à jour: contact ${contactId} ↔ concert ${concertId}`);
      }
    }

  } catch (error) {
    console.error(`      ❌ Erreur relation bidirectionnelle ${contactId} ↔ ${concertId}:`, error);
    stats.errors.push({
      type: 'bidirectional',
      concertId,
      contactId,
      error: error.message
    });
  }
}

/**
 * Vérifie que la migration s'est bien passée
 */
async function verifyMigration() {
  console.log('\n🔍 Phase 3: Vérification post-migration...');

  try {
    // Compter les concerts avec contactIds
    const concertsWithContactIds = query(
      collection(db, 'concerts'),
      where('contactIds', '!=', null)
    );
    const verifySnapshot = await getDocs(concertsWithContactIds);

    let migratedCount = 0;
    let stillHaveContactId = 0;

    verifySnapshot.forEach(doc => {
      const data = doc.data();
      if (data.contactIds && Array.isArray(data.contactIds) && data.contactIds.length > 0) {
        migratedCount++;
      }
      if (data.contactId) {
        stillHaveContactId++;
      }
    });

    console.log(`   ✅ Concerts avec contactIds: ${migratedCount}`);
    console.log(`   ⚠️  Concerts avec encore contactId: ${stillHaveContactId}`);

    if (stillHaveContactId > 0) {
      console.log('   ℹ️  Note: contactId peut être gardé temporairement pour compatibilité');
    }

  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error);
  }
}

/**
 * Affiche le rapport final
 */
function printFinalReport() {
  console.log('\n📋 RAPPORT FINAL DE MIGRATION');
  console.log('===============================');
  console.log(`Mode d'exécution: ${DRY_RUN ? 'DRY-RUN (simulation)' : 'LIVE'}`);
  console.log(`Concerts totaux: ${stats.totalConcerts}`);
  console.log(`Concerts à migrer: ${stats.concertsToMigrate}`);
  console.log(`Concerts migrés: ${stats.concertsMigrated}`);
  console.log(`Relations bidirectionnelles mises à jour: ${stats.bidirectionalUpdates}`);
  console.log(`Erreurs: ${stats.errors.length}`);

  if (stats.errors.length > 0) {
    console.log('\n❌ ERREURS RENCONTRÉES:');
    stats.errors.forEach((error, index) => {
      console.log(`   ${index + 1}. ${error.concertId || error.type}: ${error.error}`);
    });
  }

  if (DRY_RUN) {
    console.log('\n🧪 Ceci était une simulation. Relancez sans --dry-run pour appliquer les changements.');
  } else if (stats.concertsMigrated > 0) {
    console.log('\n✅ Migration terminée avec succès !');
    console.log('   Les concerts utilisent maintenant le système contactIds unifié.');
  }

  console.log('');
}

/**
 * Point d'entrée
 */
if (require.main === module) {
  migrateConcertContacts()
    .then(() => {
      console.log('🎉 Script terminé');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Erreur fatale:', error);
      process.exit(1);
    });
}

module.exports = {
  migrateConcertContacts,
  analyzeExistingData
};