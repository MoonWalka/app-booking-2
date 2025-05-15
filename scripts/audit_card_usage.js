/**
 * Script d'audit pour l'utilisation du composant Card
 * Date: 15 mai 2025
 * 
 * Ce script analyse l'ensemble des fichiers JavaScript/JSX du projet
 * pour vérifier l'utilisation correcte du composant Card standardisé.
 * 
 * Pour plus d'informations sur les standards des composants Card,
 * consultez docs/standards/components-standardises.md
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const SRC_DIR = path.resolve(__dirname, '../src');
const AUDIT_REPORT_PATH = path.resolve(__dirname, '../card_audit_report.md');
const STANDARDS_DOC_PATH = 'docs/standards/components-standardises.md';

// Patterns à rechercher
const PATTERNS = {
  // Imports corrects du composant Card standardisé
  CORRECT_IMPORTS: [
    /import\s+Card\s+from\s+['"]@\/components\/ui\/Card['"];?/,
    /import\s+Card\s+from\s+['"]src\/components\/ui\/Card['"];?/,
    /import\s+Card\s+from\s+['"]\.\.\/(\.\.\/)*components\/ui\/Card['"];?/,
    /import\s+\{\s*Card\s*\}\s+from\s+['"]@\/components['"];?/
  ],
  
  // Imports problématiques - React-Bootstrap Card direct ou ancienne implémentation
  PROBLEMATIC_IMPORTS: [
    /import\s+\{\s*Card\s*\}\s+from\s+['"]react-bootstrap['"];?/,
    /import\s+Card\s+from\s+['"]\.\.\/(\.\.\/)*common\/ui\/Card['"];?/,
    /import\s+Card\s+from\s+['"]@\/components\/common\/ui\/Card['"];?/
  ],
  
  // Usage problématique - structure DIV qui ressemble à une carte sans utiliser le composant
  DIY_CARD_PATTERNS: [
    /<div[^>]*className=['"][^'"]*card[^'"]*['"][^>]*>/i,
    /<div[^>]*className=['"][^'"]*cardHeader[^'"]*['"][^>]*>/i,
    /<div[^>]*className=['"][^'"]*cardBody[^'"]*['"][^>]*>/i,
    /<div[^>]*className=['"][^'"]*cardFooter[^'"]*['"][^>]*>/i
  ],
  
  // Usage du composant Card standard
  CARD_USAGE: /<Card[^>]*>/
};

// Résultats de l'audit
const results = {
  totalFiles: 0,
  analyzedFiles: 0,
  filesUsingCard: 0,
  filesWithCorrectImport: 0,
  filesWithProblematicImport: 0,
  filesWithDIYCard: 0,
  detailedResults: {
    correctImports: [],
    problematicImports: [],
    diyCards: [],
    noCardUsage: []
  }
};

/**
 * Obtenir tous les fichiers JS/JSX dans un répertoire
 */
function getAllJsFiles(directory) {
  let jsFiles = [];
  
  const items = fs.readdirSync(directory);
  
  for (const item of items) {
    const fullPath = path.join(directory, item);
    
    // Ignorer les fichiers et dossiers cachés
    if (item.startsWith('.')) continue;
    
    // Vérifier si le chemin existe et est accessible
    try {
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        // Exclure les répertoires comme node_modules, build, etc.
        if (item !== 'node_modules' && item !== 'build' && item !== 'coverage') {
          jsFiles = jsFiles.concat(getAllJsFiles(fullPath));
        }
      } else if (fullPath.match(/\.(js|jsx)$/)) {
        // Exclure les fichiers de test et les configurations
        if (!item.endsWith('.test.js') && !item.endsWith('.spec.js') && !item.includes('config')) {
          jsFiles.push(fullPath);
        }
      }
    } catch (err) {
      console.error(`Erreur lors de l'accès à ${fullPath}: ${err.message}`);
    }
  }
  
  return jsFiles;
}

/**
 * Analyser un fichier pour l'utilisation du composant Card
 */
function analyzeFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const relativePath = path.relative(SRC_DIR, filePath);
    const fileResult = {
      path: relativePath,
      correctImport: false,
      problematicImport: false,
      diyCard: false,
      usesCard: false
    };
    
    // Vérifier les imports corrects
    for (const pattern of PATTERNS.CORRECT_IMPORTS) {
      if (pattern.test(content)) {
        fileResult.correctImport = true;
        break;
      }
    }
    
    // Vérifier les imports problématiques
    for (const pattern of PATTERNS.PROBLEMATIC_IMPORTS) {
      if (pattern.test(content)) {
        fileResult.problematicImport = true;
        break;
      }
    }
    
    // Vérifier l'usage de Card "DIY"
    for (const pattern of PATTERNS.DIY_CARD_PATTERNS) {
      if (pattern.test(content)) {
        fileResult.diyCard = true;
        break;
      }
    }
    
    // Vérifier l'usage du composant Card
    fileResult.usesCard = PATTERNS.CARD_USAGE.test(content);
    
    // Mettre à jour les résultats agrégés
    results.analyzedFiles++;
    
    if (fileResult.usesCard) {
      results.filesUsingCard++;
    }
    
    if (fileResult.correctImport) {
      results.filesWithCorrectImport++;
      results.detailedResults.correctImports.push(relativePath);
    }
    
    if (fileResult.problematicImport) {
      results.filesWithProblematicImport++;
      results.detailedResults.problematicImports.push(relativePath);
    }
    
    if (fileResult.diyCard) {
      results.filesWithDIYCard++;
      results.detailedResults.diyCards.push(relativePath);
    }
    
    if (!fileResult.usesCard && !fileResult.diyCard) {
      results.detailedResults.noCardUsage.push(relativePath);
    }
    
    return fileResult;
  } catch (err) {
    console.error(`Erreur lors de l'analyse de ${filePath}: ${err.message}`);
    return null;
  }
}

/**
 * Générer un rapport d'audit au format Markdown
 */
function generateReport() {
  const percentCorrect = results.filesUsingCard > 0 
    ? ((results.filesWithCorrectImport / results.filesUsingCard) * 100).toFixed(2) 
    : 100;
  
  const report = `# Rapport d'Audit d'Utilisation du Composant Card
*Date: ${new Date().toLocaleDateString('fr-FR')}*

## Résumé

- **Fichiers JS/JSX analysés**: ${results.analyzedFiles}
- **Fichiers utilisant Card**: ${results.filesUsingCard}
- **Fichiers avec import correct**: ${results.filesWithCorrectImport} (${percentCorrect}%)
- **Fichiers avec import problématique**: ${results.filesWithProblematicImport}
- **Fichiers avec implémentation "DIY"**: ${results.filesWithDIYCard}

## Conformité générale

${
  results.filesWithProblematicImport === 0 && results.filesWithDIYCard === 0 
  ? '✅ **Audit réussi !** Tous les composants utilisent correctement le composant Card standardisé.' 
  : '❌ **Des problèmes ont été détectés.** Certains composants n\'utilisent pas correctement le composant Card standardisé.'
}

## Fichiers avec imports corrects

${results.detailedResults.correctImports.map(file => `- \`${file}\``).join('\n')}

${results.filesWithProblematicImport > 0 ? `
## Fichiers avec imports problématiques

${results.detailedResults.problematicImports.map(file => `- \`${file}\``).join('\n')}

Ces fichiers importent directement le composant Card de React-Bootstrap ou utilisent l'ancienne implémentation du Card. Ils devraient être mis à jour pour utiliser le composant Card standardisé.
` : ''}

${results.filesWithDIYCard > 0 ? `
## Fichiers avec implémentation "DIY" de Card

${results.detailedResults.diyCards.map(file => `- \`${file}\``).join('\n')}

Ces fichiers utilisent des classes CSS ou des structures DIV qui ressemblent à des cartes sans utiliser le composant Card standardisé. Ils devraient être refactorisés.
` : ''}

## Recommandations

${
  results.filesWithProblematicImport === 0 && results.filesWithDIYCard === 0 
  ? '- Maintenir la conformité actuelle en continuant à utiliser exclusivement le composant Card standardisé'
  : `- Migrer les ${results.filesWithProblematicImport + results.filesWithDIYCard} composants problématiques vers le composant Card standardisé
- Mettre en place un linting pour détecter les utilisations non conformes
- Planifier une revue de code ciblée pour les fichiers problématiques identifiés`
}

## Documentation

Pour plus d'informations sur les standards des composants Card et les règles de linting associées, consultez :
- [Documentation des standards des composants](/${STANDARDS_DOC_PATH})
- [Documentation du composant Card](/docs/components/Card.md)

---
*Ce rapport a été généré automatiquement par le script d'audit de composants.*
`;

  fs.writeFileSync(AUDIT_REPORT_PATH, report);
  console.log(`Rapport d'audit généré: ${AUDIT_REPORT_PATH}`);
}

/**
 * Fonction principale
 */
function main() {
  console.log('Démarrage de l\'audit des composants Card...');
  
  // Récupérer tous les fichiers JS/JSX
  const jsFiles = getAllJsFiles(SRC_DIR);
  results.totalFiles = jsFiles.length;
  
  console.log(`Analyse de ${jsFiles.length} fichiers JS/JSX...`);
  
  // Analyser chaque fichier
  for (const filePath of jsFiles) {
    analyzeFile(filePath);
  }
  
  // Générer le rapport final
  generateReport();
  
  // Afficher un résumé dans la console
  console.log('\n=== Résumé de l\'audit ===');
  console.log(`Fichiers analysés: ${results.analyzedFiles}`);
  console.log(`Fichiers utilisant Card: ${results.filesUsingCard}`);
  console.log(`Fichiers avec import correct: ${results.filesWithCorrectImport}`);
  console.log(`Fichiers avec import problématique: ${results.filesWithProblematicImport}`);
  console.log(`Fichiers avec implémentation "DIY": ${results.filesWithDIYCard}`);
  
  if (results.filesWithProblematicImport === 0 && results.filesWithDIYCard === 0) {
    console.log('\n✅ Tous les composants utilisent correctement le composant Card standardisé.');
    console.log(`Pour plus d'informations sur les standards, consultez ${STANDARDS_DOC_PATH}`);
  } else {
    console.log(`\n❌ ${results.filesWithProblematicImport + results.filesWithDIYCard} composants ne sont pas conformes.`);
    console.log(`Pour savoir comment migrer ces composants, consultez ${STANDARDS_DOC_PATH}`);
  }
}

// Exécuter l'audit
main();