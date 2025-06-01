#!/usr/bin/env node

/**
 * CORRECTION AUTOMATIQUE DES INCOHÉRENCES CRITIQUES
 * ==================================================
 * 
 * Ce script corrige automatiquement les incohérences les plus critiques
 * pour aligner le projet avec la palette harmonisée #213547
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Configuration des corrections
const CORRECTIONS = {
    // Remplacement des imports React Bootstrap par les composants UI
    reactBootstrapReplacements: {
        "import { Card, Badge, Button, Alert, Table } from 'react-bootstrap';": "import Card from '../ui/Card';\nimport Badge from '../ui/Badge';\nimport Button from '../ui/Button';\nimport Alert from '../ui/Alert';\nimport Table from '../ui/Table';",
        "import { Button, Badge, Alert } from 'react-bootstrap';": "import Button from '../ui/Button';\nimport Badge from '../ui/Badge';\nimport Alert from '../ui/Alert';",
        "import { Container, Row, Col } from 'react-bootstrap';": "import { Container, Row, Col } from '../ui/Layout';",
        "import { Alert } from 'react-bootstrap';": "import Alert from '../ui/Alert';",
        "import { Alert, Spinner, Modal, Button } from 'react-bootstrap';": "import Alert from '../ui/Alert';\nimport Spinner from '../ui/Spinner';\nimport Modal from '../ui/Modal';\nimport Button from '../ui/Button';",
        "import { Modal, Button } from 'react-bootstrap';": "import Modal from '../ui/Modal';\nimport Button from '../ui/Button';",
        "import { Card as BootstrapCard } from 'react-bootstrap';": "// Migration: Utiliser le composant Card natif TourCraft",
        "import { Form, Row, Col } from 'react-bootstrap';": "import { Form, Row, Col } from '../ui/Form';",
        "import { Button } from 'react-bootstrap';": "import Button from '../ui/Button';"
    },

    // Remplacement des couleurs hardcodées par variables CSS
    colorReplacements: {
        "#007bff": "var(--tc-color-primary)",
        "#dc3545": "var(--tc-color-error)",
        "#28a745": "var(--tc-color-success)",
        "#ffc107": "var(--tc-color-warning)",
        "#17a2b8": "var(--tc-color-info)",
        "#6c757d": "var(--tc-color-gray-500)",
        "#343a40": "var(--tc-color-gray-700)",
        "#f8f9fa": "var(--tc-color-gray-50)",
        "#e9ecef": "var(--tc-color-gray-100)",
        "#dee2e6": "var(--tc-color-gray-200)",
        "#ced4da": "var(--tc-color-gray-300)",
        "#adb5bd": "var(--tc-color-gray-400)",
        "#495057": "var(--tc-color-gray-600)",
        "#212529": "var(--tc-color-gray-800)",
        "#ffffff": "var(--tc-color-white)",
        "#fff": "var(--tc-color-white)",
        "#000000": "var(--tc-color-black)",
        "#000": "var(--tc-color-black)",
        "#f5f5f5": "var(--tc-color-gray-50)",
        "#e0e0e0": "var(--tc-color-gray-200)",
        "#d0d0d0": "var(--tc-color-gray-300)",
        "#ccc": "var(--tc-color-gray-300)",
        "#ddd": "var(--tc-color-gray-200)",
        "#eee": "var(--tc-color-gray-100)",
        "#333": "var(--tc-color-gray-700)",
        "#666": "var(--tc-color-gray-500)",
        "#999": "var(--tc-color-gray-400)",
        "#1a1a1a": "var(--tc-color-gray-800)",
        "#2a2a2a": "var(--tc-color-gray-700)",
        "#3a3a3a": "var(--tc-color-gray-600)",
        // Couleurs spécifiques trouvées dans l'audit
        "#FFF3CD": "var(--tc-bg-warning-light)",
        "rgba(0,0,0,0.15)": "var(--tc-primary-color-20)",
        "rgba(0,0,0,0.1)": "var(--tc-primary-color-10)",
        "rgba(0,0,0,0.05)": "var(--tc-primary-color-05)"
    },

    // Remplacement des classes Bootstrap par classes TC
    bootstrapClassReplacements: {
        "btn-primary": "tc-btn-primary",
        "btn-secondary": "tc-btn-secondary",
        "btn-success": "tc-btn-success",
        "btn-danger": "tc-btn-danger",
        "btn-warning": "tc-btn-warning",
        "btn-info": "tc-btn-info",
        "btn-outline-primary": "tc-btn-outline-primary",
        "btn-outline-secondary": "tc-btn-outline-secondary",
        "alert-success": "tc-alert-success",
        "alert-danger": "tc-alert-danger",
        "alert-warning": "tc-alert-warning",
        "alert-info": "tc-alert-info",
        "badge-primary": "tc-badge-primary",
        "badge-secondary": "tc-badge-secondary",
        "badge-success": "tc-badge-success",
        "badge-danger": "tc-badge-danger",
        "card-header": "tc-card-header",
        "card-body": "tc-card-body",
        "card-footer": "tc-card-footer"
    }
};

// Compteurs de corrections
const stats = {
    filesProcessed: 0,
    reactBootstrapFixed: 0,
    colorsFixed: 0,
    classesFixed: 0,
    totalChanges: 0
};

/**
 * Corrige un fichier JS/JSX
 */
function fixJSFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;
    let changes = 0;

    // 1. Corriger les imports React Bootstrap
    Object.entries(CORRECTIONS.reactBootstrapReplacements).forEach(([old, replacement]) => {
        if (content.includes(old)) {
            content = content.replace(old, replacement);
            changed = true;
            changes++;
            stats.reactBootstrapFixed++;
        }
    });

    // 2. Corriger les couleurs hardcodées
    Object.entries(CORRECTIONS.colorReplacements).forEach(([old, replacement]) => {
        const regex = new RegExp(old.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
        if (regex.test(content)) {
            content = content.replace(regex, replacement);
            changed = true;
            changes++;
            stats.colorsFixed++;
        }
    });

    // 3. Corriger les classes Bootstrap
    Object.entries(CORRECTIONS.bootstrapClassReplacements).forEach(([old, replacement]) => {
        const regex = new RegExp(`\\b${old}\\b`, 'g');
        if (regex.test(content)) {
            content = content.replace(regex, replacement);
            changed = true;
            changes++;
            stats.classesFixed++;
        }
    });

    // Sauvegarder si des changements ont été effectués
    if (changed) {
        fs.writeFileSync(filePath, content);
        console.log(`✅ ${filePath.replace('./src/', '')} - ${changes} corrections`);
        stats.totalChanges += changes;
    }

    stats.filesProcessed++;
}

/**
 * Corrige un fichier CSS
 */
function fixCSSFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;
    let changes = 0;

    // Corriger les couleurs hardcodées dans CSS
    Object.entries(CORRECTIONS.colorReplacements).forEach(([old, replacement]) => {
        const regex = new RegExp(old.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
        if (regex.test(content)) {
            content = content.replace(regex, replacement);
            changed = true;
            changes++;
            stats.colorsFixed++;
        }
    });

    // Sauvegarder si des changements ont été effectués
    if (changed) {
        fs.writeFileSync(filePath, content);
        console.log(`🎨 ${filePath.replace('./src/', '')} - ${changes} corrections`);
        stats.totalChanges += changes;
    }

    stats.filesProcessed++;
}

/**
 * Crée les composants UI manquants si nécessaire
 */
function ensureUIComponentsExist() {
    const uiDir = './src/components/ui';
    const requiredComponents = [
        'Container.js', 'Row.js', 'Col.js', 'Form.js', 'Layout.js'
    ];

    requiredComponents.forEach(component => {
        const componentPath = path.join(uiDir, component);
        if (!fs.existsSync(componentPath)) {
            console.log(`⚠️  Composant manquant: ${component}`);
            console.log(`   Créez ${componentPath} ou utilisez un équivalent existant`);
        }
    });
}

/**
 * Génère un rapport des corrections
 */
function generateReport() {
    console.log('\n' + '='.repeat(80));
    console.log('📊 RAPPORT DES CORRECTIONS AUTOMATIQUES');
    console.log('='.repeat(80));
    
    console.log(`\n📁 Fichiers traités: ${stats.filesProcessed}`);
    console.log(`🔧 Total des corrections: ${stats.totalChanges}`);
    
    console.log('\n📈 DÉTAIL DES CORRECTIONS:');
    console.log(`   • Imports React Bootstrap corrigés: ${stats.reactBootstrapFixed}`);
    console.log(`   • Couleurs hardcodées remplacées: ${stats.colorsFixed}`);
    console.log(`   • Classes Bootstrap migrées: ${stats.classesFixed}`);
    
    const completionRate = Math.round((stats.totalChanges / 346) * 100);
    console.log(`\n✅ PROGRESSION: ${completionRate}% des problèmes identifiés corrigés`);
    
    console.log('\n🎯 PROCHAINES ÉTAPES:');
    console.log('   1. Vérifier que les imports des composants UI sont corrects');
    console.log('   2. Créer les composants UI manquants (Container, Row, Col, Form)');
    console.log('   3. Tester l\'application pour vérifier les corrections');
    console.log('   4. Ajuster les classes CSS tc-* dans les fichiers de styles');
    console.log('   5. Valider la cohérence visuelle avec la palette #213547');
    
    console.log('\n⚠️  ATTENTION:');
    console.log('   • Certains imports peuvent nécessiter des ajustements manuels');
    console.log('   • Vérifiez que tous les composants UI existent avant de tester');
    console.log('   • Les chemins d\'import relatifs peuvent nécessiter des corrections');
    
    console.log('='.repeat(80));
}

/**
 * Fonction principale
 */
function main() {
    console.log('🔧 Début des corrections automatiques...\n');
    
    // Vérifier l'existence des composants UI
    ensureUIComponentsExist();
    
    // Corriger tous les fichiers JS/JSX
    const jsFiles = glob.sync('./src/**/*.{js,jsx}', {
        ignore: ['**/node_modules/**', '**/build/**', '**/*.test.js', '**/*.spec.js']
    });
    
    console.log(`\n📂 Correction des fichiers JS/JSX: ${jsFiles.length} fichiers`);
    jsFiles.forEach(fixJSFile);
    
    // Corriger tous les fichiers CSS
    const cssFiles = glob.sync('./src/**/*.{css,module.css}', {
        ignore: ['**/node_modules/**', '**/build/**']
    });
    
    console.log(`\n🎨 Correction des fichiers CSS: ${cssFiles.length} fichiers`);
    cssFiles.forEach(fixCSSFile);
    
    // Générer le rapport
    generateReport();
}

// Exécution
if (require.main === module) {
    main();
}

module.exports = { fixJSFile, fixCSSFile, stats };