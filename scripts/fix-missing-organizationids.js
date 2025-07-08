#!/usr/bin/env node

/**
 * Script pour ajouter entrepriseId aux documents qui n'en ont pas
 * Utilise l'API REST Firestore pour éviter les dépendances
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Configuration
const PROJECT_ID = 'tourcraft-bb3eb';
const DEFAULT_ENTREPRISE_ID = 'default-org'; // À remplacer par l'ID réel

// Charger la clé API depuis le fichier .env.local
function getApiKey() {
  try {
    const envPath = path.join(__dirname, '..', '.env.local');
    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(/REACT_APP_FIREBASE_API_KEY=(.+)/);
    if (match) {
      return match[1].trim();
    }
  } catch (error) {
    console.error('❌ Impossible de lire le fichier .env.local');
  }
  return null;
}

// Fonction pour faire une requête à l'API Firestore
function firestoreRequest(method, path, data = null) {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('API Key non trouvée');
  }

  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'firestore.googleapis.com',
      path: `/v1/projects/${PROJECT_ID}/databases/(default)${path}?key=${apiKey}`,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(body);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(result);
          } else {
            reject(new Error(`${res.statusCode}: ${result.error?.message || body}`));
          }
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

// Fonction pour lister les documents d'une collection
async function listDocuments(collectionName) {
  try {
    const response = await firestoreRequest('GET', `/documents/${collectionName}`);
    return response.documents || [];
  } catch (error) {
    console.error(`❌ Erreur lors de la lecture de ${collectionName}:`, error.message);
    return [];
  }
}

// Fonction pour mettre à jour un document
async function updateDocument(documentPath, entrepriseId) {
  const updateData = {
    fields: {
      entrepriseId: {
        stringValue: entrepriseId
      }
    }
  };

  try {
    await firestoreRequest('PATCH', `/documents/${documentPath}?updateMask.fieldPaths=entrepriseId`, updateData);
    return true;
  } catch (error) {
    console.error(`❌ Erreur lors de la mise à jour:`, error.message);
    return false;
  }
}

// Fonction principale
async function fixMissingEntrepriseIds() {
  const collections = ['contacts', 'lieux', 'concerts', 'structures', 'artistes', 'contrats'];
  
  console.log('🔧 Correction des documents sans entrepriseId...');
  console.log(`📌 EntrepriseId par défaut: ${DEFAULT_ENTREPRISE_ID}\n`);

  for (const collection of collections) {
    console.log(`\n📁 Collection: ${collection}`);
    
    const documents = await listDocuments(collection);
    let fixed = 0;
    let skipped = 0;
    
    for (const doc of documents) {
      const docName = doc.name.split('/').pop();
      const hasOrgId = doc.fields?.entrepriseId?.stringValue;
      
      if (!hasOrgId) {
        const displayName = 
          doc.fields?.nom?.stringValue || 
          doc.fields?.titre?.stringValue || 
          doc.fields?.raisonSociale?.stringValue ||
          'Sans nom';
        
        console.log(`  🔧 Correction: ${docName} - ${displayName}`);
        
        const success = await updateDocument(`${collection}/${docName}`, DEFAULT_ENTREPRISE_ID);
        if (success) {
          fixed++;
        }
      } else {
        skipped++;
      }
    }
    
    console.log(`  ✅ Résultat: ${fixed} corrigés, ${skipped} déjà OK`);
  }
  
  console.log('\n✅ Correction terminée!');
  console.log('\n⚠️  IMPORTANT: Les documents ont été assignés à l\'organisation par défaut.');
  console.log('   Vous devrez peut-être les réassigner à la bonne organisation.');
}

// Point d'entrée avec gestion d'erreur
async function main() {
  if (!getApiKey()) {
    console.error('❌ API Key Firebase non trouvée dans .env.local');
    console.log('Assurez-vous que REACT_APP_FIREBASE_API_KEY est défini dans .env.local');
    process.exit(1);
  }

  if (DEFAULT_ENTREPRISE_ID === 'default-org') {
    console.warn('⚠️  ATTENTION: Vous utilisez l\'entrepriseId par défaut.');
    console.log('Pour utiliser votre vrai entrepriseId:');
    console.log('1. Connectez-vous à l\'application');
    console.log('2. Ouvrez la console du navigateur');
    console.log('3. Tapez: JSON.parse(localStorage.getItem("organizationContext"))?.currentOrganization?.id');
    console.log('4. Remplacez DEFAULT_ENTREPRISE_ID dans ce script par la valeur obtenue\n');
    
    // Attendre confirmation
    console.log('Appuyez sur Ctrl+C pour annuler ou Entrée pour continuer...');
    await new Promise(resolve => {
      process.stdin.once('data', resolve);
    });
  }

  try {
    await fixMissingEntrepriseIds();
  } catch (error) {
    console.error('❌ Erreur fatale:', error);
    process.exit(1);
  }
}

// Exécution
main();