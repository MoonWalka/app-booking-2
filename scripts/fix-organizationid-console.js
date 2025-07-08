// Script à exécuter dans la console du navigateur pour corriger les documents sans entrepriseId

// 1. D'abord, vérifier quels documents n'ont pas d'entrepriseId
async function checkMissingEntrepriseId() {
  const { collection, getDocs, query } = window.firebase.firestore;
  const db = window.firebase.db;
  
  const collections = ['contacts', 'lieux', 'artistes', 'structures', 'concerts'];
  const results = {};
  
  for (const collName of collections) {
    try {
      const snapshot = await getDocs(collection(db, collName));
      const missing = [];
      
      snapshot.forEach(doc => {
        const data = doc.data();
        if (!data.entrepriseId) {
          missing.push({ id: doc.id, nom: data.nom || data.titre || 'Sans nom' });
        }
      });
      
      results[collName] = missing;
      console.log(`${collName}: ${missing.length} documents sans entrepriseId`);
    } catch (error) {
      console.error(`Erreur pour ${collName}:`, error);
    }
  }
  
  return results;
}

// 2. Corriger en ajoutant votre entrepriseId actuel
async function fixMissingEntrepriseId() {
  const { collection, doc, updateDoc, getDocs } = window.firebase.firestore;
  const db = window.firebase.db;
  
  // Récupérer l'entrepriseId actuel
  const orgContext = JSON.parse(localStorage.getItem("organizationContext"));
  const entrepriseId = orgContext?.currentOrganization?.id;
  
  if (!entrepriseId) {
    console.error("❌ Aucune organisation trouvée. Connectez-vous d'abord.");
    return;
  }
  
  console.log(`✅ Organisation trouvée: ${entrepriseId}`);
  
  const collections = ['contacts', 'lieux', 'artistes', 'structures'];
  
  for (const collName of collections) {
    try {
      const snapshot = await getDocs(collection(db, collName));
      let count = 0;
      
      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
        if (!data.entrepriseId) {
          await updateDoc(doc(db, collName, docSnap.id), { 
            entrepriseId: entrepriseId 
          });
          count++;
          console.log(`✅ ${collName}/${docSnap.id} mis à jour`);
        }
      }
      
      console.log(`${collName}: ${count} documents corrigés`);
    } catch (error) {
      console.error(`Erreur pour ${collName}:`, error);
    }
  }
  
  console.log("🎉 Correction terminée ! Rafraîchissez la page.");
}

// Instructions
console.log(`
📋 INSTRUCTIONS :

1. Pour vérifier les documents sans entrepriseId :
   checkMissingEntrepriseId()

2. Pour corriger automatiquement :
   fixMissingEntrepriseId()

3. Après correction, rafraîchissez la page (F5)
`);