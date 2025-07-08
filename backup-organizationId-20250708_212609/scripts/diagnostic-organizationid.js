// Script de diagnostic pour analyser le problème d'organizationId
// À exécuter dans la console du navigateur

console.log('🔍 DIAGNOSTIC COMPLET - Analyse des collections');

// Fonction utilitaire pour récupérer tous les documents d'une collection
async function getAllDocuments(collectionName) {
  try {
    console.log(`\n📁 Analyse de la collection: ${collectionName}`);
    
    // Import Firebase depuis l'app
    const { db } = await import('./src/services/firebase-service.js');
    const { collection, getDocs } = await import('firebase/firestore');
    
    const collectionRef = collection(db, collectionName);
    const snapshot = await getDocs(collectionRef);
    
    const docs = [];
    snapshot.forEach((doc) => {
      docs.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    console.log(`✅ ${docs.length} documents trouvés dans ${collectionName}`);
    
    // Analyser les organizationId
    const orgIds = new Set();
    const withoutOrganizationId = [];
    const organizationCounts = {};
    
    docs.forEach(doc => {
      if (doc.organizationId) {
        orgIds.add(doc.organizationId);
        organizationCounts[doc.organizationId] = (organizationCounts[doc.organizationId] || 0) + 1;
      } else {
        withoutOrganizationId.push(doc);
      }
    });
    
    console.log(`📊 Statistiques ${collectionName}:`, {
      total: docs.length,
      avecOrganizationId: docs.length - withoutOrganizationId.length,
      sansOrganizationId: withoutOrganizationId.length,
      organizationsDifferentes: orgIds.size,
      repartitionParOrganization: organizationCounts
    });
    
    if (withoutOrganizationId.length > 0) {
      console.log(`⚠️ Documents sans organizationId dans ${collectionName}:`, 
        withoutOrganizationId.slice(0, 3).map(d => ({
          id: d.id,
          nom: d.nom || d.titre || d.raisonSociale,
          createdAt: d.createdAt
        }))
      );
    }
    
    return {
      collectionName,
      total: docs.length,
      withOrganizationId: docs.length - withoutOrganizationId.length,
      withoutOrganizationId: withoutOrganizationId.length,
      organizations: Object.keys(organizationCounts),
      organizationCounts,
      sampleDocs: docs.slice(0, 2)
    };
    
  } catch (error) {
    console.error(`❌ Erreur lors de l'analyse de ${collectionName}:`, error);
    return null;
  }
}

// Fonction pour analyser avec filtre organizationId
async function getDocumentsWithOrganizationId(collectionName, organizationId) {
  try {
    console.log(`\n🎯 Test requête filtrée: ${collectionName} avec organizationId = ${organizationId}`);
    
    const { db } = await import('./src/services/firebase-service.js');
    const { collection, getDocs, query, where } = await import('firebase/firestore');
    
    const collectionRef = collection(db, collectionName);
    const q = query(collectionRef, where('organizationId', '==', organizationId));
    const snapshot = await getDocs(q);
    
    const docs = [];
    snapshot.forEach((doc) => {
      docs.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    console.log(`✅ ${docs.length} documents trouvés avec organizationId = ${organizationId}`);
    
    if (docs.length > 0) {
      console.log(`📄 Premier document:`, {
        id: docs[0].id,
        nom: docs[0].nom || docs[0].titre || docs[0].raisonSociale,
        organizationId: docs[0].organizationId,
        structureId: docs[0].structureId,
        allFields: Object.keys(docs[0])
      });
    }
    
    return docs;
    
  } catch (error) {
    console.error(`❌ Erreur lors du test filtré de ${collectionName}:`, error);
    return [];
  }
}

// Fonction principale de diagnostic
async function diagnosticComplet() {
  try {
    console.log('🚀 Début du diagnostic complet');
    
    // Récupérer l'organizationId actuel
    const currentOrgId = localStorage.getItem('currentOrganizationId');
    console.log(`🏢 OrganizationId actuel: ${currentOrgId}`);
    
    if (!currentOrgId) {
      console.error('❌ Pas d\'organizationId dans localStorage !');
      return;
    }
    
    // Collections à analyser
    const collections = ['concerts', 'contacts', 'lieux', 'structures'];
    
    console.log('\n📋 PHASE 1: Analyse complète des collections');
    const results = {};
    
    for (const collectionName of collections) {
      results[collectionName] = await getAllDocuments(collectionName);
      await new Promise(resolve => setTimeout(resolve, 500)); // Pause pour éviter la surcharge
    }
    
    console.log('\n📋 PHASE 2: Test des requêtes filtrées');
    const filteredResults = {};
    
    for (const collectionName of collections) {
      filteredResults[collectionName] = await getDocumentsWithOrganizationId(collectionName, currentOrgId);
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log('\n📊 RÉSUMÉ FINAL:');
    console.table(
      collections.map(col => ({
        Collection: col,
        'Total': results[col]?.total || 0,
        'Avec OrgId': results[col]?.withOrganizationId || 0,
        'Sans OrgId': results[col]?.withoutOrganizationId || 0,
        'Filtrés': filteredResults[col]?.length || 0,
        'Status': filteredResults[col]?.length > 0 ? '✅ OK' : '❌ VIDE'
      }))
    );
    
    console.log('\n🎯 ANALYSE COMPARATIVE:');
    const working = ['concerts', 'structures'];
    const broken = ['contacts', 'lieux'];
    
    console.log('✅ Collections qui fonctionnent:', working.map(col => `${col}: ${filteredResults[col]?.length || 0}`));
    console.log('❌ Collections qui ne fonctionnent pas:', broken.map(col => `${col}: ${filteredResults[col]?.length || 0}`));
    
    // Vérifier s'il y a une différence structurelle
    console.log('\n🔬 COMPARAISON STRUCTURELLE:');
    if (results.concerts?.sampleDocs?.[0] && results.contacts?.sampleDocs?.[0]) {
      const concertFields = Object.keys(results.concerts.sampleDocs[0]);
      const contactFields = Object.keys(results.contacts.sampleDocs[0]);
      
      console.log('Champs concert:', concertFields);
      console.log('Champs contact:', contactFields);
      
      const commonFields = concertFields.filter(f => contactFields.includes(f));
      const concertOnly = concertFields.filter(f => !contactFields.includes(f));
      const contactOnly = contactFields.filter(f => !concertFields.includes(f));
      
      console.log('Champs communs:', commonFields);
      console.log('Champs uniques concerts:', concertOnly);
      console.log('Champs uniques contacts:', contactOnly);
    }
    
    return { results, filteredResults };
    
  } catch (error) {
    console.error('❌ Erreur pendant le diagnostic:', error);
  }
}

// Exécuter le diagnostic
diagnosticComplet().then((data) => {
  console.log('\n🎉 Diagnostic terminé !');
  window.diagnosticData = data; // Sauvegarder pour inspection manuelle
}); 