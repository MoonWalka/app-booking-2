#!/usr/bin/env node

/**
 * Script de nettoyage intelligent des logs de débogage
 * 
 * Ce script supprime les logs de débogage temporaires tout en préservant :
 * - Les logs d'erreur légitimes (console.error)
 * - Les logs de warning importants (console.warn)
 * - Les logs de production nécessaires
 * 
 * @author TourCraft Team
 * @since 2025
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Configuration du nettoyage
const CONFIG = {
  // Patterns de logs à supprimer
  DEBUG_PATTERNS: [
    // Logs de trace temporaires
    /console\.log\(`?\[TRACE-UNIQUE\].*?\);?/g,
    /console\.log\(`?\[DEBUG\].*?\);?/g,
    /console\.log\(`?\[DIAGNOSTIC\].*?\);?/g,
    /console\.log\(`?\[LOG\].*?\);?/g,
    /console\.log\(`?\[CACHE.*?\].*?\);?/g,
    /console\.log\(`?\[SYNC\].*?\);?/g,
    /console\.log\(`?\[ASSOCIATION.*?\].*?\);?/g,
    /console\.log\(`?\[INFO\].*?\);?/g,
    /console\.log\(`?\[TRACE\].*?\);?/g,
    /console\.log\(`?\[TEST-TRACE.*?\].*?\);?/g,
    
    // Logs de hooks génériques avec patterns spécifiques
    /console\.log\(`?\[use.*?\].*?\);?/g,
    /console\.log\(`?\[.*?FieldActions\].*?\);?/g,
    /console\.log\(`?\[.*?Status\].*?\);?/g,
    /console\.log\(`?\[useGeneric.*?\].*?\);?/g,
    
    // Logs de performance et cache
    /console\.log\(`?🔄.*?\);?/g,
    /console\.log\(`?📊.*?\);?/g,
    /console\.log\(`?✅.*?\);?/g,
    /console\.log\(`?🗑️.*?\);?/g,
    /console\.log\(`?📤.*?\);?/g,
    /console\.log\(`?📏.*?\);?/g,
    /console\.log\(`?🆕.*?\);?/g,
    /console\.log\(`?🔍.*?\);?/g,
    /console\.log\(`?📖.*?\);?/g,
    /console\.log\(`?📦.*?\);?/g,
    /console\.log\(`?🔥.*?\);?/g,
    /console\.log\(`?💾.*?\);?/g,
    /console\.log\(`?⚡.*?\);?/g,
    /console\.log\(`?🧹.*?\);?/g,
    /console\.log\(`?📥.*?\);?/g,
    
    // Logs spécifiques aux hooks et composants
    /console\.log\(`?\[.*?Form\].*?\);?/g,
    /console\.log\(`?\[.*?Details\].*?\);?/g,
    /console\.log\(`?\[.*?Delete\].*?\);?/g,
    /console\.log\(`?\[.*?Search\].*?\);?/g,
    /console\.log\(`?\[.*?Component\].*?\);?/g,
    /console\.log\(`?\[.*?Page\].*?\);?/g,
    /console\.log\(`?\[.*?View\].*?\);?/g,
    /console\.log\(`?\[.*?Section\].*?\);?/g,
    /console\.log\(`?\[.*?Button\].*?\);?/g,
    /console\.log\(`?\[.*?Wrapper\].*?\);?/g,
    
    // Logs avec patterns de route et navigation
    /console\.log\(`?\[🔍 ROUTE\].*?\);?/g,
    /console\.log\(.*?Route:.*?\);?/g,
    /console\.log\(.*?location\.pathname.*?\);?/g,
    
    // Logs de débogage généraux
    /console\.log\(.*?after useGenericEntityForm.*?\);?/g,
    /console\.log\(.*?formData changed.*?\);?/g,
    /console\.log\(.*?handleChange appelé.*?\);?/g,
    /console\.log\(.*?Après handleChange.*?\);?/g,
    /console\.log\(.*?appelé avec.*?\);?/g,
    /console\.log\(.*?State:.*?\);?/g,
    /console\.log\(.*?Loading:.*?\);?/g,
    /console\.log\(.*?FormData:.*?\);?/g,
    /console\.log\(.*?onClick déclenché.*?\);?/g,
    /console\.log\(.*?Montage du wrapper.*?\);?/g,
    /console\.log\(.*?useEffect déclenché.*?\);?/g,
    /console\.log\(.*?Affichage du.*?\);?/g,
    /console\.log\(.*?Rendu des.*?\);?/g,
    /console\.log\(.*?Démarrage.*?\);?/g,
    /console\.log\(.*?terminée.*?\);?/g,
    /console\.log\(.*?Entités chargées.*?\);?/g,
    /console\.log\(.*?Annulation.*?\);?/g,
    /console\.log\(.*?Entité chargée.*?\);?/g,
    /console\.log\(.*?existe, appel.*?\);?/g,
    /console\.log\(.*?Suppression réussie.*?\);?/g,
    /console\.log\(.*?reçus du hook.*?\);?/g,
    /console\.log\(.*?Prop.*?reçue.*?\);?/g,
    /console\.log\(.*?Source de.*?utilisée.*?\);?/g,
    /console\.log\(.*?Chargement local.*?\);?/g,
    /console\.log\(.*?chargés depuis.*?\);?/g,
    /console\.log\(.*?par requête inverse.*?\);?/g,
    /console\.log\(.*?Ce composant est exécuté.*?\);?/g,
    /console\.log\(.*?Ce fichier est bien exécuté.*?\);?/g,
    /console\.log\(.*?Nouvelle valeur.*?\);?/g,
    /console\.log\(.*?Avant safeSetState.*?\);?/g,
    /console\.log\(.*?setShowDeleteModal.*?\);?/g,
    /console\.log\(.*?handleDelete appelé.*?\);?/g,
    /console\.log\(.*?handleCreate appelé.*?\);?/g,
    /console\.log\(.*?handleDeleteSuccess.*?\);?/g,
    /console\.log\(.*?handleDeleteClick.*?\);?/g,
    /console\.log\(.*?handleProgrammateurChange.*?\);?/g,
    /console\.log\(.*?setFormData.*?\);?/g,
    /console\.log\(.*?Traitement de l'association.*?\);?/g,
    /console\.log\(.*?Association.*?traitée.*?\);?/g,
    /console\.log\(.*?Suppression de l'association.*?\);?/g,
    /console\.log\(.*?Association.*?supprimée.*?\);?/g,
    /console\.log\(.*?Association.*?ignorée.*?\);?/g,
    /console\.log\(.*?transformConcertData.*?\);?/g,
    /console\.log\(.*?retourne:.*?\);?/g,
    /console\.log\(.*?isNewConcert:.*?\);?/g,
    /console\.log\(.*?Retourne\. formData.*?\);?/g,
    /console\.log\(.*?Élément sélectionné.*?\);?/g,
    /console\.log\(.*?État mis à jour.*?\);?/g,
    /console\.log\(.*?trouvés par référence.*?\);?/g,
    /console\.log\(.*?Pas de modèle par défaut.*?\);?/g,
    /console\.log\(.*?Données émulateur récupérées.*?\);?/g,
    /console\.log\(.*?Mode debug.*?\);?/g,
    /console\.log\(.*?Diagnostic de performance.*?\);?/g,
    
    // Logs commentés (à supprimer complètement)
    /\/\/ console\.log\(.*?\);?/g,
  ],
  
  // Patterns à préserver (ne pas supprimer)
  PRESERVE_PATTERNS: [
    // Logs d'erreur légitimes
    /console\.error\(/,
    // Warnings importants
    /console\.warn\(.*?(Erreur|Error|⚠️)/,
    // Logs de production dans loggerService
    /loggerService\.js.*console\./,
    // Logs dans setupTests (configuration)
    /setupTests\.js.*console\./,
    // Logs dans diagnostic.js (outil de diagnostic)
    /diagnostic\.js.*console\.log.*Diagnostic/,
  ],
  
  // Fichiers à traiter
  INCLUDE_PATTERNS: [
    'src/**/*.js',
    'src/**/*.jsx'
  ],
  
  // Fichiers à exclure
  EXCLUDE_PATTERNS: [
    'src/services/loggerService.js', // Service de logs légitime
    'src/setupTests.js', // Configuration de tests
    'src/diagnostic.js', // Outil de diagnostic
    'node_modules/**',
    'build/**',
    'dist/**'
  ]
};

class DebugLogCleaner {
  constructor() {
    this.stats = {
      filesProcessed: 0,
      logsRemoved: 0,
      filesModified: 0,
      errors: 0
    };
    this.dryRun = process.argv.includes('--dry-run');
    this.verbose = process.argv.includes('--verbose');
  }
  
  log(message, level = 'info') {
    const prefix = {
      info: '🧹',
      success: '✅',
      warning: '⚠️',
      error: '❌',
      debug: '🔍'
    }[level] || 'ℹ️';
    
    console.log(`${prefix} ${message}`);
  }
  
  shouldPreserveLog(line, filePath) {
    // Vérifier si le log doit être préservé
    return CONFIG.PRESERVE_PATTERNS.some(pattern => {
      if (pattern instanceof RegExp) {
        return pattern.test(line);
      }
      return line.includes(pattern);
    });
  }
  
  cleanDebugLogs(content, filePath) {
    let modifiedContent = content;
    let removedCount = 0;
    
    const lines = content.split('\n');
    const cleanedLines = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      let shouldRemove = false;
      
      // Vérifier si la ligne doit être préservée
      if (this.shouldPreserveLog(line, filePath)) {
        cleanedLines.push(line);
        continue;
      }
      
      // Vérifier si la ligne correspond aux patterns de débogage
      for (const pattern of CONFIG.DEBUG_PATTERNS) {
        if (pattern.test(line)) {
          shouldRemove = true;
          removedCount++;
          
          if (this.verbose) {
            this.log(`Suppression: ${line.trim()}`, 'debug');
          }
          break;
        }
      }
      
      if (!shouldRemove) {
        cleanedLines.push(line);
      }
    }
    
    return {
      content: cleanedLines.join('\n'),
      removedCount
    };
  }
  
  shouldExcludeFile(filePath) {
    return CONFIG.EXCLUDE_PATTERNS.some(pattern => {
      if (pattern.includes('*')) {
        return filePath.match(pattern.replace(/\*/g, '.*'));
      }
      return filePath.includes(pattern);
    });
  }
  
  async processFile(filePath) {
    try {
      this.stats.filesProcessed++;
      
      if (this.shouldExcludeFile(filePath)) {
        if (this.verbose) {
          this.log(`Fichier exclu: ${filePath}`, 'debug');
        }
        return;
      }
      
      const content = fs.readFileSync(filePath, 'utf8');
      const { content: cleanedContent, removedCount } = this.cleanDebugLogs(content, filePath);
      
      if (removedCount > 0) {
        this.stats.logsRemoved += removedCount;
        this.stats.filesModified++;
        
        this.log(`${filePath}: ${removedCount} logs supprimés`, 'success');
        
        if (!this.dryRun) {
          fs.writeFileSync(filePath, cleanedContent, 'utf8');
        }
      } else if (this.verbose) {
        this.log(`${filePath}: aucun log à supprimer`, 'debug');
      }
      
    } catch (error) {
      this.stats.errors++;
      this.log(`Erreur lors du traitement de ${filePath}: ${error.message}`, 'error');
    }
  }
  
  async run() {
    this.log('🚀 Démarrage du nettoyage des logs de débogage...', 'info');
    
    if (this.dryRun) {
      this.log('Mode DRY RUN activé - aucun fichier ne sera modifié', 'warning');
    }
    
    // Collecter tous les fichiers à traiter
    const allFiles = [];
    
    for (const pattern of CONFIG.INCLUDE_PATTERNS) {
      const files = glob.sync(pattern, { 
        ignore: CONFIG.EXCLUDE_PATTERNS,
        absolute: true 
      });
      allFiles.push(...files);
    }
    
    // Supprimer les doublons
    const uniqueFiles = [...new Set(allFiles)];
    
    this.log(`📁 ${uniqueFiles.length} fichiers à traiter`, 'info');
    
    // Traiter chaque fichier
    for (const filePath of uniqueFiles) {
      await this.processFile(filePath);
    }
    
    // Afficher les statistiques
    this.displayStats();
  }
  
  displayStats() {
    this.log('\n📊 STATISTIQUES DE NETTOYAGE', 'info');
    this.log(`Fichiers traités: ${this.stats.filesProcessed}`, 'info');
    this.log(`Fichiers modifiés: ${this.stats.filesModified}`, 'success');
    this.log(`Logs supprimés: ${this.stats.logsRemoved}`, 'success');
    
    if (this.stats.errors > 0) {
      this.log(`Erreurs: ${this.stats.errors}`, 'error');
    }
    
    if (this.dryRun) {
      this.log('\n⚠️ Mode DRY RUN - Aucun fichier n\'a été modifié', 'warning');
      this.log('Exécutez sans --dry-run pour appliquer les changements', 'info');
    } else {
      this.log('\n✅ Nettoyage terminé avec succès !', 'success');
    }
  }
}

// Exécution du script
if (require.main === module) {
  const cleaner = new DebugLogCleaner();
  
  // Afficher l'aide si demandée
  if (process.argv.includes('--help') || process.argv.includes('-h')) {
    console.log(`
🧹 Script de nettoyage des logs de débogage

Usage:
  node scripts/clean_debug_logs.js [options]

Options:
  --dry-run    Mode simulation (aucun fichier modifié)
  --verbose    Affichage détaillé
  --help, -h   Afficher cette aide

Exemples:
  node scripts/clean_debug_logs.js --dry-run    # Simulation
  node scripts/clean_debug_logs.js --verbose    # Nettoyage avec détails
  node scripts/clean_debug_logs.js             # Nettoyage standard
`);
    process.exit(0);
  }
  
  cleaner.run().catch(error => {
    console.error('❌ Erreur fatale:', error);
    process.exit(1);
  });
}

module.exports = DebugLogCleaner; 