#!/usr/bin/env node
/**
 * Script pour vérifier les changements récents qui pourraient avoir fait disparaître des contacts
 * Examine l'historique des modifications et les changements de structure
 */

console.log(`
// ========================================
// VÉRIFICATION DES CHANGEMENTS RÉCENTS
// ========================================

// Copier et exécuter ce code dans la console du navigateur :

(async function checkRecentChanges() {
  const { db, collection, getDocs, query, where } = window.firebase;
  const currentOrgId = window.currentEntrepriseId || localStorage.getItem('currentEntrepriseId');
  
  console.log('🔍 Vérification des changements récents...');
  console.log('Organisation actuelle:', currentOrgId);
  
  try {
    // 1. Récupérer TOUS les contacts pour comparer
    console.log('\\n📊 COMPARAISON GLOBALE:');
    
    const allStructures = await getDocs(collection(db, 'structures'));
    const allPersonnes = await getDocs(collection(db, 'personnes'));
    
    console.log('- Total structures dans Firebase:', allStructures.size);
    console.log('- Total personnes dans Firebase:', allPersonnes.size);
    
    // Compter par entrepriseId
    const structuresByOrg = {};
    const personnesByOrg = {};
    
    allStructures.forEach(doc => {
      const data = doc.data();
      const orgId = data.entrepriseId || 'SANS_ORG';
      structuresByOrg[orgId] = (structuresByOrg[orgId] || 0) + 1;
    });
    
    allPersonnes.forEach(doc => {
      const data = doc.data();
      const orgId = data.entrepriseId || 'SANS_ORG';
      personnesByOrg[orgId] = (personnesByOrg[orgId] || 0) + 1;
    });
    
    console.log('\\nRépartition des structures par organisation:');
    Object.entries(structuresByOrg).forEach(([orgId, count]) => {
      const isCurrent = orgId === currentOrgId ? ' ← ACTUELLE' : '';
      console.log(\`  • \${orgId}: \${count} structures\${isCurrent}\`);
    });
    
    console.log('\\nRépartition des personnes par organisation:');
    Object.entries(personnesByOrg).forEach(([orgId, count]) => {
      const isCurrent = orgId === currentOrgId ? ' ← ACTUELLE' : '';
      console.log(\`  • \${orgId}: \${count} personnes\${isCurrent}\`);
    });
    
    // 2. Examiner les migrations récentes
    console.log('\\n🔄 TRACES DE MIGRATION:');
    
    let contactsAvecMigrationNote = 0;
    const migrationExamples = [];
    
    allStructures.forEach(doc => {
      const data = doc.data();
      if (data._migrationNote) {
        contactsAvecMigrationNote++;
        if (migrationExamples.length < 3) {
          migrationExamples.push({
            type: 'structure',
            nom: data.raisonSociale || 'Sans nom',
            note: data._migrationNote,
            orgId: data.entrepriseId
          });
        }
      }
    });
    
    allPersonnes.forEach(doc => {
      const data = doc.data();
      if (data._migrationNote) {
        contactsAvecMigrationNote++;
        if (migrationExamples.length < 6) {
          migrationExamples.push({
            type: 'personne',
            nom: data.nom || data.prenom || 'Sans nom',
            note: data._migrationNote,
            orgId: data.entrepriseId
          });
        }
      }
    });
    
    console.log('Contacts avec note de migration:', contactsAvecMigrationNote);
    if (migrationExamples.length > 0) {
      console.log('\\nExemples:');
      migrationExamples.forEach(ex => {
        console.log(\`  • \${ex.type}: \${ex.nom}\`);
        console.log(\`    Note: \${ex.note}\`);
        console.log(\`    OrgId: \${ex.orgId}\`);
      });
    }
    
    // 3. Vérifier spécifiquement les personnes qui pourraient être invisibles
    console.log('\\n👻 PERSONNES POTENTIELLEMENT INVISIBLES:');
    
    const personnesInvisibles = [];
    let countSansOrgId = 0;
    let countAutreOrgId = 0;
    let countSansLiaisonNiFlag = 0;
    
    // D'abord récupérer toutes les liaisons pour savoir qui a des liaisons actives
    const allLiaisons = await getDocs(collection(db, 'liaisons'));
    const personnesAvecLiaison = new Set();
    
    allLiaisons.forEach(doc => {
      const liaison = doc.data();
      if (liaison.personneId && liaison.actif !== false && liaison.entrepriseId === currentOrgId) {
        personnesAvecLiaison.add(liaison.personneId);
      }
    });
    
    allPersonnes.forEach(doc => {
      const data = doc.data();
      let invisible = false;
      let raison = '';
      
      if (!data.entrepriseId) {
        invisible = true;
        raison = 'Pas d\\'entrepriseId';
        countSansOrgId++;
      } else if (data.entrepriseId !== currentOrgId) {
        invisible = true;
        raison = \`Autre organisation (\${data.entrepriseId})\`;
        countAutreOrgId++;
      } else if (!personnesAvecLiaison.has(doc.id) && !data.isPersonneLibre) {
        invisible = true;
        raison = 'Pas de liaison active ET pas marquée comme personne libre';
        countSansLiaisonNiFlag++;
      }
      
      if (invisible && personnesInvisibles.length < 10) {
        personnesInvisibles.push({
          id: doc.id,
          nom: \`\${data.prenom || ''} \${data.nom || ''}\`.trim() || 'Sans nom',
          email: data.email || 'Pas d\\'email',
          raison,
          updatedAt: data.updatedAt ? (data.updatedAt.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt)) : null
        });
      }
    });
    
    console.log('\\nPersonnes invisibles par catégorie:');
    console.log('- Sans entrepriseId:', countSansOrgId);
    console.log('- Autre entrepriseId:', countAutreOrgId);
    console.log('- Sans liaison ni flag libre:', countSansLiaisonNiFlag);
    console.log('- TOTAL invisible:', countSansOrgId + countAutreOrgId + countSansLiaisonNiFlag);
    
    if (personnesInvisibles.length > 0) {
      console.log('\\nExemples de personnes invisibles:');
      personnesInvisibles.forEach(p => {
        console.log(\`\\n  👤 \${p.nom} (\${p.email})\`);
        console.log(\`     ID: \${p.id}\`);
        console.log(\`     Raison: \${p.raison}\`);
        if (p.updatedAt) {
          console.log(\`     Dernière modif: \${p.updatedAt.toLocaleString('fr-FR')}\`);
        }
      });
    }
    
    // 4. Suggestions basées sur l'analyse
    console.log('\\n💡 RECOMMANDATIONS:');
    
    if (countSansLiaisonNiFlag > 0) {
      console.log('\\n1️⃣ PROBLÈME LE PLUS PROBABLE:');
      console.log(\`   \${countSansLiaisonNiFlag} personnes ne sont PAS visibles car:\`);
      console.log('   - Elles n\\'ont pas de liaison active avec une structure');
      console.log('   - Elles ne sont PAS marquées comme "personne libre" (isPersonneLibre = false)');
      console.log('   ');
      console.log('   CES PERSONNES ÉTAIENT VISIBLES AVANT si elles avaient des liaisons');
      console.log('   qui ont été supprimées ou désactivées récemment.');
    }
    
    if (countSansOrgId > 0 || countAutreOrgId > 0) {
      console.log('\\n2️⃣ PROBLÈME D\\'ORGANISATION:');
      console.log(\`   \${countSansOrgId + countAutreOrgId} contacts appartiennent à une autre organisation\`);
      console.log('   ou n\\'ont pas d\\'organization assignée.');
    }
    
    console.log('\\n🔧 ACTIONS POSSIBLES:');
    console.log('1. Pour récupérer les personnes sans liaison:');
    console.log('   → Exécuter fix-contacts-without-organizationid.js');
    console.log('   → Cela marquera automatiquement ces personnes comme "libres"');
    console.log('');
    console.log('2. Pour comprendre pourquoi des liaisons ont disparu:');
    console.log('   → Vérifier l\\'historique des suppressions de liaisons');
    console.log('   → Examiner les modifications récentes des structures');
    
  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error);
  }
})();
`);

console.log('\n✅ Script de vérification généré ! Copiez le code ci-dessus et exécutez-le dans la console du navigateur.');