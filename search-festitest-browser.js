/**
 * Script à exécuter dans la console du navigateur pour rechercher le contact "festitest"
 * Utilise les services Firebase déjà chargés dans l'application
 */

(async function searchFestitestInBrowser() {
  console.log('🔍 Recherche du contact "festitest" dans le navigateur...');
  
  try {
    // Importer les services Firebase depuis l'application
    const { db, collection, query, where, getDocs } = await import('./src/services/firebase-service.js');
    const { getCurrentOrganization } = await import('./src/services/firebase-service.js');
    
    console.log('✅ Services Firebase importés');
    
    // Obtenir l'organisation courante
    const currentOrgId = getCurrentOrganization();
    console.log('🏢 Organisation courante:', currentOrgId);
    
    // Méthodes de recherche
    const searchMethods = [
      {
        name: 'Nom exact "festitest"',
        constraints: [where('nom', '==', 'festitest')]
      },
      {
        name: 'Nom "Festitest" (avec majuscule)',
        constraints: [where('nom', '==', 'Festitest')]
      },
      {
        name: 'Prénom "festitest"',
        constraints: [where('prenom', '==', 'festitest')]
      },
      {
        name: 'Email contenant "festitest"',
        constraints: [where('email', '>=', 'festitest'), where('email', '<=', 'festitest\uf8ff')]
      },
      {
        name: 'nomLowercase "festitest"',
        constraints: [where('nomLowercase', '==', 'festitest')]
      }
    ];
    
    let foundContacts = [];
    
    // Recherche dans la collection principale
    console.log('\n📋 Recherche dans la collection "contacts"...');
    
    for (const method of searchMethods) {
      console.log(`\n🔍 ${method.name}:`);
      
      try {
        const q = query(collection(db, 'contacts'), ...method.constraints);
        const snapshot = await getDocs(q);
        
        if (!snapshot.empty) {
          console.log(`✅ ${snapshot.size} contact(s) trouvé(s)`);
          
          snapshot.forEach(doc => {
            const data = doc.data();
            foundContacts.push({ id: doc.id, ...data });
            
            console.log(`📄 Contact trouvé:`, {
              id: doc.id,
              nom: data.nom,
              prenom: data.prenom,
              email: data.email,
              telephone: data.telephone,
              structureId: data.structureId,
              structureNom: data.structureNom,
              organizationId: data.organizationId,
              createdAt: data.createdAt,
              updatedAt: data.updatedAt
            });
            
            console.log('🔍 Métadonnées complètes du contact:', data);
          });
        } else {
          console.log('❌ Aucun résultat');
        }
      } catch (error) {
        console.log(`⚠️ Erreur: ${error.message}`);
      }
    }
    
    // Recherche dans la collection organisationnelle si on a une organisation
    if (currentOrgId) {
      console.log(`\n📋 Recherche dans la collection organisationnelle "contacts_org_${currentOrgId}"...`);
      
      for (const method of searchMethods) {
        console.log(`\n🔍 ${method.name} (org):`);
        
        try {
          const orgCollection = `contacts_org_${currentOrgId}`;
          const q = query(collection(db, orgCollection), ...method.constraints);
          const snapshot = await getDocs(q);
          
          if (!snapshot.empty) {
            console.log(`✅ ${snapshot.size} contact(s) trouvé(s) dans l'organisation`);
            
            snapshot.forEach(doc => {
              const data = doc.data();
              foundContacts.push({ id: doc.id, collection: orgCollection, ...data });
              
              console.log(`📄 Contact organisationnel trouvé:`, {
                id: doc.id,
                collection: orgCollection,
                nom: data.nom,
                prenom: data.prenom,
                email: data.email,
                telephone: data.telephone,
                structureId: data.structureId,
                organizationId: data.organizationId
              });
              
              console.log('🔍 Métadonnées complètes du contact organisationnel:', data);
            });
          } else {
            console.log('❌ Aucun résultat dans la collection organisationnelle');
          }
        } catch (error) {
          console.log(`⚠️ Erreur: ${error.message}`);
        }
      }
    }
    
    // Si aucun contact trouvé, afficher quelques exemples
    if (foundContacts.length === 0) {
      console.log('\n🔍 Aucun contact "festitest" trouvé. Voici quelques contacts existants...');
      
      try {
        const allQuery = query(collection(db, 'contacts'));
        const allSnapshot = await getDocs(allQuery);
        
        console.log(`📊 Total: ${allSnapshot.size} contacts dans la collection principale`);
        
        // Afficher les 3 premiers
        let count = 0;
        allSnapshot.forEach(doc => {
          if (count < 3) {
            const data = doc.data();
            console.log(`\n📄 Exemple ${count + 1}:`, {
              id: doc.id,
              nom: data.nom,
              prenom: data.prenom,
              email: data.email,
              organizationId: data.organizationId
            });
            count++;
          }
        });
        
        // Afficher la structure des champs
        if (allSnapshot.size > 0) {
          const firstContact = allSnapshot.docs[0].data();
          console.log('\n🏗️ Champs disponibles:', Object.keys(firstContact).sort());
        }
      } catch (error) {
        console.error('Erreur lors de l\'affichage des exemples:', error);
      }
      
      // Essayer aussi la collection organisationnelle
      if (currentOrgId) {
        try {
          const orgCollection = `contacts_org_${currentOrgId}`;
          const orgQuery = query(collection(db, orgCollection));
          const orgSnapshot = await getDocs(orgQuery);
          
          console.log(`📊 Total: ${orgSnapshot.size} contacts dans ${orgCollection}`);
          
          let count = 0;
          orgSnapshot.forEach(doc => {
            if (count < 3) {
              const data = doc.data();
              console.log(`\n📄 Exemple organisationnel ${count + 1}:`, {
                id: doc.id,
                nom: data.nom,
                prenom: data.prenom,
                email: data.email
              });
              count++;
            }
          });
        } catch (error) {
          console.log('⚠️ Pas de collection organisationnelle ou erreur:', error.message);
        }
      }
    }
    
    // Résumé
    if (foundContacts.length > 0) {
      console.log(`\n🎉 RÉSUMÉ: ${foundContacts.length} contact(s) "festitest" trouvé(s)!`);
      console.log('📋 Liste des contacts trouvés:', foundContacts);
      
      // Retourner les contacts pour utilisation ultérieure
      window.festitestContacts = foundContacts;
      console.log('💾 Contacts sauvegardés dans window.festitestContacts');
      
      return foundContacts;
    } else {
      console.log('\n❌ RÉSUMÉ: Aucun contact "festitest" trouvé');
      console.log('💡 Suggestion: Créez un contact avec le nom "festitest" pour vos tests');
      return [];
    }
    
  } catch (error) {
    console.error('💥 Erreur lors de la recherche:', error);
    console.log('🔧 Vérifiez que vous êtes bien sur la page de l\'application TourCraft');
    throw error;
  }
})();

// Pour utilisation manuelle dans la console
window.searchFestitest = async function() {
  // Code de recherche réutilisable
  console.log('🔄 Recherche manuelle du contact festitest...');
  
  // Réexécuter la fonction de recherche
  return await searchFestitestInBrowser();
};