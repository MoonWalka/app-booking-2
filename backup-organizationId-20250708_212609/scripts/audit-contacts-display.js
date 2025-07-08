#!/usr/bin/env node
/**
 * Script d'audit approfondi pour diagnostiquer pourquoi des contacts ont disparu
 * Vérifie les changements récents et les conditions d'affichage
 */

console.log(`
// ========================================
// AUDIT APPROFONDI DES CONTACTS MANQUANTS
// ========================================

// Copier et exécuter ce code dans la console du navigateur :

(async function auditContactsDisplay() {
  const { db, collection, getDocs, query, where } = window.firebase;
  const currentOrgId = window.currentOrganizationId || localStorage.getItem('currentOrganizationId');
  
  console.log('🔍 Audit approfondi des contacts manquants...');
  console.log('Organisation actuelle:', currentOrgId);
  console.log('Date d\\'audit:', new Date().toLocaleString('fr-FR'));
  
  try {
    // 1. Vérifier les requêtes utilisées par le système
    console.log('\\n📌 REQUÊTES SYSTÈME SIMULÉES:');
    
    // Requête structures (comme dans useContactsRelational)
    const structuresQuery = query(collection(db, 'structures'), where('organizationId', '==', currentOrgId));
    const structuresSnapshot = await getDocs(structuresQuery);
    console.log('- Structures avec organizationId =', currentOrgId, ':', structuresSnapshot.size);
    
    // Requête personnes (comme dans useContactsRelational)
    const personnesQuery = query(collection(db, 'personnes'), where('organizationId', '==', currentOrgId));
    const personnesSnapshot = await getDocs(personnesQuery);
    console.log('- Personnes avec organizationId =', currentOrgId, ':', personnesSnapshot.size);
    
    // Requête liaisons (comme dans useContactsRelational)
    const liaisonsQuery = query(collection(db, 'liaisons'), where('organizationId', '==', currentOrgId));
    const liaisonsSnapshot = await getDocs(liaisonsQuery);
    console.log('- Liaisons avec organizationId =', currentOrgId, ':', liaisonsSnapshot.size);
    
    // 2. Analyser les personnes et leur statut "personne libre"
    console.log('\\n🏷️ ANALYSE DES PERSONNES LIBRES:');
    
    let personnesLibresCount = 0;
    let personnesSansFlag = 0;
    let personnesAvecLiaisonMaisLibres = 0;
    const liaisonsParPersonne = {};
    
    // Compter les liaisons par personne
    liaisonsSnapshot.forEach(doc => {
      const liaison = doc.data();
      if (liaison.personneId) {
        if (!liaisonsParPersonne[liaison.personneId]) {
          liaisonsParPersonne[liaison.personneId] = [];
        }
        liaisonsParPersonne[liaison.personneId].push({
          id: doc.id,
          actif: liaison.actif,
          structureId: liaison.structureId
        });
      }
    });
    
    personnesSnapshot.forEach(doc => {
      const personne = doc.data();
      const liaisonsDePersonne = liaisonsParPersonne[doc.id] || [];
      const liaisonsActives = liaisonsDePersonne.filter(l => l.actif !== false);
      
      if (personne.isPersonneLibre) {
        personnesLibresCount++;
        if (liaisonsActives.length > 0) {
          personnesAvecLiaisonMaisLibres++;
        }
      } else if (liaisonsActives.length === 0) {
        personnesSansFlag++;
      }
    });
    
    console.log('- Personnes avec flag isPersonneLibre:', personnesLibresCount);
    console.log('- Personnes SANS liaison active ET SANS flag isPersonneLibre:', personnesSansFlag);
    console.log('- Personnes avec liaison active MAIS flag isPersonneLibre:', personnesAvecLiaisonMaisLibres);
    
    // 3. Vérifier les dates de modification récentes
    console.log('\\n📅 MODIFICATIONS RÉCENTES (7 derniers jours):');
    
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    let structuresModifiees = 0;
    let personnesModifiees = 0;
    const exemples = [];
    
    structuresSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.updatedAt) {
        const updateDate = data.updatedAt.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt);
        if (updateDate > sevenDaysAgo) {
          structuresModifiees++;
          if (exemples.length < 3) {
            exemples.push({
              type: 'structure',
              nom: data.raisonSociale || 'Sans nom',
              date: updateDate.toLocaleString('fr-FR'),
              updatedBy: data.updatedBy || 'Inconnu'
            });
          }
        }
      }
    });
    
    personnesSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.updatedAt) {
        const updateDate = data.updatedAt.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt);
        if (updateDate > sevenDaysAgo) {
          personnesModifiees++;
          if (exemples.length < 6) {
            exemples.push({
              type: 'personne',
              nom: data.nom || data.prenom || 'Sans nom',
              date: updateDate.toLocaleString('fr-FR'),
              updatedBy: data.updatedBy || 'Inconnu'
            });
          }
        }
      }
    });
    
    console.log('- Structures modifiées:', structuresModifiees);
    console.log('- Personnes modifiées:', personnesModifiees);
    
    if (exemples.length > 0) {
      console.log('\\nExemples de modifications récentes:');
      exemples.forEach(ex => {
        console.log(\`  • \${ex.type}: \${ex.nom} - \${ex.date} par \${ex.updatedBy}\`);
      });
    }
    
    // 4. Chercher des anomalies dans les données
    console.log('\\n⚠️ ANOMALIES DÉTECTÉES:');
    
    let anomaliesCount = 0;
    const anomalies = [];
    
    // Vérifier les structures sans données essentielles
    structuresSnapshot.forEach(doc => {
      const data = doc.data();
      if (!data.raisonSociale || data.raisonSociale.trim() === '') {
        anomaliesCount++;
        anomalies.push(\`Structure \${doc.id} sans raison sociale\`);
      }
    });
    
    // Vérifier les personnes sans nom
    personnesSnapshot.forEach(doc => {
      const data = doc.data();
      if ((!data.nom || data.nom.trim() === '') && (!data.prenom || data.prenom.trim() === '')) {
        anomaliesCount++;
        anomalies.push(\`Personne \${doc.id} sans nom ni prénom\`);
      }
    });
    
    console.log('Total anomalies:', anomaliesCount);
    if (anomalies.length > 0) {
      console.log('Détails (max 5):');
      anomalies.slice(0, 5).forEach(a => console.log('  •', a));
    }
    
    // 5. Tester les conditions d'affichage dans ContactsList
    console.log('\\n🎯 SIMULATION D\\'AFFICHAGE (ContactsList):');
    
    let contactsAffichables = 0;
    let structuresAffichables = 0;
    let personnesAffichables = 0;
    let personnesLibresAffichables = 0;
    
    // Structures affichables
    structuresSnapshot.forEach(doc => {
      structuresAffichables++;
      contactsAffichables++;
    });
    
    // Personnes dans les structures
    personnesSnapshot.forEach(doc => {
      const personne = doc.data();
      const liaisonsDePersonne = liaisonsParPersonne[doc.id] || [];
      const liaisonsActives = liaisonsDePersonne.filter(l => l.actif !== false);
      
      if (liaisonsActives.length > 0) {
        // Personne avec liaison active
        personnesAffichables += liaisonsActives.length; // Une entrée par liaison
        contactsAffichables += liaisonsActives.length;
      } else if (personne.isPersonneLibre) {
        // Personne libre
        personnesLibresAffichables++;
        contactsAffichables++;
      }
    });
    
    console.log('- Structures affichables:', structuresAffichables);
    console.log('- Personnes dans structures:', personnesAffichables);
    console.log('- Personnes libres affichables:', personnesLibresAffichables);
    console.log('- TOTAL contacts affichables:', contactsAffichables);
    
    // 6. Résumé et recommandations
    console.log('\\n📝 DIAGNOSTIC:');
    
    if (personnesSansFlag > 0) {
      console.log('\\n❗ PROBLÈME PRINCIPAL IDENTIFIÉ:');
      console.log(\`\${personnesSansFlag} personnes sans liaison n'ont pas le flag "isPersonneLibre"\`);
      console.log('Ces personnes n\\'apparaissent PAS dans la liste des contacts !');
      console.log('\\n🔧 SOLUTION: Exécuter le script fix-contacts-without-organizationid.js');
    }
    
    if (personnesAvecLiaisonMaisLibres > 0) {
      console.log('\\n⚠️ INCOHÉRENCE:');
      console.log(\`\${personnesAvecLiaisonMaisLibres} personnes ont des liaisons actives ET le flag isPersonneLibre\`);
      console.log('Cela peut causer des doublons ou des comportements inattendus.');
    }
    
    // 7. Vérifier le cache
    console.log('\\n💾 ÉTAT DU CACHE:');
    if (window.contactCache && window.contactCache.size) {
      console.log('Cache actif avec', window.contactCache.size, 'entrées');
      console.log('Le cache peut masquer des changements récents.');
      console.log('💡 TIP: Rafraîchir la page (F5) pour vider le cache');
    } else {
      console.log('Pas de cache détecté ou cache vide');
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de l\\'audit:', error);
  }
})();
`);

console.log('\n✅ Script d\'audit généré ! Copiez le code ci-dessus et exécutez-le dans la console du navigateur.');