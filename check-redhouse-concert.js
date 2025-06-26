// Utilisation de Firebase client SDK avec chargement des variables d'environnement
const { initializeApp } = require('firebase/app');
const {
  getFirestore,
  collection,
  doc: firestoreDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit
} = require('firebase/firestore');

// Charger les variables d'environnement depuis .env.local
const fs = require('fs');
const path = require('path');

// Fonction pour charger .env.local
function loadEnvLocal() {
  try {
    const envPath = path.resolve(process.cwd(), '.env.local');
    
    if (!fs.existsSync(envPath)) {
      console.warn('Fichier .env.local non trouvé');
      return false;
    }
    
    const envContent = fs.readFileSync(envPath, 'utf8');
    
    envContent.split('\n').forEach(line => {
      if (!line || line.startsWith('#')) return;
      
      const match = line.match(/^([A-Za-z0-9_]+)=(.*)$/);
      if (match) {
        const [, key, value] = match;
        if (!process.env[key]) {
          process.env[key] = value.replace(/^['"](.*)['"]$/, '$1');
        }
      }
    });
    
    console.log('Variables d\'environnement chargées depuis .env.local');
    return true;
  } catch (error) {
    console.error('Erreur lors du chargement des variables d\'environnement:', error);
    return false;
  }
}

// Charger les variables d'environnement
loadEnvLocal();

// Configuration Firebase avec variables d'environnement
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};

// Initialisation Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkRedhouseConcert() {
  console.log('=== Recherche du concert Redhouse ===\n');
  
  try {
    // Rechercher les concerts contenant "Redhouse"
    const concertsRef = collection(db, 'concerts');
    
    // Chercher dans le nom du concert
    console.log('1. Recherche par nom du concert...');
    const nameQuery1 = await getDocs(
      query(
        concertsRef,
        where('nom', '>=', 'Redhouse'),
        where('nom', '<=', 'Redhouse\uf8ff')
      )
    );
    
    const nameQuery2 = await getDocs(
      query(
        concertsRef,
        where('nom', '>=', 'redhouse'),
        where('nom', '<=', 'redhouse\uf8ff')
      )
    );
    
    const nameQuery3 = await getDocs(
      query(
        concertsRef,
        where('nom', '>=', 'REDHOUSE'),
        where('nom', '<=', 'REDHOUSE\uf8ff')
      )
    );
    
    const foundByName = [...nameQuery1.docs, ...nameQuery2.docs, ...nameQuery3.docs];
    console.log(`Trouvé ${foundByName.length} concert(s) par nom\n`);
    
    // Chercher dans le lieu
    console.log('2. Recherche par lieu...');
    const lieuQuery1 = await getDocs(
      query(
        concertsRef,
        where('lieu', '>=', 'Redhouse'),
        where('lieu', '<=', 'Redhouse\uf8ff')
      )
    );
    
    const lieuQuery2 = await getDocs(
      query(
        concertsRef,
        where('lieu', '>=', 'redhouse'),
        where('lieu', '<=', 'redhouse\uf8ff')
      )
    );
    
    const foundByLieu = [...lieuQuery1.docs, ...lieuQuery2.docs];
    console.log(`Trouvé ${foundByLieu.length} concert(s) par lieu\n`);
    
    // Combiner les résultats uniques
    const allFound = new Map();
    [...foundByName, ...foundByLieu].forEach(doc => {
      allFound.set(doc.id, doc);
    });
    
    if (allFound.size === 0) {
      console.log('Aucun concert Redhouse trouvé. Recherche plus large...\n');
      
      // Récupérer quelques concerts récents pour voir le pattern
      const recentConcerts = await getDocs(
        query(
          concertsRef,
          orderBy('createdAt', 'desc'),
          limit(10)
        )
      );
      
      console.log('Recherche dans les concerts récents pour "Redhouse"...');
      recentConcerts.forEach(doc => {
        const data = doc.data();
        const searchText = JSON.stringify(data).toLowerCase();
        if (searchText.includes('redhouse')) {
          console.log(`\nTrouvé "Redhouse" dans le concert ${doc.id}:`);
          console.log('- Nom:', data.nom);
          console.log('- Lieu:', data.lieu);
          console.log('- Structure ID:', data.structureId);
          allFound.set(doc.id, doc);
        }
      });
    }
    
    // Analyser les concerts trouvés
    console.log('\n=== Analyse des concerts trouvés ===\n');
    
    for (const [id, doc] of allFound) {
      const data = doc.data();
      console.log(`Concert ID: ${id}`);
      console.log('- Nom:', data.nom);
      console.log('- Lieu:', data.lieu);
      console.log('- Date:', data.date);
      console.log('- Structure ID:', data.structureId);
      console.log('- Type de structureId:', typeof data.structureId);
      
      // Vérifier si la structure existe
      if (data.structureId) {
        console.log('\nVérification de la structure associée...');
        
        // Essayer de récupérer la structure
        try {
          const structureDoc = await getDoc(firestoreDoc(db, 'structures', data.structureId));
          
          if (structureDoc.exists) {
            const structureData = structureDoc.data();
            console.log('✓ Structure trouvée!');
            console.log('  - Nom:', structureData.nom);
            console.log('  - SIRET:', structureData.siret);
            console.log('  - Type:', structureData.type);
          } else {
            console.log('✗ Structure introuvable avec l\'ID:', data.structureId);
            
            // Vérifier si c'est un SIRET
            if (data.structureId.match(/^\d{14}$/)) {
              console.log('  → L\'ID ressemble à un SIRET, recherche par SIRET...');
              const structureBySiret = await getDocs(
                query(
                  collection(db, 'structures'),
                  where('siret', '==', data.structureId)
                )
              );
              
              if (!structureBySiret.empty) {
                console.log('  ✓ Structure trouvée par SIRET!');
                structureBySiret.forEach(s => {
                  console.log('    - ID correct:', s.id);
                  console.log('    - Nom:', s.data().nom);
                });
              }
            }
          }
        } catch (error) {
          console.log('Erreur lors de la vérification de la structure:', error.message);
        }
      } else {
        console.log('- Pas de structureId défini');
      }
      
      console.log('\n' + '-'.repeat(50) + '\n');
    }
    
    // Analyser les concerts récents pour voir les patterns
    console.log('=== Analyse des concerts récents (format des structureId) ===\n');
    
    const recentConcerts = await getDocs(
      query(
        concertsRef,
        orderBy('createdAt', 'desc'),
        limit(20)
      )
    );
    
    let withStructureId = 0;
    let withSiretAsId = 0;
    let withProperFirebaseId = 0;
    let withoutStructureId = 0;
    
    for (const doc of recentConcerts.docs) {
      const data = doc.data();
      if (data.structureId) {
        withStructureId++;
        if (data.structureId.match(/^\d{14}$/)) {
          withSiretAsId++;
        } else if (data.structureId.match(/^[a-zA-Z0-9]{20,}$/)) {
          withProperFirebaseId++;
        }
      } else {
        withoutStructureId++;
      }
    }
    
    console.log(`Sur ${recentConcerts.size} concerts récents:`);
    console.log(`- ${withStructureId} ont un structureId`);
    console.log(`- ${withSiretAsId} utilisent un SIRET comme ID (problématique)`);
    console.log(`- ${withProperFirebaseId} utilisent un ID Firebase correct`);
    console.log(`- ${withoutStructureId} n'ont pas de structureId`);
    
    // Afficher quelques exemples
    console.log('\nExemples de concerts récents:');
    let count = 0;
    for (const doc of recentConcerts.docs) {
      if (count >= 5) break;
      const data = doc.data();
      console.log(`\n${++count}. ${data.nom || 'Sans nom'} (${doc.id})`);
      console.log('   - Date:', data.date);
      console.log('   - Lieu:', data.lieu);
      console.log('   - Structure ID:', data.structureId || 'Aucun');
      if (data.structureId && data.structureId.match(/^\d{14}$/)) {
        console.log('   ⚠️  SIRET utilisé comme ID!');
      }
    }
    
  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    // Pas besoin de fermer l'app avec le client SDK
  }
}

checkRedhouseConcert();