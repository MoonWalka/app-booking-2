const fs = require('fs');
const path = require('path');

try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const dependencies = packageJson.dependencies || {};
  const devDependencies = packageJson.devDependencies || {};
  const scripts = packageJson.scripts || {};
  
  // Vérification des versions React
  const reactVersion = dependencies.react;
  const reactDomVersion = dependencies['react-dom'];
  const cracoVersion = dependencies['@craco/craco'];
  const reactScriptsVersion = dependencies['react-scripts'];
  const firebaseVersion = dependencies.firebase;
  
  console.log("=== ANALYSE DES DÉPENDANCES ===");
  console.log(`React: ${reactVersion}`);
  console.log(`React DOM: ${reactDomVersion}`);
  console.log(`CRACO: ${cracoVersion}`);
  console.log(`React Scripts: ${reactScriptsVersion}`);
  console.log(`Firebase: ${firebaseVersion}`);
  
  // Vérification des compatibilités
  const issues = [];
  
  // Vérifier compatibilité React/React DOM
  if (reactVersion && reactDomVersion) {
    const reactMajor = reactVersion.match(/^\^?(\d+)\./)[1];
    const reactDomMajor = reactDomVersion.match(/^\^?(\d+)\./)[1];
    if (reactMajor !== reactDomMajor) {
      issues.push(`Incompatibilité: React v${reactMajor}.x avec React DOM v${reactDomMajor}.x`);
    }
  }
  
  // Vérifier compatibilité CRACO/React Scripts
  if (cracoVersion && reactScriptsVersion) {
    const cracoMajor = cracoVersion.match(/^\^?(\d+)\./)[1];
    const reactScriptsMajor = reactScriptsVersion.match(/^\^?(\d+)\./)[1];
    
    if (cracoMajor === '7' && reactScriptsMajor !== '5') {
      issues.push(`Incompatibilité: CRACO v7.x nécessite React Scripts v5.x`);
    } else if (cracoMajor === '6' && reactScriptsMajor !== '4') {
      issues.push(`Incompatibilité: CRACO v6.x nécessite React Scripts v4.x`);
    } else if (cracoMajor === '5' && reactScriptsMajor !== '3') {
      issues.push(`Incompatibilité: CRACO v5.x nécessite React Scripts v3.x`);
    }
  }
  
  // Vérification du script de build
  const buildScript = scripts.build;
  console.log(`\nScript de build: ${buildScript}`);
  
  if (buildScript && buildScript.includes('craco') && !dependencies['@craco/craco']) {
    issues.push("Le script de build utilise craco mais @craco/craco n'est pas dans les dépendances");
  }
  
  // Résultat
  if (issues.length > 0) {
    console.log("\n=== PROBLÈMES DÉTECTÉS ===");
    issues.forEach(issue => {
      console.log(`! ${issue}`);
    });
  } else {
    console.log("\n✓ Aucun problème de compatibilité détecté dans package.json");
  }
  
  // Analyse des dépendances Firebase
  if (firebaseVersion) {
    console.log("\n=== ANALYSE FIREBASE ===");
    const firebaseMajor = firebaseVersion.match(/^\^?(\d+)\./)[1];
    const firebaseMinor = firebaseVersion.match(/^\^?\d+\.(\d+)\./)[1];
    
    if (firebaseMajor === '9') {
      if (parseInt(firebaseMinor) >= 22) {
        console.log("! Firebase v9.22+ peut avoir des problèmes avec webpack, essayez v9.17.2");
      } else {
        console.log("✓ Version Firebase compatible");
      }
    } else if (parseInt(firebaseMajor) < 9) {
      console.log("! Ancienne version de Firebase (< v9), pourrait causer des incompatibilités");
    }
    
    // Vérification des dépendances Firebase nécessaires
    const neededDeps = ['@firebase/app', '@firebase/firestore', '@firebase/auth', '@firebase/storage'];
    const missingDeps = neededDeps.filter(dep => !dependencies[dep]);
    
    if (firebaseMajor === '9' && missingDeps.length > 0) {
      console.log(`! Firebase v9 pourrait nécessiter ces dépendances: ${missingDeps.join(', ')}`);
    }
  }

} catch (error) {
  console.error("Erreur lors de l'analyse de package.json:", error.message);
}
