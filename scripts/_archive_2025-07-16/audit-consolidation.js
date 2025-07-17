#!/usr/bin/env node

/**
 * 🔍 AUDIT DE CONSOLIDATION CSS TOURCRAFT
 * =======================================
 * 
 * Ce script vérifie la consolidation des variables CSS et détecte :
 * - Les variables redondantes
 * - Les variables manquantes
 * - Les incohérences de nommage
 * - L'utilisation des variables communes
 */

const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
    cssFiles: [
        'src/styles/base/colors.css',
        'src/styles/base/variables.css',
        'src/components/layout/Sidebar.module.css'
    ],
    variablePattern: /--tc-[a-zA-Z0-9-]+/g,
    definitionPattern: /--tc-[a-zA-Z0-9-]+\s*:/g,
    usagePattern: /var\(--tc-[a-zA-Z0-9-]+\)/g
};

class CSSAuditor {
    constructor() {
        this.variables = {
            defined: new Set(),
            used: new Set(),
            duplicates: new Map(),
            files: new Map()
        };
    }

    /**
     * Lance l'audit complet
     */
    async audit() {
        console.log('🔍 AUDIT DE CONSOLIDATION CSS TOURCRAFT');
        console.log('=======================================\n');

        // Analyse des fichiers
        for (const filePath of CONFIG.cssFiles) {
            await this.analyzeFile(filePath);
        }

        // Génération du rapport
        this.generateReport();
    }

    /**
     * Analyse un fichier CSS
     */
    async analyzeFile(filePath) {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            const fileName = path.basename(filePath);

            console.log(`📄 Analyse de ${fileName}...`);

            // Variables définies
            const definitions = content.match(CONFIG.definitionPattern) || [];
            definitions.forEach(def => {
                const varName = def.replace(':', '').trim();
                
                if (this.variables.defined.has(varName)) {
                    // Variable dupliquée
                    if (!this.variables.duplicates.has(varName)) {
                        this.variables.duplicates.set(varName, []);
                    }
                    this.variables.duplicates.get(varName).push(fileName);
                } else {
                    this.variables.defined.add(varName);
                    this.variables.files.set(varName, fileName);
                }
            });

            // Variables utilisées
            const usages = content.match(CONFIG.usagePattern) || [];
            usages.forEach(usage => {
                const varName = usage.replace('var(', '').replace(')', '');
                this.variables.used.add(varName);
            });

            console.log(`   ✅ ${definitions.length} variables définies, ${usages.length} utilisations`);

        } catch (error) {
            console.error(`❌ Erreur lors de l'analyse de ${filePath}:`, error.message);
        }
    }

    /**
     * Génère le rapport d'audit
     */
    generateReport() {
        console.log('\n📊 RAPPORT D\'AUDIT');
        console.log('==================\n');

        // Statistiques générales
        console.log('📈 STATISTIQUES GÉNÉRALES');
        console.log(`   Variables définies: ${this.variables.defined.size}`);
        console.log(`   Variables utilisées: ${this.variables.used.size}`);
        console.log(`   Variables dupliquées: ${this.variables.duplicates.size}`);

        // Variables manquantes
        const missing = [...this.variables.used].filter(v => !this.variables.defined.has(v));
        console.log(`   Variables manquantes: ${missing.length}\n`);

        // Variables dupliquées
        if (this.variables.duplicates.size > 0) {
            console.log('🔄 VARIABLES DUPLIQUÉES');
            this.variables.duplicates.forEach((files, varName) => {
                console.log(`   ${varName} → ${files.join(', ')}`);
            });
            console.log('');
        }

        // Variables manquantes
        if (missing.length > 0) {
            console.log('❌ VARIABLES MANQUANTES');
            missing.forEach(varName => {
                console.log(`   ${varName}`);
            });
            console.log('');
        }

        // Variables inutilisées
        const unused = [...this.variables.defined].filter(v => !this.variables.used.has(v));
        if (unused.length > 0) {
            console.log('🗑️  VARIABLES INUTILISÉES');
            unused.forEach(varName => {
                const file = this.variables.files.get(varName);
                console.log(`   ${varName} (${file})`);
            });
            console.log('');
        }

        // Recommandations
        this.generateRecommendations(missing, unused);
    }

    /**
     * Génère les recommandations
     */
    generateRecommendations(missing, unused) {
        console.log('💡 RECOMMANDATIONS');
        console.log('==================\n');

        if (missing.length > 0) {
            console.log('🎯 VARIABLES À AJOUTER:');
            missing.forEach(varName => {
                console.log(`   - Ajouter ${varName} dans colors.css ou variables.css`);
            });
            console.log('');
        }

        if (unused.length > 0) {
            console.log('🧹 VARIABLES À SUPPRIMER:');
            unused.forEach(varName => {
                console.log(`   - Supprimer ${varName} (inutilisée)`);
            });
            console.log('');
        }

        if (this.variables.duplicates.size > 0) {
            console.log('🔧 DOUBLONS À RÉSOUDRE:');
            this.variables.duplicates.forEach((files, varName) => {
                console.log(`   - Consolider ${varName} dans un seul fichier`);
            });
            console.log('');
        }

        // Score de consolidation
        const totalIssues = missing.length + unused.length + this.variables.duplicates.size;
        const score = Math.max(0, 100 - (totalIssues * 5));
        
        console.log(`🏆 SCORE DE CONSOLIDATION: ${score}/100`);
        
        if (score >= 90) {
            console.log('   ✅ Excellente consolidation !');
        } else if (score >= 70) {
            console.log('   ⚠️  Consolidation correcte, quelques améliorations possibles');
        } else {
            console.log('   ❌ Consolidation à améliorer');
        }
    }
}

// Exécution
if (require.main === module) {
    const auditor = new CSSAuditor();
    auditor.audit().catch(console.error);
}

module.exports = CSSAuditor; 