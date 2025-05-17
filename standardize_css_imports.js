#!/usr/bin/env node

/**
 * Script pour standardiser les imports CSS dans les composants React
 * Ce script parcourt tous les fichiers JavaScript/JSX pour remplacer
 * les différentes façons d'importer les styles CSS par une approche standardisée
 * 
 * Date de création: 17 mai 2025
 * Dernière mise à jour: 17 mai 2025 - Phase 2 du plan d'action CSS
 * 
 * Usage:
 * node standardize_css_imports.js [--dry-run] [--verbose] [--all|--specific=path/to/dir]
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Configuration
const CONFIG = {
  // Chemin racine du projet
  rootDir: path.resolve(__dirname, 'src'),
  
  // Option par défaut pour l'import - Standardisé sur 'index'
  defaultImportStyle: 'index', // Toujours utiliser l'option 'index' pour la cohérence
  
  // Patterns pour les imports CSS
  patterns: {
    // Les différentes façons d'importer qui seront remplacées
    oldImports: [
      // Import direct d'un fichier CSS
      /import\s+['"]\.\.?\/styles\/([^'"]+)\.css['"]/g,
      // Import avec alias @ mais pas @styles
      /import\s+['"]@\/styles\/([^'"]+)\.css['"]/g,
      // Import avec alias relatif
      /import\s+['"]\.\.?\/\.\.?\/styles\/([^'"]+)\.css['"]/g,
      // Import de styles dans src/
      /import\s+['"]\.\.?\/\.\.?\/src\/styles\/([^'"]+)\.css['"]/g,
      // Import granulaire avec @styles
      /import\s+['"]@styles\/([^'"]+)\.css['"]/g,
      // Import de CSS modules (on garde ceux-ci intacts)
      /import\s+([a-zA-Z0-9_]+)\s+from\s+['"]\.\.?\/([^'"]+)\.module\.css['"]/g
    ],
    
    // Les nouveaux imports standardisés
    newImports: {
      // Option 1: Import centralisé de index.css (méthode standardisée)
      index: "import '@styles/index.css';",
      
      // Option 2: Import granulaire (gardé pour rétrocompatibilité mais plus recommandé)
      granular: (cssPath) => {
        if (cssPath.includes('typography')) {
          return "import '@styles/base/typography.css';";
        } else if (cssPath.includes('variables')) {
          return "import '@styles/base/variables.css';"; 
        } else if (cssPath.includes('colors')) {
          return "import '@styles/base/colors.css';";
        } else if (cssPath.includes('reset')) {
          return "import '@styles/base/reset.css';";
        } else if (cssPath.includes('base')) {
          return "import '@styles/base/index.css';";
        } else {
          return `import '@styles/${cssPath}.css';`;
        }
      }
    }
  }
};

// Compteurs pour les statistiques
const stats = {
  filesProcessed: 0,
  filesModified: 0,
  importsReplaced: 0,
};

// Options en ligne de commande
const args = process.argv.slice(2);
const options = {
  dryRun: args.includes('--dry-run'),
  verbose: args.includes('--verbose'),
  specific: args.find(arg => arg.startsWith('--specific='))?.split('=')[1] || null,
  all: args.includes('--all'),
};

/**
 * Parcourt récursivement un répertoire pour trouver tous les fichiers JS/JSX
 * @param {string} directory - Répertoire à parcourir
 * @returns {string[]} - Liste des chemins de fichiers
 */
function findJsFiles(directory) {
  const pattern = options.specific ? 
    path.join(directory, options.specific, '**/*.{js,jsx}') : 
    path.join(directory, '**/*.{js,jsx}');
  
  return glob.sync(pattern, { ignore: ['**/node_modules/**', '**/build/**', '**/dist/**'] });
}

/**
 * Standardise les imports CSS dans un fichier
 * @param {string} filePath - Chemin du fichier à traiter
 */
function standardizeImports(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    let hasImportedIndex = false;
    let importsReplaced = 0;
    let cssModulesImports = [];
    
    // Fonction pour vérifier si le fichier contient déjà un import standardisé
    const hasStandardImport = () => {
      return content.includes("import '@styles/index.css'") || 
             content.includes("import \"@styles/index.css\"");
    };
    
    // Conserver les imports de modules CSS
    content.replace(/import\s+([a-zA-Z0-9_]+)\s+from\s+['"]([^'"]+)\.module\.css['"]/g, (match, variable, path) => {
      cssModulesImports.push(match);
      return match;
    });
    
    // Si le fichier a déjà un import standardisé, ne rien faire
    if (hasStandardImport()) {
      if (options.verbose) {
        console.log(`✓ ${filePath} : Déjà standardisé`);
      }
      return;
    }
    
    // Parcourir tous les patterns d'imports à remplacer
    CONFIG.patterns.oldImports.forEach(pattern => {
      // On conserve les imports de module CSS
      if (pattern.toString().includes('module.css')) return;
      
      // Si on a déjà importé index.css, on ne fait rien de plus
      if (hasImportedIndex) return;
      
      content = content.replace(pattern, (match, cssPath) => {
        // Ne pas remplacer les imports de modules CSS
        if (match.includes('.module.css')) return match;
        
        importsReplaced++;
        
        // Standardisation: on utilise toujours l'option 'index'
        if (!hasImportedIndex) {
          hasImportedIndex = true;
          return CONFIG.patterns.newImports.index;
        }
        
        // Si on a déjà ajouté l'import index, on supprime simplement cet import
        return '';
      });
    });
    
    // Mise à jour des statistiques
    if (content !== originalContent) {
      stats.filesModified++;
      stats.importsReplaced += importsReplaced;
      
      if (!options.dryRun) {
        fs.writeFileSync(filePath, content, 'utf8');
      }
      
      if (options.verbose) {
        console.log(`✓ ${filePath} : ${importsReplaced} import(s) remplacé(s) par import standardisé '@styles/index.css'`);
      }
    }
    
    stats.filesProcessed++;
  } catch (error) {
    console.error(`❌ Erreur lors du traitement de ${filePath}:`, error.message);
  }
}

/**
 * Fonction principale
 */
function main() {
  console.log("🔄 Standardisation des imports CSS...");
  console.log(`📌 Méthode standardisée choisie: import centralisé '@styles/index.css'`);
  console.log(`${options.dryRun ? '⚠️ Exécution en mode simulation (dry-run)' : '🛠️ Exécution en mode réel'}`);
  
  const jsFiles = findJsFiles(CONFIG.rootDir);
  console.log(`📂 ${jsFiles.length} fichiers JS/JSX trouvés`);
  
  // Traitement des fichiers
  jsFiles.forEach(file => standardizeImports(file));
  
  // Affichage des statistiques
  console.log("\n📊 Statistiques :");
  console.log(`📄 Fichiers traités: ${stats.filesProcessed}`);
  console.log(`✏️ Fichiers modifiés: ${stats.filesModified}`);
  console.log(`🔄 Imports remplacés: ${stats.importsReplaced}`);
  
  if (options.dryRun) {
    console.log("\n⚠️ Exécution en mode simulation (dry-run). Aucun fichier n'a été modifié.");
    console.log("Pour appliquer les modifications, exécutez la commande sans l'option --dry-run");
  } else {
    console.log("\n✅ Standardisation terminée! Tous les imports CSS ont été standardisés à '@styles/index.css'");
    console.log("⚠️ Note: Les imports de modules CSS (.module.css) sont conservés intacts.");
  }
}

// Exécution du script
main();