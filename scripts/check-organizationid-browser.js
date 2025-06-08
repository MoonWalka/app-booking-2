/**
 * Script pour vérifier les documents sans organizationId directement dans le navigateur
 * À exécuter dans la console du navigateur après connexion à l'application
 */

async function checkOrganizationIds() {
  // Vérifier que Firebase est disponible
  if (!window.firebase || !window.firebase.firestore) {
    console.error('❌ Firebase non disponible. Assurez-vous d\'être connecté à l\'application.');
    return;
  }
  
  const db = window.firebase.firestore();
  console.log('🔍 Vérification des documents sans organizationId...\n');
  
  const collections = ['contacts', 'lieux', 'concerts', 'structures', 'artistes', 'contrats'];
  const results = {};
  
  for (const collectionName of collections) {
    console.log(`\n📁 Collection: ${collectionName}`);
    
    try {
      // Récupérer tous les documents
      const snapshot = await db.collection(collectionName).get();
      const totalDocs = snapshot.size;
      
      // Compter ceux sans organizationId
      let withOrgId = 0;
      let withoutOrgId = 0;
      const samplesWithout = [];
      const samplesWithOrgId = [];
      
      snapshot.forEach(doc => {
        const data = doc.data();
        if (data.organizationId) {
          withOrgId++;
          // Garder quelques échantillons avec organizationId
          if (samplesWithOrgId.length < 3) {
            samplesWithOrgId.push({
              id: doc.id,
              nom: data.nom || data.titre || data.raisonSociale || 'Sans nom',
              organizationId: data.organizationId
            });
          }
        } else {
          withoutOrgId++;
          // Garder quelques échantillons sans organizationId
          if (samplesWithout.length < 5) {
            samplesWithout.push({
              id: doc.id,
              nom: data.nom || data.titre || data.raisonSociale || 'Sans nom',
              createdAt: data.createdAt?.toDate?.() || 'Date inconnue'
            });
          }
        }
      });
      
      results[collectionName] = {
        total: totalDocs,
        withOrgId,
        withoutOrgId,
        percentage: totalDocs > 0 ? ((withOrgId / totalDocs) * 100).toFixed(1) : 0,
        samplesWithout,
        samplesWithOrgId
      };
      
      console.log(`  ✅ Avec organizationId: ${withOrgId} (${results[collectionName].percentage}%)`);
      console.log(`  ❌ Sans organizationId: ${withoutOrgId}`);
      
      if (samplesWithOrgId.length > 0) {
        console.log(`  📋 Exemples AVEC organizationId:`);
        samplesWithOrgId.forEach(sample => {
          console.log(`     - ${sample.id}: ${sample.nom} (org: ${sample.organizationId})`);
        });
      }
      
      if (samplesWithout.length > 0) {
        console.log(`  📋 Exemples SANS organizationId:`);
        samplesWithout.forEach(sample => {
          console.log(`     - ${sample.id}: ${sample.nom} (créé: ${sample.createdAt})`);
        });
      }
      
    } catch (error) {
      console.error(`  ❌ Erreur: ${error.message}`);
      results[collectionName] = { error: error.message };
    }
  }
  
  // Résumé
  console.log('\n\n📊 RÉSUMÉ:');
  console.log('='.repeat(60));
  
  for (const [collection, stats] of Object.entries(results)) {
    if (stats.error) {
      console.log(`${collection}: ERREUR - ${stats.error}`);
    } else {
      const status = stats.withoutOrgId === 0 ? '✅' : '⚠️';
      console.log(`${status} ${collection}: ${stats.withoutOrgId}/${stats.total} sans organizationId (${(100 - parseFloat(stats.percentage)).toFixed(1)}%)`);
    }
  }
  
  // Recommandations
  const problemCollections = Object.entries(results)
    .filter(([_, stats]) => !stats.error && stats.withoutOrgId > 0)
    .map(([name, _]) => name);
  
  if (problemCollections.length > 0) {
    console.log('\n\n⚠️  ACTIONS RECOMMANDÉES:');
    console.log('='.repeat(60));
    console.log(`Les collections suivantes ont des documents sans organizationId:`);
    console.log(`- ${problemCollections.join('\n- ')}`);
    console.log('\nCes documents ne seront PAS visibles dans l\'interface!');
    console.log('Il faut leur ajouter un organizationId pour qu\'ils apparaissent.');
  } else {
    console.log('\n\n✅ Toutes les collections ont des organizationId!');
  }
  
  return results;
}

// Fonction pour corriger les documents sans organizationId
async function fixMissingOrganizationIds(collectionName, organizationId) {
  if (!window.firebase || !window.firebase.firestore) {
    console.error('❌ Firebase non disponible.');
    return;
  }
  
  if (!organizationId) {
    console.error('❌ organizationId requis');
    return;
  }
  
  const db = window.firebase.firestore();
  console.log(`🔧 Correction des documents sans organizationId dans ${collectionName}...`);
  
  try {
    const snapshot = await db.collection(collectionName).get();
    let fixed = 0;
    
    for (const doc of snapshot.docs) {
      const data = doc.data();
      if (!data.organizationId) {
        await doc.ref.update({ organizationId });
        fixed++;
        console.log(`  ✅ Corrigé: ${doc.id} - ${data.nom || data.titre || 'Sans nom'}`);
      }
    }
    
    console.log(`\n✅ ${fixed} documents corrigés dans ${collectionName}`);
  } catch (error) {
    console.error(`❌ Erreur: ${error.message}`);
  }
}

// Instructions
console.log('📚 INSTRUCTIONS:');
console.log('1. Pour vérifier les documents sans organizationId:');
console.log('   checkOrganizationIds()');
console.log('\n2. Pour corriger une collection (remplacez ORG_ID par votre organizationId):');
console.log('   fixMissingOrganizationIds("contacts", "ORG_ID")');
console.log('   fixMissingOrganizationIds("lieux", "ORG_ID")');
console.log('\n3. Pour obtenir votre organizationId actuel:');
console.log('   JSON.parse(localStorage.getItem("organizationContext"))?.currentOrganization?.id');

// Exporter les fonctions pour utilisation
window.checkOrganizationIds = checkOrganizationIds;
window.fixMissingOrganizationIds = fixMissingOrganizationIds;