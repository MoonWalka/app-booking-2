import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, orderBy, limit, getDocs } from 'firebase/firestore';

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

async function listRecentConcerts() {
  console.log('=== LISTE DES CONCERTS RÉCENTS ===\n');
  
  const concertsRef = collection(db, 'concerts');
  const q = query(concertsRef, orderBy('createdAt', 'desc'), limit(20));
  const snapshot = await getDocs(q);
  
  console.log('Total de concerts récents:', snapshot.size);
  console.log('\n=== DÉTAILS DES CONCERTS ===\n');
  
  let index = 1;
  snapshot.forEach(doc => {
    const data = doc.data();
    console.log(`\n======= Concert #${index} =======`);
    console.log('ID:', doc.id);
    console.log('Date création:', data.createdAt ? new Date(data.createdAt.seconds * 1000).toLocaleString() : 'N/A');
    console.log('Nom artiste:', data.artisteNom || 'N/A');
    console.log('Nom lieu:', data.lieuNom || 'N/A');
    console.log('Date concert:', data.date || 'N/A');
    console.log('--- Structure ---');
    console.log('structureId:', data.structureId || 'N/A');
    console.log('structureRaisonSociale:', data.structureRaisonSociale || 'N/A');
    console.log('structureNom:', data.structureNom || 'N/A');
    console.log('==============================');
    index++;
  });
  
  // Chercher spécifiquement les concerts avec une structure
  console.log('\n\n=== CONCERTS AVEC STRUCTURE ===\n');
  const qWithStructure = query(
    concertsRef, 
    orderBy('createdAt', 'desc'), 
    limit(50)
  );
  const snapshotWithStructure = await getDocs(qWithStructure);
  
  let structureCount = 0;
  snapshotWithStructure.forEach(doc => {
    const data = doc.data();
    if (data.structureId || data.structureRaisonSociale) {
      structureCount++;
      console.log(`\nConcert avec structure #${structureCount}:`);
      console.log('ID:', doc.id);
      console.log('structureId:', data.structureId);
      console.log('structureRaisonSociale:', data.structureRaisonSociale);
      console.log('Date:', data.createdAt ? new Date(data.createdAt.seconds * 1000).toLocaleString() : 'N/A');
    }
  });
  
  console.log(`\nTotal de concerts avec structure: ${structureCount}`);
  
  process.exit(0);
}

listRecentConcerts().catch(console.error);