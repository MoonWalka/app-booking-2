#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

// Configuration des hooks dépréciés à rechercher
const DEPRECATED_HOOKS = [
  {
    name: 'useConcertDetails',
    replacement: 'useGenericEntityDetails',
    pattern: 'useConcertDetails',
    severity: 'HIGH'
  },
  {
    name: 'useLieuDetails',
    replacement: 'useGenericEntityDetails',
    pattern: 'useLieuDetails',
    severity: 'HIGH'
  }
];

// Vérification si la ligne contient un commentaire
function isInComment(line) {
  return line.trim().startsWith('//') || 
         line.trim().startsWith('/*') || 
         line.trim().startsWith('*');
}

// Vérification si la ligne contient une chaîne de caractères avec le motif
function isInString(line, pattern) {
  // Vérifier si le motif est à l'intérieur de guillemets
  if (line.includes("'")) {
    const quoteIndex = line.indexOf("'");
    const pattern2Index = line.indexOf(pattern);
    if (quoteIndex < pattern2Index && line.indexOf("'", quoteIndex + 1) > pattern2Index) {
      return true;
    }
  }
  if (line.includes('"')) {
    const quoteIndex = line.indexOf('"');
    const pattern2Index = line.indexOf(pattern);
    if (quoteIndex < pattern2Index && line.indexOf('"', quoteIndex + 1) > pattern2Index) {
      return true;
    }
  }
  return false;
}

// Vérification si la ligne est une utilisation réelle du hook
function isActualHookUsage(line, pattern) {
  // Si c'est un import, un useMemo, un useState, etc.
  return (line.includes('import') && line.includes(pattern)) ||
         (line.includes('=') && line.includes(pattern) && !line.includes('V2'));
}

async function findDeprecatedHooks() {
  const srcDir = path.join(process.cwd(), 'src');
  const results = [];
  
  console.log('Recherche de hooks dépréciés dans', srcDir);
  
  // Trouver tous les fichiers JS et JSX récursivement
  const { stdout: filesOutput } = await exec(`find ${srcDir} -type f -name "*.js" -o -name "*.jsx" | grep -v "node_modules"`);
  const files = filesOutput.split('\n').filter(Boolean);
  
  console.log(`Analyse de ${files.length} fichiers...`);
  
  // Analyser chaque fichier
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    const lines = content.split('\n');
    
    // Vérifier chaque hook déprécié
    for (const hook of DEPRECATED_HOOKS) {
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        if (line.includes(hook.pattern) && 
            !isInComment(line) && 
            !isInString(line, hook.pattern) && 
            isActualHookUsage(line, hook.pattern) &&
            !line.includes(hook.pattern + 'V2') &&  // Ignore les versions V2
            !line.includes(hook.pattern + 'Migrated')) { // Ignore les versions migrées
          
          results.push({
            file: path.relative(process.cwd(), file),
            hook: hook.name,
            replacement: hook.replacement,
            line: i + 1,
            lineContent: line.trim(),
            severity: hook.severity
          });
          
          console.log(`Trouvé: ${hook.name} dans ${file}:${i+1}`);
          console.log(`  → Remplacer par: ${hook.replacement}`);
          console.log(`  → Ligne: ${line.trim()}`);
        }
      }
    }
  }
  
  return results;
}

// Fonction principale
async function main() {
  console.log('=== Détection des hooks dépréciés ===');
  
  try {
    const results = await findDeprecatedHooks();
    
    console.log('\n=== Rapport de détection des hooks dépréciés ===');
    console.log('Total des occurrences trouvées:', results.length);
    
    const byHook = {};
    
    // Compter les occurrences par hook
    results.forEach(result => {
      if (!byHook[result.hook]) {
        byHook[result.hook] = 0;
      }
      byHook[result.hook]++;
    });
    
    console.log('\n=== Détail par hook ===');
    Object.entries(byHook).forEach(([hook, count]) => {
      console.log(`${hook}: ${count} occurrence(s)`);
    });
    
    if (results.length > 0) {
      console.log('\nActions recommandées:');
      console.log('1. Consultez le Plan de dépréciation des hooks pour les échéances complètes');
      console.log('2. Prioritisez la migration des hooks à sévérité HAUTE');
      console.log('3. Utilisez les guides de migration disponibles dans la documentation');
    } else {
      console.log('\nAucun hook déprécié trouvé. Le processus de migration est terminé !');
    }
    
  } catch (error) {
    console.error('Erreur lors de l\'analyse:', error);
    process.exit(1);
  }
}

main();
