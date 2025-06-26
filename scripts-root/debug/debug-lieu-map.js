// Script de diagnostic pour comprendre pourquoi les cartes des lieux ne s'affichent pas

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, doc, getDoc, getDocs, query, where } = require('firebase/firestore');

// Configuration Firebase
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function debugLieuMap() {
  console.log('=== DIAGNOSTIC: Affichage des cartes de lieux dans les concerts ===\n');

  try {
    // 1. Récupérer quelques concerts avec lieu
    console.log('1. Recherche de concerts avec lieuId...\n');
    const concertsSnapshot = await getDocs(collection(db, 'concerts'));
    
    const concertsWithLieu = [];
    concertsSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.lieuId) {
        concertsWithLieu.push({ id: doc.id, ...data });
      }
    });

    console.log(`Nombre de concerts avec lieuId: ${concertsWithLieu.length}`);

    if (concertsWithLieu.length === 0) {
      console.log('PROBLÈME: Aucun concert n\'a de lieuId défini!');
      return;
    }

    // 2. Vérifier les lieux associés
    console.log('\n2. Vérification des lieux associés...\n');
    
    for (let i = 0; i < Math.min(5, concertsWithLieu.length); i++) {
      const concert = concertsWithLieu[i];
      console.log(`\nConcert ${i + 1}: ${concert.titre || 'Sans titre'} (ID: ${concert.id})`);
      console.log(`- lieuId: ${concert.lieuId}`);
      console.log(`- organizationId: ${concert.organizationId || 'NON DÉFINI'}`);

      if (concert.lieuId) {
        try {
          const lieuDoc = await getDoc(doc(db, 'lieux', concert.lieuId));
          
          if (lieuDoc.exists()) {
            const lieuData = lieuDoc.data();
            console.log(`✅ Lieu trouvé: ${lieuData.nom || 'Sans nom'}`);
            console.log(`  - organizationId: ${lieuData.organizationId || 'NON DÉFINI'}`);
            console.log(`  - adresse: ${lieuData.adresse || 'NON DÉFINIE'}`);
            console.log(`  - codePostal: ${lieuData.codePostal || 'NON DÉFINI'}`);
            console.log(`  - ville: ${lieuData.ville || 'NON DÉFINIE'}`);
            console.log(`  - latitude: ${lieuData.latitude || 'NON DÉFINIE'}`);
            console.log(`  - longitude: ${lieuData.longitude || 'NON DÉFINIE'}`);
            
            // Vérifier si l'adresse est présente (nécessaire pour la carte)
            if (!lieuData.adresse) {
              console.log('  ⚠️ PROBLÈME: Ce lieu n\'a pas d\'adresse définie!');
            }
            
            // Vérifier la cohérence des organizationId
            if (concert.organizationId !== lieuData.organizationId) {
              console.log('  ⚠️ PROBLÈME: Les organizationId ne correspondent pas!');
            }
          } else {
            console.log(`❌ Lieu avec ID ${concert.lieuId} introuvable!`);
          }
        } catch (error) {
          console.log(`❌ Erreur lors du chargement du lieu: ${error.message}`);
        }
      }
    }

    // 3. Analyser la structure des données
    console.log('\n3. Analyse de la structure des données...\n');
    
    // Vérifier un lieu spécifique qui devrait avoir une adresse
    const lieuxSnapshot = await getDocs(collection(db, 'lieux'));
    
    const lieuxWithAddress = [];
    lieuxSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.adresse) {
        lieuxWithAddress.push({ id: doc.id, ...data });
      }
    });
    
    console.log(`Nombre total de lieux: ${lieuxSnapshot.size}`);
    console.log(`Nombre de lieux avec adresse: ${lieuxWithAddress.length}`);
    
    if (lieuxWithAddress.length > 0) {
      const premierLieu = lieuxWithAddress[0];
      console.log('\nExemple de lieu avec adresse complète:');
      console.log(`- ID: ${premierLieu.id}`);
      console.log(`- nom: ${premierLieu.nom}`);
      console.log(`- adresse: ${premierLieu.adresse}`);
      console.log(`- codePostal: ${premierLieu.codePostal}`);
      console.log(`- ville: ${premierLieu.ville}`);
      console.log(`- organizationId: ${premierLieu.organizationId}`);
    }

    // 4. Recommandations
    console.log('\n4. RECOMMANDATIONS:\n');
    console.log('- Vérifier que les lieux ont bien une adresse définie');
    console.log('- Vérifier que les organizationId correspondent entre concerts et lieux');
    console.log('- Vérifier les logs de la console du navigateur pour les erreurs de chargement');
    console.log('- Vérifier que useGenericEntityDetails charge bien les relations avec le bon organizationId');

  } catch (error) {
    console.error('Erreur lors du diagnostic:', error);
  }
}

// Exécuter le diagnostic
debugLieuMap().then(() => {
  console.log('\n=== FIN DU DIAGNOSTIC ===');
  process.exit(0);
}).catch(error => {
  console.error('Erreur fatale:', error);
  process.exit(1);
});