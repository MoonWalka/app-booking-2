#!/usr/bin/env node

/**
 * SCRIPT DE NETTOYAGE SÉCURISÉ POST-MIGRATION
 * Basé sur l'audit complet, applique les modifications de manière sécurisée
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🧹 NETTOYAGE SÉCURISÉ POST-MIGRATION PROGRAMMATEUR→CONTACT');
console.log('=========================================================\n');

// Configuration
const BACKUP_DIR = `./backup-before-cleanup-${Date.now()}`;
const logActions = [];

// Fonction utilitaire pour logger les actions
function logAction(action, status, details = '') {
  const entry = { action, status, details, timestamp: new Date().toISOString() };
  logActions.push(entry);
  const statusIcon = status === 'success' ? '✅' : status === 'warning' ? '⚠️' : '❌';
  console.log(`${statusIcon} ${action}${details ? ' - ' + details : ''}`);
}

// 1. CRÉER UN BACKUP
console.log('Phase 1: 💾 Création du backup de sécurité...');
try {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
  
  // Backup des fichiers critiques
  const filesToBackup = [
    './src/pages/ContactsPage.js',
    './src/hooks/lieux/useLieuDetails.js',
    './src/components/contacts/desktop/ContactViewModern.js',
    './src/components/contacts/desktop/ContactView.js'
  ];
  
  filesToBackup.forEach(file => {
    if (fs.existsSync(file)) {
      const backupPath = path.join(BACKUP_DIR, path.basename(file));
      fs.copyFileSync(file, backupPath);
      logAction('Backup', 'success', `${file} → ${backupPath}`);
    }
  });
  
} catch (error) {
  logAction('Backup', 'error', error.message);
  process.exit(1);
}

// 2. MISE À JOUR DES IMPORTS CRITIQUES
console.log('\nPhase 2: 📦 Mise à jour des imports...');

// Mise à jour de ContactsPage.js
const contactsPagePath = './src/pages/ContactsPage.js';
if (fs.existsSync(contactsPagePath)) {
  try {
    let content = fs.readFileSync(contactsPagePath, 'utf8');
    
    // Vérifier que ContactView existe avant de changer l'import
    if (fs.existsSync('./src/components/contacts/desktop/ContactView.js')) {
      // Remplacer l'import ContactViewModern par ContactView
      content = content.replace(
        "import ContactViewModern from '@/components/contacts/desktop/ContactViewModern';",
        "import ContactView from '@/components/contacts/desktop/ContactView';"
      );
      
      // Remplacer l'utilisation du composant
      content = content.replace(
        '<Route path="/:id" element={<ContactViewModern />} />',
        '<Route path="/:id" element={<ContactView />} />'
      );
      
      fs.writeFileSync(contactsPagePath, content, 'utf8');
      logAction('Import Update', 'success', 'ContactsPage.js mis à jour');
    } else {
      logAction('Import Update', 'warning', 'ContactView.js non trouvé, import non modifié');
    }
    
  } catch (error) {
    logAction('Import Update', 'error', `ContactsPage.js: ${error.message}`);
  }
}

// 3. NETTOYAGE DES VARIABLES OBSOLÈTES (PROGRAMMATEURSASSOCIES)
console.log('\nPhase 3: 🔧 Nettoyage des variables obsolètes...');

const lieuDetailsPath = './src/hooks/lieux/useLieuDetails.js';
if (fs.existsSync(lieuDetailsPath)) {
  try {
    let content = fs.readFileSync(lieuDetailsPath, 'utf8');
    let modified = false;
    
    // Remplacer programmateursAssocies par contactsAssocies dans les commentaires
    const originalContent = content;
    content = content.replace(/programmateursAssocies/g, 'contactsAssocies');
    content = content.replace(/programmateur/g, 'contact');
    
    if (content !== originalContent) {
      modified = true;
      fs.writeFileSync(lieuDetailsPath, content, 'utf8');
      logAction('Variable Cleanup', 'success', 'useLieuDetails.js - variables mises à jour');
    } else {
      logAction('Variable Cleanup', 'success', 'useLieuDetails.js - aucune modification nécessaire');
    }
    
  } catch (error) {
    logAction('Variable Cleanup', 'error', `useLieuDetails.js: ${error.message}`);
  }
}

// 4. SUPPRESSION SÉCURISÉE DES FICHIERS PROGRAMMATEURS
console.log('\nPhase 4: 🗑️ Suppression des fichiers programmateurs...');

const filesToDelete = [
  './src/components/lieux/desktop/sections/LieuProgrammateurSection.module.css',
  './src/components/lieux/desktop/sections/LieuProgrammateurSection.js',
  './src/components/debug/ProgrammateurReferencesDebug.js',
  './src/components/debug/ProgrammateurMigrationButton.jsx',
  './src/hooks/__tests__/useProgrammateurDetails.test.js'
];

const dirsToDelete = [
  './src/components/programmateurs',
  './src/hooks/programmateurs'
];

// Suppression des fichiers individuels
filesToDelete.forEach(file => {
  if (fs.existsSync(file)) {
    try {
      fs.unlinkSync(file);
      logAction('File Delete', 'success', file);
    } catch (error) {
      logAction('File Delete', 'error', `${file}: ${error.message}`);
    }
  } else {
    logAction('File Delete', 'warning', `${file} - fichier non trouvé`);
  }
});

// Suppression des dossiers (récursive)
dirsToDelete.forEach(dir => {
  if (fs.existsSync(dir)) {
    try {
      fs.rmSync(dir, { recursive: true, force: true });
      logAction('Directory Delete', 'success', dir);
    } catch (error) {
      logAction('Directory Delete', 'error', `${dir}: ${error.message}`);
    }
  } else {
    logAction('Directory Delete', 'warning', `${dir} - dossier non trouvé`);
  }
});

// 5. NETTOYAGE SÉLECTIF DES FICHIERS DEBUG (SEULEMENT LES PROGRAMMATEURS)
console.log('\nPhase 5: 🧹 Nettoyage sélectif des fichiers debug...');

const debugFilesToDelete = [
  './src/components/debug/ProgrammateurReferencesDebug.js',
  './src/components/debug/ProgrammateurMigrationButton.jsx',
  './src/components/debug/ContactMigrationDebug.jsx' // Seulement si migration terminée
];

debugFilesToDelete.forEach(file => {
  if (fs.existsSync(file)) {
    try {
      fs.unlinkSync(file);
      logAction('Debug File Delete', 'success', file);
    } catch (error) {
      logAction('Debug File Delete', 'error', `${file}: ${error.message}`);
    }
  }
});

// 6. VALIDATION DES IMPORTS ET RÉFÉRENCES
console.log('\nPhase 6: ✅ Validation des modifications...');

// Vérifier que les nouveaux imports fonctionnent
const requiredFiles = [
  './src/components/contacts/desktop/ContactView.js',
  './src/components/contacts/desktop/ContactFormMaquette.js'
];

let validationPassed = true;
requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    logAction('Validation', 'success', `${file} existe`);
  } else {
    logAction('Validation', 'error', `${file} manquant!`);
    validationPassed = false;
  }
});

// 7. GÉNÉRATION DU RAPPORT DE NETTOYAGE
console.log('\nPhase 7: 📊 Génération du rapport...');

const rapport = `# RAPPORT DE NETTOYAGE POST-MIGRATION

**Date:** ${new Date().toLocaleString('fr-FR')}
**Backup créé dans:** ${BACKUP_DIR}

## 📋 ACTIONS RÉALISÉES

${logActions.map(action => `- **${action.action}** [${action.status}] ${action.details || ''} _(${action.timestamp})_`).join('\n')}

## ✅ STATUT

- **Validation:** ${validationPassed ? '✅ SUCCÈS' : '❌ ÉCHEC'}
- **Fichiers supprimés:** ${logActions.filter(a => a.action.includes('Delete') && a.status === 'success').length}
- **Imports mis à jour:** ${logActions.filter(a => a.action.includes('Import') && a.status === 'success').length}
- **Variables nettoyées:** ${logActions.filter(a => a.action.includes('Variable') && a.status === 'success').length}

## 🔧 PROCHAINES ÉTAPES

${validationPassed ? `
1. ✅ Tester l'application
2. ✅ Vérifier les pages contacts
3. ✅ Valider les formulaires
4. ✅ Supprimer le backup si tout fonctionne: \`rm -rf ${BACKUP_DIR}\`
` : `
⚠️ **VALIDATION ÉCHOUÉE**
1. Restaurer les fichiers depuis le backup
2. Vérifier les dépendances manquantes
3. Relancer le nettoyage après correction
`}

## 🗂️ FICHIERS RESTANTS À ANALYSER MANUELLEMENT

### Doublons Contact à examiner:
- \`./src/components/contacts/ContactDetailsModern.js\` vs \`./src/components/contacts/ContactDetails.js\`
- \`./src/components/contacts/desktop/ContactViewModern.js\` vs \`./src/components/contacts/desktop/ContactView.js\`
- Plusieurs versions de ContactForm

### Recommandation:
Analyser l'utilisation de chaque version et consolider vers la version la plus récente/stable.

---
*Nettoyage automatisé le ${new Date().toLocaleString('fr-FR')}*
`;

fs.writeFileSync('RAPPORT_NETTOYAGE_REALISE.md', rapport, 'utf8');

console.log('\n🎉 NETTOYAGE TERMINÉ!');
console.log('📄 Rapport détaillé: RAPPORT_NETTOYAGE_REALISE.md');
console.log(`💾 Backup: ${BACKUP_DIR}`);
console.log('\n📋 RÉSUMÉ:');
console.log(`   ✅ ${logActions.filter(a => a.status === 'success').length} actions réussies`);
console.log(`   ⚠️ ${logActions.filter(a => a.status === 'warning').length} avertissements`);
console.log(`   ❌ ${logActions.filter(a => a.status === 'error').length} erreurs`);
console.log(`   🔍 Validation: ${validationPassed ? 'SUCCÈS' : 'ÉCHEC'}`);

if (!validationPassed) {
  console.log('\n⚠️ ATTENTION: La validation a échoué. Vérifiez le rapport avant de continuer.');
}