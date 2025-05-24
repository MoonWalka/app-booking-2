#!/usr/bin/env node

/**
 * Script pour supprimer uniquement les fallbacks CSS simples
 * 
 * Ce script parcourt les fichiers CSS et supprime uniquement les fallbacks
 * simples (non imbriqués) pour éviter les problèmes de syntaxe.
 * 
 * Usage:
 * node remove_simple_fallbacks.js [--dry-run] [--verbose] [--path=src/]
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
    
    let modifiedContent = content;
    let modified = false;
    let fallbacksRemoved = 0;
    
    // Regex pour trouver uniquement les fallbacks simples
    // Cette regex exclut les cas où le fallback commence par var(
    const simpleRegex = /var\(--tc-[a-zA-Z0-9-]+,\s*(?!var\()[^)]+\)/g;
    
    // Trouver tous les fallbacks simples
    const matches = content.match(simpleRegex);
    
    if (!matches) {
      if (verbose) {
        console.log(`✓ Aucun fallback simple dans ${filePath}`);
      }
      stats.filesProcessed++;
      return;
    }
    
    const uniqueMatches = [...new Set(matches)];
    
    // Pour chaque fallback simple, créer la version sans fallback
    uniqueMatches.forEach(match => {
      const varName = match.substring(0, match.indexOf(','));
      const replacement = varName + ')';
      
      if (verbose) {
        console.log(`  Remplacement: ${match} -> ${replacement}`);
      }
      
      // Remplacer toutes les occurrences
      const occurrences = (content.match(new RegExp(match.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
      modifiedContent = modifiedContent.replace(new RegExp(match.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), replacement);
      fallbacksRemoved += occurrences;
      modified = true;
    });
    
    if (modified) {
      if (!dryRun) {
        // Sauvegarder une copie du fichier original
        fs.writeFileSync(`${filePath}.backup`, content);
        
        // Écrire le contenu modifié
        fs.writeFileSync(filePath, modifiedContent);
      }
      
      console.log(`✅ Fallbacks simples supprimés dans ${filePath} (${fallbacksRemoved} fallbacks)`);
      stats.filesModified++;
      stats.fallbacksRemoved += fallbacksRemoved;
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
