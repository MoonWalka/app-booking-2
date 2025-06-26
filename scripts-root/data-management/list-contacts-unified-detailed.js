import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyD2nrKWoEBvEbjbopk26rrGbCYZDNpJ8BU",
  authDomain: "app-booking-26571.firebaseapp.com",
  projectId: "app-booking-26571",
  storageBucket: "app-booking-26571.firebasestorage.app",
  messagingSenderId: "985724562753",
  appId: "1:985724562753:web:253b7e7c678318b69a85c0",
  measurementId: "G-C7KPDD9RHG"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function listAllContactsUnified() {
  console.log('=== LISTING ALL DOCUMENTS IN contacts_unified ===\n');
  
  const contactsRef = collection(db, 'contacts_unified');
  const snapshot = await getDocs(contactsRef);
  
  console.log('Total documents:', snapshot.size);
  console.log('\n=== DOCUMENTS DETAILS ===\n');
  
  let index = 1;
  const documents = [];
  
  snapshot.forEach(doc => {
    const data = doc.data();
    documents.push({
      id: doc.id,
      data: data
    });
  });
  
  // Trier par date de création
  documents.sort((a, b) => {
    const dateA = a.data.createdAt?.seconds || 0;
    const dateB = b.data.createdAt?.seconds || 0;
    return dateB - dateA;
  });
  
  documents.forEach(doc => {
    const data = doc.data;
    console.log(`\n======= Document #${index} =======`);
    console.log('ID:', doc.id);
    console.log('\nTOUTES LES DONNÉES:');
    console.log(JSON.stringify(data, null, 2));
    console.log('==============================\n');
    index++;
  });
  
  // Analyser les types
  console.log('\n=== ANALYSE DES TYPES ===');
  const typeCount = {};
  documents.forEach(doc => {
    const type = doc.data.type || doc.data.entityType || 'unknown';
    typeCount[type] = (typeCount[type] || 0) + 1;
  });
  
  Object.entries(typeCount).forEach(([type, count]) => {
    console.log(`${type}: ${count} documents`);
  });
  
  process.exit(0);
}

listAllContactsUnified().catch(console.error);