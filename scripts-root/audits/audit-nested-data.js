#!/usr/bin/env node

/**
 * Script d'audit complet pour identifier toutes les données imbriquées dans Firebase
 * et proposer une solution simple sans sur-ingénierie
 */

const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

// Initialiser Firebase Admin
const serviceAccount = require(path.join(__dirname, 'serviceAccount.json'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

/**
 * Analyser une collection pour détecter les structures imbriquées
 */
async function analyzeCollection(collectionName) {
  console.log(`\n📊 Analyse de la collection: ${collectionName}`);
  
  const snapshot = await db.collection(collectionName).limit(100).get();
  
  const stats = {
    total: 0,
    nested: 0,
    fields: new Set(),
    nestedFields: new Set(),
    examples: []
  };
  
  snapshot.forEach(doc => {
    stats.total++;
    const data = doc.data();
    
    // Analyser les champs
    Object.keys(data).forEach(key => {
      stats.fields.add(key);
      
      // Détecter les objets imbriqués (exclure les dates Firestore et arrays)
      if (data[key] && 
          typeof data[key] === 'object' && 
          !Array.isArray(data[key]) && 
          !data[key].toDate && // Pas une date Firestore
          !data[key]._seconds && // Pas un timestamp
          Object.keys(data[key]).length > 0) {
        
        stats.nestedFields.add(key);
        
        // Garder un exemple
        if (stats.examples.length < 3) {
          stats.examples.push({
            id: doc.id,
            field: key,
            structure: data[key]
          });
        }
      }
    });
    
    // Vérifier si le document a des structures imbriquées
    if (stats.nestedFields.size > 0 && stats.nested === 0) {
      stats.nested++;
    }
  });
  
  return stats;
}

/**
 * Analyser spécifiquement la collection contacts
 */
async function analyzeContactsInDetail() {
  console.log('\n🔍 Analyse détaillée de la collection contacts...');
  
  const snapshot = await db.collection('contacts').get();
  
  const issues = {
    nestedContact: [],
    nestedStructure: [],
    otherNested: [],
    total: snapshot.size
  };
  
  snapshot.forEach(doc => {
    const data = doc.data();
    
    // Vérifier contact imbriqué
    if (data.contact && typeof data.contact === 'object') {
      issues.nestedContact.push({
        id: doc.id,
        fields: Object.keys(data.contact),
        sample: {
          nom: data.contact.nom,
          prenom: data.contact.prenom,
          email: data.contact.email
        }
      });
    }
    
    // Vérifier structure imbriquée
    if (data.structure && typeof data.structure === 'object') {
      issues.nestedStructure.push({
        id: doc.id,
        fields: Object.keys(data.structure),
        sample: {
          raisonSociale: data.structure.raisonSociale,
          type: data.structure.type,
          ville: data.structure.ville
        }
      });
    }
    
    // Vérifier autres objets imbriqués suspects
    const suspectFields = ['adresse', 'structureInfo', 'personne', 'lieu'];
    suspectFields.forEach(field => {
      if (data[field] && typeof data[field] === 'object' && !Array.isArray(data[field])) {
        issues.otherNested.push({
          id: doc.id,
          field: field,
          structure: data[field]
        });
      }
    });
  });
  
  return issues;
}

/**
 * Générer un rapport et des recommandations
 */
function generateReport(collectionStats, contactsIssues) {
  console.log('\n' + '='.repeat(80));
  console.log('📋 RAPPORT D\'AUDIT DES DONNÉES IMBRIQUÉES');
  console.log('='.repeat(80));
  
  // Résumé par collection
  console.log('\n📊 RÉSUMÉ PAR COLLECTION:');
  Object.entries(collectionStats).forEach(([collection, stats]) => {
    console.log(`\n${collection}:`);
    console.log(`  - Documents analysés: ${stats.total}`);
    console.log(`  - Champs détectés: ${stats.fields.size}`);
    console.log(`  - Champs imbriqués: ${Array.from(stats.nestedFields).join(', ') || 'Aucun'}`);
    
    if (stats.examples.length > 0) {
      console.log('  - Exemples:');
      stats.examples.forEach(ex => {
        console.log(`    • Doc ${ex.id}, champ "${ex.field}":`, JSON.stringify(ex.structure, null, 2).split('\n').map(l => '      ' + l).join('\n'));
      });
    }
  });
  
  // Détails contacts
  console.log('\n🔍 DÉTAILS COLLECTION CONTACTS:');
  console.log(`  - Total des contacts: ${contactsIssues.total}`);
  console.log(`  - Contacts avec "contact: {}": ${contactsIssues.nestedContact.length}`);
  console.log(`  - Contacts avec "structure: {}": ${contactsIssues.nestedStructure.length}`);
  console.log(`  - Autres structures imbriquées: ${contactsIssues.otherNested.length}`);
  
  // Recommandations
  console.log('\n' + '='.repeat(80));
  console.log('💡 SOLUTION RECOMMANDÉE - APPROCHE SIMPLE ET PRAGMATIQUE');
  console.log('='.repeat(80));
  
  console.log('\n1️⃣ PRINCIPE: Adapter les données AU CHARGEMENT, pas à la sauvegarde');
  console.log('   - Ne PAS modifier les données dans Firebase');
  console.log('   - Adapter le format dans useUnifiedContact pour la compatibilité');
  console.log('   - Sauvegarder toujours en format PLAT');
  
  console.log('\n2️⃣ IMPLÉMENTATION:');
  console.log('   Dans useUnifiedContact.js:');
  console.log(`
   // Au lieu de créer un objet imbriqué:
   // ❌ MAUVAIS
   contactData = {
     structure: {
       raisonSociale: data.raisonSociale,
       type: data.type
     }
   };
   
   // ✅ BON - Garder la structure plate
   contactData = {
     structureRaisonSociale: data.raisonSociale,
     structureType: data.type,
     // ... autres champs avec préfixe
   };
  `);
  
  console.log('\n3️⃣ MIGRATION DES DONNÉES EXISTANTES:');
  console.log('   Script unique pour corriger les contacts mal formatés:');
  console.log('   - Aplatir contact: {} → nom, prenom, email...');
  console.log('   - Aplatir structure: {} → structureNom, structureType...');
  console.log('   - Exécuter une seule fois');
  
  console.log('\n4️⃣ PRÉVENTION:');
  console.log('   - Validation dans dataValidationService.js');
  console.log('   - Tests unitaires pour vérifier le format plat');
  console.log('   - Hook de pre-commit pour détecter les créations d\'objets imbriqués');
  
  console.log('\n5️⃣ AVANTAGES:');
  console.log('   ✅ Pas de sur-ingénierie');
  console.log('   ✅ Compatible avec l\'existant');
  console.log('   ✅ Performance optimale (pas de transformations complexes)');
  console.log('   ✅ Facile à maintenir');
  
  // Sauvegarder le rapport
  const reportPath = path.join(__dirname, 'audit-nested-data-report.json');
  fs.writeFileSync(reportPath, JSON.stringify({
    date: new Date().toISOString(),
    collections: collectionStats,
    contactsIssues: contactsIssues,
    recommendations: {
      approach: 'Adapter au chargement, sauvegarder plat',
      migration: contactsIssues.nestedContact.length + contactsIssues.nestedStructure.length > 0,
      preventionMeasures: ['validation', 'tests', 'pre-commit']
    }
  }, null, 2));
  
  console.log(`\n📄 Rapport complet sauvegardé dans: ${reportPath}`);
}

/**
 * Fonction principale
 */
async function main() {
  try {
    console.log('🚀 Démarrage de l\'audit des données imbriquées...');
    
    // Collections à analyser
    const collections = ['contacts', 'structures', 'personnes', 'lieux', 'concerts'];
    const collectionStats = {};
    
    // Analyser chaque collection
    for (const collection of collections) {
      try {
        collectionStats[collection] = await analyzeCollection(collection);
      } catch (error) {
        console.error(`❌ Erreur analyse ${collection}:`, error.message);
        collectionStats[collection] = { error: error.message };
      }
    }
    
    // Analyse détaillée des contacts
    const contactsIssues = await analyzeContactsInDetail();
    
    // Générer le rapport
    generateReport(collectionStats, contactsIssues);
    
    console.log('\n✅ Audit terminé avec succès!');
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'audit:', error);
    process.exit(1);
  }
  
  process.exit(0);
}

// Lancer l'audit
main();