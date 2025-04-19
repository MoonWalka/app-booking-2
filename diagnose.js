const fs = require('fs');
const path = require('path');

// Fonction pour lire le contenu d'un fichier
function readFile(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    return null;
  }
}

// Fonction pour trouver tous les fichiers JS et JSX
function findJsFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      findJsFiles(filePath, fileList);
    } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Fonction pour rechercher les imports problématiques
function findProblematicImports(filePath) {
  const content = readFile(filePath);
  if (!content) return null;
  
  // Rechercher les imports vides
  const emptyImportRegex = /import\s+{}\s+from/g;
  const hasEmptyImport = emptyImportRegex.test(content);
  
  // Rechercher les imports de firebaseService
  const firebaseServiceImportRegex = /from\s+['"].*firebaseService['"]/g;
  const firebaseServiceImports = content.match(firebaseServiceImportRegex);
  
  if (hasEmptyImport || firebaseServiceImports) {
    return {
      filePath,
      hasEmptyImport,
      firebaseServiceImports
    };
  }
  
  return null;
}

// Point d'entrée
const srcDir = path.join(__dirname, 'src');
const jsFiles = findJsFiles(srcDir);
const problemFiles = jsFiles
  .map(findProblematicImports)
  .filter(result => result !== null);

console.log('Fichiers avec des imports problématiques:');
console.log(JSON.stringify(problemFiles, null, 2));
