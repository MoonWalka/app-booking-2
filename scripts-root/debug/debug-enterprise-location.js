const { initializeApp } = require('firebase/app');
const { getFirestore, doc, getDoc, collection, getDocs } = require('firebase/firestore');

// Configuration Firebase
const firebaseConfig = {
  // Remplacez par votre configuration Firebase
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function findEnterpriseData() {
  console.log('🔍 Recherche des données d\'entreprise dans Firebase...\n');
  
  // Remplacez par l'ID de votre organisation
  const entrepriseId = 'VOTRE_ENTREPRISE_ID'; // À REMPLACER
  
  console.log(`Organisation ID: ${entrepriseId}\n`);
  
  // 1. Vérifier organizations/{id}/settings/entreprise
  try {
    const path1 = `organizations/${entrepriseId}/settings/entreprise`;
    const doc1 = await getDoc(doc(db, 'organizations', entrepriseId, 'settings', 'entreprise'));
    console.log(`✅ Chemin 1: ${path1}`);
    console.log('Existe:', doc1.exists());
    if (doc1.exists()) {
      console.log('Données:', JSON.stringify(doc1.data(), null, 2));
    }
  } catch (error) {
    console.log(`❌ Erreur chemin 1:`, error.message);
  }
  
  console.log('\n---\n');
  
  // 2. Vérifier organizations/{id}/parametres/settings
  try {
    const path2 = `organizations/${entrepriseId}/parametres/settings`;
    const doc2 = await getDoc(doc(db, 'organizations', entrepriseId, 'parametres', 'settings'));
    console.log(`✅ Chemin 2: ${path2}`);
    console.log('Existe:', doc2.exists());
    if (doc2.exists()) {
      const data = doc2.data();
      console.log('Contient entreprise:', !!data.entreprise);
      if (data.entreprise) {
        console.log('Données entreprise:', JSON.stringify(data.entreprise, null, 2));
      }
    }
  } catch (error) {
    console.log(`❌ Erreur chemin 2:`, error.message);
  }
  
  console.log('\n---\n');
  
  // 3. Vérifier parametres/{id}
  try {
    const path3 = `parametres/${entrepriseId}`;
    const doc3 = await getDoc(doc(db, 'parametres', entrepriseId));
    console.log(`✅ Chemin 3: ${path3}`);
    console.log('Existe:', doc3.exists());
    if (doc3.exists()) {
      const data = doc3.data();
      console.log('Contient entreprise:', !!data.entreprise);
      if (data.entreprise) {
        console.log('Données entreprise:', JSON.stringify(data.entreprise, null, 2));
      }
    }
  } catch (error) {
    console.log(`❌ Erreur chemin 3:`, error.message);
  }
  
  console.log('\n---\n');
  
  // 4. Vérifier collaborationConfig/{id}
  try {
    const path4 = `collaborationConfig/${entrepriseId}`;
    const doc4 = await getDoc(doc(db, 'collaborationConfig', entrepriseId));
    console.log(`✅ Chemin 4: ${path4}`);
    console.log('Existe:', doc4.exists());
    if (doc4.exists()) {
      const data = doc4.data();
      console.log('Contient entreprises:', !!data.entreprises);
      if (data.entreprises && data.entreprises.length > 0) {
        console.log('Première entreprise:', JSON.stringify(data.entreprises[0], null, 2));
      }
    }
  } catch (error) {
    console.log(`❌ Erreur chemin 4:`, error.message);
  }
  
  console.log('\n---\n');
  
  // 5. Lister toutes les sous-collections de l'organisation
  try {
    console.log('📁 Sous-collections de l\'organisation:');
    const orgDoc = await getDoc(doc(db, 'organizations', entrepriseId));
    if (orgDoc.exists()) {
      console.log('Document organisation existe ✅');
      // Note: Firestore ne permet pas de lister les sous-collections côté client
      // mais on peut essayer les chemins connus
      const knownSubcollections = ['settings', 'parametres', 'entreprise', 'config'];
      for (const subcoll of knownSubcollections) {
        try {
          const snapshot = await getDocs(collection(db, 'organizations', entrepriseId, subcoll));
          if (!snapshot.empty) {
            console.log(`  - ${subcoll}/ (${snapshot.size} documents)`);
            snapshot.forEach(doc => {
              console.log(`    - ${doc.id}`);
            });
          }
        } catch (e) {
          // Ignorer les erreurs silencieusement
        }
      }
    }
  } catch (error) {
    console.log('❌ Erreur lors de la liste des sous-collections:', error.message);
  }
}

// Exécuter le script
findEnterpriseData()
  .then(() => {
    console.log('\n✅ Analyse terminée');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Erreur:', error);
    process.exit(1);
  });