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

async function traceRedhouseFlow() {
  console.log('=== TRACE COMPLÈTE DU FLUX REDHOUSE ===\n');
  
  const structureId = 'mLAdGFVZulp968x7qs8Z';
  const concertId = 'D7kwUS6UkfmU9ZtLoVAf';
  const preContratId = 'V79J32tEmdhHC2yQ0QjB';
  
  try {
    console.log('1. STRUCTURE REDHOUSE (ID: ' + structureId + ')');
    console.log('=' + '='.repeat(60));
    
    // Vérifier dans structures
    const structureDoc = await getDoc(doc(db, 'structures', structureId));
    if (structureDoc.exists()) {
      const data = structureDoc.data();
      console.log('✅ Trouvée dans collection "structures"');
      console.log('Données de la structure:');
      console.log(JSON.stringify(data, null, 2));
      console.log('\nChamps importants:');
      console.log('- raisonSociale:', data.raisonSociale);
      console.log('- nom:', data.nom);
      console.log('- adresse:', data.adresse);
      console.log('- ville:', data.ville);
      console.log('- codePostal:', data.codePostal);
      console.log('- siret:', data.siret || 'NON DÉFINI');
    }
    
    // Vérifier dans contacts_unified
    console.log('\nVérification dans contacts_unified...');
    const contactDoc = await getDoc(doc(db, 'contacts_unified', structureId));
    if (contactDoc.exists()) {
      console.log('✅ Aussi dans contacts_unified');
    } else {
      console.log('❌ PAS dans contacts_unified (structure non migrée)');
    }
    
    console.log('\n\n2. CONCERT REDHOUSE (ID: ' + concertId + ')');
    console.log('=' + '='.repeat(60));
    
    const concertDoc = await getDoc(doc(db, 'concerts', concertId));
    if (concertDoc.exists()) {
      const data = concertDoc.data();
      console.log('✅ Concert trouvé');
      console.log('\nDonnées structure dans le concert:');
      console.log('- structureId:', data.structureId);
      console.log('- structureRaisonSociale:', data.structureRaisonSociale || 'NON DÉFINI');
      console.log('- structureNom:', data.structureNom || 'NON DÉFINI');
      console.log('- structureAdresse:', data.structureAdresse || 'NON DÉFINI');
      console.log('- structureVille:', data.structureVille || 'NON DÉFINI');
      console.log('- structureCodePostal:', data.structureCodePostal || 'NON DÉFINI');
      
      console.log('\nAutres données du concert:');
      console.log('- nom:', data.nom);
      console.log('- date:', data.date);
      console.log('- artisteNom:', data.artisteNom);
      console.log('- lieu:', data.lieu);
    }
    
    console.log('\n\n3. PRÉ-CONTRAT (ID: ' + preContratId + ')');
    console.log('=' + '='.repeat(60));
    
    const preContratDoc = await getDoc(doc(db, 'preContrats', preContratId));
    if (preContratDoc.exists()) {
      const data = preContratDoc.data();
      console.log('✅ Pré-contrat trouvé');
      console.log('\nDonnées structure dans le pré-contrat:');
      console.log('- structureId:', data.structureId || 'NON DÉFINI');
      console.log('- raisonSociale:', data.raisonSociale);
      console.log('- nom:', data.nom || 'NON DÉFINI');
      console.log('- adresse:', data.adresse);
      console.log('- suiteAdresse:', data.suiteAdresse || 'NON DÉFINI');
      console.log('- cp:', data.cp);
      console.log('- ville:', data.ville);
      console.log('- pays:', data.pays);
      console.log('- tel:', data.tel || 'NON DÉFINI');
      console.log('- email:', data.email || 'NON DÉFINI');
      console.log('- siret:', data.siret || 'NON DÉFINI');
      
      console.log('\nStatut du pré-contrat:');
      console.log('- status:', data.status);
      console.log('- publicFormCompleted:', data.publicFormCompleted);
      console.log('- confirmationValidee:', data.confirmationValidee);
      console.log('- publicFormData existe?:', !!data.publicFormData);
      
      if (data.publicFormData) {
        console.log('\nDonnées du formulaire public:');
        console.log('- adresse:', data.publicFormData.adresse);
        console.log('- cp:', data.publicFormData.cp);
        console.log('- ville:', data.publicFormData.ville);
      }
    }
    
    console.log('\n\n4. ANALYSE DU FLUX');
    console.log('=' + '='.repeat(60));
    
    console.log('\n🔍 PROBLÈME IDENTIFIÉ:');
    console.log('1. La structure existe dans "structures" mais PAS dans "contacts_unified"');
    console.log('2. PreContratGenerationPage cherche dans "contacts_unified" (ligne 73)');
    console.log('3. Ne trouvant pas la structure, il utilise les données minimales du concert');
    console.log('4. Le concert n\'a pas de données structureRaisonSociale, structureAdresse, etc.');
    console.log('5. Le pré-contrat est créé avec les données minimales disponibles');
    
    console.log('\n💡 SOLUTION:');
    console.log('1. Migrer la structure vers contacts_unified');
    console.log('2. OU modifier PreContratGenerationPage pour chercher aussi dans "structures"');
    console.log('3. OU s\'assurer que les concerts stockent les données de structure');
    
    console.log('\n\n5. FLUX ACTUEL DANS LE CODE');
    console.log('=' + '='.repeat(60));
    
    console.log('\nPreContratGenerationPage.js:');
    console.log('- Ligne 69-73: Cherche la structure dans contacts_unified');
    console.log('- Ligne 106: Structure non trouvée → log "[WORKFLOW_TEST] 4. ... structure non trouvée"');
    console.log('- Ligne 114: Fallback si structureRaisonSociale existe dans le concert');
    console.log('- Ligne 163-173: Utilise les données minimales du concert');
    
    console.log('\nDans ce cas précis:');
    console.log('1. Structure ID "mLAdGFVZulp968x7qs8Z" existe dans le concert');
    console.log('2. PreContratGenerationPage cherche dans contacts_unified → PAS TROUVÉ');
    console.log('3. Le concert n\'a pas de structureRaisonSociale → pas de fallback par query');
    console.log('4. Résultat: structure avec données vides dans le pré-contrat');
    
  } catch (error) {
    console.error('Erreur:', error);
  }
}

traceRedhouseFlow();