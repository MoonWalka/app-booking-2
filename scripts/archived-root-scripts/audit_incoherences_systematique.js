#!/usr/bin/env node

/**
 * AUDIT SYSTÉMATIQUE DES INCOHÉRENCES UI/COULEURS
 * ================================================
 * 
 * Ce script identifie TOUTES les incohérences avec le système de design TourCraft
 * basé sur la palette harmonisée #213547
 * 
 * OBJECTIF: Détecter tous les problèmes cachés pour une cohérence parfaite
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Configuration des chemins
const SRC_DIR = './src';
const STYLES_DIR = './src/styles';

// Couleurs qui doivent être supprimées (hardcodées)
const HARDCODED_COLORS = [
    '#007bff', '#dc3545', '#28a745', '#ffc107', '#17a2b8', '#6c757d',
    '#343a40', '#f8f9fa', '#e9ecef', '#dee2e6', '#ced4da', '#adb5bd',
    '#6c757d', '#495057', '#343a40', '#212529', '#ffffff', '#000000',
    'rgba(0,0,0,', 'rgba(255,255,255,', 'rgb(0,0,0)', 'rgb(255,255,255)',
    '#fff', '#000', '#f5f5f5', '#e0e0e0', '#d0d0d0', '#ccc', '#ddd',
    '#eee', '#333', '#666', '#999', '#1a1a1a', '#2a2a2a', '#3a3a3a'
];

// React Bootstrap composants à remplacer
const BOOTSTRAP_COMPONENTS = [
    'Alert', 'Badge', 'Button', 'Card', 'Dropdown', 'Modal', 'Nav',
    'Navbar', 'Spinner', 'Toast', 'Tooltip', 'Popover', 'Table',
    'Form', 'InputGroup', 'ListGroup', 'Accordion', 'Tabs', 'Tab'
];

// Classes CSS Bootstrap à migrer
const BOOTSTRAP_CLASSES = [
    'btn-primary', 'btn-secondary', 'btn-success', 'btn-danger', 'btn-warning',
    'btn-info', 'btn-light', 'btn-dark', 'btn-outline-primary', 'btn-outline-secondary',
    'alert-success', 'alert-danger', 'alert-warning', 'alert-info',
    'badge-primary', 'badge-secondary', 'badge-success', 'badge-danger',
    'card-header', 'card-body', 'card-footer', 'dropdown-menu', 'dropdown-item',
    'modal-header', 'modal-body', 'modal-footer', 'nav-link', 'navbar-brand'
];

// Résultats de l'audit
const audit = {
    reactBootstrapImports: [],
    hardcodedColors: [],
    bootstrapClasses: [],
    inlineStyles: [],
    nonStandardComponents: [],
    inconsistentPatterns: [],
    filesAnalyzed: 0,
    totalIssues: 0
};

/**
 * Analyse un fichier pour détecter les incohérences
 */
function analyzeFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const issues = [];
    
    // 1. Détecter les imports React Bootstrap
    const bootstrapImportRegex = /import\s+.*from\s+['"]react-bootstrap['"];?/g;
    const bootstrapMatches = content.match(bootstrapImportRegex);
    if (bootstrapMatches) {
        audit.reactBootstrapImports.push({
            file: filePath,
            imports: bootstrapMatches
        });
        issues.push(`React Bootstrap import detected: ${bootstrapMatches.length} imports`);
    }

    // 2. Détecter les couleurs hardcodées
    const colorRegex = /#[0-9a-fA-F]{3,6}|rgba?\([^)]+\)|hsl\([^)]+\)/g;
    const colorMatches = content.match(colorRegex);
    if (colorMatches) {
        const hardcodedFound = colorMatches.filter(color => 
            HARDCODED_COLORS.some(hc => color.toLowerCase().includes(hc.toLowerCase()))
        );
        if (hardcodedFound.length > 0) {
            audit.hardcodedColors.push({
                file: filePath,
                colors: hardcodedFound
            });
            issues.push(`Hardcoded colors: ${hardcodedFound.join(', ')}`);
        }
    }

    // 3. Détecter les classes Bootstrap
    const classRegex = /className\s*=\s*["`'][^"`']*["`']/g;
    const classMatches = content.match(classRegex);
    if (classMatches) {
        const bootstrapClassFound = [];
        classMatches.forEach(match => {
            BOOTSTRAP_CLASSES.forEach(bsClass => {
                if (match.includes(bsClass)) {
                    bootstrapClassFound.push(bsClass);
                }
            });
        });
        if (bootstrapClassFound.length > 0) {
            audit.bootstrapClasses.push({
                file: filePath,
                classes: [...new Set(bootstrapClassFound)]
            });
            issues.push(`Bootstrap classes: ${bootstrapClassFound.join(', ')}`);
        }
    }

    // 4. Détecter les styles inline avec couleurs
    const inlineStyleRegex = /style\s*=\s*\{\{[^}]+\}\}/g;
    const inlineMatches = content.match(inlineStyleRegex);
    if (inlineMatches) {
        const stylesWithColors = inlineMatches.filter(style => 
            /background|color|border/.test(style) && 
            /#[0-9a-fA-F]{3,6}|rgba?\(|rgb\(/.test(style)
        );
        if (stylesWithColors.length > 0) {
            audit.inlineStyles.push({
                file: filePath,
                styles: stylesWithColors
            });
            issues.push(`Inline styles with colors: ${stylesWithColors.length}`);
        }
    }

    // 5. Détecter les composants non-standard utilisés
    const componentRegex = /<(\w+)/g;
    let componentMatch;
    const components = new Set();
    while ((componentMatch = componentRegex.exec(content)) !== null) {
        components.add(componentMatch[1]);
    }
    
    const nonStandardComponents = [...components].filter(comp => 
        BOOTSTRAP_COMPONENTS.includes(comp) && 
        !content.includes(`from './ui/${comp}`) &&
        !content.includes(`from '../ui/${comp}`) &&
        !content.includes(`from '../../ui/${comp}`)
    );
    
    if (nonStandardComponents.length > 0) {
        audit.nonStandardComponents.push({
            file: filePath,
            components: nonStandardComponents
        });
        issues.push(`Non-standard components: ${nonStandardComponents.join(', ')}`);
    }

    return issues;
}

/**
 * Analyse les fichiers CSS pour détecter les incohérences
 */
function analyzeCSSFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const issues = [];
    
    // Détecter les couleurs hardcodées dans CSS
    const cssColorRegex = /(background-color|color|border-color|border|box-shadow)\s*:\s*([^;]+)/g;
    let match;
    const suspiciousColors = [];
    
    while ((match = cssColorRegex.exec(content)) !== null) {
        const property = match[1];
        const value = match[2];
        
        // Vérifier si c'est une couleur hardcodée
        if (/#[0-9a-fA-F]{3,6}|rgba?\(|rgb\(|hsl\(/.test(value) && 
            !value.includes('var(--tc-')) {
            suspiciousColors.push(`${property}: ${value}`);
        }
    }
    
    if (suspiciousColors.length > 0) {
        audit.hardcodedColors.push({
            file: filePath,
            colors: suspiciousColors
        });
        issues.push(`CSS hardcoded colors: ${suspiciousColors.length}`);
    }
    
    return issues;
}

/**
 * Génère un rapport complet
 */
function generateReport() {
    console.log('\n' + '='.repeat(80));
    console.log('📊 AUDIT SYSTÉMATIQUE DES INCOHÉRENCES UI/COULEURS');
    console.log('='.repeat(80));
    
    console.log(`\n📁 Fichiers analysés: ${audit.filesAnalyzed}`);
    console.log(`🚨 Total des problèmes: ${audit.totalIssues}`);
    
    // React Bootstrap Imports
    console.log(`\n🔶 REACT BOOTSTRAP IMPORTS (${audit.reactBootstrapImports.length} fichiers)`);
    console.log('❌ PRIORITÉ: CRITIQUE - À remplacer immédiatement');
    if (audit.reactBootstrapImports.length > 0) {
        const topFiles = audit.reactBootstrapImports.slice(0, 10);
        topFiles.forEach(item => {
            console.log(`   • ${item.file.replace('./src/', '')}`);
            item.imports.forEach(imp => {
                console.log(`     └─ ${imp.trim()}`);
            });
        });
        if (audit.reactBootstrapImports.length > 10) {
            console.log(`   ... et ${audit.reactBootstrapImports.length - 10} autres fichiers`);
        }
    }
    
    // Couleurs hardcodées
    console.log(`\n🎨 COULEURS HARDCODÉES (${audit.hardcodedColors.length} fichiers)`);
    console.log('❌ PRIORITÉ: ÉLEVÉE - Remplacer par variables --tc-*');
    if (audit.hardcodedColors.length > 0) {
        const topFiles = audit.hardcodedColors.slice(0, 8);
        topFiles.forEach(item => {
            console.log(`   • ${item.file.replace('./src/', '')}`);
            const uniqueColors = [...new Set(item.colors)].slice(0, 3);
            uniqueColors.forEach(color => {
                console.log(`     └─ ${color}`);
            });
        });
        if (audit.hardcodedColors.length > 8) {
            console.log(`   ... et ${audit.hardcodedColors.length - 8} autres fichiers`);
        }
    }
    
    // Classes Bootstrap
    console.log(`\n🏷️  CLASSES BOOTSTRAP (${audit.bootstrapClasses.length} fichiers)`);
    console.log('⚠️  PRIORITÉ: MOYENNE - Migrer vers classes tc-*');
    if (audit.bootstrapClasses.length > 0) {
        const topFiles = audit.bootstrapClasses.slice(0, 6);
        topFiles.forEach(item => {
            console.log(`   • ${item.file.replace('./src/', '')}`);
            console.log(`     └─ ${item.classes.join(', ')}`);
        });
        if (audit.bootstrapClasses.length > 6) {
            console.log(`   ... et ${audit.bootstrapClasses.length - 6} autres fichiers`);
        }
    }
    
    // Styles inline
    console.log(`\n💄 STYLES INLINE AVEC COULEURS (${audit.inlineStyles.length} fichiers)`);
    console.log('⚠️  PRIORITÉ: MOYENNE - Déplacer vers CSS modules');
    if (audit.inlineStyles.length > 0) {
        const topFiles = audit.inlineStyles.slice(0, 5);
        topFiles.forEach(item => {
            console.log(`   • ${item.file.replace('./src/', '')} (${item.styles.length} styles)`);
        });
    }
    
    // Composants non-standard
    console.log(`\n🧩 COMPOSANTS NON-STANDARD (${audit.nonStandardComponents.length} fichiers)`);
    console.log('⚠️  PRIORITÉ: MOYENNE - Utiliser les composants UI standardisés');
    if (audit.nonStandardComponents.length > 0) {
        const topFiles = audit.nonStandardComponents.slice(0, 5);
        topFiles.forEach(item => {
            console.log(`   • ${item.file.replace('./src/', '')}`);
            console.log(`     └─ ${item.components.join(', ')}`);
        });
    }
    
    // Recommandations prioritaires
    console.log('\n' + '='.repeat(80));
    console.log('🎯 PLAN D\'ACTION PRIORITAIRE');
    console.log('='.repeat(80));
    
    console.log('\n1️⃣  IMMÉDIAT (React Bootstrap)');
    console.log('   • Remplacer tous les imports react-bootstrap');
    console.log('   • Utiliser les composants /src/components/ui/ existants');
    console.log('   • Créer les composants manquants si nécessaire');
    
    console.log('\n2️⃣  URGENT (Couleurs hardcodées)');
    console.log('   • Remplacer toutes les couleurs hardcodées par var(--tc-*)');
    console.log('   • Vérifier la cohérence avec la palette #213547');
    console.log('   • Contrôler le contraste WCAG AA');
    
    console.log('\n3️⃣  IMPORTANT (Classes et styles)');
    console.log('   • Migrer les classes Bootstrap vers le système tc-*');
    console.log('   • Déplacer les styles inline vers CSS modules');
    console.log('   • Standardiser les composants non-conformes');
    
    // Métriques de succès
    const totalProblems = audit.reactBootstrapImports.length + 
                         audit.hardcodedColors.length + 
                         audit.bootstrapClasses.length + 
                         audit.inlineStyles.length + 
                         audit.nonStandardComponents.length;
    
    console.log('\n📈 MÉTRIQUES CIBLES');
    console.log(`   • React Bootstrap: ${audit.reactBootstrapImports.length} → 0 fichiers`);
    console.log(`   • Couleurs hardcodées: ${audit.hardcodedColors.length} → 0 fichiers`);
    console.log(`   • Classes Bootstrap: ${audit.bootstrapClasses.length} → 0 fichiers`);
    console.log(`   • Styles inline: ${audit.inlineStyles.length} → 0 fichiers`);
    console.log(`   • Composants non-standard: ${audit.nonStandardComponents.length} → 0 fichiers`);
    console.log(`   • TOTAL: ${totalProblems} → 0 problèmes`);
    
    console.log('\n✅ OBJECTIF: Cohérence parfaite avec palette #213547');
    console.log('='.repeat(80));
}

/**
 * Sauvegarde les résultats détaillés
 */
function saveDetailedResults() {
    const detailedReport = {
        timestamp: new Date().toISOString(),
        summary: {
            filesAnalyzed: audit.filesAnalyzed,
            totalIssues: audit.totalIssues,
            issuesByCategory: {
                reactBootstrapImports: audit.reactBootstrapImports.length,
                hardcodedColors: audit.hardcodedColors.length,
                bootstrapClasses: audit.bootstrapClasses.length,
                inlineStyles: audit.inlineStyles.length,
                nonStandardComponents: audit.nonStandardComponents.length
            }
        },
        details: audit
    };
    
    fs.writeFileSync('./audit_incoherences_detail.json', JSON.stringify(detailedReport, null, 2));
    console.log('\n💾 Rapport détaillé sauvegardé: audit_incoherences_detail.json');
}

/**
 * Fonction principale
 */
function main() {
    console.log('🔍 Début de l\'audit systématique des incohérences...\n');
    
    // Analyser tous les fichiers JS/JSX
    const jsFiles = glob.sync(`${SRC_DIR}/**/*.{js,jsx}`, {
        ignore: ['**/node_modules/**', '**/build/**', '**/*.test.js', '**/*.spec.js']
    });
    
    console.log(`📂 Analyse des fichiers JS/JSX: ${jsFiles.length} fichiers`);
    jsFiles.forEach(file => {
        const issues = analyzeFile(file);
        audit.filesAnalyzed++;
        audit.totalIssues += issues.length;
    });
    
    // Analyser tous les fichiers CSS
    const cssFiles = glob.sync(`${SRC_DIR}/**/*.{css,module.css}`, {
        ignore: ['**/node_modules/**', '**/build/**']
    });
    
    console.log(`🎨 Analyse des fichiers CSS: ${cssFiles.length} fichiers`);
    cssFiles.forEach(file => {
        const issues = analyzeCSSFile(file);
        audit.filesAnalyzed++;
        audit.totalIssues += issues.length;
    });
    
    // Générer le rapport
    generateReport();
    saveDetailedResults();
}

// Exécution
if (require.main === module) {
    main();
}

module.exports = { analyzeFile, analyzeCSSFile, audit };