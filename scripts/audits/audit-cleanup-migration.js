#!/usr/bin/env node

/**
 * AUDIT COMPLET - Nettoyage post-migration programmateur→contact
 * Génère un rapport structuré des fichiers et code à nettoyer
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const SRC_DIR = './src';
const AUDIT_REPORT = 'AUDIT_NETTOYAGE_POST_MIGRATION.md';

// Collecteurs de données
const auditData = {
  fichiersProgrammateurs: [],
  fichiersDupliquesContacts: [],
  fichiersDebugTemporaires: [],
  referencesProgrammateurDansCode: [],
  importsObsoletes: [],
  variablesObsoletes: [],
  fichiersNonUtilises: [],
  dossiersProgrammateurs: []
};

console.log('🔍 AUDIT POST-MIGRATION PROGRAMMATEUR→CONTACT');
console.log('================================================\n');

// 1. RECHERCHE DES FICHIERS PROGRAMMATEURS
console.log('1. 📁 Recherche des fichiers programmateurs...');
try {
  // Fichiers avec "programmateur" ou "Programmateur" dans le nom
  const programmateursFiles = execSync(`find ${SRC_DIR} -name "*rogrammateur*" -type f`, { encoding: 'utf8' })
    .split('\n')
    .filter(line => line.trim())
    .map(file => file.trim());
  
  auditData.fichiersProgrammateurs = programmateursFiles;
  console.log(`   ✅ ${programmateursFiles.length} fichiers trouvés`);
  
  // Dossiers programmateurs
  const programmateursDirectories = execSync(`find ${SRC_DIR} -name "*rogrammateur*" -type d`, { encoding: 'utf8' })
    .split('\n')
    .filter(line => line.trim())
    .map(dir => dir.trim());
  
  auditData.dossiersProgrammateurs = programmateursDirectories;
  console.log(`   ✅ ${programmateursDirectories.length} dossiers trouvés`);
  
} catch (error) {
  console.log('   ⚠️  Aucun fichier programmateur trouvé');
}

// 2. RECHERCHE DES DOUBLONS DE COMPOSANTS CONTACTS
console.log('\n2. 🔄 Analyse des doublons Contact...');
const contactFiles = execSync(`find ${SRC_DIR} -name "*Contact*" -type f | grep -E "\\.(js|jsx)$"`, { encoding: 'utf8' })
  .split('\n')
  .filter(line => line.trim())
  .map(file => file.trim());

// Identifier les versions multiples
const contactVersions = {
  'ContactDetails': contactFiles.filter(f => f.includes('ContactDetails') && !f.includes('test')),
  'ContactView': contactFiles.filter(f => f.includes('ContactView') && !f.includes('test')),
  'ContactForm': contactFiles.filter(f => f.includes('ContactForm') && !f.includes('test'))
};

Object.entries(contactVersions).forEach(([type, files]) => {
  if (files.length > 1) {
    console.log(`   ⚠️  ${type}: ${files.length} versions détectées`);
    auditData.fichiersDupliquesContacts.push({
      type,
      files,
      action: 'Vérifier quelle version est utilisée'
    });
  }
});

// 3. RECHERCHE DES FICHIERS DEBUG/TEMPORAIRES
console.log('\n3. 🧹 Recherche des fichiers debug/temporaires...');
const debugFiles = execSync(`find ${SRC_DIR} -name "*test*" -o -name "*Test*" -o -name "*debug*" -o -name "*Debug*" -o -name "*backup*" -o -name "*Backup*" | grep -v node_modules`, { encoding: 'utf8' })
  .split('\n')
  .filter(line => line.trim() && !line.includes('__tests__') && !line.includes('setupTests.js'))
  .map(file => file.trim());

auditData.fichiersDebugTemporaires = debugFiles;
console.log(`   ✅ ${debugFiles.length} fichiers debug/temporaires trouvés`);

// 4. RECHERCHE DES RÉFÉRENCES "programmateur" DANS LE CODE
console.log('\n4. 🔍 Recherche des références programmateur dans le code...');
try {
  const grepResult = execSync(`grep -r "programmateur" ${SRC_DIR} --include="*.js" --include="*.jsx" --include="*.css" | head -20`, { encoding: 'utf8' });
  const references = grepResult.split('\n').filter(line => line.trim());
  
  auditData.referencesProgrammateurDansCode = references.slice(0, 20); // Limiter à 20 pour le rapport
  console.log(`   ✅ ${references.length} références trouvées (affichage des 20 premières)`);
} catch (error) {
  console.log('   ✅ Aucune référence programmateur trouvée');
}

// 5. RECHERCHE DES VARIABLES OBSOLÈTES
console.log('\n5. 🔍 Recherche des variables obsolètes...');
try {
  const programmateursAssociesRefs = execSync(`grep -r "programmateursAssocies" ${SRC_DIR} --include="*.js" --include="*.jsx"`, { encoding: 'utf8' })
    .split('\n')
    .filter(line => line.trim());
  
  auditData.variablesObsoletes = programmateursAssociesRefs;
  console.log(`   ✅ ${programmateursAssociesRefs.length} références à programmateursAssocies trouvées`);
} catch (error) {
  console.log('   ✅ Aucune variable obsolète trouvée');
}

// 6. ANALYSE DES IMPORTS
console.log('\n6. 📦 Analyse des imports...');
const filesToAnalyze = [
  './src/pages/ContactsPage.js',
  './src/components/contacts/ContactsList.js'
];

filesToAnalyze.forEach(file => {
  if (fs.existsSync(file)) {
    const content = fs.readFileSync(file, 'utf8');
    const lines = content.split('\n');
    
    lines.forEach((line, index) => {
      if (line.includes('ContactDetails') || line.includes('ContactViewModern') || line.includes('ContactViewV2')) {
        auditData.importsObsoletes.push({
          file,
          line: index + 1,
          content: line.trim()
        });
      }
    });
  }
});

console.log(`   ✅ ${auditData.importsObsoletes.length} imports obsolètes détectés`);

// GÉNÉRATION DU RAPPORT
console.log('\n📊 Génération du rapport...');
const rapport = `# AUDIT DE NETTOYAGE POST-MIGRATION PROGRAMMATEUR→CONTACT

## 📋 RÉSUMÉ EXÉCUTIF

**Date:** ${new Date().toLocaleDateString('fr-FR')}
**Objectif:** Identifier et nettoyer les éléments obsolètes après la migration programmateur→contact

### 🎯 STATISTIQUES GÉNÉRALES
- **Fichiers programmateurs:** ${auditData.fichiersProgrammateurs.length}
- **Dossiers programmateurs:** ${auditData.dossiersProgrammateurs.length}
- **Doublons contacts:** ${auditData.fichiersDupliquesContacts.length} types
- **Fichiers debug/temporaires:** ${auditData.fichiersDebugTemporaires.length}
- **Références programmateur:** ${auditData.referencesProgrammateurDansCode.length}
- **Variables obsolètes:** ${auditData.variablesObsoletes.length}
- **Imports obsolètes:** ${auditData.importsObsoletes.length}

## 🗂️ SECTION 1: FICHIERS PROGRAMMATEURS À SUPPRIMER

### 📁 Fichiers avec "programmateur" dans le nom
${auditData.fichiersProgrammateurs.length === 0 ? '✅ Aucun fichier trouvé' : 
auditData.fichiersProgrammateurs.map(file => `- \`${file}\``).join('\n')}

### 📂 Dossiers programmateurs à supprimer
${auditData.dossiersProgrammateurs.length === 0 ? '✅ Aucun dossier trouvé' : 
auditData.dossiersProgrammateurs.map(dir => `- \`${dir}\``).join('\n')}

## 🔄 SECTION 2: DOUBLONS CONTACTS À ANALYSER

${auditData.fichiersDupliquesContacts.length === 0 ? '✅ Aucun doublon détecté' : 
auditData.fichiersDupliquesContacts.map(doublon => 
`### ${doublon.type}
${doublon.files.map(file => `- \`${file}\``).join('\n')}
**Action:** ${doublon.action}
`).join('\n')}

## 🧹 SECTION 3: FICHIERS DEBUG/TEMPORAIRES

${auditData.fichiersDebugTemporaires.length === 0 ? '✅ Aucun fichier debug trouvé' : 
auditData.fichiersDebugTemporaires.map(file => `- \`${file}\``).join('\n')}

## 🔍 SECTION 4: RÉFÉRENCES "programmateur" DANS LE CODE

${auditData.referencesProgrammateurDansCode.length === 0 ? '✅ Aucune référence trouvée' : 
auditData.referencesProgrammateurDansCode.map(ref => `\`\`\`\n${ref}\n\`\`\``).join('\n\n')}

## 📦 SECTION 5: VARIABLES OBSOLÈTES

${auditData.variablesObsoletes.length === 0 ? '✅ Aucune variable obsolète trouvée' : 
auditData.variablesObsoletes.map(ref => `\`\`\`\n${ref}\n\`\`\``).join('\n\n')}

## 📥 SECTION 6: IMPORTS OBSOLÈTES

${auditData.importsObsoletes.length === 0 ? '✅ Aucun import obsolète trouvé' : 
auditData.importsObsoletes.map(imp => `**${imp.file}:${imp.line}**\n\`\`\`javascript\n${imp.content}\n\`\`\``).join('\n\n')}

## 🚀 PLAN D'ACTION RECOMMANDÉ

### Phase 1: Suppression sécurisée des fichiers programmateurs
\`\`\`bash
# 1. Supprimer les dossiers programmateurs
${auditData.dossiersProgrammateurs.map(dir => `rm -rf "${dir}"`).join('\n')}

# 2. Supprimer les fichiers programmateurs isolés
${auditData.fichiersProgrammateurs.filter(f => !auditData.dossiersProgrammateurs.some(d => f.startsWith(d))).map(file => `rm "${file}"`).join('\n')}
\`\`\`

### Phase 2: Mise à jour des imports
${auditData.importsObsoletes.length > 0 ? 
`- Mettre à jour les imports dans les fichiers suivants:
${auditData.importsObsoletes.map(imp => `  - ${imp.file}`).join('\n')}` : 
'✅ Aucun import à mettre à jour'}

### Phase 3: Nettoyage des variables obsolètes
${auditData.variablesObsoletes.length > 0 ? 
'- Remplacer programmateursAssocies par contactsAssocies dans les fichiers identifiés' : 
'✅ Aucune variable à nettoyer'}

### Phase 4: Résolution des doublons
${auditData.fichiersDupliquesContacts.length > 0 ? 
auditData.fichiersDupliquesContacts.map(doublon => 
`- Analyser et consolider ${doublon.type}`).join('\n') : 
'✅ Aucun doublon à résoudre'}

### Phase 5: Nettoyage des fichiers debug
${auditData.fichiersDebugTemporaires.length > 0 ? 
'- Supprimer les fichiers debug/temporaires après vérification' : 
'✅ Aucun fichier debug à nettoyer'}

## ⚠️ AVERTISSEMENTS

1. **Toujours faire un backup avant suppression**
2. **Tester l'application après chaque phase**
3. **Vérifier les tests unitaires**
4. **Vérifier que les imports mis à jour pointent vers les bons composants**

## 📊 ESTIMATION

- **Temps estimé:** 2-3 heures
- **Risque:** Faible (si suivi méthodiquement)
- **Impact:** Amélioration significative de la propreté du code

---
*Rapport généré automatiquement le ${new Date().toLocaleString('fr-FR')}*
`;

// Écriture du rapport
fs.writeFileSync(AUDIT_REPORT, rapport, 'utf8');

console.log(`✅ Rapport généré: ${AUDIT_REPORT}`);
console.log('\n🎉 AUDIT TERMINÉ!');
console.log(`📄 Consultez le fichier ${AUDIT_REPORT} pour le rapport détaillé`);

// Affichage du résumé
console.log('\n📊 RÉSUMÉ:');
console.log(`   📁 ${auditData.fichiersProgrammateurs.length} fichiers programmateurs`);
console.log(`   📂 ${auditData.dossiersProgrammateurs.length} dossiers programmateurs`);
console.log(`   🔄 ${auditData.fichiersDupliquesContacts.length} types de doublons`);
console.log(`   🧹 ${auditData.fichiersDebugTemporaires.length} fichiers debug`);
console.log(`   🔍 ${auditData.referencesProgrammateurDansCode.length} références programmateur`);
console.log(`   📦 ${auditData.importsObsoletes.length} imports obsolètes`);