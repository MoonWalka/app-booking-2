import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, getDocs, where } from 'firebase/firestore';

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

async function checkStructuresBySiret() {
  console.log('=== Recherche des structures par SIRET ===\n');
  
  try {
    // Les SIRET utilisés comme structureId dans les concerts
    const sirets = ['85011847200016', '75098528500022'];
    
    for (const siret of sirets) {
      console.log(`\nRecherche du SIRET ${siret}:`);
      
      // Chercher dans structures par SIRET
      const structuresQuery = query(collection(db, 'structures'), where('siret', '==', siret));
      const structuresSnap = await getDocs(structuresQuery);
      
      if (structuresSnap.size > 0) {
        console.log(`  ✅ Trouvé dans "structures":`);
        structuresSnap.forEach(doc => {
          const data = doc.data();
          console.log(`     - ID: ${doc.id}`);
          console.log(`       Nom: ${data.nom}`);
          console.log(`       Raison sociale: ${data.raisonSociale}`);
        });
      } else {
        console.log(`  ❌ Non trouvé dans "structures" par SIRET`);
      }
      
      // Chercher dans contacts_unified par SIRET
      const unifiedQuery = query(collection(db, 'contacts_unified'), where('structure_data.siret', '==', siret));
      const unifiedSnap = await getDocs(unifiedQuery);
      
      if (unifiedSnap.size > 0) {
        console.log(`  ✅ Trouvé dans "contacts_unified":`);
        unifiedSnap.forEach(doc => {
          const data = doc.data();
          console.log(`     - ID: ${doc.id}`);
          console.log(`       Nom: ${data.nom}`);
          console.log(`       Structure data: ${JSON.stringify(data.structure_data, null, 2)}`);
        });
      } else {
        console.log(`  ❌ Non trouvé dans "contacts_unified" par SIRET`);
      }
    }
    
    // Vérifier aussi comment sont stockés les concerts
    console.log('\n\n=== Analyse détaillée des concerts avec structureId ===');
    const concertsQuery = query(collection(db, 'concerts'), where('structureId', '!=', null));
    const concertsSnap = await getDocs(concertsQuery);
    
    console.log(`Total de concerts avec structureId: ${concertsSnap.size}\n`);
    
    concertsSnap.forEach(doc => {
      const data = doc.data();
      console.log(`Concert ${doc.id}:`);
      console.log(`  - Titre: ${data.titre || data.nom || 'N/A'}`);
      console.log(`  - structureId: ${data.structureId}`);
      console.log(`  - structureNom: ${data.structureNom || 'N/A'}`);
      console.log(`  - organisateurId: ${data.organisateurId || 'N/A'}`);
      console.log(`  - organisateurNom: ${data.organisateurNom || 'N/A'}`);
      
      // Vérifier si le structureId ressemble à un SIRET
      if (data.structureId && /^\d{14}$/.test(data.structureId)) {
        console.log(`  ⚠️  Le structureId semble être un SIRET`);
      }
      console.log('');
    });
    
  } catch (error) {
    console.error('Erreur:', error);
  }
  
  process.exit(0);
}

checkStructuresBySiret();