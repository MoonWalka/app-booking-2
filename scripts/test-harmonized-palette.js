#!/usr/bin/env node

/**
 * Test de la Palette Harmonieuse TourCraft
 * Vérifie que toutes les couleurs harmonisées sont bien définies
 * Créé le 31 Mai 2025
 */

const fs = require('fs');
const path = require('path');

const colorsPath = path.join(__dirname, '../src/styles/base/colors.css');

console.log('🎨 Test de la Palette Harmonieuse TourCraft');
console.log('===========================================\n');

// Lire le fichier colors.css
let cssContent = '';
try {
    cssContent = fs.readFileSync(colorsPath, 'utf8');
    console.log('✅ Fichier colors.css lu avec succès');
} catch (error) {
    console.error('❌ Erreur lors de la lecture du fichier colors.css:', error.message);
    process.exit(1);
}

// Vérifications des couleurs harmonisées
const tests = [
    {
        name: 'Couleur principale #213547',
        check: () => cssContent.includes('--tc-color-primary: #213547'),
        description: 'Couleur de référence présente'
    },
    {
        name: 'Palette principale HSL',
        check: () => cssContent.includes('hsl(202, 36%') && cssContent.includes('--tc-color-primary-50:'),
        description: 'Nuances principales en HSL harmonisé'
    },
    {
        name: 'Success harmonisé',
        check: () => cssContent.includes('hsl(142, 36%'),
        description: 'Couleur success avec saturation harmonisée (36%)'
    },
    {
        name: 'Warning harmonisé',
        check: () => cssContent.includes('hsl(35, 36%'),
        description: 'Couleur warning avec saturation harmonisée (36%)'
    },
    {
        name: 'Error harmonisé',
        check: () => cssContent.includes('hsl(0, 36%'),
        description: 'Couleur error avec saturation harmonisée (36%)'
    },
    {
        name: 'Info harmonisé',
        check: () => cssContent.includes('hsl(202, 45%'),
        description: 'Couleur info avec teinte harmonisée (202°)'
    },
    {
        name: 'Gris teintés',
        check: () => cssContent.includes('hsl(202, 8%') && cssContent.includes('--tc-color-gray-'),
        description: 'Gris teintés avec la couleur principale'
    },
    {
        name: 'Couleurs métier harmonisées',
        check: () => cssContent.includes('hsl(262, 36%') && cssContent.includes('hsl(222, 36%') && cssContent.includes('hsl(282, 36%'),
        description: 'Artistes, concerts, programmateurs harmonisés'
    },
    {
        name: 'Mode sombre',
        check: () => cssContent.includes('[data-theme="dark"]'),
        description: 'Support du mode sombre inclus'
    },
    {
        name: 'Variables WCAG',
        check: () => cssContent.includes('--tc-success-text-contrast') && cssContent.includes('--tc-error-text-contrast'),
        description: 'Variables de contraste WCAG présentes'
    }
];

// Exécuter les tests
let passedTests = 0;
let totalTests = tests.length;

console.log('🔍 Exécution des tests...\n');

tests.forEach((test, index) => {
    const passed = test.check();
    const status = passed ? '✅' : '❌';
    console.log(`${status} Test ${index + 1}: ${test.name}`);
    console.log(`   ${test.description}`);
    
    if (passed) {
        passedTests++;
    } else {
        console.log('   ⚠️  Test échoué');
    }
    console.log();
});

// Résultats finaux
console.log('📊 RÉSULTATS FINAUX');
console.log('==================');
console.log(`Tests réussis: ${passedTests}/${totalTests}`);
console.log(`Taux de réussite: ${Math.round((passedTests / totalTests) * 100)}%`);

if (passedTests === totalTests) {
    console.log('\n🎉 SUCCÈS ! La palette harmonieuse est correctement appliquée !');
    console.log('\n📋 PROCHAINES ÉTAPES:');
    console.log('1. Redémarrer le serveur de développement');
    console.log('2. Vérifier l\'apparence de l\'application');
    console.log('3. Tester le mode sombre si disponible');
    console.log('4. Valider l\'harmonie visuelle des couleurs');
} else {
    console.log('\n⚠️  ATTENTION ! Certains tests ont échoué.');
    console.log('Vérifiez que le fichier colors-harmonized.css a été correctement appliqué.');
}

// Informations supplémentaires
console.log('\n🔧 COMMANDES UTILES:');
console.log('• Revenir en arrière: cp src/styles/base/colors-original-backup-*.css src/styles/base/colors.css');
console.log('• Réappliquer: ./scripts/apply-harmonized-colors.sh');
console.log('• Documentation: docs/PALETTE_HARMONIEUSE_TOURCRAFT.md');

// Analyse des couleurs extraites
console.log('\n🎨 APERÇU DES COULEURS HARMONISÉES:');
const colorMatches = cssContent.match(/hsl\(\d+,\s*\d+%,\s*\d+%\)/g);
if (colorMatches) {
    const uniqueColors = [...new Set(colorMatches)].slice(0, 8); // Limiter à 8 exemples
    uniqueColors.forEach(color => {
        console.log(`   ${color}`);
    });
} else {
    console.log('   Aucune couleur HSL détectée');
}

process.exit(passedTests === totalTests ? 0 : 1);