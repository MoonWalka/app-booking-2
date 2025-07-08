// Script de migration spécifique pour Sophie Madet
// À exécuter dans la console du navigateur de l'application

async function migrateSophieMAdet() {
  console.log('🚀 Début de la migration de Sophie Madet');
  
  // Données du contact Sophie Madet (du debug)
  const sophieData = {
    "id": "QxkEAuYVM3mFrZWDFm95",
    "type": "mixte",
    "migrationStatus": "partially-migrated", 
    "structureId": "85011847200016",
    "prenom": "Sophie",
    "nom": "Madet",
    "fonction": "Présidente",
    "email": "",
    "mailDirect": "",
    "telephone": "",
    "telDirect": "",
    "mobile": "",
    "adresse": "",
    "ville": "",
    "codePostal": "",
    "pays": "France",
    "organizationId": "9LjkCJG04pEzbABdHkSf"
  };
  
  try {
    // 1. Vérifier si elle existe déjà dans contacts_unified
    console.log('🔍 Vérification dans contacts_unified...');
    const unifiedQuery = firebase.firestore()
      .collection('contacts_unified')
      .where('organizationId', '==', sophieData.organizationId)
      .get();
    
    const unifiedSnapshot = await unifiedQuery;
    let sophieExists = false;
    
    unifiedSnapshot.forEach(doc => {
      const data = doc.data();
      // Vérifier si Sophie existe déjà
      if (data.personne && data.personne.nom === 'Madet' && data.personne.prenom === 'Sophie') {
        sophieExists = true;
        console.log('✅ Sophie existe déjà dans contacts_unified:', doc.id);
      }
      // Ou dans les personnes d'une structure
      if (data.personnes) {
        data.personnes.forEach(p => {
          if (p.nom === 'Madet' && p.prenom === 'Sophie') {
            sophieExists = true;
            console.log('✅ Sophie existe déjà comme personne associée:', doc.id);
          }
        });
      }
    });
    
    if (sophieExists) {
      console.log('⚠️ Sophie Madet existe déjà dans contacts_unified');
      return;
    }
    
    // 2. Vérifier si la structure 85011847200016 existe
    console.log('🔍 Vérification de la structure associée...');
    let structureExists = false;
    
    try {
      const structureDoc = await firebase.firestore()
        .collection('contacts_unified')
        .doc(`unified_structure_${sophieData.structureId}`)
        .get();
      
      if (structureDoc.exists) {
        structureExists = true;
        console.log('✅ Structure trouvée dans contacts_unified');
      }
    } catch (e) {
      console.log('❌ Structure non trouvée dans contacts_unified');
    }
    
    // 3. Créer Sophie Madet selon son contexte
    const sophieUnifiedData = {
      organizationId: sophieData.organizationId,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      migrationVersion: 'unified-v1',
      migrationDate: firebase.firestore.FieldValue.serverTimestamp(),
      migrationNote: 'Migrée depuis contact mixte partiellement migré',
      
      // Préserver les relations métier
      concertsIds: sophieData.concertsIds || [],
      lieuxIds: sophieData.lieuxIds || [],
      artistesIds: sophieData.artistesIds || []
    };
    
    if (structureExists) {
      console.log('📝 Ajout de Sophie à la structure existante...');
      
      // Ajouter Sophie à la structure existante
      const structureRef = firebase.firestore()
        .collection('contacts_unified')
        .doc(`unified_structure_${sophieData.structureId}`);
      
      const structureDoc = await structureRef.get();
      const structureData = structureDoc.data();
      
      // Ajouter Sophie aux personnes (max 3)
      const currentPersonnes = structureData.personnes || [];
      if (currentPersonnes.length < 3) {
        const newPersonne = {
          id: sophieData.id, // Préserver l'ID original
          civilite: sophieData.civilite || '',
          prenom: sophieData.prenom,
          nom: sophieData.nom,
          fonction: sophieData.fonction,
          email: sophieData.email || sophieData.mailDirect || '',
          telephone: sophieData.telephone || sophieData.telDirect || sophieData.mobile || '',
          adresse: sophieData.adresse || '',
          ville: sophieData.ville || '',
          codePostal: sophieData.codePostal || '',
          pays: sophieData.pays || 'France'
        };
        
        await structureRef.update({
          personnes: [...currentPersonnes, newPersonne],
          updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        console.log('✅ Sophie ajoutée à la structure existante');
      } else {
        console.log('⚠️ Structure pleine (3 personnes max), création en personne libre');
        structureExists = false; // Forcer création en personne libre
      }
    }
    
    if (!structureExists) {
      console.log('📝 Création de Sophie comme personne libre...');
      
      // Créer Sophie comme personne libre
      sophieUnifiedData.entityType = 'personne_libre';
      sophieUnifiedData.personne = {
        civilite: sophieData.civilite || '',
        prenom: sophieData.prenom,
        nom: sophieData.nom,
        fonction: sophieData.fonction,
        email: sophieData.email || sophieData.mailDirect || '',
        telephone: sophieData.telephone || sophieData.telDirect || sophieData.mobile || '',
        adresse: sophieData.adresse || '',
        ville: sophieData.ville || '',
        codePostal: sophieData.codePostal || '',
        pays: sophieData.pays || 'France'
      };
      
      const docRef = await firebase.firestore()
        .collection('contacts_unified')
        .add(sophieUnifiedData);
      
      console.log('✅ Sophie créée comme personne libre:', docRef.id);
    }
    
    // 4. Marquer l'ancien contact comme migré
    console.log('📝 Marquage de l\'ancien contact comme migré...');
    
    const oldContactRef = firebase.firestore()
      .collection('contacts')
      .doc(sophieData.id);
    
    await oldContactRef.update({
      migrationStatus: 'fully-migrated',
      migrationVersion: 'unified-v1',
      migrationDate: firebase.firestore.FieldValue.serverTimestamp(),
      migrationNote: 'Migré vers contacts_unified'
    });
    
    console.log('✅ Migration de Sophie Madet terminée avec succès !');
    console.log('🎉 Sophie devrait maintenant apparaître dans les modals d\'association');
    
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
  }
}

// Exécuter la migration
migrateSophieMAdet();