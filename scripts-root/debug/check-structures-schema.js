// Script pour examiner le schéma des structures dans Firebase

const admin = require('firebase-admin');
const serviceAccount = require('../../firebase-key.json');

// Initialiser Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function analyzeStructures() {
  console.log('=== Analyse des structures dans Firebase ===\n');
  
  try {
    const structuresRef = db.collection('structures');
    const snapshot = await structuresRef.limit(5).get();
    
    console.log(`Nombre d'exemples analysés: ${snapshot.size}\n`);
    
    let index = 1;
    snapshot.forEach(doc => {
      const data = doc.data();
      console.log(`\n--- Structure ${index} (ID: ${doc.id}) ---`);
      console.log('Champs présents:');
      
      // Vérifier les champs de nom
      console.log(`  - nom: ${data.nom ? `"${data.nom}"` : 'ABSENT'}`);
      console.log(`  - raisonSociale: ${data.raisonSociale ? `"${data.raisonSociale}"` : 'ABSENT'}`);
      console.log(`  - structureRaisonSociale: ${data.structureRaisonSociale ? `"${data.structureRaisonSociale}"` : 'ABSENT'}`);
      
      // Autres champs importants
      console.log(`  - type: ${data.type || 'ABSENT'}`);
      console.log(`  - entrepriseId: ${data.entrepriseId || 'ABSENT'}`);
      console.log(`  - email: ${data.email || 'ABSENT'}`);
      console.log(`  - ville: ${data.ville || 'ABSENT'}`);
      
      index++;
    });
    
    // Analyser les patterns
    console.log('\n\n=== Analyse des patterns de nommage ===');
    const allStructures = await structuresRef.limit(50).get();
    
    let hasNom = 0;
    let hasRaisonSociale = 0;
    let hasStructureRaisonSociale = 0;
    let hasBoth = 0;
    let hasNone = 0;
    
    allStructures.forEach(doc => {
      const data = doc.data();
      const nom = !!data.nom;
      const raison = !!data.raisonSociale;
      const structureRaison = !!data.structureRaisonSociale;
      
      if (nom) hasNom++;
      if (raison) hasRaisonSociale++;
      if (structureRaison) hasStructureRaisonSociale++;
      if (nom && raison) hasBoth++;
      if (!nom && !raison && !structureRaison) hasNone++;
    });
    
    console.log(`Sur ${allStructures.size} structures analysées:`);
    console.log(`  - Ont un champ "nom": ${hasNom} (${Math.round(hasNom/allStructures.size*100)}%)`);
    console.log(`  - Ont un champ "raisonSociale": ${hasRaisonSociale} (${Math.round(hasRaisonSociale/allStructures.size*100)}%)`);
    console.log(`  - Ont un champ "structureRaisonSociale": ${hasStructureRaisonSociale} (${Math.round(hasStructureRaisonSociale/allStructures.size*100)}%)`);
    console.log(`  - Ont les deux (nom ET raisonSociale): ${hasBoth}`);
    console.log(`  - N'ont aucun nom: ${hasNone}`);
    
  } catch (error) {
    console.error('Erreur lors de l\'analyse:', error);
  }
  
  process.exit(0);
}

analyzeStructures();