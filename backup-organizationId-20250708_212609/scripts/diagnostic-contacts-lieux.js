/**
 * SCRIPT DE DIAGNOSTIC COMPLET - CONTACTS & LIEUX
 * À exécuter dans la console du navigateur (F12) après connexion à l'application
 * 
 * Ce script va investiguer en profondeur pourquoi les contacts et lieux 
 * ne s'affichent pas alors que concerts et structures fonctionnent
 */

console.log('🔍 DÉBUT DU DIAGNOSTIC COMPLET - CONTACTS & LIEUX');
console.log('='.repeat(60));

/**
 * 1. VÉRIFICATION DE L'ÉTAT DE FIREBASE
 */
async function checkFirebaseState() {
  console.log('\n📊 1. VÉRIFICATION DE L\'ÉTAT DE FIREBASE');
  console.log('-'.repeat(40));
  
  // Vérifier l'accès à Firebase
  if (!window.firebase) {
    console.error('❌ Firebase non disponible dans window.firebase');
    return false;
  }
  
  console.log('✅ Firebase disponible');
  
  // Vérifier les services
  try {
    const { db } = await import('/src/services/firebase-service.js');
    console.log('✅ Service firebase-service importé');
    
    // Tester une collection simple
    const { collection, getDocs } = await import('/src/services/firebase-service.js');
    const testSnapshot = await getDocs(collection(db, 'concerts'));
    console.log(`✅ Test collection concerts: ${testSnapshot.docs.length} documents`);
    
    return true;
  } catch (error) {
    console.error('❌ Erreur service Firebase:', error);
    return false;
  }
}

/**
 * 2. AUDIT DES COLLECTIONS
 */
async function auditCollections() {
  console.log('\n📁 2. AUDIT DES COLLECTIONS');
  console.log('-'.repeat(40));
  
  const { db, collection, getDocs, query, where } = await import('/src/services/firebase-service.js');
  
  const collectionsToCheck = [
    { name: 'concerts', expected: true },
    { name: 'structures', expected: true },
    { name: 'contacts', expected: false },
    { name: 'lieux', expected: false }
  ];
  
  const results = {};
  
  for (const coll of collectionsToCheck) {
    try {
      console.log(`\n  📂 Collection: ${coll.name}`);
      
      // Compter tous les documents
      const allSnapshot = await getDocs(collection(db, coll.name));
      const totalCount = allSnapshot.docs.length;
      
      console.log(`    📊 Total documents: ${totalCount}`);
      
      if (totalCount === 0) {
        console.log(`    ⚠️  Collection ${coll.name} est VIDE !`);
        results[coll.name] = { total: 0, withOrgId: 0, withoutOrgId: 0, status: 'EMPTY' };
        continue;
      }
      
      // Analyser les organizationId
      let withOrgId = 0;
      let withoutOrgId = 0;
      const orgIds = new Set();
      const samples = [];
      
      allSnapshot.forEach(doc => {
        const data = doc.data();
        if (data.organizationId) {
          withOrgId++;
          orgIds.add(data.organizationId);
        } else {
          withoutOrgId++;
        }
        
        if (samples.length < 3) {
          samples.push({
            id: doc.id,
            name: data.nom || data.titre || data.raisonSociale || 'Sans nom',
            hasOrgId: !!data.organizationId,
            orgId: data.organizationId || 'NONE'
          });
        }
      });
      
      console.log(`    🔑 Avec organizationId: ${withOrgId}`);
      console.log(`    ❌ Sans organizationId: ${withoutOrgId}`);
      console.log(`    🏢 OrganizationIds uniques: [${Array.from(orgIds).join(', ')}]`);
      console.log(`    📋 Échantillons:`, samples);
      
      // Déterminer le statut
      let status = 'OK';
      if (totalCount === 0) status = 'EMPTY';
      else if (withoutOrgId > 0) status = 'MISSING_ORG_ID';
      else if (coll.expected && totalCount === 0) status = 'UNEXPECTED_EMPTY';
      else if (!coll.expected && totalCount > 0) status = 'UNEXPECTED_DATA';
      
      results[coll.name] = {
        total: totalCount,
        withOrgId,
        withoutOrgId,
        orgIds: Array.from(orgIds),
        samples,
        status
      };
      
    } catch (error) {
      console.error(`    ❌ Erreur collection ${coll.name}:`, error);
      results[coll.name] = { error: error.message, status: 'ERROR' };
    }
  }
  
  return results;
}

/**
 * 3. VÉRIFICATION DE L'ORGANISATION COURANTE
 */
async function checkCurrentOrganization() {
  console.log('\n🏢 3. VÉRIFICATION DE L\'ORGANISATION COURANTE');
  console.log('-'.repeat(40));
  
  try {
    // Chercher le contexte d'organisation
    const orgContext = window.React?.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED?.ReactCurrentOwner?.current;
    
    // Alternative: chercher dans le localStorage
    const storedOrg = localStorage.getItem('currentOrganization');
    
    console.log('🔍 Recherche de l\'organisation courante...');
    
    if (storedOrg) {
      const org = JSON.parse(storedOrg);
      console.log('✅ Organisation trouvée dans localStorage:', org);
      return org;
    }
    
    // Essayer d'accéder au state React (méthode avancée)
    const reactFiber = document.querySelector('#root')?._reactInternalFiber;
    console.log('🔧 Tentative d\'accès au state React...');
    
    return null;
  } catch (error) {
    console.error('❌ Erreur vérification organisation:', error);
    return null;
  }
}

/**
 * 4. TEST DES REQUÊTES AVEC ORGANIZATION_ID
 */
async function testQueriesWithOrgId(organizationId) {
  console.log('\n🔎 4. TEST DES REQUÊTES AVEC ORGANIZATION_ID');
  console.log('-'.repeat(40));
  
  if (!organizationId) {
    console.log('⚠️  Pas d\'organizationId fourni, test avec requêtes générales');
    return;
  }
  
  const { db, collection, getDocs, query, where } = await import('/src/services/firebase-service.js');
  
  const collectionsToTest = ['contacts', 'lieux', 'concerts', 'structures'];
  
  for (const collName of collectionsToTest) {
    try {
      console.log(`\n  🔍 Test ${collName} avec organizationId: ${organizationId}`);
      
      const q = query(
        collection(db, collName),
        where('organizationId', '==', organizationId)
      );
      
      const snapshot = await getDocs(q);
      console.log(`    📊 Résultats: ${snapshot.docs.length} documents`);
      
      if (snapshot.docs.length > 0) {
        const sample = snapshot.docs[0].data();
        console.log(`    📋 Échantillon:`, {
          id: snapshot.docs[0].id,
          nom: sample.nom || sample.titre || 'Sans nom',
          organizationId: sample.organizationId
        });
      }
      
    } catch (error) {
      console.error(`    ❌ Erreur requête ${collName}:`, error);
    }
  }
}

/**
 * 5. VÉRIFICATION DES INDEXES FIRESTORE
 */
async function checkFirestoreIndexes() {
  console.log('\n📑 5. VÉRIFICATION DES INDEXES FIRESTORE');
  console.log('-'.repeat(40));
  
  // Les requêtes complexes nécessitent des index
  const { db, collection, getDocs, query, where, orderBy } = await import('/src/services/firebase-service.js');
  
  const indexTests = [
    {
      name: 'contacts + organizationId + nom',
      collection: 'contacts',
      constraints: [
        where('organizationId', '==', 'test'),
        orderBy('nom', 'asc')
      ]
    },
    {
      name: 'lieux + organizationId + nom',
      collection: 'lieux',
      constraints: [
        where('organizationId', '==', 'test'),
        orderBy('nom', 'asc')
      ]
    }
  ];
  
  for (const test of indexTests) {
    try {
      console.log(`  🔍 Test index: ${test.name}`);
      
      const q = query(collection(db, test.collection), ...test.constraints);
      await getDocs(q); // Juste tester si ça fonctionne
      
      console.log(`    ✅ Index ${test.name} disponible`);
    } catch (error) {
      if (error.code === 'failed-precondition') {
        console.log(`    ⚠️  Index ${test.name} MANQUANT - Requête complexe impossible`);
        console.log(`    💡 Lien pour créer l'index:`, error.message);
      } else {
        console.log(`    ❌ Erreur test ${test.name}:`, error.code);
      }
    }
  }
}

/**
 * 6. FONCTION PRINCIPALE DE DIAGNOSTIC
 */
async function runFullDiagnostic() {
  try {
    // 1. Vérifier Firebase
    const firebaseOk = await checkFirebaseState();
    if (!firebaseOk) return;
    
    // 2. Auditer les collections
    const collectionsAudit = await auditCollections();
    
    // 3. Vérifier l'organisation
    const currentOrg = await checkCurrentOrganization();
    const organizationId = currentOrg?.id;
    
    // 4. Tester les requêtes avec organizationId
    await testQueriesWithOrgId(organizationId);
    
    // 5. Vérifier les indexes
    await checkFirestoreIndexes();
    
    // SYNTHÈSE
    console.log('\n🎯 SYNTHÈSE DU DIAGNOSTIC');
    console.log('='.repeat(60));
    
    Object.entries(collectionsAudit).forEach(([name, data]) => {
      console.log(`📂 ${name}: ${data.status} (${data.total || 0} docs)`);
      
      if (data.status === 'EMPTY') {
        console.log(`   ⚠️  Collection ${name} est vide - c'est probablement le problème !`);
      } else if (data.status === 'MISSING_ORG_ID') {
        console.log(`   🔧 ${data.withoutOrgId} documents sans organizationId à corriger`);
      }
    });
    
    if (organizationId) {
      console.log(`🏢 Organisation courante: ${organizationId}`);
    } else {
      console.log(`⚠️  Pas d'organisation courante détectée`);
    }
    
    // RECOMMANDATIONS
    console.log('\n💡 RECOMMANDATIONS');
    console.log('-'.repeat(40));
    
    if (collectionsAudit.contacts?.status === 'EMPTY') {
      console.log('🎯 CONTACTS: Collection vide');
      console.log('   → Vérifiez que les contacts ont bien été migrés depuis "programmateurs"');
      console.log('   → Exécutez le script de migration si nécessaire');
    }
    
    if (collectionsAudit.lieux?.status === 'EMPTY') {
      console.log('🎯 LIEUX: Collection vide');
      console.log('   → Vérifiez que des lieux existent dans la base');
      console.log('   → Créez des lieux de test si nécessaire');
    }
    
    if (collectionsAudit.contacts?.status === 'MISSING_ORG_ID' || 
        collectionsAudit.lieux?.status === 'MISSING_ORG_ID') {
      console.log('🎯 ORGANIZATION_ID: Documents sans organizationId');
      console.log('   → Exécutez le script de correction des organizationId');
      console.log('   → Commande: fixMissingOrganizationId()');
    }
    
  } catch (error) {
    console.error('❌ ERREUR DURANTE LE DIAGNOSTIC:', error);
  }
}

// FONCTIONS UTILITAIRES POUR L'UTILISATEUR
window.diagnosticContactsLieux = runFullDiagnostic;
window.checkCollections = auditCollections;
window.checkOrganization = checkCurrentOrganization;

console.log('\n🚀 SCRIPT CHARGÉ - Fonctions disponibles:');
console.log('   diagnosticContactsLieux() - Lance le diagnostic complet');
console.log('   checkCollections() - Vérifie uniquement les collections');
console.log('   checkOrganization() - Vérifie l\'organisation courante');
console.log('\n💡 Pour commencer: diagnosticContactsLieux()'); 