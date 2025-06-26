import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs
} from 'firebase/firestore';

// Configuration Firebase
const firebaseConfig = {
  apiKey: "YOUR_API_KEY_HERE",
  authDomain: "app-booking-26571.firebaseapp.com",
  projectId: "app-booking-26571",
  storageBucket: "app-booking-26571.firebasestorage.app",
  messagingSenderId: "985724562753",
  appId: "1:985724562753:web:253b7e7c678318b69a85c0",
  measurementId: "G-C7KPDD9RHG"
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkConcertStructureLink() {
  console.log('=== Analyse du lien concert-structure ===\n');

  try {
    // 1. Récupérer le concert
    const concertId = 'con-1749569483128-xw9cfj';
    console.log(`1. Recherche du concert ${concertId}...`);
    
    const concertRef = doc(db, 'concerts', concertId);
    const concertSnap = await getDoc(concertRef);
    
    if (!concertSnap.exists()) {
      console.log('❌ Concert non trouvé');
      return;
    }
    
    const concertData = concertSnap.data();
    console.log('✅ Concert trouvé !');
    console.log('\n--- Informations du concert ---');
    console.log(`Nom: ${concertData.nom || 'N/A'}`);
    console.log(`Date: ${concertData.date || 'N/A'}`);
    console.log(`Lieu ID: ${concertData.lieuId || 'N/A'}`);
    console.log(`Structure ID dans concert: ${concertData.structureId || 'N/A'}`);
    console.log(`Contact ID: ${concertData.contactId || 'N/A'}`);
    
    // 2. Vérifier si le lieu a un lien avec la structure
    if (concertData.lieuId) {
      console.log(`\n2. Vérification du lieu ${concertData.lieuId}...`);
      const lieuRef = doc(db, 'lieux', concertData.lieuId);
      const lieuSnap = await getDoc(lieuRef);
      
      if (lieuSnap.exists()) {
        const lieuData = lieuSnap.data();
        console.log('✅ Lieu trouvé !');
        console.log(`Nom du lieu: ${lieuData.nom || 'N/A'}`);
        console.log(`Structure ID dans lieu: ${lieuData.structureId || 'N/A'}`);
        console.log(`Contact ID dans lieu: ${lieuData.contactId || 'N/A'}`);
      }
    }
    
    // 3. Chercher des liaisons pour cette structure
    console.log('\n3. Recherche de liaisons pour la structure...');
    const structureId = 'structure_1750614431015_kv5aekl66';
    
    const liaisonsQuery = query(
      collection(db, 'liaisons'),
      where('structureId', '==', structureId),
      where('actif', '==', true)
    );
    
    const liaisonsSnap = await getDocs(liaisonsQuery);
    console.log(`${liaisonsSnap.size} liaison(s) active(s) trouvée(s) pour cette structure`);
    
    liaisonsSnap.forEach(doc => {
      const data = doc.data();
      console.log(`\n- Liaison ID: ${doc.id}`);
      console.log(`  Personne ID: ${data.personneId}`);
      console.log(`  Type: ${data.type || 'N/A'}`);
      console.log(`  Role: ${data.role || 'N/A'}`);
    });
    
    // 4. Chercher la structure dans les contacts unifiés
    console.log('\n4. Recherche dans les contacts unifiés...');
    const unifiedQuery = query(
      collection(db, 'unified_contacts'),
      where('structure_data.raisonSociale', '==', 'ASSOCIATION GO LES JEUN\'S')
    );
    
    const unifiedSnap = await getDocs(unifiedQuery);
    console.log(`${unifiedSnap.size} contact(s) unifié(s) trouvé(s)`);
    
    unifiedSnap.forEach(doc => {
      const data = doc.data();
      console.log(`\n- Contact unifié ID: ${doc.id}`);
      console.log(`  Type: ${data.type}`);
      console.log(`  Structure ID mappé: ${data.structure_id || 'N/A'}`);
      console.log(`  Adresse dans unified:`, data.structure_data?.adresse || 'N/A');
    });
    
    // 5. Analyser pourquoi le pré-contrat n'a pas de structure
    console.log('\n\n=== ANALYSE ===');
    console.log('Le pré-contrat n\'a pas de structureId car :');
    console.log('1. Le concert n\'a probablement pas de lien direct avec la structure');
    console.log('2. La structure a été créée après le concert (22 juin vs date du concert)');
    console.log('3. Le pré-contrat utilise des champs plats au lieu d\'une référence structureId');
    console.log('\nRecommandations :');
    console.log('- Vérifier le processus de création des pré-contrats');
    console.log('- S\'assurer que le concert est bien lié à une structure avant de créer le pré-contrat');
    console.log('- Migrer les données du pré-contrat pour inclure le structureId');
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
  
  process.exit(0);
}

// Lancer la vérification
checkConcertStructureLink();