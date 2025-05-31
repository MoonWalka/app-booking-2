#!/usr/bin/env node

/**
 * CORRECTION SPÉCIFIQUE DES COMPOSANTS DEBUG
 * ===========================================
 * 
 * Les composants de debug utilisent beaucoup de couleurs hardcodées.
 * Ce script les harmonise avec la palette #213547.
 */

const fs = require('fs');

// Corrections spécifiques pour ProfilerMonitor.css
function fixProfilerMonitorCSS() {
    const filePath = './src/components/debug/ProfilerMonitor.css';
    
    if (!fs.existsSync(filePath)) {
        console.log(`❌ Fichier non trouvé: ${filePath}`);
        return;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Remplacements harmonisés avec #213547
    const replacements = {
        '#1a1a1a': 'var(--tc-color-gray-800)',
        '#fff': 'var(--tc-color-white)',
        '#2a2a2a': 'var(--tc-color-gray-700)',
        '#3a3a3a': 'var(--tc-color-gray-600)',
        '#666': 'var(--tc-color-gray-500)',
        '#999': 'var(--tc-color-gray-400)',
        '#444': 'var(--tc-color-gray-600)',
        '#555': 'var(--tc-color-gray-500)',
        'rgba(255, 255, 255, 0.1)': 'var(--tc-hover-overlay-light)',
        'rgba(0, 0, 0, 0.5)': 'var(--tc-primary-color-30)',
        
        // Couleurs de statut harmonisées
        '#4caf50': 'var(--tc-color-success)',
        '#ff9800': 'var(--tc-color-warning)',
        '#f44336': 'var(--tc-color-error)',
        'rgba(255, 152, 0, 0.1)': 'var(--tc-warning-color-10)',
        'rgba(244, 67, 54, 0.1)': 'var(--tc-danger-color-10)'
    };
    
    let changes = 0;
    Object.entries(replacements).forEach(([old, replacement]) => {
        const regex = new RegExp(old.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
        if (content.includes(old)) {
            content = content.replace(regex, replacement);
            changes++;
        }
    });
    
    if (changes > 0) {
        fs.writeFileSync(filePath, content);
        console.log(`✅ ProfilerMonitor.css harmonisé - ${changes} corrections`);
    }
}

// Correction du composant Button.js (retirer l'import react-bootstrap)
function fixButtonComponent() {
    const filePath = './src/components/ui/Button.js';
    
    if (!fs.existsSync(filePath)) {
        console.log(`❌ Fichier non trouvé: ${filePath}`);
        return;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Remplacer l'import react-bootstrap par un composant tooltip natif
    const oldTooltipCode = `  // Si une infobulle est fournie et que c'est un bouton avec icône uniquement
  if (tooltip && iconOnly) {
    // Importer dynamiquement react-bootstrap pour éviter les problèmes de dépendances
    const { OverlayTrigger, Tooltip } = require('react-bootstrap');
    
    return (
      <OverlayTrigger
        placement="top"
        overlay={<Tooltip>{tooltip}</Tooltip>}
      >
        <button
          type={type}
          className={buttonClasses}
          onClick={(e) => {
            if (onClick) onClick(e);
          }}
          disabled={disabled}
          {...domProps}
        >
          {buttonContent}
        </button>
      </OverlayTrigger>
    );
  }`;

    const newTooltipCode = `  // Si une infobulle est fournie et que c'est un bouton avec icône uniquement
  if (tooltip && iconOnly) {
    return (
      <div className={styles.tooltipWrapper} title={tooltip}>
        <button
          type={type}
          className={buttonClasses}
          onClick={(e) => {
            if (onClick) onClick(e);
          }}
          disabled={disabled}
          {...domProps}
        >
          {buttonContent}
        </button>
      </div>
    );
  }`;

    if (content.includes('react-bootstrap')) {
        content = content.replace(oldTooltipCode, newTooltipCode);
        fs.writeFileSync(filePath, content);
        console.log(`✅ Button.js - Import react-bootstrap supprimé`);
    }
}

// Ajout du style tooltip dans Button.module.css
function updateButtonCSS() {
    const filePath = './src/components/ui/Button.module.css';
    
    if (!fs.existsSync(filePath)) {
        console.log(`❌ Fichier non trouvé: ${filePath}`);
        return;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    
    const tooltipCSS = `
/* Tooltip natif pour buttons */
.tooltipWrapper {
  position: relative;
  display: inline-block;
}

.tooltipWrapper:hover::after {
  content: attr(title);
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  background-color: var(--tc-color-gray-800);
  color: var(--tc-color-white);
  padding: var(--tc-space-1) var(--tc-space-2);
  border-radius: var(--tc-radius-sm);
  font-size: var(--tc-font-size-xs);
  white-space: nowrap;
  z-index: var(--tc-z-index-tooltip);
  margin-bottom: var(--tc-space-1);
  box-shadow: var(--tc-shadow-sm);
}

.tooltipWrapper:hover::before {
  content: '';
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 4px solid transparent;
  border-top-color: var(--tc-color-gray-800);
  z-index: var(--tc-z-index-tooltip);
}`;

    if (!content.includes('tooltipWrapper')) {
        content += tooltipCSS;
        fs.writeFileSync(filePath, content);
        console.log(`✅ Button.module.css - Styles tooltip ajoutés`);
    }
}

// Correction spécifique pour Card.js
function fixCardComponent() {
    const filePath = './src/components/ui/Card.js';
    
    if (!fs.existsSync(filePath)) {
        console.log(`❌ Fichier non trouvé: ${filePath}`);
        return;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Remplacer l'import et l'utilisation de BootstrapCard par div natif
    const replacements = {
        "import { Card as BootstrapCard } from 'react-bootstrap';": "// Migration: Utiliser div natif au lieu de BootstrapCard",
        "<BootstrapCard": "<div",
        "</BootstrapCard>": "</div>",
        "BootstrapCard.Header": "div",
        "BootstrapCard.Title": "h4",
        "BootstrapCard.Body": "div",
        "BootstrapCard.Footer": "div"
    };
    
    let changes = 0;
    Object.entries(replacements).forEach(([old, replacement]) => {
        if (content.includes(old)) {
            content = content.replace(new RegExp(old.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), replacement);
            changes++;
        }
    });
    
    // Supprimer les exports de sous-composants Bootstrap
    const bootstrapExports = `// Sous-composants pour une API cohérente
Card.Body = BootstrapCard.Body;
Card.Title = BootstrapCard.Title;
Card.Text = BootstrapCard.Text;
Card.Header = BootstrapCard.Header;
Card.Footer = BootstrapCard.Footer;`;

    if (content.includes(bootstrapExports)) {
        content = content.replace(bootstrapExports, '// Composant Card natif TourCraft - Plus de dépendance Bootstrap');
        changes++;
    }
    
    if (changes > 0) {
        fs.writeFileSync(filePath, content);
        console.log(`✅ Card.js - Migration Bootstrap vers div natif - ${changes} corrections`);
    }
}

function main() {
    console.log('🔧 Correction des composants debug et UI...\n');
    
    fixProfilerMonitorCSS();
    fixButtonComponent();
    updateButtonCSS();
    fixCardComponent();
    
    console.log('\n✅ Corrections terminées!');
    console.log('\n📋 PROCHAINES ÉTAPES:');
    console.log('   1. Tester l\'application pour vérifier les corrections');
    console.log('   2. Vérifier que les tooltips fonctionnent correctement');
    console.log('   3. S\'assurer que les Card s\'affichent correctement');
    console.log('   4. Valider l\'harmonie des couleurs avec #213547');
}

if (require.main === module) {
    main();
}