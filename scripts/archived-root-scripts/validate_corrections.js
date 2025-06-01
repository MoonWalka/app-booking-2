#!/usr/bin/env node

/**
 * VALIDATION DES CORRECTIONS APPLIQUÉES
 * ====================================
 * 
 * Ce script vérifie que les corrections appliquées sont cohérentes
 * et identifie les prochaines actions prioritaires.
 */

const fs = require('fs');
const { analyzeFile, analyzeCSSFile } = require('./audit_incoherences_systematique');

// Fichiers critiques à vérifier en priorité
const CRITICAL_FILES = [
    'src/components/ui/Button.js',
    'src/components/ui/Card.js',
    'src/components/debug/ProfilerMonitor.css',
    'src/pages/ContratDetailsPage.js',
    'src/pages/ContratsPage.js',
    'src/pages/ParametresPage.js',
    'src/components/ui/ConfirmationModal.js',
    'src/components/ui/LegalInfoSection.js'
];

function validateCriticalFiles() {
    console.log('🔍 VALIDATION DES FICHIERS CRITIQUES\n');
    
    let totalIssues = 0;
    let filesFixed = 0;
    
    CRITICAL_FILES.forEach(filePath => {
        const fullPath = `./${filePath}`;
        
        if (!fs.existsSync(fullPath)) {
            console.log(`❌ ${filePath} - FICHIER NON TROUVÉ`);
            return;
        }
        
        try {
            const issues = filePath.endsWith('.css') 
                ? analyzeCSSFile(fullPath) 
                : analyzeFile(fullPath);
                
            if (issues.length === 0) {
                console.log(`✅ ${filePath} - CORRIGÉ`);
                filesFixed++;
            } else {
                console.log(`🔴 ${filePath} - ${issues.length} problèmes restants`);
                issues.forEach(issue => {
                    console.log(`   └─ ${issue}`);
                });
                totalIssues += issues.length;
            }
        } catch (error) {
            console.log(`❌ ${filePath} - ERREUR: ${error.message}`);
        }
    });
    
    console.log(`\n📊 RÉSUMÉ VALIDATION:`);
    console.log(`   • Fichiers corrigés: ${filesFixed}/${CRITICAL_FILES.length}`);
    console.log(`   • Problèmes restants: ${totalIssues}`);
    
    const completionRate = Math.round((filesFixed / CRITICAL_FILES.length) * 100);
    console.log(`   • Taux de correction: ${completionRate}%`);
    
    return { filesFixed, totalIssues, completionRate };
}

function checkNewComponents() {
    console.log('\n🔍 VÉRIFICATION DES NOUVEAUX COMPOSANTS\n');
    
    const newComponents = [
        'src/components/ui/Layout.js',
        'src/components/ui/Form.js',
        'src/components/ui/Layout.module.css',
        'src/components/ui/Form.module.css'
    ];
    
    let componentsCreated = 0;
    
    newComponents.forEach(component => {
        if (fs.existsSync(`./${component}`)) {
            console.log(`✅ ${component} - CRÉÉ`);
            componentsCreated++;
        } else {
            console.log(`❌ ${component} - MANQUANT`);
        }
    });
    
    console.log(`\n📊 Nouveaux composants: ${componentsCreated}/${newComponents.length} créés`);
    return componentsCreated === newComponents.length;
}

function generateNextActions(stats) {
    console.log('\n' + '='.repeat(80));
    console.log('🎯 PROCHAINES ACTIONS PRIORITAIRES');
    console.log('='.repeat(80));
    
    if (stats.completionRate < 50) {
        console.log('\n🚨 URGENT - CONTINUER LES CORRECTIONS DE BASE');
        console.log('   1. Terminer la migration des composants UI critiques');
        console.log('   2. Supprimer tous les imports react-bootstrap restants');
        console.log('   3. Créer les composants manquants (Modal, Spinner, etc.)');
    } else if (stats.completionRate < 80) {
        console.log('\n⚡ IMPORTANT - MIGRER LES PAGES PRINCIPALES');
        console.log('   1. Corriger src/pages/ContratDetailsPage.js');
        console.log('   2. Corriger src/pages/ContratsPage.js');
        console.log('   3. Corriger src/pages/ParametresPage.js');
        console.log('   4. Valider les layouts avec nouveaux composants');
    } else {
        console.log('\n✅ BIEN - FINALISER LES DERNIERS DÉTAILS');
        console.log('   1. Harmoniser couleurs dans fichiers CSS restants');
        console.log('   2. Corriger les styles inline');
        console.log('   3. Valider l\'expérience utilisateur globale');
        console.log('   4. Exécuter audit final complet');
    }
    
    console.log('\n📋 COMMANDES UTILES:');
    console.log('   • Audit complet: node audit_incoherences_systematique.js');
    console.log('   • Corrections auto: node fix_critical_incoherences.js');
    console.log('   • Test application: npm start');
    console.log('   • Build production: npm run build');
    
    console.log('\n🎨 RAPPEL PALETTE:');
    console.log('   • Primary: #213547 (var(--tc-color-primary))');
    console.log('   • Success: var(--tc-color-success)');
    console.log('   • Warning: var(--tc-color-warning)');
    console.log('   • Error: var(--tc-color-error)');
    console.log('   • Info: var(--tc-color-info)');
}

function main() {
    console.log('🔧 VALIDATION DES CORRECTIONS APPLIQUÉES\n');
    console.log('Vérification de la cohérence avec palette #213547...\n');
    
    const stats = validateCriticalFiles();
    const newComponentsOK = checkNewComponents();
    
    generateNextActions(stats);
    
    if (stats.completionRate === 100 && newComponentsOK) {
        console.log('\n🎉 FÉLICITATIONS!');
        console.log('Tous les fichiers critiques sont corrigés et harmonisés!');
        console.log('Procédez maintenant aux corrections des fichiers secondaires.');
    }
    
    console.log('\n' + '='.repeat(80));
}

if (require.main === module) {
    main();
}

module.exports = { validateCriticalFiles, checkNewComponents };