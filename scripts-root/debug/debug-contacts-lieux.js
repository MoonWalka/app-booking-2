console.log('🔍 DIAGNOSTIC DES DONNÉES ACTUELLES');

// Récupération de l'entrepriseId actuel
const currentOrgId = localStorage.getItem('currentEntrepriseId');
console.log('Organization ID actuel:', currentOrgId);

if (!currentOrgId) {
  console.error('❌ Aucun entrepriseId trouvé dans localStorage !');
} else {
  // Fonction pour vérifier et corriger les contacts
  window.checkAndFixContacts = async function() {
    const { db } = await import('./src/services/firebase-service.js');
    const { collection, getDocs, doc, updateDoc } = await import('firebase/firestore');
    
    console.log('📋 Vérification des contacts...');
    const contactsRef = collection(db, 'contacts');
    const snapshot = await getDocs(contactsRef);
    
    let totalContacts = 0;
    let contactsWithoutOrg = 0;
    let fixed = 0;
    
    for (const contactDoc of snapshot.docs) {
      totalContacts++;
      const data = contactDoc.data();
      
      if (!data.entrepriseId) {
        contactsWithoutOrg++;
        console.log(`Contact sans entrepriseId: ${contactDoc.id} - ${data.nom}`);
        
        // Correction automatique
        try {
          await updateDoc(doc(db, 'contacts', contactDoc.id), {
            entrepriseId: currentOrgId
          });
          fixed++;
          console.log(`✅ Contact corrigé: ${data.nom}`);
        } catch (error) {
          console.error(`❌ Erreur correction contact ${contactDoc.id}:`, error);
        }
      }
    }
    
    console.log(`📊 RÉSUMÉ CONTACTS:`);
    console.log(`   Total: ${totalContacts}`);
    console.log(`   Sans entrepriseId: ${contactsWithoutOrg}`);
    console.log(`   Corrigés: ${fixed}`);
    
    return { totalContacts, contactsWithoutOrg, fixed };
  };
  
  // Fonction pour vérifier et corriger les lieux
  window.checkAndFixLieux = async function() {
    const { db } = await import('./src/services/firebase-service.js');
    const { collection, getDocs, doc, updateDoc } = await import('firebase/firestore');
    
    console.log('🏢 Vérification des lieux...');
    const lieuxRef = collection(db, 'lieux');
    const snapshot = await getDocs(lieuxRef);
    
    let totalLieux = 0;
    let lieuxWithoutOrg = 0;
    let fixed = 0;
    
    for (const lieuDoc of snapshot.docs) {
      totalLieux++;
      const data = lieuDoc.data();
      
      if (!data.entrepriseId) {
        lieuxWithoutOrg++;
        console.log(`Lieu sans entrepriseId: ${lieuDoc.id} - ${data.nom}`);
        
        // Correction automatique
        try {
          await updateDoc(doc(db, 'lieux', lieuDoc.id), {
            entrepriseId: currentOrgId
          });
          fixed++;
          console.log(`✅ Lieu corrigé: ${data.nom}`);
        } catch (error) {
          console.error(`❌ Erreur correction lieu ${lieuDoc.id}:`, error);
        }
      }
    }
    
    console.log(`📊 RÉSUMÉ LIEUX:`);
    console.log(`   Total: ${totalLieux}`);
    console.log(`   Sans entrepriseId: ${lieuxWithoutOrg}`);
    console.log(`   Corrigés: ${fixed}`);
    
    return { totalLieux, lieuxWithoutOrg, fixed };
  };
  
  console.log('🎯 Fonctions prêtes ! Tapez:');
  console.log('   checkAndFixContacts()   // Pour corriger les contacts');
  console.log('   checkAndFixLieux()      // Pour corriger les lieux');
} 