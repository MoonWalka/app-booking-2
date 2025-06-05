/**
 * Script de test rapide pour les corrections des relances automatiques
 */

// Importations nécessaires pour Node.js
const admin = require('firebase-admin');
const path = require('path');

// Configuration Firebase
if (!admin.apps.length) {
  const serviceAccount = {
    type: "service_account",
    project_id: "app-booking-0",
    // Clés simplifiées pour test local
  };
  
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

/**
 * Test rapide des relances automatiques
 */
async function testRelancesAutomatiques() {
  console.log('🧪 Test des corrections des relances automatiques');
  
  try {
    // 1. Chercher un concert de test
    const concertsSnapshot = await db.collection('concerts')
      .where('organizationId', '==', 'tTvA6fzQpi6u3kx8wZO8')
      .limit(1)
      .get();
    
    if (concertsSnapshot.empty) {
      console.log('❌ Aucun concert trouvé pour les tests');
      return;
    }
    
    const concertDoc = concertsSnapshot.docs[0];
    const concert = { id: concertDoc.id, ...concertDoc.data() };
    
    console.log(`📋 Concert de test: ${concert.titre} (${concert.id})`);
    
    // 2. Vérifier les relances existantes
    const relancesSnapshot = await db.collection('relances')
      .where('concertId', '==', concert.id)
      .where('organizationId', '==', 'tTvA6fzQpi6u3kx8wZO8')
      .where('automatique', '==', true)
      .get();
    
    console.log(`📊 Relances automatiques existantes: ${relancesSnapshot.size}`);
    
    const relances = relancesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Grouper par type pour détecter les doublons
    const relancesParType = {};
    relances.forEach(relance => {
      if (!relancesParType[relance.type]) {
        relancesParType[relance.type] = [];
      }
      relancesParType[relance.type].push(relance);
    });
    
    console.log('\n📋 Analyse des relances par type:');
    for (const [type, relancesDuType] of Object.entries(relancesParType)) {
      console.log(`  ${type}: ${relancesDuType.length} relance(s)`);
      if (relancesDuType.length > 1) {
        console.log(`    ⚠️ DOUBLON DÉTECTÉ pour le type ${type}`);
        relancesDuType.forEach((relance, index) => {
          const date = relance.dateCreation?.seconds 
            ? new Date(relance.dateCreation.seconds * 1000).toLocaleString()
            : 'Date inconnue';
          console.log(`      ${index + 1}. ${relance.id} (${date})`);
        });
      }
    }
    
    // 3. Vérifier la liste des relances dans le concert
    const relancesListeConcert = concert.relances || [];
    console.log(`\n🔗 Relances listées dans le concert: ${relancesListeConcert.length}`);
    console.log(`📊 Relances réelles trouvées: ${relances.length}`);
    
    if (relancesListeConcert.length !== relances.length) {
      console.log('⚠️ INCOHÉRENCE: Le nombre de relances dans la liste du concert ne correspond pas au nombre de relances réelles');
      
      const relancesManquantes = relances.filter(r => !relancesListeConcert.includes(r.id));
      const relancesOrphelines = relancesListeConcert.filter(id => !relances.find(r => r.id === id));
      
      if (relancesManquantes.length > 0) {
        console.log(`  📋 Relances manquantes dans la liste: ${relancesManquantes.map(r => r.id).join(', ')}`);
      }
      
      if (relancesOrphelines.length > 0) {
        console.log(`  👻 IDs orphelins dans la liste: ${relancesOrphelines.join(', ')}`);
      }
    } else {
      console.log('✅ La liste des relances du concert est cohérente');
    }
    
    // 4. Résumé des problèmes détectés
    const problemes = [];
    
    for (const [type, relancesDuType] of Object.entries(relancesParType)) {
      if (relancesDuType.length > 1) {
        problemes.push(`Doublons pour ${type} (${relancesDuType.length} relances)`);
      }
    }
    
    if (relancesListeConcert.length !== relances.length) {
      problemes.push('Liste des relances incohérente dans le concert');
    }
    
    console.log('\n🎯 RÉSUMÉ:');
    if (problemes.length === 0) {
      console.log('✅ Aucun problème détecté pour ce concert');
    } else {
      console.log('❌ Problèmes détectés:');
      problemes.forEach(probleme => {
        console.log(`  • ${probleme}`);
      });
      
      console.log('\n💡 Solutions recommandées:');
      console.log('  1. Utiliser cleanupRelancesDoublons() pour nettoyer les doublons');
      console.log('  2. Utiliser updateConcertRelancesList() pour corriger la liste du concert');
      console.log('  3. Utiliser fixRelancesConcert() pour réévaluer les relances');
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  }
}

// Test si connecté à Firebase
console.log('🔥 Connexion à Firebase...');
testRelancesAutomatiques()
  .then(() => {
    console.log('\n✅ Test terminé');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Erreur fatale:', error);
    process.exit(1);
  });