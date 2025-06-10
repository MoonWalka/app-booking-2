const { db, collection, getDocs, query, where } = require('./firebase-node');

async function debugStructures() {
  console.log('\n🔍 Debug des structures\n');
  
  const structuresRef = collection(db, 'structures');
  const structuresSnapshot = await getDocs(structuresRef);
  
  console.log('Total structures:', structuresSnapshot.size);
  
  structuresSnapshot.forEach(doc => {
    const data = doc.data();
    console.log('\n- ID:', doc.id);
    console.log('  Nom:', data.nom);
    console.log('  OrganizationId:', data.organizationId);
    console.log('  Type organizationId:', typeof data.organizationId);
    console.log('  OrganizationId === null ?', data.organizationId === null);
    console.log('  OrganizationId === undefined ?', data.organizationId === undefined);
    console.log('  Pas organizationId ?', !data.organizationId);
  });
  
  // Vérifier avec where undefined
  console.log('\n🔍 Recherche avec where organizationId undefined:');
  const undefinedQuery = query(structuresRef, where('organizationId', '==', undefined));
  const undefinedSnapshot = await getDocs(undefinedQuery);
  console.log('Structures avec organizationId === undefined:', undefinedSnapshot.size);
  
  // Recherche des structures dont organizationId n'existe pas
  console.log('\n🔍 Recherche des structures sans champ organizationId:');
  const allSnapshot = await getDocs(structuresRef);
  let countWithoutField = 0;
  
  allSnapshot.forEach(doc => {
    const data = doc.data();
    if (!('organizationId' in data)) {
      countWithoutField++;
      console.log('- Structure sans champ organizationId:', doc.id, data.nom);
    }
  });
  
  console.log('\nStructures sans le champ organizationId:', countWithoutField);
}

debugStructures().catch(console.error);