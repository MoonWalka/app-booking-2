import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

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

async function checkStructureCreation() {
  console.log('=== Vérification de la création de la structure ===\n');
  
  // La structure avec l'ID normal
  const normalId = 'structure_1750614431015_kv5aekl66';
  const siretId = '85011847200016';
  
  console.log('1. Vérification structure avec ID normal:', normalId);
  const normalDoc = await getDoc(doc(db, 'structures', normalId));
  if (normalDoc.exists()) {
    const data = normalDoc.data();
    console.log('✅ Trouvée \! SIRET:', data.siret);
    console.log('Créée le:', data.createdAt?.toDate());
    console.log('Via:', data.createdVia || 'non spécifié');
  }
  
  console.log('\n2. Vérification structure avec SIRET comme ID:', siretId);
  const siretDoc = await getDoc(doc(db, 'structures', siretId));
  if (siretDoc.exists()) {
    console.log('⚠️ TROUVÉE \! Une structure existe avec le SIRET comme ID');
    const data = siretDoc.data();
    console.log('Nom:', data.raisonSociale);
    console.log('Créée le:', data.createdAt?.toDate());
  } else {
    console.log('✅ Pas de structure avec SIRET comme ID');
  }
  
  process.exit(0);
}

checkStructureCreation();
