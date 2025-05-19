#!/usr/bin/env node

/**
 * Script pour supprimer les fallbacks codés en dur dans les fichiers CSS
 * 
 * Ce script parcourt tous les fichiers CSS du projet et supprime les valeurs
 * de secours codées en dur dans les variables CSS.
 * Exemple: var(--tc-color-primary, #333) -> var(--tc-color-primary)
 * 
 * Usage:
 * node remove_css_fallbacks.js [--dry-run] [--verbose] [--path=src/]
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

// Expression régulière pour détecter les fallbacks dans les variables CSS
// Captures var(--tc-name, fallback)
const fallbackRegex = /var\(--tc-[a-zA-Z0-9-]+, [^)]+\)/g;

// Fonction pour traiter un fichier CSS
function processCssFile(filePath) {
  try {
    // Lire le contenu du fichier
    const content = fs.readFileSync(filePath, 'utf8');
    const fileName = path.basename(filePath);
    
    // Rechercher les fallbacks
    const matches = content.match(fallbackRegex);
    
    if (!matches) {
      // Aucun fallback trouvé dans ce fichier
      if (verbose) {
        console.log(`✓ Aucun fallback dans ${filePath}`);
      }
      stats.filesProcessed++;
      return;
    }
    
    // Créer une version modifiée du contenu
    let modifiedContent = content;
    const uniqueMatches = [...new Set(matches)]; // Supprimer les doublons
    
    // Pour chaque fallback, créer la version sans fallback
    uniqueMatches.forEach(match => {
      const varName = match.substring(0, match.indexOf(','));
      const replacement = varName + ')';
      
      if (verbose) {
        console.log(`  Remplacement: ${match} -> ${replacement}`);
      }
      
      // Remplacer toutes les occurrences
      const occurrences = (content.match(new RegExp(match.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
      modifiedContent = modifiedContent.replace(new RegExp(match.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), replacement);
      stats.fallbacksRemoved += occurrences;
    });
    
    if (content !== modifiedContent) {
      if (!dryRun) {
        // Sauvegarder une copie du fichier original
        fs.writeFileSync(`${filePath}.backup`, content);
        
        // Écrire le contenu modifié
        fs.writeFileSync(filePath, modifiedContent);
      }
      
      console.log(`✅ Fallbacks supprimés dans ${filePath} (${uniqueMatches.length} types de fallbacks)`);
      stats.filesModified++;
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
