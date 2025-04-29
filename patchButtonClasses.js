// patchButtonClasses.js
// Script pour remplacer les classes btn Bootstrap par tc-btn-* dans tous les fichiers spécifiés

const fs = require('fs');
const path = require('path');

// Liste des remplacements à effectuer
const classReplacements = [
  {
    from: /\bbtn btn-primary\b/g,
    to: 'tc-btn-primary'
  },
  {
    from: /\bbtn btn-outline-primary\b/g,
    to: 'tc-btn-outline-primary'
  },
  {
    from: /\bbtn btn-outline-secondary\b/g,
    to: 'tc-btn-outline-secondary'
  },
  {
    from: /\bbtn btn-outline-danger\b/g,
    to: 'tc-btn-outline-danger'
  },
  {
    from: /\bbtn btn-outline-success\b/g,
    to: 'tc-btn-outline-success'
  },
  {
    from: /\bbtn btn-outline-warning\b/g,
    to: 'tc-btn-outline-warning'
  },
  {
    from: /\bbtn btn-outline-info\b/g,
    to: 'tc-btn-outline-info'
  },
  {
    from: /\bbtn btn-light\b/g,
    to: 'tc-btn-light'
  },
  {
    from: /\bbtn btn-secondary\b/g,
    to: 'tc-btn-secondary'
  },
  {
    from: /\bbtn btn-danger\b/g,
    to: 'tc-btn-danger'
  },
  {
    from: /\bbtn btn-success\b/g,
    to: 'tc-btn-success'
  },
  {
    from: /\bbtn btn-dark\b/g,
    to: 'tc-btn-dark'
  },
  {
    from: /\bbtn btn-info\b/g,
    to: 'tc-btn-info'
  }
];

// Liste des fichiers à modifier
const filesToPatch = [
  'src/pages/contratTemplatesEditPage.js',
  'src/pages/FormResponsePage.js',
  'src/pages/LoginPage.js',
  'src/pages/ContratDetailsPage.js',
  'src/components/structures/mobile/StructureDetails.js',
  'src/components/structures/mobile/StructuresList.js',
  'src/components/structures/desktop/StructuresList.js',
  'src/components/common/Modal.js',
  'src/components/artistes/mobile/ArtisteForm.js'
];

// Fonction pour remplacer les classes dans un fichier
function patchFile(filePath) {
  try {
    const fullPath = path.resolve(process.cwd(), filePath);
    
    // Lire le contenu du fichier
    let content = fs.readFileSync(fullPath, 'utf8');
    let originalContent = content;
    let replacementCount = 0;
    
    // Appliquer les remplacements
    classReplacements.forEach(replacement => {
      const matches = content.match(replacement.from);
      if (matches) {
        replacementCount += matches.length;
        content = content.replace(replacement.from, replacement.to);
      }
    });
    
    // Si aucun remplacement n'a été effectué, sortir
    if (replacementCount === 0) {
      console.log(`✓ ${filePath} - Aucun remplacement nécessaire`);
      return;
    }
    
    // Écrire le contenu modifié dans le fichier
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`✓ ${filePath} - ${replacementCount} remplacement(s) effectué(s)`);
  } catch (error) {
    console.error(`❌ ${filePath} - Erreur: ${error.message}`);
  }
}

// Exécuter le patch sur tous les fichiers
console.log('🔄 Démarrage du remplacement des classes de boutons...');
filesToPatch.forEach(patchFile);
console.log('✅ Terminé!');