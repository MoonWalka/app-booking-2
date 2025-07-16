#!/usr/bin/env node

/**
 * 🔍 AUDIT DES DOUBLONS UI TOURCRAFT
 * ==================================
 * 
 * Ce script détecte les doublons entre les composants UI :
 * - AddButton vs Button vs ActionButton
 * - Fonctionnalités redondantes
 * - Recommandations de consolidation
 */

const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  uiDirectories: [
    'src/components/ui',
    'src/components/common',
    'src/components/common/ui'
  ],
  buttonComponents: [
    'src/components/ui/AddButton.js',
    'src/components/ui/Button.js',
    'src/components/ui/ActionButton.js',
    'src/components/common/ActionButton.js'
  ],
  analysisPatterns: {
    hasLink: /Link.*from.*react-router/,
    hasOnClick: /onClick.*=/,
    hasVariants: /variant.*=/,
    hasIcon: /icon.*=/,
    hasTooltip: /tooltip.*=/,
    hasSize: /size.*=/,
    isDeprecated: /@deprecated/
  }
};

class UIDoublonAuditor {
  constructor() {
    this.results = {
      components: [],
      doublons: [],
      recommendations: [],
      summary: {
        totalComponents: 0,
        doublonsDetected: 0,
        consolidationPossible: false
      }
    };
  }

  // Analyser un composant
  analyzeComponent(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const fileName = path.basename(filePath, '.js');
      
      const analysis = {
        name: fileName,
        path: filePath,
        features: {
          hasLink: CONFIG.analysisPatterns.hasLink.test(content),
          hasOnClick: CONFIG.analysisPatterns.hasOnClick.test(content),
          hasVariants: CONFIG.analysisPatterns.hasVariants.test(content),
          hasIcon: CONFIG.analysisPatterns.hasIcon.test(content),
          hasTooltip: CONFIG.analysisPatterns.hasTooltip.test(content),
          hasSize: CONFIG.analysisPatterns.hasSize.test(content),
          isDeprecated: CONFIG.analysisPatterns.isDeprecated.test(content)
        },
        purpose: this.detectPurpose(content, fileName),
        linesOfCode: content.split('\n').length,
        complexity: this.calculateComplexity(content)
      };

      return analysis;
    } catch (error) {
      return {
        name: path.basename(filePath, '.js'),
        path: filePath,
        error: error.message
      };
    }
  }

  // Détecter le but du composant
  detectPurpose(content, fileName) {
    if (fileName === 'AddButton') return 'Bouton d\'ajout spécialisé';
    if (fileName === 'Button') return 'Bouton générique';
    if (fileName === 'ActionButton') return 'Bouton d\'action avec tooltip';
    
    // Analyse du contenu pour détecter le but
    if (content.includes('plus-lg') || content.includes('Ajouter')) {
      return 'Bouton d\'ajout';
    }
    if (content.includes('tooltip') || content.includes('iconOnly')) {
      return 'Bouton d\'action';
    }
    if (content.includes('variant') && content.includes('size')) {
      return 'Bouton générique';
    }
    
    return 'But indéterminé';
  }

  // Calculer la complexité
  calculateComplexity(content) {
    const lines = content.split('\n');
    const propsCount = (content.match(/props\./g) || []).length;
    const conditionals = (content.match(/if\s*\(/g) || []).length;
    const functions = (content.match(/const\s+\w+\s*=/g) || []).length;
    
    return {
      lines: lines.length,
      props: propsCount,
      conditionals,
      functions,
      score: propsCount + conditionals * 2 + functions
    };
  }

  // Détecter les doublons
  detectDoublons() {
    const components = this.results.components.filter(c => !c.error);
    
    for (let i = 0; i < components.length; i++) {
      for (let j = i + 1; j < components.length; j++) {
        const comp1 = components[i];
        const comp2 = components[j];
        
        const similarity = this.calculateSimilarity(comp1, comp2);
        
        if (similarity.score > 0.6) {
          this.results.doublons.push({
            component1: comp1.name,
            component2: comp2.name,
            similarity: similarity,
            recommendation: this.getConsolidationRecommendation(comp1, comp2, similarity)
          });
        }
      }
    }
  }

  // Calculer la similarité entre deux composants
  calculateSimilarity(comp1, comp2) {
    const features1 = comp1.features;
    const features2 = comp2.features;
    
    let commonFeatures = 0;
    let totalFeatures = 0;
    
    Object.keys(features1).forEach(feature => {
      if (feature !== 'isDeprecated') {
        totalFeatures++;
        if (features1[feature] === features2[feature]) {
          commonFeatures++;
        }
      }
    });
    
    const featureSimilarity = commonFeatures / totalFeatures;
    const purposeSimilarity = comp1.purpose === comp2.purpose ? 1 : 0;
    
    return {
      score: (featureSimilarity * 0.7) + (purposeSimilarity * 0.3),
      commonFeatures,
      totalFeatures,
      details: {
        features: featureSimilarity,
        purpose: purposeSimilarity
      }
    };
  }

  // Recommandation de consolidation
  getConsolidationRecommendation(comp1, comp2, similarity) {
    if (comp1.features.isDeprecated || comp2.features.isDeprecated) {
      return 'Supprimer le composant déprécié';
    }
    
    if (comp1.name === 'AddButton' && comp2.name === 'Button') {
      return 'AddButton est spécialisé, garder les deux mais éviter la duplication de code';
    }
    
    if (comp1.name === 'ActionButton' && comp2.name === 'Button') {
      return 'ActionButton utilise Button, architecture correcte';
    }
    
    if (similarity.score > 0.8) {
      return 'Forte similarité - consolidation recommandée';
    }
    
    return 'Similarité modérée - vérifier la nécessité des deux composants';
  }

  // Générer des recommandations
  generateRecommendations() {
    const components = this.results.components.filter(c => !c.error);
    
    // Recommandation 1: Composants dépréciés
    const deprecated = components.filter(c => c.features.isDeprecated);
    if (deprecated.length > 0) {
      this.results.recommendations.push({
        type: 'cleanup',
        priority: 'high',
        title: 'Supprimer les composants dépréciés',
        description: `${deprecated.length} composant(s) déprécié(s) détecté(s)`,
        components: deprecated.map(c => c.name)
      });
    }

    // Recommandation 2: Architecture des boutons
    const buttonComponents = components.filter(c => 
      c.name.includes('Button') || c.purpose.includes('Bouton')
    );
    
    if (buttonComponents.length > 2) {
      this.results.recommendations.push({
        type: 'architecture',
        priority: 'medium',
        title: 'Optimiser l\'architecture des boutons',
        description: `${buttonComponents.length} composants de bouton détectés`,
        suggestion: 'Utiliser une hiérarchie: Button (base) → ActionButton (spécialisé) → AddButton (très spécialisé)'
      });
    }

    // Recommandation 3: Doublons détectés
    if (this.results.doublons.length > 0) {
      this.results.recommendations.push({
        type: 'consolidation',
        priority: 'medium',
        title: 'Consolider les composants similaires',
        description: `${this.results.doublons.length} doublon(s) potentiel(s) détecté(s)`
      });
    }
  }

  // Exécuter l'audit complet
  runAudit() {
    console.log('🔍 AUDIT DES DOUBLONS UI TOURCRAFT');
    console.log('==================================\n');

    // Analyser tous les composants boutons
    CONFIG.buttonComponents.forEach(filePath => {
      if (fs.existsSync(filePath)) {
        const analysis = this.analyzeComponent(filePath);
        this.results.components.push(analysis);
        this.results.summary.totalComponents++;
      }
    });

    // Détecter les doublons
    this.detectDoublons();
    this.results.summary.doublonsDetected = this.results.doublons.length;
    this.results.summary.consolidationPossible = this.results.doublons.length > 0;

    // Générer les recommandations
    this.generateRecommendations();

    this.generateReport();
  }

  // Générer le rapport
  generateReport() {
    const { totalComponents, doublonsDetected } = this.results.summary;

    console.log(`📊 RÉSULTATS DE L'AUDIT`);
    console.log(`======================`);
    console.log(`Composants analysés: ${totalComponents}`);
    console.log(`Doublons détectés: ${doublonsDetected}`);
    console.log();

    // Détail des composants
    console.log(`📋 COMPOSANTS ANALYSÉS`);
    console.log(`=====================`);
    this.results.components.forEach(comp => {
      if (comp.error) {
        console.log(`❌ ${comp.name} - Erreur: ${comp.error}`);
        return;
      }

      const status = comp.features.isDeprecated ? '⚠️' : '✅';
      console.log(`${status} ${comp.name}`);
      console.log(`   But: ${comp.purpose}`);
      console.log(`   Fonctionnalités: ${Object.entries(comp.features)
        .filter(([key, value]) => value && key !== 'isDeprecated')
        .map(([key]) => key)
        .join(', ') || 'Aucune'}`);
      console.log(`   Complexité: ${comp.complexity.score} (${comp.complexity.lines} lignes)`);
      console.log();
    });

    // Doublons détectés
    if (this.results.doublons.length > 0) {
      console.log(`🔄 DOUBLONS DÉTECTÉS`);
      console.log(`==================`);
      this.results.doublons.forEach(doublon => {
        console.log(`${doublon.component1} ↔ ${doublon.component2}`);
        console.log(`   Similarité: ${Math.round(doublon.similarity.score * 100)}%`);
        console.log(`   Recommandation: ${doublon.recommendation}`);
        console.log();
      });
    }

    // Recommandations
    if (this.results.recommendations.length > 0) {
      console.log(`🎯 RECOMMANDATIONS`);
      console.log(`=================`);
      this.results.recommendations.forEach(rec => {
        const priority = rec.priority === 'high' ? '🔴' : rec.priority === 'medium' ? '🟡' : '🟢';
        console.log(`${priority} ${rec.title}`);
        console.log(`   ${rec.description}`);
        if (rec.suggestion) console.log(`   💡 ${rec.suggestion}`);
        if (rec.components) console.log(`   📁 Composants: ${rec.components.join(', ')}`);
        console.log();
      });
    }

    // Conclusion
    if (doublonsDetected === 0) {
      console.log(`🎉 EXCELLENT !`);
      console.log(`=============`);
      console.log(`Aucun doublon critique détecté.`);
      console.log(`L'architecture des composants UI est saine.`);
    } else {
      console.log(`⚠️  ATTENTION`);
      console.log(`============`);
      console.log(`${doublonsDetected} doublon(s) détecté(s).`);
      console.log(`Consolidation recommandée pour optimiser le code.`);
    }

    // Sauvegarder le rapport
    const reportPath = 'audit/rapport-ui-doublons.json';
    try {
      if (!fs.existsSync('audit')) {
        fs.mkdirSync('audit', { recursive: true });
      }
      fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
      console.log(`\n📄 Rapport détaillé sauvegardé: ${reportPath}`);
    } catch (error) {
      console.log(`\n⚠️  Impossible de sauvegarder le rapport: ${error.message}`);
    }
  }
}

// Exécuter l'audit
if (require.main === module) {
  const auditor = new UIDoublonAuditor();
  auditor.runAudit();
}

module.exports = UIDoublonAuditor; 