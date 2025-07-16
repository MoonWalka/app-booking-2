#!/usr/bin/env node

/**
 * Script de diagnostic pour préparer la migration contactId -> contactIds
 * Analyse l'état actuel des données avant migration
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Configuration Firebase Admin
const serviceAccountPath = path.join(__dirname, '../tourcraft-firebase-key.json');
if (!fs.existsSync(serviceAccountPath)) {
  console.error('❌ Fichier de clé de service Firebase non trouvé');
  console.log('Créez un script pour exécuter dans la console du navigateur à la place');
  process.exit(1);
}

const serviceAccount = require(serviceAccountPath);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function runDiagnostic() {
  console.log('🔍 DIAGNOSTIC PRÉ-MIGRATION CONTACTS');
  console.log('=====================================\n');
  
  const report = {
    timestamp: new Date().toISOString(),
    concerts: {
      total: 0,
      avecContactId: 0,
      avecContactIds: 0,
      avecLesDeuxChamps: 0,
      sansContact: 0,
      contactsOrphelins: []
    },
    lieux: {
      total: 0,
      avecContactIds: 0,
      sansContactIds: 0,
      formatIncorrect: []
    },
    structures: {
      total: 0,
      avecContactsIds: 0,
      avecContactIds: 0
    },
    relations: {
      concertContactValides: 0,
      concertContactManquantes: 0,
      lieuContactValides: 0,
      lieuContactManquantes: 0
    },
    recommandations: []
  };
  
  try {
    // 1. Analyser les CONCERTS
    console.log('📋 Analyse des concerts...');
    const concertsSnapshot = await db.collection('concerts').get();
    report.concerts.total = concertsSnapshot.size;
    
    for (const doc of concertsSnapshot.docs) {
      const concert = doc.data();
      
      if (concert.contactId) {
        report.concerts.avecContactId++;
        
        // Vérifier si le contact existe
        const contactDoc = await db.collection('contacts').doc(concert.contactId).get();
        if (!contactDoc.exists) {
          report.concerts.contactsOrphelins.push({
            concertId: doc.id,
            concertNom: concert.nom,
            contactIdInexistant: concert.contactId
          });
        }
      }
      
      if (concert.contactIds && Array.isArray(concert.contactIds)) {
        report.concerts.avecContactIds++;
      }
      
      if (concert.contactId && concert.contactIds) {
        report.concerts.avecLesDeuxChamps++;
      }
      
      if (!concert.contactId && (!concert.contactIds || concert.contactIds.length === 0)) {
        report.concerts.sansContact++;
      }
    }
    
    // 2. Analyser les LIEUX
    console.log('\n📍 Analyse des lieux...');
    const lieuxSnapshot = await db.collection('lieux').get();
    report.lieux.total = lieuxSnapshot.size;
    
    for (const doc of lieuxSnapshot.docs) {
      const lieu = doc.data();
      
      if (lieu.contactIds) {
        if (Array.isArray(lieu.contactIds)) {
          report.lieux.avecContactIds++;
        } else {
          report.lieux.formatIncorrect.push({
            lieuId: doc.id,
            lieuNom: lieu.nom,
            format: typeof lieu.contactIds
          });
        }
      } else {
        report.lieux.sansContactIds++;
      }
    }
    
    // 3. Analyser les STRUCTURES
    console.log('\n🏢 Analyse des structures...');
    const structuresSnapshot = await db.collection('structures').get();
    report.structures.total = structuresSnapshot.size;
    
    for (const doc of structuresSnapshot.docs) {
      const structure = doc.data();
      
      if (structure.contactsIds && Array.isArray(structure.contactsIds)) {
        report.structures.avecContactsIds++;
      }
      if (structure.contactIds && Array.isArray(structure.contactIds)) {
        report.structures.avecContactIds++;
      }
    }
    
    // 4. Analyser les RELATIONS BIDIRECTIONNELLES
    console.log('\n🔗 Analyse des relations bidirectionnelles...');
    
    // Vérifier Concert -> Contact
    for (const doc of concertsSnapshot.docs) {
      const concert = doc.data();
      if (concert.contactId) {
        const contactDoc = await db.collection('contacts').doc(concert.contactId).get();
        if (contactDoc.exists) {
          const contact = contactDoc.data();
          if (contact.concertsIds && contact.concertsIds.includes(doc.id)) {
            report.relations.concertContactValides++;
          } else {
            report.relations.concertContactManquantes++;
          }
        }
      }
    }
    
    // 5. GÉNÉRER LES RECOMMANDATIONS
    if (report.concerts.avecLesDeuxChamps > 0) {
      report.recommandations.push({
        niveau: 'CRITIQUE',
        message: `${report.concerts.avecLesDeuxChamps} concerts ont à la fois contactId et contactIds`,
        action: 'Vérifier la cohérence et nettoyer avant migration'
      });
    }
    
    if (report.concerts.contactsOrphelins.length > 0) {
      report.recommandations.push({
        niveau: 'IMPORTANT',
        message: `${report.concerts.contactsOrphelins.length} concerts référencent des contacts inexistants`,
        action: 'Nettoyer les références orphelines'
      });
    }
    
    if (report.structures.avecContactsIds > 0) {
      report.recommandations.push({
        niveau: 'MOYEN',
        message: `Les structures utilisent 'contactsIds' au lieu de 'contactIds'`,
        action: 'Harmoniser vers contactIds partout'
      });
    }
    
    // 6. AFFICHER LE RAPPORT
    console.log('\n📊 RAPPORT DE DIAGNOSTIC');
    console.log('========================\n');
    
    console.log(`📅 Date: ${report.timestamp}`);
    
    console.log('\n🎵 CONCERTS:');
    console.log(`  Total: ${report.concerts.total}`);
    console.log(`  Avec contactId (ancien): ${report.concerts.avecContactId}`);
    console.log(`  Avec contactIds (nouveau): ${report.concerts.avecContactIds}`);
    console.log(`  Avec les DEUX champs: ${report.concerts.avecLesDeuxChamps} ⚠️`);
    console.log(`  Sans contact: ${report.concerts.sansContact}`);
    console.log(`  Contacts orphelins: ${report.concerts.contactsOrphelins.length}`);
    
    console.log('\n📍 LIEUX:');
    console.log(`  Total: ${report.lieux.total}`);
    console.log(`  Avec contactIds: ${report.lieux.avecContactIds}`);
    console.log(`  Sans contactIds: ${report.lieux.sansContactIds}`);
    console.log(`  Format incorrect: ${report.lieux.formatIncorrect.length}`);
    
    console.log('\n🏢 STRUCTURES:');
    console.log(`  Total: ${report.structures.total}`);
    console.log(`  Avec contactsIds (à migrer): ${report.structures.avecContactsIds}`);
    console.log(`  Avec contactIds (correct): ${report.structures.avecContactIds}`);
    
    console.log('\n🔗 RELATIONS:');
    console.log(`  Concert->Contact valides: ${report.relations.concertContactValides}`);
    console.log(`  Concert->Contact manquantes: ${report.relations.concertContactManquantes}`);
    
    if (report.recommandations.length > 0) {
      console.log('\n⚡ RECOMMANDATIONS:');
      report.recommandations.forEach(rec => {
        console.log(`\n  [${rec.niveau}] ${rec.message}`);
        console.log(`  → ${rec.action}`);
      });
    }
    
    // 7. SAUVEGARDER LE RAPPORT
    const reportPath = path.join(__dirname, `diagnostic-contacts-${Date.now()}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n💾 Rapport sauvegardé: ${reportPath}`);
    
    // 8. ESTIMATION DE LA MIGRATION
    const totalAMigrer = report.concerts.avecContactId - report.concerts.avecContactIds;
    console.log('\n📈 ESTIMATION:');
    console.log(`  Concerts à migrer: ${totalAMigrer}`);
    console.log(`  Durée estimée: ${Math.ceil(totalAMigrer / 100)} minutes`);
    
  } catch (error) {
    console.error('❌ Erreur durant le diagnostic:', error);
  }
  
  process.exit(0);
}

// Alternative : Script pour la console du navigateur
const browserScript = `
// DIAGNOSTIC CONTACTS - À exécuter dans la console du navigateur

(async function diagnosticContacts() {
  console.log('🔍 DIAGNOSTIC CONTACTS DANS LE NAVIGATEUR');
  console.log('=======================================\\n');
  
  const { collection, getDocs, doc, getDoc, db } = window.FirebaseService || {};
  
  if (!db) {
    console.error('❌ Firebase non disponible');
    return;
  }
  
  const stats = {
    concerts: { total: 0, avecContactId: 0, avecContactIds: 0, avecLesDeux: 0 },
    lieux: { total: 0, avecContactIds: 0 },
    structures: { total: 0, avecContactsIds: 0 }
  };
  
  try {
    // Concerts
    const concertsSnapshot = await getDocs(collection(db, 'concerts'));
    stats.concerts.total = concertsSnapshot.size;
    
    concertsSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.contactId) stats.concerts.avecContactId++;
      if (data.contactIds && Array.isArray(data.contactIds)) stats.concerts.avecContactIds++;
      if (data.contactId && data.contactIds) stats.concerts.avecLesDeux++;
    });
    
    // Lieux
    const lieuxSnapshot = await getDocs(collection(db, 'lieux'));
    stats.lieux.total = lieuxSnapshot.size;
    
    lieuxSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.contactIds && Array.isArray(data.contactIds)) stats.lieux.avecContactIds++;
    });
    
    // Structures
    const structuresSnapshot = await getDocs(collection(db, 'structures'));
    stats.structures.total = structuresSnapshot.size;
    
    structuresSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.contactsIds && Array.isArray(data.contactsIds)) stats.structures.avecContactsIds++;
    });
    
    console.log('📊 RÉSULTATS:\\n');
    console.table(stats);
    
    console.log('\\n💡 ACTIONS NÉCESSAIRES:');
    console.log(\`- Migrer \${stats.concerts.avecContactId - stats.concerts.avecContactIds} concerts\`);
    console.log(\`- Nettoyer \${stats.concerts.avecLesDeux} concerts avec les deux champs\`);
    console.log(\`- Harmoniser \${stats.structures.avecContactsIds} structures (contactsIds → contactIds)\`);
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
})();
`;

console.log('\n📝 Script alternatif pour la console du navigateur:');
console.log('================================================');
console.log(browserScript);
console.log('================================================\n');

// Vérifier si on peut se connecter à Firebase Admin
if (fs.existsSync(serviceAccountPath)) {
  runDiagnostic();
} else {
  console.log('💡 Copiez le script ci-dessus dans la console du navigateur');
}