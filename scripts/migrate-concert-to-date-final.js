#!/usr/bin/env node

/**
 * Script de migration finale concert → date
 * 
 * Ce script automatise la migration des références "concert" vers "date"
 * en respectant les règles suivantes :
 * - Remplace "concert" par "date" uniquement pour les variables
 * - Conserve "Concert" comme type d'événement
 * - Migre les collections, relations et propriétés
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration des patterns à remplacer
const replacements = [
  // Collections Firebase
  { pattern: /collection\([^,)]*,\s*['"]concerts['"]/g, replacement: 'collection($1, \'dates\'' },
  { pattern: /collection:\s*['"]concerts['"]/g, replacement: 'collection: \'dates\'' },
  
  // Variables et paramètres (avec word boundaries)
  { pattern: /\bconcert\b(?!['"])/g, replacement: 'date', context: 'variable' },
  { pattern: /\bconcerts\b(?!['"])/g, replacement: 'dates', context: 'array' },
  
  // Relations et IDs
  { pattern: /\bconcertsIds\b/g, replacement: 'datesIds' },
  { pattern: /\bconcertId\b/g, replacement: 'dateId' },
  { pattern: /\bconcertsAssocies\b/g, replacement: 'datesAssociees' },
  { pattern: /\bconcertAssocies\b/g, replacement: 'dateAssociee' },
  
  // Commentaires et documentation
  { pattern: /du concert(?![\w])/g, replacement: 'de la date' },
  { pattern: /le concert(?![\w])/g, replacement: 'la date' },
  { pattern: /un concert(?![\w])/g, replacement: 'une date' },
  { pattern: /des concerts(?![\w])/g, replacement: 'des dates' },
  { pattern: /les concerts(?![\w])/g, replacement: 'les dates' },
];

// Fichiers à exclure
const excludePatterns = [
  /node_modules/,
  /\.git/,
  /build/,
  /dist/,
  /\.test\./,
  /\.spec\./,
  /migrate-concert-to-date/,
  /AUDIT-MIGRATION/,
  /TypesEvenementContent\.js/, // Conserve les types d'événements
];

// Fichiers prioritaires à migrer
const priorityFiles = [
  'src/pages/DateDetailsPage.js',
  'src/pages/ContratGenerationPage.js',
  'src/pages/FactureGeneratorPage.js',
  'src/components/common/GenericDetailView.js',
  'src/components/contrats/ContratRedactionPage.js',
  'src/hooks/contacts/useSimpleContactDetails.js',
];

// Statistiques
let filesProcessed = 0;
let totalReplacements = 0;

/**
 * Vérifie si un fichier doit être exclu
 */
function shouldExcludeFile(filePath) {
  return excludePatterns.some(pattern => pattern.test(filePath));
}

/**
 * Applique les remplacements à un contenu
 */
function applyReplacements(content, filePath) {
  let modifiedContent = content;
  let replacementCount = 0;
  
  replacements.forEach(({ pattern, replacement, context }) => {
    const matches = content.match(pattern);
    if (matches) {
      console.log(`  Found ${matches.length} matches for ${pattern} in ${filePath}`);
      modifiedContent = modifiedContent.replace(pattern, replacement);
      replacementCount += matches.length;
    }
  });
  
  return { modifiedContent, replacementCount };
}

/**
 * Traite un fichier
 */
function processFile(filePath) {
  if (shouldExcludeFile(filePath)) {
    return;
  }
  
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    
    // Vérifier si le fichier contient "concert"
    if (!content.includes('concert')) {
      return;
    }
    
    console.log(`\nProcessing: ${filePath}`);
    
    const { modifiedContent, replacementCount } = applyReplacements(content, filePath);
    
    if (replacementCount > 0) {
      // Créer un backup
      const backupPath = `${filePath}.backup-${Date.now()}`;
      fs.writeFileSync(backupPath, content);
      
      // Écrire le fichier modifié
      fs.writeFileSync(filePath, modifiedContent);
      
      filesProcessed++;
      totalReplacements += replacementCount;
      
      console.log(`  ✓ ${replacementCount} replacements made`);
      console.log(`  Backup saved to: ${backupPath}`);
    }
  } catch (error) {
    console.error(`  ✗ Error processing ${filePath}:`, error.message);
  }
}

/**
 * Parcourt récursivement un répertoire
 */
function processDirectory(dirPath) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  
  entries.forEach(entry => {
    const fullPath = path.join(dirPath, entry.name);
    
    if (entry.isDirectory() && !shouldExcludeFile(fullPath)) {
      processDirectory(fullPath);
    } else if (entry.isFile() && entry.name.endsWith('.js')) {
      processFile(fullPath);
    }
  });
}

/**
 * Point d'entrée principal
 */
function main() {
  console.log('🚀 Starting concert → date migration...\n');
  
  // Traiter les fichiers prioritaires d'abord
  console.log('📌 Processing priority files...');
  priorityFiles.forEach(file => {
    const fullPath = path.join(process.cwd(), file);
    if (fs.existsSync(fullPath)) {
      processFile(fullPath);
    }
  });
  
  // Traiter le reste des fichiers
  console.log('\n📁 Processing remaining files...');
  processDirectory(path.join(process.cwd(), 'src'));
  
  // Afficher les statistiques
  console.log('\n📊 Migration Statistics:');
  console.log(`  Files processed: ${filesProcessed}`);
  console.log(`  Total replacements: ${totalReplacements}`);
  
  // Créer un rapport
  const report = {
    timestamp: new Date().toISOString(),
    filesProcessed,
    totalReplacements,
    processedFiles: []
  };
  
  fs.writeFileSync(
    'migration-report.json',
    JSON.stringify(report, null, 2)
  );
  
  console.log('\n✅ Migration completed!');
  console.log('📄 Report saved to migration-report.json');
  console.log('\n⚠️  Please review the changes and test thoroughly!');
}

// Exécuter le script
if (require.main === module) {
  main();
}

module.exports = { applyReplacements, processFile };