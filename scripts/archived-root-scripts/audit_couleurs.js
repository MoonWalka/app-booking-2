#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Patterns pour détecter les couleurs
const colorPatterns = {
    hex: /#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})\b/g,
    rgb: /rgb\s*\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)/g,
    rgba: /rgba\s*\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*[\d.]+\s*\)/g,
    cssVar: /var\(--[^)]+\)/g,
    namedColors: /\b(white|black|red|green|blue|yellow|orange|purple|pink|gray|grey|brown|cyan|magenta|transparent)\b/g
};

// Variables CSS définies dans colors.css
const definedVariables = new Set();
const usedVariables = new Set();
const hardcodedColors = new Map(); // file -> colors
const colorUsage = new Map(); // color -> files

// Fonction pour analyser un fichier CSS
function analyzeFile(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const relativePath = path.relative(process.cwd(), filePath);
        
        // Collecter les variables définies (seulement pour colors.css)
        if (filePath.includes('colors.css')) {
            const varDefinitions = content.match(/--[a-zA-Z0-9-]+:/g);
            if (varDefinitions) {
                varDefinitions.forEach(varDef => {
                    const varName = varDef.replace(':', '');
                    definedVariables.add(varName);
                });
            }
        }
        
        // Analyser les couleurs utilisées
        const fileColors = {
            hex: [],
            rgb: [],
            rgba: [],
            cssVar: [],
            named: []
        };
        
        // Rechercher chaque type de couleur
        Object.keys(colorPatterns).forEach(type => {
            const matches = content.match(colorPatterns[type]);
            if (matches) {
                fileColors[type] = [...new Set(matches)]; // dédoublonner
                
                // Tracker les variables CSS utilisées
                if (type === 'cssVar') {
                    matches.forEach(match => {
                        const varName = match.match(/--[^)]+/)?.[0];
                        if (varName) {
                            usedVariables.add(varName);
                        }
                    });
                }
                
                // Tracker les couleurs hardcodées
                if (type !== 'cssVar') {
                    matches.forEach(color => {
                        if (!colorUsage.has(color)) {
                            colorUsage.set(color, []);
                        }
                        colorUsage.get(color).push(relativePath);
                    });
                }
            }
        });
        
        // Stocker si le fichier a des couleurs hardcodées
        const hasHardcoded = fileColors.hex.length > 0 || 
                           fileColors.rgb.length > 0 || 
                           fileColors.rgba.length > 0 || 
                           fileColors.named.length > 0;
        
        if (hasHardcoded) {
            hardcodedColors.set(relativePath, fileColors);
        }
        
        return fileColors;
        
    } catch (error) {
        console.error(`Erreur lors de l'analyse de ${filePath}:`, error.message);
        return null;
    }
}

// Fonction pour scanner récursivement un dossier
function scanDirectory(dir, extensions = ['.css', '.module.css']) {
    const results = [];
    
    function scan(currentDir) {
        const items = fs.readdirSync(currentDir);
        
        items.forEach(item => {
            const fullPath = path.join(currentDir, item);
            const stat = fs.statSync(fullPath);
            
            if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
                scan(fullPath);
            } else if (stat.isFile()) {
                const ext = path.extname(item);
                if (extensions.includes(ext) || extensions.includes(path.basename(item))) {
                    results.push(fullPath);
                }
            }
        });
    }
    
    scan(dir);
    return results;
}

// Fonction principale d'audit
function auditColors() {
    console.log('🎨 AUDIT COMPLET DES COULEURS - TOURCRAFT\n');
    
    // 1. Analyser colors.css d'abord
    const colorsFile = './src/styles/base/colors.css';
    if (fs.existsSync(colorsFile)) {
        console.log('📋 Analyse des variables définies dans colors.css...');
        analyzeFile(colorsFile);
        console.log(`Variables définies: ${definedVariables.size}`);
    }
    
    // 2. Scanner tous les fichiers CSS
    console.log('\n🔍 Scan des fichiers CSS...');
    const cssFiles = scanDirectory('./src', ['.css', '.module.css']);
    console.log(`Fichiers trouvés: ${cssFiles.length}`);
    
    // 3. Analyser chaque fichier
    cssFiles.forEach(file => {
        analyzeFile(file);
    });
    
    // 4. Analyser spécifiquement les fichiers récemment modifiés
    const recentFiles = [
        './src/components/ui/StatsCards.module.css',
        './src/components/ui/StatusBadge.module.css',
        './src/components/ui/ActionButtons.module.css',
        './src/components/ui/ListWithFilters.module.css'
    ];
    
    console.log('\n🎯 Analyse des fichiers récemment modifiés...');
    const recentAnalysis = {};
    recentFiles.forEach(file => {
        if (fs.existsSync(file)) {
            recentAnalysis[file] = analyzeFile(file);
            console.log(`✓ ${path.basename(file)}`);
        } else {
            console.log(`✗ ${path.basename(file)} (non trouvé)`);
        }
    });
    
    // 5. Générer le rapport
    console.log('\n📊 RAPPORT D\'AUDIT\n');
    console.log('================================================================================');
    
    // Variables définies vs utilisées
    const unusedVariables = [...definedVariables].filter(v => !usedVariables.has(v));
    const undefinedUsed = [...usedVariables].filter(v => !definedVariables.has(v));
    
    console.log(`📈 STATISTIQUES GÉNÉRALES:`);
    console.log(`   Variables CSS définies: ${definedVariables.size}`);
    console.log(`   Variables CSS utilisées: ${usedVariables.size}`);
    console.log(`   Variables non utilisées: ${unusedVariables.length}`);
    console.log(`   Variables utilisées mais non définies: ${undefinedUsed.length}`);
    console.log(`   Fichiers avec couleurs hardcodées: ${hardcodedColors.size}`);
    
    // Couleurs hardcodées les plus utilisées
    console.log(`\n🎨 COULEURS HARDCODÉES LES PLUS FRÉQUENTES:`);
    const sortedColors = [...colorUsage.entries()]
        .sort((a, b) => b[1].length - a[1].length)
        .slice(0, 10);
    
    sortedColors.forEach(([color, files]) => {
        console.log(`   ${color}: ${files.length} fichiers`);
    });
    
    // Variables non utilisées (top 20)
    if (unusedVariables.length > 0) {
        console.log(`\n🗑️  VARIABLES NON UTILISÉES (top 20):`);
        unusedVariables.slice(0, 20).forEach(variable => {
            console.log(`   ${variable}`);
        });
    }
    
    // Variables utilisées mais non définies
    if (undefinedUsed.length > 0) {
        console.log(`\n❌ VARIABLES UTILISÉES MAIS NON DÉFINIES:`);
        undefinedUsed.forEach(variable => {
            console.log(`   ${variable}`);
        });
    }
    
    // Analyse des fichiers récents
    console.log(`\n🎯 ANALYSE DES FICHIERS RÉCENTS:`);
    Object.entries(recentAnalysis).forEach(([file, analysis]) => {
        if (analysis) {
            const hasHardcoded = analysis.hex.length > 0 || 
                               analysis.rgb.length > 0 || 
                               analysis.rgba.length > 0 || 
                               analysis.named.length > 0;
            
            console.log(`   ${path.basename(file)}:`);
            console.log(`     Variables CSS: ${analysis.cssVar.length}`);
            console.log(`     Couleurs hardcodées: ${hasHardcoded ? 'OUI' : 'NON'}`);
            if (hasHardcoded) {
                console.log(`       HEX: ${analysis.hex.length}, RGB: ${analysis.rgb.length}, RGBA: ${analysis.rgba.length}, Named: ${analysis.named.length}`);
            }
        }
    });
    
    // Recommandations
    console.log(`\n💡 RECOMMANDATIONS:`);
    
    if (hardcodedColors.size > 0) {
        console.log(`   1. Remplacer ${colorUsage.size} couleurs hardcodées par des variables CSS`);
    }
    
    if (unusedVariables.length > 0) {
        console.log(`   2. Nettoyer ${unusedVariables.length} variables CSS inutilisées`);
    }
    
    if (undefinedUsed.length > 0) {
        console.log(`   3. Définir ${undefinedUsed.length} variables CSS manquantes`);
    }
    
    // Créer un fichier de rapport détaillé
    const report = {
        summary: {
            definedVariables: definedVariables.size,
            usedVariables: usedVariables.size,
            unusedVariables: unusedVariables.length,
            undefinedUsed: undefinedUsed.length,
            filesWithHardcoded: hardcodedColors.size,
            totalHardcodedColors: colorUsage.size
        },
        unusedVariables: unusedVariables,
        undefinedVariables: undefinedUsed,
        hardcodedColors: Object.fromEntries(hardcodedColors),
        colorUsage: Object.fromEntries(colorUsage),
        recentFilesAnalysis: recentAnalysis
    };
    
    fs.writeFileSync('./audit_couleurs_rapport.json', JSON.stringify(report, null, 2));
    console.log(`\n📄 Rapport détaillé sauvé dans: ./audit_couleurs_rapport.json`);
}

// Exécuter l'audit
auditColors();