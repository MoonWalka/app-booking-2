#!/usr/bin/env node

/**
 * Script de correction automatique des erreurs de syntaxe CSS
 * 
 * Ce script corrige :
 * - Les parenthèses en trop dans les box-shadow (ex: var(--tc-shadow-lg)) → var(--tc-shadow-lg))
 * - Les variables CSS utilisées incorrectement (couleurs dans gap/padding)
 * - Autres erreurs de syntaxe communes
 * 
 * @author TourCraft Team
 * @since 2025
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Configuration
const CONFIG = {
  // Patterns d'erreurs à corriger
  SYNTAX_FIXES: [
    // Parenthèses en trop dans box-shadow
    {
      pattern: /box-shadow:\s*([^;]+)\)\);/g,
      replacement: 'box-shadow: $1;',
      description: 'Correction parenthèses en trop dans box-shadow'
    },
    
    // Variables couleur utilisées incorrectement dans gap
    {
      pattern: /gap:\s*var\(--tc-color-[^)]+\);/g,
      replacement: 'gap: var(--tc-space-3);',
      description: 'Correction gap avec variable couleur → variable espacement'
    },
    
    // Variables couleur utilisées incorrectement dans padding
    {
      pattern: /padding:\s*var\(--tc-color-[^)]+\)(\s+[^;]+)?;/g,
      replacement: 'padding: var(--tc-space-3)$1;',
      description: 'Correction padding avec variable couleur → variable espacement'
    },
    
    // Variables couleur utilisées incorrectement dans margin
    {
      pattern: /margin:\s*var\(--tc-color-[^)]+\)(\s+[^;]+)?;/g,
      replacement: 'margin: var(--tc-space-3)$1;',
      description: 'Correction margin avec variable couleur → variable espacement'
    },
    
    // Correction des border-radius manquants
    {
      pattern: /border-radius:\s*var\(--tc-border-radius-md\);/g,
      replacement: 'border-radius: var(--tc-radius-md);',
      description: 'Correction border-radius-md → radius-md'
    }
  ],
  
  // Répertoires à traiter
  DIRECTORIES: [
    'src/components/**/*.css',
    'src/styles/**/*.css',
    'src/pages/**/*.css'
  ],
  
  // Extensions de fichiers
  EXTENSIONS: ['.css', '.module.css'],
  
  // Fichiers à exclure
  EXCLUDE: [
    'node_modules/**',
    'build/**',
    'dist/**',
    '*.min.css'
  ]
};

// Compteurs
let stats = {
  filesProcessed: 0,
  filesFixed: 0,
  errorsFixed: 0,
  fixesByType: {}
};

/**
 * Fonction de log avec couleurs
 */
const log = {
  info: (msg) => console.log(`\x1b[34mℹ️  ${msg}\x1b[0m`),
  success: (msg) => console.log(`\x1b[32m✅ ${msg}\x1b[0m`),
  warning: (msg) => console.log(`\x1b[33m⚠️  ${msg}\x1b[0m`),
  error: (msg) => console.log(`\x1b[31m❌ ${msg}\x1b[0m`),
  fix: (msg) => console.log(`\x1b[36m🔧 ${msg}\x1b[0m`)
};

/**
 * Obtenir tous les fichiers CSS à traiter
 */
function getAllCSSFiles() {
  const files = [];
  
  CONFIG.DIRECTORIES.forEach(pattern => {
    const matches = glob.sync(pattern, {
      ignore: CONFIG.EXCLUDE
    });
    files.push(...matches);
  });
  
  // Filtrer par extension et dédupliquer
  return [...new Set(files.filter(file => 
    CONFIG.EXTENSIONS.some(ext => file.endsWith(ext))
  ))];
}

/**
 * Corriger les erreurs de syntaxe dans un fichier
 */
function fixSyntaxErrors(filePath) {
  try {
    const originalContent = fs.readFileSync(filePath, 'utf-8');
    let content = originalContent;
    let fileFixed = false;
    let fixesInFile = 0;
    
    // Appliquer chaque correction
    CONFIG.SYNTAX_FIXES.forEach(fix => {
      const matches = content.match(fix.pattern);
      if (matches) {
        const beforeFix = content;
        content = content.replace(fix.pattern, fix.replacement);
        
        if (content !== beforeFix) {
          const fixCount = matches.length;
          fixesInFile += fixCount;
          stats.errorsFixed += fixCount;
          
          // Compter par type
          if (!stats.fixesByType[fix.description]) {
            stats.fixesByType[fix.description] = 0;
          }
          stats.fixesByType[fix.description] += fixCount;
          
          log.fix(`${path.relative(process.cwd(), filePath)}: ${fixCount} × ${fix.description}`);
          fileFixed = true;
        }
      }
    });
    
    // Sauvegarder si des corrections ont été apportées
    if (content !== originalContent) {
      // Créer une sauvegarde
      const backupPath = `${filePath}.backup.${Date.now()}`;
      fs.writeFileSync(backupPath, originalContent);
      
      // Écrire le fichier corrigé
      fs.writeFileSync(filePath, content);
      
      stats.filesFixed++;
      log.success(`Fichier corrigé: ${path.relative(process.cwd(), filePath)} (${fixesInFile} erreurs)`);
    }
    
    stats.filesProcessed++;
    return fileFixed;
    
  } catch (error) {
    log.error(`Erreur lors du traitement de ${filePath}: ${error.message}`);
    return false;
  }
}

/**
 * Fonction principale
 */
function main() {
  log.info('🚀 Démarrage de la correction des erreurs de syntaxe CSS');
  log.info('='.repeat(60));
  
  // Obtenir tous les fichiers CSS
  const cssFiles = getAllCSSFiles();
  log.info(`📁 ${cssFiles.length} fichiers CSS trouvés`);
  
  if (cssFiles.length === 0) {
    log.warning('Aucun fichier CSS trouvé');
    return;
  }
  
  // Traiter chaque fichier
  log.info('🔧 Correction des erreurs de syntaxe...');
  cssFiles.forEach(filePath => {
    fixSyntaxErrors(filePath);
  });
  
  // Afficher les statistiques
  log.info('='.repeat(60));
  log.info('📊 STATISTIQUES DE CORRECTION');
  log.info(`📁 Fichiers traités: ${stats.filesProcessed}`);
  log.info(`✅ Fichiers corrigés: ${stats.filesFixed}`);
  log.info(`🔧 Erreurs corrigées: ${stats.errorsFixed}`);
  
  if (Object.keys(stats.fixesByType).length > 0) {
    log.info('📋 Détail des corrections:');
    Object.entries(stats.fixesByType).forEach(([type, count]) => {
      log.info(`   • ${type}: ${count}`);
    });
  }
  
  if (stats.filesFixed > 0) {
    log.success(`🎉 Correction terminée avec succès !`);
    log.info('💾 Les fichiers originaux ont été sauvegardés avec l\'extension .backup');
  } else {
    log.info('✨ Aucune erreur de syntaxe trouvée');
  }
}

// Exécution
if (require.main === module) {
  main();
}

module.exports = { main, fixSyntaxErrors }; 