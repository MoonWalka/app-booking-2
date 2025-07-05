#!/usr/bin/env node

/**
 * Script de Rollback : contactIds → contactId
 * 
 * Annule la migration en restaurant l'ancien système contactId
 * Utilise les données sauvegardées dans contactId_migrated
 * 
 * ⚠️  ATTENTION: À utiliser uniquement en cas de problème critique ⚠️
 * 
 * Usage:
 *   node scripts/rollback-contact-migration.js [--dry-run] [--verbose]
 * 
 * Options:
 *   --dry-run   Simulation sans modification des données
 *   --verbose   Affichage détaillé des opérations
 * 
 * Créé le : Janvier 2025
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

// Configuration Firebase
const firebaseConfig = {
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || 'tourcraft-dev',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Variables de configuration
const DRY_RUN = process.argv.includes('--dry-run');
const VERBOSE = process.argv.includes('--verbose') || DRY_RUN;
const BATCH_SIZE = 50;

// Statistiques de rollback
const stats = {
  totalConcerts: 0,
  concertsToRollback: 0,
  concertsRolledBack: 0,
  concertsSkipped: 0,
  errors: [],
  bidirectionalUpdates: 0
};

/**
 * Fonction principale de rollback
 */
async function rollbackConcertContacts() {
  console.log('⏪ Rollback contactIds → contactId');
  console.log('==================================');
  console.log(`Mode: ${DRY_RUN ? '🧪 DRY-RUN (simulation)' : '⚡ LIVE'}`);
  console.log(`Verbeux: ${VERBOSE ? 'Oui' : 'Non'}`);
  console.log('');

  // Confirmation pour éviter les erreurs
  if (!DRY_RUN) {
    console.log('⚠️  ATTENTION: Ce script va annuler la migration !');
    console.log('   Les concerts reviendront au système contactId (un seul contact)');
    console.log('   Seul le premier contact de chaque concert sera conservé');
    console.log('');
    console.log('   Appuyez sur Ctrl+C pour annuler ou attendez 10 secondes...');
    
    await new Promise(resolve => setTimeout(resolve, 10000));
    console.log('   🚀 Début du rollback...\n');
  }

  try {
    // Phase 1: Analyse des données à restaurer
    await analyzeDataToRollback();

    // Phase 2: Rollback des concerts
    if (stats.concertsToRollback > 0) {
      await rollbackConcerts();
    } else {
      console.log('✅ Aucun concert à restaurer trouvé');
    }

    // Phase 3: Vérification post-rollback
    if (!DRY_RUN && stats.concertsRolledBack > 0) {
      await verifyRollback();
    }

    // Rapport final
    printFinalReport();

  } catch (error) {
    console.error('❌ Erreur fatale during rollback:', error);
    process.exit(1);
  }
}

/**
 * Analyse les données à restaurer
 */
async function analyzeDataToRollback() {
  console.log('🔍 Phase 1: Analyse des données à restaurer...');

  try {
    const allConcertsSnapshot = await getDocs(collection(db, 'concerts'));
    stats.totalConcerts = allConcertsSnapshot.size;

    const concertsToRollback = [];
    
    allConcertsSnapshot.forEach(doc => {
      const data = doc.data();
      const hasContactIds = data.contactIds && Array.isArray(data.contactIds) && data.contactIds.length > 0;
      const hasBackup = data.contactId_migrated;
      const noContactId = !data.contactId;

      // Concert migré : a contactIds, pas de contactId, et une sauvegarde
      if (hasContactIds && noContactId && hasBackup) {
        concertsToRollback.push({
          id: doc.id,
          contactIds: data.contactIds,
          contactId_migrated: data.contactId_migrated,
          nom: data.nom || 'Concert sans nom',
          date: data.date || 'Date inconnue'
        });
      }
    });

    stats.concertsToRollback = concertsToRollback.length;

    console.log(`   📊 Concerts totaux: ${stats.totalConcerts}`);
    console.log(`   ⏪ Concerts à restaurer: ${stats.concertsToRollback}`);

    if (VERBOSE && concertsToRollback.length > 0) {
      console.log('\n   📋 Liste des concerts à restaurer:');
      concertsToRollback.forEach((concert, index) => {
        console.log(`      ${index + 1}. ${concert.nom} (${concert.id})`);
        console.log(`         contactIds: [${concert.contactIds.join(', ')}] → contactId: ${concert.contactId_migrated}`);
        if (concert.contactIds.length > 1) {
          console.log(`         ⚠️  ${concert.contactIds.length - 1} contact(s) seront perdus !`);
        }
      });
    }

    return concertsToRollback;

  } catch (error) {
    console.error('❌ Erreur lors de l\'analyse:', error);
    throw error;
  }
}

/**
 * Effectue le rollback des concerts
 */
async function rollbackConcerts() {
  console.log('\n⏪ Phase 2: Rollback des concerts...');

  try {
    // Récupérer les concerts migrés
    const concertsQuery = query(
      collection(db, 'concerts'),
      where('contactIds', '!=', null)
    );
    const concertsSnapshot = await getDocs(concertsQuery);

    const batches = [];
    let currentBatch = [];

    for (const docSnapshot of concertsSnapshot.docs) {
      const concertData = docSnapshot.data();
      
      // Vérifier si rollback nécessaire
      if (concertData.contactIds && 
          concertData.contactIds.length > 0 && 
          !concertData.contactId && 
          concertData.contactId_migrated) {
        
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

    if (currentBatch.length > 0) {
      batches.push(currentBatch);
    }

    // Rollback par lots
    for (let i = 0; i < batches.length; i++) {
      await rollbackBatch(batches[i], i + 1, batches.length);
    }

  } catch (error) {
    console.error('❌ Erreur lors du rollback:', error);
    throw error;
  }
}

/**
 * Rollback d'un lot de concerts
 */
async function rollbackBatch(batch, batchNumber, totalBatches) {
  console.log(`   📦 Lot ${batchNumber}/${totalBatches} (${batch.length} concerts)`);

  if (DRY_RUN) {
    for (const concert of batch) {
      const firstContact = concert.data.contactIds[0];
      const lostContacts = concert.data.contactIds.length - 1;
      
      console.log(`      🧪 [DRY-RUN] Concert ${concert.data.nom}`);
      console.log(`         contactIds=[${concert.data.contactIds.join(', ')}] → contactId=${concert.data.contactId_migrated}`);
      if (lostContacts > 0) {
        console.log(`         ⚠️  ${lostContacts} contact(s) seraient perdus`);
      }
      stats.concertsRolledBack++;
    }
    return;
  }

  // Rollback réel
  const firestoreBatch = writeBatch(db);

  for (const concert of batch) {
    try {
      const concertRef = doc(db, 'concerts', concert.id);
      
      const updateData = {
        contactId: concert.data.contactId_migrated,
        contactIds: null, // Supprimer les contactIds
        contactId_migrated: null, // Nettoyer la sauvegarde
        updatedAt: serverTimestamp()
      };

      firestoreBatch.update(concertRef, updateData);

      if (VERBOSE) {
        console.log(`      ✅ Concert ${concert.data.nom} préparé pour rollback`);
        if (concert.data.contactIds.length > 1) {
          console.log(`         ⚠️  ${concert.data.contactIds.length - 1} contact(s) perdus`);
        }
      }

      stats.concertsRolledBack++;

    } catch (error) {
      console.error(`      ❌ Erreur concert ${concert.id}:`, error);
      stats.errors.push({
        concertId: concert.id,
        error: error.message
      });
    }
  }

  try {
    await firestoreBatch.commit();
    console.log(`      ✅ Lot ${batchNumber} restauré avec succès`);

    // Mettre à jour les relations bidirectionnelles
    for (const concert of batch) {
      await updateBidirectionalRelationRollback(concert.id, concert.data.contactIds, concert.data.contactId_migrated);
    }

  } catch (error) {
    console.error(`      ❌ Erreur lors du commit du lot ${batchNumber}:`, error);
    throw error;
  }
}

/**
 * Met à jour les relations bidirectionnelles pour le rollback
 */
async function updateBidirectionalRelationRollback(concertId, oldContactIds, newContactId) {
  try {
    // Supprimer le concert de tous les anciens contacts
    for (const contactId of oldContactIds) {
      const contactRef = doc(db, 'contacts', contactId);
      const contactDoc = await getDoc(contactRef);

      if (contactDoc.exists()) {
        const contactData = contactDoc.data();
        let concertsIds = contactData.concertsIds || [];

        // Supprimer l'ID du concert
        concertsIds = concertsIds.filter(id => id !== concertId);

        if (!DRY_RUN) {
          await updateDoc(contactRef, {
            concertsIds: concertsIds,
            updatedAt: serverTimestamp()
          });
        }

        if (VERBOSE) {
          console.log(`      🔗 Relation supprimée: contact ${contactId} ↔ concert ${concertId}`);
        }
      }
    }

    // Ajouter le concert au nouveau contact principal
    const newContactRef = doc(db, 'contacts', newContactId);
    const newContactDoc = await getDoc(newContactRef);

    if (newContactDoc.exists()) {
      const contactData = newContactDoc.data();
      let concertsIds = contactData.concertsIds || [];

      if (!concertsIds.includes(concertId)) {
        concertsIds.push(concertId);

        if (!DRY_RUN) {
          await updateDoc(newContactRef, {
            concertsIds: concertsIds,
            updatedAt: serverTimestamp()
          });
        }

        stats.bidirectionalUpdates++;

        if (VERBOSE) {
          console.log(`      🔗 Relation ajoutée: contact ${newContactId} ↔ concert ${concertId}`);
        }
      }
    }

  } catch (error) {
    console.error(`      ❌ Erreur relation bidirectionnelle rollback:`, error);
    stats.errors.push({
      type: 'bidirectional_rollback',
      concertId,
      error: error.message
    });
  }
}

/**
 * Vérifie le rollback
 */
async function verifyRollback() {
  console.log('\n🔍 Phase 3: Vérification post-rollback...');

  try {
    const concertsWithContactId = query(
      collection(db, 'concerts'),
      where('contactId', '!=', null)
    );
    const verifySnapshot = await getDocs(concertsWithContactId);

    let rolledBackCount = 0;
    let stillHaveContactIds = 0;

    verifySnapshot.forEach(doc => {
      const data = doc.data();
      if (data.contactId && typeof data.contactId === 'string') {
        rolledBackCount++;
      }
      if (data.contactIds && Array.isArray(data.contactIds) && data.contactIds.length > 0) {
        stillHaveContactIds++;
      }
    });

    console.log(`   ✅ Concerts avec contactId: ${rolledBackCount}`);
    console.log(`   ⚠️  Concerts avec encore contactIds: ${stillHaveContactIds}`);

  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error);
  }
}

/**
 * Rapport final
 */
function printFinalReport() {
  console.log('\n📋 RAPPORT FINAL DE ROLLBACK');
  console.log('==============================');
  console.log(`Mode d'exécution: ${DRY_RUN ? 'DRY-RUN (simulation)' : 'LIVE'}`);
  console.log(`Concerts totaux: ${stats.totalConcerts}`);
  console.log(`Concerts à restaurer: ${stats.concertsToRollback}`);
  console.log(`Concerts restaurés: ${stats.concertsRolledBack}`);
  console.log(`Relations bidirectionnelles mises à jour: ${stats.bidirectionalUpdates}`);
  console.log(`Erreurs: ${stats.errors.length}`);

  if (stats.errors.length > 0) {
    console.log('\n❌ ERREURS RENCONTRÉES:');
    stats.errors.forEach((error, index) => {
      console.log(`   ${index + 1}. ${error.concertId || error.type}: ${error.error}`);
    });
  }

  if (DRY_RUN) {
    console.log('\n🧪 Ceci était une simulation. Relancez sans --dry-run pour appliquer le rollback.');
  } else if (stats.concertsRolledBack > 0) {
    console.log('\n✅ Rollback terminé !');
    console.log('   ⚠️  Le système est revenu à contactId (un seul contact par concert)');
    console.log('   ⚠️  Les contacts supplémentaires ont été perdus');
  }
}

/**
 * Point d'entrée
 */
if (require.main === module) {
  rollbackConcertContacts()
    .then(() => {
      console.log('🎉 Rollback terminé');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Erreur fatale:', error);
      process.exit(1);
    });
}

module.exports = {
  rollbackConcertContacts
};