/**
 * Script de migration pour supprimer le champ isPersonneLibre
 * Ce script supprime définitivement le champ isPersonneLibre de toutes les personnes
 * 
 * ATTENTION : Cette opération est irréversible !
 * Assurez-vous d'avoir une sauvegarde avant d'exécuter ce script.
 */

import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  getDocs, 
  doc, 
  updateDoc,
  deleteField,
  writeBatch
} from 'firebase/firestore';
import { config } from '../src/config/index.js';

// Initialiser Firebase
const app = initializeApp(config.firebase);
const db = getFirestore(app);

/**
 * Supprimer le champ isPersonneLibre de toutes les personnes
 */
async function cleanupPersonneLibre() {
  console.log('🧹 Démarrage du nettoyage du champ isPersonneLibre...\n');
  
  try {
    // Récupérer toutes les personnes
    const personnesSnapshot = await getDocs(collection(db, 'personnes'));
    console.log(`📊 Total de personnes à traiter : ${personnesSnapshot.size}`);
    
    let processed = 0;
    let cleaned = 0;
    let errors = 0;
    
    // Traiter par batch de 500 (limite Firestore)
    const batchSize = 500;
    const totalBatches = Math.ceil(personnesSnapshot.docs.length / batchSize);
    
    for (let i = 0; i < totalBatches; i++) {
      const batch = writeBatch(db);
      const startIdx = i * batchSize;
      const endIdx = Math.min(startIdx + batchSize, personnesSnapshot.docs.length);
      const batchDocs = personnesSnapshot.docs.slice(startIdx, endIdx);
      
      console.log(`\n🔄 Traitement du batch ${i + 1}/${totalBatches} (${batchDocs.length} documents)`);
      
      let batchCleaned = 0;
      
      batchDocs.forEach(docSnapshot => {
        const data = docSnapshot.data();
        processed++;
        
        // Vérifier si le champ existe
        if ('isPersonneLibre' in data) {
          // Supprimer le champ
          batch.update(doc(db, 'personnes', docSnapshot.id), {
            isPersonneLibre: deleteField()
          });
          batchCleaned++;
          
          // Log pour les premiers documents
          if (cleaned < 5) {
            console.log(`  ✓ Nettoyage de ${data.prenom || ''} ${data.nom || ''} (ID: ${docSnapshot.id})`);
          }
        }
      });
      
      // Exécuter le batch si nécessaire
      if (batchCleaned > 0) {
        try {
          await batch.commit();
          cleaned += batchCleaned;
          console.log(`  ✅ Batch ${i + 1} terminé : ${batchCleaned} documents nettoyés`);
        } catch (error) {
          console.error(`  ❌ Erreur lors du batch ${i + 1} :`, error.message);
          errors += batchCleaned;
        }
      } else {
        console.log(`  ℹ️  Batch ${i + 1} : Aucun document à nettoyer`);
      }
    }
    
    // Résumé
    console.log('\n' + '='.repeat(50));
    console.log('📊 RÉSUMÉ DU NETTOYAGE');
    console.log('='.repeat(50));
    console.log(`Total de personnes traitées : ${processed}`);
    console.log(`Documents nettoyés : ${cleaned}`);
    console.log(`Documents déjà propres : ${processed - cleaned}`);
    if (errors > 0) {
      console.log(`⚠️  Erreurs : ${errors}`);
    }
    console.log('='.repeat(50));
    
    if (cleaned > 0) {
      console.log('\n✅ Nettoyage terminé avec succès !');
      console.log('Le champ isPersonneLibre a été supprimé de la base de données.');
    } else {
      console.log('\n✅ Aucun nettoyage nécessaire.');
      console.log('Le champ isPersonneLibre n\'existe dans aucun document.');
    }
    
  } catch (error) {
    console.error('\n❌ Erreur lors du nettoyage :', error);
  }
}

// Confirmation avant exécution
console.log('⚠️  ATTENTION : Ce script va supprimer définitivement le champ isPersonneLibre');
console.log('de toutes les personnes dans Firebase.');
console.log('\nCette opération est IRRÉVERSIBLE !');
console.log('Assurez-vous d\'avoir une sauvegarde de votre base de données.\n');

// Attendre 5 secondes avant de démarrer
console.log('Le script va démarrer dans 5 secondes...');
console.log('Appuyez sur Ctrl+C pour annuler.\n');

setTimeout(() => {
  cleanupPersonneLibre().then(() => {
    console.log('\n🏁 Script terminé.');
    process.exit(0);
  }).catch(error => {
    console.error('\n❌ Erreur fatale :', error);
    process.exit(1);
  });
}, 5000);