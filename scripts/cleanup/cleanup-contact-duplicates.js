#!/usr/bin/env node

/**
 * NETTOYAGE FINAL DES DOUBLONS CONTACT
 * Supprime les fichiers identifiés comme non utilisés ou obsolètes
 */

const fs = require('fs');
const path = require('path');

console.log('🗑️ NETTOYAGE FINAL DES DOUBLONS CONTACT');
console.log('========================================\n');

// Configuration basée sur l'analyse
const BACKUP_DIR = `./backup-duplicates-cleanup-${Date.now()}`;
const logActions = [];

function logAction(action, status, details = '') {
  const entry = { action, status, details, timestamp: new Date().toISOString() };
  logActions.push(entry);
  const statusIcon = status === 'success' ? '✅' : status === 'warning' ? '⚠️' : '❌';
  console.log(`${statusIcon} ${action}${details ? ' - ' + details : ''}`);
}

// 1. CRÉER UN BACKUP DE SÉCURITÉ
console.log('Phase 1: 💾 Backup de sécurité...');
try {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
  
  const filesToBackup = [
    './src/components/contacts/desktop/ContactViewV2.js',
    './src/components/contacts/desktop/ContactViewModern.js', // Au cas où
    './src/components/contacts/ContactDetailsModern.js' // Au cas où
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

// 2. SUPPRESSION DES FICHIERS NON UTILISÉS
console.log('\nPhase 2: 🗑️ Suppression des fichiers non utilisés...');

// Fichier identifié comme complètement non utilisé
const filesToDelete = [
  './src/components/contacts/desktop/ContactViewV2.js' // 0 usages détectés
];

filesToDelete.forEach(file => {
  if (fs.existsSync(file)) {
    try {
      fs.unlinkSync(file);
      logAction('Delete Unused', 'success', file);
    } catch (error) {
      logAction('Delete Unused', 'error', `${file}: ${error.message}`);
    }
  } else {
    logAction('Delete Unused', 'warning', `${file} - fichier non trouvé`);
  }
});

// 3. ANALYSE SUPPLÉMENTAIRE DES FICHIERS POTENTIELLEMENT OBSOLÈTES
console.log('\nPhase 3: 🔍 Analyse des fichiers potentiellement obsolètes...');

// Fichiers avec peu d'usages qui pourraient être obsolètes
const suspiciousFiles = [
  {
    file: './src/components/contacts/ContactDetailsModern.js',
    usages: 4,
    reason: 'Wrapper obsolète - ContactView directement utilisé'
  },
  {
    file: './src/components/contacts/desktop/ContactViewModern.js', 
    usages: 1,
    reason: 'Version intermédiaire - ContactView plus récent'
  },
  {
    file: './src/hooks/contacts/useContactDetailsModern.js',
    usages: 4,
    reason: 'Hook obsolète pour ContactViewModern'
  }
];

console.log('Fichiers suspects (analyse manuelle recommandée):');
suspiciousFiles.forEach(({ file, usages, reason }) => {
  if (fs.existsSync(file)) {
    logAction('Analysis', 'warning', `${file} - ${usages} usages - ${reason}`);
  }
});

// 4. VÉRIFICATION DES RÉFÉRENCES CROISÉES
console.log('\nPhase 4: 🔗 Vérification des références croisées...');

// Vérifier si ContactDetailsModern est encore nécessaire
const contactDetailsModernPath = './src/components/contacts/ContactDetailsModern.js';
if (fs.existsSync(contactDetailsModernPath)) {
  const content = fs.readFileSync(contactDetailsModernPath, 'utf8');
  
  // Si c'est juste un wrapper qui route vers ContactView, il peut être supprimé
  if (content.includes('ContactView') && content.split('\n').length < 50) {
    logAction('Cross-ref Check', 'warning', 'ContactDetailsModern semble être un simple wrapper');
  }
}

// 5. SUPPRESSION CONDITIONNELLE DES WRAPPERS OBSOLÈTES
console.log('\nPhase 5: 🧹 Suppression conditionnelle des wrappers...');

// Ces fichiers seront supprimés seulement s'ils sont de simples wrappers
const conditionalDeletes = [
  {
    file: './src/components/contacts/ContactDetailsModern.js',
    condition: (content) => content.includes('ContactView') && content.split('\n').length < 50,
    reason: 'Wrapper simple vers ContactView'
  }
];

conditionalDeletes.forEach(({ file, condition, reason }) => {
  if (fs.existsSync(file)) {
    const content = fs.readFileSync(file, 'utf8');
    if (condition(content)) {
      try {
        // Backup avant suppression
        const backupPath = path.join(BACKUP_DIR, `wrapper-${path.basename(file)}`);
        fs.copyFileSync(file, backupPath);
        
        fs.unlinkSync(file);
        logAction('Conditional Delete', 'success', `${file} - ${reason}`);
      } catch (error) {
        logAction('Conditional Delete', 'error', `${file}: ${error.message}`);
      }
    } else {
      logAction('Conditional Delete', 'warning', `${file} - Ne correspond pas aux critères, conservé`);
    }
  }
});

// 6. NETTOYAGE DES FICHIERS CSS ASSOCIÉS
console.log('\nPhase 6: 🎨 Nettoyage des fichiers CSS associés...');

const cssFilesToCheck = [
  './src/components/contacts/desktop/ContactViewV2.module.css',
  './src/components/contacts/ContactDetailsModern.module.css'
];

cssFilesToCheck.forEach(cssFile => {
  if (fs.existsSync(cssFile)) {
    // Vérifier si le composant JS correspondant existe encore
    const jsFile = cssFile.replace('.module.css', '.js');
    if (!fs.existsSync(jsFile)) {
      try {
        const backupPath = path.join(BACKUP_DIR, path.basename(cssFile));
        fs.copyFileSync(cssFile, backupPath);
        fs.unlinkSync(cssFile);
        logAction('CSS Cleanup', 'success', `${cssFile} - composant JS supprimé`);
      } catch (error) {
        logAction('CSS Cleanup', 'error', `${cssFile}: ${error.message}`);
      }
    } else {
      logAction('CSS Cleanup', 'warning', `${cssFile} - composant JS encore présent, conservé`);
    }
  }
});

// 7. RAPPORT FINAL
console.log('\nPhase 7: 📊 Génération du rapport final...');

const rapport = `# RAPPORT NETTOYAGE DOUBLONS CONTACT

**Date:** ${new Date().toLocaleString('fr-FR')}
**Backup:** ${BACKUP_DIR}

## 📋 ACTIONS RÉALISÉES

${logActions.map(action => `- **${action.action}** [${action.status}] ${action.details || ''} _(${action.timestamp})_`).join('\n')}

## 📊 STATISTIQUES

- **Fichiers supprimés:** ${logActions.filter(a => a.action.includes('Delete') && a.status === 'success').length}
- **Fichiers analysés:** ${logActions.filter(a => a.action === 'Analysis').length}
- **Warnings:** ${logActions.filter(a => a.status === 'warning').length}
- **Erreurs:** ${logActions.filter(a => a.status === 'error').length}

## 🗂️ STRUCTURE CONTACT FINALISÉE

### Fichiers principaux (conservés):
- \`./src/components/contacts/desktop/ContactView.js\` - ✅ Version principale
- \`./src/components/contacts/desktop/ContactForm.js\` - ✅ Formulaire principal
- \`./src/hooks/contacts/useContactDetails.js\` - ✅ Hook principal

### Fichiers mobiles (conservés):
- \`./src/components/contacts/mobile/ContactView.js\`
- \`./src/components/contacts/mobile/ContactForm.js\`

## ⚠️ FICHIERS À EXAMINER MANUELLEMENT

Les fichiers suivants ont été conservés mais devraient être examinés:

${suspiciousFiles.map(sf => `- \`${sf.file}\` - ${sf.usages} usages - ${sf.reason}`).join('\n')}

## 🔧 PROCHAINES ÉTAPES RECOMMANDÉES

1. **Tester l'application** - Vérifier que les pages contact fonctionnent
2. **Vérifier les imports** - S'assurer qu'aucun import cassé
3. **Examiner les fichiers suspects** - Décider s'ils peuvent être supprimés
4. **Nettoyer les imports** - Supprimer les imports vers les fichiers supprimés
5. **Supprimer le backup** si tout fonctionne: \`rm -rf ${BACKUP_DIR}\`

## 🎯 BÉNÉFICES

- **Code plus propre** - Moins de fichiers dupliqués
- **Maintenance facilitée** - Structure claire
- **Performance** - Moins de fichiers à compiler
- **Lisibilité** - Architecture plus claire

---
*Nettoyage automatisé le ${new Date().toLocaleString('fr-FR')}*
`;

fs.writeFileSync('RAPPORT_NETTOYAGE_DOUBLONS_FINAL.md', rapport, 'utf8');

console.log('\n🎉 NETTOYAGE DES DOUBLONS TERMINÉ!');
console.log('📄 Rapport: RAPPORT_NETTOYAGE_DOUBLONS_FINAL.md');
console.log(`💾 Backup: ${BACKUP_DIR}`);

const successCount = logActions.filter(a => a.status === 'success').length;
const warningCount = logActions.filter(a => a.status === 'warning').length;
const errorCount = logActions.filter(a => a.status === 'error').length;

console.log('\n📋 RÉSUMÉ:');
console.log(`   ✅ ${successCount} actions réussies`);
console.log(`   ⚠️ ${warningCount} avertissements`);
console.log(`   ❌ ${errorCount} erreurs`);

if (errorCount === 0) {
  console.log('\n✨ Nettoyage réussi sans erreur!');
} else {
  console.log('\n⚠️ Vérifiez les erreurs dans le rapport');
}