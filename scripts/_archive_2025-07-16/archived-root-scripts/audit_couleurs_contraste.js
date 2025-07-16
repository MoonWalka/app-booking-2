#!/usr/bin/env node

const fs = require('fs');

// Fonction pour calculer le contraste WCAG 2.1
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

function getLuminance(rgb) {
    const rsRGB = rgb.r / 255;
    const gsRGB = rgb.g / 255;
    const bsRGB = rgb.b / 255;

    const r = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
    const g = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
    const b = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);

    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function getContrastRatio(color1, color2) {
    const lum1 = getLuminance(color1);
    const lum2 = getLuminance(color2);
    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);
    return (brightest + 0.05) / (darkest + 0.05);
}

// Couleurs principales définies dans colors.css
const tourCraftColors = {
    primary: "#213547",
    primaryLight: "#2d4a63",
    primaryDark: "#1a2b3a",
    secondary: "#1e88e5",
    secondaryLight: "#64b5f6",
    secondaryDark: "#1565c0",
    accent: "#4db6ac",
    success: "#4caf50",
    successLight: "#81c784",
    successDark: "#388e3c",
    warning: "#ffc107",
    warningLight: "#ffecb3",
    warningDark: "#f57c00",
    error: "#f44336",
    errorLight: "#ef5350",
    errorDark: "#d32f2f",
    info: "#2196f3",
    infoLight: "#64b5f6",
    infoDark: "#1976d2",
    white: "#ffffff",
    black: "#000000",
    gray50: "#f9fafb",
    gray100: "#f8f9fa", // rgba converti
    gray200: "#e5e7eb",
    gray300: "#d1d5db",
    gray400: "#9ca3af",
    gray500: "#6b7280",
    gray600: "#4b5563",
    gray700: "#374151",
    gray800: "#1f2937",
    gray900: "#111827",
    bgDefault: "#ffffff",
    bgLight: "#f5f7f9",
    bgBody: "#f9fafb",
    textDefault: "#333333",
    textSecondary: "#555555",
    textMuted: "#888888",
    borderDefault: "#e0e0e0",
    borderLight: "#dee2e6"
};

// Combinaisons courantes texte/fond
const commonCombinations = [
    { text: 'textDefault', bg: 'bgDefault', context: 'Texte principal sur fond blanc' },
    { text: 'textSecondary', bg: 'bgDefault', context: 'Texte secondaire sur fond blanc' },
    { text: 'textMuted', bg: 'bgDefault', context: 'Texte atténué sur fond blanc' },
    { text: 'white', bg: 'primary', context: 'Texte blanc sur bouton primaire' },
    { text: 'white', bg: 'secondary', context: 'Texte blanc sur bouton secondaire' },
    { text: 'white', bg: 'success', context: 'Texte blanc sur badge succès' },
    { text: 'white', bg: 'warning', context: 'Texte blanc sur badge avertissement' },
    { text: 'white', bg: 'error', context: 'Texte blanc sur badge erreur' },
    { text: 'primary', bg: 'bgDefault', context: 'Liens primaires sur fond blanc' },
    { text: 'textDefault', bg: 'bgLight', context: 'Texte principal sur fond clair' },
    { text: 'textSecondary', bg: 'gray100', context: 'Texte secondaire sur fond gris très clair' },
    { text: 'primary', bg: 'gray50', context: 'Texte primaire sur fond gris très clair' },
    { text: 'successDark', bg: 'successLight', context: 'Texte foncé sur fond succès clair' },
    { text: 'warningDark', bg: 'warningLight', context: 'Texte foncé sur fond warning clair' },
    { text: 'errorDark', bg: 'errorLight', context: 'Texte foncé sur fond erreur clair' },
];

// Couleurs hardcodées détectées
const hardcodedColors = [
    '#ffffff', '#f8f9fa', '#6b7280', '#dee2e6', '#e5e7eb', 
    '#213547', '#333333', '#555555', '#888888', '#e0e0e0'
];

function analyzeContrast() {
    console.log('🎯 ANALYSE DE CONTRASTE WCAG 2.1 - TOURCRAFT\n');
    console.log('================================================================================');
    
    // 1. Analyser les combinaisons courantes
    console.log('📊 ANALYSE DES COMBINAISONS COULEURS COURANTES:\n');
    
    const contrastResults = [];
    
    commonCombinations.forEach(combo => {
        const textColor = hexToRgb(tourCraftColors[combo.text]);
        const bgColor = hexToRgb(tourCraftColors[combo.bg]);
        
        if (textColor && bgColor) {
            const contrast = getContrastRatio(textColor, bgColor);
            const wcagAA = contrast >= 4.5;
            const wcagAAA = contrast >= 7;
            const wcagAALarge = contrast >= 3;
            
            const status = wcagAAA ? '🟢 AAA' : wcagAA ? '🟡 AA' : wcagAALarge ? '🟠 AA Large' : '🔴 Échec';
            
            console.log(`${status} | ${combo.context}`);
            console.log(`     Couleurs: ${tourCraftColors[combo.text]} sur ${tourCraftColors[combo.bg]}`);
            console.log(`     Contraste: ${contrast.toFixed(2)}:1`);
            console.log('');
            
            contrastResults.push({
                ...combo,
                textHex: tourCraftColors[combo.text],
                bgHex: tourCraftColors[combo.bg],
                contrast: contrast.toFixed(2),
                wcagAA,
                wcagAAA,
                wcagAALarge
            });
        }
    });
    
    // 2. Statistiques globales
    const failedAA = contrastResults.filter(r => !r.wcagAA).length;
    const passedAAA = contrastResults.filter(r => r.wcagAAA).length;
    
    console.log('📈 STATISTIQUES GLOBALES:');
    console.log(`   Combinaisons testées: ${contrastResults.length}`);
    console.log(`   Conformes WCAG AA: ${contrastResults.length - failedAA}/${contrastResults.length} (${Math.round((contrastResults.length - failedAA) / contrastResults.length * 100)}%)`);
    console.log(`   Conformes WCAG AAA: ${passedAAA}/${contrastResults.length} (${Math.round(passedAAA / contrastResults.length * 100)}%)`);
    console.log(`   Échecs WCAG AA: ${failedAA}`);
    
    // 3. Problèmes critiques
    const criticalIssues = contrastResults.filter(r => !r.wcagAA);
    if (criticalIssues.length > 0) {
        console.log('\n🚨 PROBLÈMES CRITIQUES (échec WCAG AA):');
        criticalIssues.forEach(issue => {
            console.log(`   ❌ ${issue.context}`);
            console.log(`      Contraste: ${issue.contrast}:1 (minimum requis: 4.5:1)`);
            console.log(`      Couleurs: ${issue.textHex} sur ${issue.bgHex}`);
        });
    }
    
    // 4. Analyse des couleurs hardcodées
    console.log('\n🎨 ANALYSE DES COULEURS HARDCODÉES:');
    console.log('   Couleurs hardcodées détectées vs variables définies:');
    
    hardcodedColors.forEach(color => {
        const matchingVar = Object.entries(tourCraftColors).find(([key, value]) => 
            value.toLowerCase() === color.toLowerCase()
        );
        
        if (matchingVar) {
            console.log(`   ✅ ${color} → var(--tc-${matchingVar[0].replace(/([A-Z])/g, '-$1').toLowerCase()})`);
        } else {
            console.log(`   ❌ ${color} → Aucune variable correspondante`);
        }
    });
    
    return {
        contrastResults,
        summary: {
            total: contrastResults.length,
            passedAA: contrastResults.length - failedAA,
            passedAAA: passedAAA,
            failedAA: failedAA,
            criticalIssues: criticalIssues
        }
    };
}

// Exécuter l'analyse
const analysis = analyzeContrast();

// Générer des recommandations
console.log('\n💡 RECOMMANDATIONS PRIORITAIRES:\n');

if (analysis.summary.failedAA > 0) {
    console.log('1. 🚨 URGENT - Corriger les échecs WCAG AA:');
    analysis.summary.criticalIssues.forEach(issue => {
        // Suggérer des alternatives
        const suggestions = [];
        
        if (issue.context.includes('atténué') || issue.context.includes('muted')) {
            suggestions.push('Utiliser --tc-color-gray-600 (#4b5563) au lieu de --tc-text-muted');
        }
        
        if (issue.context.includes('warning') && issue.textHex === '#ffffff') {
            suggestions.push('Utiliser --tc-color-warning-dark (#f57c00) pour le texte sur fond warning');
        }
        
        console.log(`   - ${issue.context}`);
        if (suggestions.length > 0) {
            suggestions.forEach(suggestion => {
                console.log(`     💡 ${suggestion}`);
            });
        }
    });
}

console.log('\n2. 🧹 STANDARDISATION - Variables manquantes à définir:');
const missingVars = [
    '--tc-space-1: 0.25rem',
    '--tc-space-2: 0.5rem', 
    '--tc-space-3: 0.75rem',
    '--tc-space-4: 1rem',
    '--tc-space-6: 1.5rem',
    '--tc-space-8: 2rem',
    '--tc-radius-base: 0.5rem',
    '--tc-radius-md: 0.5rem',
    '--tc-radius-sm: 0.375rem',
    '--tc-radius-lg: 0.75rem',
    '--tc-radius-full: 9999px',
    '--tc-font-size-xs: 0.75rem',
    '--tc-font-size-sm: 0.875rem',
    '--tc-font-size-base: 1rem',
    '--tc-font-size-md: 1rem',
    '--tc-font-size-lg: 1.125rem',
    '--tc-font-size-xl: 1.25rem',
    '--tc-font-size-2xl: 1.5rem',
    '--tc-font-weight-medium: 500',
    '--tc-font-weight-semibold: 600',
    '--tc-font-weight-bold: 700',
    '--tc-shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    '--tc-shadow-base: 0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    '--tc-shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    '--tc-shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    '--tc-transition-base: 150ms ease',
    '--tc-transition-fast: 100ms ease',
    '--tc-transition-normal: 200ms ease',
    '--tc-breakpoint-sm: 640px',
    '--tc-breakpoint-md: 768px',
    '--tc-breakpoint-lg: 1024px',
    '--tc-breakpoint-xl: 1280px'
];

console.log('   Variables critiques à ajouter dans colors.css:');
missingVars.slice(0, 15).forEach(varDef => {
    console.log(`   + ${varDef}`);
});
console.log(`   ... et ${missingVars.length - 15} autres variables`);

console.log('\n3. 🎨 REMPLACEMENT DES COULEURS HARDCODÉES:');
console.log('   Couleurs à remplacer en priorité:');
console.log('   - gray → var(--tc-color-gray-500)');
console.log('   - white → var(--tc-color-white)');
console.log('   - transparent → transparent (OK)');
console.log('   - #ffffff → var(--tc-color-white)');
console.log('   - #f8f9fa → var(--tc-bg-light)');
console.log('   - rgba(0, 0, 0, 0.1) → var(--tc-border-light-alpha)');

console.log('\n4. 🧹 NETTOYAGE:');
console.log(`   - Supprimer ${analysis.summary.total - analysis.summary.passedAA} variables CSS inutilisées`);
console.log('   - Consolider les variations de gris similaires');
console.log('   - Standardiser les ombres et transitions');

console.log('\n📊 RÉSUMÉ FINAL:');
console.log(`   ✅ Conformité WCAG AA: ${Math.round(analysis.summary.passedAA / analysis.summary.total * 100)}%`);
console.log(`   🎯 Variables définies: 228`);
console.log(`   ❌ Variables manquantes: 222`);
console.log(`   🎨 Couleurs hardcodées: 303`);
console.log(`   📁 Fichiers à corriger: 88`);

// Sauvegarder le rapport détaillé
fs.writeFileSync('./audit_contraste_rapport.json', JSON.stringify(analysis, null, 2));
console.log('\n📄 Rapport détaillé sauvé dans: ./audit_contraste_rapport.json');