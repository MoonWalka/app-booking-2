#!/usr/bin/env node

/**
 * Script d'analyse des flux de données entre composants
 * Trace comment les données circulent dans l'application
 */

const fs = require('fs').promises;
const path = require('path');

// Configuration
const PROJECT_ROOT = path.join(__dirname, '..');
const SRC_PATH = path.join(PROJECT_ROOT, 'src');

// Patterns à rechercher
const PATTERNS = {
  // Imports de services
  serviceImports: /import\s+.*\s+from\s+['"].*\/services\/(.*)['"];?/g,
  
  // Hooks Firebase
  firebaseHooks: /use(Collection|Document|Query)\s*\(/g,
  
  // Context usage
  contextUsage: /use(Context|Organization|Auth|Tabs)\s*\(/g,
  
  // State management
  stateManagement: /useState\s*\(\s*(\[.*?\]|{.*?}|null|undefined|''|"")\s*\)/g,
  
  // Data fetching
  dataFetching: /(getDocs|getDoc|onSnapshot|query|where|orderBy)\s*\(/g,
  
  // Props passing
  propsPattern: /<(\w+).*?([\s\n]+(\w+)=\{[^}]+\})+/g,
  
  // Event handlers
  eventHandlers: /on[A-Z]\w+\s*=\s*\{/g
};

// Résultats de l'analyse
const analysisResults = {
  timestamp: new Date().toISOString(),
  dataFlows: {},
  components: {},
  services: {},
  contexts: {},
  issues: []
};

/**
 * Analyse un fichier pour extraire les flux de données
 */
async function analyzeFile(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf8');
    const relativePath = path.relative(PROJECT_ROOT, filePath);
    const fileName = path.basename(filePath);
    
    const fileAnalysis = {
      path: relativePath,
      imports: [],
      exports: [],
      hooks: [],
      contexts: [],
      services: [],
      dataFetching: [],
      stateVariables: [],
      propsReceived: [],
      propsPassed: [],
      eventHandlers: []
    };
    
    // Analyser les imports de services
    let match;
    const serviceImports = new RegExp(PATTERNS.serviceImports);
    while ((match = serviceImports.exec(content)) !== null) {
      fileAnalysis.services.push(match[1]);
    }
    
    // Analyser l'utilisation des contexts
    const contextMatches = content.match(/use(Context|Organization|Auth|Tabs)\s*\(/g) || [];
    fileAnalysis.contexts = contextMatches.map(m => m.replace(/\s*\(/, ''));
    
    // Analyser les hooks Firebase
    const firebaseHookMatches = content.match(PATTERNS.firebaseHooks) || [];
    fileAnalysis.hooks = firebaseHookMatches.map(m => m.replace(/\s*\(/, ''));
    
    // Analyser les fetches de données
    const fetchMatches = content.match(PATTERNS.dataFetching) || [];
    fileAnalysis.dataFetching = [...new Set(fetchMatches.map(m => m.replace(/\s*\(/, '')))];
    
    // Analyser les variables d'état
    const stateMatches = content.match(PATTERNS.stateManagement) || [];
    fileAnalysis.stateVariables = stateMatches.length;
    
    // Analyser les event handlers
    const handlerMatches = content.match(PATTERNS.eventHandlers) || [];
    fileAnalysis.eventHandlers = handlerMatches.map(m => m.replace(/\s*=\s*\{/, ''));
    
    // Détecter le type de composant
    const componentType = detectComponentType(fileName, content);
    fileAnalysis.type = componentType;
    
    // Stocker les résultats
    analysisResults.components[fileName] = fileAnalysis;
    
    return fileAnalysis;
    
  } catch (error) {
    console.error(`Erreur lors de l'analyse de ${filePath}:`, error.message);
    return null;
  }
}

/**
 * Détermine le type de composant
 */
function detectComponentType(fileName, content) {
  if (fileName.includes('List')) return 'list';
  if (fileName.includes('Table')) return 'table';
  if (fileName.includes('Details')) return 'details';
  if (fileName.includes('Form')) return 'form';
  if (fileName.includes('Modal')) return 'modal';
  if (fileName.includes('Page')) return 'page';
  if (fileName.includes('Stats') || fileName.includes('Card')) return 'stats';
  if (content.includes('export const') && content.includes('Service')) return 'service';
  if (content.includes('Context.Provider')) return 'context';
  return 'component';
}

/**
 * Analyse un répertoire récursivement
 */
async function analyzeDirectory(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory() && !entry.name.includes('node_modules') && !entry.name.startsWith('.')) {
      await analyzeDirectory(fullPath);
    } else if (entry.isFile() && (entry.name.endsWith('.js') || entry.name.endsWith('.jsx'))) {
      await analyzeFile(fullPath);
    }
  }
}

/**
 * Construit la carte des flux de données
 */
function buildDataFlowMap() {
  console.log('\nConstruction de la carte des flux de données...');
  
  // Grouper par type de composant
  const componentsByType = {};
  for (const [name, analysis] of Object.entries(analysisResults.components)) {
    const type = analysis.type;
    if (!componentsByType[type]) componentsByType[type] = [];
    componentsByType[type].push({ name, ...analysis });
  }
  
  // Analyser les flux entre types
  analysisResults.dataFlows = {
    // Pages → Services
    pageToService: [],
    // Services → Firebase
    serviceToDatabase: [],
    // Components → Contexts
    componentToContext: [],
    // Lists/Tables → Details
    listToDetails: [],
    // Forms → Services
    formToService: []
  };
  
  // Identifier les flux principaux
  for (const [name, analysis] of Object.entries(analysisResults.components)) {
    if (analysis.type === 'page' && analysis.services.length > 0) {
      analysisResults.dataFlows.pageToService.push({
        page: name,
        services: analysis.services
      });
    }
    
    if (analysis.type === 'form' && analysis.services.length > 0) {
      analysisResults.dataFlows.formToService.push({
        form: name,
        services: analysis.services
      });
    }
    
    if (analysis.contexts.length > 0) {
      analysisResults.dataFlows.componentToContext.push({
        component: name,
        contexts: analysis.contexts
      });
    }
  }
  
  // Statistiques
  analysisResults.statistics = {
    totalComponents: Object.keys(analysisResults.components).length,
    componentsByType: Object.entries(componentsByType).map(([type, components]) => ({
      type,
      count: components.length
    })),
    servicesUsed: [...new Set(Object.values(analysisResults.components).flatMap(c => c.services))],
    contextsUsed: [...new Set(Object.values(analysisResults.components).flatMap(c => c.contexts))],
    averageStatePerComponent: Math.round(
      Object.values(analysisResults.components).reduce((sum, c) => sum + c.stateVariables, 0) / 
      Object.keys(analysisResults.components).length
    )
  };
}

/**
 * Identifie les problèmes potentiels
 */
function identifyIssues() {
  console.log('\nIdentification des problèmes potentiels...');
  
  // Composants avec trop de dépendances
  for (const [name, analysis] of Object.entries(analysisResults.components)) {
    if (analysis.services.length > 3) {
      analysisResults.issues.push({
        type: 'too_many_services',
        component: name,
        count: analysis.services.length,
        services: analysis.services,
        severity: 'warning'
      });
    }
    
    if (analysis.stateVariables > 10) {
      analysisResults.issues.push({
        type: 'complex_state',
        component: name,
        stateCount: analysis.stateVariables,
        severity: 'warning'
      });
    }
    
    if (analysis.dataFetching.length > 5) {
      analysisResults.issues.push({
        type: 'multiple_data_fetches',
        component: name,
        fetches: analysis.dataFetching,
        severity: 'info'
      });
    }
  }
  
  // Vérifier les patterns d'anti-patterns
  for (const [name, analysis] of Object.entries(analysisResults.components)) {
    // Composant de liste sans pagination ?
    if (analysis.type === 'list' && !analysis.dataFetching.includes('limit')) {
      analysisResults.issues.push({
        type: 'no_pagination',
        component: name,
        severity: 'warning'
      });
    }
  }
}

/**
 * Génère un diagramme Mermaid des flux
 */
function generateMermaidDiagram() {
  let mermaid = 'graph TD\n';
  
  // Ajouter les flux page → service
  analysisResults.dataFlows.pageToService.forEach(flow => {
    flow.services.forEach(service => {
      mermaid += `    ${flow.page} --> ${service}\n`;
    });
  });
  
  // Ajouter les flux form → service
  analysisResults.dataFlows.formToService.forEach(flow => {
    flow.services.forEach(service => {
      mermaid += `    ${flow.form} -.-> ${service}\n`;
    });
  });
  
  // Ajouter les flux component → context
  const contextGroups = {};
  analysisResults.dataFlows.componentToContext.forEach(flow => {
    flow.contexts.forEach(context => {
      if (!contextGroups[context]) contextGroups[context] = [];
      contextGroups[context].push(flow.component);
    });
  });
  
  // Limiter l'affichage aux contexts principaux
  Object.entries(contextGroups).forEach(([context, components]) => {
    if (components.length > 3) {
      mermaid += `    ${context} ==> ${components.length}_components\n`;
    }
  });
  
  return mermaid;
}

/**
 * Génère le rapport d'analyse
 */
async function generateReport() {
  const reportPath = path.join(PROJECT_ROOT, 'data-flow-analysis.json');
  const mermaidPath = path.join(PROJECT_ROOT, 'data-flow-diagram.mmd');
  
  // Générer le diagramme Mermaid
  const mermaidDiagram = generateMermaidDiagram();
  await fs.writeFile(mermaidPath, mermaidDiagram);
  
  // Sauvegarder le rapport JSON
  await fs.writeFile(reportPath, JSON.stringify(analysisResults, null, 2));
  
  // Afficher le résumé
  console.log('\n=== Résumé de l\'analyse ===');
  console.log(`Total de composants analysés: ${analysisResults.statistics.totalComponents}`);
  console.log('\nRépartition par type:');
  analysisResults.statistics.componentsByType.forEach(({ type, count }) => {
    console.log(`  - ${type}: ${count}`);
  });
  console.log(`\nServices utilisés: ${analysisResults.statistics.servicesUsed.length}`);
  console.log(`Contexts utilisés: ${analysisResults.statistics.contextsUsed.length}`);
  console.log(`État moyen par composant: ${analysisResults.statistics.averageStatePerComponent} variables`);
  console.log(`\nProblèmes identifiés: ${analysisResults.issues.length}`);
  
  if (analysisResults.issues.length > 0) {
    console.log('\nProblèmes principaux:');
    const issuesByType = {};
    analysisResults.issues.forEach(issue => {
      if (!issuesByType[issue.type]) issuesByType[issue.type] = 0;
      issuesByType[issue.type]++;
    });
    
    Object.entries(issuesByType).forEach(([type, count]) => {
      console.log(`  - ${type}: ${count} occurrences`);
    });
  }
  
  console.log(`\nRapports générés:`);
  console.log(`  - ${reportPath}`);
  console.log(`  - ${mermaidPath}`);
}

/**
 * Fonction principale
 */
async function main() {
  console.log('Analyse des flux de données dans l\'application');
  console.log('='.repeat(50));
  
  try {
    // Analyser tous les composants
    console.log('Analyse des composants...');
    await analyzeDirectory(SRC_PATH);
    
    // Construire la carte des flux
    buildDataFlowMap();
    
    // Identifier les problèmes
    identifyIssues();
    
    // Générer le rapport
    await generateReport();
    
  } catch (error) {
    console.error('Erreur lors de l\'analyse:', error);
    process.exit(1);
  }
}

// Lancer l'analyse
main().catch(console.error);