#!/usr/bin/env node
/**
 * Script de diagnostic pour identifier les contacts manquants
 * Vérifie les problèmes d'organizationId et autres anomalies
 */

console.log(`
// ========================================
// SCRIPT DE DIAGNOSTIC DES CONTACTS MANQUANTS
// ========================================

// Copier et exécuter ce code dans la console du navigateur :

(async function diagnosticContacts() {
  const { db, collection, getDocs, query, where } = window.firebase;
  const currentOrgId = window.currentOrganizationId || localStorage.getItem('currentOrganizationId');
  
  console.log('🔍 Diagnostic des contacts...');
  console.log('Organisation actuelle:', currentOrgId);
  
  try {
    // 1. Compter tous les contacts
    console.log('\\n📊 STATISTIQUES GLOBALES:');
    
    const structuresSnapshot = await getDocs(collection(db, 'structures'));
    const personnesSnapshot = await getDocs(collection(db, 'personnes'));
    const liaisonsSnapshot = await getDocs(collection(db, 'liaisons'));
    
    console.log('- Total structures:', structuresSnapshot.size);
    console.log('- Total personnes:', personnesSnapshot.size);
    console.log('- Total liaisons:', liaisonsSnapshot.size);
    
    // 2. Analyser les structures
    console.log('\\n🏢 ANALYSE DES STRUCTURES:');
    let structuresSansOrgId = 0;
    let structuresAutreOrgId = 0;
    const structuresByOrg = {};
    
    structuresSnapshot.forEach(doc => {
      const data = doc.data();
      if (!data.organizationId) {
        structuresSansOrgId++;
      } else if (data.organizationId !== currentOrgId) {
        structuresAutreOrgId++;
        structuresByOrg[data.organizationId] = (structuresByOrg[data.organizationId] || 0) + 1;
      }
    });
    
    console.log('- Structures SANS organizationId:', structuresSansOrgId);
    console.log('- Structures avec AUTRE organizationId:', structuresAutreOrgId);
    if (Object.keys(structuresByOrg).length > 0) {
      console.log('  Répartition par organisation:', structuresByOrg);
    }
    
    // 3. Analyser les personnes
    console.log('\\n👥 ANALYSE DES PERSONNES:');
    let personnesSansOrgId = 0;
    let personnesAutreOrgId = 0;
    let personnesSansLiaison = 0;
    let personnesLibresSansFlag = 0;
    const personnesByOrg = {};
    const personnesIds = new Set();
    
    personnesSnapshot.forEach(doc => {
      const data = doc.data();
      personnesIds.add(doc.id);
      
      if (!data.organizationId) {
        personnesSansOrgId++;
      } else if (data.organizationId !== currentOrgId) {
        personnesAutreOrgId++;
        personnesByOrg[data.organizationId] = (personnesByOrg[data.organizationId] || 0) + 1;
      }
    });
    
    console.log('- Personnes SANS organizationId:', personnesSansOrgId);
    console.log('- Personnes avec AUTRE organizationId:', personnesAutreOrgId);
    if (Object.keys(personnesByOrg).length > 0) {
      console.log('  Répartition par organisation:', personnesByOrg);
    }
    
    // 4. Vérifier les personnes sans liaisons
    const personnesAvecLiaison = new Set();
    liaisonsSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.personneId && data.actif !== false) {
        personnesAvecLiaison.add(data.personneId);
      }
    });
    
    personnesSnapshot.forEach(doc => {
      const data = doc.data();
      if (!personnesAvecLiaison.has(doc.id)) {
        personnesSansLiaison++;
        if (!data.isPersonneLibre) {
          personnesLibresSansFlag++;
        }
      }
    });
    
    console.log('- Personnes SANS liaison active:', personnesSansLiaison);
    console.log('- Personnes sans liaison ET sans flag isPersonneLibre:', personnesLibresSansFlag);
    
    // 5. Vérifier les contacts visibles avec les filtres actuels
    console.log('\\n✅ CONTACTS VISIBLES AVEC LES FILTRES ACTUELS:');
    
    const structuresQuery = query(collection(db, 'structures'), where('organizationId', '==', currentOrgId));
    const personnesQuery = query(collection(db, 'personnes'), where('organizationId', '==', currentOrgId));
    
    const structuresVisibles = await getDocs(structuresQuery);
    const personnesVisibles = await getDocs(personnesQuery);
    
    console.log('- Structures visibles:', structuresVisibles.size);
    console.log('- Personnes visibles:', personnesVisibles.size);
    
    // 6. Résumé et recommandations
    console.log('\\n📝 RÉSUMÉ ET RECOMMANDATIONS:');
    
    const totalContactsManquants = structuresSansOrgId + personnesSansOrgId + structuresAutreOrgId + personnesAutreOrgId;
    
    if (totalContactsManquants > 0) {
      console.log('⚠️ PROBLÈME DÉTECTÉ:', totalContactsManquants, 'contacts potentiellement manquants');
      
      if (structuresSansOrgId > 0 || personnesSansOrgId > 0) {
        console.log('\\n🔧 ACTION RECOMMANDÉE:');
        console.log('Exécuter le script fix-contacts-without-organizationid.js pour assigner l\\'organizationId manquant');
      }
      
      if (structuresAutreOrgId > 0 || personnesAutreOrgId > 0) {
        console.log('\\n⚠️ ATTENTION:');
        console.log('Des contacts appartiennent à d\\'autres organisations. Vérifier si c\\'est normal.');
      }
      
      if (personnesLibresSansFlag > 0) {
        console.log('\\n🏷️ PERSONNES LIBRES:');
        console.log(personnesLibresSansFlag, 'personnes sans liaison devraient être marquées comme "personne libre"');
      }
    } else {
      console.log('✅ Aucun problème d\\'organizationId détecté');
    }
    
    // 7. Exemples de contacts problématiques
    if (structuresSansOrgId > 0 || personnesSansOrgId > 0) {
      console.log('\\n📋 EXEMPLES DE CONTACTS SANS ORGANIZATIONID:');
      
      let count = 0;
      structuresSnapshot.forEach(doc => {
        if (count < 5 && !doc.data().organizationId) {
          console.log('- Structure:', doc.data().nom || 'Sans nom', '(ID:', doc.id + ')');
          count++;
        }
      });
      
      count = 0;
      personnesSnapshot.forEach(doc => {
        if (count < 5 && !doc.data().organizationId) {
          const data = doc.data();
          const nom = data.nom || data.prenom || 'Sans nom';
          console.log('- Personne:', nom, '(ID:', doc.id + ')');
          count++;
        }
      });
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du diagnostic:', error);
  }
})();
`);

console.log('\n✅ Script généré ! Copiez le code ci-dessus et exécutez-le dans la console du navigateur.');