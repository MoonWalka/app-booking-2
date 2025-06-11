// Script pour vérifier les relations lieu-contact dans le navigateur
// Copier-coller ce code dans la console du navigateur

(async function checkLieuContacts() {
  console.log('🔍 Vérification des relations lieu-contact...\n');
  
  try {
    // Importer Firebase depuis le contexte global
    const { collection, getDocs, query, where, limit, doc, getDoc, db } = window.FirebaseService || {};
    
    if (!db) {
      console.error('❌ Firebase non disponible. Assurez-vous d\'être sur l\'application.');
      return;
    }
    
    // 1. Chercher des lieux
    const lieuxQuery = query(collection(db, 'lieux'), limit(5));
    const lieuxSnapshot = await getDocs(lieuxQuery);
    
    console.log(`📍 ${lieuxSnapshot.size} lieux trouvés\n`);
    
    for (const lieuDoc of lieuxSnapshot.docs) {
      const lieu = lieuDoc.data();
      console.log(`\n🏢 Lieu: ${lieu.nom} (ID: ${lieuDoc.id})`);
      console.log('  Données complètes:', lieu);
      
      // Vérifier spécifiquement contactIds
      if (lieu.contactIds) {
        console.log(`  ✅ contactIds trouvé: ${JSON.stringify(lieu.contactIds)}`);
        
        // Charger les détails des contacts
        for (const contactId of lieu.contactIds) {
          const contactDoc = await getDoc(doc(db, 'contacts', contactId));
          if (contactDoc.exists()) {
            const contact = contactDoc.data();
            console.log(`    👤 Contact: ${contact.nom}`);
          }
        }
      } else {
        console.log('  ❌ Pas de contactIds');
      }
      
      // Vérifier les contacts via relation inverse
      const contactsQuery = query(
        collection(db, 'contacts'),
        where('lieuxIds', 'array-contains', lieuDoc.id)
      );
      const contactsSnapshot = await getDocs(contactsQuery);
      
      if (!contactsSnapshot.empty) {
        console.log(`  📋 ${contactsSnapshot.size} contacts liés via lieuxIds:`);
        contactsSnapshot.forEach(contactDoc => {
          const contact = contactDoc.data();
          console.log(`    • ${contact.nom} (ID: ${contactDoc.id})`);
        });
      }
    }
    
    // 2. Vérifier l'inverse - contacts avec lieuxIds
    console.log('\n\n📊 Contacts avec des lieux associés:');
    const contactsQuery = query(
      collection(db, 'contacts'),
      where('lieuxIds', '!=', null),
      limit(5)
    );
    const contactsSnapshot = await getDocs(contactsQuery);
    
    console.log(`👥 ${contactsSnapshot.size} contacts trouvés\n`);
    
    for (const contactDoc of contactsSnapshot.docs) {
      const contact = contactDoc.data();
      console.log(`👤 Contact: ${contact.nom}`);
      console.log(`  - lieuxIds: ${JSON.stringify(contact.lieuxIds)}`);
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
})();