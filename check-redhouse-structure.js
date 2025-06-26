import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';

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

async function checkRedhouseStructure() {
  console.log('=== RECHERCHE DE LA STRUCTURE REDHOUSE ===\n');
  
  const structureId = 'mLAdGFVZulp968x7qs8Z';
  
  // 1. Chercher dans contacts_unified
  console.log('1. Recherche dans contacts_unified avec ID:', structureId);
  const contactDoc = await getDoc(doc(db, 'contacts_unified', structureId));
  
  if (contactDoc.exists()) {
    console.log('\n✅ TROUVÉ dans contacts_unified !');
    const data = contactDoc.data();
    console.log('\nDonnées complètes:');
    console.log(JSON.stringify(data, null, 2));
  } else {
    console.log('\n❌ NON trouvé dans contacts_unified');
  }
  
  // 2. Chercher dans structures (ancienne collection)
  console.log('\n\n2. Recherche dans structures avec ID:', structureId);
  const structureDoc = await getDoc(doc(db, 'structures', structureId));
  
  if (structureDoc.exists()) {
    console.log('\n✅ TROUVÉ dans structures !');
    const data = structureDoc.data();
    console.log('\nDonnées complètes:');
    console.log(JSON.stringify(data, null, 2));
  } else {
    console.log('\n❌ NON trouvé dans structures');
  }
  
  // 3. Chercher par nom dans contacts_unified
  console.log('\n\n3. Recherche par nom "redhouse" dans contacts_unified');
  const contactsRef = collection(db, 'contacts_unified');
  
  // Chercher dans structureNom
  const q1 = query(contactsRef, where('structureNom', '==', 'redhouse'));
  const snap1 = await getDocs(q1);
  
  if (snap1.size > 0) {
    console.log('\n✅ Trouvé par structureNom:');
    snap1.forEach(doc => {
      console.log('ID:', doc.id);
      console.log('Type:', doc.data().entityType || doc.data().type);
    });
  }
  
  // Chercher dans structure.nom
  const q2 = query(contactsRef, where('structure.nom', '==', 'redhouse'));
  const snap2 = await getDocs(q2);
  
  if (snap2.size > 0) {
    console.log('\n✅ Trouvé par structure.nom:');
    snap2.forEach(doc => {
      console.log('ID:', doc.id);
      console.log('Type:', doc.data().entityType || doc.data().type);
    });
  }
  
  // 4. Chercher dans structures par nom
  console.log('\n\n4. Recherche par nom "redhouse" dans structures');
  const structuresRef = collection(db, 'structures');
  const q3 = query(structuresRef, where('nom', '==', 'redhouse'));
  const snap3 = await getDocs(q3);
  
  if (snap3.size > 0) {
    console.log('\n✅ Trouvé dans structures:');
    snap3.forEach(doc => {
      console.log('ID:', doc.id);
      console.log('Données:', JSON.stringify(doc.data(), null, 2));
    });
  } else {
    console.log('\n❌ Aucune structure avec nom "redhouse"');
  }
  
  process.exit(0);
}

checkRedhouseStructure().catch(console.error);