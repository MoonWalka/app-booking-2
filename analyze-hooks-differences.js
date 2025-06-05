#!/usr/bin/env node

/**
 * Analyse comparative des hooks de détails
 * Identifie les différences entre useConcertDetails (qui fonctionne) et les autres
 */

const fs = require('fs');
const path = require('path');

// Fonction pour extraire les informations d'un hook
function analyzeHook(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    
    const analysis = {
      file: path.basename(filePath),
      path: filePath,
      relatedEntities: [],
      customQueries: [],
      relationFields: [],
      usesGenericHook: content.includes('useGenericEntityDetails'),
      hasCustomQueries: content.includes('customQueries'),
      hasRelatedEntities: content.includes('relatedEntities'),
      problems: []
    };

    // Extraire les entités liées
    const relatedEntitiesMatch = content.match(/relatedEntities[:\s]*=?[:\s]*\[([^\]]+)\]/s);
    if (relatedEntitiesMatch) {
      const entitiesStr = relatedEntitiesMatch[1];
      
      // Chercher les objets d'entités
      const entityMatches = entitiesStr.match(/{\s*name:\s*['"`]([^'"`]+)['"`][^}]+}/g);
      if (entityMatches) {
        entityMatches.forEach(match => {
          const nameMatch = match.match(/name:\s*['"`]([^'"`]+)['"`]/);
          const typeMatch = match.match(/type:\s*['"`]([^'"`]+)['"`]/);
          const idFieldMatch = match.match(/idField:\s*['"`]([^'"`]+)['"`]/);
          const essentialMatch = match.match(/essential:\s*(true|false)/);
          
          if (nameMatch) {
            analysis.relatedEntities.push({
              name: nameMatch[1],
              type: typeMatch ? typeMatch[1] : 'unknown',
              idField: idFieldMatch ? idFieldMatch[1] : 'unknown',
              essential: essentialMatch ? essentialMatch[1] === 'true' : false
            });
          }
        });
      }
    }

    // Extraire les customQueries
    const customQueriesMatch = content.match(/customQueries[:\s]*=?[:\s]*{([^}]+)}/s);
    if (customQueriesMatch) {
      const queriesStr = customQueriesMatch[1];
      
      // Chercher les noms de queries
      const queryMatches = queriesStr.match(/(\w+):\s*async/g);
      if (queryMatches) {
        queryMatches.forEach(match => {
          const nameMatch = match.match(/(\w+):/);
          if (nameMatch) {
            analysis.customQueries.push(nameMatch[1]);
          }
        });
      }
    }

    // Extraire les champs de relations mentionnés
    const relationFieldMatches = content.match(/['"`](\w*[Ii]d[s]?)['"`]/g);
    if (relationFieldMatches) {
      analysis.relationFields = [...new Set(relationFieldMatches.map(match => 
        match.replace(/['"`]/g, '')
      ))];
    }

    // Détecter les problèmes potentiels
    if (!analysis.usesGenericHook) {
      analysis.problems.push('N\'utilise pas useGenericEntityDetails');
    }

    if (analysis.relatedEntities.length === 0) {
      analysis.problems.push('Aucune entité liée configurée');
    }

    if (analysis.hasRelatedEntities && !analysis.hasCustomQueries) {
      analysis.problems.push('A des entités liées mais pas de customQueries');
    }

    // Vérifier la stabilité des configurations
    if (content.includes('useMemo') && content.includes('relatedEntities')) {
      analysis.hasStableConfig = true;
    } else {
      analysis.hasStableConfig = false;
      analysis.problems.push('Configuration potentiellement instable (pas de useMemo)');
    }

    // Vérifier l'autoLoadRelated
    if (content.includes('autoLoadRelated: true')) {
      analysis.autoLoadRelated = true;
    } else if (content.includes('autoLoadRelated: false')) {
      analysis.autoLoadRelated = false;
      analysis.problems.push('autoLoadRelated désactivé');
    } else {
      analysis.autoLoadRelated = null;
      analysis.problems.push('autoLoadRelated non spécifié');
    }

    return analysis;

  } catch (error) {
    return {
      file: path.basename(filePath),
      path: filePath,
      error: error.message,
      problems: [`Erreur de lecture: ${error.message}`]
    };
  }
}

// Analyser tous les hooks de détails
function analyzeAllHooks() {
  const hooksDir = path.join(__dirname, 'src', 'hooks');
  const hookFiles = [
    path.join(hooksDir, 'concerts', 'useConcertDetails.js'),
    path.join(hooksDir, 'structures', 'useStructureDetails.js'),
    path.join(hooksDir, 'lieux', 'useLieuDetails.js'),
    path.join(hooksDir, 'contacts', 'useContactDetails.js'),
    path.join(hooksDir, 'artistes', 'useArtisteDetails.js')
  ];

  console.log('🔍 ANALYSE COMPARATIVE DES HOOKS DE DÉTAILS');
  console.log('='.repeat(80));

  const analyses = [];

  hookFiles.forEach(hookFile => {
    if (fs.existsSync(hookFile)) {
      const analysis = analyzeHook(hookFile);
      analyses.push(analysis);
      
      console.log(`\n📄 ${analysis.file}`);
      console.log('-'.repeat(40));
      console.log(`Utilise Generic Hook: ${analysis.usesGenericHook ? '✅' : '❌'}`);
      console.log(`AutoLoad Related: ${analysis.autoLoadRelated === true ? '✅' : analysis.autoLoadRelated === false ? '❌' : '❓'}`);
      console.log(`Configuration stable: ${analysis.hasStableConfig ? '✅' : '❌'}`);
      console.log(`Entités liées: ${analysis.relatedEntities.length}`);
      
      if (analysis.relatedEntities.length > 0) {
        analysis.relatedEntities.forEach(entity => {
          console.log(`  - ${entity.name} (${entity.type}, ${entity.essential ? 'essentiel' : 'optionnel'})`);
        });
      }
      
      console.log(`Custom Queries: ${analysis.customQueries.length}`);
      if (analysis.customQueries.length > 0) {
        console.log(`  - ${analysis.customQueries.join(', ')}`);
      }
      
      if (analysis.problems.length > 0) {
        console.log(`⚠️ Problèmes (${analysis.problems.length}):`);
        analysis.problems.forEach(problem => {
          console.log(`  - ${problem}`);
        });
      }
    } else {
      console.log(`\n❌ ${path.basename(hookFile)} - Fichier non trouvé`);
    }
  });

  // Comparaison avec useConcertDetails (référence)
  const concertHook = analyses.find(a => a.file === 'useConcertDetails.js');
  if (concertHook) {
    console.log(`\n${'='.repeat(20)} COMPARAISON AVEC USECONCERTDETAILS ${'='.repeat(20)}`);
    
    analyses.forEach(analysis => {
      if (analysis.file === 'useConcertDetails.js') return;
      
      console.log(`\n📊 ${analysis.file} vs useConcertDetails:`);
      
      // Comparer les configurations
      const differences = [];
      
      if (analysis.usesGenericHook !== concertHook.usesGenericHook) {
        differences.push(`Generic Hook: ${analysis.usesGenericHook} vs ${concertHook.usesGenericHook}`);
      }
      
      if (analysis.autoLoadRelated !== concertHook.autoLoadRelated) {
        differences.push(`AutoLoad: ${analysis.autoLoadRelated} vs ${concertHook.autoLoadRelated}`);
      }
      
      if (analysis.hasStableConfig !== concertHook.hasStableConfig) {
        differences.push(`Config stable: ${analysis.hasStableConfig} vs ${concertHook.hasStableConfig}`);
      }
      
      if (analysis.relatedEntities.length !== concertHook.relatedEntities.length) {
        differences.push(`Nb entités liées: ${analysis.relatedEntities.length} vs ${concertHook.relatedEntities.length}`);
      }
      
      if (analysis.customQueries.length !== concertHook.customQueries.length) {
        differences.push(`Nb custom queries: ${analysis.customQueries.length} vs ${concertHook.customQueries.length}`);
      }
      
      if (differences.length === 0) {
        console.log('  ✅ Configuration similaire');
      } else {
        console.log('  ❌ Différences détectées:');
        differences.forEach(diff => console.log(`    - ${diff}`));
      }
      
      // Comparer les problèmes
      const uniqueProblems = analysis.problems.filter(p => 
        !concertHook.problems.includes(p)
      );
      
      if (uniqueProblems.length > 0) {
        console.log('  ⚠️ Problèmes spécifiques:');
        uniqueProblems.forEach(problem => console.log(`    - ${problem}`));
      }
    });
  }

  // Génération des recommandations
  console.log(`\n${'='.repeat(20)} RECOMMANDATIONS ${'='.repeat(20)}`);
  
  const recommendations = [];
  
  // Analyser les patterns de problèmes
  const allProblems = analyses.flatMap(a => a.problems);
  const problemCounts = {};
  allProblems.forEach(problem => {
    problemCounts[problem] = (problemCounts[problem] || 0) + 1;
  });

  Object.entries(problemCounts).forEach(([problem, count]) => {
    if (count > 1) {
      recommendations.push(`Corriger "${problem}" dans ${count} hooks`);
    }
  });

  // Recommandations spécifiques
  const hooksWithoutAutoLoad = analyses.filter(a => a.autoLoadRelated !== true);
  if (hooksWithoutAutoLoad.length > 0) {
    recommendations.push(`Activer autoLoadRelated dans: ${hooksWithoutAutoLoad.map(a => a.file).join(', ')}`);
  }

  const hooksWithoutStableConfig = analyses.filter(a => !a.hasStableConfig);
  if (hooksWithoutStableConfig.length > 0) {
    recommendations.push(`Stabiliser la configuration avec useMemo dans: ${hooksWithoutStableConfig.map(a => a.file).join(', ')}`);
  }

  const hooksWithoutCustomQueries = analyses.filter(a => a.relatedEntities.length > 0 && a.customQueries.length === 0);
  if (hooksWithoutCustomQueries.length > 0) {
    recommendations.push(`Ajouter des customQueries dans: ${hooksWithoutCustomQueries.map(a => a.file).join(', ')}`);
  }

  if (recommendations.length === 0) {
    console.log('✅ Aucune recommandation spécifique');
  } else {
    recommendations.forEach((rec, index) => {
      console.log(`${index + 1}. ${rec}`);
    });
  }

  // Sauvegarder l'analyse
  const report = {
    timestamp: new Date().toISOString(),
    analyses,
    recommendations,
    summary: {
      totalHooks: analyses.length,
      hooksWithProblems: analyses.filter(a => a.problems.length > 0).length,
      commonProblems: Object.entries(problemCounts).filter(([, count]) => count > 1)
    }
  };

  const reportPath = path.join(__dirname, 'rapport-analyse-hooks.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n📄 Rapport sauvegardé: ${reportPath}`);

  return report;
}

// Exécuter l'analyse
if (require.main === module) {
  analyzeAllHooks();
}

module.exports = { analyzeHook, analyzeAllHooks };