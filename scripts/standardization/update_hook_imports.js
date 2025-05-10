/**
 * Script pour mettre à jour les importations des hooks obsolètes vers les versions optimisées
 */
const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Chemins des composants
const COMPONENTS_PATTERN = 'src/components/**/*.js';
const PAGES_PATTERN = 'src/pages/**/*.js';

// Mapping des hooks obsolètes vers leurs versions optimisées
const HOOK_MAPPING = {
  'useConcertForm': 'useConcertFormOptimized',
  'useProgrammateurForm': 'useProgrammateurFormOptimized',
  'useStructureForm': 'useStructureFormOptimized',
  'useArtisteForm': 'useArtisteFormOptimized',
  'useLieuForm': 'useLieuFormOptimized',
  'useEntrepriseForm': 'useEntrepriseFormOptimized',
};

// Sortie pour les logs
const LOG_FILE = 'hook_imports_update.log';
let logContent = `Mise à jour des importations de hooks - ${new Date().toISOString()}\n\n`;

// Fonction pour mettre à jour les importations dans un fichier
function updateImports(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf-8');
    const originalContent = content;
    let modified = false;
    let changes = [];

    // Pour chaque hook obsolète à remplacer
    Object.entries(HOOK_MAPPING).forEach(([oldHook, newHook]) => {
      // Vérifier si le hook obsolète est importé dans le fichier
      const importRegex = new RegExp(`import\\s+{[^}]*?\\b${oldHook}\\b[^}]*?}\\s+from\\s+['"](@/hooks/[^'"]+)['"]`, 'g');
      let match;
      
      while ((match = importRegex.exec(originalContent)) !== null) {
        const fullImport = match[0];
        const importPath = match[1];
        
        // Déterminer le nom du module (dossier) à partir du chemin d'importation
        const moduleMatch = importPath.match(/@\/hooks\/([^/]+)/);
        if (!moduleMatch) continue;
        
        const moduleName = moduleMatch[1];
        
        // Créer la nouvelle importation optimisée
        const newImportPath = `@/hooks/${moduleName}`;
        const newImport = fullImport.replace(oldHook, newHook).replace(importPath, newImportPath);
        
        // Mettre à jour l'importation
        content = content.replace(fullImport, newImport);
        
        // Mettre à jour les utilisations du hook dans le fichier
        const usageRegex = new RegExp(`\\b${oldHook}\\b(?=\\s*\\()`, 'g');
        const beforeCount = (content.match(usageRegex) || []).length;
        content = content.replace(usageRegex, newHook);
        const afterCount = (content.match(new RegExp(`\\b${newHook}\\b(?=\\s*\\()`, 'g')) || []).length;
        
        changes.push(`${oldHook} -> ${newHook} (${beforeCount} usages)`);
        modified = true;
      }
    });

    // Sauvegarder le fichier modifié
    if (modified) {
      fs.writeFileSync(filePath, content);
      return {
        modified,
        changes
      };
    }

    return { modified: false };
    
  } catch (error) {
    console.error(`Erreur lors de la mise à jour de ${filePath}:`, error);
    return { 
      modified: false,
      error: error.message
    };
  }
}

// Fonction principale
function updateHookImports() {
  // Trouver tous les fichiers de composants et pages
  const files = [
    ...glob.sync(COMPONENTS_PATTERN),
    ...glob.sync(PAGES_PATTERN)
  ];
  
  logContent += `Fichiers à analyser: ${files.length}\n\n`;
  
  let modifiedFiles = 0;
  
  files.forEach(file => {
    const filePath = path.join(process.cwd(), file);
    const { modified, changes, error } = updateImports(filePath);
    
    if (modified) {
      modifiedFiles++;
      logContent += `Modifié: ${file}\n`;
      changes.forEach(change => {
        logContent += `  - ${change}\n`;
      });
      logContent += '\n';
    } else if (error) {
      logContent += `Erreur: ${file}\n  -> ${error}\n\n`;
    }
  });
  
  logContent += `\nBilan: ${modifiedFiles} fichiers modifiés sur ${files.length} analysés\n`;
  fs.writeFileSync(LOG_FILE, logContent);
  
  console.log(`Mise à jour terminée. ${modifiedFiles} fichiers ont été modifiés.`);
  console.log(`Consultez ${LOG_FILE} pour plus de détails.`);
}

// Exécution
updateHookImports();