#!/usr/bin/env node

/**
 * Script de nettoyage après corrections CSS TourCraft
 * 
 * Ce script nettoie :
 * - Les fichiers de sauvegarde .backup.*
 * - Les processus en double
 * - Les fichiers temporaires
 * - Optimise l'environnement de développement
 * 
 * @author TourCraft Team
 * @since 2025
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');
const { execSync } = require('child_process');

// Configuration
const CONFIG = {
  // Patterns de fichiers à nettoyer
  CLEANUP_PATTERNS: [
    '**/*.backup.*',
    '**/node_modules/.cache/**',
    '**/.DS_Store',
    '**/Thumbs.db'
  ],
  
  // Fichiers à exclure du nettoyage
  EXCLUDE: [
    'node_modules/**',
    '.git/**'
  ],
  
  // Âge minimum des fichiers de sauvegarde (en heures)
  BACKUP_AGE_HOURS: 1
};

// Statistiques
let stats = {
  backupFiles: 0,
  tempFiles: 0,
  totalSize: 0,
  processesKilled: 0
};

/**
 * Fonction de log avec couleurs
 */
const log = {
  info: (msg) => console.log(`\x1b[34mℹ️  ${msg}\x1b[0m`),
  success: (msg) => console.log(`\x1b[32m✅ ${msg}\x1b[0m`),
  warning: (msg) => console.log(`\x1b[33m⚠️  ${msg}\x1b[0m`),
  error: (msg) => console.log(`\x1b[31m❌ ${msg}\x1b[0m`),
  clean: (msg) => console.log(`\x1b[36m🧹 ${msg}\x1b[0m`)
};

/**
 * Obtenir la taille d'un fichier en octets
 */
function getFileSize(filePath) {
  try {
    const stats = fs.statSync(filePath);
    return stats.size;
  } catch (error) {
    return 0;
  }
}

/**
 * Formater la taille en unités lisibles
 */
function formatSize(bytes) {
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  
  return `${size.toFixed(1)} ${units[unitIndex]}`;
}

/**
 * Vérifier l'âge d'un fichier
 */
function isFileOldEnough(filePath, ageHours) {
  try {
    const stats = fs.statSync(filePath);
    const ageMs = Date.now() - stats.mtime.getTime();
    const ageHoursActual = ageMs / (1000 * 60 * 60);
    return ageHoursActual >= ageHours;
  } catch (error) {
    return false;
  }
}

/**
 * Nettoyer les fichiers de sauvegarde
 */
function cleanupBackupFiles() {
  log.clean('Nettoyage des fichiers de sauvegarde...');
  
  const backupFiles = glob.sync('**/*.backup.*', {
    ignore: CONFIG.EXCLUDE
  });
  
  let cleaned = 0;
  let totalSize = 0;
  
  backupFiles.forEach(filePath => {
    try {
      // Vérifier l'âge du fichier
      if (isFileOldEnough(filePath, CONFIG.BACKUP_AGE_HOURS)) {
        const size = getFileSize(filePath);
        fs.unlinkSync(filePath);
        cleaned++;
        totalSize += size;
        log.clean(`Supprimé: ${path.relative(process.cwd(), filePath)} (${formatSize(size)})`);
      } else {
        log.warning(`Fichier trop récent, conservé: ${path.relative(process.cwd(), filePath)}`);
      }
    } catch (error) {
      log.error(`Erreur lors de la suppression de ${filePath}: ${error.message}`);
    }
  });
  
  stats.backupFiles = cleaned;
  stats.totalSize += totalSize;
  
  if (cleaned > 0) {
    log.success(`${cleaned} fichiers de sauvegarde supprimés (${formatSize(totalSize)} libérés)`);
  } else {
    log.info('Aucun fichier de sauvegarde à nettoyer');
  }
}

/**
 * Nettoyer les fichiers temporaires
 */
function cleanupTempFiles() {
  log.clean('Nettoyage des fichiers temporaires...');
  
  const tempPatterns = [
    '**/.DS_Store',
    '**/Thumbs.db',
    '**/*.tmp',
    '**/*.temp'
  ];
  
  let cleaned = 0;
  let totalSize = 0;
  
  tempPatterns.forEach(pattern => {
    const files = glob.sync(pattern, {
      ignore: CONFIG.EXCLUDE
    });
    
    files.forEach(filePath => {
      try {
        const size = getFileSize(filePath);
        fs.unlinkSync(filePath);
        cleaned++;
        totalSize += size;
        log.clean(`Supprimé: ${path.relative(process.cwd(), filePath)}`);
      } catch (error) {
        log.error(`Erreur lors de la suppression de ${filePath}: ${error.message}`);
      }
    });
  });
  
  stats.tempFiles = cleaned;
  stats.totalSize += totalSize;
  
  if (cleaned > 0) {
    log.success(`${cleaned} fichiers temporaires supprimés (${formatSize(totalSize)} libérés)`);
  } else {
    log.info('Aucun fichier temporaire à nettoyer');
  }
}

/**
 * Nettoyer les processus en double
 */
function cleanupProcesses() {
  log.clean('Vérification des processus en double...');
  
  try {
    // Chercher les processus npm/node en double
    const processes = execSync('ps aux | grep -E "(npm start|craco)" | grep -v grep', { encoding: 'utf8' });
    const lines = processes.trim().split('\n').filter(line => line.trim());
    
    if (lines.length > 1) {
      log.warning(`${lines.length} processus détectés:`);
      lines.forEach((line, index) => {
        const parts = line.trim().split(/\s+/);
        const pid = parts[1];
        const command = parts.slice(10).join(' ');
        log.info(`  ${index + 1}. PID ${pid}: ${command}`);
      });
      
      log.info('💡 Pour nettoyer les processus en double, utilisez:');
      log.info('   pkill -f "npm start" && pkill -f "craco"');
    } else {
      log.success('Aucun processus en double détecté');
    }
  } catch (error) {
    log.info('Aucun processus npm/craco en cours');
  }
}

/**
 * Optimiser l'environnement de développement
 */
function optimizeEnvironment() {
  log.clean('Optimisation de l\'environnement...');
  
  // Nettoyer le cache npm si nécessaire
  try {
    const cacheSize = execSync('du -sh ~/.npm 2>/dev/null | cut -f1', { encoding: 'utf8' }).trim();
    log.info(`Cache npm actuel: ${cacheSize}`);
    
    // Si le cache est très volumineux (>500MB), suggérer un nettoyage
    if (cacheSize.includes('G') || (cacheSize.includes('M') && parseInt(cacheSize) > 500)) {
      log.warning('Cache npm volumineux détecté');
      log.info('💡 Pour nettoyer le cache npm: npm cache clean --force');
    }
  } catch (error) {
    // Ignore si impossible de vérifier le cache
  }
  
  // Vérifier l'espace disque disponible
  try {
    const diskSpace = execSync('df -h . | tail -1 | awk \'{print $4}\'', { encoding: 'utf8' }).trim();
    log.info(`Espace disque disponible: ${diskSpace}`);
  } catch (error) {
    // Ignore si impossible de vérifier l'espace disque
  }
}

/**
 * Générer un rapport de nettoyage
 */
function generateReport() {
  log.info('='.repeat(60));
  log.info('📊 RAPPORT DE NETTOYAGE');
  log.info(`🗑️  Fichiers de sauvegarde supprimés: ${stats.backupFiles}`);
  log.info(`🧹 Fichiers temporaires supprimés: ${stats.tempFiles}`);
  log.info(`💾 Espace libéré total: ${formatSize(stats.totalSize)}`);
  
  if (stats.backupFiles + stats.tempFiles > 0) {
    log.success('🎉 Nettoyage terminé avec succès !');
  } else {
    log.info('✨ Environnement déjà propre');
  }
  
  // Recommandations
  log.info('='.repeat(60));
  log.info('💡 RECOMMANDATIONS');
  log.info('• Exécutez ce script périodiquement pour maintenir un environnement propre');
  log.info('• Les fichiers de sauvegarde sont conservés pendant 1 heure par sécurité');
  log.info('• Surveillez l\'espace disque disponible régulièrement');
}

/**
 * Fonction principale
 */
function main() {
  log.info('🧹 NETTOYAGE APRÈS CORRECTIONS CSS TOURCRAFT');
  log.info('='.repeat(60));
  
  // Nettoyer les fichiers de sauvegarde
  cleanupBackupFiles();
  
  // Nettoyer les fichiers temporaires
  cleanupTempFiles();
  
  // Vérifier les processus
  cleanupProcesses();
  
  // Optimiser l'environnement
  optimizeEnvironment();
  
  // Générer le rapport
  generateReport();
}

// Exécution
if (require.main === module) {
  main();
}

module.exports = { main, cleanupBackupFiles, cleanupTempFiles }; 