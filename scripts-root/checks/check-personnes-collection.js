import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs, limit } from 'firebase/firestore';

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

async function checkPersonnes() {
  console.log('=== Vérification des personnes ===\n');
  
  // 1. Vérifier la collection personnes
  console.log('1. Collection "personnes":');
  const personnesQuery = query(collection(db, 'personnes'), limit(5));
  const personnesSnap = await getDocs(personnesQuery);
  console.log(`   Nombre de personnes: ${personnesSnap.size}`);
  
  // 2. Vérifier contacts_unified pour les personnes
  console.log('\n2. Personnes dans "contacts_unified":');
  const contactsQuery = query(
    collection(db, 'contacts_unified'),
    where('entityType', '==', 'personne'),
    limit(5)
  );
  const contactsSnap = await getDocs(contactsQuery);
  console.log(`   Nombre de personnes dans l'ancien système: ${contactsSnap.size}`);
  
  if (contactsSnap.size > 0) {
    console.log('\n   Exemples:');
    contactsSnap.forEach(doc => {
      const data = doc.data();
      console.log(`   - ${data.personneNom} ${data.personnePrenom}`);
    });
  }
  
  process.exit(0);
}

checkPersonnes();
