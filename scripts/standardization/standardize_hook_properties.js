/**
 * Script pour standardiser le nommage des propriétés et l'utilisation des callbacks 
 * dans les hooks optimisés
 */
const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Chemins des hooks optimisés
const HOOKS_PATTERN = 'src/hooks/**/*FormOptimized.js';

// Sortie pour les logs
const LOG_FILE = 'hook_properties_standardization.log';
let logContent = `Standardisation des propriétés des hooks - ${new Date().toISOString()}\n\n`;

// Fonction pour extraire le nom de l'entité du nom de fichier
function extractEntityName(filePath) {
  const fileName = path.basename(filePath, '.js');
  return fileName.replace('use', '').replace('FormOptimized', '').toLowerCase();
}

// Fonction pour standardiser les noms de propriétés et callbacks
function standardizeHook(content, entityName) {
  let newContent = content;
  
  // 1. Standardiser le nom de la propriété isNew* en isNewEntity
  const isNewPropRegex = new RegExp(`const\\s+isNew${entityName.charAt(0).toUpperCase() + entityName.slice(1)}\\s*=`, 'i');
  newContent = newContent.replace(isNewPropRegex, 'const isNewEntity =');
  
  // 2. Standardiser les retours du hook pour inclure isNewEntity
  const returnObjRegex = /(return\s*{[\s\S]*?)isNew\w+,/i;
  if (returnObjRegex.test(newContent)) {
    newContent = newContent.replace(returnObjRegex, '$1isNewEntity,');
  }
  
  // 3. S'assurer que tous les callbacks utilisent useCallback
  const functionsToWrap = ['handleChange', 'resetForm', 'handleCancel', 'handleSubmit', 'updateFormData'];
  functionsToWrap.forEach(funcName => {
    // Rechercher les fonctions définies sans useCallback
    const funcDefRegex = new RegExp(`const\\s+${funcName}\\s*=\\s*\\(([^)]*?)\\)\\s*=>\\s*{`, 'g');
    newContent = newContent.replace(funcDefRegex, (match, params) => {
      if (!match.includes('useCallback')) {
        return `const ${funcName} = useCallback((${params}) => {`;
      }
      return match;
    });
    
    // Ajouter les dépendances manquantes à useCallback si nécessaire
    const callbackWithoutDepsRegex = new RegExp(`const\\s+${funcName}\\s*=\\s*useCallback\\(\\([^)]*?\\)\\s*=>\\s*{[\\s\\S]*?}\\)`, 'g');
    newContent = newContent.replace(callbackWithoutDepsRegex, (match) => {
      if (!match.includes('}, [')) {
        return `${match}, [formHook])`;
      }
      return match;
    });
  });
  
  // 4. Ajouter les raccourcis DX standard (si non présents)
  const entityPropName = entityName.toLowerCase();
  if (!newContent.includes(`${entityPropName}: formHook.formData`)) {
    // Trouver la position du retour pour ajouter les raccourcis
    const returnIndex = newContent.lastIndexOf('return {');
    if (returnIndex !== -1) {
      const beforeReturn = newContent.substring(0, returnIndex);
      const returnPart = newContent.substring(returnIndex);
      
      // Ajouter les raccourcis juste avant la fermeture de l'objet retourné
      const enhancedReturn = returnPart.replace('};\n', `  // Raccourcis pour une meilleure DX\n  ${entityPropName}: formHook.formData\n};\n`);
      
      newContent = beforeReturn + enhancedReturn;
    }
  }
  
  return newContent;
}

// Fonction principale
function standardizeHookProperties() {
  // Trouver tous les hooks optimisés
  const hookFiles = glob.sync(HOOKS_PATTERN);
  logContent += `Hooks trouvés: ${hookFiles.length}\n\n`;
  
  let modifiedFiles = 0;
  
  hookFiles.forEach(file => {
    const filePath = path.join(process.cwd(), file);
    const entityName = extractEntityName(file);
    const content = fs.readFileSync(filePath, 'utf-8');
    
    // Standardiser le hook
    const newContent = standardizeHook(content, entityName);
    
    if (content !== newContent) {
      // Sauvegarder le hook modifié
      fs.writeFileSync(filePath, newContent);
      modifiedFiles++;
      logContent += `Standardisé: ${file}\n`;
    } else {
      logContent += `Ignoré: ${file}\n  -> Aucune modification nécessaire\n`;
    }
  });
  
  logContent += `\nBilan: ${modifiedFiles} fichiers modifiés sur ${hookFiles.length} analysés\n`;
  fs.writeFileSync(LOG_FILE, logContent);
  
  console.log(`Standardisation terminée. ${modifiedFiles} hooks ont été modifiés.`);
  console.log(`Consultez ${LOG_FILE} pour plus de détails.`);
}

// Exécution
standardizeHookProperties();