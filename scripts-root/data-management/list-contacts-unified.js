import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

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
    console.log(`Document #${index}:`);
    console.log('ID:', doc.id);
    console.log('Type:', data.type || data.entityType || 'N/A');
    console.log('Nom:', data.nom || data.structureNom || data.personneNom || 'N/A');
    if (data.personnePrenom) console.log('Prénom:', data.personnePrenom);
    console.log('Structure associée:', data.structureId || 'N/A');
    console.log('Email:', data.email || 'N/A');
    console.log('Téléphone:', data.telephone || 'N/A');
    console.log('Adresse:', data.adresse ? `${data.adresse.rue || ''}, ${data.adresse.codePostal || ''} ${data.adresse.ville || ''}` : 'N/A');
    console.log('Created:', data.createdAt ? new Date(data.createdAt.seconds * 1000).toLocaleString() : 'N/A');
    console.log('---');
    index++;
  });
  
  process.exit(0);
}

listAllContactsUnified().catch(console.error);