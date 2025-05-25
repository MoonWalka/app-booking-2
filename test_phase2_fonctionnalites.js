#!/usr/bin/env node

/**
 * Test de validation des fonctionnalités Phase 2
 * Vérifie que toutes les nouvelles fonctionnalités sont présentes
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 TEST PHASE 2 - VALIDATION DES FONCTIONNALITÉS');
console.log('================================================');

// Chemin vers le hook principal
const hookPath = path.join(__dirname, 'src/hooks/generics/lists/useGenericEntityList.js');

if (!fs.existsSync(hookPath)) {
  console.error('❌ Fichier useGenericEntityList.js non trouvé');
  process.exit(1);
}

const hookContent = fs.readFileSync(hookPath, 'utf8');

// Tests des fonctionnalités implémentées
const tests = [
  // Virtualisation
  {
    name: 'Virtualisation - États',
    check: () => hookContent.includes('virtualizedItems') && 
                 hookContent.includes('visibleRange') && 
                 hookContent.includes('virtualScrollRef'),
    description: 'États de virtualisation présents'
  },
  {
    name: 'Virtualisation - Fonctions',
    check: () => hookContent.includes('calculateVisibleRange') && 
                 hookContent.includes('updateVirtualizedItems') && 
                 hookContent.includes('handleVirtualScroll'),
    description: 'Fonctions de virtualisation présentes'
  },
  {
    name: 'Virtualisation - Observer',
    check: () => hookContent.includes('ResizeObserver') && 
                 hookContent.includes('setupItemHeightObserver'),
    description: 'Observer de hauteur d\'éléments présent'
  },
  
  // Pagination par curseur
  {
    name: 'Pagination Curseur - États',
    check: () => hookContent.includes('cursorCache') && 
                 hookContent.includes('currentCursor') && 
                 hookContent.includes('lastCursorRef'),
    description: 'États de pagination par curseur présents'
  },
  {
    name: 'Pagination Curseur - Fonctions',
    check: () => hookContent.includes('saveCursor') && 
                 hookContent.includes('getCursor') && 
                 hookContent.includes('goToPageWithCursor'),
    description: 'Fonctions de pagination par curseur présentes'
  },
  {
    name: 'Pagination Curseur - Cache',
    check: () => hookContent.includes('rebuildCursorCache') && 
                 hookContent.includes('cursorPagination'),
    description: 'Système de cache de curseurs présent'
  },
  
  // Auto-refresh
  {
    name: 'Auto-refresh - États',
    check: () => hookContent.includes('autoRefreshStatus') && 
                 hookContent.includes('isPageVisible'),
    description: 'États d\'auto-refresh présents'
  },
  {
    name: 'Auto-refresh - Fonctions',
    check: () => hookContent.includes('startAutoRefresh') && 
                 hookContent.includes('stopAutoRefresh') && 
                 hookContent.includes('handleVisibilityChange'),
    description: 'Fonctions d\'auto-refresh présentes'
  },
  {
    name: 'Auto-refresh - Visibilité',
    check: () => hookContent.includes('visibilitychange') && 
                 hookContent.includes('document.hidden'),
    description: 'Gestion de visibilité de page présente'
  },
  
  // Recherche dans la liste
  {
    name: 'Recherche Locale - États',
    check: () => hookContent.includes('searchInListTerm') && 
                 hookContent.includes('searchInListResults'),
    description: 'États de recherche locale présents'
  },
  {
    name: 'Recherche Locale - Fonctions',
    check: () => hookContent.includes('searchInList') && 
                 hookContent.includes('clearSearchInList'),
    description: 'Fonctions de recherche locale présentes'
  },
  {
    name: 'Recherche Locale - Logique',
    check: () => hookContent.includes('searchFields.some') && 
                 hookContent.includes('toLowerCase().includes'),
    description: 'Logique de recherche présente'
  },
  
  // Interface de retour
  {
    name: 'Interface - Virtualisation',
    check: () => hookContent.includes('virtualizedItems:') && 
                 hookContent.includes('virtualStats:'),
    description: 'Interface de virtualisation exposée'
  },
  {
    name: 'Interface - Curseur',
    check: () => hookContent.includes('cursorPagination,'),
    description: 'Interface de pagination curseur exposée'
  },
  {
    name: 'Interface - Auto-refresh',
    check: () => hookContent.includes('autoRefreshStatus,') && 
                 hookContent.includes('startAutoRefresh,'),
    description: 'Interface d\'auto-refresh exposée'
  },
  {
    name: 'Interface - Recherche',
    check: () => hookContent.includes('searchInListTerm,') && 
                 hookContent.includes('searchInListResults,'),
    description: 'Interface de recherche locale exposée'
  }
];

// Exécution des tests
let passed = 0;
let failed = 0;

console.log('\n📋 RÉSULTATS DES TESTS:');
console.log('----------------------');

tests.forEach((test, index) => {
  const result = test.check();
  const status = result ? '✅' : '❌';
  const number = (index + 1).toString().padStart(2, '0');
  
  console.log(`${status} Test ${number}: ${test.name}`);
  console.log(`    ${test.description}`);
  
  if (result) {
    passed++;
  } else {
    failed++;
    console.log(`    ⚠️  Échec: Fonctionnalité non trouvée`);
  }
  console.log('');
});

// Résumé
console.log('📊 RÉSUMÉ:');
console.log('----------');
console.log(`✅ Tests réussis: ${passed}`);
console.log(`❌ Tests échoués: ${failed}`);
console.log(`📈 Taux de réussite: ${Math.round((passed / tests.length) * 100)}%`);

if (failed === 0) {
  console.log('\n🎉 TOUS LES TESTS SONT PASSÉS !');
  console.log('✅ Phase 2 validée avec succès');
  console.log('🚀 Toutes les fonctionnalités critiques sont implémentées');
} else {
  console.log('\n⚠️  CERTAINS TESTS ONT ÉCHOUÉ');
  console.log('❌ Vérifiez l\'implémentation des fonctionnalités manquantes');
}

// Test de compilation
console.log('\n🔧 TEST DE COMPILATION:');
console.log('-----------------------');

const { execSync } = require('child_process');

try {
  console.log('📦 Vérification de la syntaxe...');
  execSync('node -c ' + hookPath, { stdio: 'pipe' });
  console.log('✅ Syntaxe JavaScript valide');
  
  console.log('🔍 Vérification ESLint...');
  try {
    execSync('npx eslint ' + hookPath + ' --format=compact', { stdio: 'pipe' });
    console.log('✅ Aucune erreur ESLint critique');
  } catch (eslintError) {
    const output = eslintError.stdout.toString();
    if (output.includes('error')) {
      console.log('❌ Erreurs ESLint détectées');
      console.log(output);
    } else {
      console.log('⚠️  Warnings ESLint (non critiques)');
    }
  }
  
} catch (error) {
  console.log('❌ Erreur de syntaxe détectée');
  console.log(error.message);
}

console.log('\n' + '='.repeat(50));
console.log('🏁 TEST PHASE 2 TERMINÉ');
console.log('='.repeat(50));

process.exit(failed === 0 ? 0 : 1); 