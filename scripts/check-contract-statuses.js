#!/usr/bin/env node

/**
 * Script de diagnostic pour vérifier l'état des statuts de contrats
 * 
 * Ce script analyse les incohérences entre les collections contrats et concerts
 * sans modifier aucune donnée.
 * 
 * Usage: node scripts/check-contract-statuses.js [concertId]
 */

const { initializeApp } = require('firebase/app');
const { 
  getFirestore, 
  collection, 
  getDocs, 
  doc, 
  getDoc,
  query,
  where,
  limit
} = require('firebase/firestore');

// Configuration Firebase - À adapter selon votre environnement
const firebaseConfig = {
  // Copiez votre configuration Firebase ici
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Fonction pour vérifier un concert spécifique
async function checkSpecificConcert(concertId) {
  console.log(`\n🔍 Analyse du concert ${concertId}\n`);
  
  try {
    // Charger le concert
    const concertDoc = await getDoc(doc(db, 'concerts', concertId));
    if (!concertDoc.exists()) {
      console.log('❌ Concert non trouvé');
      return;
    }
    
    const concert = concertDoc.data();
    console.log('📋 Données du concert :');
    console.log(`  - contratId: ${concert.contratId || 'NON DÉFINI'}`);
    console.log(`  - contratStatus: ${concert.contratStatus || 'NON DÉFINI'}`);
    console.log(`  - contratStatut: ${concert.contratStatut || 'NON DÉFINI'} ${concert.contratStatut ? '⚠️ LEGACY' : ''}`);
    console.log(`  - hasContratRedige: ${concert.hasContratRedige || 'NON DÉFINI'} ${concert.hasContratRedige ? '⚠️ LEGACY' : ''}`);
    
    // Charger le contrat si référencé
    if (concert.contratId) {
      console.log(`\n📄 Données du contrat (ID: ${concert.contratId}) :`);
      const contratDoc = await getDoc(doc(db, 'contrats', concert.contratId));
      
      if (contratDoc.exists()) {
        const contrat = contratDoc.data();
        console.log(`  - status: ${contrat.status || 'NON DÉFINI'}`);
        console.log(`  - contratStatut: ${contrat.contratStatut || 'NON DÉFINI'} ${contrat.contratStatut ? '⚠️ LEGACY' : ''}`);
        console.log(`  - finalizedAt: ${contrat.finalizedAt ? '✅ OUI' : '❌ NON'}`);
        console.log(`  - contratContenu: ${contrat.contratContenu ? '✅ OUI' : '❌ NON'}`);
        
        // Vérifier les incohérences
        console.log('\n🚨 Analyse des incohérences :');
        if (concert.contratStatus !== contrat.status) {
          console.log(`  ⚠️ Statuts désynchronisés : concert="${concert.contratStatus}" vs contrat="${contrat.status}"`);
        } else {
          console.log('  ✅ Statuts synchronisés');
        }
        
        if (contrat.finalizedAt && contrat.status !== 'finalized') {
          console.log('  ⚠️ Le contrat a une date de finalisation mais n\'est pas marqué comme "finalized"');
        }
        
        if (contrat.contratContenu && !contrat.status) {
          console.log('  ⚠️ Le contrat a du contenu mais pas de statut défini');
        }
      } else {
        console.log('  ❌ Contrat référencé mais non trouvé dans la base');
      }
    } else {
      console.log('\n❌ Aucun contrat associé à ce concert');
    }
    
  } catch (error) {
    console.error('Erreur lors de l\'analyse :', error);
  }
}

// Fonction pour analyser tous les concerts
async function analyzeAllConcerts() {
  console.log('\n📊 Analyse globale des statuts de contrats\n');
  
  try {
    // Charger tous les concerts
    const concertsSnapshot = await getDocs(collection(db, 'concerts'));
    const concerts = [];
    concertsSnapshot.forEach(doc => {
      concerts.push({ id: doc.id, ...doc.data() });
    });
    
    // Charger tous les contrats
    const contratsSnapshot = await getDocs(collection(db, 'contrats'));
    const contrats = {};
    contratsSnapshot.forEach(doc => {
      contrats[doc.id] = { id: doc.id, ...doc.data() };
    });
    
    // Statistiques
    let stats = {
      totalConcerts: concerts.length,
      concertsAvecContrat: 0,
      concertsAvecLegacyFields: 0,
      contratsTotal: Object.keys(contrats).length,
      contratsAvecLegacyFields: 0,
      statusDesynchronises: 0,
      contratsOrphelins: 0,
      problemes: []
    };
    
    // Analyser chaque concert
    concerts.forEach(concert => {
      if (concert.contratId) {
        stats.concertsAvecContrat++;
        
        // Vérifier les champs legacy
        if (concert.contratStatut || concert.hasContratRedige) {
          stats.concertsAvecLegacyFields++;
        }
        
        // Vérifier la synchronisation
        const contrat = contrats[concert.contratId];
        if (contrat) {
          if (concert.contratStatus !== contrat.status) {
            stats.statusDesynchronises++;
            stats.problemes.push({
              concertId: concert.id,
              type: 'DÉSYNCHRONISÉ',
              details: `Concert: "${concert.contratStatus}" vs Contrat: "${contrat.status}"`
            });
          }
        } else {
          stats.contratsOrphelins++;
          stats.problemes.push({
            concertId: concert.id,
            type: 'CONTRAT ORPHELIN',
            details: `Référence vers contrat ${concert.contratId} inexistant`
          });
        }
      }
    });
    
    // Analyser les contrats
    Object.values(contrats).forEach(contrat => {
      if (contrat.contratStatut) {
        stats.contratsAvecLegacyFields++;
      }
    });
    
    // Afficher les résultats
    console.log('📈 Statistiques générales :');
    console.log(`  - Concerts total : ${stats.totalConcerts}`);
    console.log(`  - Concerts avec contrat : ${stats.concertsAvecContrat}`);
    console.log(`  - Contrats total : ${stats.contratsTotal}`);
    console.log('\n⚠️  Problèmes détectés :');
    console.log(`  - Concerts avec champs legacy : ${stats.concertsAvecLegacyFields}`);
    console.log(`  - Contrats avec champs legacy : ${stats.contratsAvecLegacyFields}`);
    console.log(`  - Statuts désynchronisés : ${stats.statusDesynchronises}`);
    console.log(`  - Contrats orphelins : ${stats.contratsOrphelins}`);
    
    // Afficher les premiers problèmes
    if (stats.problemes.length > 0) {
      console.log('\n🚨 Exemples de problèmes (max 10) :');
      stats.problemes.slice(0, 10).forEach((probleme, index) => {
        console.log(`\n${index + 1}. Concert ${probleme.concertId}`);
        console.log(`   Type : ${probleme.type}`);
        console.log(`   Détails : ${probleme.details}`);
      });
      
      if (stats.problemes.length > 10) {
        console.log(`\n... et ${stats.problemes.length - 10} autres problèmes`);
      }
    }
    
    // Recommandations
    console.log('\n💡 Recommandations :');
    if (stats.statusDesynchronises > 0 || stats.concertsAvecLegacyFields > 0) {
      console.log('  ⚠️ Exécutez le script de migration pour corriger ces problèmes');
      console.log('     node scripts/migrate-contract-statuses.js');
    } else {
      console.log('  ✅ Aucun problème majeur détecté');
    }
    
  } catch (error) {
    console.error('Erreur lors de l\'analyse :', error);
  }
}

// Fonction principale
async function main() {
  console.log('='.repeat(50));
  console.log('DIAGNOSTIC DES STATUTS DE CONTRATS');
  console.log('='.repeat(50));
  
  const concertId = process.argv[2];
  
  if (concertId) {
    // Analyser un concert spécifique
    await checkSpecificConcert(concertId);
  } else {
    // Analyser tous les concerts
    await analyzeAllConcerts();
  }
  
  console.log('\n✨ Analyse terminée');
}

// Lancer le script
main().catch(error => {
  console.error('Erreur fatale :', error);
  process.exit(1);
});