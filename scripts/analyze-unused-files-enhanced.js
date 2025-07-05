#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Fichiers et dossiers à ignorer
const IGNORE_PATTERNS = [
  'node_modules',
  '.git',
  'build',
  'dist',
  'coverage',
  '.next',
  'public',
  'scripts',
  '.DS_Store',
  'package-lock.json',
  'yarn.lock',
  '.env',
  '.gitignore',
  'README.md',
  '*.test.js',
  '*.spec.js',
  '*.module.css',
  '*.css',
  '*.json',
  '*.png',
  '*.jpg',
  '*.svg',
  '*.ico'
];

// Points d'entrée connus
const ENTRY_POINTS = [
  'src/index.js',
  'src/App.js',
  'src/context/TabsContext.js',
  'src/components/preview/componentRegistry.js'
];

// Composants chargés dynamiquement (depuis TabsContext)
const DYNAMIC_COMPONENTS = [
  'ArtistesPage',
  'ContactDetailPage', 
  'ConcertDetailPage',
  'ContratGenerationNewPage',
  'DateCreationPage',
  'DevisEditor',
  'FactureGeneratorPage',
  'PreContratGenerator',
  'StructuresPage',
  'TachesPage',
  'ContratsPage',
  'DashboardPage',
  'ContactsPage',
  'DebugToolsPage',
  'ConcertsPage',
  'ListesPage',
  'ParametresPage',
  'DevisPage',
  'FacturesPage',
  'ContactCreationPage',
  'ContratGeneratorNew',
  'PreContratsPage'
];

class EnhancedUnusedFilesAnalyzer {
  constructor() {
    this.allFiles = new Set();
    this.importedFiles = new Set();
    this.fileImports = new Map();
    this.dynamicallyLoaded = new Set();
    this.referencedFiles = new Set(); // Fichiers référencés par d'autres moyens
    this.componentRegistry = new Map(); // Registre des composants
  }

  shouldIgnore(filePath) {
    return IGNORE_PATTERNS.some(pattern => {
      if (pattern.startsWith('*')) {
        return filePath.endsWith(pattern.slice(1));
      }
      return filePath.includes(pattern);
    });
  }

  getAllJSFiles(dir, baseDir = dir) {
    if (this.shouldIgnore(dir)) return;

    try {
      const files = fs.readdirSync(dir);
      
      for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          this.getAllJSFiles(fullPath, baseDir);
        } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
          const relativePath = path.relative('.', fullPath);
          if (!this.shouldIgnore(relativePath)) {
            this.allFiles.add(relativePath);
          }
        }
      }
    } catch (error) {
      console.error(`Error reading directory ${dir}:`, error.message);
    }
  }

  extractImports(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const imports = [];
      
      // Match import statements
      const importRegex = /import\s+(?:(?:\{[^}]*\})|(?:[^'"\s]+))\s+from\s+['"]([^'"]+)['"]/g;
      const requireRegex = /require\s*\(['"]([^'"]+)['"]\)/g;
      const dynamicImportRegex = /import\s*\(['"]([^'"]+)['"]\)/g;
      
      let match;
      while ((match = importRegex.exec(content)) !== null) {
        imports.push(match[1]);
      }
      while ((match = requireRegex.exec(content)) !== null) {
        imports.push(match[1]);
      }
      while ((match = dynamicImportRegex.exec(content)) !== null) {
        imports.push(match[1]);
      }
      
      // Check for dynamic component loading patterns
      DYNAMIC_COMPONENTS.forEach(component => {
        if (content.includes(`'${component}'`) || content.includes(`"${component}"`) || 
            content.includes(`${component}Page`) || content.includes(`${component}.js`)) {
          this.dynamicallyLoaded.add(`src/pages/${component}.js`);
          this.dynamicallyLoaded.add(`src/pages/${component}Page.js`);
          this.dynamicallyLoaded.add(`src/components/${component}.js`);
        }
      });
      
      return imports;
    } catch (error) {
      console.error(`Error reading file ${filePath}:`, error.message);
      return [];
    }
  }

  // NOUVEAU: Détecter les références par nom de fichier
  findFileReferences(filePath) {
    const fileName = path.basename(filePath, path.extname(filePath));
    const references = [];
    
    for (const file of this.allFiles) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        
        // Chercher des références directes au nom du fichier
        if (content.includes(fileName) || content.includes(path.basename(filePath))) {
          references.push(file);
        }
        
        // Chercher des références dans les imports dynamiques
        const dynamicImportRegex = new RegExp(`['"]${fileName}['"]`, 'g');
        if (dynamicImportRegex.test(content)) {
          references.push(file);
        }
        
        // Chercher des références dans les routes
        const routeRegex = new RegExp(`['"]/${fileName}['"]`, 'g');
        if (routeRegex.test(content)) {
          references.push(file);
        }
        
      } catch (error) {
        // Ignorer les erreurs de lecture
      }
    }
    
    return references;
  }

  // NOUVEAU: Analyser les registres de composants
  analyzeComponentRegistries() {
    const registryFiles = [
      'src/components/preview/componentRegistry.js',
      'src/context/TabsContext.js',
      'src/App.js'
    ];
    
    for (const registryFile of registryFiles) {
      if (this.allFiles.has(registryFile)) {
        try {
          const content = fs.readFileSync(registryFile, 'utf8');
          
          // Chercher des objets de mapping de composants
          const componentMapRegex = /(\w+):\s*['"]([^'"]+)['"]/g;
          let match;
          while ((match = componentMapRegex.exec(content)) !== null) {
            const componentName = match[1];
            const componentPath = match[2];
            
            // Résoudre le chemin du composant
            const resolvedPath = this.resolveImportPath(componentPath, registryFile);
            if (this.allFiles.has(resolvedPath)) {
              this.referencedFiles.add(resolvedPath);
            }
          }
          
          // Chercher des imports dynamiques
          const dynamicImportRegex = /import\s*\(['"]([^'"]+)['"]\)/g;
          while ((match = dynamicImportRegex.exec(content)) !== null) {
            const resolvedPath = this.resolveImportPath(match[1], registryFile);
            if (this.allFiles.has(resolvedPath)) {
              this.referencedFiles.add(resolvedPath);
            }
          }
          
        } catch (error) {
          console.error(`Error reading registry file ${registryFile}:`, error.message);
        }
      }
    }
  }

  // NOUVEAU: Analyser les fichiers de configuration
  analyzeConfigFiles() {
    const configFiles = [
      'package.json',
      'craco.config.js',
      'src/config.js',
      'src/config/index.js'
    ];
    
    for (const configFile of configFiles) {
      if (fs.existsSync(configFile)) {
        try {
          const content = fs.readFileSync(configFile, 'utf8');
          
          // Chercher des références aux fichiers dans la config
          for (const file of this.allFiles) {
            const fileName = path.basename(file);
            if (content.includes(fileName)) {
              this.referencedFiles.add(file);
            }
          }
          
        } catch (error) {
          // Ignorer les erreurs
        }
      }
    }
  }

  // NOUVEAU: Analyser les fichiers de test
  analyzeTestFiles() {
    for (const file of this.allFiles) {
      if (file.includes('.test.') || file.includes('.spec.')) {
        try {
          const content = fs.readFileSync(file, 'utf8');
          
          // Chercher des imports dans les fichiers de test
          const imports = this.extractImports(file);
          for (const importPath of imports) {
            const resolvedPath = this.resolveImportPath(importPath, file);
            if (this.allFiles.has(resolvedPath)) {
              this.referencedFiles.add(resolvedPath);
            }
          }
          
        } catch (error) {
          // Ignorer les erreurs
        }
      }
    }
  }

  resolveImportPath(importPath, fromFile) {
    const dir = path.dirname(fromFile);
    
    // Handle @/ alias
    if (importPath.startsWith('@/')) {
      importPath = importPath.replace('@/', 'src/');
    }
    
    // Handle @styles alias
    if (importPath.startsWith('@styles/')) {
      importPath = importPath.replace('@styles/', 'src/styles/');
    }
    
    // Handle relative imports
    if (importPath.startsWith('.')) {
      importPath = path.resolve(dir, importPath);
      importPath = path.relative('.', importPath);
    }
    
    // Add .js extension if missing
    if (!importPath.endsWith('.js') && !importPath.endsWith('.jsx') && 
        !importPath.endsWith('.css') && !importPath.includes('/')) {
      const possiblePaths = [
        `${importPath}.js`,
        `${importPath}.jsx`,
        `${importPath}/index.js`,
        `${importPath}/index.jsx`
      ];
      
      for (const possiblePath of possiblePaths) {
        if (this.allFiles.has(possiblePath)) {
          return possiblePath;
        }
      }
    }
    
    // Try without extension
    if (this.allFiles.has(importPath)) {
      return importPath;
    }
    
    // Try with .js extension
    const withJs = `${importPath}.js`;
    if (this.allFiles.has(withJs)) {
      return withJs;
    }
    
    // Try with .jsx extension
    const withJsx = `${importPath}.jsx`;
    if (this.allFiles.has(withJsx)) {
      return withJsx;
    }
    
    return importPath;
  }

  analyzeImports() {
    // Start with entry points
    const toProcess = [...ENTRY_POINTS];
    const processed = new Set();
    
    console.log('\n📋 Analyse des imports...');
    
    while (toProcess.length > 0) {
      const file = toProcess.pop();
      if (processed.has(file)) continue;
      
      // Check if file exists
      if (!fs.existsSync(file)) {
        console.warn(`⚠️  Point d'entrée non trouvé: ${file}`);
        continue;
      }
      
      processed.add(file);
      this.importedFiles.add(file);
      
      const imports = this.extractImports(file);
      this.fileImports.set(file, imports);
      
      for (const importPath of imports) {
        const resolvedPath = this.resolveImportPath(importPath, file);
        if (this.allFiles.has(resolvedPath) && !processed.has(resolvedPath)) {
          toProcess.push(resolvedPath);
        }
      }
    }
    
    // Add dynamically loaded files and their dependencies
    this.dynamicallyLoaded.forEach(file => {
      if (this.allFiles.has(file) && !processed.has(file)) {
        this.importedFiles.add(file);
        // Also process their imports
        const imports = this.extractImports(file);
        for (const importPath of imports) {
          const resolvedPath = this.resolveImportPath(importPath, file);
          if (this.allFiles.has(resolvedPath)) {
            this.importedFiles.add(resolvedPath);
          }
        }
      }
    });
  }

  // NOUVEAU: Analyse complète des références
  analyzeAllReferences() {
    console.log('\n🔍 Analyse des références supplémentaires...');
    
    // Analyser les registres de composants
    this.analyzeComponentRegistries();
    console.log(`📋 ${this.referencedFiles.size} fichiers référencés dans les registres`);
    
    // Analyser les fichiers de configuration
    this.analyzeConfigFiles();
    
    // Analyser les fichiers de test
    this.analyzeTestFiles();
    
    // Pour chaque fichier potentiellement non utilisé, chercher des références
    const potentiallyUnused = Array.from(this.allFiles).filter(file => 
      !this.importedFiles.has(file) && !this.dynamicallyLoaded.has(file)
    );
    
    console.log(`\n🔎 Vérification des références pour ${potentiallyUnused.length} fichiers...`);
    
    for (const file of potentiallyUnused) {
      const references = this.findFileReferences(file);
      if (references.length > 0) {
        this.referencedFiles.add(file);
        console.log(`  ✅ ${file} référencé dans ${references.length} fichier(s)`);
      }
    }
  }

  getUnusedFiles() {
    const unused = [];
    const potentially = [];
    
    for (const file of this.allFiles) {
      const isImported = this.importedFiles.has(file);
      const isDynamicallyLoaded = this.dynamicallyLoaded.has(file);
      const isReferenced = this.referencedFiles.has(file);
      
      if (!isImported && !isDynamicallyLoaded && !isReferenced) {
        // Catégoriser les fichiers
        if (file.includes('_old') || file.includes('/old/') || file.includes('backup') || 
            file.includes('DateCreationModal') || file.includes('ContactsList_old')) {
          unused.push({
            path: file,
            reason: 'Nom suggère un fichier obsolète',
            confidence: 'high'
          });
        } else if (file.includes('test') || file.includes('example') || file.includes('sample')) {
          potentially.push({
            path: file,
            reason: 'Fichier de test ou d\'exemple',
            confidence: 'medium'
          });
        } else {
          potentially.push({
            path: file,
            reason: 'Non importé, chargé dynamiquement, ou référencé',
            confidence: 'low'
          });
        }
      } else if (isReferenced && !isImported && !isDynamicallyLoaded) {
        potentially.push({
          path: file,
          reason: 'Référencé mais non importé directement',
          confidence: 'very_low'
        });
      }
    }
    
    return { unused, potentially };
  }

  analyze() {
    console.log('🔍 Analyse ENHANCÉE des fichiers non utilisés...\n');
    
    // Collecter tous les fichiers JS
    this.getAllJSFiles('src');
    console.log(`📁 ${this.allFiles.size} fichiers JS/JSX trouvés`);
    
    // Analyser les imports
    this.analyzeImports();
    console.log(`🔗 ${this.importedFiles.size} fichiers importés`);
    console.log(`⚡ ${this.dynamicallyLoaded.size} fichiers chargés dynamiquement`);
    
    // Analyser toutes les références
    this.analyzeAllReferences();
    console.log(`📋 ${this.referencedFiles.size} fichiers référencés par d'autres moyens\n`);
    
    // Identifier les fichiers non utilisés
    const { unused, potentially } = this.getUnusedFiles();
    
    console.log('❌ FICHIERS NON UTILISÉS (haute confiance):');
    console.log('=' .repeat(50));
    if (unused.length === 0) {
      console.log('Aucun fichier clairement non utilisé trouvé.');
    } else {
      unused.forEach(file => {
        console.log(`\n📄 ${file.path}`);
        console.log(`   Raison: ${file.reason}`);
      });
    }
    
    console.log('\n\n⚠️  FICHIERS POTENTIELLEMENT NON UTILISÉS:');
    console.log('=' .repeat(50));
    if (potentially.length === 0) {
      console.log('Aucun fichier potentiellement non utilisé trouvé.');
    } else {
      potentially.forEach(file => {
        console.log(`\n📄 ${file.path}`);
        console.log(`   Raison: ${file.reason}`);
        console.log(`   Confiance: ${file.confidence}`);
      });
    }
    
    console.log('\n\n📊 RÉSUMÉ:');
    console.log('=' .repeat(50));
    console.log(`Total fichiers: ${this.allFiles.size}`);
    console.log(`Fichiers importés: ${this.importedFiles.size}`);
    console.log(`Fichiers chargés dynamiquement: ${this.dynamicallyLoaded.size}`);
    console.log(`Fichiers référencés: ${this.referencedFiles.size}`);
    console.log(`Fichiers non utilisés (haute confiance): ${unused.length}`);
    console.log(`Fichiers potentiellement non utilisés: ${potentially.length}`);
    
    // Sauvegarder le rapport
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalFiles: this.allFiles.size,
        importedFiles: this.importedFiles.size,
        dynamicallyLoadedFiles: this.dynamicallyLoaded.size,
        referencedFiles: this.referencedFiles.size,
        unusedFiles: unused.length,
        potentiallyUnused: potentially.length
      },
      unused,
      potentially,
      dynamicallyLoaded: Array.from(this.dynamicallyLoaded),
      referencedFiles: Array.from(this.referencedFiles)
    };
    
    fs.writeFileSync('unused-files-report-enhanced.json', JSON.stringify(report, null, 2));
    console.log('\n📝 Rapport sauvegardé dans unused-files-report-enhanced.json');
  }
}

// Exécuter l'analyse
const analyzer = new EnhancedUnusedFilesAnalyzer();
analyzer.analyze(); 