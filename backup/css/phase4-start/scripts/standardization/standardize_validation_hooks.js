/**
 * Script pour standardiser la validation dans les hooks optimisés
 * Ce script analyse les hooks optimisés et extrait les fonctions de validation
 * dans des fichiers séparés si elles sont définies dans le même fichier
 */
const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Chemins des hooks optimisés
const HOOKS_PATTERN = 'src/hooks/**/*FormOptimized.js';

// Sortie pour les logs
const LOG_FILE = 'hook_validation_standardization.log';
let logContent = `Standardisation des validations - ${new Date().toISOString()}\n\n`;

// Fonction pour extraire le nom de l'entité du nom de fichier
function extractEntityName(filePath) {
  const fileName = path.basename(filePath, '.js');
  return fileName.replace('use', '').replace('FormOptimized', '');
}

// Fonction pour vérifier si un hook a une validation interne
function hasInternalValidation(content) {
  return content.includes('validateForm = (data)') || 
         content.includes('validate') && content.includes('= (data)') && 
         content.includes('isValid:') && content.includes('errors:');
}

// Fonction pour extraire et déplacer la validation 
function extractValidation(content, entityName) {
  // Recherche d'une fonction de validation dans le fichier
  const validationRegex = /(?:const|function)\s+validate(\w+)Form\s*=\s*\(\s*data\s*\)\s*=>\s*{[\s\S]+?return\s+{[\s\S]+?isValid:[\s\S]+?errors:[\s\S]+?(?:message:[\s\S]+?)?}\s*;?\s*\}/;
  const match = content.match(validationRegex);
  
  if (!match) {
    return { content, validation: null };
  }

  const validationFunction = match[0];
  const validationFilePath = `src/utils/validation/validate${entityName}Form.js`;
  
  // Créer le contenu du fichier de validation
  const validationFileContent = `/**
 * Validation pour le formulaire de ${entityName.toLowerCase()}
 */
${validationFunction}

export default validate${entityName}Form;
`;

  // Remplacer la validation interne par une importation
  const newContent = content.replace(validationRegex, '')
    .replace(
      'import { useCallback', 
      `import { useCallback } from 'react';\nimport validate${entityName}Form from '@/utils/validation/validate${entityName}Form';`
    );

  return { 
    content: newContent, 
    validation: validationFileContent,
    validationPath: validationFilePath
  };
}

// Fonction principale
function standardizeValidationHooks() {
  // Créer le répertoire de validation s'il n'existe pas
  const validationDir = path.join(process.cwd(), 'src/utils/validation');
  if (!fs.existsSync(validationDir)) {
    fs.mkdirSync(validationDir, { recursive: true });
  }
  
  // Trouver tous les hooks optimisés
  const hookFiles = glob.sync(HOOKS_PATTERN);
  logContent += `Hooks trouvés: ${hookFiles.length}\n\n`;
  
  let modifiedFiles = 0;
  
  hookFiles.forEach(file => {
    const filePath = path.join(process.cwd(), file);
    const entityName = extractEntityName(file);
    const content = fs.readFileSync(filePath, 'utf-8');
    
    // Vérifier si la validation est définie dans ce fichier
    if (hasInternalValidation(content)) {
      const { content: newContent, validation, validationPath } = extractValidation(content, entityName);
      
      if (validation) {
        // Sauvegarder le nouveau fichier de validation
        fs.writeFileSync(path.join(process.cwd(), validationPath), validation);
        
        // Mettre à jour le hook
        fs.writeFileSync(filePath, newContent);
        
        modifiedFiles++;
        logContent += `Standardisé: ${file}\n  -> Validation extraite vers: ${validationPath}\n\n`;
      }
    } else {
      logContent += `Ignoré: ${file}\n  -> Validation déjà extraite ou non trouvée\n\n`;
    }
  });
  
  logContent += `\nBilan: ${modifiedFiles} fichiers modifiés sur ${hookFiles.length} analysés\n`;
  fs.writeFileSync(LOG_FILE, logContent);
  
  console.log(`Standardisation terminée. ${modifiedFiles} hooks ont été modifiés.`);
  console.log(`Consultez ${LOG_FILE} pour plus de détails.`);
}

// Exécution
standardizeValidationHooks();