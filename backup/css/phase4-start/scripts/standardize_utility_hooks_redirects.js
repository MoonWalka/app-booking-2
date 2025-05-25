#!/usr/bin/env node
/**
 * Script pour standardiser les redirections de hooks utilitaires
 * 
 * Ce script parcourt les fichiers de redirection de hooks et les met à jour pour :
 * 1. Utiliser un import absolu depuis @/hooks/common
 * 2. Ajouter un commentaire de dépréciation standard
 * 3. S'assurer que tous les fichiers suivent le même format
 * 
 * Usage: node scripts/standardize_utility_hooks_redirects.js [--dry-run]
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Configuration
const SRC_DIR = path.resolve(__dirname, '../src');
const HOOKS_DIR = path.resolve(SRC_DIR, 'hooks');

// Liste des hooks utilitaires qui devraient être centralisés
const UTILITY_HOOKS = [
  'useSearchAndFilter',
  'useEntitySearch',
  'useFormSubmission',
  'useAddressSearch',
  'useCompanySearch',
  'useDebounce',
  'useLocationIQ'
];

// Modèle pour un fichier de redirection standardisé
const STANDARD_REDIRECT_TEMPLATE = (hookName, subdirectory) => `/**
 * @deprecated Ce hook est une redirection vers la version centralisée.
 * Veuillez utiliser directement l'importation depuis @/hooks/common:
 * import { ${hookName} } from '@/hooks/common';
 * 
 * Cette redirection sera supprimée dans une future version (après le 6 novembre 2025).
 */

// Import de la version centralisée
import ${hookName} from '@/hooks/common/${hookName}';

// Export pour maintenir la compatibilité avec le code existant
export default ${hookName};
`;

// Parse arguments
const isDryRun = process.argv.includes('--dry-run');

// Pour suivre les stats
let stats = {
  filesScanned: 0,
  filesUpdated: 0,
  filesSkipped: 0,
  errors: 0
};

/**
 * Trouve tous les fichiers de redirection de hooks utilitaires
 */
function findHookRedirects() {
  const redirects = [];
  
  // Pour chaque hook utilitaire
  UTILITY_HOOKS.forEach(hookName => {
    // Rechercher dans tous les sous-dossiers de hooks sauf common
    const subdirs = fs.readdirSync(HOOKS_DIR)
      .filter(item => {
        const itemPath = path.join(HOOKS_DIR, item);
        return fs.statSync(itemPath).isDirectory() && item !== 'common';
      });
    
    // Pour chaque sous-dossier, vérifier si le hook existe
    subdirs.forEach(subdir => {
      const hookPath = path.join(HOOKS_DIR, subdir, `${hookName}.js`);
      if (fs.existsSync(hookPath)) {
        redirects.push({
          path: hookPath,
          hookName,
          subdir
        });
      }
    });
  });
  
  return redirects;
}

/**
 * Vérifie si un fichier est une simple redirection ou une implémentation
 */
function isSimpleRedirect(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Si le fichier contient une implémentation substantielle
  // (plus de 10 lignes non vides et pas un simple import/export)
  const nonEmptyLines = content.split('\n')
    .filter(line => line.trim() && !line.trim().startsWith('//') && !line.trim().startsWith('*'));
  
  const hasImplementation = nonEmptyLines.length > 10;
  const hasLogic = content.includes('useState') || 
                  content.includes('useEffect') || 
                  content.includes('useCallback');
  
  return !hasImplementation && !hasLogic;
}

/**
 * Standardise un fichier de redirection
 */
function standardizeRedirect(redirectInfo) {
  const { path: filePath, hookName, subdir } = redirectInfo;
  
  try {
    stats.filesScanned++;
    
    // Vérifier si c'est une simple redirection
    if (!isSimpleRedirect(filePath)) {
      console.log(`[SKIP] Le fichier ${filePath} semble contenir une implémentation, pas une simple redirection.`);
      stats.filesSkipped++;
      return;
    }
    
    // Générer le contenu standardisé
    const standardContent = STANDARD_REDIRECT_TEMPLATE(hookName, subdir);
    
    // Lire le contenu actuel
    const currentContent = fs.readFileSync(filePath, 'utf8');
    
    // Si le contenu est déjà standardisé, ignorer
    if (currentContent.includes('@deprecated') && 
        currentContent.includes('import') && 
        currentContent.includes('@/hooks/common')) {
      console.log(`[SKIP] Le fichier ${filePath} est déjà standardisé.`);
      stats.filesSkipped++;
      return;
    }
    
    // Mettre à jour le fichier si nous ne sommes pas en mode dry-run
    if (!isDryRun) {
      fs.writeFileSync(filePath, standardContent);
      console.log(`[SUCCESS] Fichier standardisé: ${path.relative(process.cwd(), filePath)}`);
    } else {
      console.log(`[DRY-RUN] Fichier qui serait standardisé: ${path.relative(process.cwd(), filePath)}`);
    }
    
    stats.filesUpdated++;
  } catch (err) {
    console.error(`[ERROR] Erreur lors du traitement du fichier ${filePath}:`, err);
    stats.errors++;
  }
}

/**
 * Fonction principale
 */
function main() {
  console.log(`=== Standardisation des redirections de hooks utilitaires ${isDryRun ? '(dry-run)' : ''} ===\n`);
  
  const redirects = findHookRedirects();
  console.log(`${redirects.length} redirections de hooks utilitaires trouvées.\n`);
  
  redirects.forEach(standardizeRedirect);
  
  console.log(`\n=== Résultats de la standardisation ===`);
  console.log(`Fichiers analysés: ${stats.filesScanned}`);
  console.log(`Fichiers mis à jour: ${stats.filesUpdated}`);
  console.log(`Fichiers ignorés: ${stats.filesSkipped}`);
  console.log(`Erreurs: ${stats.errors}`);
  
  if (isDryRun) {
    console.log(`\nMode dry-run: aucune modification n'a été sauvegardée.`);
    console.log(`Utilisez le script sans --dry-run pour appliquer les modifications.`);
  }
}

// Exécution du programme
main();