const admin = require('firebase-admin');
const serviceAccount = require('./meltin-recordz-firebase-adminsdk-yvl29-b6dd5d77fb.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function checkStructures() {
  console.log('=== Checking structures in contacts_unified ===');
  
  // Get documents with structureRaisonSociale
  const snapshot = await db.collection('contacts_unified')
    .where('structureRaisonSociale', '!=', '')
    .limit(5)
    .get();
  
  console.log(`Found ${snapshot.size} documents with structureRaisonSociale`);
  
  snapshot.forEach(doc => {
    const data = doc.data();
    console.log('\n--- Document ---');
    console.log('ID:', doc.id);
    console.log('Structure Name:', data.structureRaisonSociale);
    console.log('Entity Type:', data.entityType);
    console.log('Has structure nested?', !!data.structure);
    
    // Show structure-related fields
    const structureFields = Object.keys(data).filter(k => k.startsWith('structure'));
    console.log('Structure fields count:', structureFields.length);
    console.log('First 10 structure fields:', structureFields.slice(0, 10));
  });
  
  // Also check specific known structures
  console.log('\n=== Checking specific known structures ===');
  const meltinQuery = await db.collection('contacts_unified')
    .where('structureRaisonSociale', '==', "MELTIN ' RECORDZ")
    .get();
  
  if (!meltinQuery.empty) {
    const doc = meltinQuery.docs[0];
    const data = doc.data();
    console.log('\nMELTIN RECORDZ found:');
    console.log('Full data keys:', Object.keys(data));
    console.log('Sample data:', JSON.stringify(data, null, 2).substring(0, 1000) + '...');
  }
}

checkStructures()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Error:', error);
    process.exit(1);
  });