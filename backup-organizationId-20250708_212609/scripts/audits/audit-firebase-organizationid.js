/**
 * Script d'audit pour vérifier la gestion de l'organizationId dans tous les services Firebase
 * Vérifie les opérations CRUD (Create, Read, Update, Delete) et leur conformité
 */

const fs = require('fs');
const path = require('path');

// Patterns à rechercher pour les opérations Firebase
const firebasePatterns = {
  imports: /import.*from.*['"].*firebase.*['"]/g,
  collection: /collection\s*\(\s*db\s*,\s*['"`](\w+)['"`]/g,
  query: /query\s*\(/g,
  where: /where\s*\(\s*['"`](\w+)['"`]\s*,/g,
  addDoc: /addDoc\s*\(/g,
  setDoc: /setDoc\s*\(/g,
  updateDoc: /updateDoc\s*\(/g,
  deleteDoc: /deleteDoc\s*\(/g,
  getDocs: /getDocs\s*\(/g,
  getDoc: /getDoc\s*\(/g,
  organizationId: /organizationId/g,
  currentOrganization: /currentOrganization/g,
  useOrganization: /useOrganization/g
};

// Collections Firebase connues
const knownCollections = [
  'concerts', 'contacts', 'artistes', 'lieux', 'structures', 
  'contrats', 'relances', 'forms', 'parametres', 'users',
  'contratTemplates', 'historique_echanges'
];

function analyzeFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const fileName = path.basename(filePath);
  const relativePath = path.relative(process.cwd(), filePath);
  
  // Vérifier si le fichier utilise Firebase
  const usesFirebase = firebasePatterns.imports.test(content);
  if (!usesFirebase) return null;
  
  const analysis = {
    file: relativePath,
    fileName: fileName,
    operations: {
      create: [],
      read: [],
      update: [],
      delete: []
    },
    collections: new Set(),
    hasOrganizationIdCheck: false,
    hasOrganizationIdInWrites: false,
    usesOrganizationContext: false,
    issues: []
  };
  
  // Détecter l'utilisation du contexte d'organisation
  if (firebasePatterns.useOrganization.test(content) || firebasePatterns.currentOrganization.test(content)) {
    analysis.usesOrganizationContext = true;
  }
  
  // Analyser les collections utilisées
  let match;
  firebasePatterns.collection.lastIndex = 0;
  while ((match = firebasePatterns.collection.exec(content)) !== null) {
    analysis.collections.add(match[1]);
  }
  
  // Analyser les opérations CREATE
  if (firebasePatterns.addDoc.test(content) || firebasePatterns.setDoc.test(content)) {
    analysis.operations.create.push({
      type: 'addDoc/setDoc',
      hasOrganizationId: /organizationId.*:/.test(content) // Vérifie si organizationId est dans les données
    });
    
    // Vérifier si organizationId est ajouté lors de la création
    const createBlocks = content.match(/(?:addDoc|setDoc)\s*\([^)]+\)/gs) || [];
    createBlocks.forEach(block => {
      if (!block.includes('organizationId')) {
        analysis.issues.push('CREATE operation sans organizationId trouvée');
      } else {
        analysis.hasOrganizationIdInWrites = true;
      }
    });
  }
  
  // Analyser les opérations READ
  if (firebasePatterns.query.test(content) || firebasePatterns.getDocs.test(content) || firebasePatterns.getDoc.test(content)) {
    analysis.operations.read.push({
      type: 'query/getDocs/getDoc'
    });
    
    // Vérifier la présence de where('organizationId', ...)
    const whereMatches = content.match(/where\s*\(\s*['"`]organizationId['"`]/g) || [];
    if (whereMatches.length > 0) {
      analysis.hasOrganizationIdCheck = true;
    } else if (firebasePatterns.query.test(content)) {
      // Si des queries sont faites sans filtre organizationId
      analysis.issues.push('Queries sans filtre organizationId détectées');
    }
  }
  
  // Analyser les opérations UPDATE
  if (firebasePatterns.updateDoc.test(content)) {
    analysis.operations.update.push({
      type: 'updateDoc'
    });
    
    // Vérifier si les updates incluent organizationId (généralement pas nécessaire)
    const updateBlocks = content.match(/updateDoc\s*\([^)]+\)/gs) || [];
    updateBlocks.forEach(block => {
      // Les updates ne devraient généralement pas modifier l'organizationId
      if (block.includes('organizationId')) {
        analysis.issues.push('UPDATE modifiant organizationId détecté - à vérifier');
      }
    });
  }
  
  // Analyser les opérations DELETE
  if (firebasePatterns.deleteDoc.test(content)) {
    analysis.operations.delete.push({
      type: 'deleteDoc'
    });
    // Les deletes n'ont généralement pas besoin de vérifier organizationId
    // mais devraient idéalement vérifier les permissions avant
  }
  
  // Déterminer la conformité globale
  const hasCreateOps = analysis.operations.create.length > 0;
  const hasReadOps = analysis.operations.read.length > 0;
  
  if (hasCreateOps && !analysis.hasOrganizationIdInWrites) {
    analysis.issues.push('❌ CREATE sans organizationId');
  }
  
  if (hasReadOps && !analysis.hasOrganizationIdCheck && analysis.collections.size > 0) {
    // Exceptions pour certaines collections globales
    const globalCollections = ['parametres', 'users'];
    const usesOnlyGlobalCollections = Array.from(analysis.collections).every(col => 
      globalCollections.includes(col)
    );
    
    if (!usesOnlyGlobalCollections) {
      analysis.issues.push('❌ READ sans filtre organizationId');
    }
  }
  
  return analysis;
}

function scanDirectory(dir, results = []) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    // Ignorer node_modules et autres dossiers non pertinents
    if (stat.isDirectory() && !file.includes('node_modules') && !file.startsWith('.')) {
      scanDirectory(filePath, results);
    } else if (stat.isFile() && file.endsWith('.js') && !file.endsWith('.test.js')) {
      const analysis = analyzeFile(filePath);
      if (analysis) {
        results.push(analysis);
      }
    }
  }
  
  return results;
}

// Lancer l'audit
console.log('🔍 Audit des services Firebase pour la gestion de l\'organizationId\n');

const srcPath = path.join(process.cwd(), 'src');
const results = scanDirectory(srcPath);

// Séparer les résultats par catégorie
const servicesResults = results.filter(r => r.file.includes('/services/'));
const hooksResults = results.filter(r => r.file.includes('/hooks/'));
const componentsResults = results.filter(r => r.file.includes('/components/'));
const utilsResults = results.filter(r => r.file.includes('/utils/'));
const pagesResults = results.filter(r => r.file.includes('/pages/'));

// Fonction pour afficher les résultats d'une catégorie
function displayCategory(categoryName, categoryResults) {
  console.log(`\n📁 ${categoryName} (${categoryResults.length} fichiers)\n`);
  
  const conformes = [];
  const nonConformes = [];
  
  categoryResults.forEach(result => {
    if (result.issues.length === 0) {
      conformes.push(result);
    } else {
      nonConformes.push(result);
    }
  });
  
  // Afficher les non-conformes d'abord
  if (nonConformes.length > 0) {
    console.log('❌ NON CONFORMES:');
    nonConformes.forEach(result => {
      console.log(`\n  ${result.fileName}`);
      console.log(`  Collections: ${Array.from(result.collections).join(', ') || 'aucune'}`);
      console.log(`  Issues:`);
      result.issues.forEach(issue => {
        console.log(`    - ${issue}`);
      });
      console.log(`  Operations: CREATE(${result.operations.create.length}) READ(${result.operations.read.length}) UPDATE(${result.operations.update.length}) DELETE(${result.operations.delete.length})`);
    });
  }
  
  // Afficher les conformes
  if (conformes.length > 0) {
    console.log('\n✅ CONFORMES:');
    conformes.forEach(result => {
      console.log(`  ${result.fileName} - Collections: ${Array.from(result.collections).join(', ') || 'aucune'}`);
    });
  }
}

// Afficher les résultats par catégorie
displayCategory('SERVICES', servicesResults);
displayCategory('HOOKS', hooksResults);
displayCategory('COMPONENTS', componentsResults);
displayCategory('UTILS', utilsResults);
displayCategory('PAGES', pagesResults);

// Résumé global
console.log('\n' + '='.repeat(80));
console.log('📊 RÉSUMÉ GLOBAL\n');

const totalFiles = results.length;
const totalIssues = results.reduce((sum, r) => sum + r.issues.length, 0);
const filesWithIssues = results.filter(r => r.issues.length > 0).length;

console.log(`Total de fichiers analysés: ${totalFiles}`);
console.log(`Fichiers avec des problèmes: ${filesWithIssues}`);
console.log(`Total de problèmes détectés: ${totalIssues}`);

// Collections utilisées
const allCollections = new Set();
results.forEach(r => r.collections.forEach(c => allCollections.add(c)));
console.log(`\nCollections Firebase utilisées: ${Array.from(allCollections).sort().join(', ')}`);

// Recommandations
console.log('\n' + '='.repeat(80));
console.log('💡 RECOMMANDATIONS\n');

console.log('1. Pour les opérations CREATE (addDoc, setDoc):');
console.log('   - Toujours inclure organizationId: currentOrganization?.id dans les données');
console.log('   - Utiliser le hook useOrganization() pour accéder à currentOrganization\n');

console.log('2. Pour les opérations READ (query, getDocs):');
console.log('   - Ajouter where("organizationId", "==", currentOrganization.id) aux queries');
console.log('   - Exceptions: collections globales (parametres, users)\n');

console.log('3. Pour les hooks génériques:');
console.log('   - useGenericEntityDetails, useGenericEntityList devraient gérer organizationId automatiquement');
console.log('   - Vérifier que les hooks spécifiques utilisent ces hooks génériques\n');

console.log('4. Services à corriger en priorité:');
const priorityFixes = results
  .filter(r => r.file.includes('/services/') && r.issues.length > 0)
  .map(r => `   - ${r.fileName}: ${r.issues.join(', ')}`);

if (priorityFixes.length > 0) {
  priorityFixes.forEach(fix => console.log(fix));
} else {
  console.log('   ✅ Tous les services semblent conformes');
}

// Sauvegarder le rapport
const report = {
  date: new Date().toISOString(),
  summary: {
    totalFiles,
    filesWithIssues,
    totalIssues,
    collections: Array.from(allCollections).sort()
  },
  details: results,
  recommendations: [
    'Toujours inclure organizationId dans les opérations CREATE',
    'Filtrer par organizationId dans les opérations READ',
    'Utiliser les hooks génériques qui gèrent automatiquement organizationId',
    'Vérifier les permissions avant les opérations DELETE'
  ]
};

fs.writeFileSync('audit-firebase-organizationid-report.json', JSON.stringify(report, null, 2));
console.log('\n📄 Rapport détaillé sauvegardé dans: audit-firebase-organizationid-report.json');