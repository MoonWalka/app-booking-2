#!/usr/bin/env node
/**
 * Script pour corriger les contacts sans entrepriseId
 * Assigne l'entrepriseId actuel aux contacts qui n'en ont pas
 */

console.log(`
// ========================================
// SCRIPT DE CORRECTION DES CONTACTS SANS ORGANIZATIONID
// ========================================

// Copier et exécuter ce code dans la console du navigateur :

(async function fixContactsEntrepriseId() {
  const { db, collection, getDocs, doc, updateDoc, writeBatch, serverTimestamp } = window.firebase;
  const { auth } = window.firebase;
  const currentOrgId = window.currentEntrepriseId || localStorage.getItem('currentEntrepriseId');
  const currentUser = auth.currentUser;
  
  if (!currentOrgId) {
    console.error('❌ Aucune organisation actuelle détectée. Connectez-vous d\\'abord.');
    return;
  }
  
  if (!currentUser) {
    console.error('❌ Aucun utilisateur connecté. Connectez-vous d\\'abord.');
    return;
  }
  
  console.log('🔧 Correction des contacts sans entrepriseId...');
  console.log('Organisation cible:', currentOrgId);
  console.log('Utilisateur:', currentUser.email);
  
  const confirmation = confirm(
    'ATTENTION !\\n\\n' +
    'Ce script va :\\n' +
    '1. Assigner l\\'entrepriseId "' + currentOrgId + '" à tous les contacts qui n\\'en ont pas\\n' +
    '2. Marquer comme "personne libre" les personnes sans liaison\\n\\n' +
    'Voulez-vous continuer ?'
  );
  
  if (!confirmation) {
    console.log('❌ Opération annulée');
    return;
  }
  
  try {
    // 1. Corriger les structures sans entrepriseId
    console.log('\\n🏢 CORRECTION DES STRUCTURES...');
    
    const structuresSnapshot = await getDocs(collection(db, 'structures'));
    const structuresToFix = [];
    
    structuresSnapshot.forEach(doc => {
      const data = doc.data();
      if (!data.entrepriseId) {
        structuresToFix.push({ id: doc.id, data });
      }
    });
    
    console.log('Structures à corriger:', structuresToFix.length);
    
    if (structuresToFix.length > 0) {
      // Traiter par batch de 500 (limite Firestore)
      for (let i = 0; i < structuresToFix.length; i += 500) {
        const batch = writeBatch(db);
        const batchStructures = structuresToFix.slice(i, i + 500);
        
        batchStructures.forEach(structure => {
          const structureRef = doc(db, 'structures', structure.id);
          batch.update(structureRef, {
            entrepriseId: currentOrgId,
            updatedAt: serverTimestamp(),
            updatedBy: currentUser.uid,
            _migrationNote: 'entrepriseId ajouté par script de correction'
          });
        });
        
        await batch.commit();
        console.log('✅ Batch', Math.floor(i/500) + 1, 'terminé -', batchStructures.length, 'structures corrigées');
      }
    }
    
    // 2. Corriger les personnes sans entrepriseId
    console.log('\\n👥 CORRECTION DES PERSONNES...');
    
    const personnesSnapshot = await getDocs(collection(db, 'personnes'));
    const personnesToFix = [];
    const personnesLibresToFix = [];
    
    // D'abord, identifier les personnes avec liaisons actives
    const liaisonsSnapshot = await getDocs(collection(db, 'liaisons'));
    const personnesAvecLiaison = new Set();
    
    liaisonsSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.personneId && data.actif !== false) {
        personnesAvecLiaison.add(data.personneId);
      }
    });
    
    personnesSnapshot.forEach(doc => {
      const data = doc.data();
      
      // Personnes sans entrepriseId
      if (!data.entrepriseId) {
        personnesToFix.push({ id: doc.id, data });
      }
      
      // Personnes sans liaison qui ne sont pas marquées comme libres
      if (!personnesAvecLiaison.has(doc.id) && !data.isPersonneLibre) {
        personnesLibresToFix.push({ id: doc.id, data });
      }
    });
    
    console.log('Personnes sans entrepriseId:', personnesToFix.length);
    console.log('Personnes à marquer comme libres:', personnesLibresToFix.length);
    
    // Corriger les personnes sans entrepriseId
    if (personnesToFix.length > 0) {
      for (let i = 0; i < personnesToFix.length; i += 500) {
        const batch = writeBatch(db);
        const batchPersonnes = personnesToFix.slice(i, i + 500);
        
        batchPersonnes.forEach(personne => {
          const personneRef = doc(db, 'personnes', personne.id);
          const updates = {
            entrepriseId: currentOrgId,
            updatedAt: serverTimestamp(),
            updatedBy: currentUser.uid,
            _migrationNote: 'entrepriseId ajouté par script de correction'
          };
          
          // Si la personne n'a pas de liaison, la marquer aussi comme libre
          if (!personnesAvecLiaison.has(personne.id)) {
            updates.isPersonneLibre = true;
            updates._migrationNote += ' + marquée comme personne libre';
          }
          
          batch.update(personneRef, updates);
        });
        
        await batch.commit();
        console.log('✅ Batch', Math.floor(i/500) + 1, 'terminé -', batchPersonnes.length, 'personnes corrigées');
      }
    }
    
    // Marquer les personnes libres qui ont déjà un entrepriseId
    const personnesLibresAvecOrgId = personnesLibresToFix.filter(p => 
      !personnesToFix.some(pf => pf.id === p.id)
    );
    
    if (personnesLibresAvecOrgId.length > 0) {
      console.log('\\n🏷️ MARQUAGE DES PERSONNES LIBRES...');
      
      for (let i = 0; i < personnesLibresAvecOrgId.length; i += 500) {
        const batch = writeBatch(db);
        const batchPersonnes = personnesLibresAvecOrgId.slice(i, i + 500);
        
        batchPersonnes.forEach(personne => {
          const personneRef = doc(db, 'personnes', personne.id);
          batch.update(personneRef, {
            isPersonneLibre: true,
            updatedAt: serverTimestamp(),
            updatedBy: currentUser.uid,
            _migrationNote: 'marquée comme personne libre par script de correction'
          });
        });
        
        await batch.commit();
        console.log('✅ Batch', Math.floor(i/500) + 1, 'terminé -', batchPersonnes.length, 'personnes marquées comme libres');
      }
    }
    
    // 3. Résumé final
    console.log('\\n✅ CORRECTION TERMINÉE !');
    console.log('- Structures corrigées:', structuresToFix.length);
    console.log('- Personnes corrigées:', personnesToFix.length);
    console.log('- Personnes marquées comme libres:', personnesLibresAvecOrgId.length);
    console.log('\\nTotal des corrections:', structuresToFix.length + personnesToFix.length + personnesLibresAvecOrgId.length);
    
    if (structuresToFix.length + personnesToFix.length > 0) {
      console.log('\\n💡 Rafraîchissez la page pour voir tous les contacts !');
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de la correction:', error);
  }
})();
`);

console.log('\n✅ Script généré ! Copiez le code ci-dessus et exécutez-le dans la console du navigateur.');