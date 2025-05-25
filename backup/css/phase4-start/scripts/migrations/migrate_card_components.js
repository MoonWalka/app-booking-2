/**
 * Script de migration des composants Card
 * 
 * Ce script identifie et convertit les composants qui utilisent des structures de type carte
 * vers le nouveau composant Card standardisé.
 * 
 * Usage:
 *  - node migrate_card_components.js --dry-run (analyse sans modification)
 *  - node migrate_card_components.js --component=NomDuComposant (migration d'un composant spécifique)
 *  - node migrate_card_components.js (migration par lot, 10 composants à la fois)
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const babel = require('@babel/core');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const t = require('@babel/types');
const generate = require('@babel/generator').default;
const prettier = require('prettier');

// Configuration
const SRC_DIR = path.join(__dirname, '..', '..', 'src');
const COMPONENTS_DIR = path.join(SRC_DIR, 'components');
const REPORT_FILE = path.join(__dirname, '..', '..', 'card_migration_report.md');
const HIGH_CONFIDENCE_THRESHOLD = 70; // 70-100% de confiance

// Arguments de ligne de commande
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const componentArg = args.find(arg => arg.startsWith('--component='));
const specificComponent = componentArg ? componentArg.split('=')[1] : null;

// Patterns à rechercher pour identifier les composants de type carte
const CARD_PATTERNS = {
  classNames: ['card', 'Card', 'cardHeader', 'cardBody', 'cardFooter', 'cardContent'],
  elements: ['header', 'body', 'footer', 'content'],
  components: ['Card', 'Panel', 'Box', 'Section', 'Container'],
};

// Compteurs pour les statistiques
let stats = {
  analyzed: 0,
  migrated: 0,
  skipped: 0,
  errors: 0,
};

/**
 * Récupère la liste des composants à haute confiance depuis le rapport
 */
function getHighConfidenceComponents() {
  try {
    const report = fs.readFileSync(path.join(__dirname, '..', '..', 'card_components_to_migrate.md'), 'utf8');
    const regex = /\|\s*([^\|]+)\s*\|\s*([0-9\.]+)%\s*\|/g;
    const components = [];
    
    let match;
    while ((match = regex.exec(report)) !== null) {
      const componentPath = match[1].trim();
      const confidence = parseFloat(match[2]);
      
      if (confidence >= HIGH_CONFIDENCE_THRESHOLD) {
        components.push(componentPath);
      }
    }
    
    return components;
  } catch (error) {
    console.error('Erreur lors de la lecture du rapport:', error);
    return [];
  }
}

/**
 * Vérifie si un fichier contient des motifs de composant de type Card
 */
function hasCardPatterns(fileContent) {
  // Recherche de classes CSS liées aux cartes
  const classRegex = new RegExp(`className=['"](.*?)(${CARD_PATTERNS.classNames.join('|')})(.*?)['"]`, 'i');
  if (classRegex.test(fileContent)) return true;
  
  // Recherche de composants qui pourraient être des cartes
  const componentRegex = new RegExp(`<(${CARD_PATTERNS.components.join('|')})[^>]*>`, 'i');
  if (componentRegex.test(fileContent)) return true;
  
  // Structure typique d'une carte avec en-tête et corps
  const structureRegex = new RegExp(`<div[^>]*>.*?<(h[1-6]|header).*?>.*?</\\s*(h[1-6]|header)>.*?<div[^>]*>.*?</div>.*?</div>`, 's');
  if (structureRegex.test(fileContent)) return true;
  
  return false;
}

/**
 * Transforme le JSX pour remplacer les structures de type carte par le composant Card standardisé
 */
function transformCardComponent(code, filePath) {
  try {
    // Parse le code source
    const ast = parser.parse(code, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript', 'classProperties', 'objectRestSpread'],
    });
    
    // Garder une trace des imports à ajouter
    let needsCardImport = false;
    
    // Traverser l'AST pour trouver et transformer les structures de type carte
    traverse(ast, {
      JSXElement(path) {
        const openingElement = path.node.openingElement;
        
        // Vérifie si c'est une div avec une classe contenant 'card'
        if (t.isJSXIdentifier(openingElement.name, { name: 'div' })) {
          const classNameAttr = openingElement.attributes.find(attr => 
            t.isJSXAttribute(attr) && 
            t.isJSXIdentifier(attr.name, { name: 'className' })
          );
          
          if (classNameAttr && t.isStringLiteral(classNameAttr.value)) {
            const className = classNameAttr.value.value;
            
            // Si la classe contient 'card', 'Card', etc.
            if (CARD_PATTERNS.classNames.some(pattern => 
              className.toLowerCase().includes(pattern.toLowerCase())
            )) {
              transformToCardComponent(path);
              needsCardImport = true;
            }
          }
        }
      }
    });
    
    // Générer le code transformé
    const output = generate(ast, {
      retainLines: false,
      concise: false,
    }, code);
    
    let transformedCode = output.code;
    
    // Ajouter l'import du composant Card si nécessaire
    if (needsCardImport) {
      transformedCode = `import Card from '../../components/common/ui/Card';\n${transformedCode}`;
    }
    
    // Formatter le code avec prettier
    return prettier.format(transformedCode, {
      parser: 'babel',
      singleQuote: true,
      trailingComma: 'es5',
      tabWidth: 2,
    });
  } catch (error) {
    console.error(`Erreur lors de la transformation de ${filePath}:`, error);
    stats.errors++;
    return code; // Retourne le code original en cas d'erreur
  }
}

/**
 * Transforme une structure de div en composant Card
 */
function transformToCardComponent(path) {
  const element = path.node;
  const children = element.children;
  
  // Identifier les enfants qui pourraient être des en-têtes, corps, pieds de page
  let header = null;
  let body = null;
  let footer = null;
  
  for (const child of children) {
    if (!t.isJSXElement(child)) continue;
    
    const childElement = child.openingElement;
    const classNameAttr = childElement.attributes.find(attr => 
      t.isJSXAttribute(attr) && 
      t.isJSXIdentifier(attr.name, { name: 'className' })
    );
    
    if (!classNameAttr || !t.isStringLiteral(classNameAttr.value)) continue;
    
    const className = classNameAttr.value.value;
    
    if (className.includes('header') || className.includes('Header')) {
      header = child;
    } else if (className.includes('body') || className.includes('Body') || className.includes('content') || className.includes('Content')) {
      body = child;
    } else if (className.includes('footer') || className.includes('Footer')) {
      footer = child;
    }
  }
  
  // Créer les éléments Card.Header, Card.Body, Card.Footer
  const newChildren = [];
  
  if (header) {
    // Essayer d'extraire le titre de l'en-tête
    let title = null;
    let titleNode = null;
    
    traverse.traverse(header, {
      JSXElement(p) {
        if (t.isJSXIdentifier(p.node.openingElement.name, { name: name => name.match(/^h[1-6]$/) })) {
          titleNode = p.node;
          if (p.node.children.length === 1 && t.isJSXText(p.node.children[0])) {
            title = p.node.children[0].value.trim();
          }
          p.stop();
        }
      },
      noScope: true,
    });
    
    if (title) {
      // Créer Card.Header avec un titre
      newChildren.push(
        t.jsxElement(
          t.jsxOpeningElement(
            t.jsxMemberExpression(t.jsxIdentifier('Card'), t.jsxIdentifier('Header')),
            [t.jsxAttribute(t.jsxIdentifier('title'), t.stringLiteral(title))],
            false
          ),
          t.jsxClosingElement(
            t.jsxMemberExpression(t.jsxIdentifier('Card'), t.jsxIdentifier('Header'))
          ),
          [],
          false
        )
      );
    } else {
      // Créer Card.Header avec les enfants existants
      newChildren.push(
        t.jsxElement(
          t.jsxOpeningElement(
            t.jsxMemberExpression(t.jsxIdentifier('Card'), t.jsxIdentifier('Header')),
            [],
            false
          ),
          t.jsxClosingElement(
            t.jsxMemberExpression(t.jsxIdentifier('Card'), t.jsxIdentifier('Header'))
          ),
          header.children,
          false
        )
      );
    }
  }
  
  if (body) {
    newChildren.push(
      t.jsxElement(
        t.jsxOpeningElement(
          t.jsxMemberExpression(t.jsxIdentifier('Card'), t.jsxIdentifier('Body')),
          [],
          false
        ),
        t.jsxClosingElement(
          t.jsxMemberExpression(t.jsxIdentifier('Card'), t.jsxIdentifier('Body'))
        ),
        body.children,
        false
      )
    );
  } else {
    // Si pas de corps identifié, mettre tous les enfants non assignés dans Card.Body
    const unassignedChildren = children.filter(child => 
      child !== header && child !== footer && t.isJSXElement(child)
    );
    
    if (unassignedChildren.length > 0) {
      newChildren.push(
        t.jsxElement(
          t.jsxOpeningElement(
            t.jsxMemberExpression(t.jsxIdentifier('Card'), t.jsxIdentifier('Body')),
            [],
            false
          ),
          t.jsxClosingElement(
            t.jsxMemberExpression(t.jsxIdentifier('Card'), t.jsxIdentifier('Body'))
          ),
          unassignedChildren,
          false
        )
      );
    }
  }
  
  if (footer) {
    newChildren.push(
      t.jsxElement(
        t.jsxOpeningElement(
          t.jsxMemberExpression(t.jsxIdentifier('Card'), t.jsxIdentifier('Footer')),
          [],
          false
        ),
        t.jsxClosingElement(
          t.jsxMemberExpression(t.jsxIdentifier('Card'), t.jsxIdentifier('Footer'))
        ),
        footer.children,
        false
      )
    );
  }
  
  // Créer le nouvel élément Card avec les sous-composants
  const cardElement = t.jsxElement(
    t.jsxOpeningElement(
      t.jsxIdentifier('Card'),
      [],
      false
    ),
    t.jsxClosingElement(
      t.jsxIdentifier('Card')
    ),
    newChildren,
    false
  );
  
  path.replaceWith(cardElement);
}

/**
 * Traite un composant pour la migration
 */
async function processComponent(componentPath) {
  try {
    const absPath = path.isAbsolute(componentPath) ? componentPath : path.join(SRC_DIR, componentPath);
    console.log(`\nAnalyse de ${componentPath}...`);
    
    if (!fs.existsSync(absPath)) {
      console.warn(`⚠️ Fichier introuvable: ${absPath}`);
      stats.skipped++;
      return;
    }
    
    const code = fs.readFileSync(absPath, 'utf8');
    stats.analyzed++;
    
    // Vérifier si le fichier contient des motifs de composant de type Card
    if (!hasCardPatterns(code)) {
      console.log(`✓ Aucun motif de carte détecté dans ${componentPath}`);
      stats.skipped++;
      return;
    }
    
    console.log(`🔍 Motifs de carte détectés dans ${componentPath}`);
    
    // Transformer le composant
    const transformedCode = transformCardComponent(code, absPath);
    
    // Compter les lignes modifiées
    const originalLines = code.split('\n').length;
    const transformedLines = transformedCode.split('\n').length;
    const diffLines = Math.abs(originalLines - transformedLines);
    
    console.log(`📊 Différence: ${diffLines} lignes`);
    
    // En mode dry-run, ne pas écrire les modifications
    if (isDryRun) {
      console.log('🔍 Mode dry-run: aucune modification appliquée');
      return;
    }
    
    // Écrire les modifications dans le fichier
    fs.writeFileSync(absPath, transformedCode);
    console.log(`✅ Composant migré: ${componentPath}`);
    stats.migrated++;
    
  } catch (error) {
    console.error(`❌ Erreur lors du traitement de ${componentPath}:`, error);
    stats.errors++;
  }
}

/**
 * Met à jour le rapport de migration
 */
function updateMigrationReport() {
  const reportContent = `# Rapport de Migration des Composants Card
  
## État de la Migration

- **Date**: ${new Date().toLocaleDateString()}
- **Composants analysés**: ${stats.analyzed}
- **Composants migrés**: ${stats.migrated}
- **Composants ignorés**: ${stats.skipped}
- **Erreurs rencontrées**: ${stats.errors}

## Prochaines Étapes

1. Vérifier visuellement les composants migrés pour s'assurer qu'ils fonctionnent correctement
2. Résoudre les problèmes éventuels dans les composants avec erreurs
3. Continuer la migration des composants restants

`;

  fs.writeFileSync(REPORT_FILE, reportContent);
  console.log(`\n📝 Rapport de migration mis à jour: ${REPORT_FILE}`);
}

/**
 * Fonction principale
 */
async function main() {
  console.log('🚀 Démarrage de la migration des composants Card...');
  
  // Mode de fonctionnement
  if (isDryRun) {
    console.log('🔍 Mode dry-run: analyse sans modification');
  } else if (specificComponent) {
    console.log(`🔍 Migration d'un composant spécifique: ${specificComponent}`);
  } else {
    console.log('🔍 Migration par lot (10 composants à la fois)');
  }
  
  // Récupérer la liste des composants à haute confiance
  const componentsToMigrate = getHighConfidenceComponents();
  
  console.log(`\n📊 ${componentsToMigrate.length} composants à haute confiance identifiés`);
  
  // Si un composant spécifique est demandé
  if (specificComponent) {
    const matchingComponent = componentsToMigrate.find(c => 
      c.includes(specificComponent) || path.basename(c).includes(specificComponent)
    );
    
    if (matchingComponent) {
      await processComponent(matchingComponent);
    } else {
      console.warn(`⚠️ Composant non trouvé: ${specificComponent}`);
    }
  } 
  // Sinon, traiter par lots de 10
  else {
    const batchSize = 10;
    const batchToProcess = componentsToMigrate.slice(0, batchSize);
    
    for (const component of batchToProcess) {
      await processComponent(component);
    }
    
    console.log(`\n✅ Traitement terminé pour ${batchToProcess.length} composants`);
    
    if (!isDryRun) {
      console.log(`\n⚠️ ${componentsToMigrate.length - batchToProcess.length} composants restent à migrer`);
    }
  }
  
  // Mettre à jour le rapport de migration
  updateMigrationReport();
  
  console.log('\n🏁 Fin de la migration');
}

// Exécution du script
main().catch(error => {
  console.error('Erreur lors de l\'exécution du script:', error);
  process.exit(1);
});