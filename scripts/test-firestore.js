// Test script pour vérifier Firestore
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, getDoc } from 'firebase/firestore';

// Configuration Firebase (remplacez par votre config)
const firebaseConfig = {
  // Votre configuration Firebase ici
  // Pour le test, nous utiliserons les variables d'environnement
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function testFirestore() {
  try {
    console.log('🔍 Test de connexion Firestore...');
    
    // Test 1: Lister tous les concerts
    console.log('📋 Récupération de tous les concerts...');
    const concertsRef = collection(db, 'concerts');
    const concertsSnapshot = await getDocs(concertsRef);
    
    console.log(`✅ Nombre de concerts trouvés: ${concertsSnapshot.size}`);
    
    if (concertsSnapshot.size > 0) {
      console.log('🎵 Premiers concerts:');
      concertsSnapshot.docs.slice(0, 3).forEach((doc, index) => {
        const data = doc.data();
        console.log(`  ${index + 1}. ID: ${doc.id}, Titre: ${data.titre || 'Sans titre'}, Date: ${data.date}`);
      });
      
      // Test 2: Récupérer un concert spécifique
      const firstConcertId = concertsSnapshot.docs[0].id;
      console.log(`🎯 Test de récupération du concert: ${firstConcertId}`);
      
      const concertDoc = await getDoc(doc(db, 'concerts', firstConcertId));
      if (concertDoc.exists()) {
        console.log('✅ Concert récupéré avec succès:', concertDoc.data());
      } else {
        console.log('❌ Concert non trouvé');
      }
    } else {
      console.log('⚠️ Aucun concert trouvé dans la base de données');
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du test Firestore:', error);
  }
}

// Exporter pour utilisation
export { testFirestore };

// Si exécuté directement
if (typeof window !== 'undefined') {
  window.testFirestore = testFirestore;
} 