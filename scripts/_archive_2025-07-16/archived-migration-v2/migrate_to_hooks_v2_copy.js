#!/usr/bin/env node
/**
 * Script pour migrer automatiquement les importations et utilisations des hooks dépréciés 
 * vers leurs versions V2.
 * 
 * Utilisation: node scripts/migrations/migrate_to_hooks_v2.js [--dry-run] [--path=your/custom/path]
 * 
 * Options:
 *   --dry-run: Affiche les changements sans les appliquer
 *   --path: Spécifie un chemin personnalisé à analyser (par défaut: src/)
 *   --verbose: Affiche des informations détaillées sur le processus de migration
 * 
 * Ce script recherche et remplace à la fois:
 *   1. Les importations de hooks dépréciés (e.g., import { useXxxDetails } from '@/hooks/xxx')
 *   2. Les utilisations de hooks dépréciés (e.g., const result = useXxxDetails(id))
 * 
 * Créé le: 7 mai 2025
 */

const fs = require('fs');
const path = require('path');
const util = require('util');
const { execSync } = require('child_process');

// Lecture des arguments
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const isVerbose = args.includes('--verbose');
const pathArg = args.find(arg => arg.startsWith('--path='));
const basePath = pathArg ? pathArg.split('=')[1] : path.join(process.cwd(), 'src');

// Configuration: hooks dépréciés et leurs remplacements
const HOOKS_TO_MIGRATE = [
  {
    name: 'useProgrammateurDetails',
    replacement: 'useProgrammateurDetailsV2',
    module: '@/hooks/programmateurs'
  },
  {
    name: 'useLieuDetails',
    replacement: 'useLieuDetailsV2',
    module: '@/hooks/lieux'
  },
  {
    name: 'useConcertDetails',
    replacement: 'useConcertDetailsV2',
    module: '@/hooks/concerts'
  },
  {
    name: 'useArtisteDetails',
    replacement: 'useArtisteDetailsV2',
    module: '@/hooks/artistes'
  },
  {
    name: 'useStructureDetails',
    replacement: 'useStructureDetailsV2',
    module: '@/hooks/structures'
  },
  {
    name: 'useContratDetails',
    replacement: 'useContratDetailsV2',
    module: '@/hooks/contrats'
  },
  {
    name: 'useArtistesList',
    replacement: 'useArtistesListV2',
    module: '@/hooks/artistes'
  },
  {
    name: 'useLieuxFilters',
    replacement: 'useLieuxFiltersV2',
    module: '@/hooks/lieux'
  }
];

// Statistiques pour le rapport
const stats = {
  filesScanned: 0,
  filesModified: 0,
  importChanges: 0,
  usageChanges: 0
};

/**
 * Récupère tous les fichiers JS/JSX dans un répertoire de manière récursive
 * @param {string} dir - Le répertoire à parcourir
 * @param {string[]} filelist - Liste de fichiers (utilisée pour la récursion)
 * @returns {string[]} - Liste des chemins des fichiers
 */
function getFilesRecursively(dir, filelist = []) {
  try {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
      const filepath = path.join(dir, file);
      
      if (fs.statSync(filepath).isDirectory()) {
        // Ignorer node_modules et .git
        if (file !== 'node_modules' && file !== '.git' && file !== 'build') {
          filelist = getFilesRecursively(filepath, filelist);
        }
      } else if (/\.(js|jsx|ts|tsx)$/.test(file)) {
        filelist.push(filepath);
      }
    });
    
    return filelist;
  } catch (error) {
    console.error(`Erreur lors de la lecture du répertoire ${dir}:`, error);
    return filelist;
  }
}

/**
 * Migre un fichier en remplaçant les hooks dépréciés par leurs versions V2
 * @param {string} filepath - Chemin du fichier à migrer
 */
function migrateFile(filepath) {
  try {
    stats.filesScanned++;
    let content = fs.readFileSync(filepath, 'utf8');
    let modified = false;
    let newContent = content;
    
    // Pour chaque hook à migrer
    for (const hook of HOOKS_TO_MIGRATE) {
      // 1. Remplacer les importations
      const importPattern = new RegExp(`import\\s+{([^}]*)${hook.name}([^}]*)}\\s+from\\s+['"](${hook.module}|@/hooks/[^'"]+)['"]`, 'g');
      newContent = newContent.replace(importPattern, (match, before, after, modulePath) => {
        stats.importChanges++;
        modified = true;
        
        // Si le hook de remplacement est déjà importé, ne pas le rajouter
        if (match.includes(hook.replacement)) {
          return match;
        }
        
        return `import {${before}${hook.replacement}${after}} from '${modulePath}'`;
      });
      
      // 2. Remplacer les utilisations (déclarations const, let, var)
      const usagePattern = new RegExp(`(const|let|var)\\s+([^=]*)=\\s*${hook.name}\\s*\\(`, 'g');
      newContent = newContent.replace(usagePattern, (match, declarationType, variableNames) => {
        stats.usageChanges++;
        modified = true;
        return `${declarationType}${variableNames}= ${hook.replacement}(`;
      });
      
      // 3. Remplacer les autres utilisations (appels directs)
      const directCallPattern = new RegExp(`([^a-zA-Z0-9_])${hook.name}\\(`, 'g');
      newContent = newContent.replace(directCallPattern, (match, prefix) => {
        stats.usageChanges++;
        modified = true;
        return `${prefix}${hook.replacement}(`;
      });
    }
    
    if (modified) {
      stats.filesModified++;
      
      if (isVerbose) {
        console.log(`\n📄 Fichier modifié: ${filepath}`);
      }
      
      if (!isDryRun) {
        fs.writeFileSync(filepath, newContent, 'utf8');
      }
    }
  } catch (error) {
    console.error(`Erreur lors de la migration du fichier ${filepath}:`, error);
  }
}

/**
 * Fonction principale
 */
function main() {
  console.log(`\n🚀 Démarrage de la migration des hooks vers les versions V2`);
  console.log(`📂 Répertoire de base: ${basePath}`);
  console.log(`🔍 Mode: ${isDryRun ? 'Simulation (dry-run)' : 'Migration réelle'}\n`);
  
  // Récupérer tous les fichiers JS/JSX du projet
  const files = getFilesRecursively(basePath);
  
  // Migrer chaque fichier
  files.forEach(file => migrateFile(file));
  
  // Afficher un résumé
  console.log('\n📊 Résumé de la migration:');
  console.log(`   - Fichiers analysés: ${stats.filesScanned}`);
  console.log(`   - Fichiers modifiés: ${stats.filesModified}`);
  console.log(`   - Importations mises à jour: ${stats.importChanges}`);
  console.log(`   - Utilisations mises à jour: ${stats.usageChanges}`);
  
  if (isDryRun) {
    console.log('\n⚠️  C\'était un mode simulation. Aucun fichier n\'a été modifié.');
    console.log('   Pour effectuer les modifications, relancez sans l\'argument --dry-run');
  } else if (stats.filesModified > 0) {
    console.log('\n✅ Migration terminée avec succès!');
    
    // Suggestion d'exécuter les tests
    console.log('\n💡 Suggestion: Exécutez vos tests pour vérifier que tout fonctionne correctement:');
    console.log('   npm test');
  } else {
    console.log('\n✅ Aucun fichier n\'a eu besoin d\'être modifié.');
  }
}

// Lancer le script
main();