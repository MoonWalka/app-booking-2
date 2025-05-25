const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Fonction pour scanner un répertoire et trouver des fichiers correspondant à un motif
function scanDir(dir, pattern) {
  const results = [];
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      results.push(...scanDir(fullPath, pattern));
    } else if (pattern.test(file)) {
      results.push(fullPath);
    }
  }
  return results;
}

// Fonction pour trouver les imports d'un fichier
function findImports(file, identifier) {
  const content = fs.readFileSync(file, 'utf-8');
  const regex = new RegExp(`import.*${identifier}.*from`, 'g');
  return content.match(regex) || [];
}

// Fonction pour récupérer l'historique Git d'un fichier
function gitHistory(file) {
  try {
    const history = execSync(`git log --pretty=format:'%h - %an, %ar : %s' -- ${file}`, {
      encoding: 'utf-8',
    });
    return history.split('\n');
  } catch (err) {
    return [`Erreur lors de la récupération de l'historique Git pour ${file}`];
  }
}

// Helper to run shell commands
function runCommand(command) {
  try {
    return execSync(command, { encoding: 'utf-8' }).trim();
  } catch (error) {
    return error.message;
  }
}

// Check for path="/programmateurs/*" in src/App.js
function checkProgrammateursWildcard() {
  const appJsPath = path.resolve(__dirname, '../src/App.js');
  const content = fs.readFileSync(appJsPath, 'utf-8');
  return content.includes('path="/programmateurs/*"');
}

// Check useGenericEntityDetails in src/pages/ProgrammateursPage.js
function checkUseGenericEntityDetails() {
  const pagePath = path.resolve(__dirname, '../src/pages/ProgrammateursPage.js');
  const content = fs.readFileSync(pagePath, 'utf-8');
  return content.includes('useGenericEntityDetails(');
}

// Check for React.lazy and REST calls in ProgrammateurDetails.js
function checkProgrammateurDetails() {
  const detailsPath = path.resolve(__dirname, '../src/components/programmateurs/ProgrammateurDetails.js');
  const content = fs.readFileSync(detailsPath, 'utf-8');
  const hasLazy = content.includes('React.lazy');
  const hasRestCall = content.includes('fetch(\'https://firestore.googleapis.com');
  return { hasLazy, hasRestCall };
}

// Search for REST calls or settings disabling SSL
function searchRestCalls() {
  const restCalls = runCommand('git grep -E "fetch\\(\\\'https://firestore.googleapis.com|settings\\(\\{ host:"');
  return restCalls;
}

// Get git history for specific files
function getGitHistory(filePath) {
  return runCommand(`git log --pretty=format:'%h - %an, %ar : %s' -- ${filePath}`);
}

(async () => {
  const report = [];

  // Scanner les fichiers stabilizer et similaires
  const stabilizers = scanDir('src', /stabilizer|parametres|emulator/i);

  for (const file of stabilizers) {
    const imports = findImports(file, path.basename(file, '.js'));
    const history = gitHistory(file);
    report.push({ file, imports, history });
  }

  // Générer le rapport Markdown
  const reportContent = ['# Audit Complet\n'];

  for (const entry of report) {
    reportContent.push(`## Fichier : ${entry.file}`);
    reportContent.push('### Imports détectés :');
    reportContent.push(entry.imports.length ? entry.imports.join('\n') : 'Aucun import détecté');
    reportContent.push('### Historique Git :');
    reportContent.push(entry.history.join('\n'));
    reportContent.push('\n');
  }

  fs.writeFileSync('audit-complet.md', reportContent.join('\n'));
  console.log('Rapport généré : audit-complet.md');
})();

// Main audit function
function audit() {
  const results = {
    programmateursWildcard: checkProgrammateursWildcard(),
    useGenericEntityDetails: checkUseGenericEntityDetails(),
    programmateurDetails: checkProgrammateurDetails(),
    restCalls: searchRestCalls(),
    gitHistory: {
      appJs: getGitHistory('src/App.js'),
      programmateursPage: getGitHistory('src/pages/ProgrammateursPage.js'),
      programmateurDetails: getGitHistory('src/components/programmateurs/ProgrammateurDetails.js')
    }
  };

  console.log('Audit Results:\n');

  // Report results
  console.log('✅ OK / ❌ À corriger\n');

  console.log('1. Route path="/programmateurs/*" in App.js:');
  console.log(results.programmateursWildcard ? '✅ OK' : '❌ À corriger');

  console.log('\n2. useGenericEntityDetails in ProgrammateursPage.js:');
  console.log(results.useGenericEntityDetails ? '✅ OK' : '❌ À corriger');

  console.log('\n3. React.lazy and REST calls in ProgrammateurDetails.js:');
  console.log(results.programmateurDetails.hasLazy ? '❌ React.lazy found' : '✅ No React.lazy');
  console.log(results.programmateurDetails.hasRestCall ? '❌ REST call found' : '✅ No REST call');

  console.log('\n4. REST calls or settings disabling SSL:');
  console.log(results.restCalls ? `❌ Found:\n${results.restCalls}` : '✅ None found');

  console.log('\n5. Git history for files:');
  console.log('App.js:\n', results.gitHistory.appJs);
  console.log('\nProgrammateursPage.js:\n', results.gitHistory.programmateursPage);
  console.log('\nProgrammateurDetails.js:\n', results.gitHistory.programmateurDetails);
}

audit();