/**
 * Script pour rechercher le contact "festitest" dans Firebase
 * Utilise les services Firebase de l'application
 */

// Import des services Firebase
const { initializeApp } = require('firebase/app');
const { 
  getFirestore, 
  collection, 
  query, 
  where, 
  getDocs,
  doc,
  getDoc 
} = require('firebase/firestore');

// Configuration Firebase
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};

async function searchFestitestContact() {
  try {
    console.log('🔍 Recherche du contact "festitest"...');
    
    // Initialiser Firebase
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
    // Méthodes de recherche
    const searchMethods = [
      // 1. Recherche par nom exact
      {
        name: 'Nom exact "festitest"',
        query: query(collection(db, 'contacts'), where('nom', '==', 'festitest'))
      },
      // 2. Recherche par nom avec casse différente
      {
        name: 'Nom "Festitest"',
        query: query(collection(db, 'contacts'), where('nom', '==', 'Festitest'))
      },
      // 3. Recherche par prénom
      {
        name: 'Prénom "festitest"',
        query: query(collection(db, 'contacts'), where('prenom', '==', 'festitest'))
      },
      // 4. Recherche par email
      {
        name: 'Email contenant "festitest"',
        query: query(collection(db, 'contacts'), where('email', '>=', 'festitest'), where('email', '<=', 'festitest\uf8ff'))
      },
      // 5. Recherche par nomLowercase (si existe)
      {
        name: 'nomLowercase "festitest"',
        query: query(collection(db, 'contacts'), where('nomLowercase', '==', 'festitest'))
      }
    ];
    
    let foundContacts = [];
    
    for (const method of searchMethods) {
      console.log(`\n📋 ${method.name}:`);
      try {
        const snapshot = await getDocs(method.query);
        
        if (!snapshot.empty) {
          console.log(`✅ ${snapshot.size} contact(s) trouvé(s)`);
          
          snapshot.forEach(doc => {
            const data = doc.data();
            foundContacts.push({
              id: doc.id,
              ...data
            });
            
            console.log(`📄 Contact ID: ${doc.id}`);
            console.log(`   Nom: ${data.nom || 'N/A'}`);
            console.log(`   Prénom: ${data.prenom || 'N/A'}`);
            console.log(`   Email: ${data.email || 'N/A'}`);
            console.log(`   Téléphone: ${data.telephone || 'N/A'}`);
            console.log(`   Structure ID: ${data.structureId || 'N/A'}`);
            console.log(`   Structure Nom: ${data.structureNom || 'N/A'}`);
            console.log(`   Organization ID: ${data.entrepriseId || 'N/A'}`);
            console.log(`   Créé le: ${data.createdAt ? new Date(data.createdAt.seconds * 1000).toLocaleString() : 'N/A'}`);
            console.log(`   Modifié le: ${data.updatedAt ? new Date(data.updatedAt.seconds * 1000).toLocaleString() : 'N/A'}`);
            
            // Afficher les métadonnées complètes
            console.log('🔍 Métadonnées complètes:');
            console.log(JSON.stringify(data, null, 2));
          });
        } else {
          console.log('❌ Aucun contact trouvé');
        }
      } catch (error) {
        console.log(`⚠️ Erreur: ${error.message}`);
      }
    }
    
    // Si aucun contact trouvé, essayer de lister tous les contacts pour voir la structure
    if (foundContacts.length === 0) {
      console.log('\n🔍 Aucun contact "festitest" trouvé. Affichage de quelques contacts existants pour comprendre la structure...');
      
      try {
        const allContactsQuery = query(collection(db, 'contacts'));
        const allSnapshot = await getDocs(allContactsQuery);
        
        console.log(`📊 Total de ${allSnapshot.size} contacts dans la base`);
        
        // Afficher les 5 premiers contacts
        let count = 0;
        allSnapshot.forEach(doc => {
          if (count < 5) {
            const data = doc.data();
            console.log(`\n📄 Exemple de contact ${count + 1}:`);
            console.log(`   ID: ${doc.id}`);
            console.log(`   Nom: ${data.nom || 'N/A'}`);
            console.log(`   Prénom: ${data.prenom || 'N/A'}`);
            console.log(`   Email: ${data.email || 'N/A'}`);
            console.log(`   Organization ID: ${data.entrepriseId || 'N/A'}`);
            count++;
          }
        });
        
        // Afficher la structure de champs d'un contact
        if (allSnapshot.size > 0) {
          const firstContact = allSnapshot.docs[0].data();
          console.log('\n🏗️ Structure des champs d\'un contact type:');
          console.log(Object.keys(firstContact).sort().join(', '));
        }
        
      } catch (error) {
        console.error('Erreur lors de la récupération des contacts:', error);
      }
    }
    
    // Recherche dans d'autres collections organisationnelles
    console.log('\n🔍 Recherche dans les collections organisationnelles...');
    
    // Essayer de trouver les organisations existantes
    try {
      const orgsSnapshot = await getDocs(collection(db, 'organizations'));
      console.log(`📊 ${orgsSnapshot.size} organisation(s) trouvée(s)`);
      
      for (const orgDoc of orgsSnapshot.docs) {
        const orgData = orgDoc.data();
        console.log(`\n🏢 Organisation: ${orgData.name} (ID: ${orgDoc.id})`);
        
        // Rechercher dans la collection contacts de cette organisation
        const orgContactsCollection = `contacts_org_${orgDoc.id}`;
        console.log(`   Recherche dans: ${orgContactsCollection}`);
        
        try {
          const orgContactsQuery = query(collection(db, orgContactsCollection), where('nom', '==', 'festitest'));
          const orgContactsSnapshot = await getDocs(orgContactsQuery);
          
          if (!orgContactsSnapshot.empty) {
            console.log(`   ✅ Contact "festitest" trouvé dans ${orgContactsCollection}!`);
            
            orgContactsSnapshot.forEach(doc => {
              const data = doc.data();
              console.log(`   📄 Contact ID: ${doc.id}`);
              console.log('   🔍 Métadonnées complètes:');
              console.log(JSON.stringify(data, null, 4));
            });
          } else {
            console.log(`   ❌ Aucun contact "festitest" dans ${orgContactsCollection}`);
          }
        } catch (error) {
          console.log(`   ⚠️ Erreur lors de la recherche dans ${orgContactsCollection}: ${error.message}`);
        }
      }
    } catch (error) {
      console.error('Erreur lors de la recherche des organisations:', error);
    }
    
    if (foundContacts.length > 0) {
      console.log(`\n✅ Résumé: ${foundContacts.length} contact(s) "festitest" trouvé(s)`);
      return foundContacts;
    } else {
      console.log('\n❌ Aucun contact "festitest" trouvé dans la base de données');
      return [];
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de la recherche:', error);
    throw error;
  }
}

// Exécuter la recherche
if (require.main === module) {
  // Charger les variables d'environnement depuis .env si le fichier existe
  try {
    require('dotenv').config();
  } catch (e) {
    console.log('⚠️ Module dotenv non disponible, utilisation des variables d\'environnement système');
  }
  
  searchFestitestContact()
    .then((contacts) => {
      if (contacts.length > 0) {
        console.log('\n🎉 Recherche terminée avec succès!');
        process.exit(0);
      } else {
        console.log('\n📝 Aucun contact trouvé. Vous devrez peut-être créer le contact "festitest" pour vos tests.');
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error('\n💥 Erreur fatale:', error);
      process.exit(1);
    });
}

module.exports = { searchFestitestContact };