const admin = require('firebase-admin');
const { readFileSync } = require('fs');
const path = require('path');

// Configuration Firebase Admin SDK
if (!admin.apps.length) {
  // En mode émulateur ou local, utiliser des credentials factices
  if (process.env.NODE_ENV === 'development' || process.env.REACT_APP_MODE === 'local') {
    process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
    admin.initializeApp({
      projectId: 'demo-project',
      credential: admin.credential.applicationDefault()
    });
    console.log('🔧 Configuration Firebase Admin (mode émulateur)');
  } else {
    // En production, utiliser les vraies credentials
    admin.initializeApp();
    console.log('🔧 Configuration Firebase Admin (mode production)');
  }
}

const db = admin.firestore();

/**
 * Script de migration : Programmateurs → Contacts
 * 
 * 1. Lit tous les documents de la collection 'programmateurs'
 * 2. Les copie dans la collection 'contacts' 
 * 3. Met à jour les références dans les autres collections (concerts, lieux, etc.)
 * 4. Supprime l'ancienne collection 'programmateurs'
 */

async function migrateProgrammateursToContacts() {
  console.log('🚀 Début de la migration Programmateurs → Contacts');
  console.log('==================================================');

  try {
    // Étape 1: Lire tous les programmateurs
    console.log('📖 Étape 1: Lecture des programmateurs...');
    const programmateurSnapshot = await db.collection('programmateurs').get();
    
    if (programmateurSnapshot.empty) {
      console.log('⚠️  Aucun programmateur trouvé dans la base');
      return;
    }

    console.log(`📊 Trouvé ${programmateurSnapshot.size} programmateur(s)`);
    
    const programmateurs = [];
    const migrationMap = new Map(); // oldId → newId
    
    programmateurSnapshot.forEach(doc => {
      const data = doc.data();
      programmateurs.push({
        oldId: doc.id,
        data: data
      });
    });

    // Étape 2: Créer les contacts
    console.log('📝 Étape 2: Création des contacts...');
    const batch = db.batch();
    
    for (const prog of programmateurs) {
      // Créer un nouveau document contact avec un nouvel ID
      const newContactRef = db.collection('contacts').doc();
      migrationMap.set(prog.oldId, newContactRef.id);
      
      // Nettoyer les données (enlever les champs spécifiques aux programmateurs si nécessaire)
      const contactData = {
        ...prog.data,
        // Ajouter un timestamp de migration
        migratedAt: admin.firestore.FieldValue.serverTimestamp(),
        migratedFrom: 'programmateurs'
      };
      
      batch.set(newContactRef, contactData);
      console.log(`  ✅ ${prog.data.nom || 'Sans nom'} (${prog.oldId} → ${newContactRef.id})`);
    }

    await batch.commit();
    console.log(`✅ ${programmateurs.length} contact(s) créé(s)`);

    // Étape 3: Mettre à jour les références dans les concerts
    console.log('🔄 Étape 3: Mise à jour des références dans les concerts...');
    const concertSnapshot = await db.collection('concerts').get();
    
    if (!concertSnapshot.empty) {
      const concertBatch = db.batch();
      let concertsUpdated = 0;
      
      concertSnapshot.forEach(doc => {
        const data = doc.data();
        let needsUpdate = false;
        const updates = {};
        
        // Mettre à jour programmateurId → contactId
        if (data.programmateurId && migrationMap.has(data.programmateurId)) {
          updates.contactId = migrationMap.get(data.programmateurId);
          updates.programmateurId = admin.firestore.FieldValue.delete(); // Supprimer l'ancien champ
          needsUpdate = true;
        }
        
        // Mettre à jour les références dans les arrays s'il y en a
        if (data.programmateurIds && Array.isArray(data.programmateurIds)) {
          updates.contactIds = data.programmateurIds.map(id => 
            migrationMap.has(id) ? migrationMap.get(id) : id
          );
          updates.programmateurIds = admin.firestore.FieldValue.delete();
          needsUpdate = true;
        }
        
        if (needsUpdate) {
          concertBatch.update(doc.ref, updates);
          concertsUpdated++;
        }
      });
      
      await concertBatch.commit();
      console.log(`✅ ${concertsUpdated} concert(s) mis à jour`);
    }

    // Étape 4: Mettre à jour les références dans les lieux
    console.log('🔄 Étape 4: Mise à jour des références dans les lieux...');
    const lieuxSnapshot = await db.collection('lieux').get();
    
    if (!lieuxSnapshot.empty) {
      const lieuxBatch = db.batch();
      let lieuxUpdated = 0;
      
      lieuxSnapshot.forEach(doc => {
        const data = doc.data();
        let needsUpdate = false;
        const updates = {};
        
        // Mettre à jour programmateurIds → contactIds
        if (data.programmateurIds && Array.isArray(data.programmateurIds)) {
          updates.contactIds = data.programmateurIds.map(id => 
            migrationMap.has(id) ? migrationMap.get(id) : id
          );
          updates.programmateurIds = admin.firestore.FieldValue.delete();
          needsUpdate = true;
        }
        
        if (needsUpdate) {
          lieuxBatch.update(doc.ref, updates);
          lieuxUpdated++;
        }
      });
      
      await lieuxBatch.commit();
      console.log(`✅ ${lieuxUpdated} lieu(x) mis à jour`);
    }

    // Étape 5: Supprimer l'ancienne collection programmateurs
    console.log('🗑️  Étape 5: Suppression des anciens programmateurs...');
    const deletePromises = programmateurs.map(prog => 
      db.collection('programmateurs').doc(prog.oldId).delete()
    );
    
    await Promise.all(deletePromises);
    console.log(`✅ ${programmateurs.length} programmateur(s) supprimé(s)`);

    // Résumé
    console.log('');
    console.log('🎉 MIGRATION TERMINÉE AVEC SUCCÈS !');
    console.log('====================================');
    console.log(`📊 Contacts créés: ${programmateurs.length}`);
    console.log(`🔄 Concerts mis à jour: ${concertsUpdated || 0}`);
    console.log(`🏠 Lieux mis à jour: ${lieuxUpdated || 0}`);
    console.log('');
    console.log('🎯 Mapping des IDs:');
    migrationMap.forEach((newId, oldId) => {
      const prog = programmateurs.find(p => p.oldId === oldId);
      console.log(`  ${prog?.data?.nom || 'Sans nom'}: ${oldId} → ${newId}`);
    });

  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
    throw error;
  }
}

// Exécuter la migration si le script est appelé directement
if (require.main === module) {
  migrateProgrammateursToContacts()
    .then(() => {
      console.log('\n✅ Migration terminée avec succès');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Migration échouée:', error);
      process.exit(1);
    });
}

module.exports = { migrateProgrammateursToContacts };