#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

class ComprehensiveFileVerifier {
  constructor() {
    this.allFiles = this.getAllJSFiles('src');
    this.verificationResults = [];
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

  // 1. Vérifier les imports statiques
  checkStaticImports(filePath) {
    const fileName = path.basename(filePath, path.extname(filePath));
    const fileNameWithExt = path.basename(filePath);
    
    for (const file of this.allFiles) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        
        // Import statements
        const importRegex = new RegExp(`import.*['"]${fileName}['"]`, 'g');
        if (importRegex.test(content)) {
          return { found: true, type: 'import_statique', file };
        }
        
        // Require statements
        const requireRegex = new RegExp(`require.*['"]${fileName}['"]`, 'g');
        if (requireRegex.test(content)) {
          return { found: true, type: 'require', file };
        }
      } catch (error) {
        // Ignorer les erreurs
      }
    }
    return { found: false };
  }

  // 2. Vérifier les imports dynamiques
  checkDynamicImports(filePath) {
    const fileName = path.basename(filePath, path.extname(filePath));
    
    for (const file of this.allFiles) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        
        const dynamicImportRegex = new RegExp(`import\\s*\\(['"]${fileName}['"]\\)`, 'g');
        if (dynamicImportRegex.test(content)) {
          return { found: true, type: 'import_dynamique', file };
        }
      } catch (error) {
        // Ignorer les erreurs
      }
    }
    return { found: false };
  }

  // 3. Vérifier les références dans les routes
  checkRouteReferences(filePath) {
    const fileName = path.basename(filePath, path.extname(filePath));
    const fileNameWithExt = path.basename(filePath);
    
    const routeFiles = [
      'src/App.js',
      'src/context/TabsContext.js',
      'src/components/preview/componentRegistry.js'
    ];
    
    for (const routeFile of routeFiles) {
      if (fs.existsSync(routeFile)) {
        try {
          const content = fs.readFileSync(routeFile, 'utf8');
          if (content.includes(fileName) || content.includes(fileNameWithExt)) {
            return { found: true, type: 'route', file: routeFile };
          }
        } catch (error) {
          // Ignorer les erreurs
        }
      }
    }
    return { found: false };
  }

  // 4. Vérifier les références dans les tests
  checkTestReferences(filePath) {
    const fileName = path.basename(filePath, path.extname(filePath));
    const fileNameWithExt = path.basename(filePath);
    
    const testFiles = this.allFiles.filter(f => f.includes('.test.') || f.includes('.spec.'));
    
    for (const testFile of testFiles) {
      try {
        const content = fs.readFileSync(testFile, 'utf8');
        if (content.includes(fileName) || content.includes(fileNameWithExt)) {
          return { found: true, type: 'test', file: testFile };
        }
      } catch (error) {
        // Ignorer les erreurs
      }
    }
    return { found: false };
  }

  // 5. Vérifier les références dans la configuration
  checkConfigReferences(filePath) {
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
            return { found: true, type: 'config', file: configFile };
          }
        } catch (error) {
          // Ignorer les erreurs
        }
      }
    }
    return { found: false };
  }

  // 6. Vérifier les usages JSX
  checkJSXUsage(filePath) {
    const fileName = path.basename(filePath, path.extname(filePath));
    
    for (const file of this.allFiles) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        
        // JSX component usage
        const jsxRegex = new RegExp(`<${fileName}[\\s/>]`, 'g');
        if (jsxRegex.test(content)) {
          return { found: true, type: 'jsx_component', file };
        }
        
        // JSX import
        const jsxImportRegex = new RegExp(`import.*${fileName}.*from`, 'g');
        if (jsxImportRegex.test(content)) {
          return { found: true, type: 'jsx_import', file };
        }
      } catch (error) {
        // Ignorer les erreurs
      }
    }
    return { found: false };
  }

  // 7. Vérifier les références dans les registres
  checkRegistryReferences(filePath) {
    const fileName = path.basename(filePath, path.extname(filePath));
    const fileNameWithExt = path.basename(filePath);
    
    const registryFiles = [
      'src/components/preview/componentRegistry.js',
      'src/context/TabsContext.js',
      'src/App.js'
    ];
    
    for (const registryFile of registryFiles) {
      if (fs.existsSync(registryFile)) {
        try {
          const content = fs.readFileSync(registryFile, 'utf8');
          
          // Chercher des objets de mapping de composants
          const componentMapRegex = new RegExp(`['"]${fileName}['"]`, 'g');
          if (componentMapRegex.test(content)) {
            return { found: true, type: 'registry', file: registryFile };
          }
          
          // Chercher des références directes
          if (content.includes(fileName) || content.includes(fileNameWithExt)) {
            return { found: true, type: 'registry_reference', file: registryFile };
          }
        } catch (error) {
          // Ignorer les erreurs
        }
      }
    }
    return { found: false };
  }

  // Vérification complète d'un fichier
  verifyFile(filePath) {
    if (!fs.existsSync(filePath)) {
      return {
        file: filePath,
        exists: false,
        isUsed: false,
        checks: []
      };
    }

    const checks = [
      { name: 'import_statique', result: this.checkStaticImports(filePath) },
      { name: 'require', result: this.checkStaticImports(filePath) }, // Même fonction
      { name: 'import_dynamique', result: this.checkDynamicImports(filePath) },
      { name: 'routes', result: this.checkRouteReferences(filePath) },
      { name: 'tests', result: this.checkTestReferences(filePath) },
      { name: 'config', result: this.checkConfigReferences(filePath) },
      { name: 'jsx', result: this.checkJSXUsage(filePath) },
      { name: 'registres', result: this.checkRegistryReferences(filePath) }
    ];

    const isUsed = checks.some(check => check.result.found);

    return {
      file: filePath,
      exists: true,
      isUsed,
      checks
    };
  }

  // Vérifier tous les fichiers de la liste
  verifyAllFiles(fileList) {
    console.log('🔍 VÉRIFICATION COMPLÈTE DE TOUS LES FICHIERS POTENTIELLEMENT NON UTILISÉS');
    console.log('=' .repeat(80));
    console.log(`📋 Vérification de ${fileList.length} fichiers...\n`);

    const results = [];
    let usedCount = 0;
    let unusedCount = 0;

    for (let i = 0; i < fileList.length; i++) {
      const filePath = fileList[i];
      console.log(`[${i + 1}/${fileList.length}] Vérification de: ${filePath}`);
      
      const result = this.verifyFile(filePath);
      results.push(result);

      if (result.isUsed) {
        usedCount++;
        console.log(`   ✅ UTILISÉ - Trouvé dans:`);
        result.checks.forEach(check => {
          if (check.result.found) {
            console.log(`      - ${check.name}: ${check.result.file} (${check.result.type})`);
          }
        });
      } else {
        unusedCount++;
        console.log(`   ❌ NON UTILISÉ - Aucune référence trouvée`);
      }
      console.log('');
    }

    // Résumé
    console.log('📊 RÉSUMÉ DE LA VÉRIFICATION');
    console.log('=' .repeat(50));
    console.log(`Total fichiers vérifiés: ${results.length}`);
    console.log(`Fichiers utilisés: ${usedCount}`);
    console.log(`Fichiers non utilisés: ${unusedCount}`);

    // Fichiers non utilisés confirmés
    const unusedFiles = results.filter(r => !r.isUsed && r.exists);
    if (unusedFiles.length > 0) {
      console.log('\n❌ FICHIERS CONFIRMÉS NON UTILISÉS:');
      unusedFiles.forEach(file => {
        console.log(`  - ${file.file}`);
      });
    }

    // Sauvegarder les résultats
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalFiles: results.length,
        usedFiles: usedCount,
        unusedFiles: unusedCount
      },
      results: results.map(r => ({
        file: r.file,
        exists: r.exists,
        isUsed: r.isUsed,
        checks: r.checks.map(c => ({
          name: c.name,
          found: c.result.found,
          details: c.result.found ? `${c.result.type}: ${c.result.file}` : null
        }))
      }))
    };

    fs.writeFileSync('comprehensive-verification-report.json', JSON.stringify(report, null, 2));
    console.log('\n📝 Rapport détaillé sauvegardé dans comprehensive-verification-report.json');

    return results;
  }
}

// Utilisation du script
if (require.main === module) {
  const verifier = new ComprehensiveFileVerifier();
  
  // Lire la liste des fichiers depuis le rapport
  if (fs.existsSync('unused-files-report.json')) {
    const report = JSON.parse(fs.readFileSync('unused-files-report.json', 'utf8'));
    
    // Prendre tous les fichiers potentiellement non utilisés
    const filesToVerify = report.potentially.map(f => f.path);
    
    console.log(`Vérification de ${filesToVerify.length} fichiers potentiellement non utilisés...`);
    verifier.verifyAllFiles(filesToVerify);
  } else {
    console.log('Rapport unused-files-report.json non trouvé. Exécutez d\'abord analyze-unused-files-enhanced.js');
  }
}

module.exports = ComprehensiveFileVerifier; 