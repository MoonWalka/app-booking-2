import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, limit, getDocs } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyD2nrKWoEBvEbjbopk26rrGbCYZDNpJ8BU',
  authDomain: 'app-booking-26571.firebaseapp.com',
  projectId: 'app-booking-26571',
  storageBucket: 'app-booking-26571.firebasestorage.app',
  messagingSenderId: '985724562753',
  appId: '1:985724562753:web:253b7e7c678318b69a85c0',
  measurementId: 'G-C7KPDD9RHG'
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkConcertStructure() {
  console.log('=== Analyse de l\'utilisation de structureId dans les concerts ===\n');
  
  try {
    const concertsQuery = query(collection(db, 'concerts'), limit(20));
    const concertsSnapshot = await getDocs(concertsQuery);
    
    let withStructureId = 0;
    let withOrganisateurId = 0;
    let withBoth = 0;
    let withNeither = 0;
    
    concertsSnapshot.forEach(doc => {
      const data = doc.data();
      const hasStructureId = !!data.structureId;
      const hasOrganisateurId = !!data.organisateurId;
      
      if (hasStructureId && hasOrganisateurId) {
        withBoth++;
        console.log(`Concert ${doc.id}: BOTH structureId=${data.structureId}, organisateurId=${data.organisateurId}`);
      } else if (hasStructureId) {
        withStructureId++;
        console.log(`Concert ${doc.id}: structureId=${data.structureId}`);
      } else if (hasOrganisateurId) {
        withOrganisateurId++;
        console.log(`Concert ${doc.id}: organisateurId=${data.organisateurId}`);
      } else {
        withNeither++;
        console.log(`Concert ${doc.id}: Aucune structure référencée`);
      }
    });
    
    console.log('\n=== RÉSUMÉ ===');
    console.log(`Total concerts analysés: ${concertsSnapshot.size}`);
    console.log(`- Avec structureId uniquement: ${withStructureId}`);
    console.log(`- Avec organisateurId uniquement: ${withOrganisateurId}`);
    console.log(`- Avec les deux: ${withBoth}`);
    console.log(`- Sans structure: ${withNeither}`);
    
  } catch (error) {
    console.error('Erreur:', error);
  }
  
  process.exit(0);
}

checkConcertStructure();