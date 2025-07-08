#!/usr/bin/env node

/**
 * Script pour créer automatiquement les index Firestore via l'API
 * Nécessite le Firebase Admin SDK
 */

// Charger les variables d'environnement
require('dotenv').config({ path: '.env.local' });

const { initializeApp } = require('firebase/app');
const { getFirestore } = require('firebase/firestore');

// Configuration Firebase
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

console.log('📋 CRÉATION DES INDEX FIRESTORE');
console.log('================================\n');

// Définition des index à créer
const indexes = [
  // Collection "structures"
  {
    collectionGroup: 'structures',
    fields: [
      { fieldPath: 'organizationId', mode: 'ASCENDING' },
      { fieldPath: 'raisonSociale', mode: 'ASCENDING' }
    ]
  },
  {
    collectionGroup: 'structures',
    fields: [
      { fieldPath: 'organizationId', mode: 'ASCENDING' },
      { fieldPath: 'isClient', mode: 'ASCENDING' }
    ]
  },
  {
    collectionGroup: 'structures',
    fields: [
      { fieldPath: 'organizationId', mode: 'ASCENDING' },
      { fieldPath: 'tags', arrayConfig: 'CONTAINS' }
    ]
  },
  {
    collectionGroup: 'structures',
    fields: [
      { fieldPath: 'organizationId', mode: 'ASCENDING' },
      { fieldPath: 'createdAt', mode: 'DESCENDING' }
    ]
  },
  
  // Collection "personnes"
  {
    collectionGroup: 'personnes',
    fields: [
      { fieldPath: 'organizationId', mode: 'ASCENDING' },
      { fieldPath: 'email', mode: 'ASCENDING' }
    ]
  },
  {
    collectionGroup: 'personnes',
    fields: [
      { fieldPath: 'organizationId', mode: 'ASCENDING' },
      { fieldPath: 'nom', mode: 'ASCENDING' },
      { fieldPath: 'prenom', mode: 'ASCENDING' }
    ]
  },
  {
    collectionGroup: 'personnes',
    fields: [
      { fieldPath: 'organizationId', mode: 'ASCENDING' },
      { fieldPath: 'isPersonneLibre', mode: 'ASCENDING' }
    ]
  },
  {
    collectionGroup: 'personnes',
    fields: [
      { fieldPath: 'organizationId', mode: 'ASCENDING' },
      { fieldPath: 'tags', arrayConfig: 'CONTAINS' }
    ]
  },
  
  // Collection "liaisons"
  {
    collectionGroup: 'liaisons',
    fields: [
      { fieldPath: 'organizationId', mode: 'ASCENDING' },
      { fieldPath: 'structureId', mode: 'ASCENDING' },
      { fieldPath: 'personneId', mode: 'ASCENDING' }
    ]
  },
  {
    collectionGroup: 'liaisons',
    fields: [
      { fieldPath: 'organizationId', mode: 'ASCENDING' },
      { fieldPath: 'actif', mode: 'ASCENDING' }
    ]
  },
  {
    collectionGroup: 'liaisons',
    fields: [
      { fieldPath: 'organizationId', mode: 'ASCENDING' },
      { fieldPath: 'prioritaire', mode: 'ASCENDING' }
    ]
  },
  {
    collectionGroup: 'liaisons',
    fields: [
      { fieldPath: 'structureId', mode: 'ASCENDING' },
      { fieldPath: 'actif', mode: 'ASCENDING' },
      { fieldPath: 'prioritaire', mode: 'DESCENDING' }
    ]
  },
  {
    collectionGroup: 'liaisons',
    fields: [
      { fieldPath: 'personneId', mode: 'ASCENDING' },
      { fieldPath: 'actif', mode: 'ASCENDING' },
      { fieldPath: 'dateDebut', mode: 'DESCENDING' }
    ]
  },
  
  // Collection "qualifications"
  {
    collectionGroup: 'qualifications',
    fields: [
      { fieldPath: 'organizationId', mode: 'ASCENDING' },
      { fieldPath: 'parentId', mode: 'ASCENDING' },
      { fieldPath: 'ordre', mode: 'ASCENDING' }
    ]
  },
  {
    collectionGroup: 'qualifications',
    fields: [
      { fieldPath: 'organizationId', mode: 'ASCENDING' },
      { fieldPath: 'type', mode: 'ASCENDING' },
      { fieldPath: 'actif', mode: 'ASCENDING' }
    ]
  }
];

/**
 * Créer un fichier de configuration des index pour déploiement manuel
 */
function generateIndexesConfig() {
  const indexesConfig = {
    indexes: indexes.map(index => {
      const config = {
        collectionGroup: index.collectionGroup,
        queryScope: 'COLLECTION',
        fields: index.fields.map(field => {
          if (field.arrayConfig) {
            return {
              fieldPath: field.fieldPath,
              arrayConfig: field.arrayConfig
            };
          } else {
            return {
              fieldPath: field.fieldPath,
              order: field.mode
            };
          }
        })
      };
      return config;
    }),
    fieldOverrides: []
  };

  return indexesConfig;
}

/**
 * Générer le fichier firestore.indexes.json
 */
const fs = require('fs');
const path = require('path');

async function main() {
  try {
    console.log('📝 Génération du fichier de configuration des index...\n');
    
    const indexesConfig = generateIndexesConfig();
    const configPath = path.join(process.cwd(), 'firestore.indexes.json');
    
    fs.writeFileSync(configPath, JSON.stringify(indexesConfig, null, 2));
    
    console.log(`✅ Fichier créé: ${configPath}\n`);
    
    console.log('📋 Pour déployer les index, exécutez:');
    console.log('   firebase deploy --only firestore:indexes\n');
    
    console.log('Ou si vous n\'avez pas Firebase CLI:');
    console.log('   npm install -g firebase-tools');
    console.log('   firebase login');
    console.log('   firebase deploy --only firestore:indexes\n');
    
    console.log('📌 Alternative: Créez les index manuellement dans la console:');
    console.log(`   https://console.firebase.google.com/project/${firebaseConfig.projectId}/firestore/indexes\n`);
    
    console.log('Index à créer:');
    indexes.forEach((index, i) => {
      console.log(`\n${i + 1}. Collection "${index.collectionGroup}":`);
      index.fields.forEach(field => {
        if (field.arrayConfig) {
          console.log(`   - ${field.fieldPath} (${field.arrayConfig})`);
        } else {
          console.log(`   - ${field.fieldPath} (${field.mode})`);
        }
      });
    });
    
    console.log('\n✨ Configuration terminée!');
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

main();