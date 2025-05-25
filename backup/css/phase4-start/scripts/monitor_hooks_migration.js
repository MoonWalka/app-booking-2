#!/usr/bin/env node
/**
 * Script de suivi de la migration des hooks dépréciés vers les hooks génériques
 * 
 * Ce script analyse l'état actuel de la migration et génère des rapports de progression.
 * Il est conçu pour être exécuté hebdomadairement afin de suivre l'avancement du projet.
 * 
 * Utilisation: node scripts/monitor_hooks_migration.js
 * 
 * Créé le: 9 mai 2025
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Définir les catégories de hooks à surveiller
const HOOK_CATEGORIES = {
  FORM: ['useLieuForm', 'useConcertForm', 'useStructureForm', 'useArtisteForm', 'useProgrammateurForm'],
  DETAILS: ['useLieuDetails', 'useConcertDetails', 'useArtisteDetails', 'useProgrammateurDetails', 'useStructureDetails'],
  SEARCH: ['useLieuSearch', 'useProgrammateurSearch', 'useStructureSearch', 'useArtisteSearch'],
  LIST: ['useArtistesList', 'useLieuxFilters', 'useConcertFilters', 'useStructuresList']
};

// Fonction pour exécuter le script de détection et récupérer les résultats
function detectDeprecatedHooks() {
  try {
    console.log('Exécution du script de détection des hooks dépréciés...');
    const csvOutput = execSync('node scripts/detect_deprecated_hooks.js --csv').toString();
    const lines = csvOutput.split('\n').filter(line => line.trim() !== '');
    
    // Ignorer l'en-tête CSV
    const dataLines = lines.slice(1);
    
    return dataLines.map(line => {
      const [severity, filePath, lineNum, hook, replacement, deadline] = line.split(',');
      return {
        severity,
        filePath,
        lineNum: parseInt(lineNum, 10),
        hook: hook.replace(/"/g, ''),
        replacement: replacement.replace(/"/g, ''),
        deadline
      };
    });
  } catch (error) {
    console.error('Erreur lors de l\'exécution du script de détection:', error.message);
    return [];
  }
}

// Fonction pour générer des statistiques à partir des résultats
function generateStats(results) {
  const totalHooks = Object.values(HOOK_CATEGORIES).flat().length;
  const detectedHooks = results.reduce((hooks, result) => {
    if (!hooks.includes(result.hook)) {
      hooks.push(result.hook);
    }
    return hooks;
  }, []);
  
  // Compter par catégorie
  const statsByCategory = {};
  Object.entries(HOOK_CATEGORIES).forEach(([category, hooksInCategory]) => {
    const detected = results.filter(r => hooksInCategory.includes(r.hook));
    const uniqueHooks = [...new Set(detected.map(d => d.hook))];
    
    statsByCategory[category] = {
      total: hooksInCategory.length,
      detected: uniqueHooks.length,
      migrationPercentage: (1 - (uniqueHooks.length / hooksInCategory.length)) * 100
    };
  });
  
  // Statistiques globales
  const stats = {
    date: new Date().toISOString().split('T')[0],
    totalDeprecatedHooks: detectedHooks.length,
    totalOccurrences: results.length,
    migrationProgress: {
      percentage: (1 - (detectedHooks.length / totalHooks)) * 100,
      migratedHooks: totalHooks - detectedHooks.length,
      totalHooks
    },
    byCategory: statsByCategory,
    bySeverity: {
      HIGH: results.filter(r => r.severity === 'HIGH').length,
      MEDIUM: results.filter(r => r.severity === 'MEDIUM').length,
      LOW: results.filter(r => r.severity === 'LOW').length
    }
  };
  
  return stats;
}

// Fonction pour sauvegarder le rapport
function saveReport(stats) {
  const reportDir = path.join(process.cwd(), 'docs', 'migration', 'reports');
  
  // Créer le répertoire de rapports s'il n'existe pas
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }
  
  // Enregistrer le rapport JSON
  const jsonPath = path.join(reportDir, `hooks_migration_progress_${stats.date}.json`);
  fs.writeFileSync(jsonPath, JSON.stringify(stats, null, 2));
  
  // Générer et enregistrer le rapport Markdown
  const markdownPath = path.join(reportDir, `hooks_migration_progress_${stats.date}.md`);
  const markdown = generateMarkdownReport(stats);
  fs.writeFileSync(markdownPath, markdown);
  
  console.log(`Rapports générés avec succès:`);
  console.log(`- JSON: ${jsonPath}`);
  console.log(`- Markdown: ${markdownPath}`);
  
  return { jsonPath, markdownPath };
}

// Fonction pour générer un rapport au format Markdown
function generateMarkdownReport(stats) {
  return `# Rapport de Progression de Migration des Hooks
*Date: ${stats.date}*

## Résumé

- **Progression globale**: ${stats.migrationProgress.percentage.toFixed(2)}% (${stats.migrationProgress.migratedHooks}/${stats.migrationProgress.totalHooks} hooks)
- **Hooks dépréciés détectés**: ${stats.totalDeprecatedHooks}
- **Occurrences totales**: ${stats.totalOccurrences}

## Progression par catégorie

| Catégorie | Progression | Hooks migrés | Hooks totaux |
|-----------|-------------|--------------|-------------|
${Object.entries(stats.byCategory).map(([category, data]) => {
  return `| ${category} | ${data.migrationPercentage.toFixed(2)}% | ${data.total - data.detected}/${data.total} | `;
}).join('\n')}

## Répartition par sévérité

- **HAUTE**: ${stats.bySeverity.HIGH} occurrences
- **MOYENNE**: ${stats.bySeverity.MEDIUM} occurrences
- **BASSE**: ${stats.bySeverity.LOW} occurrences

## Prochaines étapes recommandées

1. Prioriser la migration des ${stats.bySeverity.HIGH} occurrences de sévérité HAUTE
2. Se concentrer sur la catégorie ${Object.entries(stats.byCategory).reduce((lowest, [category, data]) => {
  if (!lowest || data.migrationPercentage < stats.byCategory[lowest].migrationPercentage) {
    return category;
  }
  return lowest;
}, null)} qui a la progression la plus faible (${stats.byCategory[Object.entries(stats.byCategory).reduce((lowest, [category, data]) => {
  if (!lowest || data.migrationPercentage < stats.byCategory[lowest].migrationPercentage) {
    return category;
  }
  return lowest;
}, null)].migrationPercentage.toFixed(2)}%)
3. Continuer à suivre le plan d'action détaillé dans [PLAN_ACTION_MIGRATION_HOOKS_GENERIQUES.md](/docs/migration/PLAN_ACTION_MIGRATION_HOOKS_GENERIQUES.md)

`;
}

// Fonction principale
function main() {
  console.log('=== Suivi de la Migration des Hooks ===\n');
  
  // Détecter les hooks dépréciés
  const results = detectDeprecatedHooks();
  
  // Générer les statistiques
  const stats = generateStats(results);
  
  // Enregistrer le rapport
  const { jsonPath, markdownPath } = saveReport(stats);
  
  // Afficher un résumé
  console.log('\n=== Résumé de la progression ===');
  console.log(`Progression globale: ${stats.migrationProgress.percentage.toFixed(2)}%`);
  console.log(`Hooks migrés: ${stats.migrationProgress.migratedHooks}/${stats.migrationProgress.totalHooks}`);
  
  console.log('\nProgression par catégorie:');
  Object.entries(stats.byCategory).forEach(([category, data]) => {
    console.log(`- ${category}: ${data.migrationPercentage.toFixed(2)}%`);
  });
  
  console.log('\nRépartition par sévérité:');
  console.log(`- HAUTE: ${stats.bySeverity.HIGH}`);
  console.log(`- MOYENNE: ${stats.bySeverity.MEDIUM}`);
  console.log(`- BASSE: ${stats.bySeverity.LOW}`);
  
  console.log('\nConsultez le rapport détaillé pour plus d\'informations.');
}

// Exécution du script
main();