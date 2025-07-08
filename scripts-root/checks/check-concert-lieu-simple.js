// Script simple pour vérifier l'état des relations concert-lieu

const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

// Initialiser Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function checkConcertLieu() {
  console.log('=== VÉRIFICATION SIMPLE CONCERT-LIEU ===\n');

  try {
    // 1. Récupérer les premiers concerts
    console.log('1. Récupération des concerts...\n');
    const concertsSnapshot = await db.collection('concerts').limit(10).get();
    
    console.log(`Nombre de concerts récupérés: ${concertsSnapshot.size}`);
    
    // 2. Analyser chaque concert
    const results = [];
    
    for (const doc of concertsSnapshot.docs) {
      const concert = doc.data();
      const result = {
        id: doc.id,
        titre: concert.titre || 'Sans titre',
        lieuId: concert.lieuId || null,
        entrepriseId: concert.entrepriseId || null,
        lieu: null
      };
      
      // Si le concert a un lieuId, chercher le lieu
      if (concert.lieuId) {
        try {
          const lieuDoc = await db.collection('lieux').doc(concert.lieuId).get();
          if (lieuDoc.exists) {
            const lieuData = lieuDoc.data();
            result.lieu = {
              exists: true,
              nom: lieuData.nom || 'Sans nom',
              adresse: lieuData.adresse || null,
              ville: lieuData.ville || null,
              entrepriseId: lieuData.entrepriseId || null
            };
          } else {
            result.lieu = { exists: false, error: 'Document lieu introuvable' };
          }
        } catch (error) {
          result.lieu = { exists: false, error: error.message };
        }
      }
      
      results.push(result);
    }
    
    // 3. Afficher les résultats
    console.log('\n2. RÉSULTATS:\n');
    
    results.forEach((result, index) => {
      console.log(`Concert ${index + 1}: ${result.titre}`);
      console.log(`  - ID: ${result.id}`);
      console.log(`  - lieuId: ${result.lieuId || 'NON DÉFINI'}`);
      console.log(`  - entrepriseId: ${result.entrepriseId || 'NON DÉFINI'}`);
      
      if (result.lieuId) {
        if (result.lieu && result.lieu.exists) {
          console.log(`  - Lieu trouvé: ${result.lieu.nom}`);
          console.log(`    - Adresse: ${result.lieu.adresse || 'NON DÉFINIE'}`);
          console.log(`    - Ville: ${result.lieu.ville || 'NON DÉFINIE'}`);
          console.log(`    - EntrepriseId lieu: ${result.lieu.entrepriseId || 'NON DÉFINI'}`);
          
          if (!result.lieu.adresse) {
            console.log('    ⚠️  PAS D\'ADRESSE - La carte ne s\'affichera pas!');
          }
          
          if (result.entrepriseId !== result.lieu.entrepriseId) {
            console.log('    ⚠️  EntrepriseId différents!');
          }
        } else {
          console.log(`  ❌ Lieu introuvable: ${result.lieu?.error || 'Erreur inconnue'}`);
        }
      } else {
        console.log('  ❌ Pas de lieuId défini');
      }
      
      console.log('');
    });
    
    // 4. Statistiques
    console.log('\n3. STATISTIQUES:\n');
    const stats = {
      total: results.length,
      avecLieuId: results.filter(r => r.lieuId).length,
      sansLieuId: results.filter(r => !r.lieuId).length,
      lieuTrouve: results.filter(r => r.lieu?.exists).length,
      lieuIntrouvable: results.filter(r => r.lieuId && !r.lieu?.exists).length,
      lieuSansAdresse: results.filter(r => r.lieu?.exists && !r.lieu.adresse).length,
      organizationDifferente: results.filter(r => r.lieu?.exists && r.entrepriseId !== r.lieu.entrepriseId).length
    };
    
    console.log(`Total concerts analysés: ${stats.total}`);
    console.log(`Concerts avec lieuId: ${stats.avecLieuId}`);
    console.log(`Concerts sans lieuId: ${stats.sansLieuId}`);
    console.log(`Lieux trouvés: ${stats.lieuTrouve}`);
    console.log(`Lieux introuvables: ${stats.lieuIntrouvable}`);
    console.log(`Lieux sans adresse: ${stats.lieuSansAdresse}`);
    console.log(`EntrepriseId différents: ${stats.organizationDifferente}`);
    
  } catch (error) {
    console.error('Erreur:', error);
  }
}

// Exécuter la vérification
checkConcertLieu().then(() => {
  console.log('\n=== FIN DE LA VÉRIFICATION ===');
  process.exit(0);
});