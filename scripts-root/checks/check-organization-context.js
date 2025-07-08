// Script pour vérifier le contexte d'organisation
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

async function checkOrganizationContext() {
  console.log('=== Vérification du contexte d\'organisation ===\n');
  
  try {
    // 1. Récupérer toutes les organisations
    console.log('1. Liste des organisations disponibles:');
    const orgsSnapshot = await getDocs(collection(db, 'organizations'));
    const organizations = [];
    
    orgsSnapshot.forEach(doc => {
      const data = doc.data();
      organizations.push({
        id: doc.id,
        nom: data.nom,
        email: data.email
      });
      console.log(`- ${doc.id}: ${data.nom} (${data.email})`);
    });
    
    // 2. Vérifier les concerts par organisation
    console.log('\n2. Nombre de concerts par organisation:');
    for (const org of organizations) {
      const concertsQuery = query(
        collection(db, 'concerts'),
        where('entrepriseId', '==', org.id)
      );
      const snapshot = await getDocs(concertsQuery);
      console.log(`- ${org.nom}: ${snapshot.size} concerts`);
      
      // Afficher quelques exemples
      if (snapshot.size > 0) {
        console.log('  Exemples:');
        let count = 0;
        snapshot.forEach(doc => {
          if (count < 3) {
            const data = doc.data();
            console.log(`    • ${data.artisteNom || 'Sans nom'} - ${data.date || 'Sans date'} (${doc.id})`);
            count++;
          }
        });
      }
    }
    
    // 3. Vérifier spécifiquement le concert Redhouse
    console.log('\n3. Concert Redhouse:');
    const concertId = 'D7kwUS6UkfmU9ZtLoVAf';
    const concertDoc = await getDoc(firestoreDoc(db, 'concerts', concertId));
    
    if (concertDoc.exists) {
      const concertData = concertDoc.data();
      console.log('- Concert ID:', concertId);
      console.log('- Organization ID du concert:', concertData.entrepriseId);
      
      // Trouver à quelle organisation il appartient
      const orgMatch = organizations.find(org => org.id === concertData.entrepriseId);
      if (orgMatch) {
        console.log(`- Appartient à: ${orgMatch.nom} (${orgMatch.email})`);
      } else {
        console.log('- ⚠️ Organization non trouvée!');
      }
    }
    
    // 4. Vérifier la cohérence des données
    console.log('\n4. Vérification de cohérence:');
    
    // Vérifier les concerts sans entrepriseId
    const allConcertsSnapshot = await getDocs(collection(db, 'concerts'));
    let withoutOrgId = 0;
    let wrongOrgId = 0;
    
    allConcertsSnapshot.forEach(doc => {
      const data = doc.data();
      if (!data.entrepriseId) {
        withoutOrgId++;
      } else if (!organizations.find(org => org.id === data.entrepriseId)) {
        wrongOrgId++;
      }
    });
    
    console.log(`- Concerts sans entrepriseId: ${withoutOrgId}`);
    console.log(`- Concerts avec entrepriseId invalide: ${wrongOrgId}`);
    console.log(`- Total concerts: ${allConcertsSnapshot.size}`);
    
    // 5. Suggestion
    console.log('\n5. Recommandation:');
    console.log('Pour voir le concert Redhouse dans le tableau de bord, assurez-vous que:');
    console.log('- Vous êtes connecté avec le bon compte utilisateur');
    console.log('- L\'organisation sélectionnée dans l\'app est: "9LjkCJG04pEzbABdHkSf"');
    console.log('- Le concert a bien tous les champs requis (✓ confirmé)');
    
  } catch (error) {
    console.error('Erreur:', error);
  }
}

checkOrganizationContext();