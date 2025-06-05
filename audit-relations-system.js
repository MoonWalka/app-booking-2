#!/usr/bin/env node

/**
 * Script d'audit complet du système de relations entre entités
 * Analyse la structure des données Firebase et les problèmes de relations
 */

const fs = require('fs');
const path = require('path');

// Charger les variables d'environnement depuis .env.local
require('./scripts/firebase-migration/load-env')();

// Importer directement les éléments de Firebase
const { initializeApp } = require('firebase/app');
const { 
  getFirestore, collection, getDocs, doc, getDoc,
  query, limit, where 
} = require('firebase/firestore');

// Configuration Firebase à partir des variables d'environnement
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/**
 * Analyse une collection et ses relations
 */
async function analyzeCollection(collectionName, sampleSize = 5) {
  console.log(`\n🔍 Analyse de la collection: ${collectionName}`);
  console.log('='.repeat(60));

  try {
    const collectionRef = collection(db, collectionName);
    const q = query(collectionRef, limit(sampleSize));
    const snapshot = await getDocs(q);
    
    if (snapshot.size === 0) {
      console.log(`❌ Collection ${collectionName} est vide`);
      return {
        name: collectionName,
        totalCount: 0,
        sampleAnalysis: [],
        relationFields: [],
        problems: ['Collection vide']
      };
    }

    console.log(`📊 Total documents échantillonnés: ${snapshot.size}`);
    
    // Analyse des champs de relations
    const relationFields = new Set();
    const sampleAnalysis = [];
    const fieldTypes = {};
    
    snapshot.forEach(doc => {
      const data = doc.data();
      const docAnalysis = {
        id: doc.id,
        fieldsCount: Object.keys(data).length,
        relationFields: {},
        hasProblems: false,
        problems: []
      };

      // Analyser chaque champ
      Object.entries(data).forEach(([field, value]) => {
        // Détecter les champs de relations potentiels
        if (field.includes('Id') || field.includes('Ids') || 
            field.includes('Associe') || field.includes('Association') ||
            field === 'contacts' || field === 'lieux' || field === 'concerts' || 
            field === 'artistes' || field === 'structures') {
          
          relationFields.add(field);
          
          const relationAnalysis = {
            field,
            type: Array.isArray(value) ? 'array' : typeof value,
            value: value,
            isEmpty: !value || (Array.isArray(value) && value.length === 0),
            count: Array.isArray(value) ? value.length : (value ? 1 : 0)
          };

          docAnalysis.relationFields[field] = relationAnalysis;

          // Détecter les problèmes
          if (relationAnalysis.isEmpty) {
            docAnalysis.problems.push(`Champ ${field} vide`);
            docAnalysis.hasProblems = true;
          }

          if (Array.isArray(value) && value.length > 0) {
            // Vérifier la consistance des éléments dans les arrays
            const types = [...new Set(value.map(v => typeof v))];
            if (types.length > 1) {
              docAnalysis.problems.push(`Array ${field} contient des types mixtes: ${types.join(', ')}`);
              docAnalysis.hasProblems = true;
            }

            // Vérifier les objets avec des IDs
            value.forEach((item, index) => {
              if (typeof item === 'object' && item !== null) {
                if (!item.id && !item.objectId && !item._id) {
                  docAnalysis.problems.push(`Objet dans ${field}[${index}] sans ID`);
                  docAnalysis.hasProblems = true;
                }
              }
            });
          }
        }

        // Statistiques des types de champs
        const fieldType = Array.isArray(value) ? 'array' : typeof value;
        fieldTypes[field] = fieldTypes[field] || {};
        fieldTypes[field][fieldType] = (fieldTypes[field][fieldType] || 0) + 1;
      });

      sampleAnalysis.push(docAnalysis);
    });

    console.log(`\n📋 Champs de relations détectés:`);
    [...relationFields].forEach(field => {
      console.log(`  - ${field}`);
    });

    console.log(`\n⚠️  Documents avec problèmes:`);
    const docsWithProblems = sampleAnalysis.filter(doc => doc.hasProblems);
    console.log(`  ${docsWithProblems.length}/${sampleAnalysis.length} documents ont des problèmes`);
    
    docsWithProblems.forEach(doc => {
      console.log(`  📄 ${doc.id}:`);
      doc.problems.forEach(problem => {
        console.log(`    - ${problem}`);
      });
    });

    return {
      name: collectionName,
      totalCount: snapshot.size,
      sampleAnalysis,
      relationFields: [...relationFields],
      fieldTypes,
      problems: docsWithProblems.map(doc => ({
        id: doc.id,
        problems: doc.problems
      }))
    };

  } catch (error) {
    console.error(`❌ Erreur lors de l'analyse de ${collectionName}:`, error);
    return {
      name: collectionName,
      error: error.message,
      problems: [`Erreur d'accès: ${error.message}`]
    };
  }
}

/**
 * Vérifie la cohérence des relations bidirectionnelles
 */
async function checkBidirectionalConsistency(sourceCollection, sourceField, targetCollection, targetField, sampleSize = 10) {
  console.log(`\n🔗 Vérification relation bidirectionnelle:`);
  console.log(`   ${sourceCollection}.${sourceField} <-> ${targetCollection}.${targetField}`);
  
  try {
    const sourceCollectionRef = collection(db, sourceCollection);
    const sourceQuery = query(sourceCollectionRef, limit(sampleSize));
    const sourceSnapshot = await getDocs(sourceQuery);
    const inconsistencies = [];
    
    for (const sourceDoc of sourceSnapshot.docs) {
      const sourceData = sourceDoc.data();
      const sourceRelations = sourceData[sourceField];
      
      if (!sourceRelations) continue;
      
      const relationsToCheck = Array.isArray(sourceRelations) ? sourceRelations : [sourceRelations];
      
      for (const relationId of relationsToCheck) {
        if (!relationId) continue;
        
        try {
          const targetDocRef = doc(db, targetCollection, relationId);
          const targetDoc = await getDoc(targetDocRef);
          
          if (!targetDoc.exists()) {
            inconsistencies.push({
              source: sourceDoc.id,
              target: relationId,
              problem: `Document cible ${relationId} n'existe pas dans ${targetCollection}`
            });
            continue;
          }
          
          const targetData = targetDoc.data();
          const reverseRelations = targetData[targetField];
          
          if (!reverseRelations) {
            inconsistencies.push({
              source: sourceDoc.id,
              target: relationId,
              problem: `Champ ${targetField} manquant dans le document cible`
            });
            continue;
          }
          
          const reverseRelationsArray = Array.isArray(reverseRelations) ? reverseRelations : [reverseRelations];
          
          if (!reverseRelationsArray.includes(sourceDoc.id)) {
            inconsistencies.push({
              source: sourceDoc.id,
              target: relationId,
              problem: `Relation inverse manquante: ${targetCollection}/${relationId}.${targetField} ne contient pas ${sourceDoc.id}`
            });
          }
          
        } catch (error) {
          inconsistencies.push({
            source: sourceDoc.id,
            target: relationId,
            problem: `Erreur lors de la vérification: ${error.message}`
          });
        }
      }
    }
    
    console.log(`   ✅ Relations vérifiées: ${sourceSnapshot.size} documents`);
    console.log(`   ❌ Incohérences trouvées: ${inconsistencies.length}`);
    
    if (inconsistencies.length > 0) {
      console.log(`\n   📋 Détail des incohérences:`);
      inconsistencies.forEach(inc => {
        console.log(`     ${inc.source} -> ${inc.target}: ${inc.problem}`);
      });
    }
    
    return {
      sourceCollection,
      sourceField,
      targetCollection,
      targetField,
      checkedDocuments: sourceSnapshot.size,
      inconsistencies
    };
    
  } catch (error) {
    console.error(`❌ Erreur lors de la vérification bidirectionnelle:`, error);
    return {
      sourceCollection,
      sourceField,
      targetCollection,
      targetField,
      error: error.message
    };
  }
}

/**
 * Analyse les formats de données différents dans une collection
 */
async function analyzeDataFormats(collectionName, sampleSize = 20) {
  console.log(`\n📊 Analyse des formats de données: ${collectionName}`);
  
  try {
    const collectionRef = collection(db, collectionName);
    const q = query(collectionRef, limit(sampleSize));
    const snapshot = await getDocs(q);
    const formatAnalysis = {};
    
    snapshot.forEach(doc => {
      const data = doc.data();
      
      Object.entries(data).forEach(([field, value]) => {
        if (!formatAnalysis[field]) {
          formatAnalysis[field] = {
            formats: {},
            examples: {},
            totalDocuments: 0
          };
        }
        
        formatAnalysis[field].totalDocuments++;
        
        let format;
        if (value === null || value === undefined) {
          format = 'null_undefined';
        } else if (Array.isArray(value)) {
          if (value.length === 0) {
            format = 'empty_array';
          } else {
            const firstItem = value[0];
            if (typeof firstItem === 'string') {
              format = 'array_of_strings';
            } else if (typeof firstItem === 'object' && firstItem.id) {
              format = 'array_of_objects_with_id';
            } else if (typeof firstItem === 'object') {
              format = 'array_of_objects';
            } else {
              format = `array_of_${typeof firstItem}`;
            }
          }
        } else if (typeof value === 'object') {
          if (value.id) {
            format = 'object_with_id';
          } else {
            format = 'object';
          }
        } else {
          format = typeof value;
        }
        
        formatAnalysis[field].formats[format] = (formatAnalysis[field].formats[format] || 0) + 1;
        
        // Garder des exemples
        if (!formatAnalysis[field].examples[format]) {
          formatAnalysis[field].examples[format] = value;
        }
      });
    });
    
    console.log(`\n   📋 Formats détectés par champ:`);
    Object.entries(formatAnalysis).forEach(([field, analysis]) => {
      const formats = Object.entries(analysis.formats);
      if (formats.length > 1) {
        console.log(`\n   ⚠️  ${field} (formats multiples):`);
        formats.forEach(([format, count]) => {
          const percentage = ((count / analysis.totalDocuments) * 100).toFixed(1);
          console.log(`     - ${format}: ${count}/${analysis.totalDocuments} (${percentage}%)`);
          
          // Afficher un exemple
          const example = analysis.examples[format];
          if (example !== null && example !== undefined) {
            const exampleStr = JSON.stringify(example).substring(0, 100);
            console.log(`       Exemple: ${exampleStr}${exampleStr.length === 100 ? '...' : ''}`);
          }
        });
      }
    });
    
    return formatAnalysis;
    
  } catch (error) {
    console.error(`❌ Erreur lors de l'analyse des formats:`, error);
    return null;
  }
}

/**
 * Génère un rapport détaillé
 */
async function generateReport() {
  console.log('🚀 AUDIT COMPLET DU SYSTÈME DE RELATIONS TOURCRAFT');
  console.log('='.repeat(80));
  
  const report = {
    timestamp: new Date().toISOString(),
    collections: {},
    bidirectionalChecks: [],
    formatAnalysis: {},
    summary: {
      totalProblems: 0,
      criticalIssues: [],
      recommendations: []
    }
  };
  
  // 1. Analyser chaque collection principale
  const collections = ['concerts', 'structures', 'lieux', 'contacts', 'artistes'];
  
  for (const collection of collections) {
    console.log(`\n${'='.repeat(20)} ${collection.toUpperCase()} ${'='.repeat(20)}`);
    report.collections[collection] = await analyzeCollection(collection, 10);
    report.formatAnalysis[collection] = await analyzeDataFormats(collection, 20);
  }
  
  // 2. Vérifier les relations bidirectionnelles critiques
  const bidirectionalRelations = [
    // Concerts <-> Lieux
    { source: 'concerts', sourceField: 'lieuId', target: 'lieux', targetField: 'concertsIds' },
    // Concerts <-> Contacts
    { source: 'concerts', sourceField: 'contactId', target: 'contacts', targetField: 'concertsIds' },
    // Concerts <-> Structures
    { source: 'concerts', sourceField: 'structureId', target: 'structures', targetField: 'concertsIds' },
    // Contacts <-> Structures
    { source: 'contacts', sourceField: 'structureId', target: 'structures', targetField: 'contactsIds' },
    // Contacts <-> Lieux
    { source: 'contacts', sourceField: 'lieuxIds', target: 'lieux', targetField: 'contactIds' },
  ];
  
  console.log(`\n${'='.repeat(20)} RELATIONS BIDIRECTIONNELLES ${'='.repeat(20)}`);
  
  for (const relation of bidirectionalRelations) {
    const result = await checkBidirectionalConsistency(
      relation.source,
      relation.sourceField,
      relation.target,
      relation.targetField,
      5
    );
    report.bidirectionalChecks.push(result);
  }
  
  // 3. Générer le résumé et les recommandations
  console.log(`\n${'='.repeat(20)} RÉSUMÉ ET RECOMMANDATIONS ${'='.repeat(20)}`);
  
  let totalProblems = 0;
  const criticalIssues = [];
  const recommendations = [];
  
  // Analyser les problèmes par collection
  Object.entries(report.collections).forEach(([collectionName, analysis]) => {
    if (analysis.problems) {
      totalProblems += analysis.problems.length;
      
      if (analysis.problems.length > 0) {
        criticalIssues.push(`${collectionName}: ${analysis.problems.length} documents avec problèmes`);
      }
    }
  });
  
  // Analyser les incohérences bidirectionnelles
  report.bidirectionalChecks.forEach(check => {
    if (check.inconsistencies && check.inconsistencies.length > 0) {
      totalProblems += check.inconsistencies.length;
      criticalIssues.push(`Relation ${check.sourceCollection}->${check.targetCollection}: ${check.inconsistencies.length} incohérences`);
      
      if (check.inconsistencies.length > 2) {
        recommendations.push(`Audit approfondi de la relation ${check.sourceCollection}.${check.sourceField} <-> ${check.targetCollection}.${check.targetField}`);
      }
    }
  });
  
  // Analyser les formats incohérents
  Object.entries(report.formatAnalysis).forEach(([collectionName, analysis]) => {
    if (!analysis) return;
    
    Object.entries(analysis).forEach(([field, fieldAnalysis]) => {
      const formatCount = Object.keys(fieldAnalysis.formats).length;
      if (formatCount > 2) {
        criticalIssues.push(`${collectionName}.${field}: ${formatCount} formats différents`);
        recommendations.push(`Standardiser le format du champ ${collectionName}.${field}`);
      }
    });
  });
  
  // Recommandations générales
  if (totalProblems > 10) {
    recommendations.push('Migration de données recommandée pour corriger les incohérences');
  }
  
  if (criticalIssues.length > 5) {
    recommendations.push('Audit complet des relations bidirectionnelles requis');
  }
  
  recommendations.push('Implémentation de validations strictes pour les nouvelles données');
  recommendations.push('Mise en place de tests automatisés pour les relations');
  
  report.summary = {
    totalProblems,
    criticalIssues,
    recommendations
  };
  
  console.log(`\n📊 RÉSUMÉ FINAL:`);
  console.log(`   Problèmes détectés: ${totalProblems}`);
  console.log(`   Issues critiques: ${criticalIssues.length}`);
  console.log(`\n⚠️  ISSUES CRITIQUES:`);
  criticalIssues.forEach(issue => console.log(`   - ${issue}`));
  console.log(`\n💡 RECOMMANDATIONS:`);
  recommendations.forEach(rec => console.log(`   - ${rec}`));
  
  // Sauvegarder le rapport
  const reportPath = path.join(__dirname, 'rapport-audit-relations.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n📄 Rapport sauvegardé: ${reportPath}`);
  
  return report;
}

// Exécuter l'audit
if (require.main === module) {
  generateReport()
    .then(() => {
      console.log('\n✅ Audit terminé avec succès');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Erreur lors de l\'audit:', error);
      process.exit(1);
    });
}

module.exports = { generateReport, analyzeCollection, checkBidirectionalConsistency };