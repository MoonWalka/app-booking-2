#!/usr/bin/env node

/**
 * Script de migration rapide des personnes imbriquées vers la collection personnes
 */

// Charger les variables d'environnement
require('dotenv').config({ path: '.env.local' });

const { initializeApp } = require('firebase/app');
const { 
  getFirestore, 
  collection, 
  doc, 
  getDocs, 
  query, 
  where, 
  writeBatch,
  serverTimestamp,
  getDoc
} = require('firebase/firestore');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');

// Configuration Firebase
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

async function migratePersonnes() {
  try {
    console.log('🔄 Connexion à Firebase...');
    
    // Se connecter avec l'utilisateur admin
    const email = process.env.REACT_APP_TEST_ADMIN_EMAIL || 'admin@tourcraft.app';
    const password = process.env.REACT_APP_TEST_ADMIN_PASSWORD || 'admin123456';
    
    await signInWithEmailAndPassword(auth, email, password);
    console.log('✅ Connecté avec succès');

    // Organisation Sophie Madet
    const entrepriseId = 'rWJomQFxoWYJLJNJMmJl';
    console.log(`📊 Migration pour l'organisation: ${entrepriseId}`);

    // 1. Récupérer tous les contacts de l'organisation
    const contactsQuery = query(
      collection(db, 'contacts_unified'),
      where('entrepriseId', '==', entrepriseId)
    );
    const contactsSnapshot = await getDocs(contactsQuery);
    console.log(`📋 Nombre de contacts trouvés: ${contactsSnapshot.size}`);

    const batch = writeBatch(db);
    let personnesCreated = 0;
    let liaisonsCreated = 0;
    const personnesMap = new Map(); // email -> personneId

    // 2. Pour chaque contact
    for (const contactDoc of contactsSnapshot.docs) {
      const contactData = contactDoc.data();
      const contactId = contactDoc.id;

      // Traiter les personnes imbriquées
      if (contactData.personnes && Array.isArray(contactData.personnes)) {
        for (const personne of contactData.personnes) {
          if (!personne.prenom && !personne.nom) continue;

          const email = personne.mailDirect || personne.email || null;
          let personneId;

          // Vérifier si cette personne existe déjà
          if (email && personnesMap.has(email)) {
            personneId = personnesMap.get(email);
            console.log(`♻️  Personne existante trouvée: ${personne.prenom} ${personne.nom}`);
          } else {
            // Créer une nouvelle personne
            const personneRef = doc(collection(db, 'personnes'));
            personneId = personneRef.id;

            const personneData = {
              entrepriseId,
              civilite: personne.civilite || null,
              prenom: personne.prenom || '',
              nom: personne.nom || '',
              email: email,
              mailDirect: personne.mailDirect || null,
              mailPerso: personne.mailPerso || null,
              telephone: personne.telDirect || personne.telephone || null,
              telephone2: personne.telPerso || null,
              telDirect: personne.telDirect || null,
              telPerso: personne.telPerso || null,
              mobile: personne.mobile || null,
              fax: personne.fax || null,
              fonction: personne.fonction || null,
              adresse: personne.adresse || null,
              suiteAdresse: personne.suiteAdresse || null,
              codePostal: personne.codePostal || null,
              ville: personne.ville || null,
              departement: personne.departement || null,
              region: personne.region || null,
              pays: personne.pays || 'France',
              tags: personne.tags || [],
              isPersonneLibre: false,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
              createdBy: 'migration-script',
              updatedBy: 'migration-script'
            };

            batch.set(personneRef, personneData);
            personnesCreated++;
            
            if (email) {
              personnesMap.set(email, personneId);
            }
            
            console.log(`✅ Nouvelle personne: ${personne.prenom} ${personne.nom}`);
          }

          // Créer la liaison structure-personne
          const liaisonRef = doc(collection(db, 'liaisons'));
          const liaisonData = {
            entrepriseId,
            structureId: contactId,
            personneId: personneId,
            fonction: personne.fonction || null,
            actif: personne.actif !== false,
            prioritaire: personne.prioritaire || false,
            interesse: personne.interesse || false,
            dateDebut: null,
            dateFin: null,
            notes: null,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            createdBy: 'migration-script',
            updatedBy: 'migration-script'
          };

          batch.set(liaisonRef, liaisonData);
          liaisonsCreated++;
        }
      }

      // Traiter aussi les personnes libres (sans structure)
      if (contactData.entityType === 'personne' || contactData.isPersonneLibre) {
        const email = contactData.mailDirect || contactData.email || null;
        
        if (!email || !personnesMap.has(email)) {
          const personneRef = doc(collection(db, 'personnes'));
          const personneData = {
            entrepriseId,
            civilite: contactData.civilite || null,
            prenom: contactData.prenom || '',
            nom: contactData.nom || '',
            email: email,
            mailDirect: contactData.mailDirect || null,
            mailPerso: contactData.mailPerso || null,
            telephone: contactData.telDirect || contactData.telephone || null,
            telephone2: contactData.telPerso || null,
            telDirect: contactData.telDirect || null,
            telPerso: contactData.telPerso || null,
            mobile: contactData.mobile || null,
            fax: contactData.fax || null,
            fonction: contactData.fonction || null,
            adresse: contactData.adresse || null,
            suiteAdresse: contactData.suiteAdresse || null,
            codePostal: contactData.codePostal || null,
            ville: contactData.ville || null,
            departement: contactData.departement || null,
            region: contactData.region || null,
            pays: contactData.pays || 'France',
            tags: contactData.tags || [],
            isPersonneLibre: true,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            createdBy: 'migration-script',
            updatedBy: 'migration-script'
          };

          batch.set(personneRef, personneData);
          personnesCreated++;
          
          console.log(`✅ Personne libre: ${contactData.prenom} ${contactData.nom}`);
        }
      }
    }

    // 3. Exécuter la migration
    console.log('\n🚀 Exécution de la migration...');
    await batch.commit();
    
    console.log('\n✅ Migration terminée !');
    console.log(`📊 Résultats:`);
    console.log(`   - Personnes créées: ${personnesCreated}`);
    console.log(`   - Liaisons créées: ${liaisonsCreated}`);

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    process.exit(0);
  }
}

// Lancer la migration
migratePersonnes();