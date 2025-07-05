#!/usr/bin/env node

/**
 * Script de vérification des mises à jour temps réel
 * Vérifie que les composants se mettent à jour correctement lors des changements
 */

const fs = require('fs').promises;
const path = require('path');

const PROJECT_ROOT = path.join(__dirname, '..');
const SRC_PATH = path.join(PROJECT_ROOT, 'src');

// Patterns pour détecter les mécanismes de mise à jour
const UPDATE_PATTERNS = {
  // Listeners Firebase
  onSnapshot: /onSnapshot\s*\(/g,
  
  // useEffect avec dépendances
  useEffectWithDeps: /useEffect\s*\(\s*\(\)\s*=>\s*{[\s\S]*?},\s*\[(.*?)\]/g,
  
  // Event emitters
  eventEmit: /emit\s*\(['"]([^'"]+)['"]/g,
  eventOn: /on\s*\(['"]([^'"]+)['"]/g,
  
  // Context updates
  contextUpdate: /set\w+\s*\(/g,
  
  // Refresh/reload functions
  refreshFunctions: /(refresh|reload|fetch|load)\w*\s*\(/gi,
  
  // Cache invalidation
  cacheInvalidation: /(invalidate|clear|reset)Cache/gi,
  
  // React Query / SWR
  reactQuery: /use(Query|Mutation|SWR)/g
};

const results = {
  timestamp: new Date().toISOString(),
  componentsWithRealtimeUpdates: [],
  componentsWithoutRealtimeUpdates: [],
  updateMechanisms: {},
  potentialIssues: [],
  recommendations: []
};

/**
 * Analyse un composant pour les mécanismes de mise à jour
 */
async function analyzeComponent(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf8');
    const fileName = path.basename(filePath);
    const relativePath = path.relative(PROJECT_ROOT, filePath);
    
    const componentAnalysis = {
      name: fileName,
      path: relativePath,
      hasRealtimeUpdates: false,
      updateMechanisms: [],
      dependencies: [],
      issues: []
    };
    
    // Vérifier onSnapshot (temps réel Firebase)
    const snapshotMatches = content.match(UPDATE_PATTERNS.onSnapshot);
    if (snapshotMatches) {
      componentAnalysis.hasRealtimeUpdates = true;
      componentAnalysis.updateMechanisms.push('firebase-realtime');
    }
    
    // Vérifier useEffect avec dépendances
    let effectMatch;
    const effectRegex = new RegExp(UPDATE_PATTERNS.useEffectWithDeps);
    while ((effectMatch = effectRegex.exec(content)) !== null) {
      const deps = effectMatch[1].split(',').map(d => d.trim()).filter(d => d);
      if (deps.length > 0) {
        componentAnalysis.dependencies.push(...deps);
      }
    }
    
    // Vérifier les event emitters/listeners
    if (content.match(UPDATE_PATTERNS.eventOn)) {
      componentAnalysis.updateMechanisms.push('event-listener');
    }
    
    // Vérifier les fonctions de refresh
    const refreshMatches = content.match(UPDATE_PATTERNS.refreshFunctions);
    if (refreshMatches) {
      componentAnalysis.updateMechanisms.push('manual-refresh');
    }
    
    // Vérifier React Query / SWR
    if (content.match(UPDATE_PATTERNS.reactQuery)) {
      componentAnalysis.hasRealtimeUpdates = true;
      componentAnalysis.updateMechanisms.push('react-query');
    }
    
    // Analyser les problèmes potentiels
    
    // 1. useEffect sans dépendances (infinite loop potential)
    if (content.includes('useEffect(() =>') && content.includes('}, [])')) {
      const hasDataFetch = content.includes('getDocs') || content.includes('fetch');
      if (hasDataFetch) {
        componentAnalysis.issues.push({
          type: 'static-data-fetch',
          description: 'Données chargées une seule fois sans mise à jour'
        });
      }
    }
    
    // 2. Missing cleanup dans useEffect avec listeners
    if (content.includes('addEventListener') || content.includes('onSnapshot')) {
      const hasCleanup = content.includes('return () =>') || content.includes('unsubscribe');
      if (!hasCleanup) {
        componentAnalysis.issues.push({
          type: 'missing-cleanup',
          description: 'Listener sans cleanup - fuite mémoire potentielle'
        });
      }
    }
    
    // 3. État local sans synchronisation
    if (content.includes('useState') && !componentAnalysis.hasRealtimeUpdates) {
      const isListComponent = fileName.includes('List') || fileName.includes('Table');
      if (isListComponent) {
        componentAnalysis.issues.push({
          type: 'no-realtime-sync',
          description: 'Composant de liste sans mise à jour temps réel'
        });
      }
    }
    
    return componentAnalysis;
    
  } catch (error) {
    console.error(`Erreur lors de l'analyse de ${filePath}:`, error.message);
    return null;
  }
}

/**
 * Analyse les relations entre composants
 */
function analyzeComponentRelations() {
  console.log('\nAnalyse des relations de mise à jour...');
  
  // Grouper par type de mécanisme
  const mechanismGroups = {};
  
  results.componentsWithRealtimeUpdates.forEach(comp => {
    comp.updateMechanisms.forEach(mechanism => {
      if (!mechanismGroups[mechanism]) {
        mechanismGroups[mechanism] = [];
      }
      mechanismGroups[mechanism].push(comp.name);
    });
  });
  
  results.updateMechanisms = mechanismGroups;
  
  // Identifier les composants orphelins
  const orphanComponents = results.componentsWithoutRealtimeUpdates.filter(comp => {
    const isDataComponent = comp.name.includes('List') || 
                           comp.name.includes('Table') || 
                           comp.name.includes('Details');
    return isDataComponent;
  });
  
  if (orphanComponents.length > 0) {
    results.potentialIssues.push({
      type: 'orphan-data-components',
      description: 'Composants de données sans mise à jour temps réel',
      components: orphanComponents.map(c => c.name)
    });
  }
}

/**
 * Génère des recommandations
 */
function generateRecommendations() {
  console.log('\nGénération des recommandations...');
  
  // Recommandation pour les composants sans temps réel
  if (results.componentsWithoutRealtimeUpdates.length > 0) {
    const listComponents = results.componentsWithoutRealtimeUpdates.filter(c => 
      c.name.includes('List') || c.name.includes('Table')
    );
    
    if (listComponents.length > 0) {
      results.recommendations.push({
        priority: 'high',
        type: 'add-realtime',
        title: 'Ajouter des mises à jour temps réel',
        description: 'Ces composants de liste devraient utiliser onSnapshot pour les mises à jour temps réel',
        components: listComponents.map(c => c.name)
      });
    }
  }
  
  // Recommandation pour les cleanups manquants
  const componentsWithIssues = [...results.componentsWithRealtimeUpdates, ...results.componentsWithoutRealtimeUpdates]
    .filter(c => c.issues.some(i => i.type === 'missing-cleanup'));
  
  if (componentsWithIssues.length > 0) {
    results.recommendations.push({
      priority: 'critical',
      type: 'add-cleanup',
      title: 'Ajouter des fonctions de cleanup',
      description: 'Ces composants ont des listeners sans cleanup, risque de fuite mémoire',
      components: componentsWithIssues.map(c => c.name)
    });
  }
  
  // Recommandation pour centraliser les mises à jour
  if (Object.keys(results.updateMechanisms).length > 3) {
    results.recommendations.push({
      priority: 'medium',
      type: 'centralize-updates',
      title: 'Centraliser les mécanismes de mise à jour',
      description: 'Trop de mécanismes différents, considérer un state management centralisé',
      mechanisms: Object.keys(results.updateMechanisms)
    });
  }
}

/**
 * Parcourt récursivement un répertoire
 */
async function scanDirectory(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory() && !entry.name.includes('node_modules') && !entry.name.startsWith('.')) {
      await scanDirectory(fullPath);
    } else if (entry.isFile() && (entry.name.endsWith('.js') || entry.name.endsWith('.jsx'))) {
      const analysis = await analyzeComponent(fullPath);
      if (analysis) {
        if (analysis.hasRealtimeUpdates || analysis.updateMechanisms.length > 0) {
          results.componentsWithRealtimeUpdates.push(analysis);
        } else {
          results.componentsWithoutRealtimeUpdates.push(analysis);
        }
      }
    }
  }
}

/**
 * Génère le rapport final
 */
async function generateReport() {
  const reportPath = path.join(PROJECT_ROOT, 'realtime-updates-report.json');
  
  // Calculer les statistiques
  results.statistics = {
    totalComponents: results.componentsWithRealtimeUpdates.length + results.componentsWithoutRealtimeUpdates.length,
    withRealtimeUpdates: results.componentsWithRealtimeUpdates.length,
    withoutRealtimeUpdates: results.componentsWithoutRealtimeUpdates.length,
    percentageWithRealtime: Math.round(
      (results.componentsWithRealtimeUpdates.length / 
       (results.componentsWithRealtimeUpdates.length + results.componentsWithoutRealtimeUpdates.length)) * 100
    ),
    updateMechanismsUsed: Object.keys(results.updateMechanisms).length,
    totalIssues: results.potentialIssues.length,
    criticalRecommendations: results.recommendations.filter(r => r.priority === 'critical').length
  };
  
  await fs.writeFile(reportPath, JSON.stringify(results, null, 2));
  
  // Afficher le résumé
  console.log('\n=== Rapport des mises à jour temps réel ===');
  console.log(`Total de composants: ${results.statistics.totalComponents}`);
  console.log(`Avec temps réel: ${results.statistics.withRealtimeUpdates} (${results.statistics.percentageWithRealtime}%)`);
  console.log(`Sans temps réel: ${results.statistics.withoutRealtimeUpdates}`);
  console.log('\nMécanismes utilisés:');
  Object.entries(results.updateMechanisms).forEach(([mechanism, components]) => {
    console.log(`  - ${mechanism}: ${components.length} composants`);
  });
  
  if (results.potentialIssues.length > 0) {
    console.log(`\n⚠️  Problèmes potentiels: ${results.potentialIssues.length}`);
    results.potentialIssues.forEach(issue => {
      console.log(`  - ${issue.description}`);
      if (issue.components && issue.components.length > 0) {
        console.log(`    Composants: ${issue.components.slice(0, 3).join(', ')}${issue.components.length > 3 ? '...' : ''}`);
      }
    });
  }
  
  if (results.recommendations.length > 0) {
    console.log(`\n💡 Recommandations (${results.recommendations.length}):`);
    results.recommendations.forEach(rec => {
      const icon = rec.priority === 'critical' ? '🔴' : rec.priority === 'high' ? '🟠' : '🟡';
      console.log(`  ${icon} ${rec.title}`);
      console.log(`     ${rec.description}`);
    });
  }
  
  console.log(`\nRapport détaillé généré: ${reportPath}`);
}

/**
 * Fonction principale
 */
async function main() {
  console.log('Vérification des mises à jour temps réel');
  console.log('='.repeat(50));
  
  try {
    console.log('Analyse des composants...');
    await scanDirectory(path.join(SRC_PATH, 'components'));
    await scanDirectory(path.join(SRC_PATH, 'pages'));
    
    analyzeComponentRelations();
    generateRecommendations();
    await generateReport();
    
  } catch (error) {
    console.error('Erreur lors de l\'analyse:', error);
    process.exit(1);
  }
}

// Lancer l'analyse
main().catch(console.error);