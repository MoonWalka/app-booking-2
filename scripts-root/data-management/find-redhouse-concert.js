import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "YOUR_API_KEY_HERE",
  authDomain: "app-booking-26571.firebaseapp.com",
  projectId: "app-booking-26571",
  storageBucket: "app-booking-26571.firebasestorage.app",
  messagingSenderId: "985724562753",
  appId: "1:985724562753:web:253b7e7c678318b69a85c0",
  measurementId: "G-C7KPDD9RHG"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function findRedhouseConcert() {
  console.log('=== RECHERCHE DU CONCERT REDHOUSE ===\n');
  
  // Rechercher dans les concerts
  const concertsRef = collection(db, 'concerts');
  
  // Chercher par nom de structure
  const q1 = query(concertsRef, where('structureRaisonSociale', '==', 'redhouse'));
  const snap1 = await getDocs(q1);
  
  if (snap1.size > 0) {
    console.log('Concert trouvé par structureRaisonSociale:');
    snap1.forEach(doc => {
      const data = doc.data();
      console.log('\nID:', doc.id);
      console.log('Données complètes:');
      console.log(JSON.stringify(data, null, 2));
    });
  }
  
  // Chercher aussi avec variations
  const variations = ['Redhouse', 'REDHOUSE', 'RedHouse'];
  for (const variation of variations) {
    const q = query(concertsRef, where('structureRaisonSociale', '==', variation));
    const snap = await getDocs(q);
    if (snap.size > 0) {
      console.log(`\nConcert trouvé avec variation "${variation}":`);
      snap.forEach(doc => {
        const data = doc.data();
        console.log('\nID:', doc.id);
        console.log('structureId:', data.structureId);
        console.log('structureRaisonSociale:', data.structureRaisonSociale);
        console.log('Données complètes:');
        console.log(JSON.stringify(data, null, 2));
      });
    }
  }
  
  // Chercher par nom de lieu
  const q2 = query(concertsRef, where('lieuNom', 'in', ['redhouse', 'Redhouse', 'REDHOUSE', 'RedHouse']));
  const snap2 = await getDocs(q2);
  
  if (snap2.size > 0) {
    console.log('\nConcerts trouvés par lieuNom:');
    snap2.forEach(doc => {
      const data = doc.data();
      console.log('\nID:', doc.id);
      console.log('lieuNom:', data.lieuNom);
      console.log('structureRaisonSociale:', data.structureRaisonSociale);
      console.log('structureId:', data.structureId);
    });
  }
  
  // Rechercher dans contacts_unified
  console.log('\n=== RECHERCHE DANS CONTACTS_UNIFIED ===');
  const contactsRef = collection(db, 'contacts_unified');
  
  for (const variation of ['redhouse', 'Redhouse', 'REDHOUSE', 'RedHouse']) {
    const qc = query(contactsRef, where('structureRaisonSociale', '==', variation));
    const snapc = await getDocs(qc);
    if (snapc.size > 0) {
      console.log(`\nContact trouvé avec variation "${variation}":`);
      snapc.forEach(doc => {
        const data = doc.data();
        console.log('\nID:', doc.id);
        console.log('Type:', data.entityType || data.type);
        console.log('structureRaisonSociale:', data.structureRaisonSociale);
        console.log('Données structure:', data.structure);
      });
    }
  }
  
  process.exit(0);
}

findRedhouseConcert().catch(console.error);