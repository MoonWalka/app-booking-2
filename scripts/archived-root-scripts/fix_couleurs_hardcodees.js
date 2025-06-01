#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Mappings des couleurs hardcodées vers les variables CSS
const colorMappings = {
    // Couleurs les plus fréquentes
    'gray': 'var(--tc-color-gray-500)',
    'white': 'var(--tc-color-white)',
    '#ffffff': 'var(--tc-color-white)',
    '#FFFFFF': 'var(--tc-color-white)',
    '#f8f9fa': 'var(--tc-bg-light)',
    '#F8F9FA': 'var(--tc-bg-light)',
    '#6b7280': 'var(--tc-color-gray-500)',
    '#6B7280': 'var(--tc-color-gray-500)',
    '#dee2e6': 'var(--tc-border-light)',
    '#DEE2E6': 'var(--tc-border-light)',
    '#e5e7eb': 'var(--tc-color-gray-200)',
    '#E5E7EB': 'var(--tc-color-gray-200)',
    '#213547': 'var(--tc-color-primary)',
    '#333333': 'var(--tc-text-default)',
    '#555555': 'var(--tc-text-secondary)',
    '#888888': 'var(--tc-text-muted-accessible)', // Correction WCAG
    '#e0e0e0': 'var(--tc-border-default)',
    '#E0E0E0': 'var(--tc-border-default)',
    
    // RGBA courantes
    'rgba(0, 0, 0, 0.1)': 'var(--tc-border-light-alpha)',
    'rgba(0, 0, 0, 0.05)': 'var(--tc-shadow-xs)',
    'rgba(0, 0, 0, 0.5)': 'var(--tc-bg-overlay)',
    'rgba(255, 255, 255, 0.9)': 'var(--tc-bg-white-translucent)',
    'rgba(255, 255, 255, 0.1)': 'var(--tc-hover-overlay-light)',
    
    // Couleurs Bootstrap héritées
    '#007bff': 'var(--tc-color-secondary)',
    '#6c757d': 'var(--tc-color-gray-600)',
    '#28a745': 'var(--tc-color-success)',
    '#dc3545': 'var(--tc-color-error)',
    '#ffc107': 'var(--tc-color-warning)',
    '#17a2b8': 'var(--tc-color-info)',
    
    // Couleurs spécifiques TourCraft
    '#4caf50': 'var(--tc-color-success)',
    '#f44336': 'var(--tc-color-error)',
    '#2196f3': 'var(--tc-color-info)',
    '#1e88e5': 'var(--tc-color-secondary)',
    
    // Corrections pour accessibilité WCAG
    '#888': 'var(--tc-text-muted-accessible)', // Plus foncé pour contraste
};

// Couleurs nommées à remplacer (sauf transparent qui est valide)
const namedColorMappings = {
    'black': 'var(--tc-color-black)',
    'red': 'var(--tc-color-error)',
    'green': 'var(--tc-color-success)',
    'blue': 'var(--tc-color-info)',
    'yellow': 'var(--tc-color-warning)',
    'orange': 'var(--tc-color-orange)',
    'purple': 'var(--tc-color-artiste)',
    'pink': 'var(--tc-color-error-light)',
    'gray': 'var(--tc-color-gray-500)',
    'grey': 'var(--tc-color-gray-500)',
    'brown': 'var(--tc-color-gray-700)',
    'cyan': 'var(--tc-color-accent)',
    'magenta': 'var(--tc-color-error-light)',
};

function processFile(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        let hasChanges = false;
        let changeCount = 0;
        
        // Remplacer les couleurs hexadécimales et RGB
        Object.entries(colorMappings).forEach(([oldColor, newVar]) => {
            // Échapper les caractères spéciaux pour regex
            const escapedOldColor = oldColor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(`\\b${escapedOldColor}\\b`, 'gi');
            
            const matches = content.match(regex);
            if (matches) {
                content = content.replace(regex, newVar);
                hasChanges = true;
                changeCount += matches.length;
            }
        });
        
        // Remplacer les couleurs nommées (sauf dans les commentaires)
        Object.entries(namedColorMappings).forEach(([oldColor, newVar]) => {
            // Regex pour éviter les commentaires CSS
            const regex = new RegExp(`(?<!\/\\*[^*]*|\/\/[^\\n]*)\\b${oldColor}\\b(?![^*]*\\*\\/)`, 'gi');
            
            const matches = content.match(regex);
            if (matches) {
                content = content.replace(regex, newVar);
                hasChanges = true;
                changeCount += matches.length;
            }
        });
        
        if (hasChanges) {
            fs.writeFileSync(filePath, content);
            return changeCount;
        }
        
        return 0;
    } catch (error) {
        console.error(`Erreur lors du traitement de ${filePath}:`, error.message);
        return 0;
    }
}

function scanAndFixColors() {
    console.log('🎨 CORRECTION AUTOMATIQUE DES COULEURS HARDCODÉES\n');
    
    // Scanner tous les fichiers CSS
    function scanDirectory(dir) {
        const results = [];
        
        function scan(currentDir) {
            const items = fs.readdirSync(currentDir);
            
            items.forEach(item => {
                const fullPath = path.join(currentDir, item);
                const stat = fs.statSync(fullPath);
                
                if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
                    scan(fullPath);
                } else if (stat.isFile() && (item.endsWith('.css') || item.endsWith('.module.css'))) {
                    results.push(fullPath);
                }
            });
        }
        
        scan(dir);
        return results;
    }
    
    const cssFiles = scanDirectory('./src');
    console.log(`📁 Fichiers CSS trouvés: ${cssFiles.length}`);
    
    let totalChanges = 0;
    let changedFiles = 0;
    const fileResults = [];
    
    cssFiles.forEach(file => {
        const changes = processFile(file);
        if (changes > 0) {
            changedFiles++;
            totalChanges += changes;
            const relativePath = path.relative(process.cwd(), file);
            fileResults.push({ file: relativePath, changes });
            console.log(`✅ ${relativePath}: ${changes} remplacements`);
        }
    });
    
    // Traiter spécifiquement les fichiers récemment modifiés
    console.log('\n🎯 TRAITEMENT DES FICHIERS RÉCENTS:');
    const recentFiles = [
        './src/components/ui/StatsCards.module.css',
        './src/components/ui/StatusBadge.module.css',
        './src/components/ui/ActionButtons.module.css',
        './src/components/ui/ListWithFilters.module.css'
    ];
    
    recentFiles.forEach(file => {
        if (fs.existsSync(file)) {
            const changes = processFile(file);
            console.log(`   ${path.basename(file)}: ${changes} corrections`);
        }
    });
    
    console.log('\n📊 RÉSULTATS:');
    console.log(`   Fichiers traités: ${cssFiles.length}`);
    console.log(`   Fichiers modifiés: ${changedFiles}`);
    console.log(`   Total remplacements: ${totalChanges}`);
    
    if (fileResults.length > 0) {
        console.log('\n📋 DÉTAIL DES MODIFICATIONS:');
        fileResults.slice(0, 10).forEach(result => {
            console.log(`   ${result.file}: ${result.changes} changements`);
        });
        
        if (fileResults.length > 10) {
            console.log(`   ... et ${fileResults.length - 10} autres fichiers`);
        }
    }
    
    // Générer un rapport de ce qui reste à corriger manuellement
    console.log('\n⚠️  CORRECTIONS MANUELLES NÉCESSAIRES:');
    console.log('   1. Vérifier les couleurs dans les gradients CSS');
    console.log('   2. Remplacer les rgba() complexes par des variables appropriées');
    console.log('   3. Consolider les variations similaires de couleurs');
    console.log('   4. Ajouter les variables manquantes dans colors.css');
    
    console.log('\n💡 PROCHAINES ÉTAPES:');
    console.log('   1. Ajouter les variables manquantes depuis couleurs_variables_manquantes.css');
    console.log('   2. Corriger les problèmes de contraste WCAG identifiés');
    console.log('   3. Nettoyer les variables CSS inutilisées');
    console.log('   4. Tester visuellement les changements');
    
    return {
        filesProcessed: cssFiles.length,
        filesChanged: changedFiles,
        totalChanges: totalChanges,
        fileResults: fileResults
    };
}

// Fonction pour faire un backup avant modifications
function createBackup() {
    const backupDir = './backup_couleurs';
    if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
    }
    
    // Backup du fichier colors.css principal
    const colorsFile = './src/styles/base/colors.css';
    if (fs.existsSync(colorsFile)) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupFile = path.join(backupDir, `colors-${timestamp}.css`);
        fs.copyFileSync(colorsFile, backupFile);
        console.log(`💾 Backup créé: ${backupFile}`);
    }
}

// Exécution principale
console.log('🚀 DÉMARRAGE DE LA CORRECTION DES COULEURS\n');

// Demande de confirmation (simulée)
console.log('⚠️  Cette opération va modifier plusieurs fichiers CSS.');
console.log('   Un backup sera créé automatiquement.\n');

createBackup();
const results = scanAndFixColors();

// Sauvegarder les résultats
fs.writeFileSync('./correction_couleurs_rapport.json', JSON.stringify(results, null, 2));
console.log('\n📄 Rapport de correction sauvé dans: ./correction_couleurs_rapport.json');

console.log('\n✅ CORRECTION TERMINÉE');