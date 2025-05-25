/**
 * Script de migration pour remplacer les implémentations personnalisées
 * de cartes par le composant Card standardisé
 * 
 * Usage:
 *   node scripts/migration/migrate_cards.js
 * 
 * Ce script identifie les composants qui utilisent des classes comme
 * 'card', 'cardHeader', 'formCard', etc. et les remplace par le 
 * composant Card standardisé depuis le répertoire ui/
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Configuration
const ROOT_DIR = path.resolve(__dirname, '../..');
const SRC_DIR = path.join(ROOT_DIR, 'src');
const COMPONENTS_DIR = path.join(SRC_DIR, 'components');

// Expressions régulières pour identifier les différents types de cartes
const cardPatterns = [
  /className=[\"\'](?:[^\"\']*\s+)?card(?:[-_A-Za-z0-9]*\s+[^\"\']*|[^\"\']*)/g,
  /className=[\"\'](?:[^\"\']*\s+)?(?:form|details)Card(?:[-_A-Za-z0-9]*\s+[^\"\']*|[^\"\']*)/g,
  /className=[\"\'](?:[^\"\']*\s+)?cardHeader(?:[-_A-Za-z0-9]*\s+[^\"\']*|[^\"\']*)/g,
];

// Liste des composants prioritaires à migrer (ceux avec le plus de doublons)
const priorityComponents = [
  'structures/desktop/sections',
  'programmateurs/desktop',
  'lieux/desktop',
  'concerts/sections',
  'artistes/desktop'
];

function scanFiles() {
  console.log('Scan des fichiers pour détecter les implémentations de cartes personnalisées...');
  
  let results = [];
  
  // Analyser les fichiers JS dans le répertoire des composants
  glob.sync('**/*.js', { cwd: COMPONENTS_DIR })
    .filter(file => !file.includes('ui/')) // Exclure les composants UI standardisés
    .forEach(file => {
      const filePath = path.join(COMPONENTS_DIR, file);
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Vérifier la présence des patterns de cartes
      let matchFound = false;
      cardPatterns.forEach(pattern => {
        if (pattern.test(content)) {
          matchFound = true;
        }
      });
      
      if (matchFound) {
        // Calculer le score de priorité basé sur le répertoire
        let priority = 0;
        priorityComponents.forEach((comp, index) => {
          if (file.includes(comp)) {
            priority = priorityComponents.length - index;
          }
        });
        
        results.push({
          file,
          path: filePath,
          priority
        });
      }
    });
  
  // Trier par priorité
  results.sort((a, b) => b.priority - a.priority);
  
  console.log(`${results.length} fichiers identifiés pour la migration`);
  return results;
}

function generateMigrationPlan(files) {
  console.log('\nPlan de migration:');
  console.log('=================\n');
  
  let currentCategory = '';
  
  files.forEach((file, index) => {
    const fileDir = path.dirname(file.file);
    const fileCategory = fileDir.split('/')[0];
    
    if (fileCategory !== currentCategory) {
      console.log(`\n## Catégorie: ${fileCategory}`);
      currentCategory = fileCategory;
    }
    
    console.log(`${index + 1}. ${file.file}`);
  });
  
  // Génération d'exemples de migration
  console.log('\n\nExemples de migration:');
  console.log('===================\n');
  
  console.log('Avant:');
  console.log('```jsx');
  console.log('<div className={styles.card}>');
  console.log('  <div className={styles.cardHeader}>');
  console.log('    <h3>Titre de la carte</h3>');
  console.log('    <div className={styles.cardActions}>');
  console.log('      <button>Action</button>');
  console.log('    </div>');
  console.log('  </div>');
  console.log('  <div className={styles.cardBody}>');
  console.log('    Contenu de la carte');
  console.log('  </div>');
  console.log('</div>');
  console.log('```');
  
  console.log('\nAprès:');
  console.log('```jsx');
  console.log('import Card from \'@/components/ui/Card\';');
  console.log('');
  console.log('<Card');
  console.log('  title="Titre de la carte"');
  console.log('  headerActions={<button>Action</button>}');
  console.log('  className={styles.customCard}');
  console.log('>');
  console.log('  Contenu de la carte');
  console.log('</Card>');
  console.log('```');
  
  // Génération du plan d'action
  console.log('\n\nProchaines étapes:');
  console.log('===============\n');
  console.log('1. Commencer par migrer les composants de structure avec la plus forte priorité');
  console.log('2. Standardiser ensuite les composants programmateurs et lieux');
  console.log('3. Continuer avec les composants concerts et artistes');
  console.log('4. Mettre à jour les tests unitaires impactés');
  console.log('\nExécutez ce script périodiquement pour suivre votre progression');
}

// Fonction principale
function main() {
  console.log('=======================================');
  console.log('Migration vers Card standardisée');
  console.log('=======================================\n');
  
  const files = scanFiles();
  generateMigrationPlan(files);
  
  // Créer un fichier de rapport
  const reportPath = path.join(ROOT_DIR, 'card_migration_report.md');
  fs.writeFileSync(
    reportPath,
    `# Rapport de migration des composants Card\n\n` +
    `*Généré le: ${new Date().toLocaleDateString()}*\n\n` +
    `Total des fichiers à migrer: ${files.length}\n\n` +
    files.map(f => `- [${f.priority > 0 ? '⭐'.repeat(f.priority) : ' '}] ${f.file}`).join('\n')
  );
  
  console.log(`\nRapport enregistré dans ${reportPath}`);
}

main();