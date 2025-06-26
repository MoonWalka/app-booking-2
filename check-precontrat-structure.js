import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  getDocs, 
  query, 
  where,
  doc,
  getDoc,
  orderBy,
  limit
} from 'firebase/firestore';

// Configuration Firebase
const firebaseConfig = {
  apiKey: "AIzaSyD2nrKWoEBvEbjbopk26rrGbCYZDNpJ8BU",
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

async function checkPreContratAndStructure() {
  console.log('=== Vérification du pré-contrat et comparaison avec la structure ===\n');

  try {
    // 1. Récupérer le pré-contrat
    console.log('1. Recherche du pré-contrat GImXfpZaom9D0DtTfYEM...');
    const preContratRef = doc(db, 'preContrats', 'GImXfpZaom9D0DtTfYEM');
    const preContratSnap = await getDoc(preContratRef);
    
    if (!preContratSnap.exists()) {
      console.log('❌ Pré-contrat non trouvé avec cet ID');
      
      // Chercher des pré-contrats récents
      console.log('\n2. Recherche de pré-contrats récents...');
      const recentQuery = query(
        collection(db, 'preContrats'),
        orderBy('createdAt', 'desc'),
        limit(10)
      );
      
      const recentSnap = await getDocs(recentQuery);
      console.log(`${recentSnap.size} pré-contrats récents trouvés:`);
      
      recentSnap.forEach(doc => {
        const data = doc.data();
        console.log(`\n- ID: ${doc.id}`);
        console.log(`  Date: ${data.createdAt?.toDate ? data.createdAt.toDate() : 'N/A'}`);
        console.log(`  Structure ID: ${data.structureId || 'N/A'}`);
        if (data.structure) {
          console.log(`  Structure dans pré-contrat:`);
          console.log(`    Raison sociale: ${data.structure.raisonSociale || 'N/A'}`);
          console.log(`    Adresse format:`, data.structure.adresse ? 'imbriqué' : 'plat ou absent');
        }
      });
      
      // Chercher spécifiquement les pré-contrats pour notre structure
      console.log('\n3. Recherche de pré-contrats pour la structure structure_1750614431015_kv5aekl66...');
      const structureQuery = query(
        collection(db, 'preContrats'),
        where('structureId', '==', 'structure_1750614431015_kv5aekl66'),
        orderBy('createdAt', 'desc'),
        limit(5)
      );
      
      const structurePreContratsSnap = await getDocs(structureQuery);
      console.log(`${structurePreContratsSnap.size} pré-contrat(s) trouvé(s) pour cette structure`);
      
      structurePreContratsSnap.forEach(doc => {
        const data = doc.data();
        console.log(`\n- ID: ${doc.id}`);
        console.log(`  Date: ${data.createdAt?.toDate ? data.createdAt.toDate() : 'N/A'}`);
        console.log(`  Données structure dans le pré-contrat:`, JSON.stringify(data.structure, null, 2));
      });
      
    } else {
      const preContratData = preContratSnap.data();
      console.log('✅ Pré-contrat trouvé !');
      
      console.log('\n--- Informations du pré-contrat ---');
      console.log(`Date création: ${preContratData.createdAt?.toDate ? preContratData.createdAt.toDate() : 'N/A'}`);
      console.log(`Structure ID: ${preContratData.structureId || 'N/A'}`);
      
      // Afficher toutes les clés du pré-contrat
      console.log('\n--- Toutes les clés du pré-contrat ---');
      console.log(Object.keys(preContratData));
      
      // Afficher les données complètes du pré-contrat
      console.log('\n--- Données complètes du pré-contrat ---');
      console.log(JSON.stringify(preContratData, null, 2));
      
      if (preContratData.structure) {
        console.log('\n--- Données structure dans le pré-contrat ---');
        console.log(JSON.stringify(preContratData.structure, null, 2));
        
        // Analyser le format de l'adresse
        console.log('\n--- Analyse du format d\'adresse ---');
        if (preContratData.structure.adresse && typeof preContratData.structure.adresse === 'object') {
          console.log('✅ Format imbriqué (objet) détecté');
          console.log('Adresse:', JSON.stringify(preContratData.structure.adresse, null, 2));
        } else if (preContratData.structure.adresse && typeof preContratData.structure.adresse === 'string') {
          console.log('⚠️  Format string pour adresse (ancien format)');
          console.log('Adresse:', preContratData.structure.adresse);
        } else if (preContratData.structure.rue || preContratData.structure.codePostal) {
          console.log('✅ Format plat détecté');
          console.log(`Rue: ${preContratData.structure.rue || 'N/A'}`);
          console.log(`Code postal: ${preContratData.structure.codePostal || 'N/A'}`);
          console.log(`Ville: ${preContratData.structure.ville || 'N/A'}`);
        } else {
          console.log('❌ Aucune adresse trouvée');
        }
      }
      
      // Comparer avec la structure actuelle
      if (preContratData.structureId) {
        console.log('\n4. Comparaison avec la structure actuelle...');
        const structureRef = doc(db, 'structures', preContratData.structureId);
        const structureSnap = await getDoc(structureRef);
        
        if (structureSnap.exists()) {
          const structureData = structureSnap.data();
          console.log('\n--- Structure actuelle ---');
          console.log(`Raison sociale: ${structureData.raisonSociale}`);
          console.log(`Adresse (champ string): ${structureData.adresse || 'N/A'}`);
          console.log(`Ville: ${structureData.ville || 'N/A'}`);
          console.log(`Code postal: ${structureData.codePostal || 'N/A'}`);
          
          // Comparer les dates
          const structureUpdate = structureData.updatedAt?.toDate ? structureData.updatedAt.toDate() : null;
          const preContratCreate = preContratData.createdAt?.toDate ? preContratData.createdAt.toDate() : null;
          
          if (structureUpdate && preContratCreate) {
            console.log('\n--- Chronologie ---');
            console.log(`Structure mise à jour: ${structureUpdate}`);
            console.log(`Pré-contrat créé: ${preContratCreate}`);
            
            if (structureUpdate > preContratCreate) {
              console.log('⚠️  La structure a été modifiée APRÈS la création du pré-contrat');
            } else {
              console.log('✅ La structure n\'a pas été modifiée depuis la création du pré-contrat');
            }
          }
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
  
  process.exit(0);
}

// Lancer la vérification
checkPreContratAndStructure();