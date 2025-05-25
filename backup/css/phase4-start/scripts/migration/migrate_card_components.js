/**
 * Script de migration des composants Card à haute confiance
 * --------------------------------------------------------
 * Ce script facilite la migration des composants identifiés comme des candidats à forte
 * confiance (70-100%) pour être migrés vers le composant Card standardisé.
 * 
 * Utilisation: node scripts/migration/migrate_card_components.js [--dry-run] [--component=ComponentName]
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const cardTransformer = require('./card_transformer');

// Lecture du rapport de détection
const REPORT_PATH = path.join(__dirname, '../../card_components_to_migrate.md');
const output = {
  total: 0,
  highConfidence: 0,
  processed: 0,
  skipped: 0,
  migrated: [],
  backupDir: ''
};

// Configuration
const BATCH_SIZE = 10; // Nombre de composants à traiter par lot
const HIGH_CONFIDENCE_THRESHOLD = 70;
const DRY_RUN = process.argv.includes('--dry-run');
const COMPONENT_TO_PROCESS = process.argv.find(arg => arg.startsWith('--component='))?.split('=')[1];
const LOG_FILE = path.join(__dirname, '../../card_migration_report.md');

// Fonction pour extraire les composants à haute confiance du rapport
function extractHighConfidenceComponents() {
  console.log('Extraction des composants à haute confiance depuis le rapport...');
  
  try {
    const reportContent = fs.readFileSync(REPORT_PATH, 'utf8');
    const components = [];
    
    // Extraction des sections avec le pourcentage de confiance
    const componentRegex = /### ([^(]+)\s*\((\d+)%\)\s*-\s*\*\*Chemin:\*\*\s*`([^`]+)`/g;
    let match;
    
    while ((match = componentRegex.exec(reportContent)) !== null) {
      const [_, name, confidenceStr, path] = match;
      const confidence = parseInt(confidenceStr, 10);
      
      // Ajouter uniquement les composants à haute confiance
      if (confidence >= HIGH_CONFIDENCE_THRESHOLD) {
        components.push({
          name: name.trim(),
          confidence,
          path: path.trim(),
          status: 'pending'
        });
        output.highConfidence++;
      }
      
      output.total++;
    }
    
    return components;
  } catch (error) {
    console.error('Erreur lors de la lecture du rapport:', error);
    return [];
  }
}

// Fonction pour vérifier si un composant existe
function componentExists(componentPath) {
  const fullPath = path.join(__dirname, '../../', componentPath);
  return fs.existsSync(fullPath);
}

// Fonction pour créer un dossier de sauvegarde pour les fichiers originaux
function createBackupDirectory() {
  const timestamp = new Date().toISOString().replace(/:/g, '').replace(/\..+/, '').replace('T', '_');
  const backupDir = path.join(__dirname, '../../backup_deleted_files', timestamp);
  
  // S'assurer que le répertoire existe
  if (!fs.existsSync(path.join(__dirname, '../../backup_deleted_files'))) {
    fs.mkdirSync(path.join(__dirname, '../../backup_deleted_files'), { recursive: true });
  }
  
  fs.mkdirSync(backupDir, { recursive: true });
  output.backupDir = backupDir;
  
  console.log(`Dossier de sauvegarde créé: ${backupDir}`);
  return backupDir;
}

// Fonction pour générer le rapport de migration
function generateMigrationReport(components) {
  const timestamp = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
  
  let reportContent = `# Rapport de Migration des Composants Card\n\n`;
  reportContent += `*Date de génération: ${timestamp}*\n\n`;
  reportContent += `## Résumé\n\n`;
  reportContent += `- **Composants traités:** ${output.processed}/${output.highConfidence}\n`;
  reportContent += `- **Composants ignorés:** ${output.skipped}\n\n`;
  
  if (output.backupDir) {
    reportContent += `- **Dossier de sauvegarde:** ${output.backupDir}\n\n`;
  }
  
  reportContent += `## Détails des composants migrés\n\n`;
  
  // Grouper par dossiers
  const folderGroups = {};
  components.filter(c => c.status === 'migrated').forEach(component => {
    const folder = path.dirname(component.path);
    if (!folderGroups[folder]) {
      folderGroups[folder] = [];
    }
    folderGroups[folder].push(component);
  });
  
  // Ajouter les détails par dossier
  Object.keys(folderGroups).sort().forEach(folder => {
    reportContent += `### ${folder}\n\n`;
    folderGroups[folder].forEach(component => {
      reportContent += `- ${component.name} (${component.confidence}%)\n`;
    });
    reportContent += `\n`;
  });
  
  reportContent += `## Composants en attente\n\n`;
  components.filter(c => c.status === 'pending').forEach(component => {
    reportContent += `- ${component.name} (${component.confidence}%) - \`${component.path}\`\n`;
  });
  
  fs.writeFileSync(LOG_FILE, reportContent);
  console.log(`Rapport de migration généré dans ${LOG_FILE}`);
}

// Fonction principale pour exécuter la migration
function migrateComponents() {
  console.log('Démarrage de la migration des composants Card...');
  
  const components = extractHighConfidenceComponents();
  console.log(`${components.length} composants à haute confiance identifiés.`);
  
  if (components.length === 0) {
    console.log('Aucun composant à migrer trouvé.');
    return;
  }
  
  // Créer un répertoire de sauvegarde (sauf en mode dry-run)
  if (!DRY_RUN) {
    createBackupDirectory();
  }
  
  // Filtrer les composants qui n'existent pas
  const existingComponents = components.filter(component => {
    const exists = componentExists(component.path);
    if (!exists) {
      console.warn(`Attention: Le composant ${component.name} n'existe pas au chemin spécifié: ${component.path}`);
      output.skipped++;
    }
    return exists;
  });
  
  // Si un composant spécifique est demandé
  if (COMPONENT_TO_PROCESS) {
    console.log(`Recherche du composant spécifique: ${COMPONENT_TO_PROCESS}`);
    
    const componentToProcess = existingComponents.find(c => 
      c.name.includes(COMPONENT_TO_PROCESS) || 
      c.path.includes(COMPONENT_TO_PROCESS)
    );
    
    if (componentToProcess) {
      console.log(`Traitement du composant spécifique: ${componentToProcess.name}`);
      processComponent(componentToProcess);
      output.processed++;
    } else {
      console.log(`Composant spécifié non trouvé: ${COMPONENT_TO_PROCESS}`);
    }
    
    generateMigrationReport(components);
    return;
  }
  
  // Traitement par lots
  console.log(`Traitement des composants par lots de ${BATCH_SIZE}...`);
  
  // Trier par confiance décroissante
  const sortedComponents = [...existingComponents].sort((a, b) => b.confidence - a.confidence);
  
  // Prendre les premiers éléments pour ce lot
  const batch = sortedComponents.slice(0, Math.min(BATCH_SIZE, sortedComponents.length));
  
  batch.forEach(component => {
    processComponent(component);
    output.processed++;
  });
  
  generateMigrationReport(components);
  
  console.log(`\nMigration terminée. ${output.processed} composants traités.`);
  if (output.skipped > 0) {
    console.log(`${output.skipped} composants ignorés.`);
  }
}

// Fonction pour traiter un composant individuel
function processComponent(component) {
  console.log(`\nTraitement de ${component.name} (${component.confidence}%)`);
  console.log(`Chemin: ${component.path}`);
  
  const fullPath = path.join(__dirname, '../../', component.path);
  
  try {
    // Lire le contenu du fichier
    const content = fs.readFileSync(fullPath, 'utf8');
    
    // Analyser le composant et ses besoins de migration
    const cardElements = cardTransformer.detectCardElements(content);
    
    console.log(`Éléments détectés: ${cardElements.cardClasses.length} classes, ${cardElements.cardStructure.length} structures`);
    
    // Appliquer la transformation
    const transformedCode = cardTransformer.transformComponent(content);
    
    if (DRY_RUN) {
      console.log('Mode dry-run: aucune modification ne sera appliquée.');
      
      if (transformedCode !== content) {
        console.log('Modifications qui auraient été appliquées:');
        // Afficher un diff simplifié
        const diffLines = transformedCode.split('\n').length;
        console.log(`${diffLines} lignes modifiées`);
      } else {
        console.log('Aucune modification nécessaire.');
      }
    } else {
      // Faire une sauvegarde du fichier original
      const backupPath = path.join(output.backupDir, path.basename(component.path));
      fs.writeFileSync(backupPath, content);
      
      // Appliquer les modifications
      fs.writeFileSync(fullPath, transformedCode);
      
      // Marquer comme migré
      component.status = 'migrated';
      output.migrated.push(component);
      
      console.log(`✓ Composant ${component.name} migré avec succès.`);
    }
  } catch (error) {
    console.error(`Erreur lors du traitement de ${component.name}:`, error);
    component.status = 'error';
  }
}

// Point d'entrée du script
migrateComponents();