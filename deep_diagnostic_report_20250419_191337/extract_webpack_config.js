const path = require('path');
const fs = require('fs');

try {
  // Vérifier si le fichier craco.config.js existe
  if (fs.existsSync('./craco.config.js')) {
    console.log("=== ANALYSE DE CRACO.CONFIG.JS ===");
    
    // Charger la configuration craco
    let cracoConfig;
    try {
      cracoConfig = require(path.resolve('./craco.config.js'));
      console.log("✓ craco.config.js chargé avec succès");
      
      // Vérifier la présence d'alias webpack
      if (cracoConfig.webpack && cracoConfig.webpack.alias) {
        console.log("\n=== ALIAS WEBPACK DÉTECTÉS ===");
        Object.entries(cracoConfig.webpack.alias).forEach(([alias, target]) => {
          console.log(`${alias} -> ${target}`);
          
          // Vérifier si le chemin cible existe
          const targetPath = typeof target === 'string' ? target : target.toString();
          if (!fs.existsSync(targetPath.replace('__dirname', '.'))) {
            console.log(`! ATTENTION: Le chemin cible ${targetPath} pourrait ne pas exister`);
          }
        });
      } else {
        console.log("! Aucun alias webpack défini dans craco.config.js");
      }
      
      // Vérifier la présence d'autres configurations webpack
      if (cracoConfig.webpack) {
        const webpackKeys = Object.keys(cracoConfig.webpack).filter(k => k !== 'alias');
        if (webpackKeys.length > 0) {
          console.log("\n=== AUTRES CONFIGURATIONS WEBPACK ===");
          console.log(`Clés configurées: ${webpackKeys.join(', ')}`);
        }
      }
      
    } catch (error) {
      console.log(`! ERREUR lors du chargement de craco.config.js: ${error.message}`);
      const cracoContent = fs.readFileSync('./craco.config.js', 'utf8');
      console.log("\nContenu du fichier:\n```\n" + cracoContent + "\n```");
    }
  } else {
    console.log("! Fichier craco.config.js non trouvé");
  }
  
  // Vérifier jsconfig.json
  if (fs.existsSync('./jsconfig.json')) {
    console.log("\n=== ANALYSE DE JSCONFIG.JSON ===");
    
    let jsConfig;
    try {
      jsConfig = JSON.parse(fs.readFileSync('./jsconfig.json', 'utf8'));
      console.log("✓ jsconfig.json chargé avec succès");
      
      // Vérifier les paths
      if (jsConfig.compilerOptions && jsConfig.compilerOptions.paths) {
        console.log("\n=== PATHS JSCONFIG DÉTECTÉS ===");
        Object.entries(jsConfig.compilerOptions.paths).forEach(([alias, targets]) => {
          console.log(`${alias} -> ${targets.join(', ')}`);
        });
        
        // Vérifier la cohérence avec craco.config.js
        if (cracoConfig && cracoConfig.webpack && cracoConfig.webpack.alias) {
          console.log("\n=== COHÉRENCE AVEC CRACO.CONFIG.JS ===");
          
          const cracoAliases = Object.keys(cracoConfig.webpack.alias);
          const jsConfigAliases = Object.keys(jsConfig.compilerOptions.paths);
          
          // Recherche des différences
          const differences = [];
          
          // Vérifier les alias présents dans jsconfig mais pas dans craco
          jsConfigAliases.forEach(alias => {
            const baseAlias = alias.endsWith('/*') ? alias.slice(0, -2) : alias;
            if (!cracoAliases.includes(baseAlias) && !cracoAliases.includes(`${baseAlias}/*`)) {
              differences.push(`! Alias "${alias}" présent dans jsconfig.json mais pas dans craco.config.js`);
            }
          });
          
          // Vérifier les alias présents dans craco mais pas dans jsconfig
          cracoAliases.forEach(alias => {
            const baseAlias = alias.endsWith('/*') ? alias.slice(0, -2) : alias;
            if (!jsConfigAliases.includes(baseAlias) && !jsConfigAliases.includes(`${baseAlias}/*`)) {
              differences.push(`! Alias "${alias}" présent dans craco.config.js mais pas dans jsconfig.json`);
            }
          });
          
          // Vérifier les différences de format (/* vs sans /*)
          const commonAliasesBase = cracoAliases
            .map(a => a.endsWith('/*') ? a.slice(0, -2) : a)
            .filter(a => jsConfigAliases.includes(a) || jsConfigAliases.includes(`${a}/*`));
          
          commonAliasesBase.forEach(baseAlias => {
            const cracoHasStar = cracoAliases.includes(`${baseAlias}/*`);
            const jsConfigHasStar = jsConfigAliases.includes(`${baseAlias}/*`);
            
            if (cracoHasStar !== jsConfigHasStar) {
              differences.push(`! Format d'alias différent: "${baseAlias}" avec /* dans ${cracoHasStar ? 'craco' : 'jsconfig'} mais pas dans ${cracoHasStar ? 'jsconfig' : 'craco'}`);
            }
          });
          
          if (differences.length > 0) {
            console.log("\n=== DIFFÉRENCES DÉTECTÉES ===");
            differences.forEach(diff => console.log(diff));
          } else {
            console.log("✓ Les alias sont cohérents entre craco.config.js et jsconfig.json");
          }
        }
      } else {
        console.log("! Aucun path défini dans jsconfig.json");
      }
      
    } catch (error) {
      console.log(`! ERREUR lors du chargement de jsconfig.json: ${error.message}`);
      const jsConfigContent = fs.readFileSync('./jsconfig.json', 'utf8');
      console.log("\nContenu du fichier:\n```\n" + jsConfigContent + "\n```");
    }
  } else {
    console.log("! Fichier jsconfig.json non trouvé");
  }
  
} catch (error) {
  console.error("Erreur globale:", error.message);
}
