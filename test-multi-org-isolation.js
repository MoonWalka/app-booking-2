// Script de test pour vérifier l'isolation des données entre organisations
// À exécuter dans la console du navigateur après connexion

const testMultiOrgIsolation = async () => {
  console.log('🧪 Test d\'isolation multi-organisation');
  console.log('=====================================');
  
  // 1. Vérifier l'organisation courante
  const orgContext = window.__REACT_DEVTOOLS_GLOBAL_HOOK__?.renderers?.get(1)?.getFiberRoots()?.values()?.next()?.value?.current?.memoizedState?.element?.props?.children?.props?.value;
  
  if (!orgContext || !orgContext.currentOrganization) {
    console.error('❌ Impossible de récupérer le contexte d\'organisation');
    console.log('Assurez-vous d\'être connecté et d\'avoir sélectionné une organisation');
    return;
  }
  
  const currentOrg = orgContext.currentOrganization;
  console.log('✅ Organisation courante:', {
    id: currentOrg.id,
    name: currentOrg.name
  });
  
  // 2. Tester les requêtes directes Firebase
  console.log('\n📊 Test des requêtes directes...');
  
  const { collection, query, where, getDocs, db } = await import('./src/services/firebase-service');
  
  // Test sur les concerts
  console.log('\n🎵 Test sur les concerts:');
  const concertsRef = collection(db, 'concerts');
  
  // Requête sans filtre (MAUVAIS)
  const allConcertsQuery = query(concertsRef);
  const allConcerts = await getDocs(allConcertsQuery);
  console.log(`- Concerts SANS filtre: ${allConcerts.size} trouvés`);
  
  // Requête avec filtre organizationId (BON)
  const orgConcertsQuery = query(concertsRef, where('organizationId', '==', currentOrg.id));
  const orgConcerts = await getDocs(orgConcertsQuery);
  console.log(`- Concerts AVEC filtre: ${orgConcerts.size} trouvés`);
  
  if (allConcerts.size > orgConcerts.size) {
    console.warn('⚠️ ATTENTION: Des concerts d\'autres organisations sont accessibles!');
  } else if (allConcerts.size === orgConcerts.size) {
    console.log('✅ Tous les concerts visibles appartiennent à l\'organisation');
  }
  
  // Test sur les contacts
  console.log('\n👥 Test sur les contacts:');
  const contactsRef = collection(db, 'contacts');
  
  const allContactsQuery = query(contactsRef);
  const allContacts = await getDocs(allContactsQuery);
  console.log(`- Contacts SANS filtre: ${allContacts.size} trouvés`);
  
  const orgContactsQuery = query(contactsRef, where('organizationId', '==', currentOrg.id));
  const orgContacts = await getDocs(orgContactsQuery);
  console.log(`- Contacts AVEC filtre: ${orgContacts.size} trouvés`);
  
  if (allContacts.size > orgContacts.size) {
    console.warn('⚠️ ATTENTION: Des contacts d\'autres organisations sont accessibles!');
  }
  
  // 3. Analyser les données
  console.log('\n📈 Analyse des données...');
  
  const organizations = new Set();
  let missingOrgId = 0;
  
  allConcerts.forEach(doc => {
    const data = doc.data();
    if (data.organizationId) {
      organizations.add(data.organizationId);
    } else {
      missingOrgId++;
    }
  });
  
  console.log(`\n📊 Résumé:
- Organisations différentes trouvées: ${organizations.size}
- Documents sans organizationId: ${missingOrgId}
- Organisation courante présente: ${organizations.has(currentOrg.id) ? 'OUI' : 'NON'}`);
  
  if (organizations.size > 1) {
    console.error('❌ PROBLÈME: Plusieurs organisations sont visibles!');
    console.log('Organisations trouvées:', Array.from(organizations));
  } else if (organizations.size === 1 && organizations.has(currentOrg.id)) {
    console.log('✅ PARFAIT: Seule l\'organisation courante est visible');
  }
  
  // 4. Test des hooks
  console.log('\n🪝 Test des hooks (nécessite React DevTools)...');
  console.log('Pour tester les hooks, naviguez vers différentes pages et vérifiez dans le Network tab que les requêtes Firebase incluent le filtre organizationId');
  
  console.log('\n✅ Test terminé!');
  
  return {
    currentOrganization: currentOrg,
    totalDocuments: allConcerts.size + allContacts.size,
    organizationDocuments: orgConcerts.size + orgContacts.size,
    organizationsFound: Array.from(organizations),
    documentsWithoutOrgId: missingOrgId
  };
};

// Exécuter le test
testMultiOrgIsolation().then(results => {
  console.log('\n📋 Résultats finaux:', results);
}).catch(err => {
  console.error('❌ Erreur lors du test:', err);
});