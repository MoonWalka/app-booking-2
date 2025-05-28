// Script de test pour vérifier les données d'un concert
const { initializeApp } = require('firebase/app');
const { getFirestore, doc, getDoc, collection, getDocs, limit, query } = require('firebase/firestore');

// Configuration Firebase (utiliser les mêmes paramètres que l'app)
const firebaseConfig = {
  apiKey: "AIzaSyBvOkqI2LvBXaj_4W5f6Z5FaZ5FaZ5FaZ5",
  authDomain: "tourcraft-app.firebaseapp.com",
  projectId: "tourcraft-app",
  storageBucket: "tourcraft-app.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function testConcertData() {
  try {
    console.log('🔍 Test des données de concerts...\n');
    
    // Récupérer quelques concerts
    const concertsQuery = query(collection(db, 'concerts'), limit(3));
    const concertsSnapshot = await getDocs(concertsQuery);
    
    if (concertsSnapshot.empty) {
      console.log('❌ Aucun concert trouvé dans la base de données');
      return;
    }
    
    for (const concertDoc of concertsSnapshot.docs) {
      const concertData = { id: concertDoc.id, ...concertDoc.data() };
      
      console.log(`📋 Concert: ${concertData.titre || 'Sans titre'} (ID: ${concertData.id})`);
      console.log(`   - lieuId: ${concertData.lieuId || 'NON DÉFINI'}`);
      console.log(`   - programmateurId: ${concertData.programmateurId || 'NON DÉFINI'}`);
      console.log(`   - artisteId: ${concertData.artisteId || 'NON DÉFINI'}`);
      console.log(`   - date: ${concertData.date ? new Date(concertData.date.seconds * 1000).toLocaleDateString() : 'NON DÉFINIE'}`);
      
      // Tester le chargement du lieu si lieuId existe
      if (concertData.lieuId) {
        try {
          const lieuDoc = await getDoc(doc(db, 'lieux', concertData.lieuId));
          if (lieuDoc.exists()) {
            const lieuData = lieuDoc.data();
            console.log(`   ✅ Lieu trouvé: ${lieuData.nom} (${lieuData.ville})`);
          } else {
            console.log(`   ❌ Lieu ${concertData.lieuId} non trouvé`);
          }
        } catch (err) {
          console.log(`   ❌ Erreur chargement lieu: ${err.message}`);
        }
      }
      
      // Tester le chargement du programmateur si programmateurId existe
      if (concertData.programmateurId) {
        try {
          const progDoc = await getDoc(doc(db, 'programmateurs', concertData.programmateurId));
          if (progDoc.exists()) {
            const progData = progDoc.data();
            console.log(`   ✅ Programmateur trouvé: ${progData.nom} (${progData.email || 'pas d\'email'})`);
          } else {
            console.log(`   ❌ Programmateur ${concertData.programmateurId} non trouvé`);
          }
        } catch (err) {
          console.log(`   ❌ Erreur chargement programmateur: ${err.message}`);
        }
      }
      
      console.log(''); // Ligne vide
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  }
}

// Exécuter le test
testConcertData().then(() => {
  console.log('✅ Test terminé');
  process.exit(0);
}).catch(err => {
  console.error('❌ Erreur fatale:', err);
  process.exit(1);
}); 