const { initializeApp } = require('firebase/app');
const { getFirestore, doc, getDoc, collection, query, where, getDocs } = require('firebase/firestore');

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

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkRedhouseStructure() {
  console.log('=== Vérification de la structure Redhouse ===\n');
  
  const structureId = 'mLAdGFVZulp968x7qs8Z';
  
  try {
    // 1. Vérifier dans contacts_unified
    console.log('1. Recherche dans contacts_unified avec ID:', structureId);
    const contactDoc = await getDoc(doc(db, 'contacts_unified', structureId));
    
    if (contactDoc.exists()) {
      console.log('✅ TROUVÉE dans contacts_unified !');
      const data = contactDoc.data();
      console.log('\nDonnées de la structure:');
      console.log('- entityType:', data.entityType);
      console.log('- structureRaisonSociale:', data.structureRaisonSociale);
      console.log('- structureNom:', data.structureNom);
      console.log('- structureAdresse:', data.structureAdresse);
      console.log('- structureVille:', data.structureVille);
      console.log('- structureCodePostal:', data.structureCodePostal);
      console.log('- structureSiret:', data.structureSiret);
      console.log('- entrepriseId:', data.entrepriseId);
      console.log('- createdAt:', data.createdAt?.toDate());
      console.log('\nDonnées complètes:');
      console.log(JSON.stringify(data, null, 2));
    } else {
      console.log('❌ PAS trouvée dans contacts_unified');
    }
    
    // 2. Vérifier aussi dans structures pour être sûr
    console.log('\n2. Vérification dans structures (ancienne collection)...');
    const structureDoc = await getDoc(doc(db, 'structures', structureId));
    
    if (structureDoc.exists()) {
      console.log('⚠️ Aussi trouvée dans structures (ancienne collection)');
      const data = structureDoc.data();
      console.log('- raisonSociale:', data.raisonSociale);
      console.log('- siret:', data.siret);
    } else {
      console.log('✅ Pas trouvée dans structures (normal si migrée vers contacts_unified)');
    }
    
    // 3. Chercher des concerts qui utilisent cette structure
    console.log('\n3. Recherche des concerts utilisant cette structure...');
    const concertsQuery = await getDocs(
      query(
        collection(db, 'concerts'),
        where('structureId', '==', structureId)
      )
    );
    
    console.log(`Nombre de concerts trouvés: ${concertsQuery.size}`);
    
    concertsQuery.forEach((doc) => {
      const data = doc.data();
      console.log(`\nConcert: ${data.nom || data.titre || 'Sans nom'} (${doc.id})`);
      console.log('- Date:', data.date);
      console.log('- Lieu:', data.lieu);
      console.log('- Artiste:', data.artisteNom);
      console.log('- structureRaisonSociale dans concert:', data.structureRaisonSociale);
      
      // Vérifier s'il y a des pré-contrats
      if (data.preContratIds && data.preContratIds.length > 0) {
        console.log('- Pré-contrats:', data.preContratIds);
      }
    });
    
    // 4. Si on trouve un concert Redhouse, vérifier ses pré-contrats
    if (concertsQuery.size > 0) {
      const firstConcert = concertsQuery.docs[0];
      const concertId = firstConcert.id;
      
      console.log('\n4. Recherche des pré-contrats pour le concert:', concertId);
      const preContratsQuery = await getDocs(
        query(
          collection(db, 'preContrats'),
          where('concertId', '==', concertId)
        )
      );
      
      console.log(`Nombre de pré-contrats trouvés: ${preContratsQuery.size}`);
      
      preContratsQuery.forEach((doc) => {
        const data = doc.data();
        console.log(`\nPré-contrat ${doc.id}:`);
        console.log('- Status:', data.status);
        console.log('- Créé le:', data.createdAt?.toDate());
        console.log('- structureId dans pré-contrat:', data.structureId);
        console.log('- raisonSociale dans pré-contrat:', data.raisonSociale);
        console.log('- adresse dans pré-contrat:', data.adresse);
        console.log('- A des publicFormData?:', !!data.publicFormData);
        
        if (data.publicFormData) {
          console.log('- publicFormData.adresse:', data.publicFormData.adresse);
          console.log('- publicFormData.raisonSociale:', data.publicFormData.raisonSociale);
        }
      });
    }
    
  } catch (error) {
    console.error('Erreur:', error);
  }
}

checkRedhouseStructure();