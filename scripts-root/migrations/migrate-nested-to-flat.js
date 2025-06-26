#!/usr/bin/env node

/**
 * Script de migration pour aplatir TOUTES les structures imbriquées dans Firebase
 * 
 * Corrige:
 * - contact: {} → champs plats (nom, prenom, email...)
 * - structure: {} → champs avec préfixe (structureNom, structureType...)
 * - personne: {} → champs plats
 * - adresse: {} → champs avec préfixe si nécessaire
 */

const admin = require('firebase-admin');
const path = require('path');

// Initialiser Firebase Admin
const serviceAccount = require(path.join(__dirname, 'serviceAccount.json'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

/**
 * Aplatir un objet avec un préfixe
 */
function flattenWithPrefix(obj, prefix = '') {
  const result = {};
  
  if (!obj || typeof obj !== 'object') return result;
  
  Object.keys(obj).forEach(key => {
    const value = obj[key];
    const newKey = prefix ? `${prefix}${key.charAt(0).toUpperCase()}${key.slice(1)}` : key;
    
    // Ne pas aplatir les arrays, dates, ou null
    if (value && typeof value === 'object' && !Array.isArray(value) && !value.toDate && !value._seconds) {
      // Si c'est un objet, l'aplatir récursivement
      Object.assign(result, flattenWithPrefix(value, newKey));
    } else {
      result[newKey] = value;
    }
  });
  
  return result;
}

/**
 * Migrer une collection
 */
async function migrateCollection(collectionName) {
  console.log(`\n📊 Migration de la collection: ${collectionName}`);
  
  const snapshot = await db.collection(collectionName).get();
  
  let total = 0;
  let migrated = 0;
  let errors = 0;
  
  for (const doc of snapshot.docs) {
    total++;
    const data = doc.data();
    let needsMigration = false;
    let updates = {};
    let deletes = [];
    
    try {
      // Vérifier et aplatir 'contact'
      if (data.contact && typeof data.contact === 'object') {
        needsMigration = true;
        Object.assign(updates, data.contact);
        deletes.push('contact');
        console.log(`  📝 Document ${doc.id}: aplatissement de 'contact'`);
      }
      
      // Vérifier et aplatir 'structure' avec préfixe
      if (data.structure && typeof data.structure === 'object') {
        needsMigration = true;
        Object.assign(updates, flattenWithPrefix(data.structure, 'structure'));
        deletes.push('structure');
        console.log(`  📝 Document ${doc.id}: aplatissement de 'structure' avec préfixe`);
      }
      
      // Vérifier et aplatir 'personne'
      if (data.personne && typeof data.personne === 'object') {
        needsMigration = true;
        Object.assign(updates, data.personne);
        deletes.push('personne');
        console.log(`  📝 Document ${doc.id}: aplatissement de 'personne'`);
      }
      
      // Vérifier et aplatir 'adresse' si c'est un objet
      if (data.adresse && typeof data.adresse === 'object' && !Array.isArray(data.adresse)) {
        needsMigration = true;
        // Pour l'adresse, on peut soit l'aplatir, soit la convertir en string
        if (data.adresse.adresse || data.adresse.rue) {
          updates.adresse = data.adresse.adresse || data.adresse.rue || '';
          updates.adresseSuite = data.adresse.suite || '';
          updates.codePostal = data.adresse.codePostal || data.codePostal || '';
          updates.ville = data.adresse.ville || data.ville || '';
          updates.pays = data.adresse.pays || data.pays || '';
        }
        deletes.push('adresse');
        console.log(`  📝 Document ${doc.id}: aplatissement de 'adresse'`);
      }
      
      // Si migration nécessaire
      if (needsMigration) {
        // Ajouter les métadonnées
        updates.updatedAt = new Date();
        updates._migrated = true;
        updates._migrationDate = new Date();
        
        // Appliquer les mises à jour
        await doc.ref.update(updates);
        
        // Supprimer les champs imbriqués
        const deleteUpdates = {};
        deletes.forEach(field => {
          deleteUpdates[field] = admin.firestore.FieldValue.delete();
        });
        
        if (Object.keys(deleteUpdates).length > 0) {
          await doc.ref.update(deleteUpdates);
        }
        
        migrated++;
        console.log(`  ✅ Document ${doc.id} migré avec succès`);
      }
      
    } catch (error) {
      errors++;
      console.error(`  ❌ Erreur migration document ${doc.id}:`, error.message);
    }
  }
  
  return { total, migrated, errors };
}

/**
 * Vérifier les résultats après migration
 */
async function verifyMigration() {
  console.log('\n🔍 Vérification post-migration...');
  
  const collections = ['contacts', 'structures', 'personnes', 'lieux'];
  const issues = [];
  
  for (const collection of collections) {
    const snapshot = await db.collection(collection).limit(10).get();
    
    snapshot.forEach(doc => {
      const data = doc.data();
      
      // Vérifier qu'il n'y a plus d'objets imbriqués
      ['contact', 'structure', 'personne', 'lieu'].forEach(field => {
        if (data[field] && typeof data[field] === 'object' && !Array.isArray(data[field])) {
          issues.push({
            collection,
            documentId: doc.id,
            field,
            issue: 'Structure imbriquée encore présente'
          });
        }
      });
    });
  }
  
  return issues;
}

/**
 * Fonction principale
 */
async function main() {
  try {
    console.log('🚀 Démarrage de la migration des structures imbriquées...');
    console.log('   Cette migration va aplatir tous les objets imbriqués');
    console.log('   (contact: {}, structure: {}, personne: {}, etc.)');
    
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    rl.question('\n⚠️  Continuer avec la migration ? (o/n) ', async (answer) => {
      if (answer.toLowerCase() !== 'o' && answer.toLowerCase() !== 'oui') {
        console.log('❌ Migration annulée');
        rl.close();
        process.exit(0);
        return;
      }
      
      rl.close();
      
      // Collections à migrer
      const collections = ['contacts', 'structures', 'personnes', 'lieux', 'concerts'];
      const results = {};
      
      // Migrer chaque collection
      for (const collection of collections) {
        try {
          results[collection] = await migrateCollection(collection);
        } catch (error) {
          console.error(`❌ Erreur migration ${collection}:`, error);
          results[collection] = { error: error.message };
        }
      }
      
      // Afficher le résumé
      console.log('\n' + '='.repeat(60));
      console.log('📊 RÉSUMÉ DE LA MIGRATION');
      console.log('='.repeat(60));
      
      let totalMigrated = 0;
      let totalErrors = 0;
      
      Object.entries(results).forEach(([collection, result]) => {
        if (result.error) {
          console.log(`\n${collection}: ❌ Erreur - ${result.error}`);
        } else {
          console.log(`\n${collection}:`);
          console.log(`  - Documents analysés: ${result.total}`);
          console.log(`  - Documents migrés: ${result.migrated}`);
          console.log(`  - Erreurs: ${result.errors}`);
          
          totalMigrated += result.migrated || 0;
          totalErrors += result.errors || 0;
        }
      });
      
      console.log('\n' + '='.repeat(60));
      console.log(`TOTAL: ${totalMigrated} documents migrés, ${totalErrors} erreurs`);
      
      // Vérification
      const issues = await verifyMigration();
      
      if (issues.length > 0) {
        console.log('\n⚠️  Problèmes détectés après migration:');
        issues.forEach(issue => {
          console.log(`  - ${issue.collection}/${issue.documentId}: ${issue.issue} (${issue.field})`);
        });
      } else {
        console.log('\n✅ Vérification réussie - Aucune structure imbriquée détectée!');
      }
      
      console.log('\n✨ Migration terminée!');
      console.log('\n🎯 Prochaines étapes:');
      console.log('   1. Exécuter fix-unified-contact-nested.js pour corriger le code');
      console.log('   2. Tester l\'application pour vérifier que tout fonctionne');
      console.log('   3. Mettre à jour ContactViewTabs.js si nécessaire');
      
      process.exit(0);
    });
    
  } catch (error) {
    console.error('❌ Erreur fatale:', error);
    process.exit(1);
  }
}

// Lancer la migration
main();