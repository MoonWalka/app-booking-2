#!/usr/bin/env node

/**
 * Script pour identifier les hooks qui n'ont pas encore été migrés
 * Recherche les fichiers hooks qui n'ont pas de version *Migrated.js
 */

const fs = require('fs');
const path = require('path');

// Dossier des hooks à analyser
const HOOKS_DIR = path.join(__dirname, '../src/hooks');

// Dossiers à exclure de l'analyse (hooks utilitaires, génériques, etc.)
const EXCLUDED_DIRS = ['common', '__tests__'];

// Pattern pour identifier les hooks potentiellement à migrer
const HOOK_PATTERN = /^use[A-Z]/;

// Pattern pour identifier les hooks déjà migrés
const MIGRATED_PATTERN = /Migrated\.js$/;

// Stockage des résultats
const results = {
  migratedHooks: [],
  nonMigratedHooks: [],
  genericHooks: []
};

/**
 * Analyse récursivement un répertoire pour trouver les hooks
 */
function analyzeDirectory(dir) {
  // Lire le contenu du répertoire
  const items = fs.readdirSync(dir);
  
  // Filtrer les sous-dossiers
  const subdirs = items
    .filter(item => fs.statSync(path.join(dir, item)).isDirectory())
    .filter(subdir => !EXCLUDED_DIRS.includes(subdir));
  
  // Filtrer les fichiers de hooks
  const hookFiles = items
    .filter(item => fs.statSync(path.join(dir, item)).isFile())
    .filter(file => file.endsWith('.js') && HOOK_PATTERN.test(file))
    .filter(file => file !== 'index.js');
  
  // Identifier les hooks déjà migrés
  const migratedHookFiles = hookFiles.filter(file => MIGRATED_PATTERN.test(file));
  
  // Extraire les noms de base des hooks migrés
  const migratedHookBaseNames = migratedHookFiles.map(file => 
    file.replace('Migrated.js', '')
  );
  
  // Identifier les hooks qui n'ont pas encore été migrés
  const nonMigratedHooks = hookFiles
    .filter(file => !MIGRATED_PATTERN.test(file))
    .filter(file => {
      const baseName = file.replace('.js', '');
      return !migratedHookBaseNames.includes(baseName);
    });
  
  // Stocker les résultats pour ce répertoire
  const relativePath = path.relative(HOOKS_DIR, dir);
  const domainName = relativePath || 'root';
  
  if (migratedHookFiles.length > 0) {
    results.migratedHooks.push({
      domain: domainName,
      hooks: migratedHookFiles.map(file => path.join(relativePath, file))
    });
  }
  
  if (nonMigratedHooks.length > 0) {
    results.nonMigratedHooks.push({
      domain: domainName,
      hooks: nonMigratedHooks.map(file => path.join(relativePath, file))
    });
  }
  
  // Analyser récursivement les sous-dossiers
  subdirs.forEach(subdir => {
    analyzeDirectory(path.join(dir, subdir));
  });
}

/**
 * Analyse les hooks génériques dans le dossier common
 */
function analyzeGenericHooks() {
  const commonDir = path.join(HOOKS_DIR, 'common');
  if (!fs.existsSync(commonDir)) return;
  
  const items = fs.readdirSync(commonDir);
  const genericHooks = items
    .filter(item => fs.statSync(path.join(commonDir, item)).isFile())
    .filter(file => file.endsWith('.js') && /^use.*Generic/.test(file));
  
  if (genericHooks.length > 0) {
    results.genericHooks = genericHooks;
  }
}

// Exécuter l'analyse
console.log('Analyse des hooks à migrer...');
analyzeDirectory(HOOKS_DIR);
analyzeGenericHooks();

// Afficher les résultats
console.log('\n=== ÉTAT DE LA MIGRATION DES HOOKS ===\n');

console.log('Hooks génériques disponibles:');
results.genericHooks.forEach(hook => console.log(`- ${hook}`));

console.log('\nHooks déjà migrés:');
results.migratedHooks.forEach(domain => {
  console.log(`\n[${domain.domain}]`);
  domain.hooks.forEach(hook => console.log(`- ${hook}`));
});

console.log('\nHooks à migrer:');
if (results.nonMigratedHooks.length === 0) {
  console.log('✅ Tous les hooks ont été migrés!');
} else {
  results.nonMigratedHooks.forEach(domain => {
    console.log(`\n[${domain.domain}]`);
    domain.hooks.forEach(hook => console.log(`- ${hook}`));
  });
}

// Statistiques
const totalMigrated = results.migratedHooks.reduce((sum, domain) => sum + domain.hooks.length, 0);
const totalNonMigrated = results.nonMigratedHooks.reduce((sum, domain) => sum + domain.hooks.length, 0);
const totalHooks = totalMigrated + totalNonMigrated;

console.log('\n=== STATISTIQUES ===');
console.log(`Total des hooks: ${totalHooks}`);
console.log(`Hooks migrés: ${totalMigrated} (${Math.round(totalMigrated / totalHooks * 100)}%)`);
console.log(`Hooks à migrer: ${totalNonMigrated} (${Math.round(totalNonMigrated / totalHooks * 100)}%)`);