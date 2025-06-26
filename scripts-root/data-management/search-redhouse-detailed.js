// Recherche détaillée du concert Redhouse
const { initializeApp } = require('firebase/app');
const {
  getFirestore,
  collection,
  doc,
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

async function searchRedhouseDetailed() {
  console.log('=== Recherche détaillée du concert Redhouse ===\n');
  
  try {
    // 1. D'abord, récupérer TOUS les concerts et chercher Redhouse dans tous les champs
    console.log('1. Récupération de tous les concerts pour recherche exhaustive...');
    const allConcertsSnapshot = await getDocs(collection(db, 'concerts'));
    
    const redhouseConcerts = [];
    let totalConcerts = 0;
    
    allConcertsSnapshot.forEach(doc => {
      totalConcerts++;
      const data = doc.data();
      const searchText = JSON.stringify(data).toLowerCase();
      
      if (searchText.includes('redhouse')) {
        redhouseConcerts.push({ id: doc.id, data });
      }
    });
    
    console.log(`Total de concerts analysés: ${totalConcerts}`);
    console.log(`Concerts contenant "Redhouse": ${redhouseConcerts.length}\n`);
    
    // 2. Analyser en détail chaque concert Redhouse trouvé
    for (const concert of redhouseConcerts) {
      console.log(`\n=== Concert ${concert.id} ===`);
      console.log('Données complètes du concert:');
      console.log(JSON.stringify(concert.data, null, 2));
      
      // Vérifier la structure associée
      if (concert.data.structureId) {
        console.log(`\nVérification de la structure ${concert.data.structureId}...`);
        
        try {
          const structureDoc = await getDoc(doc(db, 'structures', concert.data.structureId));
          
          if (structureDoc.exists()) {
            console.log('✓ Structure trouvée!');
            const structureData = structureDoc.data();
            console.log(`- Nom: ${structureData.nom}`);
            console.log(`- Type: ${structureData.type}`);
            console.log(`- SIRET: ${structureData.siret}`);
            console.log(`- Ville: ${structureData.ville}`);
          } else {
            console.log('✗ Structure introuvable avec cet ID');
            
            // Vérifier si c'est un SIRET
            if (concert.data.structureId.match(/^\d{14}$/)) {
              console.log('→ L\'ID ressemble à un SIRET, recherche par SIRET...');
              const structureBySiret = await getDocs(
                query(
                  collection(db, 'structures'),
                  where('siret', '==', concert.data.structureId)
                )
              );
              
              if (!structureBySiret.empty) {
                structureBySiret.forEach(s => {
                  console.log('✓ Structure trouvée par SIRET!');
                  console.log(`  - ID correct: ${s.id}`);
                  console.log(`  - Nom: ${s.data().nom}`);
                });
              } else {
                console.log('✗ Aucune structure avec ce SIRET');
              }
            }
          }
        } catch (error) {
          console.error('Erreur lors de la vérification de la structure:', error.message);
        }
      }
      
      // Vérifier les contacts associés
      if (concert.data.contactIds && concert.data.contactIds.length > 0) {
        console.log(`\nContacts associés: ${concert.data.contactIds.length}`);
        for (const contactId of concert.data.contactIds.slice(0, 3)) { // Limiter à 3 pour éviter trop de requêtes
          try {
            const contactDoc = await getDoc(doc(db, 'contacts_unified', contactId));
            if (contactDoc.exists()) {
              const contactData = contactDoc.data();
              console.log(`- ${contactData.prenom} ${contactData.nom} (${contactData.entityType})`);
            }
          } catch (error) {
            console.log(`- Erreur pour le contact ${contactId}: ${error.message}`);
          }
        }
      }
    }
    
    // 3. Rechercher aussi dans les lieux
    console.log('\n\n=== Recherche dans la collection lieux ===');
    const lieuxSnapshot = await getDocs(collection(db, 'lieux'));
    let lieuxRedhouse = 0;
    
    lieuxSnapshot.forEach(doc => {
      const data = doc.data();
      const searchText = JSON.stringify(data).toLowerCase();
      
      if (searchText.includes('redhouse')) {
        lieuxRedhouse++;
        console.log(`\nLieu trouvé: ${doc.id}`);
        console.log(`- Nom: ${data.nom}`);
        console.log(`- Ville: ${data.ville}`);
        console.log(`- Adresse: ${data.adresse}`);
      }
    });
    
    console.log(`\nTotal de lieux "Redhouse": ${lieuxRedhouse}`);
    
    // 4. Rechercher dans les structures
    console.log('\n\n=== Recherche dans la collection structures ===');
    const structuresSnapshot = await getDocs(collection(db, 'structures'));
    let structuresRedhouse = 0;
    
    structuresSnapshot.forEach(doc => {
      const data = doc.data();
      const searchText = JSON.stringify(data).toLowerCase();
      
      if (searchText.includes('redhouse')) {
        structuresRedhouse++;
        console.log(`\nStructure trouvée: ${doc.id}`);
        console.log(`- Nom: ${data.nom}`);
        console.log(`- Type: ${data.type}`);
        console.log(`- SIRET: ${data.siret}`);
        console.log(`- Ville: ${data.ville}`);
      }
    });
    
    console.log(`\nTotal de structures "Redhouse": ${structuresRedhouse}`);
    
  } catch (error) {
    console.error('Erreur:', error);
  }
}

searchRedhouseDetailed();