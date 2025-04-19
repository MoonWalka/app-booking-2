const fs = require('fs');
const path = require('path');

// Fonction récursive pour rechercher des fichiers
function findFiles(dir, extensions, results = []) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    
    if (file.isDirectory() && file.name !== 'node_modules' && file.name !== 'build') {
      findFiles(fullPath, extensions, results);
    } else if (file.isFile() && extensions.some(ext => file.name.endsWith(ext))) {
      results.push(fullPath);
    }
  }
  
  return results;
}

// Trouver tous les fichiers JS/JSX
const sourceFiles = findFiles('./src', ['.js', '.jsx']);
console.log(`Analyse de ${sourceFiles.length} fichiers JS/JSX...`);

// Statistiques et problèmes
const stats = {
  totalImports: 0,
  emptyImports: [],
  potentialProblems: [],
  circularReferences: new Set(),
  importedModules: {},
  moduleExports: {}
};

// Analyser chaque fichier
sourceFiles.forEach(filePath => {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    // Rechercher les imports
    const importLines = lines.filter(line => /^\s*import\s+.*\s+from\s+['"]/.test(line));
    stats.totalImports += importLines.length;
    
    // Analyser chaque ligne d'import
    importLines.forEach((line, index) => {
      // Vérifier les imports vides
      if (line.includes("from ''") || line.includes('from ""')) {
        stats.emptyImports.push({
          file: filePath,
          line: index + 1,
          content: line.trim()
        });
      }
      
      // Extraire le module importé
      const moduleMatch = line.match(/from\s+['"]([^'"]+)['"]/);
      if (moduleMatch) {
        const module = moduleMatch[1];
        
        // Compter les modules importés
        stats.importedModules[module] = (stats.importedModules[module] || 0) + 1;
        
        // Vérifier les problèmes potentiels avec les modules
        if (module.startsWith('@')) {
          // Vérifier les imports avec alias
          if (module.includes('.js') || module.includes('.jsx')) {
            stats.potentialProblems.push({
              file: filePath,
              line: index + 1,
              content: line.trim(),
              issue: `L'import utilise une extension (.js/.jsx) avec un alias: ${module}`
            });
          }
        }
        
        // Vérifier les imports relatifs
        if (module.startsWith('./') || module.startsWith('../')) {
          // Vérifier les imports circulaires simples (2 fichiers)
          try {
            const currentDir = path.dirname(filePath);
            let targetPath = path.resolve(currentDir, module);
            
            // Ajouter .js si nécessaire
            if (!targetPath.endsWith('.js') && !targetPath.endsWith('.jsx')) {
              if (fs.existsSync(`${targetPath}.js`)) {
                targetPath = `${targetPath}.js`;
              } else if (fs.existsSync(`${targetPath}.jsx`)) {
                targetPath = `${targetPath}.jsx`;
              } else if (fs.existsSync(`${targetPath}/index.js`)) {
                targetPath = `${targetPath}/index.js`;
              }
            }
            
            // Vérifier si le fichier cible existe
            if (fs.existsSync(targetPath)) {
              const targetContent = fs.readFileSync(targetPath, 'utf8');
              
              // Vérifier si le fichier cible importe le fichier courant
              const relativeCurrentPath = path.relative(path.dirname(targetPath), filePath)
                .replace(/\\/g, '/') // Pour la compatibilité Windows
                .replace(/\.jsx?$/, '');
              
              const importCurrentRegex = new RegExp(`from\\s+['"](\\./|\\.\\./)+${relativeCurrentPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]`);
              
              if (importCurrentRegex.test(targetContent)) {
                const circular = `${filePath} <-> ${targetPath}`;
                stats.circularReferences.add(circular);
              }
            } else {
              stats.potentialProblems.push({
                file: filePath,
                line: index + 1,
                content: line.trim(),
                issue: `L'import relatif pointe vers un fichier qui n'existe pas: ${module}`
              });
            }
          } catch (err) {
            // Ignorer les erreurs de détection circulaire
          }
        }
      }
    });
    
    // Analyser les exports
    const exportLines = lines.filter(line => /^\s*export\s+/.test(line));
    exportLines.forEach(line => {
      const namedExportMatch = line.match(/export\s+{\s*([^}]+)\s*}/);
      if (namedExportMatch) {
        const exportedItems = namedExportMatch[1].split(',').map(item => item.trim());
        stats.moduleExports[filePath] = [...(stats.moduleExports[filePath] || []), ...exportedItems];
      }
      
      const defaultExportMatch = line.match(/export\s+default\s+([^;]+)/);
      if (defaultExportMatch) {
        stats.moduleExports[filePath] = [...(stats.moduleExports[filePath] || []), 'default'];
      }
    });
    
  } catch (error) {
    console.error(`Erreur lors de l'analyse de ${filePath}:`, error.message);
  }
});

// Analyser les modules les plus importés
const topImportedModules = Object.entries(stats.importedModules)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 10);

// Afficher les résultats
console.log('\n=== RÉSULTATS DE L\'ANALYSE DES IMPORTS ===');
console.log(`Total des imports analysés: ${stats.totalImports}`);

if (stats.emptyImports.length > 0) {
  console.log(`\n=== IMPORTS VIDES DÉTECTÉS (${stats.emptyImports.length}) ===`);
  stats.emptyImports.forEach(({file, line, content}) => {
    console.log(`${file}:${line}: ${content}`);
  });
}

if (stats.potentialProblems.length > 0) {
  console.log(`\n=== PROBLÈMES POTENTIELS (${stats.potentialProblems.length}) ===`);
  stats.potentialProblems.forEach(({file, line, content, issue}) => {
    console.log(`${file}:${line}: ${content}`);
    console.log(`   ↳ Problème: ${issue}`);
  });
}

if (stats.circularReferences.size > 0) {
  console.log(`\n=== RÉFÉRENCES CIRCULAIRES DÉTECTÉES (${stats.circularReferences.size}) ===`);
  [...stats.circularReferences].forEach(circular => {
    console.log(circular);
  });
}

console.log('\n=== TOP 10 DES MODULES LES PLUS IMPORTÉS ===');
topImportedModules.forEach(([module, count]) => {
  console.log(`${module}: ${count} imports`);
});
