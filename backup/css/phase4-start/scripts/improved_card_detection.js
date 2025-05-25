/**
 * Script amélioré de détection des patterns de cartes
 * 
 * Ce script analyse le code source pour identifier les composants qui pourraient bénéficier
 * d'une migration vers le composant Card standardisé. Il utilise plusieurs stratégies de détection :
 * 
 * 1. Recherche des classes CSS contenant "card" ou "Card"
 * 2. Recherche des structures de composants avec en-têtes et corps similaires aux cartes
 * 3. Recherche des patterns visuels connus qui sont fonctionnellement des cartes
 * 4. Recherche des structures avec styles de cartes (ombres, bordures, padding)
 * 
 * Exécution : node scripts/improved_card_detection.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const COMPONENTS_DIR = path.join(__dirname, '../src/components');
const STYLES_DIR = path.join(__dirname, '../src/styles');
const OUTPUT_FILE = path.join(__dirname, '../card_components_to_migrate.md');

// Patterns de détection
const CARD_PATTERNS = {
  // Classes CSS explicites pour les cartes
  cssClasses: [
    'card',
    'Card',
    'tc-card',
    'card-header',
    'card-body',
    'card-footer',
    'cardHeader',
    'cardBody',
    'cardFooter',
    'card-content',
    'cardContent',
    'card-wrapper',
    'cardWrapper',
    'detail-card',
    'detailCard',
    'dashboard-card',
    'info-card',
    'warning-card',
    'danger-card',
    'success-card',
    'form-card',
    'details-card',
    'statsCard',
  ],
  
  // Patterns de code React qui indiquent une structure de carte
  jsxPatterns: [
    // En-têtes de cartes
    'className=["\'][^"\']*header[^"\']*["\']',
    '<div[^>]*header',
    '<header',
    '<h[1-6][^>]*>.*?</h[1-6]>\\s*<div', // Titre suivi d'un div
    
    // Corps de cartes
    'className=["\'][^"\']*body[^"\']*["\']',
    '<div[^>]*body',
    
    // Pieds de cartes
    'className=["\'][^"\']*footer[^"\']*["\']',
    '<div[^>]*footer',
    '<footer',
    
    // Structures de cartes courantes avec Bootstrap
    '<div[^>]*className=["\'][^"\']*shadow[^"\']*["\']',
    '<div[^>]*className=["\'][^"\']*border\\-[^"\']*["\']',
    '<div[^>]*className=["\'][^"\']*rounded[^"\']*["\']',
    '<div[^>]*className=["\'][^"\']*mb\\-[^"\']*["\']\\s*>[^<]*<h[1-6]', // Un div avec marge suivi d'un titre
  ],
  
  // Autres termes dont la structure est souvent similaire à une carte
  similarStructures: [
    'panel',
    'Panel',
    'box',
    'Box',
    'section', 
    'Section',
    'container',
    'Container',
    'infoSection',
    'InfoSection',
    'widget',
    'Widget',
    'tile',
    'Tile',
    'module',
    'Module',
  ],
  
  // Patterns CSS qui indiquent des styles de carte
  cssPropertyPatterns: [
    'box-shadow',
    'border-radius',
    'margin-bottom.*padding',
    'background.*padding',
  ]
};

// Loggers simplifiés (sans chalk pour éviter les problèmes de compatibilité)
const logger = {
  info: (msg) => console.log(`\x1b[34m${msg}\x1b[0m`),   // Bleu
  success: (msg) => console.log(`\x1b[32m${msg}\x1b[0m`), // Vert
  warning: (msg) => console.log(`\x1b[33m${msg}\x1b[0m`), // Jaune
  error: (msg) => console.log(`\x1b[31m${msg}\x1b[0m`)    // Rouge
};

// Fonction pour analyser les fichiers de composants
async function analyzeComponentFiles() {
  logger.info("Démarrage de l'analyse des composants...");
  
  // Récupération de tous les fichiers JavaScript/JSX dans le répertoire des composants
  const componentFiles = await getAllComponentFiles(COMPONENTS_DIR);
  logger.success(`${componentFiles.length} fichiers de composants trouvés`);
  
  // Analyse de chaque fichier pour les patterns de cartes
  const potentialCardComponents = [];
  let processedFiles = 0;
  
  for (const filePath of componentFiles) {
    try {
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const detectedPatterns = detectCardPatterns(fileContent, filePath);
      
      if (detectedPatterns.isCardLike && !filePath.includes('src/components/ui/Card.js')) {
        potentialCardComponents.push({
          filePath: path.relative(path.join(__dirname, '../'), filePath),
          patterns: detectedPatterns.patterns,
          confidence: detectedPatterns.confidence,
          reasons: detectedPatterns.reasons
        });
      }
      
      processedFiles++;
      if (processedFiles % 50 === 0) {
        logger.warning(`Progression : ${processedFiles}/${componentFiles.length} fichiers traités`);
      }
    } catch (error) {
      logger.error(`Erreur lors de l'analyse du fichier ${filePath}: ${error.message}`);
    }
  }
  
  // Trier les composants potentiels par niveau de confiance (décroissant)
  potentialCardComponents.sort((a, b) => b.confidence - a.confidence);
  
  // Générer un rapport
  generateReport(potentialCardComponents);
  
  logger.success(`\nAnalyse terminée. ${potentialCardComponents.length} composants potentiels de type carte identifiés.`);
  logger.success(`Rapport enregistré dans ${OUTPUT_FILE}`);
}

// Récupérer tous les fichiers de composants (JS/JSX) de manière récursive
async function getAllComponentFiles(directory) {
  try {
    // Utiliser une commande système pour trouver tous les fichiers JS/JSX
    const cmd = `find ${directory} -type f -name "*.js" -o -name "*.jsx" | grep -v "node_modules" | grep -v "test" | grep -v ".test.js" | grep -v ".spec.js"`;
    const result = execSync(cmd, { encoding: 'utf-8' });
    
    return result.trim().split('\n').filter(filePath => filePath); // Filtrer les lignes vides
  } catch (error) {
    logger.error(`Erreur lors de la récupération des fichiers de composants: ${error.message}`);
    return [];
  }
}

// Détecter les patterns de cartes dans le contenu d'un fichier
function detectCardPatterns(fileContent, filePath) {
  const patterns = {
    cssClasses: [],
    jsxPatterns: [],
    similarStructures: [],
    cssPropertyPatterns: []
  };
  
  const result = {
    isCardLike: false,
    patterns: patterns,
    confidence: 0,
    reasons: []
  };
  
  // 1. Rechercher des classes CSS explicites pour les cartes
  for (const cssClass of CARD_PATTERNS.cssClasses) {
    if (fileContent.includes(cssClass)) {
      patterns.cssClasses.push(cssClass);
      result.reasons.push(`Utilise la classe CSS '${cssClass}'`);
      result.confidence += 30; // Forte confiance pour les classes CSS explicites
    }
  }
  
  // 2. Rechercher des patterns JSX qui indiquent une structure de carte
  for (const pattern of CARD_PATTERNS.jsxPatterns) {
    const regex = new RegExp(pattern, 'i');
    if (regex.test(fileContent)) {
      patterns.jsxPatterns.push(pattern);
      result.reasons.push(`Structure JSX similaire à une carte (${pattern})`);
      result.confidence += 20; // Confiance moyenne pour les patterns JSX
    }
  }
  
  // 3. Rechercher d'autres structures similaires aux cartes
  for (const structure of CARD_PATTERNS.similarStructures) {
    if (fileContent.includes(structure)) {
      patterns.similarStructures.push(structure);
      result.reasons.push(`Utilise une structure similaire à une carte ('${structure}')`);
      result.confidence += 15; // Confiance modérée pour les structures similaires
    }
  }
  
  // 4. Rechercher des propriétés CSS qui indiquent des styles de carte
  for (const cssProperty of CARD_PATTERNS.cssPropertyPatterns) {
    const regex = new RegExp(cssProperty, 'i');
    if (regex.test(fileContent)) {
      patterns.cssPropertyPatterns.push(cssProperty);
      result.reasons.push(`Utilise des styles CSS de carte (${cssProperty})`);
      result.confidence += 10; // Confiance faible pour les propriétés CSS
    }
  }
  
  // 5. Vérifier la structure générale du composant
  if (fileContent.includes('render') && 
      fileContent.includes('return') && 
      fileContent.includes('<div') &&
      fileContent.includes('</div>')) {
      
    // Détection si le composant a une structure de base similaire à une carte
    const hasHeader = /(?:<div[^>]*header|<h[1-6][^>]*>.*?<\/h[1-6]>)/.test(fileContent);
    const hasBody = /(?:<div[^>]*>(?!<div).*?<\/div>|<p>.*?<\/p>)/.test(fileContent);
    
    if (hasHeader && hasBody) {
      result.reasons.push('Structure générale similaire à une carte (en-tête + corps)');
      result.confidence += 25; // Bonne confiance pour une structure complète
    }
  }
  
  // 6. Vérifier si le fichier est un module CSS correspondant qui pourrait contenir des styles de carte
  const cssModulePath = filePath.replace(/\.jsx?$/, '.module.css');
  if (fs.existsSync(cssModulePath)) {
    try {
      const cssContent = fs.readFileSync(cssModulePath, 'utf-8');
      const cssCardPatterns = CARD_PATTERNS.cssPropertyPatterns.some(pattern => 
        new RegExp(pattern, 'i').test(cssContent));
      
      if (cssCardPatterns) {
        result.reasons.push('Le fichier CSS module associé contient des styles de carte');
        result.confidence += 15;
      }
    } catch (error) {
      // Ignorer les erreurs de lecture du fichier CSS
    }
  }
  
  // Déterminer si le composant est probablement une carte
  // Seuil de confiance basé sur le nombre et le type de patterns détectés
  result.isCardLike = result.confidence >= 30;
  
  // Ajuster le score de confiance pour qu'il soit entre 0 et 100
  result.confidence = Math.min(100, result.confidence);
  
  return result;
}

// Générer un rapport détaillé
function generateReport(components) {
  const confidenceLevels = {
    high: components.filter(c => c.confidence >= 70),
    medium: components.filter(c => c.confidence >= 40 && c.confidence < 70),
    low: components.filter(c => c.confidence >= 30 && c.confidence < 40)
  };
  
  let reportContent = `# Rapport de Détection des Composants de Type Carte
  
*Date de génération: ${new Date().toLocaleString()}*

Ce rapport identifie les composants qui pourraient bénéficier d'une migration vers le composant Card standardisé.

## Résumé

- **Composants détectés:** ${components.length}
  - Confiance élevée (70-100%): ${confidenceLevels.high.length}
  - Confiance moyenne (40-69%): ${confidenceLevels.medium.length}
  - Confiance faible (30-39%): ${confidenceLevels.low.length}

## Composants avec confiance élevée

${generateComponentList(confidenceLevels.high)}

## Composants avec confiance moyenne

${generateComponentList(confidenceLevels.medium)}

## Composants avec confiance faible

${generateComponentList(confidenceLevels.low)}

## Comment utiliser ce rapport

1. Commencez par examiner les composants avec confiance élevée
2. Évaluez visuellement chaque composant dans l'application
3. Migrez les composants qui sont visuellement et fonctionnellement des cartes
4. Utilisez le composant Card standardisé pour les remplacer

`;

  fs.writeFileSync(OUTPUT_FILE, reportContent);
}

// Générer la liste des composants pour le rapport
function generateComponentList(components) {
  if (components.length === 0) {
    return "*Aucun composant détecté dans cette catégorie*\n\n";
  }
  
  return components.map(component => {
    return `### ${path.basename(component.filePath)} (${component.confidence}%)
- **Chemin:** \`${component.filePath}\`
- **Raisons détectées:**
  ${component.reasons.map(reason => `- ${reason}`).join('\n  ')}
`;
  }).join('\n');
}

// Exécuter l'analyse
analyzeComponentFiles()
  .catch(error => {
    logger.error(`Erreur lors de l'exécution du script: ${error.message}`);
    process.exit(1);
  });