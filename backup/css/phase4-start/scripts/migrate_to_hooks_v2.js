#!/usr/bin/env node
/**
 * Script pour migrer automatiquement les importations des hooks vers leurs versions V2
 * 
 * Ce script parcourt les fichiers JavaScript/JSX du projet et remplace 
 * les importations de hooks dépréciés par leurs versions V2 recommandées.
 * 
 * Usage: node scripts/migrate_to_hooks_v2.js [--dry-run] [--verbose]
 * 
 * Options:
 *   --dry-run   : Affiche les changements sans les appliquer
 *   --verbose   : Affiche des informations détaillées sur le processus
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Configuration
const SRC_DIR = path.resolve(__dirname, '../src');
const COMPONENTS_DIR = path.resolve(SRC_DIR, 'components');
const PAGES_DIR = path.resolve(SRC_DIR, 'pages');
const HOOKS_DIR = path.resolve(SRC_DIR, 'hooks');

// Parsing des arguments
const isDryRun = process.argv.includes('--dry-run');
const isVerbose = process.argv.includes('--verbose');

// Liste des hooks à migrer et leurs remplacements
const hooksToMigrate = [
  {
    type: 'details',
    originalHook: 'useLieuDetails',
    newHook: 'useLieuDetailsV2',
    module: '@/hooks/lieux'
  },
  {
    type: 'details',
    originalHook: 'useConcertDetails',
    newHook: 'useConcertDetailsV2',
    module: '@/hooks/concerts'
  },
  {
    type: 'details',
    originalHook: 'useArtisteDetails',
    newHook: 'useArtisteDetailsV2',
    module: '@/hooks/artistes'
  },
  {
    type: 'form',
    originalHook: 'useLieuForm',
    newHook: 'useLieuFormV2',
    module: '@/hooks/lieux'
  },
  {
    type: 'form',
    originalHook: 'useConcertForm',
    newHook: 'useConcertFormV2',
    module: '@/hooks/concerts'
  },
  {
    type: 'list',
    originalHook: 'useArtistesList',
    newHook: 'useArtistesListV2',
    module: '@/hooks/artistes'
  },
  {
    type: 'list',
    originalHook: 'useLieuxFilters',
    newHook: 'useLieuxFiltersV2',
    module: '@/hooks/lieux'
  },
  {
    type: 'search',
    originalHook: 'useLieuSearch',
    newHook: 'useLieuSearchV2',
    module: '@/hooks/lieux'
  },
  {
    type: 'search',
    originalHook: 'useProgrammateurSearch',
    newHook: 'useProgrammateurSearchV2',
    module: '@/hooks/programmateurs'
  }
];

// Pour suivre les stats
let stats = {
  filesScanned: 0,
  filesModified: 0,
  importsUpdated: 0,
  usageUpdated: 0
};

// Trouver les fichiers JS/JSX à analyser
function findJsFiles() {
  return [
    ...glob.sync(`${COMPONENTS_DIR}/**/*.{js,jsx}`),
    ...glob.sync(`${PAGES_DIR}/**/*.{js,jsx}`)
  ];
}

// Vérifier et mettre à jour un fichier
function processFile(filePath) {
  try {
    stats.filesScanned++;
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    let modified = false;

    hooksToMigrate.forEach(hookInfo => {
      const { originalHook, newHook, module } = hookInfo;

      // Pattern pour trouver l'import du hook original
      const importRegex = new RegExp(`import\\s+{([^}]*)${originalHook}([^}]*)}\\s+from\\s+['"]${module}['"]`, 'g');
      const directImportRegex = new RegExp(`import\\s+${originalHook}\\s+from\\s+['"]${module}['"]`, 'g');

      // Pattern pour trouver l'utilisation du hook
      const useRegex = new RegExp(`(const|let|var)\\s+([^=]+)=\\s*${originalHook}\\(`, 'g');

      // Remplacer les imports
      if (content.match(importRegex)) {
        content = content.replace(importRegex, (match, before, after) => {
          stats.importsUpdated++;
          modified = true;
          if (isVerbose) console.log(`[INFO] Mise à jour de l'import dans ${path.basename(filePath)}: ${originalHook} -> ${newHook}`);
          // Vérifier si newHook est déjà importé
          if (match.includes(newHook)) {
            // Supprimer l'import de originalHook
            const newBefore = before.replace(new RegExp(`\\s*${originalHook}\\s*,?`), '');
            const newAfter = after.replace(new RegExp(`\\s*,\\s*${originalHook}\\s*`), '');
            return `import {${newBefore}${newAfter}} from '${module}'`;
          } else {
            // Remplacer originalHook par newHook
            return `import {${before}${newHook}${after}} from '${module}'`;
          }
        });
      } else if (content.match(directImportRegex)) {
        content = content.replace(directImportRegex, (match) => {
          stats.importsUpdated++;
          modified = true;
          if (isVerbose) console.log(`[INFO] Mise à jour de l'import direct dans ${path.basename(filePath)}: ${originalHook} -> ${newHook}`);
          return `import { ${newHook} } from '${module}'`;
        });
      }

      // Remplacer les utilisations du hook
      if (content.match(useRegex)) {
        content = content.replace(useRegex, (match, declaration, variableName) => {
          stats.usageUpdated++;
          modified = true;
          if (isVerbose) console.log(`[INFO] Mise à jour de l'utilisation dans ${path.basename(filePath)}: ${originalHook} -> ${newHook}`);
          return `${declaration}${variableName}= ${newHook}(`;
        });
      }
    });

    // Écrire les modifications si le contenu a changé et qu'on n'est pas en mode dry-run
    if (modified && !isDryRun) {
      fs.writeFileSync(filePath, content);
      stats.filesModified++;
      console.log(`[SUCCESS] Fichier mis à jour: ${path.relative(process.cwd(), filePath)}`);
    } else if (modified && isDryRun) {
      stats.filesModified++;
      console.log(`[DRY-RUN] Fichier qui serait mis à jour: ${path.relative(process.cwd(), filePath)}`);
    }
  } catch (err) {
    console.error(`[ERROR] Erreur lors du traitement du fichier ${filePath}:`, err);
  }
}

// Fonction principale
function main() {
  console.log(`=== Migration des hooks vers les versions V2 ${isDryRun ? '(dry-run)' : ''} ===\n`);
  
  const jsFiles = findJsFiles();
  console.log(`Analyse de ${jsFiles.length} fichiers...\n`);
  
  jsFiles.forEach(processFile);
  
  console.log(`\n=== Résultats de la migration ===`);
  console.log(`Fichiers analysés: ${stats.filesScanned}`);
  console.log(`Fichiers modifiés: ${stats.filesModified}`);
  console.log(`Imports mis à jour: ${stats.importsUpdated}`);
  console.log(`Utilisations mises à jour: ${stats.usageUpdated}`);
  
  if (isDryRun) {
    console.log(`\nMode dry-run: aucune modification n'a été sauvegardée.`);
    console.log(`Utilisez le script sans --dry-run pour appliquer les modifications.`);
  }
}

// Exécution du programme
main();