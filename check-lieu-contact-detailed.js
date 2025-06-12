// Script pour vérifier les relations lieu-contact en détail
// À exécuter dans la console du navigateur

async function checkLieuContactRelations() {
  console.log('=== VÉRIFICATION DÉTAILLÉE LIEU-CONTACT ===\n');
  
  // Import Firebase
  const { collection, getDocs, query, where, doc, getDoc } = window.firebase.firestore;
  const db = window.firebase.firestore();
  
  try {
    // 1. Chercher le lieu "La taverne du pélican"
    console.log('1. Recherche du lieu "La taverne du pélican"...');
    const lieuxQuery = query(collection(db, 'lieux'), where('nom', '==', 'La taverne du pélican'));
    const lieuxSnapshot = await getDocs(lieuxQuery);
    
    if (lieuxSnapshot.empty) {
      console.error('❌ Lieu "La taverne du pélican" non trouvé!');
      return;
    }
    
    const lieuDoc = lieuxSnapshot.docs[0];
    const lieuData = lieuDoc.data();
    const lieuId = lieuDoc.id;
    
    console.log('✅ Lieu trouvé:');
    console.log('- ID:', lieuId);
    console.log('- Nom:', lieuData.nom);
    console.log('- OrganizationId:', lieuData.organizationId);
    console.log('- ContactIds:', lieuData.contactIds);
    console.log('- Structure complète du lieu:', JSON.stringify(lieuData, null, 2));
    
    // 2. Chercher le contact Florent
    console.log('\n2. Recherche du contact Florent...');
    const contactsQuery = query(collection(db, 'contacts'), where('prenom', '==', 'Florent'));
    const contactsSnapshot = await getDocs(contactsQuery);
    
    if (contactsSnapshot.empty) {
      console.error('❌ Contact Florent non trouvé!');
    } else {
      console.log(`✅ ${contactsSnapshot.size} contact(s) Florent trouvé(s):`);
      
      contactsSnapshot.forEach((contactDoc, index) => {
        const contactData = contactDoc.data();
        const contactId = contactDoc.id;
        
        console.log(`\nContact ${index + 1}:`);
        console.log('- ID:', contactId);
        console.log('- Nom complet:', contactData.prenom, contactData.nom);
        console.log('- OrganizationId:', contactData.organizationId);
        console.log('- LieuxIds:', contactData.lieuxIds);
        
        // Vérifier si ce contact est lié au lieu
        if (contactData.lieuxIds && contactData.lieuxIds.includes(lieuId)) {
          console.log('✅ Ce contact a bien le lieu dans lieuxIds');
        } else {
          console.log('❌ Ce contact n\'a PAS le lieu dans lieuxIds');
        }
        
        // Vérifier si le lieu a ce contact
        if (lieuData.contactIds && lieuData.contactIds.includes(contactId)) {
          console.log('✅ Le lieu a bien ce contact dans contactIds');
        } else {
          console.log('❌ Le lieu n\'a PAS ce contact dans contactIds');
        }
      });
    }
    
    // 3. Vérifier tous les contacts liés au lieu
    console.log('\n3. Vérification de tous les contacts liés au lieu...');
    if (lieuData.contactIds && lieuData.contactIds.length > 0) {
      console.log(`Le lieu a ${lieuData.contactIds.length} contact(s) dans contactIds:`);
      
      for (const contactId of lieuData.contactIds) {
        const contactDoc = await getDoc(doc(db, 'contacts', contactId));
        if (contactDoc.exists()) {
          const contactData = contactDoc.data();
          console.log(`- ${contactData.prenom} ${contactData.nom} (ID: ${contactId})`);
        } else {
          console.log(`- ❌ Contact ID ${contactId} n'existe pas!`);
        }
      }
    } else {
      console.log('❌ Le lieu n\'a aucun contact dans contactIds');
    }
    
    // 4. Chercher tous les contacts qui ont ce lieu dans lieuxIds
    console.log('\n4. Recherche des contacts ayant ce lieu dans lieuxIds...');
    const contactsWithLieuQuery = query(
      collection(db, 'contacts'), 
      where('lieuxIds', 'array-contains', lieuId)
    );
    const contactsWithLieuSnapshot = await getDocs(contactsWithLieuQuery);
    
    if (!contactsWithLieuSnapshot.empty) {
      console.log(`✅ ${contactsWithLieuSnapshot.size} contact(s) ont ce lieu dans lieuxIds:`);
      contactsWithLieuSnapshot.forEach(doc => {
        const data = doc.data();
        console.log(`- ${data.prenom} ${data.nom} (ID: ${doc.id})`);
      });
    } else {
      console.log('❌ Aucun contact n\'a ce lieu dans lieuxIds');
    }
    
    // 5. Diagnostic final
    console.log('\n=== DIAGNOSTIC ===');
    if (lieuData.contactIds && lieuData.contactIds.length > 0) {
      console.log('✅ Le lieu a des contacts dans contactIds');
    } else {
      console.log('❌ Le lieu n\'a PAS de contacts dans contactIds');
      console.log('⚠️  Cela explique pourquoi les contacts ne s\'affichent pas en mode édition');
    }
    
  } catch (error) {
    console.error('Erreur lors de la vérification:', error);
  }
}

// Exécuter la vérification
checkLieuContactRelations();