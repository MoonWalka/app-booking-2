#!/usr/bin/env node
/**
 * Script d'automatisation de la migration des hooks originaux vers des wrappers
 * autour de leurs versions migrées.
 * 
 * Usage: node migrate_hooks_to_wrappers.js
 * 
 * Ce script:
 * 1. Identifie les paires de hooks (original + migré)
 * 2. Transforme le hook original en wrapper autour de sa version migrée
 * 3. Met à jour le fichier index.js pour exporter les deux versions
 */

const fs = require('fs');
const path = require('path');
const util = require('util');
const execSync = require('child_process').execSync;

const readFileAsync = util.promisify(fs.readFile);
const writeFileAsync = util.promisify(fs.writeFile);

console.log('🔄 Démarrage du script de migration des hooks...');

const HOOKS_DIR = path.join(__dirname, '../src/hooks');
console.log(`📂 Dossier des hooks : ${HOOKS_DIR}`);

const ENTITY_TYPES = ['programmateurs', 'lieux', 'artistes', 'concerts', 'structures', 'contrats'];
console.log(`📊 Types d'entités à traiter : ${ENTITY_TYPES.join(', ')}`);

// Template pour le wrapper
const WRAPPER_TEMPLATE = (entityType, hookName, migratedHookName) => `/**
 * @deprecated Ce hook est déprécié et sera supprimé dans une future version.
 * Veuillez utiliser le hook migré vers les hooks génériques à la place:
 * import { ${hookName}V2 } from '@/hooks/${entityType}';
 * 
 * Hook pour gérer les détails d'un ${entityType.slice(0, -1)} 
 * @param {string} id - ID du ${entityType.slice(0, -1)}
 * @returns {Object} - Données et fonctions pour la gestion du ${entityType.slice(0, -1)}
 */
import ${migratedHookName} from './${migratedHookName}';
import { useEffect } from 'react';

const ${hookName} = (id) => {
  // Afficher un avertissement de dépréciation
  useEffect(() => {
    console.warn(
      'Avertissement: ${hookName} est déprécié. ' +
      'Veuillez utiliser ${hookName}V2 depuis @/hooks/${entityType} à la place.'
    );
  }, []);
  
  // Utiliser la version migrée qui est basée sur useGenericEntityDetails
  const migratedHook = ${migratedHookName}(id);
  
  // Adapter l'API pour être compatible avec les composants existants
  return {
    // Propriétés de la version originale
    ${entityType.slice(0, -1)}: migratedHook.entity,
    loading: migratedHook.isLoading,
    error: migratedHook.error,
    isEditing: migratedHook.isEditing,
    formData: migratedHook.formData,
    isSubmitting: migratedHook.isSubmitting,
    
    // Fonctions de la version originale
          handleEdit: migratedHook.handleEdit,
    setFormData: migratedHook.updateFormData,
    handleChange: (e) => {
      const { name, value } = e.target;
      
      if (name.includes('.')) {
        const [section, field] = name.split('.');
        migratedHook.updateFormData(prevState => ({
          ...prevState,
          [section]: {
            ...prevState[section],
            [field]: value
          }
        }));
      } else {
        migratedHook.updateFormData(prevState => ({
          ...prevState,
          [name]: value
        }));
      }
    },
    handleSubmit: migratedHook.saveEntity,
    handleDelete: migratedHook.deleteEntity,
    formatValue: migratedHook.formatValue
  };
};

export default ${hookName};
`;

// Template pour la mise à jour du fichier index.js
const INDEX_TEMPLATE = (hookName, migratedHookName) => `
// Export de la version migrée avec son nom original
export { default as ${migratedHookName} } from './${migratedHookName}';

/**
 * @recommended La version migrée du hook ${hookName} basée sur les hooks génériques.
 * À utiliser dans les nouveaux développements.
 */
export { default as ${hookName}V2 } from './${migratedHookName}';
`;

/**
 * Recherche les paires de hooks originaux et migrés
 */
async function findHookPairs() {
  const hookPairs = [];
  
  for (const entityType of ENTITY_TYPES) {
    const entityDir = path.join(HOOKS_DIR, entityType);
    console.log(`🔍 Analyse du dossier ${entityDir}...`);
    
    // Vérifier si le dossier existe
    if (!fs.existsSync(entityDir)) {
      console.warn(`⚠️ Le dossier ${entityDir} n'existe pas. Passage au suivant.`);
      continue;
    }
    
    const files = fs.readdirSync(entityDir);
    console.log(`📄 ${files.length} fichiers trouvés dans ${entityType}.`);
    
    // Rechercher les hooks migrés
    const migratedHooks = files.filter(file => file.includes('Migrated') && file.endsWith('.js'));
    console.log(`📦 ${migratedHooks.length} hooks migrés trouvés : ${migratedHooks.join(', ')}`);
    
    for (const migratedHook of migratedHooks) {
      // Convertir useSomethingMigrated.js en useSomething.js
      const originalHook = migratedHook.replace('Migrated', '');
      console.log(`🔄 Recherche du hook original correspondant à ${migratedHook} => ${originalHook}`);
      
      // Vérifier si le hook original existe
      if (files.includes(originalHook)) {
        console.log(`✅ Le hook original ${originalHook} existe!`);
        
        const hookName = originalHook.replace('.js', '');
        const migratedHookName = migratedHook.replace('.js', '');
        
        hookPairs.push({
          entityType,
          hookName,
          migratedHookName,
          originalPath: path.join(entityDir, originalHook),
          migratedPath: path.join(entityDir, migratedHook)
        });
      } else {
        console.log(`❌ Le hook original ${originalHook} n'existe pas.`);
      }
    }
  }
  
  return hookPairs;
}

/**
 * Transforme le hook original en wrapper
 */
async function transformHookToWrapper(hookPair) {
  const { entityType, hookName, migratedHookName, originalPath } = hookPair;
  
  // Lire le contenu du hook original (pour archivage)
  const originalContent = await readFileAsync(originalPath, 'utf-8');
  
  // Sauvegarder une copie du hook original
  const backupPath = `${originalPath}.backup`;
  await writeFileAsync(backupPath, originalContent);
  console.log(`✅ Sauvegarde de ${originalPath} vers ${backupPath}`);
  
  // Générer le contenu du wrapper
  const wrapperContent = WRAPPER_TEMPLATE(entityType, hookName, migratedHookName);
  
  // Écrire le wrapper dans le fichier original
  await writeFileAsync(originalPath, wrapperContent);
  console.log(`✅ Transformation de ${hookName} en wrapper autour de ${migratedHookName}`);
  
  return true;
}

/**
 * Met à jour le fichier index.js pour exporter les deux versions du hook
 */
async function updateIndexFile(hookPair) {
  const { entityType, hookName, migratedHookName } = hookPair;
  const indexPath = path.join(HOOKS_DIR, entityType, 'index.js');
  
  // Vérifier si le fichier index.js existe
  if (!fs.existsSync(indexPath)) {
    console.warn(`Le fichier ${indexPath} n'existe pas. Création en cours.`);
    await writeFileAsync(indexPath, `// src/hooks/${entityType}/index.js\n`);
  }
  
  // Lire le contenu actuel
  let indexContent = await readFileAsync(indexPath, 'utf-8');
  
  // Vérifier si le hook est déjà exporté
  if (!indexContent.includes(`export { default as ${hookName} }`)) {
    console.warn(`Le hook ${hookName} n'est pas exporté dans ${indexPath}. Ajout impossible.`);
    return false;
  }
  
  // Vérifier si les exportations migrées sont déjà présentes
  if (indexContent.includes(`export { default as ${migratedHookName} }`)) {
    console.log(`Les exportations pour ${migratedHookName} existent déjà dans ${indexPath}.`);
    return true;
  }
  
  // Ajouter les nouvelles exportations (après l'exportation du hook original)
  const exportRegex = new RegExp(`export\\s+\\{\\s*default\\s+as\\s+${hookName}\\s*\\}[^;]*;`);
  const newExports = INDEX_TEMPLATE(hookName, migratedHookName);
  
  indexContent = indexContent.replace(
    exportRegex,
    match => `${match}\n${newExports}`
  );
  
  // Écrire le contenu mis à jour
  await writeFileAsync(indexPath, indexContent);
  console.log(`✅ Mise à jour du fichier ${indexPath} pour exporter ${migratedHookName} et ${hookName}V2`);
  
  return true;
}

/**
 * Processus principal
 */
async function main() {
  try {
    console.log('🔍 Recherche des paires de hooks originaux et migrés...');
    const hookPairs = await findHookPairs();
    
    console.log(`🎯 ${hookPairs.length} paires de hooks trouvées :`);
    if (hookPairs.length === 0) {
      console.log('❌ Aucune paire de hooks trouvée. Vérifiez les noms de fichiers et les dossiers.');
      return;
    }

    for (const pair of hookPairs) {
      console.log(`   - ${pair.hookName} + ${pair.migratedHookName} (${pair.entityType})`);
    }
    
    console.log('\n🔄 Transformation des hooks originaux en wrappers...');
    for (const pair of hookPairs) {
      try {
        await transformHookToWrapper(pair);
        await updateIndexFile(pair);
        console.log(`✅ Migration complète pour ${pair.hookName} -> ${pair.migratedHookName}`);
      } catch (error) {
        console.error(`❌ Erreur lors de la migration de ${pair.hookName} :`, error);
      }
    }
  
    console.log('\n📝 Mise à jour du document de migration...');
    // Mise à jour du document PLAN_RESTRUCTURATION_HOOKS.md pour refléter l'avancement
    try {
      const docPath = path.join(__dirname, '../docs/hooks/PLAN_RESTRUCTURATION_HOOKS.md');
      console.log(`📄 Chemin du document : ${docPath}`);
      
      execSync(`sed -i "" "s/🔄 Implémenter la stratégie de wrapper pour les autres hooks (en cours)/✅ Implémentation de la stratégie de wrapper pour tous les hooks (terminé)/g" "${docPath}"`);
      console.log('✅ Document mis à jour avec succès.');
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour du document :', error);
    }
    
    console.log('\n✅ Migration terminée !');
    console.log('N\'oubliez pas de tester les hooks migrés pour vous assurer que tout fonctionne correctement.');
  } catch (error) {
    console.error('❌ Erreur non gérée :', error);
  }
}

// Exécution du script
console.log('🚀 Lancement de la migration des hooks...');
main().catch(error => {
  console.error('Erreur fatale :', error);
  process.exit(1);
});