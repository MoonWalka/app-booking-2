#!/usr/bin/env node

/**
 * Script d'audit CSS complet pour le projet TourCraft
 * 
 * Ce script analyse tous les fichiers CSS et génère un rapport détaillé
 * sur les conventions, conflits, couverture, variables, responsive design, etc.
 * 
 * Date: 12 mai 2025
 * Auteur: Équipe TourCraft
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');
const postcss = require('postcss');
const parser = require('postcss-selector-parser');
const syntax = require('postcss-scss');
const cssTree = require('css-tree');

// Configuration
const ROOT_DIR = path.resolve(__dirname, '..');
const STYLES_DIR = path.join(ROOT_DIR, 'src/styles');
const VARIABLES_FILE = path.join(STYLES_DIR, 'base/variables.css');
const OUTPUT_FILE = path.join(ROOT_DIR, 'css_audit_report.md');

// Paramètres d'analyse
const CSS_PATTERNS = [
  'src/styles/**/*.css',
  'src/components/**/desktop/**/*.css',
  'src/components/**/desktop/**/*.module.css',
  'src/components/**/mobile/**/*.css',
  'src/components/**/mobile/**/*.module.css',
  'src/pages/**/*.css',
  'src/pages/**/*.module.css',
  'src/hooks/**/*.css',
  'src/hooks/**/*.module.css',
];

// Patterns pour les fichiers React (pour vérifier l'utilisation des classes)
const REACT_PATTERNS = [
  'src/**/*.js',
  'src/**/*.jsx',
  'src/**/*.ts',
  'src/**/*.tsx',
];

// Structures de données pour stocker les résultats d'analyse
const cssFiles = [];
const reactFiles = [];
const allClasses = new Map(); // Classe -> [fichiers où elle est définie]
const allSelectors = new Map(); // Sélecteur -> [fichiers où il est défini]
const orphanedClasses = new Map(); // Fichier -> [classes non utilisées]
const mediaQueries = new Map(); // Point de rupture -> [fichiers où il est utilisé]
const cssVariables = {
  declared: new Map(), // Variable -> [fichiers où elle est déclarée]
  used: new Map(),     // Variable -> [fichiers où elle est utilisée]
};
const conflicts = []; // Conflits de styles
const cssImports = new Map(); // Fichier React -> [imports CSS]

// Résumé global
const summary = {
  totalCssFiles: 0,
  totalModuleFiles: 0,
  totalGlobalFiles: 0,
  totalClasses: 0,
  totalSelectors: 0,
  totalMediaQueries: 0,
  totalVariables: 0,
};

/**
 * Analyse tous les fichiers CSS spécifiés
 */
async function analyzeCssFiles() {
  console.log('1. Recherche des fichiers CSS...');
  
  // Récupérer tous les fichiers CSS
  for (const pattern of CSS_PATTERNS) {
    const files = glob.sync(pattern, { cwd: ROOT_DIR });
    
    for (const file of files) {
      const absolutePath = path.join(ROOT_DIR, file);
      const content = fs.readFileSync(absolutePath, 'utf8');
      
      const isModule = file.includes('.module.css');
      const isGlobal = !isModule;
      
      cssFiles.push({
        path: file,
        absolutePath,
        content,
        isModule,
        isGlobal,
        classes: new Set(),
        selectors: new Set(),
        variables: {
          declared: new Set(),
          used: new Set(),
        },
        mediaQueries: new Set(),
      });
      
      if (isModule) {
        summary.totalModuleFiles++;
      } else {
        summary.totalGlobalFiles++;
      }
    }
  }
  
  summary.totalCssFiles = cssFiles.length;
  console.log(`Trouvé ${summary.totalCssFiles} fichiers CSS (${summary.totalModuleFiles} modules, ${summary.totalGlobalFiles} globaux)`);
  
  // Analyser chaque fichier CSS
  for (const file of cssFiles) {
    await analyzeFile(file);
  }
}

/**
 * Analyse un fichier CSS spécifique
 */
async function analyzeFile(file) {
  console.log(`Analyse de ${file.path}...`);
  
  try {
    // Parser le CSS
    const root = postcss.parse(file.content, { from: file.path });
    
    // Analyser les règles
    root.walkRules(rule => {
      // Extraire les sélecteurs
      const selectors = rule.selectors;
      
      for (const selector of selectors) {
        // Ajouter le sélecteur à la liste des sélecteurs du fichier
        file.selectors.add(selector);
        
        // Ajouter à la map globale des sélecteurs
        if (!allSelectors.has(selector)) {
          allSelectors.set(selector, []);
        }
        allSelectors.get(selector).push(file.path);
        
        // Extraire les classes du sélecteur
        extractClasses(selector, file);
      }
      
      // Rechercher les variables utilisées dans les déclarations
      rule.walkDecls(decl => {
        const variableMatches = decl.value.match(/var\(--[a-zA-Z0-9_-]+/g);
        if (variableMatches) {
          for (const match of variableMatches) {
            const variable = match.replace('var(', '');
            file.variables.used.add(variable);
            
            if (!cssVariables.used.has(variable)) {
              cssVariables.used.set(variable, []);
            }
            cssVariables.used.get(variable).push(file.path);
          }
        }
        
        // Rechercher les conflits potentiels
        checkForConflicts(rule, decl, file);
      });
    });
    
    // Extraire les définitions de variables
    root.walkDecls(decl => {
      if (decl.prop.startsWith('--')) {
        file.variables.declared.add(decl.prop);
        
        if (!cssVariables.declared.has(decl.prop)) {
          cssVariables.declared.set(decl.prop, []);
        }
        cssVariables.declared.get(decl.prop).push(file.path);
      }
    });
    
    // Extraire les media queries
    root.walkAtRules('media', atRule => {
      const query = atRule.params;
      file.mediaQueries.add(query);
      
      if (!mediaQueries.has(query)) {
        mediaQueries.set(query, []);
      }
      mediaQueries.get(query).push(file.path);
    });
    
  } catch (error) {
    console.error(`Erreur lors de l'analyse de ${file.path}:`, error);
  }
}

/**
 * Extrait les classes CSS d'un sélecteur
 */
function extractClasses(selector, file) {
  // Analyser le sélecteur pour extraire les classes
  try {
    parser().process(selector).result.walkClasses(classNode => {
      const className = classNode.value;
      
      // Ajouter la classe à la liste des classes du fichier
      file.classes.add(className);
      
      // Ajouter à la map globale des classes
      if (!allClasses.has(className)) {
        allClasses.set(className, []);
      }
      allClasses.get(className).push(file.path);
      
      summary.totalClasses++;
    });
  } catch (error) {
    console.error(`Erreur lors de l'extraction des classes de ${selector}:`, error);
  }
}

/**
 * Vérifie les conflits potentiels dans les déclarations CSS
 */
function checkForConflicts(rule, decl, file) {
  const property = decl.prop;
  const value = decl.value;
  
  // Propriétés susceptibles de causer des conflits
  const criticalProperties = ['z-index', 'position', 'display', 'color', 'background-color'];
  
  if (criticalProperties.includes(property)) {
    for (const selector of rule.selectors) {
      // Rechercher d'autres règles qui pourraient être en conflit
      for (const otherFile of cssFiles) {
        if (otherFile.path === file.path) continue;
        
        if (otherFile.selectors.has(selector)) {
          conflicts.push({
            property,
            value,
            selector,
            file1: file.path,
            file2: otherFile.path,
          });
        }
      }
    }
  }
}

/**
 * Analyse l'utilisation des classes CSS dans les fichiers React
 */
async function analyzeReactFiles() {
  console.log('2. Analyse des fichiers React pour l\'utilisation des classes CSS...');
  
  // Récupérer tous les fichiers React
  for (const pattern of REACT_PATTERNS) {
    const files = glob.sync(pattern, { cwd: ROOT_DIR });
    
    for (const file of files) {
      const absolutePath = path.join(ROOT_DIR, file);
      const content = fs.readFileSync(absolutePath, 'utf8');
      
      reactFiles.push({
        path: file,
        absolutePath,
        content,
        classesUsed: new Set(),
        cssImports: [],
      });
    }
  }
  
  console.log(`Trouvé ${reactFiles.length} fichiers React`);
  
  // Analyser chaque fichier React
  for (const file of reactFiles) {
    analyzeReactFile(file);
  }
  
  // Identifier les classes orphelines
  identifyOrphanedClasses();
}

/**
 * Analyse un fichier React spécifique
 */
function analyzeReactFile(file) {
  const content = file.content;
  
  // Rechercher les imports CSS
  const importRegex = /import\s+['"](.+\.css)['"]/g;
  let match;
  while ((match = importRegex.exec(content)) !== null) {
    const importPath = match[1];
    file.cssImports.push(importPath);
  }
  
  // Stocker les imports dans la map globale
  cssImports.set(file.path, file.cssImports);
  
  // Rechercher les utilisations de className
  const classNameRegex = /className\s*=\s*['"]([^'"]+)['"]/g;
  while ((match = classNameRegex.exec(content)) !== null) {
    const classNames = match[1].split(/\s+/);
    for (const className of classNames) {
      // Pour les modules CSS: styles.className
      if (className.includes('.')) {
        const actualClass = className.split('.')[1];
        file.classesUsed.add(actualClass);
      } else {
        file.classesUsed.add(className);
      }
    }
  }
  
  // Rechercher les utilisations de classes via template literals
  const templateLiteralRegex = /className\s*=\s*{`([^`]+)`}/g;
  while ((match = templateLiteralRegex.exec(content)) !== null) {
    const template = match[1];
    // Extraire les classes fixes (pas les expressions)
    const templateClasses = template.split(/\s+/)
      .filter(part => !part.includes('${'))
      .map(part => part.trim())
      .filter(part => part.length > 0);
    
    for (const className of templateClasses) {
      file.classesUsed.add(className);
    }
  }
}

/**
 * Identifie les classes CSS qui ne sont pas utilisées dans les fichiers React
 */
function identifyOrphanedClasses() {
  console.log('3. Identification des classes orphelines...');
  
  // Collecter toutes les classes utilisées
  const allUsedClasses = new Set();
  for (const reactFile of reactFiles) {
    reactFile.classesUsed.forEach(className => allUsedClasses.add(className));
  }
  
  // Identifier les classes non utilisées dans chaque fichier CSS
  for (const cssFile of cssFiles) {
    const unusedClasses = [];
    
    cssFile.classes.forEach(className => {
      if (!allUsedClasses.has(className)) {
        unusedClasses.push(className);
      }
    });
    
    if (unusedClasses.length > 0) {
      orphanedClasses.set(cssFile.path, unusedClasses);
    }
  }
}

/**
 * Génère un rapport Markdown avec les résultats de l'analyse
 */
function generateReport() {
  console.log('4. Génération du rapport...');
  
  let report = `# Rapport d'audit CSS - TourCraft\n\n`;
  report += `*Généré le: ${new Date().toLocaleDateString('fr-FR')}*\n\n`;
  
  // 1. Résumé global
  report += `## 1. Résumé global\n\n`;
  report += `- **Total des fichiers CSS**: ${summary.totalCssFiles}\n`;
  report += `  - Fichiers globaux: ${summary.totalGlobalFiles}\n`;
  report += `  - Fichiers modulaires: ${summary.totalModuleFiles}\n`;
  report += `- **Total des classes définies**: ${summary.totalClasses}\n`;
  report += `- **Total des points de rupture (media queries)**: ${mediaQueries.size}\n`;
  report += `- **Variables CSS**:\n`;
  report += `  - Déclarées: ${cssVariables.declared.size}\n`;
  report += `  - Utilisées: ${cssVariables.used.size}\n\n`;
  
  // 2. Conflits et doublons
  report += `## 2. Conflits et doublons\n\n`;
  
  if (conflicts.length === 0) {
    report += `Aucun conflit majeur détecté.\n\n`;
  } else {
    report += `### 2.1 Conflits de propriétés\n\n`;
    report += `| Sélecteur | Propriété | Fichier 1 | Fichier 2 |\n`;
    report += `| --------- | --------- | --------- | --------- |\n`;
    
    for (const conflict of conflicts) {
      report += `| \`${conflict.selector}\` | \`${conflict.property}\` | ${conflict.file1} | ${conflict.file2} |\n`;
    }
    report += `\n`;
  }
  
  // Classes dupliquées
  report += `### 2.2 Classes définies dans plusieurs fichiers\n\n`;
  
  const duplicatedClasses = Array.from(allClasses.entries())
    .filter(([className, files]) => files.length > 1);
  
  if (duplicatedClasses.length === 0) {
    report += `Aucune classe dupliquée n'a été détectée.\n\n`;
  } else {
    report += `| Classe | Fichiers |\n`;
    report += `| ----- | -------- |\n`;
    
    for (const [className, files] of duplicatedClasses) {
      report += `| \`${className}\` | ${files.join(', ')} |\n`;
    }
    report += `\n`;
  }
  
  // 3. Classes orphelines
  report += `## 3. Classes orphelines\n\n`;
  
  if (orphanedClasses.size === 0) {
    report += `Aucune classe orpheline n'a été détectée. Toutes les classes définies sont utilisées.\n\n`;
  } else {
    report += `| Fichier | Classes non utilisées |\n`;
    report += `| ------- | -------------------- |\n`;
    
    for (const [file, classes] of orphanedClasses.entries()) {
      report += `| ${file} | \`${classes.join('`, `')}\` |\n`;
    }
    report += `\n`;
  }
  
  // 4. Variables manquantes ou superflues
  report += `## 4. Variables CSS\n\n`;
  
  // Variables déclarées mais non utilisées
  const unusedVariables = [];
  for (const [variable, files] of cssVariables.declared.entries()) {
    if (!cssVariables.used.has(variable)) {
      unusedVariables.push({ variable, files });
    }
  }
  
  report += `### 4.1 Variables déclarées mais non utilisées\n\n`;
  
  if (unusedVariables.length === 0) {
    report += `Toutes les variables déclarées sont utilisées dans le projet.\n\n`;
  } else {
    report += `| Variable | Déclarée dans |\n`;
    report += `| -------- | ------------- |\n`;
    
    for (const { variable, files } of unusedVariables) {
      report += `| \`${variable}\` | ${files.join(', ')} |\n`;
    }
    report += `\n`;
  }
  
  // Variables utilisées mais non déclarées
  const undefinedVariables = [];
  for (const [variable, files] of cssVariables.used.entries()) {
    if (!cssVariables.declared.has(variable)) {
      undefinedVariables.push({ variable, files });
    }
  }
  
  report += `### 4.2 Variables utilisées mais non déclarées\n\n`;
  
  if (undefinedVariables.length === 0) {
    report += `Toutes les variables utilisées sont correctement définies.\n\n`;
  } else {
    report += `| Variable | Utilisée dans |\n`;
    report += `| -------- | ------------ |\n`;
    
    for (const { variable, files } of undefinedVariables) {
      report += `| \`${variable}\` | ${files.join(', ')} |\n`;
    }
    report += `\n`;
  }
  
  // 5. Media queries
  report += `## 5. Media queries\n\n`;
  
  // Regrouper les media queries par type
  const breakpointPatterns = {
    mobile: /max-width/i,
    desktop: /min-width/i,
    other: /^(?!.*min-width|.*max-width).*/i,
  };
  
  const categorizedMediaQueries = {
    mobile: [],
    desktop: [],
    other: [],
  };
  
  for (const [query, files] of mediaQueries.entries()) {
    if (breakpointPatterns.mobile.test(query)) {
      categorizedMediaQueries.mobile.push({ query, files });
    } else if (breakpointPatterns.desktop.test(query)) {
      categorizedMediaQueries.desktop.push({ query, files });
    } else {
      categorizedMediaQueries.other.push({ query, files });
    }
  }
  
  report += `### 5.1 Points de rupture mobile (max-width)\n\n`;
  
  if (categorizedMediaQueries.mobile.length === 0) {
    report += `Aucun point de rupture mobile détecté.\n\n`;
  } else {
    report += `| Media Query | Nombre de fichiers | Exemple de fichier |\n`;
    report += `| ----------- | ------------------ | ------------------ |\n`;
    
    for (const { query, files } of categorizedMediaQueries.mobile) {
      report += `| \`${query}\` | ${files.length} | ${files[0]} |\n`;
    }
    report += `\n`;
  }
  
  report += `### 5.2 Points de rupture desktop (min-width)\n\n`;
  
  if (categorizedMediaQueries.desktop.length === 0) {
    report += `Aucun point de rupture desktop détecté.\n\n`;
  } else {
    report += `| Media Query | Nombre de fichiers | Exemple de fichier |\n`;
    report += `| ----------- | ------------------ | ------------------ |\n`;
    
    for (const { query, files } of categorizedMediaQueries.desktop) {
      report += `| \`${query}\` | ${files.length} | ${files[0]} |\n`;
    }
    report += `\n`;
  }
  
  // 6. Checklist de conformité
  report += `## 6. Checklist de conformité\n\n`;
  
  const moduleNamingPattern = /^[a-z][a-zA-Z0-9]*$/;
  const variableNamingPattern = /^--tc-/;
  
  // Vérifier le naming des classes dans les modules CSS
  const moduleClasses = [];
  for (const cssFile of cssFiles) {
    if (cssFile.isModule) {
      for (const className of cssFile.classes) {
        if (!moduleNamingPattern.test(className)) {
          moduleClasses.push({
            className,
            file: cssFile.path,
          });
        }
      }
    }
  }
  
  report += `### 6.1 Convention de nommage des classes (modules CSS)\n\n`;
  
  if (moduleClasses.length === 0) {
    report += `✅ Toutes les classes des fichiers modules suivent la convention de nommage (camelCase).\n\n`;
  } else {
    report += `❌ Certaines classes ne suivent pas la convention de nommage:\n\n`;
    report += `| Classe | Fichier |\n`;
    report += `| ----- | ------- |\n`;
    
    for (const { className, file } of moduleClasses) {
      report += `| \`${className}\` | ${file} |\n`;
    }
    report += `\n`;
  }
  
  // Vérifier le prefixe des variables CSS
  const nonStandardVariables = [];
  for (const [variable, files] of cssVariables.declared.entries()) {
    if (!variableNamingPattern.test(variable)) {
      nonStandardVariables.push({
        variable,
        files,
      });
    }
  }
  
  report += `### 6.2 Préfixe des variables CSS\n\n`;
  
  if (nonStandardVariables.length === 0) {
    report += `✅ Toutes les variables CSS utilisent le préfixe standard '--tc-'.\n\n`;
  } else {
    report += `❌ Certaines variables n'utilisent pas le préfixe standard '--tc-':\n\n`;
    report += `| Variable | Déclarée dans |\n`;
    report += `| -------- | ------------- |\n`;
    
    for (const { variable, files } of nonStandardVariables) {
      report += `| \`${variable}\` | ${files.join(', ')} |\n`;
    }
    report += `\n`;
  }
  
  // Vérifier les imports CSS
  const globalImports = [];
  for (const [file, imports] of cssImports.entries()) {
    for (const importPath of imports) {
      if (importPath.includes('global.css') || importPath.includes('index.css')) {
        globalImports.push({
          file,
          import: importPath,
        });
      }
    }
  }
  
  report += `### 6.3 Imports CSS globaux\n\n`;
  
  if (globalImports.length === 0) {
    report += `✅ Aucun composant n'importe directement des styles CSS globaux.\n\n`;
  } else {
    report += `❌ Certains composants importent des styles CSS globaux:\n\n`;
    report += `| Fichier | Import global |\n`;
    report += `| ------- | ------------- |\n`;
    
    for (const { file, import: importPath } of globalImports) {
      report += `| ${file} | \`${importPath}\` |\n`;
    }
    report += `\n`;
  }
  
  // Recommandations finales
  report += `## 7. Recommandations\n\n`;
  
  const recommendations = [];
  
  if (conflicts.length > 0) {
    recommendations.push('Résoudre les conflits de propriétés CSS en consolidant les styles ou en utilisant des modules CSS.');
  }
  
  if (orphanedClasses.size > 0) {
    recommendations.push('Nettoyer les classes CSS non utilisées pour réduire la taille des bundles.');
  }
  
  if (undefinedVariables.length > 0) {
    recommendations.push('Définir toutes les variables CSS utilisées mais non déclarées.');
  }
  
  if (unusedVariables.length > 0) {
    recommendations.push('Supprimer les variables CSS déclarées mais non utilisées.');
  }
  
  if (nonStandardVariables.length > 0) {
    recommendations.push('Standardiser les noms de variables CSS avec le préfixe --tc-.');
  }
  
  if (recommendations.length === 0) {
    report += `✅ Le projet suit les bonnes pratiques CSS. Continuez à maintenir ces standards élevés!\n`;
  } else {
    recommendations.forEach((rec, index) => {
      report += `${index + 1}. ${rec}\n`;
    });
  }
  
  // Ecrire le rapport dans un fichier
  fs.writeFileSync(OUTPUT_FILE, report);
  console.log(`Rapport généré avec succès: ${OUTPUT_FILE}`);
}

/**
 * Exécution principale
 */
async function main() {
  console.log('Démarrage de l\'audit CSS...');
  
  await analyzeCssFiles();
  await analyzeReactFiles();
  generateReport();
  
  console.log('Audit CSS terminé.');
}

main().catch(error => {
  console.error('Erreur lors de l\'exécution de l\'audit CSS:', error);
  process.exit(1);
});