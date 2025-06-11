#!/usr/bin/env node

/**
 * ANALYSE DES DOUBLONS CONTACT
 * Analyse l'utilisation de chaque version pour proposer un plan de consolidation
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 ANALYSE DES DOUBLONS CONTACT');
console.log('================================\n');

// Fonction pour analyser un fichier
function analyzeFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return { exists: false };
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  const stats = fs.statSync(filePath);
  
  return {
    exists: true,
    size: stats.size,
    lines: content.split('\n').length,
    lastModified: stats.mtime,
    hasReactImport: content.includes('import React'),
    hasUseState: content.includes('useState'),
    hasUseEffect: content.includes('useEffect'),
    hasModuleCss: content.includes('.module.css'),
    hasBootstrap: content.includes('bi bi-'),
    hasOldImports: content.includes('ContactDetails') || content.includes('ContactViewModern'),
    imports: content.match(/import .* from .*/g) || [],
    exports: content.match(/export .*/g) || [],
    componentName: content.match(/const (\w+) = /)?.[1] || content.match(/function (\w+)/)?.[1]
  };
}

// Fonction pour rechercher les usages d'un fichier
function findUsages(fileName) {
  try {
    const result = execSync(`grep -r "${fileName}" ./src --include="*.js" --include="*.jsx" | grep -v "${fileName}.js"`, { encoding: 'utf8' });
    return result.split('\n').filter(line => line.trim());
  } catch (error) {
    return [];
  }
}

// Analyse des Contact Details
console.log('1. 📄 Analyse ContactDetails...');
const contactDetailsFiles = [
  './src/components/contacts/ContactDetails.js',
  './src/components/contacts/ContactDetailsModern.js',
  './src/components/contacts/mobile/ContactDetails.js',
  './src/hooks/contacts/useContactDetails.js',
  './src/hooks/contacts/useContactDetailsModern.js'
];

const contactDetailsAnalysis = contactDetailsFiles.map(file => ({
  file,
  analysis: analyzeFile(file),
  usages: findUsages(path.basename(file, '.js'))
}));

console.log('Contact Details Analysis:');
contactDetailsAnalysis.forEach(({ file, analysis, usages }) => {
  if (analysis.exists) {
    console.log(`  ✅ ${file}`);
    console.log(`     - Lignes: ${analysis.lines}, Taille: ${analysis.size} bytes`);
    console.log(`     - Modifié: ${analysis.lastModified.toLocaleDateString()}`);
    console.log(`     - Usages: ${usages.length}`);
  } else {
    console.log(`  ❌ ${file} - N'existe pas`);
  }
});

// Analyse des Contact Views
console.log('\n2. 👁️ Analyse ContactView...');
const contactViewFiles = [
  './src/components/contacts/desktop/ContactView.js',
  './src/components/contacts/desktop/ContactViewModern.js',
  './src/components/contacts/desktop/ContactViewV2.js',
  './src/components/contacts/mobile/ContactView.js'
];

const contactViewAnalysis = contactViewFiles.map(file => ({
  file,
  analysis: analyzeFile(file),
  usages: findUsages(path.basename(file, '.js'))
}));

console.log('Contact View Analysis:');
contactViewAnalysis.forEach(({ file, analysis, usages }) => {
  if (analysis.exists) {
    console.log(`  ✅ ${file}`);
    console.log(`     - Lignes: ${analysis.lines}, Taille: ${analysis.size} bytes`);
    console.log(`     - Modifié: ${analysis.lastModified.toLocaleDateString()}`);
    console.log(`     - Usages: ${usages.length}`);
    if (usages.length > 0) {
      console.log(`     - Utilisé dans: ${usages.slice(0, 3).map(u => u.split(':')[0]).join(', ')}`);
    }
  } else {
    console.log(`  ❌ ${file} - N'existe pas`);
  }
});

// Analyse des Contact Forms
console.log('\n3. 📝 Analyse ContactForm...');
const contactFormFiles = [
  './src/components/contacts/ContactForm.js',
  './src/components/contacts/desktop/ContactForm.js',
  './src/components/contacts/desktop/ContactForm.js',
  './src/components/contacts/mobile/ContactForm.js',
  './src/hooks/contacts/useContactForm.js'
];

const contactFormAnalysis = contactFormFiles.map(file => ({
  file,
  analysis: analyzeFile(file),
  usages: findUsages(path.basename(file, '.js'))
}));

console.log('Contact Form Analysis:');
contactFormAnalysis.forEach(({ file, analysis, usages }) => {
  if (analysis.exists) {
    console.log(`  ✅ ${file}`);
    console.log(`     - Lignes: ${analysis.lines}, Taille: ${analysis.size} bytes`);
    console.log(`     - Modifié: ${analysis.lastModified.toLocaleDateString()}`);
    console.log(`     - Usages: ${usages.length}`);
    if (usages.length > 0) {
      console.log(`     - Utilisé dans: ${usages.slice(0, 3).map(u => u.split(':')[0]).join(', ')}`);
    }
  } else {
    console.log(`  ❌ ${file} - N'existe pas`);
  }
});

// Génération du rapport d'analyse
const rapport = `# ANALYSE DES DOUBLONS CONTACT

**Date:** ${new Date().toLocaleString('fr-FR')}

## 📄 CONTACT DETAILS

${contactDetailsAnalysis.map(({ file, analysis, usages }) => {
  if (!analysis.exists) return `### ${file}\n❌ **N'existe pas**\n`;
  
  return `### ${file}
- **Lignes:** ${analysis.lines}
- **Taille:** ${analysis.size} bytes
- **Modifié:** ${analysis.lastModified.toLocaleDateString()}
- **Composant:** ${analysis.componentName || 'N/A'}
- **Usages:** ${usages.length}
- **Technologies:** ${[
  analysis.hasReactImport && 'React',
  analysis.hasUseState && 'useState', 
  analysis.hasUseEffect && 'useEffect',
  analysis.hasModuleCss && 'CSS Modules',
  analysis.hasBootstrap && 'Bootstrap Icons'
].filter(Boolean).join(', ') || 'Aucune détectée'}

${usages.length > 0 ? `**Utilisé dans:**\n${usages.slice(0, 5).map(u => `- \`${u}\``).join('\n')}` : '**Aucun usage détecté**'}
`;
}).join('\n')}

## 👁️ CONTACT VIEW

${contactViewAnalysis.map(({ file, analysis, usages }) => {
  if (!analysis.exists) return `### ${file}\n❌ **N'existe pas**\n`;
  
  return `### ${file}
- **Lignes:** ${analysis.lines}
- **Taille:** ${analysis.size} bytes
- **Modifié:** ${analysis.lastModified.toLocaleDateString()}
- **Composant:** ${analysis.componentName || 'N/A'}
- **Usages:** ${usages.length}
- **Technologies:** ${[
  analysis.hasReactImport && 'React',
  analysis.hasUseState && 'useState', 
  analysis.hasUseEffect && 'useEffect',
  analysis.hasModuleCss && 'CSS Modules',
  analysis.hasBootstrap && 'Bootstrap Icons'
].filter(Boolean).join(', ') || 'Aucune détectée'}

${usages.length > 0 ? `**Utilisé dans:**\n${usages.slice(0, 5).map(u => `- \`${u}\``).join('\n')}` : '**Aucun usage détecté**'}
`;
}).join('\n')}

## 📝 CONTACT FORM

${contactFormAnalysis.map(({ file, analysis, usages }) => {
  if (!analysis.exists) return `### ${file}\n❌ **N'existe pas**\n`;
  
  return `### ${file}
- **Lignes:** ${analysis.lines}
- **Taille:** ${analysis.size} bytes
- **Modifié:** ${analysis.lastModified.toLocaleDateString()}
- **Composant:** ${analysis.componentName || 'N/A'}
- **Usages:** ${usages.length}
- **Technologies:** ${[
  analysis.hasReactImport && 'React',
  analysis.hasUseState && 'useState', 
  analysis.hasUseEffect && 'useEffect',
  analysis.hasModuleCss && 'CSS Modules',
  analysis.hasBootstrap && 'Bootstrap Icons'
].filter(Boolean).join(', ') || 'Aucune détectée'}

${usages.length > 0 ? `**Utilisé dans:**\n${usages.slice(0, 5).map(u => `- \`${u}\``).join('\n')}` : '**Aucun usage détecté**'}
`;
}).join('\n')}

## 🎯 RECOMMANDATIONS DE CONSOLIDATION

### Stratégie recommandée:

1. **ContactView** - Utiliser comme version principale:
   - \`./src/components/contacts/desktop/ContactView.js\` (déjà utilisé dans ContactsPage)
   
2. **ContactForm** - Utiliser comme version principale:
   - \`./src/components/contacts/desktop/ContactForm.js\` (déjà utilisé dans ContactsPage)

3. **Fichiers à supprimer (après vérification):**
   - Versions non utilisées ou obsolètes
   - Fichiers de migration temporaires

### Plan d'action:

1. **Phase 1:** Identifier les versions actives
2. **Phase 2:** Migrer les dernières dépendances
3. **Phase 3:** Supprimer les doublons
4. **Phase 4:** Mettre à jour la documentation

---
*Analyse automatisée le ${new Date().toLocaleString('fr-FR')}*
`;

fs.writeFileSync('ANALYSE_DOUBLONS_CONTACT.md', rapport, 'utf8');

console.log('\n📊 Analyse terminée!');
console.log('📄 Rapport détaillé: ANALYSE_DOUBLONS_CONTACT.md');

// Résumé pour le terminal
const existingFiles = [
  ...contactDetailsAnalysis.filter(a => a.analysis.exists),
  ...contactViewAnalysis.filter(a => a.analysis.exists),
  ...contactFormAnalysis.filter(a => a.analysis.exists)
];

const usedFiles = existingFiles.filter(a => a.usages.length > 0);
const unusedFiles = existingFiles.filter(a => a.usages.length === 0);

console.log(`\n📋 RÉSUMÉ:`);
console.log(`   📁 ${existingFiles.length} fichiers Contact analysés`);
console.log(`   ✅ ${usedFiles.length} fichiers avec usages détectés`);
console.log(`   🗑️ ${unusedFiles.length} fichiers sans usage détecté`);

if (unusedFiles.length > 0) {
  console.log(`\n🗑️ Fichiers potentiellement supprimables:`);
  unusedFiles.forEach(({ file }) => {
    console.log(`   - ${file}`);
  });
}