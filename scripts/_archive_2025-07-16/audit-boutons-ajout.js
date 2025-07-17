#!/usr/bin/env node

/**
 * 🔍 AUDIT DES BOUTONS D'AJOUT TOURCRAFT
 * =====================================
 * 
 * Ce script vérifie la standardisation des boutons d'ajout :
 * - Cohérence des styles CSS
 * - Uniformité des textes et icônes
 * - Utilisation des variables CSS communes
 * - Accessibilité
 */

const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  headerFiles: [
    'src/components/concerts/sections/ConcertsListHeader.js',
    'src/components/artistes/sections/ArtistesListHeader.js',
    'src/components/lieux/desktop/sections/LieuxListHeader.js',
    'src/components/programmateurs/desktop/sections/ProgrammateursListHeader.js'
  ],
  cssFiles: [
    'src/components/concerts/sections/ConcertsListHeader.module.css',
    'src/components/artistes/sections/ArtistesListHeader.module.css',
    'src/components/lieux/desktop/sections/LieuxListHeader.module.css',
    'src/components/programmateurs/desktop/sections/ProgrammateursListHeader.module.css'
  ],
  expectedPatterns: {
    icon: 'bi-plus-lg',
    textPattern: /Ajouter un/,
    cssClass: 'addButton',
    hoverVariable: '--tc-color-primary-hover'
  }
};

class AddButtonAuditor {
  constructor() {
    this.results = {
      files: [],
      summary: {
        total: 0,
        standardized: 0,
        issues: []
      }
    };
  }

  // Analyser un fichier JS
  analyzeJSFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const fileName = path.basename(filePath);
      
      const analysis = {
        file: fileName,
        path: filePath,
        type: 'JS',
        issues: [],
        standardized: true
      };

      // Vérifier l'icône
      const iconMatch = content.match(/bi-plus-\w+/);
      if (!iconMatch || iconMatch[0] !== CONFIG.expectedPatterns.icon) {
        analysis.issues.push(`Icône non standardisée: ${iconMatch ? iconMatch[0] : 'non trouvée'} (attendu: ${CONFIG.expectedPatterns.icon})`);
        analysis.standardized = false;
      }

      // Vérifier le texte
      const textMatch = content.match(/Ajouter un \w+|Nouveau \w+/);
      if (!textMatch || !CONFIG.expectedPatterns.textPattern.test(textMatch[0])) {
        analysis.issues.push(`Texte non standardisé: ${textMatch ? textMatch[0] : 'non trouvé'} (attendu: format "Ajouter un X")`);
        analysis.standardized = false;
      }

      // Vérifier la classe CSS
      if (!content.includes('addButton')) {
        analysis.issues.push('Classe CSS .addButton non trouvée');
        analysis.standardized = false;
      }

      // Vérifier l'absence de Bootstrap
      if (content.includes('btn btn-primary') || content.includes('Button') && content.includes('react-bootstrap')) {
        analysis.issues.push('Utilise encore Bootstrap au lieu du CSS standardisé');
        analysis.standardized = false;
      }

      return analysis;
    } catch (error) {
      return {
        file: path.basename(filePath),
        path: filePath,
        type: 'JS',
        error: error.message,
        standardized: false
      };
    }
  }

  // Analyser un fichier CSS
  analyzeCSSFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const fileName = path.basename(filePath);
      
      const analysis = {
        file: fileName,
        path: filePath,
        type: 'CSS',
        issues: [],
        standardized: true
      };

      // Vérifier la présence de .addButton
      if (!content.includes('.addButton')) {
        analysis.issues.push('Classe .addButton non définie');
        analysis.standardized = false;
      }

      // Vérifier l'utilisation de la variable hover
      if (content.includes('.addButton:hover') && !content.includes(CONFIG.expectedPatterns.hoverVariable)) {
        analysis.issues.push(`Variable hover non standardisée (attendu: ${CONFIG.expectedPatterns.hoverVariable})`);
        analysis.standardized = false;
      }

      // Vérifier les variables CSS modernes
      const modernVariables = ['--tc-color-primary', '--tc-space-', '--tc-font-', '--tc-radius-'];
      const hasModernVariables = modernVariables.some(variable => content.includes(variable));
      
      if (!hasModernVariables) {
        analysis.issues.push('N\'utilise pas les variables CSS modernes TourCraft');
        analysis.standardized = false;
      }

      return analysis;
    } catch (error) {
      return {
        file: path.basename(filePath),
        path: filePath,
        type: 'CSS',
        error: error.message,
        standardized: false
      };
    }
  }

  // Exécuter l'audit complet
  runAudit() {
    console.log('🔍 AUDIT DES BOUTONS D\'AJOUT TOURCRAFT');
    console.log('=====================================\n');

    // Analyser les fichiers JS
    CONFIG.headerFiles.forEach(filePath => {
      if (fs.existsSync(filePath)) {
        const analysis = this.analyzeJSFile(filePath);
        this.results.files.push(analysis);
        this.results.summary.total++;
        if (analysis.standardized) this.results.summary.standardized++;
      } else {
        console.log(`⚠️  Fichier non trouvé: ${filePath}`);
      }
    });

    // Analyser les fichiers CSS
    CONFIG.cssFiles.forEach(filePath => {
      if (fs.existsSync(filePath)) {
        const analysis = this.analyzeCSSFile(filePath);
        this.results.files.push(analysis);
        this.results.summary.total++;
        if (analysis.standardized) this.results.summary.standardized++;
      } else {
        console.log(`⚠️  Fichier CSS non trouvé: ${filePath}`);
      }
    });

    this.generateReport();
  }

  // Générer le rapport
  generateReport() {
    const { total, standardized } = this.results.summary;
    const percentage = total > 0 ? Math.round((standardized / total) * 100) : 0;

    console.log(`📊 RÉSULTATS DE L'AUDIT`);
    console.log(`======================`);
    console.log(`Total de fichiers analysés: ${total}`);
    console.log(`Fichiers standardisés: ${standardized}/${total} (${percentage}%)`);
    console.log();

    // Détail par fichier
    this.results.files.forEach(file => {
      const status = file.standardized ? '✅' : '❌';
      console.log(`${status} ${file.file} (${file.type})`);
      
      if (file.error) {
        console.log(`   ❌ Erreur: ${file.error}`);
      }
      
      if (file.issues && file.issues.length > 0) {
        file.issues.forEach(issue => {
          console.log(`   ⚠️  ${issue}`);
        });
      }
      console.log();
    });

    // Recommandations
    if (percentage < 100) {
      console.log(`🎯 RECOMMANDATIONS`);
      console.log(`=================`);
      console.log(`- Corriger les ${total - standardized} fichiers non standardisés`);
      console.log(`- Utiliser le composant AddButton.js pour les nouveaux boutons`);
      console.log(`- Vérifier l'accessibilité avec aria-label`);
      console.log();
    } else {
      console.log(`🎉 FÉLICITATIONS !`);
      console.log(`==================`);
      console.log(`Tous les boutons d'ajout sont standardisés !`);
      console.log();
    }

    // Sauvegarder le rapport
    const reportPath = 'audit/rapport-boutons-ajout.json';
    try {
      if (!fs.existsSync('audit')) {
        fs.mkdirSync('audit', { recursive: true });
      }
      fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
      console.log(`📄 Rapport détaillé sauvegardé: ${reportPath}`);
    } catch (error) {
      console.log(`⚠️  Impossible de sauvegarder le rapport: ${error.message}`);
    }
  }
}

// Exécuter l'audit
if (require.main === module) {
  const auditor = new AddButtonAuditor();
  auditor.runAudit();
}

module.exports = AddButtonAuditor; 