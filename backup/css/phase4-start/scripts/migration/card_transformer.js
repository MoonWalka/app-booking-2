/**
 * Card Transformer
 * --------------
 * Utilitaires pour transformer des composants existants en composants Card standardisés.
 */

const fs = require('fs');
const path = require('path');

/**
 * Détecte les éléments de type carte dans le code JSX
 */
function detectCardElements(code) {
  const patterns = {
    cardClasses: [
      // Classes CSS associées à des cartes
      /className=['"](.*?)(card|Card|cardHeader|cardBody|cardFooter)(.*?)['"]/g,
      
      // Styles et structures communs aux cartes
      /className=['"](.*?)(shadow|border|rounded|elevation|p-\d|m-\d)(.*?)['"]/g,
    ],
    
    cardStructure: [
      // Headers, body et footers
      /<div[^>]*?header/g,
      /<div[^>]*?body/g,
      /<div[^>]*?footer/g,
      /<header/g,
      /<footer/g,
      
      // Titres suivis de contenu dans des divs
      /<h[1-6][^>]*>.*?<\/h[1-6]>\s*<div/g,
    ]
  };
  
  // Rechercher les éléments correspondant aux patterns
  const matches = {
    cardClasses: [],
    cardStructure: []
  };
  
  // Rechercher les classes de carte
  for (const pattern of patterns.cardClasses) {
    let match;
    while ((match = pattern.exec(code)) !== null) {
      matches.cardClasses.push({
        fullMatch: match[0],
        className: match[0],
        index: match.index
      });
    }
  }
  
  // Rechercher les structures de carte
  for (const pattern of patterns.cardStructure) {
    let match;
    while ((match = pattern.exec(code)) !== null) {
      matches.cardStructure.push({
        fullMatch: match[0],
        structure: match[0],
        index: match.index
      });
    }
  }
  
  return matches;
}

/**
 * Détecte les imports React et les imports potentiels de styles dans le code
 */
function detectImports(code) {
  const reactImport = code.match(/import\s+React.*?from\s+['"]react['"]/);
  const styleImports = code.match(/import\s+(?:styles|.*?styles).*?from\s+['"].*?['"]/g) || [];
  
  return {
    hasReactImport: !!reactImport,
    styleImports
  };
}

/**
 * Détecte le composant fonctionnel principal dans le code
 */
function detectFunctionalComponent(code) {
  // Chercher les composants sous forme de fonction fléchée ou de fonction normale
  const arrowComponent = code.match(/(?:export\s+)?const\s+(\w+)\s*=\s*\((?:props|\{[^}]*\})\s*\)\s*=>\s*\{/);
  const functionComponent = code.match(/(?:export\s+)?function\s+(\w+)\s*\((?:props|\{[^}]*\})\s*\)\s*\{/);
  
  return arrowComponent || functionComponent;
}

/**
 * Transforme le code JSX pour remplacer les div avec card, header, body, etc. par Card, Card.Header, Card.Body
 */
function transformCardJSX(code) {
  // Remplacer les classes card/Card par le composant Card
  let transformed = code;
  
  // Remplacer les div avec className contenant 'card' par <Card>
  transformed = transformed.replace(
    /<div\s+className=['"](.*?)(card|Card)(.*?)['"]([^>]*)>/g,
    '<Card className="$1$2$3"$4>'
  );
  
  // Remplacer les div avec className contenant 'cardHeader' par <Card.Header>
  transformed = transformed.replace(
    /<div\s+className=['"](.*?)(cardHeader|header)(['"]|[^"']*["'])/g,
    '<Card.Header className="$1$2$3'
  );
  
  // Remplacer les div avec className contenant 'cardBody' par <Card.Body>
  transformed = transformed.replace(
    /<div\s+className=['"](.*?)(cardBody|body)(['"]|[^"']*["'])/g,
    '<Card.Body className="$1$2$3'
  );
  
  // Remplacer les div avec className contenant 'cardFooter' par <Card.Footer>
  transformed = transformed.replace(
    /<div\s+className=['"](.*?)(cardFooter|footer)(['"]|[^"']*["'])/g,
    '<Card.Footer className="$1$2$3'
  );
  
  // Fermer les tags correctement
  transformed = transformed.replace(/<\/div>/g, (match, offset) => {
    // Une heuristique simple: si le tag ouvert le plus proche est un Card, Card.Header, etc.
    // nous fermons ce tag au lieu de </div>
    // Cela peut nécessiter une analyse AST plus robuste pour être vraiment précis
    const previousOpenTag = transformed.slice(0, offset).match(/<(Card|Card\.Header|Card\.Body|Card\.Footer)[^>]*>/g);
    
    if (previousOpenTag) {
      const lastTag = previousOpenTag[previousOpenTag.length - 1];
      if (lastTag.includes('Card.Header')) return '</Card.Header>';
      if (lastTag.includes('Card.Body')) return '</Card.Body>';
      if (lastTag.includes('Card.Footer')) return '</Card.Footer>';
      if (lastTag.includes('Card')) return '</Card>';
    }
    
    return match;
  });
  
  return transformed;
}

/**
 * Ajoute les imports nécessaires pour le composant Card
 */
function addCardImport(code) {
  // Ajouter l'import pour Card s'il n'existe pas déjà
  if (!code.includes("import Card from")) {
    // Trouver le dernier import dans le fichier
    const importStatements = code.match(/import\s+.*?\s+from\s+['"].*?['"];?/g) || [];
    
    if (importStatements.length > 0) {
      const lastImport = importStatements[importStatements.length - 1];
      const lastImportIndex = code.lastIndexOf(lastImport) + lastImport.length;
      
      // Insérer après le dernier import
      code = code.slice(0, lastImportIndex) + 
             "\nimport Card from 'components/common/ui/Card';" + 
             code.slice(lastImportIndex);
    } else {
      // S'il n'y a pas d'imports, ajouter au début du fichier
      code = "import Card from 'components/common/ui/Card';\n" + code;
    }
  }
  
  return code;
}

/**
 * Transformation complète d'un composant pour utiliser Card
 */
function transformComponent(code) {
  // Détecter les parties à transformer
  const cardElements = detectCardElements(code);
  const imports = detectImports(code);
  
  // Si aucun élément de type carte n'est trouvé, retourner le code inchangé
  if (cardElements.cardClasses.length === 0 && cardElements.cardStructure.length === 0) {
    return code;
  }
  
  // Ajouter l'import pour Card
  let transformedCode = addCardImport(code);
  
  // Transformer les éléments JSX
  transformedCode = transformCardJSX(transformedCode);
  
  return transformedCode;
}

/**
 * Sauvegarder une copie de sauvegarde du fichier original avant transformation
 */
function backupFile(filePath) {
  const backupPath = filePath + '.bak';
  fs.copyFileSync(filePath, backupPath);
  return backupPath;
}

module.exports = {
  detectCardElements,
  detectImports,
  detectFunctionalComponent,
  transformCardJSX,
  addCardImport,
  transformComponent,
  backupFile
};