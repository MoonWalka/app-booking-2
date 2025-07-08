// Script à exécuter dans la console du navigateur pour corriger les contacts imbriqués

async function fixNestedContacts() {
  const { collection, getDocs, doc, updateDoc, deleteField } = window.firebase.firestore;
  const db = window.firebase.db;
  
  console.log('🔍 Recherche des contacts avec structure imbriquée...');
  
  try {
    const snapshot = await getDocs(collection(db, 'contacts'));
    
    let totalContacts = 0;
    let nestedContacts = 0;
    let fixedContacts = 0;
    
    for (const docSnap of snapshot.docs) {
      totalContacts++;
      const data = docSnap.data();
      
      // Vérifier si le contact a une structure imbriquée
      if (data.contact && typeof data.contact === 'object') {
        nestedContacts++;
        console.log(`📋 Contact imbriqué trouvé: ${docSnap.id}`);
        console.log('Structure actuelle:', data);
        
        try {
          // Créer la nouvelle structure aplatie
          const flattenedData = {
            // Extraire les champs du contact au niveau racine
            nom: data.contact.nom || '',
            prenom: data.contact.prenom || '',
            fonction: data.contact.fonction || '',
            email: data.contact.email || '',
            telephone: data.contact.telephone || '',
            
            // Conserver les informations de structure
            structureId: data.structureId || '',
            structureNom: data.structureNom || data.structure?.raisonSociale || '',
            
            // Conserver les autres champs existants
            organizationId: data.organizationId,
            concertsAssocies: data.concertsAssocies || [],
            createdAt: data.createdAt,
            updatedAt: data.updatedAt || new Date()
          };
          
          // Ajouter d'autres champs s'ils existent
          if (data.notes) flattenedData.notes = data.notes;
          if (data.adresse) flattenedData.adresse = data.adresse;
          if (data.ville) flattenedData.ville = data.ville;
          if (data.codePostal) flattenedData.codePostal = data.codePostal;
          if (data.pays) flattenedData.pays = data.pays;
          
          console.log('✅ Nouvelle structure:', flattenedData);
          
          // Mettre à jour le document avec la structure aplatie
          const docRef = doc(db, 'contacts', docSnap.id);
          await updateDoc(docRef, {
            ...flattenedData,
            // Supprimer les champs imbriqués
            contact: deleteField(),
            structure: deleteField()
          });
          
          fixedContacts++;
          console.log(`✨ Contact ${docSnap.id} corrigé avec succès`);
          
        } catch (error) {
          console.error(`❌ Erreur lors de la correction du contact ${docSnap.id}:`, error);
        }
      }
    }
    
    console.log('\n📊 Résumé de la migration:');
    console.log(`- Total des contacts: ${totalContacts}`);
    console.log(`- Contacts avec structure imbriquée: ${nestedContacts}`);
    console.log(`- Contacts corrigés: ${fixedContacts}`);
    
    if (fixedContacts > 0) {
      console.log('\n✅ Migration terminée! Rafraîchissez la page.');
    } else {
      console.log('\n✨ Aucun contact imbriqué trouvé.');
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
  }
}

// Vérifier les lieux aussi
async function checkNestedLieux() {
  const { collection, getDocs } = window.firebase.firestore;
  const db = window.firebase.db;
  
  console.log('\n🔍 Vérification des lieux...');
  
  const snapshot = await getDocs(collection(db, 'lieux'));
  let nestedCount = 0;
  
  snapshot.forEach(doc => {
    const data = doc.data();
    // Vérifier si les données sont imbriquées
    if (data.lieu && typeof data.lieu === 'object') {
      nestedCount++;
      console.log(`📍 Lieu imbriqué trouvé: ${doc.id}`, data);
    }
  });
  
  if (nestedCount > 0) {
    console.log(`⚠️ ${nestedCount} lieux avec structure imbriquée trouvés`);
  } else {
    console.log('✅ Tous les lieux ont une structure correcte');
  }
}

console.log(`
📋 INSTRUCTIONS :

1. Pour corriger les contacts imbriqués :
   fixNestedContacts()

2. Pour vérifier les lieux :
   checkNestedLieux()

3. Après correction, rafraîchissez la page (F5)
`);