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
    console.log('  EntrepriseId:', data.entrepriseId);
    console.log('  Type entrepriseId:', typeof data.entrepriseId);
    console.log('  EntrepriseId === null ?', data.entrepriseId === null);
    console.log('  EntrepriseId === undefined ?', data.entrepriseId === undefined);
    console.log('  Pas entrepriseId ?', !data.entrepriseId);
  });
  
  // Vérifier avec where undefined
  console.log('\n🔍 Recherche avec where entrepriseId undefined:');
  const undefinedQuery = query(structuresRef, where('entrepriseId', '==', undefined));
  const undefinedSnapshot = await getDocs(undefinedQuery);
  console.log('Structures avec entrepriseId === undefined:', undefinedSnapshot.size);
  
  // Recherche des structures dont entrepriseId n'existe pas
  console.log('\n🔍 Recherche des structures sans champ entrepriseId:');
  const allSnapshot = await getDocs(structuresRef);
  let countWithoutField = 0;
  
  allSnapshot.forEach(doc => {
    const data = doc.data();
    if (!('entrepriseId' in data)) {
      countWithoutField++;
      console.log('- Structure sans champ entrepriseId:', doc.id, data.nom);
    }
  });
  
  console.log('\nStructures sans le champ entrepriseId:', countWithoutField);
}

debugStructures().catch(console.error);