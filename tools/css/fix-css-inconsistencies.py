#!/usr/bin/env python3
"""
Script de correction automatique des incohérences CSS
Basé sur le Guide de Standardisation CSS TourCraft v2.0

Ce script corrige :
1. Les couleurs hexadécimales codées en dur
2. Les variables CSS sans préfixe --tc-
3. Les variables --tc-color-* non conformes au guide
4. Les styles inline dans les fichiers React
5. Les incohérences de nommage

Usage: python fix-css-inconsistencies.py [--dry-run] [--path=./src]
"""

import os
import re
import glob
import argparse
from pathlib import Path

# Mappings de correction
COLOR_MAPPINGS = {
    '#ffffff': 'var(--tc-white)',
    '#fff': 'var(--tc-white)',
    '#000000': 'var(--tc-black)',
    '#000': 'var(--tc-black)',
    '#f8f9fa': 'var(--tc-gray-100)',
    '#6c757d': 'var(--tc-gray-600)',
    '#212529': 'var(--tc-gray-900)',
    '#e9ecef': 'var(--tc-gray-200)',
    '#dee2e6': 'var(--tc-gray-300)',
    '#ced4da': 'var(--tc-gray-400)',
    '#adb5bd': 'var(--tc-gray-500)',
    '#495057': 'var(--tc-gray-700)',
    '#343a40': 'var(--tc-gray-800)',
    '#f0f0f0': 'var(--tc-gray-100)',
    '#ccc': 'var(--tc-gray-400)',
    '#d4d4d4': 'var(--tc-gray-400)',
    '#f5f5f5': 'var(--tc-gray-100)',
}

# Variables non conformes à corriger
VARIABLE_MAPPINGS = {
    '--tc-color-white': '--tc-white',
    '--tc-color-gray-100': '--tc-gray-100',
    '--tc-color-gray-200': '--tc-gray-200',
    '--tc-color-gray-300': '--tc-gray-300',
    '--tc-color-gray-400': '--tc-gray-400',
    '--tc-color-gray-500': '--tc-gray-500',
    '--tc-color-gray-600': '--tc-gray-600',
    '--tc-color-gray-700': '--tc-gray-700',
    '--tc-color-gray-800': '--tc-gray-800',
    '--tc-color-gray-900': '--tc-gray-900',
    '--tc-color-primary': '--tc-primary-color',
    '--tc-color-secondary': '--tc-secondary-color',
    '--tc-color-success': '--tc-success-color',
    '--tc-color-danger': '--tc-danger-color',
    '--tc-color-warning': '--tc-warning-color',
    '--tc-color-info': '--tc-info-color',
    '--tc-color-light': '--tc-light-color',
    '--tc-color-dark': '--tc-dark-color',
    '--color-primary': '--tc-primary-color',
    '--preview-color': '--tc-preview-color',
    '--progress-width': '--tc-progress-width',
    '--column-width': '--tc-column-width',
}

# Styles inline courants à convertir en classes CSS
INLINE_STYLE_PATTERNS = [
    (r'style=\{\{\s*minHeight:\s*[\'"]300px[\'"]\s*\}\}', 'className="tc-min-h-300"'),
    (r'style=\{\{\s*whiteSpace:\s*[\'"]pre-wrap[\'"]\s*\}\}', 'className="tc-whitespace-pre-wrap"'),
    (r'style=\{\{\s*marginTop:\s*[\'"]20px[\'"]\s*\}\}', 'className="tc-mt-lg"'),
    (r'style=\{\{\s*width:\s*[\'"]fit-content[\'"]\s*\}\}', 'className="tc-w-fit"'),
    (r'style=\{\{\s*minWidth:\s*[\'"]85px[\'"]\s*\}\}', 'className="tc-min-w-85"'),
]

class CSSInconsistencyFixer:
    def __init__(self, base_path="./src", dry_run=False):
        self.base_path = Path(base_path)
        self.dry_run = dry_run
        self.stats = {
            'files_processed': 0,
            'files_modified': 0,
            'hardcoded_colors_fixed': 0,
            'variables_fixed': 0,
            'inline_styles_fixed': 0,
        }

    def fix_hardcoded_colors(self, content):
        """Remplace les couleurs hexadécimales codées en dur par des variables CSS"""
        modified = False
        for hex_color, css_var in COLOR_MAPPINGS.items():
            if hex_color in content:
                content = content.replace(hex_color, css_var)
                self.stats['hardcoded_colors_fixed'] += 1
                modified = True
        return content, modified

    def fix_variable_names(self, content):
        """Corrige les noms de variables CSS non conformes"""
        modified = False
        for old_var, new_var in VARIABLE_MAPPINGS.items():
            pattern = f'var\\({re.escape(old_var)}\\)'
            replacement = f'var({new_var})'
            if re.search(pattern, content):
                content = re.sub(pattern, replacement, content)
                self.stats['variables_fixed'] += 1
                modified = True
        return content, modified

    def fix_inline_styles(self, content):
        """Convertit les styles inline courants en classes CSS"""
        modified = False
        for pattern, replacement in INLINE_STYLE_PATTERNS:
            if re.search(pattern, content):
                content = re.sub(pattern, replacement, content)
                self.stats['inline_styles_fixed'] += 1
                modified = True
        return content, modified

    def fix_malformed_variables(self, content):
        """Corrige les variables CSS malformées"""
        modified = False
        
        # Corrige les variables rgba malformées
        rgba_pattern = r'var\(--tc-color-rgba\(\d+\), (rgba\([^)]+\))\)'
        matches = re.findall(rgba_pattern, content)
        if matches:
            for match in matches:
                # Remplace par la valeur rgba directement
                old_pattern = f'var(--tc-color-rgba(\\d+), {re.escape(match)})'
                content = re.sub(old_pattern, match, content)
                modified = True
                self.stats['variables_fixed'] += 1

        # Corrige les doubles parenthèses dans box-shadow
        box_shadow_pattern = r'var\(--tc-box-shadow-lg\)\)'
        if re.search(box_shadow_pattern, content):
            content = re.sub(box_shadow_pattern, 'var(--tc-shadow-lg)', content)
            modified = True
            self.stats['variables_fixed'] += 1

        return content, modified

    def process_file(self, file_path):
        """Traite un fichier individuel"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                original_content = f.read()
            
            content = original_content
            file_modified = False

            # Applique toutes les corrections
            content, colors_modified = self.fix_hardcoded_colors(content)
            content, vars_modified = self.fix_variable_names(content)
            content, malformed_modified = self.fix_malformed_variables(content)
            
            # Styles inline seulement pour les fichiers JS/JSX
            if file_path.suffix in ['.js', '.jsx']:
                content, inline_modified = self.fix_inline_styles(content)
                file_modified = file_modified or inline_modified

            file_modified = file_modified or colors_modified or vars_modified or malformed_modified

            if file_modified and not self.dry_run:
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(content)
                self.stats['files_modified'] += 1

            self.stats['files_processed'] += 1
            
            if file_modified:
                print(f"✅ Corrigé: {file_path}")
            
            return file_modified

        except Exception as e:
            print(f"❌ Erreur lors du traitement de {file_path}: {e}")
            return False

    def run(self):
        """Lance le processus de correction"""
        print("🔧 Correction des incohérences CSS TourCraft")
        print(f"📁 Répertoire: {self.base_path}")
        print(f"🔍 Mode: {'Simulation' if self.dry_run else 'Correction'}")
        print("-" * 50)

        # Trouve tous les fichiers CSS et JS/JSX
        css_files = list(self.base_path.rglob("*.css"))
        js_files = list(self.base_path.rglob("*.js")) + list(self.base_path.rglob("*.jsx"))
        
        all_files = css_files + js_files
        
        # Exclut les fichiers de test et node_modules
        all_files = [f for f in all_files if 'node_modules' not in str(f) and 'test' not in str(f)]

        print(f"📄 {len(all_files)} fichiers à traiter")
        print()

        for file_path in all_files:
            self.process_file(file_path)

        # Affiche les statistiques
        print("\n" + "=" * 50)
        print("📊 RÉSULTATS")
        print("=" * 50)
        print(f"Fichiers traités: {self.stats['files_processed']}")
        print(f"Fichiers modifiés: {self.stats['files_modified']}")
        print(f"Couleurs codées en dur corrigées: {self.stats['hardcoded_colors_fixed']}")
        print(f"Variables CSS corrigées: {self.stats['variables_fixed']}")
        print(f"Styles inline corrigés: {self.stats['inline_styles_fixed']}")
        
        if self.dry_run:
            print("\n⚠️  Mode simulation - Aucun fichier n'a été modifié")
            print("   Relancez sans --dry-run pour appliquer les corrections")

def main():
    parser = argparse.ArgumentParser(description='Corrige les incohérences CSS TourCraft')
    parser.add_argument('--dry-run', action='store_true', help='Mode simulation (aucune modification)')
    parser.add_argument('--path', default='./src', help='Chemin de base à traiter')
    
    args = parser.parse_args()
    
    fixer = CSSInconsistencyFixer(args.path, args.dry_run)
    fixer.run()

if __name__ == "__main__":
    main() 