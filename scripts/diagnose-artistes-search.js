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
  
  const organizationId = '9LjkCJG04pEzbABdHkSf';
  console.log(`Organisation cible : ${organizationId}\n`);
  
  try {
    // 1. Compter tous les artistes
    console.log('1️⃣ Comptage global des artistes :');
    const allArtistesSnapshot = await db.collection('artistes').get();
    console.log(`   Total artistes dans la base : ${allArtistesSnapshot.size}`);
    
    // 2. Analyser les organizationId
    console.log('\n2️⃣ Analyse des organizationId :');
    const orgStats = {};
    let noOrgCount = 0;
    
    allArtistesSnapshot.forEach(doc => {
      const data = doc.data();
      const orgId = data.organizationId;
      
      if (!orgId) {
        noOrgCount++;
      } else {
        orgStats[orgId] = (orgStats[orgId] || 0) + 1;
      }
    });
    
    console.log(`   Sans organizationId : ${noOrgCount}`);
    console.log('   Distribution par organisation :');
    Object.entries(orgStats).forEach(([orgId, count]) => {
      const marker = orgId === organizationId ? ' ⭐' : '';
      console.log(`     - ${orgId}: ${count} artistes${marker}`);
    });
    
    // 3. Rechercher spécifiquement pour l'organisation cible
    console.log(`\n3️⃣ Artistes de l'organisation ${organizationId} :`);
    const orgArtistesSnapshot = await db.collection('artistes')
      .where('organizationId', '==', organizationId)
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
        console.log(`       OrganizationId: ${artiste.organizationId || 'AUCUN'}`);
        console.log(`       Correspond à l'org cible: ${artiste.organizationId === organizationId ? '✅ OUI' : '❌ NON'}`);
      });
    }
    
    // 5. Recherche partielle pour débugger
    console.log('\n5️⃣ Recherche partielle (commence par "m") :');
    let partialMatches = [];
    allArtistesSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.nom && data.nom.toLowerCase().startsWith('m')) {
        partialMatches.push({ id: doc.id, nom: data.nom, organizationId: data.organizationId });
      }
    });
    
    console.log(`   Trouvés : ${partialMatches.length} artiste(s)`);
    if (partialMatches.length > 0 && partialMatches.length <= 10) {
      partialMatches.forEach(a => {
        const orgMatch = a.organizationId === organizationId ? '✅' : '❌';
        console.log(`     - "${a.nom}" (Org: ${a.organizationId || 'AUCUN'} ${orgMatch})`);
      });
    }
    
    // 6. Vérifier les index Firestore
    console.log('\n6️⃣ Recommandations :');
    console.log('   - Vérifier que les index composites sont créés pour (organizationId, createdAt)');
    console.log('   - S\'assurer que les règles de sécurité permettent la lecture avec organizationId');
    console.log('   - Vérifier la cohérence des types de données (string vs null pour organizationId)');
    
  } catch (error) {
    console.error('❌ Erreur lors du diagnostic :', error);
  }
  
  process.exit(0);
}

// Exécuter le diagnostic
diagnoseArtistesSearch();