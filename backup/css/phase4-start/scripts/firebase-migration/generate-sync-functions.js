/**
 * Script de génération des Cloud Functions pour la synchronisation des caches
 * 
 * Ce script génère des Cloud Functions qui maintiennent la cohérence des données
 * en cache lorsque les entités sources sont modifiées.
 * 
 * Utilisation: node generate-sync-functions.js [--output=functions/src/data-sync.js]
 */

// Configuration des relations qui nécessitent une synchronisation
const SYNC_RELATIONS = [
  {
    source: {
      collection: 'structures',
      fields: ['raisonSociale', 'type', 'ville', 'siren']
    },
    targets: [
      {
        collection: 'programmateurs',
        relationField: 'structureId',
        cacheField: 'structureCache'
      }
    ]
  },
  {
    source: {
      collection: 'lieux',
      fields: ['nom', 'ville', 'adresse', 'capacite']
    },
    targets: [
      {
        collection: 'concerts',
        relationField: 'lieuId',
        cacheField: 'lieuCache'
      }
    ]
  },
  {
    source: {
      collection: 'artistes',
      fields: ['nom', 'style', 'contact']
    },
    targets: [
      {
        collection: 'concerts',
        relationField: 'artisteId',
        cacheField: 'artisteCache'
      }
    ]
  },
  {
    source: {
      collection: 'concerts',
      fields: ['date', 'titre']
    },
    targets: [
      {
        collection: 'contrats',
        relationField: 'concertId',
        cacheField: 'concertCache'
      }
    ]
  },
  {
    source: {
      collection: 'programmateurs',
      fields: ['nom', 'prenom', 'email']
    },
    targets: [
      {
        collection: 'contrats',
        relationField: 'programmeurId',
        cacheField: 'programmeurCache'
      }
    ]
  }
];

// Obtenir le chemin de sortie depuis les arguments
const outputArg = process.argv.find(arg => arg.startsWith('--output='));
const outputPath = outputArg ? outputArg.split('=')[1] : 'functions/data-sync-functions.js';

const fs = require('fs');
const path = require('path');

// Générer le code des Cloud Functions
function generateCloudFunctions() {
  let code = `/**
 * Fonctions Cloud pour synchroniser les caches de données entre collections
 * Ce fichier est généré automatiquement par generate-sync-functions.js
 * Date de génération: ${new Date().toISOString()}
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Initialiser l'application Firebase Admin SDK
admin.initializeApp();

// Référence à Firestore
const db = admin.firestore();

/**
 * Utilitaire pour mettre à jour un lot de documents
 */
async function updateBatchDocuments(query, updateData) {
  const snapshot = await query.get();
  
  if (snapshot.empty) {
    console.log('Aucun document à mettre à jour');
    return 0;
  }

  const batch = db.batch();
  snapshot.docs.forEach(doc => {
    batch.update(doc.ref, updateData);
  });
  
  await batch.commit();
  return snapshot.size;
}

`;

  // Générer une fonction pour chaque relation
  SYNC_RELATIONS.forEach(relation => {
    const { source, targets } = relation;
    
    const functionName = `sync${capitalizeFirstLetter(source.collection)}Cache`;
    
    code += `
/**
 * Synchronise le cache pour un document ${source.collection}
 */
exports.${functionName} = functions.firestore
  .document('${source.collection}/{docId}')
  .onUpdate(async (change, context) => {
    const docId = context.params.docId;
    const afterData = change.after.data();
    
    // Vérifier si les champs concernés ont été modifiés
    const hasRelevantChanges = ${JSON.stringify(source.fields)}.some(field => 
      change.before.data()[field] !== afterData[field]
    );
    
    if (!hasRelevantChanges) {
      console.log(\`Aucun changement pertinent pour ${source.collection}/\${docId}\`);
      return null;
    }
    
    console.log(\`Mise à jour du cache pour ${source.collection}/\${docId}\`);
    
    // Extraire seulement les champs nécessaires pour le cache
    const cacheData = {};
    ${JSON.stringify(source.fields)}.forEach(field => {
      cacheData[field] = afterData[field];
    });
    
    // Mettre à jour toutes les collections qui référencent ce document
    const updatePromises = [];
`;
    
    // Pour chaque cible qui référence cette source
    targets.forEach(target => {
      code += `
    // Mise à jour pour ${target.collection}
    {
      const query = db.collection('${target.collection}')
                      .where('${target.relationField}', '==', docId);
                      
      const updateData = {
        '${target.cacheField}': cacheData
      };
      
      const updatePromise = updateBatchDocuments(query, updateData)
        .then(count => {
          console.log(\`Mis à jour ${target.cacheField} dans \${count} documents de ${target.collection}\`);
          return count;
        })
        .catch(error => {
          console.error(\`Erreur lors de la mise à jour de ${target.collection}:\`, error);
          return 0;
        });
        
      updatePromises.push(updatePromise);
    }
`;
    });
    
    code += `
    // Attendre la fin de toutes les mises à jour
    try {
      const results = await Promise.all(updatePromises);
      const totalUpdated = results.reduce((sum, count) => sum + count, 0);
      console.log(\`Total de \${totalUpdated} documents mis à jour pour ${source.collection}/\${docId}\`);
      return { success: true, totalUpdated };
    } catch (error) {
      console.error('Erreur lors de la synchronisation des caches:', error);
      return { success: false, error: error.message };
    }
  });
`;
  });
  
  return code;
}

/**
 * Utilitaire pour capitaliser la première lettre d'une chaîne
 */
function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

/**
 * Écrit le code généré dans un fichier
 */
function writeToFile(code, filePath) {
  try {
    // Créer le répertoire s'il n'existe pas
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // Écrire le fichier
    fs.writeFileSync(filePath, code);
    console.log(`Cloud Functions générées et écrites dans: ${filePath}`);
    
    // Afficher un exemple d'utilisation
    console.log(`
Pour déployer ces fonctions:
1. Assurez-vous que Firebase CLI est installé: npm install -g firebase-tools
2. Allez dans le dossier des fonctions: cd functions
3. Installez les dépendances: npm install
4. Déployez les fonctions: firebase deploy --only functions
`);
    
    return true;
  } catch (error) {
    console.error('Erreur lors de l\'écriture du fichier:', error);
    return false;
  }
}

// Exécuter la génération
const generatedCode = generateCloudFunctions();
writeToFile(generatedCode, outputPath);