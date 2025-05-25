/**
 * Script pour la suppression définitive de l'ancien composant Card
 * À exécuter à la date planifiée de suppression (15 août 2025)
 * 
 * Ce script:
 * 1. Vérifie qu'aucun composant n'utilise plus l'ancien Card
 * 2. Supprime définitivement le fichier legacy
 * 3. Sauvegarde une copie dans un dossier d'archive
 * 4. Met à jour les règles ESLint (en supprimant les règles désormais inutiles)
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Chemins des fichiers
const LEGACY_CARD_PATH = path.resolve(__dirname, '../../src/components/common/ui/Card.js');
const ARCHIVE_DIR = path.resolve(__dirname, '../../backup_deleted_files/legacy_components');
const ARCHIVE_PATH = path.resolve(ARCHIVE_DIR, `Card_legacy_${new Date().toISOString().slice(0, 10)}.js`);
const ESLINT_CONFIG_PATH = path.resolve(__dirname, '../../.eslintrc.js');
const ESLINT_IGNORE_PATH = path.resolve(__dirname, '../../.eslintignore');

// Fonction pour créer le répertoire d'archive si nécessaire
function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`✅ Répertoire créé: ${dirPath}`);
  }
}

// Fonction pour exécuter l'audit Card
function runCardAudit() {
  try {
    console.log('🔍 Exécution de l\'audit Card pour vérifier qu\'aucun composant n\'utilise plus l\'ancien Card...');
    execSync('npm run audit:card', { stdio: 'inherit' });
    return true;
  } catch (error) {
    console.error('❌ Échec de l\'audit Card. Veuillez vérifier les erreurs ci-dessus.');
    return false;
  }
}

// Fonction pour supprimer les règles ESLint désormais inutiles
function updateEslintConfig() {
  try {
    console.log('🔧 Mise à jour de la configuration ESLint...');
    
    if (fs.existsSync(ESLINT_CONFIG_PATH)) {
      let eslintConfig = fs.readFileSync(ESLINT_CONFIG_PATH, 'utf8');
      
      // Supprimer la règle no-restricted-imports pour Card legacy
      // Cette approche est simplifiée - dans un cas réel, un parsing plus robuste serait nécessaire
      const updatedConfig = eslintConfig.replace(
        /\/\/ Interdire l'importation de l'ancien composant Card déprécié[\s\S]*?patterns: \[[^\]]*\]\s*}\]\s*,/,
        '// Règles personnalisées pour le projet\n  rules: {'
      );
      
      fs.writeFileSync(ESLINT_CONFIG_PATH, updatedConfig);
      console.log('✅ Configuration ESLint mise à jour');
    }
    
    // Mettre à jour .eslintignore pour supprimer l'exception pour Card legacy
    if (fs.existsSync(ESLINT_IGNORE_PATH)) {
      let eslintIgnore = fs.readFileSync(ESLINT_IGNORE_PATH, 'utf8');
      const updatedIgnore = eslintIgnore.replace(
        /# Le composant Card déprécié lui-même \(déjà marqué comme déprécié\)\nsrc\/components\/common\/ui\/Card\.js\n\n/,
        ''
      );
      fs.writeFileSync(ESLINT_IGNORE_PATH, updatedIgnore);
      console.log('✅ .eslintignore mis à jour');
    }
    
    return true;
  } catch (error) {
    console.error(`❌ Erreur lors de la mise à jour des règles ESLint: ${error.message}`);
    return false;
  }
}

// Fonction principale
function main() {
  console.log('🗑️ Suppression définitive du composant Card legacy...');
  console.log('Date de suppression prévue: 15 août 2025');
  
  const currentDate = new Date();
  const targetDate = new Date('2025-08-15');
  
  // Vérification de date (optionnelle)
  if (currentDate < targetDate) {
    console.warn('⚠️ ATTENTION: La date de suppression prévue n\'est pas encore atteinte.');
    console.warn('Poursuivre quand même? (Ctrl+C pour annuler)');
    // Dans un script interactif, on ajouterait une confirmation ici
  }

  try {
    // Vérifier que le fichier legacy existe
    if (!fs.existsSync(LEGACY_CARD_PATH)) {
      console.error('❌ Le fichier legacy Card.js n\'existe pas à l\'emplacement attendu.');
      return;
    }
    
    // Exécuter l'audit Card
    if (!runCardAudit()) {
      console.error('❌ Suppression annulée. Veuillez corriger les problèmes détectés par l\'audit.');
      return;
    }
    
    // Créer le répertoire d'archive si nécessaire
    ensureDirectoryExists(ARCHIVE_DIR);
    
    // Archiver le fichier legacy
    console.log('📦 Archivage du fichier legacy...');
    fs.copyFileSync(LEGACY_CARD_PATH, ARCHIVE_PATH);
    console.log(`✅ Fichier archivé: ${ARCHIVE_PATH}`);
    
    // Supprimer le fichier legacy
    console.log('🗑️ Suppression du fichier legacy...');
    fs.unlinkSync(LEGACY_CARD_PATH);
    console.log('✅ Fichier legacy supprimé avec succès');
    
    // Mettre à jour les règles ESLint
    updateEslintConfig();
    
    console.log('\n🎉 Suppression du composant Card legacy terminée avec succès!');
    console.log('N\'oubliez pas de mettre à jour la documentation pour refléter cette suppression.');
    console.log('Suggestion: Ajouter une note dans docs/migration/card-deprecation-plan.md');
  } catch (error) {
    console.error(`❌ Une erreur est survenue: ${error.message}`);
  }
}

main();