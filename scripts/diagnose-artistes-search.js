#!/usr/bin/env node

/**
 * Script de diagnostic pour comprendre pourquoi la recherche d'artistes ne fonctionne pas
 */

const admin = require('firebase-admin');
const path = require('path');

// Initialiser Firebase Admin
const serviceAccount = require(path.join(__dirname, '../tourcraft-d9287-firebase-adminsdk-55psq-e72c60f69f.json'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function diagnoseArtistesSearch() {
  console.log('🔍 DIAGNOSTIC RECHERCHE ARTISTES\n');
  
  const entrepriseId = '9LjkCJG04pEzbABdHkSf';
  console.log(`Organisation cible : ${entrepriseId}\n`);
  
  try {
    // 1. Compter tous les artistes
    console.log('1️⃣ Comptage global des artistes :');
    const allArtistesSnapshot = await db.collection('artistes').get();
    console.log(`   Total artistes dans la base : ${allArtistesSnapshot.size}`);
    
    // 2. Analyser les entrepriseId
    console.log('\n2️⃣ Analyse des entrepriseId :');
    const orgStats = {};
    let noOrgCount = 0;
    
    allArtistesSnapshot.forEach(doc => {
      const data = doc.data();
      const orgId = data.entrepriseId;
      
      if (!orgId) {
        noOrgCount++;
      } else {
        orgStats[orgId] = (orgStats[orgId] || 0) + 1;
      }
    });
    
    console.log(`   Sans entrepriseId : ${noOrgCount}`);
    console.log('   Distribution par organisation :');
    Object.entries(orgStats).forEach(([orgId, count]) => {
      const marker = orgId === entrepriseId ? ' ⭐' : '';
      console.log(`     - ${orgId}: ${count} artistes${marker}`);
    });
    
    // 3. Rechercher spécifiquement pour l'organisation cible
    console.log(`\n3️⃣ Artistes de l'organisation ${entrepriseId} :`);
    const orgArtistesSnapshot = await db.collection('artistes')
      .where('entrepriseId', '==', entrepriseId)
      .get();
    
    console.log(`   Nombre trouvé : ${orgArtistesSnapshot.size}`);
    
    if (orgArtistesSnapshot.size > 0) {
      console.log('   Liste des artistes :');
      orgArtistesSnapshot.forEach(doc => {
        const data = doc.data();
        console.log(`     - ${data.nom || 'Sans nom'} (ID: ${doc.id})`);
        console.log(`       Style: ${data.style || 'N/A'}`);
        console.log(`       CreatedAt: ${data.createdAt ? new Date(data.createdAt._seconds * 1000).toISOString() : 'N/A'}`);
      });
    }
    
    // 4. Rechercher l'artiste "m'dezoen" spécifiquement
    console.log('\n4️⃣ Recherche spécifique de "m\'dezoen" :');
    
    // Recherche exacte
    const exactSearchSnapshot = await db.collection('artistes')
      .where('nom', '==', "m'dezoen")
      .get();
    console.log(`   Recherche exacte : ${exactSearchSnapshot.size} résultat(s)`);
    
    // Recherche insensible à la casse (récupérer tous et filtrer)
    let caseInsensitiveMatches = [];
    allArtistesSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.nom && data.nom.toLowerCase().includes("m'dezoen".toLowerCase())) {
        caseInsensitiveMatches.push({ id: doc.id, ...data });
      }
    });
    console.log(`   Recherche insensible à la casse : ${caseInsensitiveMatches.length} résultat(s)`);
    
    if (caseInsensitiveMatches.length > 0) {
      console.log('   Détails des correspondances :');
      caseInsensitiveMatches.forEach(artiste => {
        console.log(`     - Nom: "${artiste.nom}"`);
        console.log(`       ID: ${artiste.id}`);
        console.log(`       EntrepriseId: ${artiste.entrepriseId || 'AUCUN'}`);
        console.log(`       Correspond à l'org cible: ${artiste.entrepriseId === entrepriseId ? '✅ OUI' : '❌ NON'}`);
      });
    }
    
    // 5. Recherche partielle pour débugger
    console.log('\n5️⃣ Recherche partielle (commence par "m") :');
    let partialMatches = [];
    allArtistesSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.nom && data.nom.toLowerCase().startsWith('m')) {
        partialMatches.push({ id: doc.id, nom: data.nom, entrepriseId: data.entrepriseId });
      }
    });
    
    console.log(`   Trouvés : ${partialMatches.length} artiste(s)`);
    if (partialMatches.length > 0 && partialMatches.length <= 10) {
      partialMatches.forEach(a => {
        const orgMatch = a.entrepriseId === entrepriseId ? '✅' : '❌';
        console.log(`     - "${a.nom}" (Org: ${a.entrepriseId || 'AUCUN'} ${orgMatch})`);
      });
    }
    
    // 6. Vérifier les index Firestore
    console.log('\n6️⃣ Recommandations :');
    console.log('   - Vérifier que les index composites sont créés pour (entrepriseId, createdAt)');
    console.log('   - S\'assurer que les règles de sécurité permettent la lecture avec entrepriseId');
    console.log('   - Vérifier la cohérence des types de données (string vs null pour entrepriseId)');
    
  } catch (error) {
    console.error('❌ Erreur lors du diagnostic :', error);
  }
  
  process.exit(0);
}

// Exécuter le diagnostic
diagnoseArtistesSearch();