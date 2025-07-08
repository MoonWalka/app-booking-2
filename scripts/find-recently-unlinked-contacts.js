#!/usr/bin/env node
/**
 * Script pour identifier les contacts qui ont perdu leurs liaisons récemment
 * Ces contacts sont probablement ceux qui ont "disparu" de la liste
 */

console.log(`
// ========================================
// RECHERCHE DES CONTACTS RÉCEMMENT DÉLIÉS
// ========================================

// Copier et exécuter ce code dans la console du navigateur :

(async function findRecentlyUnlinkedContacts() {
  const { db, collection, getDocs, query, where } = window.firebase;
  const currentOrgId = window.currentEntrepriseId || localStorage.getItem('currentEntrepriseId');
  
  console.log('🔍 Recherche des contacts récemment déliés...');
  console.log('Organisation actuelle:', currentOrgId);
  
  try {
    // 1. Récupérer toutes les données nécessaires
    const personnesQuery = query(collection(db, 'personnes'), where('entrepriseId', '==', currentOrgId));
    const personnesSnapshot = await getDocs(personnesQuery);
    const liaisonsSnapshot = await getDocs(collection(db, 'liaisons'));
    
    // 2. Créer une map des liaisons actives par personne
    const liaisonsActives = new Map();
    const toutesLiaisons = new Map();
    
    liaisonsSnapshot.forEach(doc => {
      const liaison = doc.data();
      if (liaison.personneId) {
        if (!toutesLiaisons.has(liaison.personneId)) {
          toutesLiaisons.set(liaison.personneId, []);
        }
        toutesLiaisons.get(liaison.personneId).push({
          id: doc.id,
          ...liaison
        });
        
        // Si liaison active et dans la bonne org
        if (liaison.actif !== false && liaison.entrepriseId === currentOrgId) {
          if (!liaisonsActives.has(liaison.personneId)) {
            liaisonsActives.set(liaison.personneId, []);
          }
          liaisonsActives.get(liaison.personneId).push({
            id: doc.id,
            structureId: liaison.structureId,
            fonction: liaison.fonction
          });
        }
      }
    });
    
    // 3. Analyser les personnes
    console.log('\\n📊 ANALYSE DES PERSONNES:');
    
    const categories = {
      avecLiaisonActive: [],
      sansLiaisonMaisLibre: [],
      sansLiaisonNonLibre: [], // ⚠️ Ces personnes sont INVISIBLES !
      avecLiaisonInactive: []
    };
    
    personnesSnapshot.forEach(doc => {
      const personne = doc.data();
      const personneId = doc.id;
      const liaisonsActivesPersonne = liaisonsActives.get(personneId) || [];
      const toutesLiaisonsPersonne = toutesLiaisons.get(personneId) || [];
      
      const info = {
        id: personneId,
        nom: \`\${personne.prenom || ''} \${personne.nom || ''}\`.trim() || 'Sans nom',
        email: personne.email || '',
        isPersonneLibre: personne.isPersonneLibre,
        updatedAt: personne.updatedAt
      };
      
      if (liaisonsActivesPersonne.length > 0) {
        categories.avecLiaisonActive.push({
          ...info,
          liaisons: liaisonsActivesPersonne
        });
      } else if (personne.isPersonneLibre) {
        categories.sansLiaisonMaisLibre.push(info);
      } else if (toutesLiaisonsPersonne.some(l => l.actif === false)) {
        // A des liaisons mais toutes inactives
        categories.avecLiaisonInactive.push({
          ...info,
          liaisonsInactives: toutesLiaisonsPersonne.filter(l => l.actif === false)
        });
      } else {
        // Pas de liaison et pas libre = INVISIBLE
        categories.sansLiaisonNonLibre.push(info);
      }
    });
    
    // 4. Afficher les résultats
    console.log(\`- Personnes avec liaison active: \${categories.avecLiaisonActive.length} ✅ (visibles)\`);
    console.log(\`- Personnes libres sans liaison: \${categories.sansLiaisonMaisLibre.length} ✅ (visibles)\`);
    console.log(\`- Personnes avec liaison(s) inactive(s): \${categories.avecLiaisonInactive.length} ❌ (INVISIBLES)\`);
    console.log(\`- Personnes sans liaison ni flag libre: \${categories.sansLiaisonNonLibre.length} ❌ (INVISIBLES)\`);
    
    // 5. Focus sur les personnes invisibles
    const totalInvisibles = categories.avecLiaisonInactive.length + categories.sansLiaisonNonLibre.length;
    
    if (totalInvisibles > 0) {
      console.log(\`\\n⚠️ CONTACTS INVISIBLES DÉTECTÉS: \${totalInvisibles} personnes\`);
      
      if (categories.avecLiaisonInactive.length > 0) {
        console.log('\\n❌ PERSONNES AVEC LIAISONS DÉSACTIVÉES:');
        console.log('(Ces personnes avaient des liaisons qui ont été désactivées)');
        
        categories.avecLiaisonInactive.slice(0, 10).forEach(p => {
          console.log(\`\\n  👤 \${p.nom} (\${p.email || 'pas d\\'email'})\`);
          console.log(\`     ID: \${p.id}\`);
          console.log(\`     Liaisons inactives: \${p.liaisonsInactives.length}\`);
          p.liaisonsInactives.forEach(l => {
            console.log(\`       - Structure: \${l.structureId}, Fonction: \${l.fonction || 'N/A'}\`);
          });
        });
      }
      
      if (categories.sansLiaisonNonLibre.length > 0) {
        console.log('\\n❌ PERSONNES SANS LIAISON ET NON LIBRES:');
        console.log('(Ces personnes n\\'ont jamais eu de liaison ou ont été supprimées)');
        
        categories.sansLiaisonNonLibre.slice(0, 10).forEach(p => {
          console.log(\`\\n  👤 \${p.nom} (\${p.email || 'pas d\\'email'})\`);
          console.log(\`     ID: \${p.id}\`);
          console.log(\`     Flag personne libre: \${p.isPersonneLibre ? 'OUI' : 'NON'}\`);
          if (p.updatedAt) {
            const date = p.updatedAt.toDate ? p.updatedAt.toDate() : new Date(p.updatedAt);
            console.log(\`     Dernière modification: \${date.toLocaleString('fr-FR')}\`);
          }
        });
      }
      
      console.log('\\n🔧 SOLUTION IMMÉDIATE:');
      console.log('Pour rendre ces personnes visibles à nouveau :');
      console.log('1. Exécutez le script fix-contacts-without-organizationid.js');
      console.log('2. Il marquera automatiquement ces personnes comme "personnes libres"');
      console.log('3. Elles réapparaîtront dans la liste des contacts');
      
      console.log('\\n💡 EXPLICATION:');
      console.log('Le système n\\'affiche que :');
      console.log('- Les structures (toujours visibles)');
      console.log('- Les personnes avec au moins une liaison active');
      console.log('- Les personnes marquées comme "libres" (isPersonneLibre = true)');
      console.log('');
      console.log('Si une personne perd sa dernière liaison active et n\\'est pas');
      console.log('marquée comme libre, elle devient invisible !');
    } else {
      console.log('\\n✅ Aucun contact invisible détecté');
      console.log('Tous les contacts de votre organisation sont visibles.');
    }
    
    // 6. Vérifier les suppressions récentes de liaisons
    console.log('\\n🔍 INDICES DE SUPPRESSIONS RÉCENTES:');
    
    let liaisonsRecemmentDesactivees = 0;
    const exemplesDesactivations = [];
    
    liaisonsSnapshot.forEach(doc => {
      const liaison = doc.data();
      if (liaison.actif === false && liaison.updatedAt) {
        const updateDate = liaison.updatedAt.toDate ? liaison.updatedAt.toDate() : new Date(liaison.updatedAt);
        const joursDiff = Math.floor((new Date() - updateDate) / (1000 * 60 * 60 * 24));
        
        if (joursDiff <= 7) {
          liaisonsRecemmentDesactivees++;
          if (exemplesDesactivations.length < 5) {
            exemplesDesactivations.push({
              personneId: liaison.personneId,
              structureId: liaison.structureId,
              date: updateDate.toLocaleString('fr-FR'),
              joursDepuis: joursDiff
            });
          }
        }
      }
    });
    
    if (liaisonsRecemmentDesactivees > 0) {
      console.log(\`Liaisons désactivées dans les 7 derniers jours: \${liaisonsRecemmentDesactivees}\`);
      console.log('\\nExemples:');
      exemplesDesactivations.forEach(ex => {
        console.log(\`  - Personne \${ex.personneId} délié de \${ex.structureId}\`);
        console.log(\`    Il y a \${ex.joursDepuis} jour(s) (\${ex.date})\`);
      });
    } else {
      console.log('Aucune liaison désactivée récemment (7 derniers jours)');
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de la recherche:', error);
  }
})();
`);

console.log('\n✅ Script généré ! Copiez le code ci-dessus et exécutez-le dans la console du navigateur.');