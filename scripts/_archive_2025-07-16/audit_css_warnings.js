#!/usr/bin/env node

/**
 * Script d'audit final des warnings CSS TourCraft
 * 
 * Ce script analyse :
 * - Les variables CSS utilisées vs définies
 * - Les erreurs de syntaxe restantes
 * - La qualité du système CSS
 * - Les recommandations d'amélioration
 * 
 * @author TourCraft Team
 * @since 2025
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Configuration
const CONFIG = {
  DIRECTORIES: [
    'src/components/**/*.css',
    'src/styles/**/*.css',
    'src/pages/**/*.css'
  ],
  EXCLUDE: [
    'node_modules/**',
    'build/**',
    'dist/**',
    '*.min.css',
    '*.backup.*'
  ]
};

// Statistiques
let stats = {
  totalFiles: 0,
  variablesUsed: new Set(),
  variablesDefined: new Set(),
  syntaxErrors: [],
  qualityIssues: [],
  recommendations: []
};

/**
 * Fonction de log avec couleurs
 */
const log = {
  info: (msg) => console.log(`\x1b[34mℹ️  ${msg}\x1b[0m`),
  success: (msg) => console.log(`\x1b[32m✅ ${msg}\x1b[0m`),
  warning: (msg) => console.log(`\x1b[33m⚠️  ${msg}\x1b[0m`),
  error: (msg) => console.log(`\x1b[31m❌ ${msg}\x1b[0m`),
  audit: (msg) => console.log(`\x1b[36m🔍 ${msg}\x1b[0m`)
};

/**
 * Obtenir tous les fichiers CSS
 */
function getAllCSSFiles() {
  const files = [];
  
  CONFIG.DIRECTORIES.forEach(pattern => {
    const matches = glob.sync(pattern, {
      ignore: CONFIG.EXCLUDE
    });
    files.push(...matches);
  });
  
  return [...new Set(files)];
}

/**
 * Analyser les variables CSS dans un fichier
 */
function analyzeVariables(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    
    // Variables utilisées (var(--tc-*))
    const usedMatches = content.match(/var\(--tc-[^)]+\)/g);
    if (usedMatches) {
      usedMatches.forEach(match => {
        stats.variablesUsed.add(match);
      });
    }
    
    // Variables définies (--tc-*:)
    const definedMatches = content.match(/--tc-[^:]+:/g);
    if (definedMatches) {
      definedMatches.forEach(match => {
        const varName = match.replace(':', '');
        stats.variablesDefined.add(`var(${varName})`);
      });
    }
    
  } catch (error) {
    log.error(`Erreur lors de l'analyse de ${filePath}: ${error.message}`);
  }
}

/**
 * Détecter les erreurs de syntaxe
 */
function detectSyntaxErrors(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const errors = [];
    
    // Parenthèses en trop
    const extraParens = content.match(/var\([^)]+\)\)/g);
    if (extraParens) {
      errors.push({
        type: 'Parenthèses en trop',
        count: extraParens.length,
        examples: extraParens.slice(0, 3)
      });
    }
    
    // Variables couleur dans espacement
    const colorInSpacing = content.match(/(gap|padding|margin):\s*var\(--tc-color-[^)]+\)/g);
    if (colorInSpacing) {
      errors.push({
        type: 'Variable couleur dans espacement',
        count: colorInSpacing.length,
        examples: colorInSpacing.slice(0, 3)
      });
    }
    
    // Variables manquantes (approximation)
    const undefinedVars = content.match(/var\(--tc-[^)]+\)/g);
    if (undefinedVars) {
      const missing = undefinedVars.filter(varUsed => 
        !stats.variablesDefined.has(varUsed)
      );
      if (missing.length > 0) {
        errors.push({
          type: 'Variables potentiellement manquantes',
          count: missing.length,
          examples: [...new Set(missing)].slice(0, 3)
        });
      }
    }
    
    if (errors.length > 0) {
      stats.syntaxErrors.push({
        file: path.relative(process.cwd(), filePath),
        errors
      });
    }
    
  } catch (error) {
    log.error(`Erreur lors de la détection d'erreurs dans ${filePath}: ${error.message}`);
  }
}

/**
 * Analyser la qualité du CSS
 */
function analyzeQuality() {
  const usedArray = Array.from(stats.variablesUsed);
  const definedArray = Array.from(stats.variablesDefined);
  
  // Variables manquantes
  const missing = usedArray.filter(used => !definedArray.includes(used));
  
  // Variables inutilisées
  const unused = definedArray.filter(defined => !usedArray.includes(defined));
  
  // Analyse des patterns
  const patterns = {
    colors: usedArray.filter(v => v.includes('--tc-color-')).length,
    spacing: usedArray.filter(v => v.includes('--tc-space-')).length,
    typography: usedArray.filter(v => v.includes('--tc-font-')).length,
    effects: usedArray.filter(v => v.includes('--tc-shadow-') || v.includes('--tc-radius-')).length
  };
  
  return {
    totalUsed: usedArray.length,
    totalDefined: definedArray.length,
    missing: missing.length,
    unused: unused.length,
    patterns,
    missingVars: missing.slice(0, 10),
    unusedVars: unused.slice(0, 10)
  };
}

/**
 * Générer des recommandations
 */
function generateRecommendations(quality) {
  const recommendations = [];
  
  if (quality.missing > 0) {
    recommendations.push({
      priority: 'HIGH',
      type: 'Variables manquantes',
      message: `${quality.missing} variables CSS utilisées mais non définies`,
      action: 'Ajouter les variables manquantes dans colors.css ou variables.css'
    });
  }
  
  if (quality.unused > 20) {
    recommendations.push({
      priority: 'MEDIUM',
      type: 'Variables inutilisées',
      message: `${quality.unused} variables définies mais non utilisées`,
      action: 'Nettoyer les variables inutilisées pour optimiser le bundle'
    });
  }
  
  if (stats.syntaxErrors.length > 0) {
    recommendations.push({
      priority: 'HIGH',
      type: 'Erreurs de syntaxe',
      message: `${stats.syntaxErrors.length} fichiers avec erreurs de syntaxe`,
      action: 'Exécuter le script fix_css_syntax_errors.js'
    });
  }
  
  // Recommandations basées sur les patterns
  if (quality.patterns.colors < 20) {
    recommendations.push({
      priority: 'LOW',
      type: 'Système de couleurs',
      message: 'Peu de variables couleur utilisées',
      action: 'Considérer l\'ajout de plus de variables couleur pour la cohérence'
    });
  }
  
  if (quality.patterns.spacing < 10) {
    recommendations.push({
      priority: 'MEDIUM',
      type: 'Système d\'espacement',
      message: 'Peu de variables d\'espacement utilisées',
      action: 'Standardiser les espacements avec les variables --tc-space-*'
    });
  }
  
  return recommendations;
}

/**
 * Fonction principale
 */
function main() {
  log.info('🔍 AUDIT FINAL DES WARNINGS CSS TOURCRAFT');
  log.info('='.repeat(60));
  
  // Obtenir tous les fichiers CSS
  const cssFiles = getAllCSSFiles();
  stats.totalFiles = cssFiles.length;
  log.info(`📁 ${cssFiles.length} fichiers CSS trouvés`);
  
  if (cssFiles.length === 0) {
    log.warning('Aucun fichier CSS trouvé');
    return;
  }
  
  // Analyser chaque fichier
  log.audit('Analyse des variables CSS...');
  cssFiles.forEach(filePath => {
    analyzeVariables(filePath);
  });
  
  log.audit('Détection des erreurs de syntaxe...');
  cssFiles.forEach(filePath => {
    detectSyntaxErrors(filePath);
  });
  
  // Analyser la qualité
  const quality = analyzeQuality();
  const recommendations = generateRecommendations(quality);
  
  // Afficher les résultats
  log.info('='.repeat(60));
  log.info('📊 RÉSULTATS DE L\'AUDIT');
  
  log.info(`📁 Fichiers analysés: ${stats.totalFiles}`);
  log.info(`🎨 Variables utilisées: ${quality.totalUsed}`);
  log.info(`📋 Variables définies: ${quality.totalDefined}`);
  
  if (quality.missing === 0) {
    log.success(`✅ Aucune variable manquante !`);
  } else {
    log.warning(`⚠️  ${quality.missing} variables manquantes`);
    if (quality.missingVars.length > 0) {
      log.info('   Exemples: ' + quality.missingVars.slice(0, 5).join(', '));
    }
  }
  
  if (stats.syntaxErrors.length === 0) {
    log.success(`✅ Aucune erreur de syntaxe détectée !`);
  } else {
    log.error(`❌ ${stats.syntaxErrors.length} fichiers avec erreurs de syntaxe`);
  }
  
  // Patterns d'utilisation
  log.info('🎨 PATTERNS D\'UTILISATION:');
  log.info(`   • Couleurs: ${quality.patterns.colors} variables`);
  log.info(`   • Espacements: ${quality.patterns.spacing} variables`);
  log.info(`   • Typographie: ${quality.patterns.typography} variables`);
  log.info(`   • Effets: ${quality.patterns.effects} variables`);
  
  // Recommandations
  if (recommendations.length > 0) {
    log.info('='.repeat(60));
    log.info('💡 RECOMMANDATIONS');
    
    recommendations.forEach((rec, index) => {
      const priority = rec.priority === 'HIGH' ? '🔴' : 
                      rec.priority === 'MEDIUM' ? '🟡' : '🟢';
      log.info(`${priority} ${rec.type}: ${rec.message}`);
      log.info(`   → ${rec.action}`);
    });
  } else {
    log.success('🎉 Aucune recommandation - Le système CSS est optimal !');
  }
  
  // Score de qualité
  const qualityScore = Math.max(0, 100 - (quality.missing * 2) - (stats.syntaxErrors.length * 5));
  log.info('='.repeat(60));
  log.info(`🏆 SCORE DE QUALITÉ CSS: ${qualityScore}/100`);
  
  if (qualityScore >= 90) {
    log.success('🌟 Excellent ! Système CSS de haute qualité');
  } else if (qualityScore >= 70) {
    log.info('👍 Bon système CSS avec quelques améliorations possibles');
  } else {
    log.warning('⚠️  Système CSS nécessitant des améliorations');
  }
}

// Exécution
if (require.main === module) {
  main();
}

module.exports = { main, analyzeVariables, detectSyntaxErrors }; 