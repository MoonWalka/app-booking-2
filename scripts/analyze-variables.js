#!/usr/bin/env node

/**
 * Script d'analyse des variables dans les templates
 * 
 * Ce script :
 * 1. Trouve toutes les variables utilisées dans les templates
 * 2. Identifie où elles sont définies
 * 3. Génère un dictionnaire complet
 */

const fs = require('fs');
const path = require('path');

// Configuration
const srcPath = path.join(__dirname, '..', 'src');
const results = {
  timestamp: new Date().toISOString(),
  variablesFound: new Map(),
  variablesByFile: {},
  mappings: {},
  duplicates: [],
  missing: []
};

// Patterns pour trouver les variables
const VARIABLE_PATTERNS = [
  /\{([a-zA-Z_][a-zA-Z0-9_]*)\}/g,        // {variable}
  /\[([a-zA-Z_][a-zA-Z0-9_]*)\]/g,        // [variable]
  /\{\{([a-zA-Z_][a-zA-Z0-9_]*)\}\}/g,    // {{variable}}
];

// Fonctions utilitaires
function readFileContent(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    return null;
  }
}

function findFiles(dir, pattern) {
  const files = [];
  
  function walk(currentDir) {
    try {
      const items = fs.readdirSync(currentDir);
      
      for (const item of items) {
        const fullPath = path.join(currentDir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
          walk(fullPath);
        } else if (stat.isFile() && pattern.test(item)) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      // Ignorer les erreurs de lecture
    }
  }
  
  walk(dir);
  return files;
}

// Analyser les templates pour trouver les variables
function analyzeTemplates() {
  console.log('🔍 Recherche des variables dans les templates...\n');
  
  // Fichiers susceptibles de contenir des templates
  const templateFiles = [
    ...findFiles(srcPath, /template/i),
    ...findFiles(srcPath, /contrat.*\.js$/),
    ...findFiles(srcPath, /devis.*\.js$/),
    ...findFiles(srcPath, /facture.*\.js$/),
  ];
  
  // Dédupliquer
  const uniqueFiles = [...new Set(templateFiles)];
  
  uniqueFiles.forEach(file => {
    const content = readFileContent(file);
    if (!content) return;
    
    const relativePath = path.relative(srcPath, file);
    results.variablesByFile[relativePath] = [];
    
    // Chercher toutes les variables
    VARIABLE_PATTERNS.forEach(pattern => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const variable = match[1];
        const fullMatch = match[0];
        
        // Ajouter à la liste globale
        if (!results.variablesFound.has(variable)) {
          results.variablesFound.set(variable, {
            name: variable,
            occurrences: [],
            format: fullMatch.startsWith('{') ? 'braces' : 'brackets'
          });
        }
        
        // Ajouter cette occurrence
        results.variablesFound.get(variable).occurrences.push({
          file: relativePath,
          line: content.substring(0, match.index).split('\n').length,
          context: content.substring(match.index - 20, match.index + match[0].length + 20).trim()
        });
        
        // Ajouter au fichier
        results.variablesByFile[relativePath].push(variable);
      }
    });
  });
  
  console.log(`✅ ${results.variablesFound.size} variables uniques trouvées dans ${uniqueFiles.length} fichiers\n`);
}

// Analyser les mappings existants
function analyzeMappings() {
  console.log('🔍 Analyse des mappings existants...\n');
  
  // Fichiers de mapping connus
  const mappingFiles = [
    'utils/dataMapping/simpleDataMapper.js',
    'hooks/contrats/contractVariablesUnified.js',
    'hooks/contrats/contractVariables.js',
    'services/factureService.js'
  ];
  
  mappingFiles.forEach(file => {
    const fullPath = path.join(srcPath, file);
    const content = readFileContent(fullPath);
    if (!content) return;
    
    // Chercher les remplacements
    const replacePatterns = [
      /\.replace\s*\(\s*[/'"]\{([a-zA-Z_]+)\}[/'"][^,]*,\s*([^)]+)\)/g,
      /['"]([a-zA-Z_]+)['"]\s*:\s*['"']?([^'",\n]+)/g,
    ];
    
    replacePatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const variable = match[1];
        const mapping = match[2].trim();
        
        if (!results.mappings[variable]) {
          results.mappings[variable] = [];
        }
        
        results.mappings[variable].push({
          file: file,
          mapping: mapping
        });
      }
    });
  });
  
  console.log(`✅ ${Object.keys(results.mappings).length} mappings trouvés\n`);
}

// Identifier les variables problématiques
function identifyIssues() {
  console.log('🔍 Identification des problèmes...\n');
  
  // Variables utilisées mais non mappées
  results.variablesFound.forEach((info, variable) => {
    if (!results.mappings[variable]) {
      results.missing.push({
        variable: variable,
        usedIn: info.occurrences.length + ' fichiers',
        firstSeen: info.occurrences[0].file
      });
    }
  });
  
  // Variables avec plusieurs formats
  const variablesByBase = new Map();
  results.variablesFound.forEach((info, variable) => {
    const base = variable.toLowerCase().replace(/_/g, '');
    if (!variablesByBase.has(base)) {
      variablesByBase.set(base, []);
    }
    variablesByBase.set(base, [...variablesByBase.get(base), variable]);
  });
  
  variablesByBase.forEach((variants, base) => {
    if (variants.length > 1) {
      results.duplicates.push({
        concept: base,
        variants: variants
      });
    }
  });
}

// Générer le dictionnaire
function generateDictionary() {
  console.log('📝 Génération du dictionnaire...\n');
  
  const dictionary = {
    generated: new Date().toISOString(),
    totalVariables: results.variablesFound.size,
    categories: {
      organisateur: {},
      producteur: {},
      artiste: {},
      lieu: {},
      date: {},
      montant: {},
      autre: {}
    }
  };
  
  // Classer les variables par catégorie
  results.variablesFound.forEach((info, variable) => {
    let category = 'autre';
    
    if (variable.includes('organisateur')) category = 'organisateur';
    else if (variable.includes('producteur')) category = 'producteur';
    else if (variable.includes('artiste')) category = 'artiste';
    else if (variable.includes('lieu')) category = 'lieu';
    else if (variable.includes('date')) category = 'date';
    else if (variable.includes('montant') || variable.includes('ttc') || variable.includes('ht')) category = 'montant';
    else if (variable.includes('structure')) category = 'organisateur';
    else if (variable.includes('contact')) category = 'organisateur';
    
    dictionary.categories[category][variable] = {
      description: generateDescription(variable),
      format: info.format,
      occurrences: info.occurrences.length,
      mapping: results.mappings[variable] ? results.mappings[variable][0].mapping : null
    };
  });
  
  // Sauvegarder le dictionnaire
  const dictPath = path.join(__dirname, '..', 'DICTIONNAIRE_VARIABLES.json');
  fs.writeFileSync(dictPath, JSON.stringify(dictionary, null, 2));
  
  // Générer aussi un fichier JS utilisable
  generateJSDictionary(dictionary);
  
  console.log(`✅ Dictionnaire généré dans DICTIONNAIRE_VARIABLES.json\n`);
}

// Générer une description automatique
function generateDescription(variable) {
  const words = variable.split('_');
  const descriptions = {
    organisateur: "de l'organisateur",
    producteur: "du producteur",
    artiste: "de l'artiste",
    lieu: "du lieu",
    nom: "Nom",
    raison: "Raison",
    sociale: "sociale",
    siret: "SIRET",
    adresse: "Adresse",
    code: "Code",
    postal: "postal",
    ville: "Ville",
    telephone: "Téléphone",
    email: "Email",
    montant: "Montant",
    ht: "HT",
    ttc: "TTC",
    tva: "TVA",
    date: "Date",
    heure: "Heure",
    signataire: "Signataire",
    qualite: "Qualité",
    numero: "Numéro",
    licence: "licence"
  };
  
  const parts = words.map(word => descriptions[word] || word);
  return parts.join(' ');
}

// Générer un fichier JS utilisable
function generateJSDictionary(dictionary) {
  const jsContent = `/**
 * Dictionnaire officiel des variables TourCraft
 * Généré automatiquement le ${new Date().toISOString()}
 * 
 * NE PAS MODIFIER MANUELLEMENT - Utiliser scripts/analyze-variables.js
 */

export const VARIABLES_DICTIONARY = ${JSON.stringify(dictionary.categories, null, 2)};

// Liste simple pour validation
export const ALL_VARIABLES = [
${Array.from(results.variablesFound.keys()).map(v => `  '${v}'`).join(',\n')}
];

// Fonction de validation
export function isValidVariable(variable) {
  return ALL_VARIABLES.includes(variable);
}

// Fonction pour obtenir la description
export function getVariableDescription(variable) {
  for (const category of Object.values(VARIABLES_DICTIONARY)) {
    if (category[variable]) {
      return category[variable].description;
    }
  }
  return null;
}
`;

  const jsPath = path.join(srcPath, 'config', 'variablesDictionary.js');
  
  // Créer le dossier config s'il n'existe pas
  const configDir = path.join(srcPath, 'config');
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }
  
  fs.writeFileSync(jsPath, jsContent);
  console.log(`✅ Fichier JS généré dans src/config/variablesDictionary.js\n`);
}

// Générer le rapport
function generateReport() {
  console.log('\n📊 RAPPORT D\'ANALYSE\n');
  console.log('='.repeat(50));
  
  console.log(`\n📌 RÉSUMÉ`);
  console.log(`- Variables trouvées: ${results.variablesFound.size}`);
  console.log(`- Variables mappées: ${Object.keys(results.mappings).length}`);
  console.log(`- Variables manquantes: ${results.missing.length}`);
  console.log(`- Doublons détectés: ${results.duplicates.length}`);
  
  if (results.missing.length > 0) {
    console.log(`\n⚠️  VARIABLES NON MAPPÉES (${results.missing.length}):`);
    results.missing.slice(0, 10).forEach(m => {
      console.log(`- ${m.variable} (utilisé dans ${m.usedIn})`);
    });
    if (results.missing.length > 10) {
      console.log(`... et ${results.missing.length - 10} autres`);
    }
  }
  
  if (results.duplicates.length > 0) {
    console.log(`\n⚠️  VARIABLES EN DOUBLE (${results.duplicates.length}):`);
    results.duplicates.forEach(d => {
      console.log(`- Concept "${d.concept}": ${d.variants.join(', ')}`);
    });
  }
  
  // Top 10 des variables les plus utilisées
  const sorted = Array.from(results.variablesFound.entries())
    .sort((a, b) => b[1].occurrences.length - a[1].occurrences.length)
    .slice(0, 10);
  
  console.log(`\n🏆 TOP 10 VARIABLES LES PLUS UTILISÉES:`);
  sorted.forEach(([variable, info], index) => {
    console.log(`${index + 1}. ${variable} (${info.occurrences.length} fois)`);
  });
  
  console.log('\n' + '='.repeat(50));
}

// Exécution
console.log('🚀 Analyse des variables TourCraft...\n');

analyzeTemplates();
analyzeMappings();
identifyIssues();
generateDictionary();
generateReport();

console.log('\n✅ Analyse terminée !');
console.log('📄 Fichiers générés:');
console.log('   - DICTIONNAIRE_VARIABLES.json');
console.log('   - src/config/variablesDictionary.js');