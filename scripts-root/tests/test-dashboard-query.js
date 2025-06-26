// Test de la requête exacte du tableau de bord
const { initializeApp } = require('firebase/app');
const {
  getFirestore,
  collection,
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

async function testDashboardQuery() {
  console.log('=== Test de la requête du tableau de bord ===\n');
  
  try {
    // Organization ID du concert Redhouse
    const currentOrgId = '9LjkCJG04pEzbABdHkSf';
    
    console.log('1. Requête exacte du TableauDeBordPage:');
    console.log(`   where('organizationId', '==', '${currentOrgId}')`);
    console.log(`   orderBy('date', 'desc')\n`);
    
    // Reproduire la requête exacte du tableau de bord
    const concertsQuery = query(
      collection(db, 'concerts'),
      where('organizationId', '==', currentOrgId),
      orderBy('date', 'desc')
    );
    
    const concertsSnapshot = await getDocs(concertsQuery);
    console.log(`Nombre de concerts trouvés: ${concertsSnapshot.size}\n`);
    
    console.log('2. Liste des concerts récupérés:');
    console.log('═══════════════════════════════════════════════════════════════════\n');
    
    let redhouseFound = false;
    concertsSnapshot.forEach((doc) => {
      const data = doc.data();
      
      // Mettre en évidence le concert Redhouse
      if (doc.id === 'D7kwUS6UkfmU9ZtLoVAf' || data.structureNom === 'redhouse') {
        redhouseFound = true;
        console.log('🎯 CONCERT REDHOUSE TROUVÉ:');
      }
      
      console.log(`ID: ${doc.id}`);
      console.log(`- Artiste: ${data.artisteNom || 'Sans nom'}`);
      console.log(`- Date: ${data.date || 'Sans date'}`);
      console.log(`- Lieu: ${data.lieuNom || 'Sans lieu'}`);
      console.log(`- Structure: ${data.structureNom || 'Sans structure'}`);
      console.log(`- Statut: ${data.statut || 'Sans statut'}`);
      console.log(`- Niveau: ${data.niveau || 'Non défini'}`);
      console.log(`- Montant: ${data.montant || 'Non défini'}`);
      console.log(`- OrganizationId: ${data.organizationId}`);
      console.log('───────────────────────────────────────────────────────────────────\n');
    });
    
    if (!redhouseFound) {
      console.log('⚠️ LE CONCERT REDHOUSE N\'A PAS ÉTÉ TROUVÉ DANS LES RÉSULTATS!\n');
    } else {
      console.log('✅ LE CONCERT REDHOUSE EST BIEN DANS LES RÉSULTATS!\n');
    }
    
    // 3. Vérifier les champs manquants qui pourraient affecter l'affichage
    console.log('3. Analyse des champs manquants dans le concert Redhouse:');
    const redhouseConcert = concertsSnapshot.docs.find(doc => 
      doc.id === 'D7kwUS6UkfmU9ZtLoVAf' || doc.data().structureNom === 'redhouse'
    );
    
    if (redhouseConcert) {
      const data = redhouseConcert.data();
      const requiredFields = [
        'niveau',
        'montant',
        'nbDates',
        'priseOption',
        'typeContrat',
        'dateFin'
      ];
      
      console.log('Champs potentiellement manquants:');
      requiredFields.forEach(field => {
        if (!data[field]) {
          console.log(`- ${field}: ❌ MANQUANT (valeur par défaut sera utilisée)`);
        } else {
          console.log(`- ${field}: ✓ ${data[field]}`);
        }
      });
    }
    
    console.log('\n4. Conclusion:');
    if (redhouseFound) {
      console.log('Le concert Redhouse EST récupéré par la requête du tableau de bord.');
      console.log('Il devrait apparaître dans le tableau.');
      console.log('\nSi vous ne le voyez pas, vérifiez:');
      console.log('- Que vous êtes bien connecté avec le bon compte');
      console.log('- Que l\'organisation 9LjkCJG04pEzbABdHkSf est sélectionnée');
      console.log('- Qu\'il n\'y a pas de filtre de recherche actif dans le tableau');
      console.log('- Que le tableau est bien rechargé (F5 ou bouton refresh)');
    } else {
      console.log('Le concert Redhouse N\'EST PAS récupéré par la requête.');
      console.log('Problème potentiel avec l\'organizationId ou l\'index Firestore.');
    }
    
  } catch (error) {
    console.error('Erreur:', error);
    if (error.code === 'failed-precondition') {
      console.log('\n⚠️ ERREUR D\'INDEX FIRESTORE!');
      console.log('L\'index composite pour organizationId + date n\'existe pas.');
      console.log('Créez l\'index en suivant le lien dans l\'erreur ci-dessus.');
    }
  }
}

testDashboardQuery();