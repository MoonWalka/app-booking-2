#!/usr/bin/env node

/**
 * Script pour supprimer les fallbacks codés en dur dans les fichiers CSS
 * 
 * Ce script parcourt tous les fichiers CSS du projet et supprime les valeurs
 * de secours codées en dur dans les variables CSS.
 * Exemple: var(--tc-color-primary, #333) -> var(--tc-color-primary)
 * 
 * Usage:
 * node remove_css_fallbacks_fixed.js [--dry-run] [--verbose] [--path=src/]
 * 
 * Options:
 *   --dry-run    Simule les modifications sans écrire dans les fichiers
 *   --verbose    Affiche les détails des modifications
 *   --path       Chemin du répertoire à traiter (par défaut: src/)
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Traitement des arguments
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const verbose = args.includes('--verbose');
const pathArg = args.find(arg => arg.startsWith('--path='));
const rootPath = pathArg ? pathArg.split('=')[1] : 'src/';

// Statistiques
const stats = {
  filesProcessed: 0,
  filesModified: 0,
  fallbacksRemoved: 0
};

// Fonction pour traiter un fichier CSS
function processCssFile(filePath) {
  try {
    // Lire le contenu du fichier
    const content = fs.readFileSync(filePath, 'utf8');
    const fileName = path.basename(filePath);
    
    // Utiliser une approche différente pour détecter et remplacer les fallbacks
    // Cette méthode est plus précise et évite les problèmes de expressions régulières
    let modifiedContent = content;
    let modified = false;
    let fallbacksRemoved = 0;
    
    // Fonction récursive pour trouver et remplacer les variables CSS avec fallbacks
    function processVariableDeclarations(cssText) {
      let resultText = cssText;
      const regex = /var\(--tc-[a-zA-Z0-9-]+,\s*([^)]+)\)/g;
      
      let match;
      let modifications = [];
      
      // Collecter toutes les modifications à faire
      while ((match = regex.exec(cssText)) !== null) {
        const fullMatch = match[0];
        const fallbackValue = match[1].trim();
        
        // Ne pas traiter les cas où le fallback est lui-même une variable CSS
        // Cela évite le problème des parenthèses mal équilibrées
        if (fallbackValue.startsWith('var(') && !isSafeToReplace(fullMatch)) {
          continue;
        }
        
        const varName = fullMatch.substring(0, fullMatch.indexOf(','));
        const replacement = varName + ')';
        
        modifications.push({
          fullMatch,
          replacement,
          position: match.index
        });
      }
      
      // Appliquer les modifications de la fin vers le début
      // pour éviter que les positions ne changent après chaque remplacement
      modifications.sort((a, b) => b.position - a.position);
      
      for (const mod of modifications) {
        resultText = resultText.substring(0, mod.position) + 
                     mod.replacement + 
                     resultText.substring(mod.position + mod.fullMatch.length);
        
        if (verbose) {
          console.log(`  Remplacement: ${mod.fullMatch} -> ${mod.replacement}`);
        }
        
        fallbacksRemoved++;
        modified = true;
      }
      
      return resultText;
    }
    
    // Fonction pour vérifier si un remplacement est sûr
    // (évite les cas complexes imbriqués qui pourraient causer des erreurs)
    function isSafeToReplace(varDeclaration) {
      // Compter les parenthèses ouvrantes et fermantes
      let openParens = 0;
      let foundComma = false;
      
      for (let i = 0; i < varDeclaration.length; i++) {
        if (varDeclaration[i] === '(') {
          openParens++;
        } else if (varDeclaration[i] === ')') {
          openParens--;
        } else if (varDeclaration[i] === ',' && openParens === 1) {
          foundComma = true;
        }
      }
      
      // Si nous avons plus d'une paire de parenthèses après la virgule,
      // c'est probablement une variable imbriquée, donc ne pas la remplacer
      return foundComma && openParens === 0;
    }
    
    // Traiter le contenu
    modifiedContent = processVariableDeclarations(content);
    
    if (modified) {
      if (!dryRun) {
        // Sauvegarder une copie du fichier original
        fs.writeFileSync(`${filePath}.backup`, content);
        
        // Écrire le contenu modifié
        fs.writeFileSync(filePath, modifiedContent);
      }
      
      console.log(`✅ Fallbacks supprimés dans ${filePath} (${fallbacksRemoved} fallbacks)`);
      stats.filesModified++;
      stats.fallbacksRemoved += fallbacksRemoved;
    } else {
      if (verbose) {
        console.log(`✓ Aucun fallback à supprimer dans ${filePath}`);
      }
    }
    
    stats.filesProcessed++;
  } catch (error) {
    console.error(`❌ Erreur lors du traitement de ${filePath}:`, error.message);
  }
}

// Fonction principale
function main() {
  console.log(`\n🔍 Recherche des fichiers CSS dans ${rootPath}...\n`);
  
  // Trouver tous les fichiers CSS dans le chemin spécifié
  const cssFiles = glob.sync(`${rootPath}/**/*.css`);
  
  if (cssFiles.length === 0) {
    console.log(`❌ Aucun fichier CSS trouvé dans ${rootPath}`);
    return;
  }
  
  console.log(`📂 ${cssFiles.length} fichiers CSS trouvés.\n`);
  
  if (dryRun) {
    console.log('⚠️ Mode simulation (--dry-run): aucune modification ne sera effectuée.\n');
  }
  
  // Traiter chaque fichier CSS
  cssFiles.forEach(processCssFile);
  
  // Afficher les statistiques
  console.log(`\n📊 Statistiques:`);
  console.log(`  • Fichiers traités: ${stats.filesProcessed}`);
  console.log(`  • Fichiers modifiés: ${stats.filesModified}`);
  console.log(`  • Fallbacks supprimés: ${stats.fallbacksRemoved}`);
  
  if (dryRun) {
    console.log(`\n⚠️ Mode simulation: aucune modification n'a été effectuée.`);
    console.log(`   Exécutez sans l'option --dry-run pour appliquer les modifications.`);
  } else if (stats.filesModified > 0) {
    console.log(`\n✅ Terminé! Des fichiers de sauvegarde (.backup) ont été créés.`);
  } else {
    console.log(`\n✅ Terminé! Aucune modification n'a été nécessaire.`);
  }
}

// Exécuter le script
main();
