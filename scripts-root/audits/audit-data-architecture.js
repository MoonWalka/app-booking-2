/**
 * Script d'audit de l'architecture des données TourCraft
 * Analyse les collections Firebase pour comprendre les relations et la logique de filtrage
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, query, where, limit, orderBy } = require('firebase/firestore');

// Configuration Firebase pour l'audit
const firebaseConfig = {
  projectId: process.env.FIREBASE_PROJECT_ID || 'tourcraft-france'
};

async function auditDataArchitecture() {
  console.log('🔍 AUDIT DE L\'ARCHITECTURE DES DONNÉES TOURCRAFT');
  console.log('='.repeat(60));

  try {
    // Initialisation Firebase
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    console.log('\n📊 ANALYSE DES COLLECTIONS');
    console.log('-'.repeat(30));

    // 1. Analyser la collection concerts
    console.log('\n🎵 COLLECTION: concerts');
    const concertsQuery = query(collection(db, 'concerts'), limit(5));
    const concertsSnapshot = await getDocs(concertsQuery);
    
    console.log(`Total analysé: ${concertsSnapshot.size} documents`);
    
    const concertFields = new Set();
    const contactLinkingFields = new Set();
    const structureLinkingFields = new Set();
    
    concertsSnapshot.docs.forEach((doc, index) => {
      const data = doc.data();
      console.log(`\n  Concert ${index + 1} (${doc.id}):`);
      
      // Analyser tous les champs
      Object.keys(data).forEach(key => {
        concertFields.add(key);
        if (key.toLowerCase().includes('contact') || key.toLowerCase().includes('programmateur')) {
          contactLinkingFields.add(key);
        }
        if (key.toLowerCase().includes('structure')) {
          structureLinkingFields.add(key);
        }
      });
      
      // Afficher les champs de liaison
      console.log(`    - contactId: ${data.contactId || 'N/A'}`);
      console.log(`    - contactIds: ${JSON.stringify(data.contactIds) || 'N/A'}`);
      console.log(`    - contactNom: ${data.contactNom || 'N/A'}`);
      console.log(`    - structureId: ${data.structureId || 'N/A'}`);
      console.log(`    - structureNom: ${data.structureNom || 'N/A'}`);
      console.log(`    - lieuId: ${data.lieuId || 'N/A'}`);
      console.log(`    - lieuNom: ${data.lieuNom || 'N/A'}`);
      console.log(`    - artisteId: ${data.artisteId || 'N/A'}`);
      console.log(`    - artisteNom: ${data.artisteNom || 'N/A'}`);
      console.log(`    - date: ${data.date?.toDate?.() || data.date || 'N/A'}`);
      console.log(`    - entrepriseId: ${data.entrepriseId || 'N/A'}`);
    });

    // 2. Analyser la collection contacts_unified
    console.log('\n\n👥 COLLECTION: contacts_unified');
    const contactsQuery = query(collection(db, 'contacts_unified'), limit(5));
    const contactsSnapshot = await getDocs(contactsQuery);
    
    console.log(`Total analysé: ${contactsSnapshot.size} documents`);
    
    const contactTypes = new Set();
    
    contactsSnapshot.docs.forEach((doc, index) => {
      const data = doc.data();
      console.log(`\n  Contact ${index + 1} (${doc.id}):`);
      console.log(`    - entityType: ${data.entityType}`);
      console.log(`    - entrepriseId: ${data.entrepriseId || 'N/A'}`);
      
      contactTypes.add(data.entityType);
      
      if (data.entityType === 'structure') {
        console.log(`    - structure.raisonSociale: ${data.structure?.raisonSociale || 'N/A'}`);
        console.log(`    - structure.nom: ${data.structure?.nom || 'N/A'}`);
        console.log(`    - personnes count: ${data.personnes?.length || 0}`);
      } else if (data.entityType === 'personne_libre') {
        console.log(`    - personne.nom: ${data.personne?.nom || 'N/A'}`);
        console.log(`    - personne.prenom: ${data.personne?.prenom || 'N/A'}`);
      }
      
      console.log(`    - tags: ${JSON.stringify(data.qualification?.tags) || 'N/A'}`);
    });

    // 3. Test de la logique de filtrage actuelle
    console.log('\n\n🔍 TESTS DE LOGIQUE DE FILTRAGE');
    console.log('-'.repeat(35));
    
    // Rechercher un concert avec structureNom défini
    const concertWithStructure = concertsSnapshot.docs.find(doc => doc.data().structureNom);
    
    if (concertWithStructure) {
      const concertData = concertWithStructure.data();
      const structureName = concertData.structureNom;
      
      console.log(`\n📋 Test avec structureNom: "${structureName}"`);
      
      // Reproduire la requête de ContactViewTabs
      const filteredQuery = query(
        collection(db, 'concerts'),
        where('entrepriseId', '==', concertData.entrepriseId),
        where('structureNom', '==', structureName),
        limit(10)
      );
      
      const filteredSnapshot = await getDocs(filteredQuery);
      console.log(`   → ${filteredSnapshot.size} concerts trouvés avec cette structure`);
      
      filteredSnapshot.docs.forEach((doc, index) => {
        const data = doc.data();
        console.log(`     ${index + 1}. ${data.artisteNom || 'Artiste N/A'} - ${data.date?.toDate?.().toLocaleDateString('fr-FR') || 'Date N/A'}`);
      });
    }

    // 4. Analyser les autres champs de liaison possibles
    console.log('\n\n🔗 ANALYSE DES CHAMPS DE LIAISON');
    console.log('-'.repeat(30));
    
    console.log('\nChamps de liaison contact trouvés dans concerts:');
    contactLinkingFields.forEach(field => console.log(`  - ${field}`));
    
    console.log('\nChamps de liaison structure trouvés dans concerts:');
    structureLinkingFields.forEach(field => console.log(`  - ${field}`));
    
    console.log('\nTous les champs concerts:');
    Array.from(concertFields).sort().forEach(field => console.log(`  - ${field}`));
    
    console.log('\nTypes de contacts unifiés:');
    contactTypes.forEach(type => console.log(`  - ${type}`));

    // 5. Recommandations d'architecture
    console.log('\n\n💡 RECOMMANDATIONS D\'ARCHITECTURE');
    console.log('-'.repeat(35));
    
    console.log('\n1. CHAMPS DE LIAISON IDENTIFIÉS:');
    console.log('   - Liaison principale: structureNom (chaîne de caractères)');
    console.log('   - Alternative possible: structureId (référence Firebase)');
    console.log('   - Alternative possible: contactId/contactIds (référence Firebase)');
    
    console.log('\n2. LOGIQUE DE FILTRAGE ACTUELLE:');
    console.log('   - ContactViewTabs filtre par: entrepriseId + structureNom');
    console.log('   - TableauDeBordPage charge tout par: entrepriseId uniquement');
    
    console.log('\n3. PROBLÈMES POTENTIELS:');
    console.log('   - Dépendance sur le nom de structure (peut changer)');
    console.log('   - Pas de liaison directe contact <-> concert via ID');
    console.log('   - Duplication de données (structureNom stocké dans concerts)');
    
    console.log('\n4. SOLUTIONS RECOMMANDÉES:');
    console.log('   - Option A: Utiliser structureId comme clé principale');
    console.log('   - Option B: Ajouter contactIds dans concerts pour liaison directe');
    console.log('   - Option C: Créer une table de jointure contact_concerts');

  } catch (error) {
    console.error('❌ Erreur lors de l\'audit:', error);
  }
}

// Exécution du script
if (require.main === module) {
  auditDataArchitecture()
    .then(() => {
      console.log('\n✅ Audit terminé');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Erreur fatale:', error);
      process.exit(1);
    });
}

module.exports = { auditDataArchitecture };