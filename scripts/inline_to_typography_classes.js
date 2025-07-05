/**
 * Script pour convertir les styles inline en classes typography.css
 * 
 * Ce script scanne les fichiers JS/JSX pour trouver les styles inline et
 * les convertir en classes typographiques standardisées lorsque possible.
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Mappages des styles inline vers les classes typography.css
const STYLE_TO_CLASS_MAPPINGS = {
  // Taille de police
  'font-size: 8pt': 'tc-text-xs',
  'font-size: 9pt': 'tc-text-xs',
  'font-size:8pt': 'tc-text-xs',
  'font-size:9pt': 'tc-text-xs',
  'fontSize: "8pt"': 'tc-text-xs',
  'fontSize: "9pt"': 'tc-text-xs',
  'fontSize: "10pt"': 'tc-text-xs',
  'fontSize: "12pt"': 'tc-text-sm',
  'fontSize: "14pt"': 'tc-text-md',
  'fontSize: "16pt"': 'tc-text-lg',
  'fontSize: "18pt"': 'tc-text-xl',
  'fontSize: "24pt"': 'tc-text-xxl',
  
  // Couleurs de texte
  'color: #333': 'tc-text-dark',
  'color: #666': 'tc-text-muted',
  'color: #000': 'tc-text-dark',
  'color: black': 'tc-text-dark',
  'color: white': 'tc-text-light',
  'color: red': 'tc-text-danger',
  'color: blue': 'tc-text-info',
  'color: green': 'tc-text-success',
  'color: orange': 'tc-text-warning',
  
  // Alignements
  'text-align: center': 'tc-text-center',
  'text-align: left': 'tc-text-left',
  'text-align: right': 'tc-text-right',
  'text-align: justify': 'tc-text-justify',
  'textAlign: "center"': 'tc-text-center',
  'textAlign: "left"': 'tc-text-left',
  'textAlign: "right"': 'tc-text-right',
  'textAlign: "justify"': 'tc-text-justify',
  
  // Poids des polices
  'font-weight: normal': 'tc-font-normal',
  'font-weight: bold': 'tc-font-bold',
  'font-weight: 400': 'tc-font-normal',
  'font-weight: 500': 'tc-font-medium',
  'font-weight: 600': 'tc-font-semibold',
  'font-weight: 700': 'tc-font-bold',
  'fontWeight: "normal"': 'tc-font-normal',
  'fontWeight: "bold"': 'tc-font-bold',
  'fontWeight: 400': 'tc-font-normal',
  'fontWeight: 500': 'tc-font-medium',
  'fontWeight: 600': 'tc-font-semibold',
  'fontWeight: 700': 'tc-font-bold',
};

// Expressions régulières pour trouver les styles inline
const STYLE_PATTERNS = [
  // HTML style attributes in template literals
  { 
    regex: /(style=["'])([^"']*)(["'])/g,
    replacer: (match, prefix, styleContent, suffix) => {
      const cssClasses = convertStyleToClasses(styleContent);
      if (!cssClasses) return match;
      
      // Remove converted styles from original
      let reducedStyle = removeConvertedStyles(styleContent);
      
      if (reducedStyle.trim()) {
        // Some styles remain, keep style attribute with remaining styles
        return `${prefix}${reducedStyle}${suffix} class="${cssClasses}"`;
      } else {
        // All styles converted, remove style attribute
        return `class="${cssClasses}"`;
      }
    }
  },
  
  // React inline styles with double brackets
  {
    regex: /(style={{)([^}]*)(}})/g,
    replacer: (match, prefix, styleContent, suffix) => {
      const cssClasses = convertStyleToClasses(styleContent);
      if (!cssClasses) return match;
      
      // Remove converted styles from original
      let reducedStyle = removeConvertedStyles(styleContent);
      
      // Check for existing className
      const hasClassNameBefore = /className=["'][^"']*["']/.test(match.input.slice(0, match.index + prefix.length));
      
      if (reducedStyle.trim()) {
        // Some styles remain, keep style attribute with remaining styles
        if (hasClassNameBefore) {
          // Need to inject into existing className
          return match.replace(/className=["']([^"']*)["']/, `className="$1 ${cssClasses}"`);
        } else {
          return `${prefix}${reducedStyle}${suffix} className="${cssClasses}"`;
        }
      } else {
        // All styles converted, remove style attribute
        if (hasClassNameBefore) {
          return match.replace(/className=["']([^"']*)["']/, `className="$1 ${cssClasses}"`);
        } else {
          return `className="${cssClasses}"`;
        }
      }
    }
  }
];

/**
 * Convertit un style inline en classes typography.css
 */
function convertStyleToClasses(styleContent) {
  const classes = [];
  
  // Parcourir tous les mappages style-classe
  for (const [style, cssClass] of Object.entries(STYLE_TO_CLASS_MAPPINGS)) {
    if (styleContent.includes(style)) {
      classes.push(cssClass);
    }
  }
  
  return classes.join(' ');
}

/**
 * Supprime les styles convertis du style original
 */
function removeConvertedStyles(styleContent) {
  let reducedStyle = styleContent;
  
  // Parcourir tous les mappages style-classe
  for (const [style, cssClass] of Object.entries(STYLE_TO_CLASS_MAPPINGS)) {
    // Supprime le style s'il correspond exactement
    reducedStyle = reducedStyle.replace(style, '');
    // Supprime le style s'il est suivi d'un point-virgule
    reducedStyle = reducedStyle.replace(`${style};`, '');
    // Supprime le style s'il est suivi d'une virgule (pour JSX)
    reducedStyle = reducedStyle.replace(`${style},`, ',');
  }
  
  // Nettoie les points-virgules ou virgules en trop
  reducedStyle = reducedStyle.replace(/;+/g, ';');
  reducedStyle = reducedStyle.replace(/,+/g, ',');
  reducedStyle = reducedStyle.replace(/;}/g, '}');
  reducedStyle = reducedStyle.replace(/,}/g, '}');
  
  return reducedStyle;
}

/**
 * Traite un fichier pour remplacer les styles inline
 */
function processFile(filePath) {
  try {
    // Lire le contenu du fichier
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Appliquer chaque pattern de remplacement
    for (const { regex, replacer } of STYLE_PATTERNS) {
      const newContent = content.replace(regex, replacer);
      if (newContent !== content) {
        content = newContent;
        modified = true;
      }
    }
    
    // Écrire le fichier mis à jour si modifié
    if (modified) {
      const backupPath = `${filePath}.bak`;
      fs.writeFileSync(backupPath, fs.readFileSync(filePath));
      fs.writeFileSync(filePath, content);
      console.log(`✅ Mis à jour: ${filePath} (sauvegarde créée: ${backupPath})`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Erreur lors du traitement de ${filePath}:`, error);
    return false;
  }
}

/**
 * Point d'entrée principal
 */
function main() {
  // Recherche tous les fichiers JS et JSX
  const files = glob.sync('src/**/*.{js,jsx}', { ignore: 'node_modules/**' });
  
  console.log(`🔍 Analyse de ${files.length} fichiers...`);
  
  let modifiedCount = 0;
  
  // Traiter chaque fichier
  for (const file of files) {
    if (processFile(file)) {
      modifiedCount++;
    }
  }
  
  console.log(`\n✅ Terminé! ${modifiedCount} fichiers mis à jour.`);
}

// Exécution du script
main();
