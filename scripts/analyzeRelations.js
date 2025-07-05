#!/usr/bin/env node

/**
 * Script d'analyse détaillée des liaisons identifiées dans l'audit
 * Vérifie si les liaisons existent dans le code et comment elles fonctionnent
 */

const fs = require('fs').promises;
const path = require('path');

// Configuration des liaisons à vérifier
const LIAISONS_A_VERIFIER = [
  {
    collection: 'concerts',
    targetCollection: 'projets',
    field: 'projetId',
    description: 'Liaison concerts → projets'
  },
  {
    collection: 'contacts',
    targetCollection: 'structures',
    field: 'structureId',
    description: 'Liaison contacts → structures'
  },
  {
    collection: 'factures',
    targetCollection: 'contacts',
    field: 'clientId',
    description: 'Liaison factures → contacts'
  },
  {
    collection: 'devis',
    targetCollection: 'concerts',
    field: 'concertId',
    description: 'Liaison devis → concerts'
  },
  {
    collection: 'devis',
    targetCollection: 'contacts',
    field: 'clientId',
    description: 'Liaison devis → contacts (clientId)'
  },
  {
    collection: 'festivals',
    targetCollection: 'contacts',
    field: 'organisateurId',
    description: 'Liaison festivals → contacts'
  },
  {
    collection: 'festivals',
    targetCollection: 'lieux',
    field: 'lieuId',
    description: 'Liaison festivals → lieux'
  },
  {
    collection: 'lieux',
    targetCollection: 'structures',
    field: 'structureId',
    description: 'Liaison lieux → structures'
  }
];

// Fonction pour rechercher dans les fichiers
async function searchInFiles(pattern, directory) {
  const results = [];
  
  async function searchRecursive(dir) {
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        // Skip node_modules, build directories, and non-JS/TS files
        if (entry.name === 'node_modules' || 
            entry.name === 'build' || 
            entry.name === 'dist' ||
            entry.name === '.git' ||
            entry.name.startsWith('.')) continue;
        
        if (entry.isDirectory()) {
          await searchRecursive(fullPath);
        } else if (entry.isFile() && /\.(js|jsx|ts|tsx)$/.test(entry.name)) {
          try {
            const content = await fs.readFile(fullPath, 'utf8');
            if (content.includes(pattern)) {
              // Trouver les lignes contenant le pattern
              const lines = content.split('\n');
              const matches = [];
              lines.forEach((line, index) => {
                if (line.includes(pattern)) {
                  matches.push({
                    line: index + 1,
                    content: line.trim()
                  });
                }
              });
              results.push({
                file: fullPath.replace(/^.*\/app-booking-2\//, ''),
                matches
              });
            }
          } catch (err) {
            // Ignorer les erreurs de lecture
          }
        }
      }
    } catch (err) {
      // Ignorer les erreurs de répertoire
    }
  }
  
  await searchRecursive(directory);
  return results;
}

// Fonction pour analyser une liaison
async function analyzeLiaison(liaison) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`Analyse: ${liaison.description}`);
  console.log(`Collection: ${liaison.collection} → ${liaison.targetCollection} (via ${liaison.field})`);
  console.log(`${'='.repeat(80)}`);
  
  const srcDir = path.join(__dirname, '../src');
  
  // 1. Rechercher les utilisations du champ
  console.log(`\n1. Recherche du champ "${liaison.field}" dans le code:`);
  const fieldUsages = await searchInFiles(liaison.field, srcDir);
  
  if (fieldUsages.length === 0) {
    console.log(`   ⚠️  Aucune utilisation trouvée pour "${liaison.field}"`);
  } else {
    console.log(`   ✓ ${fieldUsages.length} fichiers utilisent "${liaison.field}":`);
    fieldUsages.slice(0, 5).forEach(usage => {
      console.log(`     - ${usage.file}`);
      usage.matches.slice(0, 2).forEach(match => {
        console.log(`       L${match.line}: ${match.content.substring(0, 80)}...`);
      });
    });
    if (fieldUsages.length > 5) {
      console.log(`     ... et ${fieldUsages.length - 5} autres fichiers`);
    }
  }
  
  // 2. Rechercher les services liés
  console.log(`\n2. Recherche dans les services:`);
  const servicePatterns = [
    `create${liaison.collection.charAt(0).toUpperCase() + liaison.collection.slice(1).slice(0, -1)}`,
    `update${liaison.collection.charAt(0).toUpperCase() + liaison.collection.slice(1).slice(0, -1)}`,
    `addDoc.*${liaison.collection}`,
    `collection.*${liaison.collection}`
  ];
  
  for (const pattern of servicePatterns) {
    const serviceUsages = await searchInFiles(pattern, path.join(srcDir, 'services'));
    if (serviceUsages.length > 0) {
      console.log(`   ✓ Pattern "${pattern}" trouvé dans:`);
      serviceUsages.forEach(usage => {
        console.log(`     - ${usage.file}`);
      });
    }
  }
  
  // 3. Rechercher les hooks liés
  console.log(`\n3. Recherche dans les hooks:`);
  const hookPatterns = [
    `use${liaison.collection.charAt(0).toUpperCase() + liaison.collection.slice(1)}`,
    liaison.field
  ];
  
  for (const pattern of hookPatterns) {
    const hookUsages = await searchInFiles(pattern, path.join(srcDir, 'hooks'));
    if (hookUsages.length > 0) {
      console.log(`   ✓ Pattern "${pattern}" trouvé dans:`);
      hookUsages.forEach(usage => {
        console.log(`     - ${usage.file}`);
      });
    }
  }
  
  // 4. Vérifier les alternatives possibles
  console.log(`\n4. Vérification des alternatives possibles:`);
  const alternatives = {
    'clientId': ['contactId', 'structureId'],
    'organisateurId': ['structureId', 'contactId'],
    'projetId': ['artisteId', 'projetNom']
  };
  
  if (alternatives[liaison.field]) {
    for (const alt of alternatives[liaison.field]) {
      const altUsages = await searchInFiles(alt, srcDir);
      if (altUsages.length > 0) {
        console.log(`   ℹ️  Alternative "${alt}" utilisée dans ${altUsages.length} fichiers`);
      }
    }
  }
  
  // 5. Recommandations
  console.log(`\n5. Recommandations:`);
  if (fieldUsages.length === 0) {
    console.log(`   🔧 La liaison "${liaison.field}" semble manquante ou utilise un autre nom`);
    console.log(`   🔧 Vérifier si la liaison est nécessaire ou si elle utilise une convention différente`);
  } else {
    console.log(`   ✅ La liaison existe et est utilisée dans le code`);
  }
}

// Fonction principale
async function main() {
  console.log('🔍 Analyse détaillée des liaisons identifiées dans l\'audit\n');
  
  for (const liaison of LIAISONS_A_VERIFIER) {
    await analyzeLiaison(liaison);
  }
  
  console.log(`\n\n${'='.repeat(80)}`);
  console.log('📊 Résumé de l\'analyse');
  console.log(`${'='.repeat(80)}`);
  
  console.log('\n🔍 Liaisons à examiner plus en détail:');
  console.log('1. concerts → projets (projetId): Vérifier si nécessaire ou utilise artisteId/projetNom');
  console.log('2. factures/devis → contacts (clientId): Probablement utilise contactId à la place');
  console.log('3. festivals → contacts (organisateurId): Vérifier l\'existence de la collection festivals');
  console.log('4. lieux → structures (structureId): Vérifier si utilise contactId ou relation inverse');
  
  console.log('\n✅ Recommandations:');
  console.log('- Mettre à jour le script d\'audit pour reconnaître les conventions alternatives');
  console.log('- Documenter les liaisons réelles utilisées dans le système');
  console.log('- Harmoniser les noms de champs si nécessaire');
}

// Exécution
main().catch(console.error);