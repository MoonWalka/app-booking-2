#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

class SingleFileVerifier {
  constructor() {
    this.allFiles = this.getAllJSFiles('src');
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

  verifyFile(filePath) {
    if (!fs.existsSync(filePath)) {
      console.log(`❌ Fichier non trouvé: ${filePath}`);
      return false;
    }

    const fileName = path.basename(filePath, path.extname(filePath));
    const fileNameWithExt = path.basename(filePath);
    
    console.log(`🔍 Vérification complète de: ${filePath}`);
    console.log('=' .repeat(60));
    
    let isUsed = false;
    const usageDetails = [];

    // 1. Vérifier les imports statiques
    console.log('\n1️⃣  Vérification des imports statiques...');
    for (const file of this.allFiles) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        
        // Import statements
        const importRegex = new RegExp(`import.*['"]${fileName}['"]`, 'g');
        if (importRegex.test(content)) {
          usageDetails.push({ type: 'import_statique', file, line: this.findLineNumber(content, fileName) });
          isUsed = true;
          console.log(`   ✅ Trouvé dans: ${file}`);
        }
        
        // Require statements
        const requireRegex = new RegExp(`require.*['"]${fileName}['"]`, 'g');
        if (requireRegex.test(content)) {
          usageDetails.push({ type: 'require', file, line: this.findLineNumber(content, fileName) });
          isUsed = true;
          console.log(`   ✅ Trouvé dans: ${file}`);
        }
      } catch (error) {
        // Ignorer les erreurs
      }
    }
    
    if (!isUsed) {
      console.log('   ❌ Aucun import statique trouvé');
    }

    // 2. Vérifier les imports dynamiques
    console.log('\n2️⃣  Vérification des imports dynamiques...');
    let dynamicFound = false;
    for (const file of this.allFiles) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        
        const dynamicImportRegex = new RegExp(`import\\s*\\(['"]${fileName}['"]\\)`, 'g');
        if (dynamicImportRegex.test(content)) {
          usageDetails.push({ type: 'import_dynamique', file, line: this.findLineNumber(content, fileName) });
          isUsed = true;
          dynamicFound = true;
          console.log(`   ✅ Trouvé dans: ${file}`);
        }
      } catch (error) {
        // Ignorer les erreurs
      }
    }
    
    if (!dynamicFound) {
      console.log('   ❌ Aucun import dynamique trouvé');
    }

    // 3. Vérifier les usages JSX
    console.log('\n3️⃣  Vérification des usages JSX...');
    let jsxFound = false;
    for (const file of this.allFiles) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        
        // JSX component usage
        const jsxRegex = new RegExp(`<${fileName}[\\s/>]`, 'g');
        if (jsxRegex.test(content)) {
          usageDetails.push({ type: 'jsx_component', file, line: this.findLineNumber(content, `<${fileName}`) });
          isUsed = true;
          jsxFound = true;
          console.log(`   ✅ Trouvé dans: ${file}`);
        }
      } catch (error) {
        // Ignorer les erreurs
      }
    }
    
    if (!jsxFound) {
      console.log('   ❌ Aucun usage JSX trouvé');
    }

    // 4. Vérifier les références dans les routes
    console.log('\n4️⃣  Vérification des références dans les routes...');
    const routeFiles = [
      'src/App.js',
      'src/context/TabsContext.js',
      'src/components/preview/componentRegistry.js'
    ];
    
    let routeFound = false;
    for (const routeFile of routeFiles) {
      if (fs.existsSync(routeFile)) {
        try {
          const content = fs.readFileSync(routeFile, 'utf8');
          if (content.includes(fileName) || content.includes(fileNameWithExt)) {
            usageDetails.push({ type: 'route', file: routeFile, line: this.findLineNumber(content, fileName) });
            isUsed = true;
            routeFound = true;
            console.log(`   ✅ Trouvé dans: ${routeFile}`);
          }
        } catch (error) {
          // Ignorer les erreurs
        }
      }
    }
    
    if (!routeFound) {
      console.log('   ❌ Aucune référence dans les routes');
    }

    // 5. Vérifier les références dans les tests
    console.log('\n5️⃣  Vérification des références dans les tests...');
    const testFiles = this.allFiles.filter(f => f.includes('.test.') || f.includes('.spec.'));
    
    let testFound = false;
    for (const testFile of testFiles) {
      try {
        const content = fs.readFileSync(testFile, 'utf8');
        if (content.includes(fileName) || content.includes(fileNameWithExt)) {
          usageDetails.push({ type: 'test', file: testFile, line: this.findLineNumber(content, fileName) });
          isUsed = true;
          testFound = true;
          console.log(`   ✅ Trouvé dans: ${testFile}`);
        }
      } catch (error) {
        // Ignorer les erreurs
      }
    }
    
    if (!testFound) {
      console.log('   ❌ Aucune référence dans les tests');
    }

    // 6. Vérifier les références dans la configuration
    console.log('\n6️⃣  Vérification des références dans la configuration...');
    const configFiles = [
      'package.json',
      'craco.config.js',
      'src/config.js',
      'src/config/index.js'
    ];
    
    let configFound = false;
    for (const configFile of configFiles) {
      if (fs.existsSync(configFile)) {
        try {
          const content = fs.readFileSync(configFile, 'utf8');
          if (content.includes(fileName) || content.includes(fileNameWithExt)) {
            usageDetails.push({ type: 'config', file: configFile, line: this.findLineNumber(content, fileName) });
            isUsed = true;
            configFound = true;
            console.log(`   ✅ Trouvé dans: ${configFile}`);
          }
        } catch (error) {
          // Ignorer les erreurs
        }
      }
    }
    
    if (!configFound) {
      console.log('   ❌ Aucune référence dans la configuration');
    }

    // 7. Analyser le contenu du fichier
    console.log('\n7️⃣  Analyse du contenu du fichier...');
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Vérifier les exports
      const exports = content.match(/export.*/g) || [];
      const hasDefaultExport = content.includes('export default');
      
      console.log(`   📄 Exports: ${exports.length}`);
      console.log(`   📄 Export par défaut: ${hasDefaultExport ? 'Oui' : 'Non'}`);
      
      if (exports.length > 0) {
        console.log(`   📄 Types d'exports: ${exports.map(e => e.trim()).join(', ')}`);
      }
      
    } catch (error) {
      console.log(`   ❌ Erreur lors de la lecture du fichier: ${error.message}`);
    }

    // Résumé
    console.log('\n' + '=' .repeat(60));
    console.log(`📊 RÉSUMÉ: ${isUsed ? 'UTILISÉ' : 'NON UTILISÉ'}`);
    console.log('=' .repeat(60));
    
    if (isUsed) {
      console.log(`✅ Le fichier est utilisé dans ${usageDetails.length} endroit(s):`);
      usageDetails.forEach(detail => {
        console.log(`   - ${detail.type}: ${detail.file} (ligne ~${detail.line})`);
      });
    } else {
      console.log('❌ Le fichier ne semble pas être utilisé');
      console.log('💡 Recommandation: Vous pouvez probablement le supprimer en toute sécurité');
    }

    return isUsed;
  }

  findLineNumber(content, searchTerm) {
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes(searchTerm)) {
        return i + 1;
      }
    }
    return '?';
  }
}

// Utilisation du script
if (require.main === module) {
  const filePath = process.argv[2];
  
  if (!filePath) {
    console.log('Usage: node scripts/verify-single-file.js <chemin/vers/fichier>');
    console.log('Exemple: node scripts/verify-single-file.js src/components/mon/Composant.js');
    process.exit(1);
  }
  
  const verifier = new SingleFileVerifier();
  verifier.verifyFile(filePath);
}

module.exports = SingleFileVerifier; 