#!/usr/bin/env node
/**
 * Script pour afficher TOUS les contacts bruts dans Firebase
 * Sans aucun filtre, pour voir ce qui existe vraiment
 */

console.log(`
// ========================================
// AFFICHAGE DE TOUS LES CONTACTS BRUTS
// ========================================

// Copier et exécuter ce code dans la console du navigateur :

(async function showAllContactsRaw() {
  const { db, collection, getDocs } = window.firebase;
  const currentOrgId = window.currentOrganizationId || localStorage.getItem('currentOrganizationId');
  
  console.log('🔍 Chargement de TOUS les contacts sans filtre...');
  console.log('Organisation actuelle:', currentOrgId);
  
  try {
    // 1. Charger TOUTES les données
    const [allStructures, allPersonnes, allLiaisons] = await Promise.all([
      getDocs(collection(db, 'structures')),
      getDocs(collection(db, 'personnes')),
      getDocs(collection(db, 'liaisons'))
    ]);
    
    console.log('\\n📊 TOTAUX ABSOLUS (toutes organisations confondues):');
    console.log('- Total structures:', allStructures.size);
    console.log('- Total personnes:', allPersonnes.size);
    console.log('- Total liaisons:', allLiaisons.size);
    
    // 2. Analyser par organisation
    console.log('\\n🏢 RÉPARTITION PAR ORGANISATION:');
    
    const stats = {
      structures: {},
      personnes: {},
      liaisons: {}
    };
    
    // Compter les structures
    allStructures.forEach(doc => {
      const data = doc.data();
      const orgId = data.organizationId || 'SANS_ORGANISATION';
      stats.structures[orgId] = (stats.structures[orgId] || 0) + 1;
    });
    
    // Compter les personnes
    allPersonnes.forEach(doc => {
      const data = doc.data();
      const orgId = data.organizationId || 'SANS_ORGANISATION';
      stats.personnes[orgId] = (stats.personnes[orgId] || 0) + 1;
    });
    
    // Compter les liaisons
    allLiaisons.forEach(doc => {
      const data = doc.data();
      const orgId = data.organizationId || 'SANS_ORGANISATION';
      stats.liaisons[orgId] = (stats.liaisons[orgId] || 0) + 1;
    });
    
    // Afficher les stats
    const allOrgIds = new Set([
      ...Object.keys(stats.structures),
      ...Object.keys(stats.personnes),
      ...Object.keys(stats.liaisons)
    ]);
    
    allOrgIds.forEach(orgId => {
      const isCurrent = orgId === currentOrgId ? ' ← VOTRE ORGANISATION' : '';
      console.log(\`\\n📌 Organisation: \${orgId}\${isCurrent}\`);
      console.log(\`   - Structures: \${stats.structures[orgId] || 0}\`);
      console.log(\`   - Personnes: \${stats.personnes[orgId] || 0}\`);
      console.log(\`   - Liaisons: \${stats.liaisons[orgId] || 0}\`);
    });
    
    // 3. Focus sur l'organisation actuelle
    console.log(\`\\n🎯 DÉTAILS POUR VOTRE ORGANISATION (\${currentOrgId}):\`);
    
    // Filtrer les données pour l'org actuelle
    const myStructures = [];
    const myPersonnes = [];
    const myLiaisons = [];
    
    allStructures.forEach(doc => {
      const data = doc.data();
      if (data.organizationId === currentOrgId) {
        myStructures.push({ id: doc.id, ...data });
      }
    });
    
    allPersonnes.forEach(doc => {
      const data = doc.data();
      if (data.organizationId === currentOrgId) {
        myPersonnes.push({ id: doc.id, ...data });
      }
    });
    
    allLiaisons.forEach(doc => {
      const data = doc.data();
      if (data.organizationId === currentOrgId) {
        myLiaisons.push({ id: doc.id, ...data });
      }
    });
    
    // 4. Lister les structures
    console.log(\`\\n🏢 VOS STRUCTURES (\${myStructures.length}):\`);
    myStructures.slice(0, 10).forEach(s => {
      console.log(\`- \${s.raisonSociale || 'Sans nom'} (ID: \${s.id})\`);
      if (s.email) console.log(\`  Email: \${s.email}\`);
      if (s.ville) console.log(\`  Ville: \${s.ville}\`);
    });
    if (myStructures.length > 10) {
      console.log(\`... et \${myStructures.length - 10} autres structures\`);
    }
    
    // 5. Lister les personnes avec leur statut
    console.log(\`\\n👥 VOS PERSONNES (\${myPersonnes.length}):\`);
    
    // Créer une map des liaisons par personne
    const liaisonsByPerson = new Map();
    myLiaisons.forEach(l => {
      if (l.personneId) {
        if (!liaisonsByPerson.has(l.personneId)) {
          liaisonsByPerson.set(l.personneId, []);
        }
        liaisonsByPerson.get(l.personneId).push(l);
      }
    });
    
    // Afficher les personnes avec leur statut
    let shown = 0;
    myPersonnes.forEach(p => {
      if (shown < 20) {
        const liaisons = liaisonsByPerson.get(p.id) || [];
        const liaisonsActives = liaisons.filter(l => l.actif !== false);
        
        console.log(\`\\n👤 \${p.prenom || ''} \${p.nom || ''} (ID: \${p.id})\`);
        if (p.email) console.log(\`   Email: \${p.email}\`);
        console.log(\`   Liaisons: \${liaisons.length} total, \${liaisonsActives.length} active(s)\`);
        console.log(\`   isPersonneLibre: \${p.isPersonneLibre || false}\`);
        
        // Statut d'affichage
        let statut = '';
        if (liaisonsActives.length > 0) {
          statut = '✅ VISIBLE (liaison active)';
        } else if (p.isPersonneLibre) {
          statut = '✅ VISIBLE (personne libre)';
        } else {
          statut = '❌ INVISIBLE (pas de liaison active, pas marquée libre)';
        }
        console.log(\`   Statut: \${statut}\`);
        
        shown++;
      }
    });
    
    if (myPersonnes.length > 20) {
      console.log(\`\\n... et \${myPersonnes.length - 20} autres personnes\`);
    }
    
    // 6. Résumé des personnes invisibles
    console.log('\\n📊 RÉSUMÉ DE VISIBILITÉ:');
    
    let visibles = 0;
    let invisibles = 0;
    
    myPersonnes.forEach(p => {
      const liaisons = liaisonsByPerson.get(p.id) || [];
      const liaisonsActives = liaisons.filter(l => l.actif !== false);
      
      if (liaisonsActives.length > 0 || p.isPersonneLibre) {
        visibles++;
      } else {
        invisibles++;
      }
    });
    
    console.log(\`- Personnes visibles: \${visibles}\`);
    console.log(\`- Personnes invisibles: \${invisibles}\`);
    console.log(\`- Structures (toujours visibles): \${myStructures.length}\`);
    console.log(\`\\n📱 TOTAL contacts affichés dans l'interface: \${visibles + myStructures.length}\`);
    
    if (invisibles > 0) {
      console.log(\`\\n⚠️ ATTENTION: \${invisibles} personnes existent mais n'apparaissent pas !\`);
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
})();
`);

console.log('\n✅ Script généré ! Copiez et exécutez dans la console du navigateur.');