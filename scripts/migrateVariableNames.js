// Script de migration des noms de variables dans Firebase
// À exécuter une seule fois pour migrer toutes les données existantes

const admin = require('firebase-admin');
const serviceAccount = require('./path-to-your-service-account-key.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function migrateDates() {
  console.log('🔄 Migration des dates...');
  const snapshot = await db.collection('dates').get();
  
  const batch = db.batch();
  let count = 0;
  
  snapshot.forEach(doc => {
    const data = doc.data();
    const updates = {};
    
    // Migrer organisateurId → structureId
    if (data.organisateurId && !data.structureId) {
      updates.structureId = data.organisateurId;
      updates.organisateurId = admin.firestore.FieldValue.delete();
    }
    
    // Migrer organisateurNom → structureNom
    if (data.organisateurNom && !data.structureNom) {
      updates.structureNom = data.organisateurNom;
      updates.organisateurNom = admin.firestore.FieldValue.delete();
    }
    
    // Migrer montantPropose → montant
    if (data.montantPropose && !data.montant) {
      updates.montant = data.montantPropose;
      updates.montantPropose = admin.firestore.FieldValue.delete();
    }
    
    // Migrer status → statut
    if (data.status && !data.statut) {
      updates.statut = data.status;
      updates.status = admin.firestore.FieldValue.delete();
    }
    
    // Migrer createdBy → creePar
    if (data.createdBy && !data.creePar) {
      updates.creePar = data.createdBy;
      updates.createdBy = admin.firestore.FieldValue.delete();
    }
    
    // Migrer createdAt → dateCreation
    if (data.createdAt && !data.dateCreation) {
      updates.dateCreation = data.createdAt;
      updates.createdAt = admin.firestore.FieldValue.delete();
    }
    
    if (Object.keys(updates).length > 0) {
      batch.update(doc.ref, updates);
      count++;
    }
  });
  
  await batch.commit();
  console.log(`✅ ${count} dates migrées`);
}

async function migrateFormulaires() {
  console.log('🔄 Migration des formulaires...');
  const snapshot = await db.collection('formulaires').get();
  
  const batch = db.batch();
  let count = 0;
  
  snapshot.forEach(doc => {
    const data = doc.data();
    const updates = {};
    
    // Migrer les champs dans publicFormData si présent
    if (data.publicFormData) {
      const publicUpdates = {};
      
      if (data.publicFormData.montantHT && !data.publicFormData.montant) {
        publicUpdates.montant = data.publicFormData.montantHT;
      }
      
      if (data.publicFormData.cp && !data.publicFormData.codePostal) {
        publicUpdates.codePostal = data.publicFormData.cp;
      }
      
      if (Object.keys(publicUpdates).length > 0) {
        updates.publicFormData = {
          ...data.publicFormData,
          ...publicUpdates
        };
      }
    }
    
    if (Object.keys(updates).length > 0) {
      batch.update(doc.ref, updates);
      count++;
    }
  });
  
  await batch.commit();
  console.log(`✅ ${count} formulaires migrés`);
}

async function migrateStructures() {
  console.log('🔄 Migration des structures...');
  const snapshot = await db.collection('structures').get();
  
  const batch = db.batch();
  let count = 0;
  
  snapshot.forEach(doc => {
    const data = doc.data();
    const updates = {};
    
    // Migrer cp → codePostal
    if (data.cp && !data.codePostal) {
      updates.codePostal = data.cp;
      updates.cp = admin.firestore.FieldValue.delete();
    }
    
    // Migrer tel → telephone
    if (data.tel && !data.telephone) {
      updates.telephone = data.tel;
      updates.tel = admin.firestore.FieldValue.delete();
    }
    
    if (Object.keys(updates).length > 0) {
      batch.update(doc.ref, updates);
      count++;
    }
  });
  
  await batch.commit();
  console.log(`✅ ${count} structures migrées`);
}

async function runMigration() {
  try {
    console.log('🚀 Début de la migration...');
    
    await migrateDates();
    await migrateFormulaires();
    await migrateStructures();
    
    console.log('✅ Migration terminée avec succès !');
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
  }
}

// Exécuter la migration
runMigration();