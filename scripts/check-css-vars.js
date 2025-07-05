/**
 * Script pour vérifier l'utilisation des variables CSS
 * 
 * Ce script analyse les fichiers CSS du projet pour détecter :
 * - Les valeurs codées en dur (couleurs, tailles, etc.)
 * - Les variables CSS sans préfixe --tc-
 * 
 * Usage: node check-css-vars.js [--fix] [--path=./src/styles]
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Configuration
const args = process.argv.slice(2);
const shouldFix = args.includes('--fix');
const pathArg = args.find(arg => arg.startsWith('--path='));
const basePath = pathArg ? pathArg.split('=')[1] : './src';

// Regex pour détecter les problèmes
const colorRegex = /#[0-9a-fA-F]{3,8}|rgb\(.*?\)|rgba\(.*?\)/g;
const sizeRegex = /\b\d+(\.\d+)?(px|rem|em|vh|vw|%)\b/g;
const variableRegex = /var\(--(?!tc-)[a-zA-Z0-9\-_]+/g;

// Statistiques
const stats = {
  filesScanned: 0,
  filesWithIssues: 0,
  hardcodedColors: 0,
  hardcodedSizes: 0,
  nonStandardVariables: 0,
  fixedIssues: 0
};

// Fonction pour vérifier un fichier CSS
function checkCssFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const fileName = path.basename(filePath);
    let hasIssues = false;
    let contentModified = false;
    
    // Vérifier les couleurs codées en dur
    const colorMatches = [...content.matchAll(colorRegex)] || [];
    
    // Vérifier les tailles codées en dur
    const sizeMatches = [...content.matchAll(sizeRegex)] || [];
    
    // Vérifier les variables CSS sans préfixe tc-
    const variableMatches = [...content.matchAll(variableRegex)] || [];
    
    if (colorMatches.length > 0 || sizeMatches.length > 0 || variableMatches.length > 0) {
      console.log(`\x1b[1m${filePath}:\x1b[0m`);
      hasIssues = true;
      
      // Grouper par type de problème
      if (colorMatches.length > 0) {
        const uniqueColors = new Set(colorMatches.map(match => match[0]));
        console.log(`  \x1b[31m- Couleurs codées en dur (${uniqueColors.size}):\x1b[0m ${[...uniqueColors].join(', ')}`);
        stats.hardcodedColors += uniqueColors.size;
        
        // Correction si --fix est activé
        if (shouldFix) {
          // Exemple de correction (simplifiée)
          uniqueColors.forEach(color => {
            // Générer un nom de variable à partir de la couleur
            const varName = `--tc-color-${color.replace('#', '').toLowerCase()}`;
            // Remplacer dans le contenu
            const regex = new RegExp(color.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
            content = content.replace(regex, `var(${varName}, ${color})`);
          });
          contentModified = true;
          stats.fixedIssues += uniqueColors.size;
        }
      }
      
      if (sizeMatches.length > 0) {
        const uniqueSizes = new Set(sizeMatches.map(match => match[0]));
        console.log(`  \x1b[33m- Tailles codées en dur (${uniqueSizes.size}):\x1b[0m ${[...uniqueSizes].join(', ')}`);
        stats.hardcodedSizes += uniqueSizes.size;
        
        // Correction si --fix est activé
        if (shouldFix) {
          // TODO: Implémenter la correction des tailles
        }
      }
      
      if (variableMatches.length > 0) {
        const uniqueVars = new Set(variableMatches.map(match => match[0]));
        console.log(`  \x1b[36m- Variables sans préfixe tc- (${uniqueVars.size}):\x1b[0m ${[...uniqueVars].join(', ')}`);
        stats.nonStandardVariables += uniqueVars.size;
        
        // Correction si --fix est activé
        if (shouldFix) {
          uniqueVars.forEach(varRef => {
            // Extraire le nom de la variable sans le "var(--"
            const varName = varRef.replace('var(--', '--');
            // Créer le nouveau nom avec préfixe tc-
            const newVarName = varName.replace('--', '--tc-');
            // Remplacer dans le contenu
            const regex = new RegExp(varName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
            content = content.replace(regex, newVarName);
          });
          contentModified = true;
          stats.fixedIssues += uniqueVars.size;
        }
      }
      
      console.log('');
    }
    
    // Mettre à jour le fichier si des modifications ont été effectuées
    if (shouldFix && contentModified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`  \x1b[32m✓ Fichier mis à jour\x1b[0m`);
    }
    
    stats.filesScanned++;
    if (hasIssues) {
      stats.filesWithIssues++;
    }
    
    return hasIssues;
  } catch (error) {
    console.error(`Erreur lors de l'analyse de ${filePath}:`, error.message);
    return false;
  }
}

// Trouver tous les fichiers CSS
function findCssFiles(baseDir) {
  return glob.sync(`${baseDir}/**/*.css`, { ignore: ['**/node_modules/**', '**/build/**', '**/dist/**'] });
}

// Fonction principale
function main() {
  console.log('\x1b[1m\x1b[34m=== Vérification des standards CSS ===\x1b[0m');
  console.log(`Chemin de base: ${basePath}`);
  console.log(`Mode: ${shouldFix ? 'Correction automatique activée' : 'Analyse uniquement'}`);
  console.log('');
  
  const cssFiles = findCssFiles(basePath);
  console.log(`\x1b[1m${cssFiles.length} fichiers CSS trouvés.\x1b[0m`);
  console.log('');
  
  // Analyser chaque fichier
  cssFiles.forEach(file => {
    checkCssFile(file);
  });
  
  // Afficher les statistiques
  console.log('\x1b[1m\x1b[34m=== Résumé ===\x1b[0m');
  console.log(`Fichiers analysés: ${stats.filesScanned}`);
  console.log(`Fichiers avec problèmes: ${stats.filesWithIssues}`);
  console.log(`Couleurs codées en dur: ${stats.hardcodedColors}`);
  console.log(`Tailles codées en dur: ${stats.hardcodedSizes}`);
  console.log(`Variables sans préfixe tc-: ${stats.nonStandardVariables}`);
  
  if (shouldFix) {
    console.log(`Problèmes corrigés: ${stats.fixedIssues}`);
  }
  
  // Suggestion pour la prochaine étape
  if (stats.filesWithIssues > 0 && !shouldFix) {
    console.log('');
    console.log('\x1b[33mPour corriger automatiquement ces problèmes, exécutez:\x1b[0m');
    console.log('  node check-css-vars.js --fix');
  }
}

// Exécution
main();