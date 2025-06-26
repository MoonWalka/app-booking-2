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

async function checkAssoGoLesJeuns() {
  console.log('=== Vérification de la structure "Asso Go les jeun\'s" ===\n');

  try {
    // 1. Recherche de la structure par nom (essayer plusieurs variantes)
    console.log('1. Recherche de la structure par nom...');
    const structuresQuery = query(
      collection(db, 'structures'),
      where('raisonSociale', '==', "ASSOCIATION GO LES JEUN'S")
    );
    
    const structuresSnapshot = await getDocs(structuresQuery);
    
    if (structuresSnapshot.empty) {
      console.log('❌ Aucune structure trouvée avec le nom "Asso Go les jeun\'s"');
      
      // Essayer une recherche plus large
      console.log('\n2. Recherche élargie contenant "Go les jeun"...');
      const allStructures = await getDocs(collection(db, 'structures'));
      const matchingStructures = [];
      
      allStructures.forEach(doc => {
        const data = doc.data();
        if (data.raisonSociale && data.raisonSociale.toLowerCase().includes('go les jeun')) {
          matchingStructures.push({ id: doc.id, ...data });
        }
      });
      
      if (matchingStructures.length > 0) {
        console.log(`✅ ${matchingStructures.length} structure(s) trouvée(s) contenant "go les jeun":`);
        matchingStructures.forEach(structure => {
          console.log(`\n- ID: ${structure.id}`);
          console.log(`  Raison sociale: ${structure.raisonSociale}`);
          console.log(`  Date création: ${structure.createdAt?.toDate ? structure.createdAt.toDate() : 'N/A'}`);
          console.log(`  Date modification: ${structure.updatedAt?.toDate ? structure.updatedAt.toDate() : 'N/A'}`);
        });
      }
    } else {
      console.log(`✅ Structure trouvée !`);
      
      structuresSnapshot.forEach(async (docSnapshot) => {
        const structureData = docSnapshot.data();
        const structureId = docSnapshot.id;
        
        console.log(`\n=== Détails de la structure ===`);
        console.log(`ID: ${structureId}`);
        console.log(`Raison sociale: ${structureData.raisonSociale}`);
        console.log(`Type: ${structureData.type || 'Non défini'}`);
        console.log(`Email: ${structureData.email || 'Non défini'}`);
        console.log(`Téléphone: ${structureData.telephone || 'Non défini'}`);
        
        // Afficher l'adresse
        console.log(`\n--- Adresse actuelle ---`);
        if (structureData.adresse) {
          console.log('Format imbriqué (ancien) détecté:');
          console.log(`  Rue: ${structureData.adresse.rue || 'Non définie'}`);
          console.log(`  Code postal: ${structureData.adresse.codePostal || 'Non défini'}`);
          console.log(`  Ville: ${structureData.adresse.ville || 'Non définie'}`);
          console.log(`  Pays: ${structureData.adresse.pays || 'Non défini'}`);
        } else {
          console.log('Format plat (nouveau):');
          console.log(`  Rue: ${structureData.rue || 'Non définie'}`);
          console.log(`  Code postal: ${structureData.codePostal || 'Non défini'}`);
          console.log(`  Ville: ${structureData.ville || 'Non définie'}`);
          console.log(`  Pays: ${structureData.pays || 'Non défini'}`);
        }
        
        // Dates
        console.log(`\n--- Dates ---`);
        console.log(`Date création: ${structureData.createdAt?.toDate ? structureData.createdAt.toDate() : 'N/A'}`);
        console.log(`Date modification: ${structureData.updatedAt?.toDate ? structureData.updatedAt.toDate() : 'N/A'}`);
        console.log(`Créé par: ${structureData.createdBy || 'N/A'}`);
        console.log(`Modifié par: ${structureData.updatedBy || 'N/A'}`);
        
        // 3. Vérifier le pré-contrat
        console.log(`\n\n3. Vérification du pré-contrat GImXfpZaom9D0DtTfYEM...`);
        const preContratRef = doc(db, 'pre-contrats', 'GImXfpZaom9D0DtTfYEM');
        const preContratSnap = await getDoc(preContratRef);
        
        if (preContratSnap.exists()) {
          const preContratData = preContratSnap.data();
          console.log('✅ Pré-contrat trouvé !');
          console.log(`\n--- Détails du pré-contrat ---`);
          console.log(`Date création: ${preContratData.createdAt?.toDate ? preContratData.createdAt.toDate() : 'N/A'}`);
          console.log(`Date modification: ${preContratData.updatedAt?.toDate ? preContratData.updatedAt.toDate() : 'N/A'}`);
          console.log(`Structure ID dans le pré-contrat: ${preContratData.structureId || 'Non défini'}`);
          
          // Vérifier si la structure du pré-contrat correspond
          if (preContratData.structureId === structureId) {
            console.log('✅ Le pré-contrat est bien lié à cette structure');
          } else {
            console.log('⚠️  Le pré-contrat est lié à une autre structure');
          }
          
          // Afficher l'adresse dans le pré-contrat
          console.log(`\n--- Adresse dans le pré-contrat ---`);
          if (preContratData.structure) {
            console.log(`Rue: ${preContratData.structure.rue || 'Non définie'}`);
            console.log(`Code postal: ${preContratData.structure.codePostal || 'Non défini'}`);
            console.log(`Ville: ${preContratData.structure.ville || 'Non définie'}`);
            console.log(`Pays: ${preContratData.structure.pays || 'Non défini'}`);
          } else {
            console.log('❌ Aucune donnée de structure dans le pré-contrat');
          }
          
          // Comparer les dates
          console.log(`\n--- Comparaison des dates ---`);
          const structureModifDate = structureData.updatedAt?.toDate ? structureData.updatedAt.toDate() : null;
          const preContratCreateDate = preContratData.createdAt?.toDate ? preContratData.createdAt.toDate() : null;
          
          if (structureModifDate && preContratCreateDate) {
            if (structureModifDate > preContratCreateDate) {
              console.log('⚠️  La structure a été modifiée APRÈS la création du pré-contrat');
              console.log(`   Différence: ${Math.floor((structureModifDate - preContratCreateDate) / 1000 / 60)} minutes`);
            } else {
              console.log('✅ La structure n\'a pas été modifiée depuis la création du pré-contrat');
            }
          }
        } else {
          console.log('❌ Pré-contrat non trouvé');
        }
        
        // 4. Rechercher d'autres pré-contrats pour cette structure
        console.log(`\n\n4. Recherche d'autres pré-contrats pour cette structure...`);
        const otherPreContratsQuery = query(
          collection(db, 'pre-contrats'),
          where('structureId', '==', structureId),
          orderBy('createdAt', 'desc'),
          limit(5)
        );
        
        const otherPreContratsSnap = await getDocs(otherPreContratsQuery);
        if (!otherPreContratsSnap.empty) {
          console.log(`✅ ${otherPreContratsSnap.size} pré-contrat(s) trouvé(s) pour cette structure:`);
          otherPreContratsSnap.forEach(doc => {
            const data = doc.data();
            console.log(`\n- ID: ${doc.id}`);
            console.log(`  Date: ${data.createdAt?.toDate ? data.createdAt.toDate() : 'N/A'}`);
            console.log(`  Artiste: ${data.artisteName || 'N/A'}`);
            console.log(`  Concert: ${data.concertName || 'N/A'}`);
          });
        } else {
          console.log('❌ Aucun pré-contrat trouvé pour cette structure');
        }
      });
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error);
  }
}

async function checkStructureById() {
  console.log('\n\n=== Vérification directe par ID ===\n');
  
  try {
    const structureId = 'structure_1750614431015_kv5aekl66';
    const structureRef = doc(db, 'structures', structureId);
    const structureSnap = await getDoc(structureRef);
    
    if (structureSnap.exists()) {
      const data = structureSnap.data();
      console.log('✅ Structure trouvée par ID !');
      console.log('\n--- Informations complètes ---');
      console.log(JSON.stringify(data, null, 2));
      
      // Vérifier spécifiquement l'adresse
      console.log('\n--- Analyse de l\'adresse ---');
      if (data.adresse) {
        console.log('❌ Format imbriqué détecté (ancien format)');
        console.log('Adresse imbriquée:', JSON.stringify(data.adresse, null, 2));
      } else if (data.rue || data.codePostal || data.ville || data.pays) {
        console.log('✅ Format plat détecté (nouveau format)');
        console.log(`Rue: ${data.rue || 'Non définie'}`);
        console.log(`Code postal: ${data.codePostal || 'Non défini'}`);
        console.log(`Ville: ${data.ville || 'Non définie'}`);
        console.log(`Pays: ${data.pays || 'Non défini'}`);
      } else {
        console.log('⚠️  Aucune adresse définie');
      }
    }
  } catch (error) {
    console.error('Erreur:', error);
  }
}

// Lancer les vérifications
checkAssoGoLesJeuns()
  .then(() => checkStructureById())
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Erreur:', error);
    process.exit(1);
  });