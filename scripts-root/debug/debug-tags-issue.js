const { initializeApp } = require('firebase/app');
const { getFirestore, collection, query, where, getDocs } = require('firebase/firestore');

// Configuration Firebase
const firebaseConfig = {
  apiKey: "YOUR_API_KEY_HERE",
  authDomain: "tourcraft-29ee8.firebaseapp.com",
  projectId: "tourcraft-29ee8",
  storageBucket: "tourcraft-29ee8.appspot.com",
  messagingSenderId: "862434754712",
  appId: "1:862434754712:web:a0b7b8c9d0e1f2g3h4i5j6"
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// TAGS_HIERARCHY structure (simplified for debugging)
const TAGS_HIERARCHY = [
  {
    id: 'organisme-institution',
    label: 'Organisme / institution',
    children: [
      { id: 'institution-nationale', label: 'Institution nationale' },
      // ... other children
    ]
  },
  {
    id: 'disque',
    label: 'Disque',
    children: [
      { id: 'label-maison-disques', label: 'Label / maison de disques' },
      // ... other children
    ]
  },
  // ... other categories
];

async function debugTagsIssue() {
  try {
    console.log('🔍 Debug: Analyse du système de tags');
    console.log('=====================================');
    
    // Simuler le chargement pour une organisation
    const entrepriseId = 'test-org'; // Vous devrez mettre l'ID réel
    
    console.log('1. Requête vers Firebase pour les contacts...');
    const contactsQuery = query(
      collection(db, 'contacts'),
      where('entrepriseId', '==', entrepriseId)
    );
    
    const contactsSnapshot = await getDocs(contactsQuery);
    console.log(`   ✅ Nombre de contacts trouvés: ${contactsSnapshot.size}`);
    
    if (contactsSnapshot.size === 0) {
      console.log('   ⚠️ Aucun contact trouvé pour cette organisation');
      console.log('   💡 Vérifiez que l\'entrepriseId est correct');
      return;
    }
    
    console.log('\n2. Analyse de la structure des contacts...');
    const usageCount = {};
    let contactsWithTags = 0;
    let contactsWithoutTags = 0;
    
    contactsSnapshot.docs.forEach((doc, index) => {
      const contact = doc.data();
      
      // Log des premiers contacts pour debug
      if (index < 3) {
        console.log(`   Contact ${index + 1}:`);
        console.log(`     - ID: ${doc.id}`);
        console.log(`     - Nom: ${contact.nom || contact.structure?.raisonSociale || 'N/A'}`);
        console.log(`     - Structure qualification: ${JSON.stringify(contact.qualification)}`);
        console.log(`     - Tags: ${JSON.stringify(contact.qualification?.tags)}`);
      }
      
      const tags = contact.qualification?.tags || [];
      
      if (tags.length > 0) {
        contactsWithTags++;
        
        tags.forEach(tag => {
          // Compter par label
          usageCount[tag] = (usageCount[tag] || 0) + 1;
          
          // Aussi essayer de trouver l'ID correspondant dans la hiérarchie
          const findTagInHierarchy = (items) => {
            for (const item of items) {
              if (item.label === tag) {
                usageCount[item.id] = (usageCount[item.id] || 0) + 1;
              }
              if (item.children) {
                findTagInHierarchy(item.children);
              }
            }
          };
          findTagInHierarchy(TAGS_HIERARCHY);
        });
      } else {
        contactsWithoutTags++;
      }
    });
    
    console.log('\n3. Statistiques des tags:');
    console.log(`   - Contacts avec tags: ${contactsWithTags}`);
    console.log(`   - Contacts sans tags: ${contactsWithoutTags}`);
    console.log(`   - Nombre de tags uniques comptés: ${Object.keys(usageCount).length}`);
    
    console.log('\n4. Détail des tags comptés:');
    Object.entries(usageCount).forEach(([tag, count]) => {
      console.log(`   - "${tag}": ${count} utilisations`);
    });
    
    console.log('\n5. Analyse du problème:');
    if (Object.keys(usageCount).length === 0) {
      console.log('   ❌ Aucun tag compté -> Les données realUsageData restent vides');
      console.log('   ❌ Cela déclenche la génération de nombres aléatoires');
      console.log('   💡 Solution: Vérifier la structure qualification.tags dans les contacts');
    } else {
      console.log('   ✅ Tags comptés avec succès');
      console.log('   💡 Le problème pourrait être ailleurs (condition de chargement, etc.)');
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du debug:', error);
  }
}

// Exécuter le debug
if (require.main === module) {
  debugTagsIssue()
    .then(() => {
      console.log('\n🏁 Debug terminé');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Erreur fatale:', error);
      process.exit(1);
    });
}

module.exports = { debugTagsIssue };