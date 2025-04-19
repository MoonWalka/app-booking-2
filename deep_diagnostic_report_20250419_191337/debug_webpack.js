const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Créer une nouvelle configuration temporaire pour webpack
function createTempWebpackConfig() {
  const tempDir = path.resolve('./temp_webpack_debug');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }
  
  // Créer un config webpack qui va enregistrer les erreurs
  const webpackConfigPath = path.join(tempDir, 'webpack.config.js');
  
  fs.writeFileSync(webpackConfigPath, `
const path = require('path');
const fs = require('fs');
const originalConfig = require('../node_modules/react-scripts/config/webpack.config');

module.exports = (webpackEnv) => {
  // Obtenir la configuration originale
  const config = originalConfig(webpackEnv);
  
  // Ajouter des hooks pour intercepter les erreurs
  class ErrorDetectionPlugin {
    apply(compiler) {
      compiler.hooks.done.tap('ErrorDetectionPlugin', stats => {
        if (stats.hasErrors()) {
          const info = stats.toJson();
          fs.writeFileSync(
            path.resolve('./temp_webpack_debug/webpack_errors.json'),
            JSON.stringify(info.errors, null, 2)
          );
        }
      });
      
      // Intercepter les modules résolus
      compiler.hooks.normalModuleFactory.tap('ErrorDetectionPlugin', nmf => {
        nmf.hooks.beforeResolve.tap('ErrorDetectionPlugin', resolveData => {
          if (resolveData && resolveData.request === '') {
            // Enregistrer les demandes vides
            const emptyRequests = require('./empty_requests.json');
            emptyRequests.push({
              context: resolveData.context,
              request: resolveData.request,
              dependencies: resolveData.dependencies.map(d => d.request || '').filter(Boolean)
            });
            fs.writeFileSync(
              path.resolve('./temp_webpack_debug/empty_requests.json'),
              JSON.stringify(emptyRequests, null, 2)
            );
          }
          return resolveData;
        });
      });
    }
  }
  
  // Ajouter notre plugin à la chaîne
  config.plugins.push(new ErrorDetectionPlugin());
  
  return config;
};
  `);
  
  // Initialiser le fichier des requêtes vides
  fs.writeFileSync(
    path.join(tempDir, 'empty_requests.json'),
    '[]'
  );
  
  return tempDir;
}

try {
  console.log("=== PRÉPARATION DE L'INSTRUMENTATION DU BUILD ===");
  const tempDir = createTempWebpackConfig();
  console.log(`Configuration webpack de débogage créée dans ${tempDir}`);
  
  // Créer un script craco temporaire pour utiliser notre config webpack
  const cracoCfgPath = path.join(tempDir, 'craco.config.js');
  let originalCracoCfg = {};
  
  try {
    originalCracoCfg = require('../craco.config.js');
  } catch (e) {
    console.log("Pas de fichier craco.config.js trouvé, création d'une configuration minimale");
  }
  
  fs.writeFileSync(cracoCfgPath, `
const path = require('path');
const originalConfig = ${JSON.stringify(originalCracoCfg, null, 2)};

module.exports = {
  ...originalConfig,
  webpack: {
    ...originalConfig.webpack,
    configure: (webpackConfig, { env, paths }) => {
      // Charger notre configuration personnalisée
      const debugConfig = require('./webpack.config.js')(env);
      
      // Fusionner les configurations
      return {
        ...webpackConfig,
        plugins: [...webpackConfig.plugins, ...debugConfig.plugins.slice(-1)]
      };
    }
  }
};
  `);
  
  console.log("Configuration craco de débogage créée avec succès");
  
  // Exécuter un build limité
  console.log("\n=== EXÉCUTION DU BUILD INSTRUMENTÉ ===");
  console.log("Cette étape peut prendre quelques instants...");
  
  try {
    execSync(`cross-env DISABLE_ESLINT_PLUGIN=true NODE_ENV=production CRACO_CONFIG_PATH=${cracoCfgPath} npx craco build`, {
      stdio: 'inherit',
      timeout: 60000 // 1 minute maximum
    });
    console.log("✓ Build terminé avec succès");
  } catch (error) {
    console.log("✗ Build échoué, analyse des erreurs...");
    
    // Vérifier les erreurs webpack
    const errorsPath = path.join(tempDir, 'webpack_errors.json');
    const emptyRequestsPath = path.join(tempDir, 'empty_requests.json');
    
    if (fs.existsSync(errorsPath)) {
      const errors = JSON.parse(fs.readFileSync(errorsPath, 'utf8'));
      
      console.log("\n=== ERREURS WEBPACK DÉTECTÉES ===");
      errors.forEach((error, index) => {
        console.log(`\nErreur ${index + 1}:`);
        
        if (error.message) {
          console.log(error.message);
        }
        
        if (error.moduleName) {
          console.log(`Module: ${error.moduleName}`);
        }
        
        if (error.loc) {
          console.log(`Localisation: ${error.loc}`);
        }
      });


           
      
      // Vérifier les requêtes vides
      if (fs.existsSync(emptyRequestsPath)) {
        const emptyRequests = JSON.parse(fs.readFileSync(emptyRequestsPath, 'utf8'));
        
        if (emptyRequests.length > 0) {
          console.log("\n=== REQUÊTES VIDES DÉTECTÉES ===");
          console.log(`${emptyRequests.length} requêtes vides identifiées`);
          
          emptyRequests.forEach((req, index) => {
            console.log(`\nRequête vide ${index + 1}:`);
            console.log(`Contexte: ${req.context}`);
            
            if (req.dependencies && req.dependencies.length > 0) {
              console.log(`Dépendances associées: ${req.dependencies.join(', ')}`);
            }
            
            // Analyser le fichier source
            try {
              const sourceFile = req.context.split('!').pop();
              if (fs.existsSync(sourceFile)) {
                const content = fs.readFileSync(sourceFile, 'utf8');
                const lines = content.split('\n');
                
                // Rechercher les imports vides
                const emptyImportLines = lines
                  .map((line, i) => ({ line, index: i }))
                  .filter(({ line }) => line.includes("from ''") || line.includes('from ""'));
                
                if (emptyImportLines.length > 0) {
                  console.log(`Fichier source: ${sourceFile}`);
                  console.log("Imports vides trouvés:");
                  emptyImportLines.forEach(({ line, index }) => {
                    console.log(`  Ligne ${index + 1}: ${line.trim()}`);
                  });
                }
              }
            } catch (e) {
              console.log(`Impossible d'analyser le fichier source: ${e.message}`);
            }
          });
          
          console.log("\n=== SOLUTION RECOMMANDÉE ===");
          console.log("1. Corrigez les imports vides identifiés ci-dessus");
          console.log("2. Remplacez les imports vides par le chemin correct");
          console.log("3. Pour les imports Firebase, utilisez '@firebase' au lieu de @firebase.js ou ''");
        } else {
          console.log("\n✓ Aucune requête vide détectée");
        }
      }
    }
  }
  
  // Analyser l'arbre des modules
  console.log("\n=== ANALYSE DE L'ARBRE DES MODULES ===");
  console.log("Génération d'un graphique des dépendances...");
  
  try {
    execSync('npx madge --extensions js,jsx --image dependency-graph.png src/', {
      stdio: 'inherit'
    });
    console.log("✓ Graphique des dépendances généré: dependency-graph.png");
  } catch (e) {
    console.log(`✗ Impossible de générer le graphique: ${e.message}`);
  }

  // Nettoyer le répertoire temporaire
  console.log("\n=== NETTOYAGE ===");
  execSync(`rm -rf ${tempDir}`);
  console.log("✓ Fichiers temporaires supprimés");
  
  console.log("\n=== RAPPORT D'INSTRUMENTATION ===");
  console.log("Toutes les erreurs et les problèmes identifiés ont été enregistrés");
  console.log("Consultez le journal et les fichiers d'analyse pour plus de détails");
  
} catch (error) {
  console.error("Erreur lors de l'instrumentation:", error.message);
}
