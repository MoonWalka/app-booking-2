// Script d'audit complet pour analyser l'utilisation des champs organisateur vs structure

const fs = require('fs');
const path = require('path');

// Patterns à rechercher
const patterns = {
  organisateur: {
    id: /organisateurId/g,
    nom: /organisateurNom/g,
    general: /organisateur(?!\.)/gi
  },
  structure: {
    id: /structureId/g,
    nom: /structureNom/g,
    raisonSociale: /structureRaisonSociale/g,
    general: /structure(?!\.)/gi
  }
};

// Résultats de l'audit
const results = {
  organisateur: {
    files: new Set(),
    usage: {
      id: [],
      nom: [],
      general: []
    },
    totalOccurrences: 0
  },
  structure: {
    files: new Set(),
    usage: {
      id: [],
      nom: [],
      raisonSociale: [],
      general: []
    },
    totalOccurrences: 0
  },
  mixedUsage: new Set(), // Fichiers utilisant les deux
  byModule: {}, // Usage par module
  inconsistencies: [] // Incohérences détectées
};

// Modules à analyser
const modules = [
  'concerts',
  'contrats',
  'precontrats',
  'factures',
  'devis',
  'forms',
  'contacts',
  'structures'
];

// Extensions de fichiers à analyser
const fileExtensions = ['.js', '.jsx', '.ts', '.tsx'];

// Fonction pour lire récursivement les fichiers
function readFilesRecursively(dir, callback) {
  fs.readdirSync(dir).forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      readFilesRecursively(filePath, callback);
    } else if (stat.isFile() && fileExtensions.includes(path.extname(file))) {
      callback(filePath);
    }
  });
}

// Fonction pour analyser un fichier
function analyzeFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const relativePath = path.relative(process.cwd(), filePath);
  
  // Déterminer le module
  let module = 'other';
  for (const mod of modules) {
    if (relativePath.includes(`/${mod}/`) || relativePath.includes(`\\${mod}\\`)) {
      module = mod;
      break;
    }
  }
  
  // Initialiser le module si nécessaire
  if (!results.byModule[module]) {
    results.byModule[module] = {
      organisateur: { count: 0, files: new Set() },
      structure: { count: 0, files: new Set() }
    };
  }
  
  let hasOrganisateur = false;
  let hasStructure = false;
  
  // Analyser les patterns organisateur
  for (const [key, pattern] of Object.entries(patterns.organisateur)) {
    const matches = content.match(pattern);
    if (matches) {
      hasOrganisateur = true;
      results.organisateur.files.add(relativePath);
      results.organisateur.totalOccurrences += matches.length;
      results.byModule[module].organisateur.count += matches.length;
      results.byModule[module].organisateur.files.add(relativePath);
      
      // Stocker les contextes d'utilisation (lignes contenant le pattern)
      const lines = content.split('\n');
      lines.forEach((line, index) => {
        if (pattern.test(line)) {
          results.organisateur.usage[key].push({
            file: relativePath,
            line: index + 1,
            content: line.trim(),
            module
          });
        }
      });
    }
  }
  
  // Analyser les patterns structure
  for (const [key, pattern] of Object.entries(patterns.structure)) {
    const matches = content.match(pattern);
    if (matches) {
      hasStructure = true;
      results.structure.files.add(relativePath);
      results.structure.totalOccurrences += matches.length;
      results.byModule[module].structure.count += matches.length;
      results.byModule[module].structure.files.add(relativePath);
      
      // Stocker les contextes d'utilisation
      const lines = content.split('\n');
      lines.forEach((line, index) => {
        if (pattern.test(line)) {
          results.structure.usage[key].push({
            file: relativePath,
            line: index + 1,
            content: line.trim(),
            module
          });
        }
      });
    }
  }
  
  // Détecter les utilisations mixtes
  if (hasOrganisateur && hasStructure) {
    results.mixedUsage.add(relativePath);
  }
  
  // Détecter les incohérences potentielles
  detectInconsistencies(content, relativePath, module);
}

// Fonction pour détecter les incohérences
function detectInconsistencies(content, filePath, module) {
  const lines = content.split('\n');
  
  // Pattern 1: Utilisation de organisateur dans des contextes de structure
  lines.forEach((line, index) => {
    if (line.includes('organisateur') && 
        (line.includes('structure') || line.includes('Structure'))) {
      results.inconsistencies.push({
        type: 'mixed_naming',
        file: filePath,
        line: index + 1,
        content: line.trim(),
        module,
        description: 'Utilisation mixte organisateur/structure sur la même ligne'
      });
    }
  });
  
  // Pattern 2: Mapping entre organisateur et structure
  const mappingPatterns = [
    /organisateurId.*[:=].*structure/i,
    /structureId.*[:=].*organisateur/i,
    /organisateurNom.*[:=].*structure/i,
    /structureNom.*[:=].*organisateur/i
  ];
  
  lines.forEach((line, index) => {
    mappingPatterns.forEach(pattern => {
      if (pattern.test(line)) {
        results.inconsistencies.push({
          type: 'field_mapping',
          file: filePath,
          line: index + 1,
          content: line.trim(),
          module,
          description: 'Mapping entre champs organisateur et structure'
        });
      }
    });
  });
}

// Fonction pour générer le rapport
function generateReport() {
  console.log('\n🔍 AUDIT COMPLET: UTILISATION ORGANISATEUR VS STRUCTURE\n');
  console.log('=' .repeat(80));
  
  // Résumé global
  console.log('\n📊 RÉSUMÉ GLOBAL:');
  console.log('-'.repeat(40));
  console.log(`Total fichiers analysés: ${results.organisateur.files.size + results.structure.files.size}`);
  console.log(`Fichiers avec "organisateur": ${results.organisateur.files.size}`);
  console.log(`Fichiers avec "structure": ${results.structure.files.size}`);
  console.log(`Fichiers avec utilisation mixte: ${results.mixedUsage.size}`);
  console.log(`Occurrences totales "organisateur": ${results.organisateur.totalOccurrences}`);
  console.log(`Occurrences totales "structure": ${results.structure.totalOccurrences}`);
  
  // Usage par module
  console.log('\n📁 USAGE PAR MODULE:');
  console.log('-'.repeat(40));
  Object.entries(results.byModule).forEach(([module, data]) => {
    if (data.organisateur.count > 0 || data.structure.count > 0) {
      console.log(`\n${module.toUpperCase()}:`);
      console.log(`  - organisateur: ${data.organisateur.count} occurrences dans ${data.organisateur.files.size} fichiers`);
      console.log(`  - structure: ${data.structure.count} occurrences dans ${data.structure.files.size} fichiers`);
    }
  });
  
  // Détails des champs utilisés
  console.log('\n🔤 DÉTAILS DES CHAMPS:');
  console.log('-'.repeat(40));
  
  console.log('\nCHAMPS ORGANISATEUR:');
  console.log(`  - organisateurId: ${results.organisateur.usage.id.length} utilisations`);
  console.log(`  - organisateurNom: ${results.organisateur.usage.nom.length} utilisations`);
  
  console.log('\nCHAMPS STRUCTURE:');
  console.log(`  - structureId: ${results.structure.usage.id.length} utilisations`);
  console.log(`  - structureNom: ${results.structure.usage.nom.length} utilisations`);
  console.log(`  - structureRaisonSociale: ${results.structure.usage.raisonSociale.length} utilisations`);
  
  // Fichiers avec utilisation mixte
  if (results.mixedUsage.size > 0) {
    console.log('\n⚠️  FICHIERS AVEC UTILISATION MIXTE:');
    console.log('-'.repeat(40));
    Array.from(results.mixedUsage).sort().forEach(file => {
      console.log(`  - ${file}`);
    });
  }
  
  // Incohérences détectées
  if (results.inconsistencies.length > 0) {
    console.log('\n❌ INCOHÉRENCES DÉTECTÉES:');
    console.log('-'.repeat(40));
    results.inconsistencies.forEach(inc => {
      console.log(`\n  ${inc.file}:${inc.line}`);
      console.log(`  Type: ${inc.type}`);
      console.log(`  Description: ${inc.description}`);
      console.log(`  Ligne: ${inc.content}`);
    });
  }
  
  // Recommandations
  console.log('\n💡 RECOMMANDATIONS:');
  console.log('-'.repeat(40));
  
  if (results.organisateur.totalOccurrences > 0 && results.structure.totalOccurrences > 0) {
    console.log('\n1. HARMONISATION NÉCESSAIRE:');
    console.log('   - Deux conventions de nommage coexistent (organisateur/structure)');
    console.log('   - Recommandation: Migrer progressivement vers "structure" pour cohérence');
    
    console.log('\n2. MODULES PRIORITAIRES POUR LA MIGRATION:');
    Object.entries(results.byModule).forEach(([module, data]) => {
      if (data.organisateur.count > 0) {
        console.log(`   - ${module}: ${data.organisateur.count} occurrences à migrer`);
      }
    });
    
    console.log('\n3. MAPPING SUGGÉRÉ:');
    console.log('   - organisateurId → structureId');
    console.log('   - organisateurNom → structureNom ou structureRaisonSociale');
  }
  
  // Exemples d'utilisation
  console.log('\n📝 EXEMPLES D\'UTILISATION:');
  console.log('-'.repeat(40));
  
  console.log('\nORGANISATEUR:');
  results.organisateur.usage.id.slice(0, 3).forEach(usage => {
    console.log(`  ${usage.file}:${usage.line}`);
    console.log(`  → ${usage.content}`);
  });
  
  console.log('\nSTRUCTURE:');
  results.structure.usage.id.slice(0, 3).forEach(usage => {
    console.log(`  ${usage.file}:${usage.line}`);
    console.log(`  → ${usage.content}`);
  });
}

// Exécution principale
console.log('🔍 Démarrage de l\'audit...\n');

const srcPath = path.join(process.cwd(), 'src');
if (fs.existsSync(srcPath)) {
  readFilesRecursively(srcPath, analyzeFile);
  generateReport();
  
  // Sauvegarder le rapport détaillé
  const reportPath = path.join(process.cwd(), 'audit-organisateur-structure-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  console.log(`\n📄 Rapport détaillé sauvegardé dans: ${reportPath}`);
} else {
  console.error('❌ Le dossier src n\'existe pas');
}