#!/usr/bin/env node

/**
 * Script pour détecter (sans supprimer) les fallbacks CSS
 * 
 * Ce script parcourt les fichiers CSS et catégorise les différents types
 * de fallbacks pour permettre une prise de décision manuelle.
 * 
 * Usage:
 * node detect_css_fallbacks.js [--path=src/]
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Traitement des arguments
const args = process.argv.slice(2);
const pathArg = args.find(arg => arg.startsWith('--path='));
const rootPath = pathArg ? pathArg.split('=')[1] : 'src/';

// Statistiques et classification
const stats = {
  filesProcessed: 0,
  filesWithFallbacks: 0,
  totalFallbacks: 0
};

// Catégories de fallbacks
const fallbackCategories = {
  // Variables avec fallbacks simples (ex: var(--tc-color, #fff))
  simple: {
    count: 0,
    examples: []
  },
  // Variables avec fallbacks qui sont des variables (ex: var(--tc-color, var(--fallback)))
  nested: {
    count: 0,
    examples: []
  },
  // Variables avec fallbacks complexes (ex: var(--tc-color, var(--fallback, white)))
  complex: {
    count: 0,
    examples: []
  }
};

// Fonction pour analyser un fichier CSS
function analyzeCssFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const fileName = path.basename(filePath);
    
    // Rechercher les variables CSS avec fallbacks
    const matches = content.match(/var\(--tc-[a-zA-Z0-9-]+,\s*[^)]+\)/g);
    
    if (!matches) {
      stats.filesProcessed++;
      return;
    }
    
    const uniqueMatches = [...new Set(matches)];
    let hasFallbacks = false;
    
    // Classifier chaque fallback
    uniqueMatches.forEach(match => {
      hasFallbacks = true;
      stats.totalFallbacks++;
      
      const fallbackValue = match.substring(match.indexOf(',') + 1, match.lastIndexOf(')')).trim();
      
      // Détecter le type de fallback
      if (fallbackValue.startsWith('var(') && fallbackValue.includes(',')) {
        // Fallback complex (var(--tc-color, var(--fallback, white)))
        fallbackCategories.complex.count++;
        if (fallbackCategories.complex.examples.length < 10) {
          fallbackCategories.complex.examples.push({
            example: match,
            file: filePath
          });
        }
      } else if (fallbackValue.startsWith('var(')) {
        // Fallback nested (var(--tc-color, var(--fallback)))
        fallbackCategories.nested.count++;
        if (fallbackCategories.nested.examples.length < 10) {
          fallbackCategories.nested.examples.push({
            example: match,
            file: filePath
          });
        }
      } else {
        // Fallback simple (var(--tc-color, #fff))
        fallbackCategories.simple.count++;
        if (fallbackCategories.simple.examples.length < 10) {
          fallbackCategories.simple.examples.push({
            example: match,
            file: filePath
          });
        }
      }
    });
    
    if (hasFallbacks) {
      stats.filesWithFallbacks++;
    }
    
    stats.filesProcessed++;
  } catch (error) {
    console.error(`❌ Erreur lors de l'analyse de ${filePath}:`, error.message);
  }
}

// Fonction principale
function main() {
  console.log(`\n🔍 Recherche des fichiers CSS dans ${rootPath}...\n`);
  
  // Trouver tous les fichiers CSS
  const cssFiles = glob.sync(`${rootPath}/**/*.css`);
  
  if (cssFiles.length === 0) {
    console.log(`❌ Aucun fichier CSS trouvé dans ${rootPath}`);
    return;
  }
  
  console.log(`📂 ${cssFiles.length} fichiers CSS trouvés.\n`);
  console.log(`Analyse en cours...\n`);
  
  // Analyser chaque fichier CSS
  cssFiles.forEach(analyzeCssFile);
  
  // Afficher les résultats
  console.log(`\n📊 Statistiques globales:`);
  console.log(`  • Fichiers traités: ${stats.filesProcessed}`);
  console.log(`  • Fichiers avec fallbacks: ${stats.filesWithFallbacks}`);
  console.log(`  • Total des fallbacks trouvés: ${stats.totalFallbacks}\n`);
  
  console.log(`\n🔍 Classification des fallbacks:`);
  
  console.log(`\n1. Fallbacks simples: ${fallbackCategories.simple.count}`);
  console.log(`   Exemples:`);
  fallbackCategories.simple.examples.slice(0, 5).forEach(ex => {
    console.log(`   • ${ex.example} (${path.basename(ex.file)})`);
  });
  
  console.log(`\n2. Fallbacks avec variables: ${fallbackCategories.nested.count}`);
  console.log(`   Exemples:`);
  fallbackCategories.nested.examples.slice(0, 5).forEach(ex => {
    console.log(`   • ${ex.example} (${path.basename(ex.file)})`);
  });
  
  console.log(`\n3. Fallbacks complexes: ${fallbackCategories.complex.count}`);
  console.log(`   Exemples:`);
  fallbackCategories.complex.examples.slice(0, 5).forEach(ex => {
    console.log(`   • ${ex.example} (${path.basename(ex.file)})`);
  });
  
  console.log(`\n📋 Recommandations:`);
  console.log(`  1. Vous pouvez supprimer en toute sécurité les fallbacks simples (${fallbackCategories.simple.count}).`);
  console.log(`  2. Pour les fallbacks avec variables (${fallbackCategories.nested.count}), vérifiez que la variable de base est définie.`);
  console.log(`  3. Pour les fallbacks complexes (${fallbackCategories.complex.count}), une validation manuelle est recommandée.`);
  
  // Générer un rapport détaillé
  const reportContent = {
    date: new Date().toISOString(),
    statistics: stats,
    categories: fallbackCategories
  };
  
  fs.writeFileSync('css_fallbacks_report.json', JSON.stringify(reportContent, null, 2));
  console.log(`\n✅ Rapport détaillé généré dans css_fallbacks_report.json`);
}

// Exécuter le script
main();
