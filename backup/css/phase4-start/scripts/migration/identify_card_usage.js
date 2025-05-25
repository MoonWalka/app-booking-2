/**
 * Script pour identifier les composants qui utilisent l'ancien Card
 * Date de création: 15 mai 2025
 * 
 * Ce script analyse les imports dans le code source pour identifier les fichiers
 * qui utilisent l'ancien composant Card et qui doivent être migrés.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Chemins à analyser
const SRC_DIR = path.resolve(__dirname, '../../src');
// Liste des patterns d'import de l'ancien composant Card
const DEPRECATED_IMPORTS = [
  'from \'../common/ui/Card\'',
  'from \'../../common/ui/Card\'',
  'from \'../../../common/ui/Card\'',
  'from \'../../../../common/ui/Card\'',
  'from \'../../../../../common/ui/Card\'',
  'from \'src/components/common/ui/Card\'',
  'from "src/components/common/ui/Card"',
  'from \'./Card\'', // Analyse du context nécessaire pour ce dernier pattern
];

// Résultats
const results = {
  highPriority: [],
  mediumPriority: [],
  lowPriority: []
};

// Obtenir tous les fichiers JS/JSX dans le répertoire source
function getAllJsFiles(directory) {
  let jsFiles = [];
  
  const items = fs.readdirSync(directory);
  
  for (const item of items) {
    const fullPath = path.join(directory, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      // Exclure les dossiers node_modules
      if (item !== 'node_modules') {
        jsFiles = jsFiles.concat(getAllJsFiles(fullPath));
      }
    } else if (fullPath.match(/\.(js|jsx)$/)) {
      jsFiles.push(fullPath);
    }
  }
  
  return jsFiles;
}

// Analyser un fichier pour rechercher les imports de l'ancien Card
function analyzeFile(filePath, highConfidenceComponents) {
  const content = fs.readFileSync(filePath, 'utf8');
  let hasDeprecatedImport = false;
  
  // Vérifier les patterns d'import
  for (const pattern of DEPRECATED_IMPORTS) {
    if (content.includes(pattern)) {
      hasDeprecatedImport = true;
      break;
    }
  }
  
  if (hasDeprecatedImport) {
    // Déterminer la priorité
    const relativePath = path.relative(SRC_DIR, filePath);
    
    // Vérifier si le fichier est dans la liste des composants à haute confiance
    if (highConfidenceComponents.some(comp => relativePath.includes(comp))) {
      results.highPriority.push(relativePath);
    } else if (content.includes('<Card.') || content.includes('<CardHeader') || content.includes('<CardBody') || content.includes('<CardFooter')) {
      // Usage explicite des sous-composants
      results.mediumPriority.push(relativePath);
    } else {
      results.lowPriority.push(relativePath);
    }
  }
  
  return hasDeprecatedImport;
}

// Charger la liste des composants à haute confiance
function loadHighConfidenceComponents() {
  try {
    const reportPath = path.resolve(__dirname, '../../card_components_to_migrate.md');
    const content = fs.readFileSync(reportPath, 'utf8');
    
    // Extraire les noms de composants avec confiance élevée (90-100%)
    const regex = /### ([a-zA-Z0-9_]+\.js) \((9\d|100)%\)/g;
    const matches = [...content.matchAll(regex)];
    
    return matches.map(match => match[1]);
  } catch (error) {
    console.warn('Impossible de lire le fichier card_components_to_migrate.md');
    return [];
  }
}

// Fonction principale
function main() {
  console.log('Analyse des imports de Card déprécié...');
  
  const highConfidenceComponents = loadHighConfidenceComponents();
  console.log(`Composants à haute confiance chargés: ${highConfidenceComponents.length}`);
  
  const jsFiles = getAllJsFiles(SRC_DIR);
  console.log(`Fichiers JS/JSX trouvés: ${jsFiles.length}`);
  
  let total = 0;
  
  for (const file of jsFiles) {
    const hasDeprecatedImport = analyzeFile(file, highConfidenceComponents);
    if (hasDeprecatedImport) {
      total++;
    }
  }
  
  // Afficher les résultats
  console.log('\n=== RÉSULTATS DE L\'ANALYSE ===');
  console.log(`Total des fichiers utilisant l'ancien Card: ${total}`);
  
  console.log('\n--- PRIORITÉ HAUTE (composants à confiance élevée) ---');
  results.highPriority.forEach(file => console.log(`- ${file}`));
  
  console.log('\n--- PRIORITÉ MOYENNE (utilisation explicite des sous-composants) ---');
  results.mediumPriority.forEach(file => console.log(`- ${file}`));
  
  console.log('\n--- PRIORITÉ BASSE ---');
  results.lowPriority.forEach(file => console.log(`- ${file}`));
  
  // Générer un rapport
  const reportContent = `# Rapport d'analyse des imports de Card déprécié
Date: ${new Date().toLocaleDateString()}

## Résumé
- Total des fichiers à migrer: ${total}
- Priorité haute: ${results.highPriority.length}
- Priorité moyenne: ${results.mediumPriority.length}
- Priorité basse: ${results.lowPriority.length}

## Fichiers prioritaires à migrer
${results.highPriority.map(file => `- ${file}`).join('\n')}

## Fichiers de priorité moyenne
${results.mediumPriority.map(file => `- ${file}`).join('\n')}

## Fichiers de priorité basse
${results.lowPriority.map(file => `- ${file}`).join('\n')}
`;

  fs.writeFileSync(path.resolve(__dirname, '../../card_migration_plan.md'), reportContent);
  console.log('\nRapport généré: card_migration_plan.md');
}

// Exécuter le script
main();