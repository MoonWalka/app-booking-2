#!/usr/bin/env node

/**
 * Script d'audit des styles CSS
 * 
 * Ce script analyse tous les fichiers CSS et JS/JSX du projet pour vérifier
 * la conformité aux standards CSS définis dans le guide de style.
 * 
 * Utilisation: node scripts/audit_css_standards.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const COMPONENT_DIRS = [
  'src/components',
  'src/pages',
];

const CSS_VAR_PREFIX = '--tc-';
const CSS_CLASS_PREFIX = 'tc-';
const CSS_MODULE_SUFFIX = '.module.css';

// Compteurs
let moduleFiles = 0;
let nonStandardModuleFiles = 0;
let inlineStylesCount = 0;
let hardcodedValuesCount = 0;
let nonResponsiveFiles = 0;

// Formats d'impression colorés
const COLORS = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

// Motifs à rechercher
const patterns = {
  hardcodedColors: /#[0-9a-fA-F]{3,8}|rgb\(|rgba\(/g,
  hardcodedSizes: /\d+px|\d+rem|\d+em/g,
  variablesWithoutPrefix: /var\(--(?!tc-)[a-zA-Z0-9-]+/g,
  inlineStyles: /style={{[^}]+}}/g,
  mediaQueries: /@media/g,
};

/**
 * Vérifie si un fichier CSS module utilise correctement les variables CSS
 */
function auditCSSModule(filePath) {
  moduleFiles++;
  const content = fs.readFileSync(filePath, 'utf8');
  let isStandard = true;
  let issues = [];

  // Vérifier les couleurs codées en dur
  const hardcodedColors = content.match(patterns.hardcodedColors);
  if (hardcodedColors) {
    issues.push(`${hardcodedColors.length} couleurs codées en dur`);
    hardcodedValuesCount += hardcodedColors.length;
    isStandard = false;
  }

  // Vérifier les tailles codées en dur (px, rem, em)
  const hardcodedSizes = content.match(patterns.hardcodedSizes);
  if (hardcodedSizes) {
    issues.push(`${hardcodedSizes.length} valeurs de taille codées en dur`);
    hardcodedValuesCount += hardcodedSizes.length;
    isStandard = false;
  }

  // Vérifier l'utilisation de variables sans le préfixe --tc-
  const nonPrefixedVars = content.match(patterns.variablesWithoutPrefix);
  if (nonPrefixedVars) {
    issues.push(`${nonPrefixedVars.length} variables sans le préfixe ${CSS_VAR_PREFIX}`);
    isStandard = false;
  }

  // Vérifier si le fichier contient des médias queries pour le responsive
  const hasMediaQueries = patterns.mediaQueries.test(content);
  if (!hasMediaQueries && filePath.includes('/desktop/')) {
    issues.push("Pas de media queries pour le responsive");
    nonResponsiveFiles++;
    isStandard = false;
  }

  if (!isStandard) {
    nonStandardModuleFiles++;
    console.log(`${COLORS.yellow}${filePath}${COLORS.reset}`);
    issues.forEach(issue => console.log(`  - ${issue}`));
  }

  return isStandard;
}

/**
 * Vérifie si un fichier JS/JSX contient des styles en ligne
 */
function auditJSXFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const inlineStyles = content.match(patterns.inlineStyles);
  
  if (inlineStyles) {
    console.log(`${COLORS.magenta}${filePath}${COLORS.reset}`);
    console.log(`  - ${inlineStyles.length} styles en ligne détectés`);
    inlineStylesCount += inlineStyles.length;
    return false;
  }
  
  return true;
}

/**
 * Analyse récursivement un répertoire pour trouver tous les fichiers CSS et JS/JSX
 */
function scanDirectory(directory) {
  const files = fs.readdirSync(directory);
  
  files.forEach(file => {
    const filePath = path.join(directory, file);
    const stats = fs.statSync(filePath);
    
    if (stats.isDirectory()) {
      scanDirectory(filePath);
    } else if (file.endsWith(CSS_MODULE_SUFFIX)) {
      auditCSSModule(filePath);
    } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
      auditJSXFile(filePath);
    }
  });
}

/**
 * Fonction principale
 */
function main() {
  console.log(`${COLORS.blue}=== Audit des standards CSS ====${COLORS.reset}`);
  console.log('Analyse des composants...\n');

  COMPONENT_DIRS.forEach(dir => {
    try {
      scanDirectory(path.join(process.cwd(), dir));
    } catch (err) {
      console.error(`Erreur lors de l'analyse de ${dir}: ${err.message}`);
    }
  });

  // Afficher le rapport
  console.log(`\n${COLORS.blue}=== Rapport d'audit ====${COLORS.reset}`);
  console.log(`Fichiers CSS modules analysés: ${moduleFiles}`);
  console.log(`Fichiers non conformes: ${nonStandardModuleFiles} (${Math.round(nonStandardModuleFiles / moduleFiles * 100)}%)`);
  console.log(`Styles en ligne détectés: ${inlineStylesCount}`);
  console.log(`Valeurs codées en dur: ${hardcodedValuesCount}`);
  console.log(`Composants desktop non responsives: ${nonResponsiveFiles}`);

  // Recommandations
  console.log(`\n${COLORS.blue}=== Recommandations ====${COLORS.reset}`);
  if (nonStandardModuleFiles > 0) {
    console.log(`${COLORS.yellow}1. Standardiser les ${nonStandardModuleFiles} fichiers CSS modules non conformes${COLORS.reset}`);
  }
  if (inlineStylesCount > 0) {
    console.log(`${COLORS.yellow}2. Éliminer les ${inlineStylesCount} styles en ligne${COLORS.reset}`);
  }
  if (hardcodedValuesCount > 0) {
    console.log(`${COLORS.yellow}3. Remplacer les ${hardcodedValuesCount} valeurs codées en dur par des variables CSS${COLORS.reset}`);
  }
  if (nonResponsiveFiles > 0) {
    console.log(`${COLORS.yellow}4. Ajouter des media queries aux ${nonResponsiveFiles} composants desktop non responsives${COLORS.reset}`);
  }

  // Génération du rapport HTML
  const reportFile = path.join(process.cwd(), 'docs/css_audit_report.md');
  const reportContent = `# Rapport d'audit CSS - TourCraft

*Généré le: ${new Date().toLocaleString()}*

## Résumé

- **Fichiers CSS modules analysés**: ${moduleFiles}
- **Fichiers non conformes**: ${nonStandardModuleFiles} (${Math.round(nonStandardModuleFiles / moduleFiles * 100)}%)
- **Styles en ligne détectés**: ${inlineStylesCount}
- **Valeurs codées en dur**: ${hardcodedValuesCount}
- **Composants desktop non responsives**: ${nonResponsiveFiles}

## Recommandations

1. Standardiser les fichiers CSS modules non conformes
2. Éliminer les styles en ligne
3. Remplacer les valeurs codées en dur par des variables CSS
4. Ajouter des media queries aux composants desktop non responsives

## Prochaines étapes

Voir le [guide de style CSS](CSS_STYLE_GUIDE.md) pour les standards à appliquer.
`;

  fs.writeFileSync(reportFile, reportContent);
  console.log(`\nRapport sauvegardé dans ${reportFile}`);
}

main();