#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

class UnusedFilesVerifier {
  constructor() {
    this.verificationResults = [];
  }

  // Vérifier si un fichier est utilisé dans les routes
  checkRouteUsage(filePath) {
    const fileName = path.basename(filePath, path.extname(filePath));
    const routeFiles = [
      'src/App.js',
      'src/context/TabsContext.js',
      'src/components/preview/componentRegistry.js'
    ];
    
    for (const routeFile of routeFiles) {
      if (fs.existsSync(routeFile)) {
        const content = fs.readFileSync(routeFile, 'utf8');
        if (content.includes(fileName) || content.includes(path.basename(filePath))) {
          return { used: true, foundIn: routeFile, type: 'route' };
        }
      }
    }
    return { used: false };
  }

  // Vérifier si un fichier est utilisé dans les imports dynamiques
  checkDynamicImportUsage(filePath) {
    const fileName = path.basename(filePath, path.extname(filePath));
    const fileNameWithExt = path.basename(filePath);
    
    // Chercher dans tous les fichiers JS
    const jsFiles = this.getAllJSFiles('src');
    
    for (const jsFile of jsFiles) {
      try {
        const content = fs.readFileSync(jsFile, 'utf8');
        
        // Chercher des imports dynamiques
        const dynamicImportRegex = new RegExp(`import\\s*\\(['"]${fileName}['"]\\)`, 'g');
        if (dynamicImportRegex.test(content)) {
          return { used: true, foundIn: jsFile, type: 'dynamic_import' };
        }
        
        // Chercher des références dans les chaînes
        const stringRefRegex = new RegExp(`['"]${fileName}['"]`, 'g');
        if (stringRefRegex.test(content)) {
          return { used: true, foundIn: jsFile, type: 'string_reference' };
        }
        
      } catch (error) {
        // Ignorer les erreurs
      }
    }
    return { used: false };
  }

  // Vérifier si un fichier est utilisé dans les tests
  checkTestUsage(filePath) {
    const fileName = path.basename(filePath, path.extname(filePath));
    const testFiles = this.getAllJSFiles('src').filter(f => f.includes('.test.') || f.includes('.spec.'));
    
    for (const testFile of testFiles) {
      try {
        const content = fs.readFileSync(testFile, 'utf8');
        if (content.includes(fileName) || content.includes(path.basename(filePath))) {
          return { used: true, foundIn: testFile, type: 'test' };
        }
      } catch (error) {
        // Ignorer les erreurs
      }
    }
    return { used: false };
  }

  // Vérifier si un fichier est utilisé dans les configurations
  checkConfigUsage(filePath) {
    const fileName = path.basename(filePath);
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
          if (content.includes(fileName)) {
            return { used: true, foundIn: configFile, type: 'config' };
          }
        } catch (error) {
          // Ignorer les erreurs
        }
      }
    }
    return { used: false };
  }

  // Vérifier si un fichier est un composant React utilisé dans JSX
  checkJSXUsage(filePath) {
    const fileName = path.basename(filePath, path.extname(filePath));
    const jsxFiles = this.getAllJSFiles('src').filter(f => f.endsWith('.jsx') || f.includes('components/'));
    
    for (const jsxFile of jsxFiles) {
      try {
        const content = fs.readFileSync(jsxFile, 'utf8');
        
        // Chercher des balises JSX avec le nom du composant
        const jsxRegex = new RegExp(`<${fileName}[\\s/>]`, 'g');
        if (jsxRegex.test(content)) {
          return { used: true, foundIn: jsxFile, type: 'jsx_component' };
        }
        
        // Chercher des imports du composant
        const importRegex = new RegExp(`import.*${fileName}.*from`, 'g');
        if (importRegex.test(content)) {
          return { used: true, foundIn: jsxFile, type: 'jsx_import' };
        }
        
      } catch (error) {
        // Ignorer les erreurs
      }
    }
    return { used: false };
  }

  getAllJSFiles(dir) {
    const files = [];
    
    function scan(directory) {
      try {
        const items = fs.readdirSync(directory);
        for (const item of items) {
          const fullPath = path.join(directory, item);
          const stat = fs.statSync(fullPath);
          
          if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
            scan(fullPath);
          } else if (item.endsWith('.js') || item.endsWith('.jsx')) {
            files.push(fullPath);
          }
        }
      } catch (error) {
        // Ignorer les erreurs
      }
    }
    
    scan(dir);
    return files;
  }

  // Vérification complète d'un fichier
  verifyFile(filePath) {
    console.log(`\n🔍 Vérification de: ${filePath}`);
    
    const results = {
      file: filePath,
      routeUsage: this.checkRouteUsage(filePath),
      dynamicImportUsage: this.checkDynamicImportUsage(filePath),
      testUsage: this.checkTestUsage(filePath),
      configUsage: this.checkConfigUsage(filePath),
      jsxUsage: this.checkJSXUsage(filePath)
    };
    
    const isUsed = Object.values(results).some(result => 
      typeof result === 'object' && result.used
    );
    
    if (isUsed) {
      console.log(`  ✅ UTILISÉ - Trouvé dans:`);
      Object.entries(results).forEach(([type, result]) => {
        if (typeof result === 'object' && result.used) {
          console.log(`    - ${type}: ${result.foundIn} (${result.type})`);
        }
      });
    } else {
      console.log(`  ❌ NON UTILISÉ - Aucune référence trouvée`);
    }
    
    return {
      file: filePath,
      isUsed,
      details: results
    };
  }

  // Vérifier une liste de fichiers
  verifyFiles(fileList) {
    console.log('🔍 VÉRIFICATION MANUELLE DES FICHIERS POTENTIELLEMENT NON UTILISÉS\n');
    console.log('=' .repeat(80));
    
    const results = [];
    
    for (const filePath of fileList) {
      if (fs.existsSync(filePath)) {
        const result = this.verifyFile(filePath);
        results.push(result);
      } else {
        console.log(`\n⚠️  Fichier non trouvé: ${filePath}`);
      }
    }
    
    // Résumé
    const usedFiles = results.filter(r => r.isUsed);
    const unusedFiles = results.filter(r => !r.isUsed);
    
    console.log('\n\n📊 RÉSUMÉ DE LA VÉRIFICATION:');
    console.log('=' .repeat(50));
    console.log(`Fichiers vérifiés: ${results.length}`);
    console.log(`Fichiers utilisés: ${usedFiles.length}`);
    console.log(`Fichiers non utilisés: ${unusedFiles.length}`);
    
    if (unusedFiles.length > 0) {
      console.log('\n❌ FICHIERS CONFIRMÉS NON UTILISÉS:');
      unusedFiles.forEach(file => {
        console.log(`  - ${file.file}`);
      });
    }
    
    return results;
  }
}

// Utilisation du script
if (require.main === module) {
  const verifier = new UnusedFilesVerifier();
  
  // Lire la liste des fichiers depuis le rapport
  if (fs.existsSync('unused-files-report.json')) {
    const report = JSON.parse(fs.readFileSync('unused-files-report.json', 'utf8'));
    
    // Prendre les premiers fichiers potentiellement non utilisés pour vérification
    const filesToVerify = report.potentially.slice(0, 20).map(f => f.path);
    
    console.log(`Vérification des ${filesToVerify.length} premiers fichiers potentiellement non utilisés...`);
    verifier.verifyFiles(filesToVerify);
  } else {
    console.log('Rapport unused-files-report.json non trouvé. Exécutez d\'abord analyze-unused-files.js');
  }
}

module.exports = UnusedFilesVerifier; 