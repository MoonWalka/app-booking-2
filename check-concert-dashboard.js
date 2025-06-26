// Script pour vérifier pourquoi le concert Redhouse n'apparaît pas dans le tableau
const { initializeApp } = require('firebase/app');
const {
  getFirestore,
  collection,
  doc: firestoreDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy
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

async function checkConcertDashboard() {
  console.log('=== Vérification concert Redhouse dans le contexte Dashboard ===\n');
  
  try {
    // 1. Récupérer le concert Redhouse
    const concertId = 'D7kwUS6UkfmU9ZtLoVAf';
    const concertDoc = await getDoc(firestoreDoc(db, 'concerts', concertId));
    
    if (!concertDoc.exists) {
      console.log('Concert introuvable!');
      return;
    }
    
    const concertData = concertDoc.data();
    console.log('Concert trouvé:', concertId);
    console.log('Données complètes:', JSON.stringify(concertData, null, 2));
    
    // 2. Vérifier les champs requis pour le tableau de bord
    console.log('\n=== Analyse des champs requis ===');
    console.log('organizationId:', concertData.organizationId || '❌ MANQUANT');
    console.log('date:', concertData.date || '❌ MANQUANT');
    console.log('structureId:', concertData.structureId || '❌ MANQUANT');
    console.log('artisteNom:', concertData.artisteNom || '❌ MANQUANT');
    console.log('lieuNom:', concertData.lieuNom || '❌ MANQUANT');
    
    // 3. Vérifier si la structure existe
    if (concertData.structureId) {
      console.log('\n=== Vérification de la structure ===');
      const structureDoc = await getDoc(firestoreDoc(db, 'structures', concertData.structureId));
      if (structureDoc.exists) {
        const structureData = structureDoc.data();
        console.log('✓ Structure trouvée:', concertData.structureId);
        console.log('- Nom:', structureData.nom || structureData.structureRaisonSociale);
        console.log('- OrganizationId:', structureData.organizationId);
      } else {
        console.log('✗ Structure introuvable!');
      }
    }
    
    // 4. Simuler la requête du tableau de bord
    if (concertData.organizationId) {
      console.log('\n=== Simulation requête tableau de bord ===');
      console.log(`Requête: where('organizationId', '==', '${concertData.organizationId}')`);
      
      const concertsQuery = query(
        collection(db, 'concerts'),
        where('organizationId', '==', concertData.organizationId),
        orderBy('date', 'desc')
      );
      
      try {
        const snapshot = await getDocs(concertsQuery);
        console.log(`Nombre de concerts trouvés: ${snapshot.size}`);
        
        // Vérifier si notre concert est dans les résultats
        let found = false;
        snapshot.forEach(doc => {
          if (doc.id === concertId) {
            found = true;
          }
        });
        
        if (found) {
          console.log('✓ Le concert Redhouse EST dans les résultats de la requête');
        } else {
          console.log('✗ Le concert Redhouse N\'EST PAS dans les résultats de la requête');
        }
      } catch (error) {
        console.log('Erreur lors de la requête:', error.message);
        console.log('Cela peut indiquer un problème d\'index sur organizationId + date');
      }
    }
    
    // 5. Comparer avec d'autres concerts qui fonctionnent
    console.log('\n=== Comparaison avec d\'autres concerts ===');
    const recentConcerts = await getDocs(
      query(
        collection(db, 'concerts'),
        orderBy('createdAt', 'desc'),
        where('artisteNom', '!=', null)
      )
    );
    
    console.log('Exemple de concert qui fonctionne:');
    if (recentConcerts.size > 0) {
      const workingConcert = recentConcerts.docs[0];
      const workingData = workingConcert.data();
      console.log('ID:', workingConcert.id);
      console.log('- organizationId:', workingData.organizationId);
      console.log('- date:', workingData.date);
      console.log('- artisteNom:', workingData.artisteNom);
      console.log('- structureId:', workingData.structureId);
    }
    
  } catch (error) {
    console.error('Erreur:', error);
  }
}

checkConcertDashboard();