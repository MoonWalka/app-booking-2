#!/usr/bin/env node

/**
 * Script pour corriger les structures sans entrepriseId
 */

const { db, collection, getDocs, query, where, updateDoc, doc } = require('./firebase-node');

async function fixStructuresEntrepriseId() {
  console.log('\n🔧 Correction des structures sans entrepriseId\n');
  
  try {
    // Récupérer toutes les structures
    const structuresRef = collection(db, 'structures');
    const structuresSnapshot = await getDocs(structuresRef);
    
    console.log(`Total structures: ${structuresSnapshot.size}`);
    
    // Filtrer les structures sans entrepriseId
    const structuresWithoutOrgId = [];
    structuresSnapshot.forEach(doc => {
      const data = doc.data();
      if (!data.entrepriseId || data.entrepriseId === null || data.entrepriseId === undefined) {
        structuresWithoutOrgId.push({ id: doc.id, data });
      }
    });
    
    console.log(`Structures sans entrepriseId: ${structuresWithoutOrgId.length}`);
    
    if (structuresWithoutOrgId.length === 0) {
      console.log('✅ Toutes les structures ont un entrepriseId!');
      return;
    }
    
    // L'entrepriseId par défaut (trouvé dans d'autres structures)
    const defaultOrgId = 'tTvA6fzQpi6u3kx8wZO8';
    
    // Corriger chaque structure
    let count = 0;
    
    for (const { id, data } of structuresWithoutOrgId) {
      console.log(`\n📝 Correction de: ${data.nom || data.raisonSociale || id}`);
      
      await updateDoc(doc(db, 'structures', id), {
        entrepriseId: defaultOrgId,
        updatedAt: new Date()
      });
      
      count++;
    }
    
    console.log(`\n✅ ${count} structures corrigées avec entrepriseId: ${defaultOrgId}`);
    
    // Vérifier le résultat
    console.log('\n🔍 Vérification après correction:');
    const afterSnapshot = await getDocs(structuresRef);
    
    let withOrgId = 0;
    let withoutOrgId = 0;
    
    afterSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.entrepriseId) {
        withOrgId++;
      } else {
        withoutOrgId++;
      }
    });
    
    console.log(`✅ Structures avec entrepriseId: ${withOrgId}`);
    console.log(`❌ Structures sans entrepriseId: ${withoutOrgId}`);
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

// Exécuter le script
fixStructuresEntrepriseId()
  .then(() => {
    console.log('\n✨ Script terminé');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Erreur fatale:', error);
    process.exit(1);
  });