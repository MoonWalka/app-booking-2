console.log('🔧 SCRIPT DE CORRECTION UNIVERSEL DES ORGANIZATION IDS');

// Récupération de l'organizationId actuel
const currentOrgId = localStorage.getItem('currentOrganizationId');
console.log('Organization ID actuel:', currentOrgId);

if (!currentOrgId) {
  console.error('❌ Aucun organizationId trouvé dans localStorage !');
} else {
  
  // Fonction générique pour corriger une collection
  window.fixCollectionOrganizationId = async function(collectionName) {
    const { db } = await import('./src/services/firebase-service.js');
    const { collection, getDocs, doc, updateDoc } = await import('firebase/firestore');
    
    console.log(`🔧 Correction de la collection: ${collectionName}`);
    const collectionRef = collection(db, collectionName);
    const snapshot = await getDocs(collectionRef);
    
    let total = 0;
    let withoutOrg = 0;
    let fixed = 0;
    let errors = 0;
    
    for (const docSnapshot of snapshot.docs) {
      total++;
      const data = docSnapshot.data();
      
      if (!data.organizationId) {
        withoutOrg++;
        console.log(`📝 ${collectionName} sans organizationId: ${docSnapshot.id} - ${data.nom || data.titre || data.name || 'sans nom'}`);
        
        try {
          await updateDoc(doc(db, collectionName, docSnapshot.id), {
            organizationId: currentOrgId
          });
          fixed++;
          console.log(`✅ ${collectionName} corrigé: ${data.nom || data.titre || data.name || docSnapshot.id}`);
        } catch (error) {
          errors++;
          console.error(`❌ Erreur correction ${collectionName} ${docSnapshot.id}:`, error);
        }
      }
    }
    
    console.log(`📊 RÉSUMÉ ${collectionName.toUpperCase()}:`);
    console.log(`   Total: ${total}`);
    console.log(`   Sans organizationId: ${withoutOrg}`);
    console.log(`   Corrigés: ${fixed}`);
    console.log(`   Erreurs: ${errors}`);
    
    return { total, withoutOrg, fixed, errors };
  };
  
  // Fonction pour corriger TOUTES les collections importantes
  window.fixAllOrganizationIds = async function() {
    console.log('🚀 DÉBUT DE LA CORRECTION MASSIVE');
    
    const collections = [
      'contacts',
      'lieux', 
      'concerts',
      'artistes',
      'structures',
      'contrats',
      'factures'
    ];
    
    const results = {};
    
    for (const collectionName of collections) {
      try {
        console.log(`\n🔧 ===== TRAITEMENT ${collectionName.toUpperCase()} =====`);
        results[collectionName] = await fixCollectionOrganizationId(collectionName);
      } catch (error) {
        console.error(`❌ Erreur lors du traitement de ${collectionName}:`, error);
        results[collectionName] = { error: error.message };
      }
    }
    
    console.log('\n🎯 ===== RÉSUMÉ GLOBAL =====');
    let totalFixed = 0;
    for (const [collection, result] of Object.entries(results)) {
      if (result.fixed !== undefined) {
        console.log(`${collection}: ${result.fixed} documents corrigés`);
        totalFixed += result.fixed;
      } else {
        console.log(`${collection}: ERREUR - ${result.error}`);
      }
    }
    
    console.log(`\n✅ TOTAL: ${totalFixed} documents corrigés dans toutes les collections`);
    console.log('🔄 Rafraîchissez maintenant votre page (F5) pour voir les changements !');
    
    return results;
  };
  
  // Fonction pour vérifier l'état actuel (sans corriger)
  window.checkAllOrganizationIds = async function() {
    console.log('🔍 VÉRIFICATION DE TOUTES LES COLLECTIONS');
    
    const collections = ['contacts', 'lieux', 'concerts', 'artistes', 'structures'];
    
    for (const collectionName of collections) {
      try {
        const { db } = await import('./src/services/firebase-service.js');
        const { collection, getDocs } = await import('firebase/firestore');
        
        const collectionRef = collection(db, collectionName);
        const snapshot = await getDocs(collectionRef);
        
        let total = 0;
        let withoutOrg = 0;
        
        snapshot.docs.forEach(docSnapshot => {
          total++;
          const data = docSnapshot.data();
          if (!data.organizationId) {
            withoutOrg++;
          }
        });
        
        console.log(`📋 ${collectionName}: ${total} total, ${withoutOrg} sans organizationId`);
      } catch (error) {
        console.error(`❌ Erreur vérification ${collectionName}:`, error);
      }
    }
  };
  
  console.log('🎯 FONCTIONS DISPONIBLES :');
  console.log('   checkAllOrganizationIds()     // Vérifier l\'état actuel');
  console.log('   fixAllOrganizationIds()       // Corriger TOUT automatiquement');
  console.log('   fixCollectionOrganizationId("contacts")  // Corriger une collection spécifique');
} 