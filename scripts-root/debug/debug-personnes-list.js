import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Charger les variables d'environnement
dotenv.config({ path: join(__dirname, '.env.local') });

// Configuration Firebase
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

async function debugPersonnesList() {
  try {
    console.log('🔄 Connexion à Firebase...');
    
    // Se connecter avec l'utilisateur admin
    const email = process.env.VITE_TEST_ADMIN_EMAIL;
    const password = process.env.VITE_TEST_ADMIN_PASSWORD;
    
    if (!email || !password) {
      throw new Error('Identifiants admin manquants dans .env.local');
    }
    
    await signInWithEmailAndPassword(auth, email, password);
    console.log('✅ Connecté avec succès');

    // Récupérer l'organisation ID (Sophie Madet)
    const organizationId = 'rWJomQFxoWYJLJNJMmJl';
    console.log('📊 Organisation ID:', organizationId);

    // 1. Compter toutes les personnes
    const allPersonnesQuery = query(collection(db, 'personnes'));
    const allPersonnesSnapshot = await getDocs(allPersonnesQuery);
    console.log(`\n📋 Nombre total de personnes dans la base: ${allPersonnesSnapshot.size}`);

    // 2. Compter les personnes de l'organisation
    const orgPersonnesQuery = query(
      collection(db, 'personnes'),
      where('organizationId', '==', organizationId)
    );
    const orgPersonnesSnapshot = await getDocs(orgPersonnesQuery);
    console.log(`📋 Nombre de personnes pour l'organisation ${organizationId}: ${orgPersonnesSnapshot.size}`);

    // 3. Afficher les détails des personnes de l'organisation
    if (orgPersonnesSnapshot.size > 0) {
      console.log('\n👥 Personnes de l\'organisation:');
      orgPersonnesSnapshot.forEach((doc, index) => {
        const data = doc.data();
        console.log(`\n${index + 1}. ${data.prenom || ''} ${data.nom || ''} (ID: ${doc.id})`);
        console.log(`   - Email: ${data.email || 'N/A'}`);
        console.log(`   - Organisation ID: ${data.organizationId}`);
        console.log(`   - Personne libre: ${data.isPersonneLibre ? 'Oui' : 'Non'}`);
        console.log(`   - Tags: ${data.tags?.join(', ') || 'Aucun'}`);
      });
    }

    // 4. Vérifier les différents organization IDs présents
    console.log('\n🔍 Analyse des organization IDs uniques:');
    const orgIds = new Set();
    allPersonnesSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.organizationId) {
        orgIds.add(data.organizationId);
      }
    });
    console.log(`Nombre d'organisations différentes: ${orgIds.size}`);
    console.log('IDs:', Array.from(orgIds));

    // 5. Vérifier si des personnes n'ont pas d'organizationId
    let countNoOrg = 0;
    allPersonnesSnapshot.forEach(doc => {
      const data = doc.data();
      if (!data.organizationId) {
        countNoOrg++;
      }
    });
    console.log(`\n⚠️  Personnes sans organizationId: ${countNoOrg}`);

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    process.exit(0);
  }
}

// Lancer le debug
debugPersonnesList();