#!/usr/bin/env node
/**
 * Audit approfondi du système de contacts relationnel
 * Analyse les relations structures-personnes-liaisons
 */

console.log(`
// ========================================
// AUDIT DU SYSTÈME DE CONTACTS RELATIONNEL
// ========================================

// Copier et exécuter ce code dans la console du navigateur :

(async function auditRelationalSystem() {
  const { db, collection, getDocs, query, where } = window.firebase;
  const currentOrgId = window.currentEntrepriseId || localStorage.getItem('currentEntrepriseId');
  
  console.log('🔍 Audit du système de contacts relationnel');
  console.log('Organisation actuelle:', currentOrgId);
  console.log('Date:', new Date().toLocaleString('fr-FR'));
  
  try {
    // 1. Récupérer toutes les données
    console.log('\\n📊 CHARGEMENT DES DONNÉES...');
    
    const structuresQuery = query(collection(db, 'structures'), where('entrepriseId', '==', currentOrgId));
    const personnesQuery = query(collection(db, 'personnes'), where('entrepriseId', '==', currentOrgId));
    const liaisonsQuery = query(collection(db, 'liaisons'), where('entrepriseId', '==', currentOrgId));
    
    const [structuresSnapshot, personnesSnapshot, liaisonsSnapshot] = await Promise.all([
      getDocs(structuresQuery),
      getDocs(personnesQuery),
      getDocs(liaisonsQuery)
    ]);
    
    console.log('- Structures chargées:', structuresSnapshot.size);
    console.log('- Personnes chargées:', personnesSnapshot.size);
    console.log('- Liaisons chargées:', liaisonsSnapshot.size);
    
    // 2. Analyser les liaisons
    console.log('\\n🔗 ANALYSE DES LIAISONS:');
    
    const liaisonsByPersonne = new Map();
    const liaisonsByStructure = new Map();
    let liaisonsActives = 0;
    let liaisonsInactives = 0;
    
    liaisonsSnapshot.forEach(doc => {
      const liaison = doc.data();
      
      // Compter actives/inactives
      if (liaison.actif !== false) {
        liaisonsActives++;
      } else {
        liaisonsInactives++;
      }
      
      // Grouper par personne
      if (liaison.personneId) {
        if (!liaisonsByPersonne.has(liaison.personneId)) {
          liaisonsByPersonne.set(liaison.personneId, []);
        }
        liaisonsByPersonne.get(liaison.personneId).push({
          id: doc.id,
          structureId: liaison.structureId,
          actif: liaison.actif !== false,
          fonction: liaison.fonction,
          createdAt: liaison.createdAt,
          updatedAt: liaison.updatedAt
        });
      }
      
      // Grouper par structure
      if (liaison.structureId) {
        if (!liaisonsByStructure.has(liaison.structureId)) {
          liaisonsByStructure.set(liaison.structureId, []);
        }
        liaisonsByStructure.get(liaison.structureId).push({
          id: doc.id,
          personneId: liaison.personneId,
          actif: liaison.actif !== false,
          fonction: liaison.fonction
        });
      }
    });
    
    console.log('- Liaisons actives:', liaisonsActives);
    console.log('- Liaisons inactives:', liaisonsInactives);
    console.log('- Personnes avec liaisons:', liaisonsByPersonne.size);
    console.log('- Structures avec liaisons:', liaisonsByStructure.size);
    
    // 3. Catégoriser les personnes
    console.log('\\n👥 CATÉGORISATION DES PERSONNES:');
    
    const categories = {
      avecLiaisonsActives: [],
      avecSeulementLiaisonsInactives: [],
      sansLiaison: [],
      marqueeLibre: [],
      problematiques: []
    };
    
    personnesSnapshot.forEach(doc => {
      const personne = doc.data();
      const personneId = doc.id;
      const liaisons = liaisonsByPersonne.get(personneId) || [];
      const liaisonsActives = liaisons.filter(l => l.actif);
      
      const info = {
        id: personneId,
        nom: \`\${personne.prenom || ''} \${personne.nom || ''}\`.trim() || 'Sans nom',
        email: personne.email,
        isPersonneLibre: personne.isPersonneLibre,
        nbLiaisons: liaisons.length,
        nbLiaisonsActives: liaisonsActives.length
      };
      
      if (liaisonsActives.length > 0) {
        categories.avecLiaisonsActives.push(info);
      } else if (liaisons.length > 0) {
        categories.avecSeulementLiaisonsInactives.push(info);
      } else if (personne.isPersonneLibre) {
        categories.marqueeLibre.push(info);
      } else {
        categories.sansLiaison.push(info);
      }
      
      // Détecter les anomalies
      if (personne.isPersonneLibre && liaisonsActives.length > 0) {
        categories.problematiques.push({
          ...info,
          probleme: 'Marquée libre MAIS a des liaisons actives'
        });
      }
    });
    
    console.log(\`- Avec liaisons actives: \${categories.avecLiaisonsActives.length}\`);
    console.log(\`- Avec seulement liaisons inactives: \${categories.avecSeulementLiaisonsInactives.length}\`);
    console.log(\`- Sans aucune liaison ET marquées libres: \${categories.marqueeLibre.length}\`);
    console.log(\`- Sans aucune liaison ET NON marquées libres: \${categories.sansLiaison.length}\`);
    console.log(\`- Cas problématiques: \${categories.problematiques.length}\`);
    
    // 4. Simuler l'affichage dans ContactsList
    console.log('\\n📱 SIMULATION D\\'AFFICHAGE (ContactsList):');
    
    let contactsVisibles = 0;
    
    // Structures (toujours visibles)
    contactsVisibles += structuresSnapshot.size;
    console.log(\`- Structures affichées: \${structuresSnapshot.size}\`);
    
    // Personnes dans les structures (avec liaisons actives)
    const personnesAffichees = categories.avecLiaisonsActives.length;
    contactsVisibles += personnesAffichees;
    console.log(\`- Personnes dans structures: \${personnesAffichees}\`);
    
    // Personnes libres (si flag isPersonneLibre = true)
    const personnesLibresAffichees = categories.marqueeLibre.length;
    contactsVisibles += personnesLibresAffichees;
    console.log(\`- Personnes libres affichées: \${personnesLibresAffichees}\`);
    
    console.log(\`\\n📊 TOTAL CONTACTS VISIBLES: \${contactsVisibles}\`);
    
    // 5. Identifier les contacts invisibles
    const totalInvisibles = categories.avecSeulementLiaisonsInactives.length + categories.sansLiaison.length;
    
    if (totalInvisibles > 0) {
      console.log(\`\\n⚠️ CONTACTS INVISIBLES: \${totalInvisibles} personnes\`);
      
      if (categories.avecSeulementLiaisonsInactives.length > 0) {
        console.log('\\n❌ Personnes avec SEULEMENT des liaisons inactives:');
        categories.avecSeulementLiaisonsInactives.slice(0, 5).forEach(p => {
          console.log(\`  • \${p.nom} (\${p.email || 'pas d\\'email'}) - \${p.nbLiaisons} liaison(s) inactive(s)\`);
        });
      }
      
      if (categories.sansLiaison.length > 0) {
        console.log('\\n❌ Personnes SANS liaison ET NON marquées libres:');
        categories.sansLiaison.slice(0, 5).forEach(p => {
          console.log(\`  • \${p.nom} (\${p.email || 'pas d\\'email'})\`);
        });
      }
    }
    
    // 6. Examiner les structures sans personnes
    console.log('\\n🏢 ANALYSE DES STRUCTURES:');
    
    let structuresSansPersonne = 0;
    let structuresAvecPersonnes = 0;
    
    structuresSnapshot.forEach(doc => {
      const structureId = doc.id;
      const liaisons = liaisonsByStructure.get(structureId) || [];
      const liaisonsActives = liaisons.filter(l => l.actif);
      
      if (liaisonsActives.length === 0) {
        structuresSansPersonne++;
      } else {
        structuresAvecPersonnes++;
      }
    });
    
    console.log(\`- Structures avec personnes: \${structuresAvecPersonnes}\`);
    console.log(\`- Structures sans personne: \${structuresSansPersonne}\`);
    
    // 7. Rechercher les modifications récentes
    console.log('\\n📅 MODIFICATIONS RÉCENTES (7 derniers jours):');
    
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    let liaisonsModifieesRecemment = 0;
    const exemplesModifications = [];
    
    liaisonsSnapshot.forEach(doc => {
      const liaison = doc.data();
      if (liaison.updatedAt) {
        const updateDate = liaison.updatedAt.toDate ? liaison.updatedAt.toDate() : new Date(liaison.updatedAt);
        if (updateDate > sevenDaysAgo) {
          liaisonsModifieesRecemment++;
          if (exemplesModifications.length < 5) {
            exemplesModifications.push({
              personneId: liaison.personneId,
              structureId: liaison.structureId,
              actif: liaison.actif !== false,
              date: updateDate.toLocaleString('fr-FR')
            });
          }
        }
      }
    });
    
    console.log(\`Liaisons modifiées récemment: \${liaisonsModifieesRecemment}\`);
    if (exemplesModifications.length > 0) {
      console.log('Exemples:');
      exemplesModifications.forEach(ex => {
        console.log(\`  • Liaison \${ex.personneId} ↔ \${ex.structureId} (\${ex.actif ? 'active' : 'inactive'}) - \${ex.date}\`);
      });
    }
    
    // 8. Recommandations
    console.log('\\n💡 DIAGNOSTIC ET RECOMMANDATIONS:');
    
    if (totalInvisibles > 0) {
      console.log('\\n🔍 PROBLÈME IDENTIFIÉ:');
      console.log(\`\${totalInvisibles} personnes sont invisibles dans la liste des contacts.\`);
      
      console.log('\\n📌 EXPLICATION:');
      console.log('Le système actuel n\\'affiche que :');
      console.log('1. Les structures (toujours visibles)');
      console.log('2. Les personnes avec au moins une liaison active vers une structure');
      console.log('3. Les personnes marquées comme "libres" (isPersonneLibre = true)');
      
      console.log('\\n🛠️ SOLUTIONS POSSIBLES:');
      console.log('\\nOption 1: Marquer ces personnes comme "libres"');
      console.log('→ Exécuter fix-contacts-without-organizationid.js');
      
      console.log('\\nOption 2: Réactiver leurs liaisons');
      console.log('→ Aller dans les structures et réactiver les liaisons désactivées');
      
      console.log('\\nOption 3: Modifier la logique d\\'affichage');
      console.log('→ Afficher TOUTES les personnes, même sans liaison active');
      console.log('→ Nécessite une modification du code dans ContactsList.js');
    } else {
      console.log('✅ Tous les contacts sont correctement affichés');
    }
    
    // 9. État du cache
    console.log('\\n💾 CACHE:');
    if (window.contactCache && window.contactCache.size) {
      console.log('Cache actif avec', window.contactCache.size, 'entrées');
      console.log('→ Le cache peut masquer des changements récents (durée: 30s)');
    } else {
      console.log('Pas de cache actif');
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de l\\'audit:', error);
  }
})();
`);

console.log('\n✅ Script d\'audit relationnel généré ! Copiez et exécutez dans la console.');