import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, getDocs, where, orderBy, limit } from 'firebase/firestore';

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

async function checkStructureSearchBySiret() {
  console.log('=== Analyse de la recherche de structures par SIRET ===\n');
  
  try {
    // 1. Chercher toutes les structures avec SIRET
    const structuresQuery = query(
      collection(db, 'structures'),
      orderBy('createdAt', 'desc'),
      limit(20)
    );
    const structuresSnap = await getDocs(structuresQuery);
    
    console.log('1. Structures dans la collection "structures":');
    console.log(`Total: ${structuresSnap.size}\n`);
    
    structuresSnap.forEach(doc => {
      const data = doc.data();
      console.log(`ID: ${doc.id}`);
      console.log(`  Nom: ${data.nom || 'N/A'}`);
      console.log(`  Raison sociale: ${data.raisonSociale || 'N/A'}`);
      console.log(`  SIRET: ${data.siret || 'N/A'}`);
      console.log(`  Type: ${data.type || 'N/A'}`);
      
      // Vérifier si l'ID est un SIRET
      if (/^\d{14}$/.test(doc.id)) {
        console.log(`  ⚠️  L'ID du document EST un SIRET !`);
      }
      console.log('');
    });
    
    // 2. Rechercher une structure spécifique par SIRET
    const siretToSearch = '75098528500022';
    console.log(`\n2. Recherche de structures avec SIRET = ${siretToSearch}:`);
    
    // Recherche par champ siret
    const bySiretQuery = query(
      collection(db, 'structures'),
      where('siret', '==', siretToSearch)
    );
    const bySiretSnap = await getDocs(bySiretQuery);
    
    console.log(`Trouvées par champ siret: ${bySiretSnap.size}`);
    bySiretSnap.forEach(doc => {
      console.log(`  - ID: ${doc.id}, Nom: ${doc.data().raisonSociale}`);
    });
    
    // Recherche par ID document
    const byIdQuery = query(
      collection(db, 'structures'),
      where('__name__', '==', siretToSearch)
    );
    const byIdSnap = await getDocs(byIdQuery);
    
    console.log(`\nTrouvées par ID document: ${byIdSnap.size}`);
    byIdSnap.forEach(doc => {
      console.log(`  - ID: ${doc.id}, Nom: ${doc.data().raisonSociale}`);
    });
    
    // 3. Analyser pourquoi certains concerts utilisent des SIRET comme structureId
    console.log('\n\n=== ANALYSE DU PROBLÈME ===');
    console.log('Certains concerts utilisent des SIRET comme structureId car :');
    console.log('1. L\'ancien système utilisait peut-être le SIRET comme ID de document');
    console.log('2. Lors de la sélection dans le formulaire, le système cherche par SIRET');
    console.log('3. Si aucune structure n\'est trouvée avec cet ID, une nouvelle est créée avec le SIRET comme ID');
    console.log('\nSolution recommandée :');
    console.log('- Migrer les concerts pour utiliser les vrais IDs de structure');
    console.log('- Modifier la logique de recherche pour toujours utiliser l\'ID du document');
    console.log('- Empêcher la création de structures avec des SIRET comme ID');
    
  } catch (error) {
    console.error('Erreur:', error);
  }
  
  process.exit(0);
}

checkStructureSearchBySiret();