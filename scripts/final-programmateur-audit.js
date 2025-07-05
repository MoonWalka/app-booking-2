#!/usr/bin/env node

/**
 * Script d'audit final pour identifier toutes les références "programmateur" restantes
 * dans le codebase après migration vers "contact"
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const PROJECT_ROOT = '/Users/meltinrecordz/Documents/TourCraft/code/app-booking-2';
const SEARCH_PATTERN = 'programmateur';
const OUTPUT_FILE = path.join(PROJECT_ROOT, 'RAPPORT_AUDIT_FINAL_PROGRAMMATEUR.md');

// Dossiers à ignorer dans l'audit
const IGNORE_DIRS = [
  'node_modules',
  '.git',
  'coverage',
  'build',
  'dist',
  'docs',
  'tools/logs',
  'audit'
];

// Extensions de fichiers à auditer
const INCLUDE_EXTENSIONS = ['.js', '.jsx', '.css', '.json', '.md'];

class ProgrammateurAudit {
  constructor() {
    this.results = {
      critical: [],      // Code fonctionnel
      warnings: [],      // CSS classes, comments
      documentation: [], // Fichiers de documentation
      filenames: [],     // Noms de fichiers/dossiers
      total: 0
    };
  }

  /**
   * Lance l'audit complet
   */
  async runAudit() {
    console.log('🔍 Début de l\'audit final des références "programmateur"...\n');

    // 1. Recherche dans le contenu des fichiers
    this.auditFileContents();
    
    // 2. Recherche dans les noms de fichiers
    this.auditFilenames();
    
    // 3. Génération du rapport
    this.generateReport();

    console.log('✅ Audit terminé. Rapport généré:', OUTPUT_FILE);
  }

  /**
   * Audit du contenu des fichiers
   */
  auditFileContents() {
    console.log('📄 Audit du contenu des fichiers...');

    try {
      // Utiliser grep pour rechercher de manière récursive
      const grepCommand = `grep -r -i -n "${SEARCH_PATTERN}" "${PROJECT_ROOT}/src" --include="*.js" --include="*.jsx" --include="*.css" --include="*.json"`;
      const output = execSync(grepCommand, { encoding: 'utf8' });
      
      const lines = output.trim().split('\n');
      
      lines.forEach(line => {
        if (!line.trim()) return;
        
        const [filePath, lineNumber, ...contentParts] = line.split(':');
        const content = contentParts.join(':').trim();
        
        // Classifier selon le type
        const classification = this.classifyOccurrence(filePath, content);
        
        const occurrence = {
          file: path.relative(PROJECT_ROOT, filePath),
          line: parseInt(lineNumber),
          content: content,
          type: classification.type,
          severity: classification.severity
        };

        // Ajouter à la catégorie appropriée
        switch (classification.severity) {
          case 'critical':
            this.results.critical.push(occurrence);
            break;
          case 'warning':
            this.results.warnings.push(occurrence);
            break;
          case 'documentation':
            this.results.documentation.push(occurrence);
            break;
        }

        this.results.total++;
      });

    } catch (error) {
      if (error.status === 1) {
        console.log('Aucune occurrence trouvée dans le contenu des fichiers.');
      } else {
        console.error('Erreur lors de la recherche:', error.message);
      }
    }
  }

  /**
   * Audit des noms de fichiers et dossiers
   */
  auditFilenames() {
    console.log('📁 Audit des noms de fichiers et dossiers...');

    try {
      const findCommand = `find "${PROJECT_ROOT}" -type f -name "*${SEARCH_PATTERN}*" ! -path "*/.git/*" ! -path "*/node_modules/*" ! -path "*/coverage/*"`;
      const output = execSync(findCommand, { encoding: 'utf8' });
      
      if (output.trim()) {
        const files = output.trim().split('\n');
        files.forEach(file => {
          this.results.filenames.push({
            path: path.relative(PROJECT_ROOT, file),
            type: 'filename'
          });
          this.results.total++;
        });
      }

      const findDirCommand = `find "${PROJECT_ROOT}" -type d -name "*${SEARCH_PATTERN}*" ! -path "*/.git/*" ! -path "*/node_modules/*" ! -path "*/coverage/*"`;
      const dirOutput = execSync(findDirCommand, { encoding: 'utf8' });
      
      if (dirOutput.trim()) {
        const dirs = dirOutput.trim().split('\n');
        dirs.forEach(dir => {
          this.results.filenames.push({
            path: path.relative(PROJECT_ROOT, dir),
            type: 'directory'
          });
          this.results.total++;
        });
      }

    } catch (error) {
      if (error.status === 1) {
        console.log('Aucun fichier/dossier avec "programmateur" dans le nom.');
      } else {
        console.error('Erreur lors de la recherche de fichiers:', error.message);
      }
    }
  }

  /**
   * Classifie une occurrence selon son type et sa sévérité
   */
  classifyOccurrence(filePath, content) {
    const fileName = path.basename(filePath);
    const fileExt = path.extname(filePath);
    const contentLower = content.toLowerCase();

    // Documentation
    if (fileExt === '.md' || filePath.includes('/docs/')) {
      return { type: 'documentation', severity: 'documentation' };
    }

    // CSS - Classes et commentaires
    if (fileExt === '.css') {
      if (contentLower.includes('/*') || contentLower.includes('*/') || contentLower.includes('//')) {
        return { type: 'css_comment', severity: 'warning' };
      }
      if (contentLower.includes('.') || contentLower.includes('#')) {
        return { type: 'css_class', severity: 'critical' };
      }
      return { type: 'css_other', severity: 'warning' };
    }

    // JavaScript/JSX
    if (fileExt === '.js' || fileExt === '.jsx') {
      // Commentaires
      if (contentLower.includes('//') || contentLower.includes('/*') || contentLower.includes('*/') || contentLower.includes('*')) {
        return { type: 'js_comment', severity: 'warning' };
      }
      
      // Variables, fonctions, propriétés
      if (contentLower.includes('const ') || 
          contentLower.includes('let ') || 
          contentLower.includes('var ') ||
          contentLower.includes('function ') ||
          contentLower.includes('export ') ||
          contentLower.includes('import ')) {
        return { type: 'js_code', severity: 'critical' };
      }

      // Propriétés d'objets
      if (contentLower.includes(':') || contentLower.includes('.')) {
        return { type: 'js_property', severity: 'critical' };
      }

      // Strings et autres
      if (contentLower.includes("'") || contentLower.includes('"') || contentLower.includes('`')) {
        return { type: 'js_string', severity: 'warning' };
      }

      return { type: 'js_other', severity: 'critical' };
    }

    // JSON
    if (fileExt === '.json') {
      return { type: 'json', severity: 'critical' };
    }

    return { type: 'unknown', severity: 'warning' };
  }

  /**
   * Génère le rapport d'audit
   */
  generateReport() {
    console.log('📊 Génération du rapport...');

    const report = this.buildReportContent();
    
    fs.writeFileSync(OUTPUT_FILE, report, 'utf8');
  }

  /**
   * Construit le contenu du rapport
   */
  buildReportContent() {
    const now = new Date().toLocaleString('fr-FR');
    
    let report = `# 🔍 RAPPORT D'AUDIT FINAL - RÉFÉRENCES "PROGRAMMATEUR"

**Date:** ${now}
**Total d'occurrences trouvées:** ${this.results.total}

## 📋 RÉSUMÉ EXÉCUTIF

`;

    // Statistiques
    report += `### Statistiques par criticité
- **🔴 CRITIQUE (Code fonctionnel):** ${this.results.critical.length} occurrences
- **🟠 AVERTISSEMENT (CSS/Commentaires):** ${this.results.warnings.length} occurrences  
- **📝 DOCUMENTATION:** ${this.results.documentation.length} occurrences
- **📁 NOMS DE FICHIERS/DOSSIERS:** ${this.results.filenames.length} occurrences

`;

    // Plan d'action
    if (this.results.critical.length > 0) {
      report += `## 🚨 ACTIONS CRITIQUES REQUISES

Les éléments suivants nécessitent une correction immédiate car ils affectent le fonctionnement du code :

`;
      
      this.results.critical.forEach((item, index) => {
        report += `### ${index + 1}. \`${item.file}\` (ligne ${item.line})
**Type:** ${item.type}
**Code:** \`${item.content}\`

`;
      });
    }

    // Avertissements
    if (this.results.warnings.length > 0) {
      report += `## ⚠️ AVERTISSEMENTS (Non-bloquants)

Ces éléments peuvent être corrigés pour améliorer la cohérence :

`;
      
      // Grouper par type
      const warningsByType = {};
      this.results.warnings.forEach(item => {
        if (!warningsByType[item.type]) {
          warningsByType[item.type] = [];
        }
        warningsByType[item.type].push(item);
      });

      Object.keys(warningsByType).forEach(type => {
        report += `### ${type.replace('_', ' ').toUpperCase()}
`;
        warningsByType[type].forEach(item => {
          report += `- \`${item.file}:${item.line}\` - ${item.content}
`;
        });
        report += `
`;
      });
    }

    // Noms de fichiers
    if (this.results.filenames.length > 0) {
      report += `## 📁 NOMS DE FICHIERS ET DOSSIERS

`;
      this.results.filenames.forEach(item => {
        report += `- **${item.type.toUpperCase()}:** \`${item.path}\`
`;
      });
      report += `
`;
    }

    // Documentation
    if (this.results.documentation.length > 0) {
      report += `## 📝 OCCURRENCES DANS LA DOCUMENTATION

`;
      this.results.documentation.forEach(item => {
        report += `- \`${item.file}:${item.line}\` - ${item.content}
`;
      });
      report += `
`;
    }

    // Plan d'action recommandé
    report += `## 🎯 PLAN D'ACTION RECOMMANDÉ

### Priorité 1 - Critique (🔴)
${this.results.critical.length === 0 ? 
  '✅ Aucun élément critique trouvé.' : 
  '❌ Corriger immédiatement les ' + this.results.critical.length + ' éléments critiques listés ci-dessus.'}

### Priorité 2 - Noms de fichiers (📁)
${this.results.filenames.length === 0 ? 
  '✅ Aucun fichier/dossier à renommer.' : 
  '🔄 Renommer les ' + this.results.filenames.length + ' fichiers/dossiers contenant "programmateur".'}

### Priorité 3 - Avertissements (⚠️)
${this.results.warnings.length === 0 ? 
  '✅ Aucun avertissement.' : 
  '📝 Optionnel : corriger les ' + this.results.warnings.length + ' avertissements pour une meilleure cohérence.'}

---

**⚡ Migration "programmateur" → "contact" :** ${this.results.critical.length === 0 && this.results.filenames.length === 0 ? 'TERMINÉE ✅' : 'EN COURS 🔄'}
`;

    return report;
  }
}

// Exécution du script
if (require.main === module) {
  const audit = new ProgrammateurAudit();
  audit.runAudit().catch(console.error);
}

module.exports = ProgrammateurAudit;