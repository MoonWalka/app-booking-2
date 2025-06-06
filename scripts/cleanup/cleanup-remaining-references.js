#!/usr/bin/env node

/**
 * NETTOYAGE FINAL DES RÉFÉRENCES PROGRAMMATEUR RESTANTES
 * Nettoie les commentaires et références CSS
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🧹 NETTOYAGE FINAL DES RÉFÉRENCES PROGRAMMATEUR');
console.log('================================================\n');

const logActions = [];

function logAction(action, status, details = '') {
  const entry = { action, status, details, timestamp: new Date().toISOString() };
  logActions.push(entry);
  const statusIcon = status === 'success' ? '✅' : status === 'warning' ? '⚠️' : '❌';
  console.log(`${statusIcon} ${action}${details ? ' - ' + details : ''}`);
}

// 1. IDENTIFIER LES FICHIERS AVEC DES RÉFÉRENCES PROGRAMMATEUR
console.log('Phase 1: 🔍 Identification des références restantes...');

let filesWithReferences = [];
try {
  const grepResult = execSync(`grep -r "programmateur" ./src --include="*.js" --include="*.jsx" --include="*.css" -l`, { encoding: 'utf8' });
  filesWithReferences = grepResult.split('\n').filter(line => line.trim());
  logAction('Scan', 'success', `${filesWithReferences.length} fichiers avec références trouvés`);
} catch (error) {
  logAction('Scan', 'warning', 'Aucune référence trouvée');
}

// 2. NETTOYER LES COMMENTAIRES DANS LES FICHIERS CSS
console.log('\nPhase 2: 🎨 Nettoyage des commentaires CSS...');

const cssFiles = filesWithReferences.filter(f => f.endsWith('.css'));
cssFiles.forEach(file => {
  if (fs.existsSync(file)) {
    try {
      let content = fs.readFileSync(file, 'utf8');
      const originalContent = content;
      
      // Remplacer dans les commentaires
      content = content.replace(/programmateur/gi, 'contact');
      content = content.replace(/Programmateur/g, 'Contact');
      
      if (content !== originalContent) {
        fs.writeFileSync(file, content, 'utf8');
        logAction('CSS Update', 'success', file);
      } else {
        logAction('CSS Update', 'warning', `${file} - aucune modification`);
      }
    } catch (error) {
      logAction('CSS Update', 'error', `${file}: ${error.message}`);
    }
  }
});

// 3. NETTOYER LES COMMENTAIRES DANS LES FICHIERS JS
console.log('\nPhase 3: 📝 Nettoyage des commentaires JS...');

const jsFiles = filesWithReferences.filter(f => f.endsWith('.js') || f.endsWith('.jsx'));
jsFiles.forEach(file => {
  if (fs.existsSync(file)) {
    try {
      let content = fs.readFileSync(file, 'utf8');
      const originalContent = content;
      
      // Remplacer seulement dans les commentaires (lignes commençant par // ou /* */)
      const lines = content.split('\n');
      const updatedLines = lines.map(line => {
        // Si c'est un commentaire de ligne
        if (line.trim().startsWith('//')) {
          return line.replace(/programmateur/gi, 'contact').replace(/Programmateur/g, 'Contact');
        }
        // Si c'est dans un commentaire bloc (approximatif)
        if (line.includes('/*') || line.includes('*/') || (line.includes('*') && !line.includes('import'))) {
          return line.replace(/programmateur/gi, 'contact').replace(/Programmateur/g, 'Contact');
        }
        return line;
      });
      
      content = updatedLines.join('\n');
      
      if (content !== originalContent) {
        fs.writeFileSync(file, content, 'utf8');
        logAction('JS Comment Update', 'success', file);
      } else {
        logAction('JS Comment Update', 'warning', `${file} - aucune modification`);
      }
    } catch (error) {
      logAction('JS Comment Update', 'error', `${file}: ${error.message}`);
    }
  }
});

// 4. NETTOYER LES CLASSES CSS SPÉCIFIQUES
console.log('\nPhase 4: 🏷️ Nettoyage des classes CSS programmateur...');

const cssClassFiles = [
  './src/components/concerts/desktop/ConcertForm.module.css'
];

cssClassFiles.forEach(file => {
  if (fs.existsSync(file)) {
    try {
      let content = fs.readFileSync(file, 'utf8');
      const originalContent = content;
      
      // Remplacer les classes CSS spécifiques
      content = content.replace(/\.programmateur/g, '.contact');
      content = content.replace(/\.cardHeader\.programmateur/g, '.cardHeader.contact');
      content = content.replace(/programmateurSearchContainer/g, 'contactSearchContainer');
      content = content.replace(/programmateurCard/g, 'contactCard');
      content = content.replace(/programmateurInfo/g, 'contactInfo');
      content = content.replace(/programmateurName/g, 'contactName');
      content = content.replace(/programmateurStructure/g, 'contactStructure');
      content = content.replace(/programmateurContacts/g, 'contactContacts');
      content = content.replace(/programmateurContactItem/g, 'contactContactItem');
      
      if (content !== originalContent) {
        fs.writeFileSync(file, content, 'utf8');
        logAction('CSS Class Update', 'success', file);
      } else {
        logAction('CSS Class Update', 'warning', `${file} - aucune modification`);
      }
    } catch (error) {
      logAction('CSS Class Update', 'error', `${file}: ${error.message}`);
    }
  }
});

// 5. VÉRIFICATION FINALE
console.log('\nPhase 5: ✅ Vérification finale...');

let remainingReferences = 0;
try {
  const finalCheck = execSync(`grep -r "programmateur" ./src --include="*.js" --include="*.jsx" --include="*.css" | wc -l`, { encoding: 'utf8' });
  remainingReferences = parseInt(finalCheck.trim());
  logAction('Final Check', remainingReferences > 0 ? 'warning' : 'success', `${remainingReferences} références restantes`);
} catch (error) {
  logAction('Final Check', 'success', '0 références restantes');
}

// 6. RAPPORT FINAL
const rapport = `# NETTOYAGE FINAL RÉFÉRENCES PROGRAMMATEUR

**Date:** ${new Date().toLocaleString('fr-FR')}

## 📋 ACTIONS RÉALISÉES

${logActions.map(action => `- **${action.action}** [${action.status}] ${action.details || ''}`).join('\n')}

## 📊 RÉSULTATS

- **Fichiers CSS traités:** ${cssFiles.length}
- **Fichiers JS traités:** ${jsFiles.length}
- **Références restantes:** ${remainingReferences}

## 🎯 STATUS

${remainingReferences === 0 ? '✅ **NETTOYAGE COMPLET** - Aucune référence programmateur restante' : `⚠️ **NETTOYAGE PARTIEL** - ${remainingReferences} références restantes à examiner manuellement`}

---
*Nettoyage final réalisé le ${new Date().toLocaleString('fr-FR')}*
`;

fs.writeFileSync('RAPPORT_NETTOYAGE_REFERENCES_FINAL.md', rapport, 'utf8');

console.log('\n🎉 NETTOYAGE FINAL TERMINÉ!');
console.log('📄 Rapport: RAPPORT_NETTOYAGE_REFERENCES_FINAL.md');

const successCount = logActions.filter(a => a.status === 'success').length;
const warningCount = logActions.filter(a => a.status === 'warning').length;
const errorCount = logActions.filter(a => a.status === 'error').length;

console.log('\n📋 RÉSUMÉ:');
console.log(`   ✅ ${successCount} actions réussies`);
console.log(`   ⚠️ ${warningCount} avertissements`);
console.log(`   ❌ ${errorCount} erreurs`);
console.log(`   🔍 ${remainingReferences} références restantes`);

if (remainingReferences === 0) {
  console.log('\n🏆 MISSION ACCOMPLIE - Aucune référence programmateur restante!');
} else {
  console.log(`\n⚠️ ${remainingReferences} références restantes à examiner manuellement`);
}