import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, limit, getDocs, where } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'YOUR_API_KEY_HERE',
  authDomain: 'app-booking-26571.firebaseapp.com',
  projectId: 'app-booking-26571',
  storageBucket: 'app-booking-26571.firebasestorage.app',
  messagingSenderId: '985724562753',
  appId: '1:985724562753:web:253b7e7c678318b69a85c0',
  measurementId: 'G-C7KPDD9RHG'
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkStructureCollections() {
  console.log('=== Analyse des collections structures vs contacts_unified ===\n');
  
  try {
    // 1. Vérifier la collection structures
    console.log('1. Collection "structures":');
    const structuresQuery = query(collection(db, 'structures'), limit(5));
    const structuresSnapshot = await getDocs(structuresQuery);
    
    console.log(`Nombre d'entrées (limité à 5): ${structuresSnapshot.size}`);
    structuresSnapshot.forEach(doc => {
      const data = doc.data();
      console.log(`- ID: ${doc.id}`);
      console.log(`  Nom: ${data.nom || 'N/A'}`);
      console.log(`  Raison sociale: ${data.raisonSociale || 'N/A'}`);
      console.log(`  SIRET: ${data.siret || 'N/A'}`);
      console.log(`  Créé: ${data.createdAt ? new Date(data.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}`);
    });
    
    // 2. Vérifier la collection contacts_unified
    console.log('\n2. Collection "contacts_unified" (type=structure):');
    const unifiedQuery = query(
      collection(db, 'contacts_unified'), 
      where('type', '==', 'structure'),
      limit(5)
    );
    const unifiedSnapshot = await getDocs(unifiedQuery);
    
    console.log(`Nombre d'entrées (limité à 5): ${unifiedSnapshot.size}`);
    unifiedSnapshot.forEach(doc => {
      const data = doc.data();
      console.log(`- ID: ${doc.id}`);
      console.log(`  Nom: ${data.nom || 'N/A'}`);
      console.log(`  Raison sociale: ${data.structure_data?.raisonSociale || 'N/A'}`);
      console.log(`  SIRET: ${data.structure_data?.siret || 'N/A'}`);
      console.log(`  Structure ID mappé: ${data.structure_id || 'N/A'}`);
      console.log(`  Créé: ${data.createdAt ? new Date(data.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}`);
    });
    
    // 3. Vérifier si les structures dans concerts existent
    console.log('\n3. Vérification de l\'existence des structures référencées dans les concerts:');
    const structureIds = ['92939812100012', '85011847200016', '75098528500022', 'mLAdGFVZulp968x7qs8Z'];
    
    for (const structureId of structureIds) {
      console.log(`\nRecherche de "${structureId}":`);
      
      // Chercher dans structures
      const structuresQuery = query(collection(db, 'structures'), where('__name__', '==', structureId));
      const structuresSnap = await getDocs(structuresQuery);
      if (structuresSnap.size > 0) {
        console.log(`  ✅ Trouvé dans "structures"`);
      } else {
        console.log(`  ❌ Non trouvé dans "structures"`);
      }
      
      // Chercher dans contacts_unified
      const unifiedQuery = query(collection(db, 'contacts_unified'), where('__name__', '==', structureId));
      const unifiedSnap = await getDocs(unifiedQuery);
      if (unifiedSnap.size > 0) {
        console.log(`  ✅ Trouvé dans "contacts_unified"`);
      } else {
        console.log(`  ❌ Non trouvé dans "contacts_unified"`);
      }
    }
    
  } catch (error) {
    console.error('Erreur:', error);
  }
  
  process.exit(0);
}

checkStructureCollections();