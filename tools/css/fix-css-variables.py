#!/usr/bin/env python3
"""
Script de correction automatique des variables CSS non conformes
Basé sur le Guide de Standardisation CSS TourCraft v2.0

Ce script corrige automatiquement :
1. Les variables --tc-color-* vers les variables standard
2. Les variables malformées avec syntaxe incorrecte
3. Les variables rgba malformées

Usage: python fix-css-variables.py [--dry-run] [--path=./src]
"""

import os
import re
import glob
import argparse
from pathlib import Path

# Mappings de correction pour les variables CSS
VARIABLE_MAPPINGS = {
    # Variables de couleurs principales
    '--tc-color-white': '--tc-white',
    '--tc-color-black': '--tc-black',
    '--tc-color-primary': '--tc-primary-color',
    '--tc-color-secondary': '--tc-secondary-color',
    '--tc-color-success': '--tc-success-color',
    '--tc-color-danger': '--tc-danger-color',
    '--tc-color-warning': '--tc-warning-color',
    '--tc-color-info': '--tc-info-color',
    '--tc-color-light': '--tc-light-color',
    '--tc-color-dark': '--tc-dark-color',
    
    # Variables de couleurs grises
    '--tc-color-gray-50': '--tc-gray-50',
    '--tc-color-gray-100': '--tc-gray-100',
    '--tc-color-gray-200': '--tc-gray-200',
    '--tc-color-gray-300': '--tc-gray-300',
    '--tc-color-gray-400': '--tc-gray-400',
    '--tc-color-gray-500': '--tc-gray-500',
    '--tc-color-gray-600': '--tc-gray-600',
    '--tc-color-gray-700': '--tc-gray-700',
    '--tc-color-gray-800': '--tc-gray-800',
    '--tc-color-gray-900': '--tc-gray-900',
    
    # Variables de texte
    '--tc-color-text-primary': '--tc-text-color',
    '--tc-color-text-secondary': '--tc-text-color-secondary',
    '--tc-color-text-muted': '--tc-text-muted',
    '--tc-color-text-dark': '--tc-text-color',
    '--tc-color-text': '--tc-text-color',
    '--tc-color-title': '--tc-text-color',
    
    # Variables de bordures
    '--tc-color-border': '--tc-border-color',
    '--tc-color-border-light': '--tc-border-color',
    '--tc-color-border-medium': '--tc-border-color',
    
    # Variables de fond
    '--tc-color-background': '--tc-white',
    '--tc-color-background-secondary': '--tc-gray-50',
    '--tc-color-surface': '--tc-white',
    
    # Variables d'erreur
    '--tc-color-error': '--tc-danger-color',
    '--tc-color-error-light': '--tc-danger-light',
    
    # Variables spécifiques avec valeurs hexadécimales
    '--tc-color-2c3e50': '--tc-gray-800',
    '--tc-color-34495e': '--tc-gray-700',
    '--tc-color-eee': '--tc-gray-200',
    '--tc-color-3498db': '--tc-primary-color',
    '--tc-color-2980b9': '--tc-primary-dark',
    '--tc-color-e9e9e9': '--tc-gray-200',
    '--tc-color-333': '--tc-gray-800',
    '--tc-color-d4d4d4': '--tc-gray-300',
    '--tc-color-f39c12': '--tc-warning-color',
    '--tc-color-e67e22': '--tc-warning-dark',
    '--tc-color-e74c3c': '--tc-danger-color',
    '--tc-color-c0392b': '--tc-danger-dark',
    '--tc-color-2ecc71': '--tc-success-color',
    '--tc-color-f0f7fb': '--tc-info-light',
    '--tc-color-ffe9e0': '--tc-warning-light',
    '--tc-color-6c757d': '--tc-gray-600',
    '--tc-color-f5f5f5': '--tc-gray-100',
    '--tc-color-ccc': '--tc-gray-300',
    '--tc-color-fff': '--tc-white',
    '--tc-color-000': '--tc-black',
    '--tc-color-17a2b8': '--tc-info-color',
    '--tc-color-dc3545': '--tc-danger-color',
    '--tc-color-dee2e6': '--tc-gray-200',
    '--tc-color-06c': '--tc-primary-color',
    '--tc-color-555': '--tc-gray-600',
    '--tc-color-666': '--tc-gray-600',
    '--tc-color-ddd': '--tc-gray-300',
    '--tc-color-f0f0f0': '--tc-gray-100',
    '--tc-color-f8f9fa': '--tc-gray-50',
    '--tc-color-e9ecef': '--tc-gray-200',
    '--tc-color-344767': '--tc-gray-700',
    '--tc-color-495057': '--tc-gray-600',
    '--tc-color-198754': '--tc-success-color',
    '--tc-color-ffc107': '--tc-warning-color',
    '--tc-color-0d6efd': '--tc-primary-color',
    '--tc-color-e0e0e0': '--tc-gray-200',
    '--tc-color-fafafa': '--tc-gray-50',
    '--tc-color-ced4da': '--tc-gray-300',
    '--tc-color-86b7fe': '--tc-primary-light',
    '--tc-color-28a745': '--tc-success-color',
    '--tc-color-f8d7da': '--tc-danger-light',
    '--tc-color-721c24': '--tc-danger-dark',
    
    # Variables de couleurs spécifiques (picker, preview, etc.)
    '--tc-color-picker-width': '--tc-input-width',
    '--tc-color-picker-height': '--tc-input-height',
    '--tc-color-picker-padding': '--tc-spacing-sm',
    '--tc-color-preview-width': '--tc-preview-width',
    '--tc-color-preview-height': '--tc-preview-height',
    '--tc-color-input-width': '--tc-input-width',
    
    # Variables de couleurs complexes (gradients, etc.)
    '--tc-color-f0f7ff': '--tc-primary-lightest',
    '--tc-color-e0f2fe': '--tc-info-lightest',
    '--tc-color-2563eb': '--tc-primary-color',
    '--tc-color-bfdbfe': '--tc-primary-light',
    '--tc-color-dbeafe': '--tc-primary-lighter',
    '--tc-color-bae6fd': '--tc-info-light',
    '--tc-color-93c5fd': '--tc-primary-light',
    '--tc-color-1d4ed8': '--tc-primary-dark',
    '--tc-color-e5e7eb': '--tc-gray-200',
    '--tc-color-f8fafc': '--tc-gray-50',
    '--tc-color-f1f5f9': '--tc-gray-100',
    '--tc-color-e2e8f0': '--tc-gray-200',
    '--tc-color-94a3b8': '--tc-gray-400',
    '--tc-color-cbd5e1': '--tc-gray-300',
    '--tc-color-64748b': '--tc-gray-500',
    '--tc-color-f0f9ff': '--tc-info-lightest',
    '--tc-color-e0f7fa': '--tc-info-lightest',
    '--tc-color-374151': '--tc-gray-700',
    '--tc-color-6366f1': '--tc-primary-color',
    '--tc-color-10b981': '--tc-success-color',
    '--tc-color-059669': '--tc-success-dark',
    '--tc-color-ff9800': '--tc-warning-color',
    '--tc-color-2196f3': '--tc-info-color',
    '--tc-color-666666': '--tc-gray-600',
    '--tc-color-f9f9f9': '--tc-gray-50',
}

# Patterns pour les variables malformées
MALFORMED_PATTERNS = [
    # Variables avec syntaxe incorrecte
    (r'var\(--tc-color-000000\)000\)', 'var(--tc-black)'),
    (r'var\(--tc-color-rgba\(0\), rgba\(([^)]+)\)\)', r'rgba(\1)'),
    (r'var\(--tc-color-rgba\([^)]+\), ([^)]+)\)', r'\1'),
    (r'var\(--tc-color-error-light\)\)', 'var(--tc-danger-light)'),
    
    # Variables avec doubles parenthèses
    (r'var\(--tc-box-shadow-lg\)\)', 'var(--tc-shadow-lg)'),
    (r'var\(--tc-box-shadow-sm\)\)', 'var(--tc-shadow-sm)'),
    (r'var\(--tc-box-shadow\)\)', 'var(--tc-shadow)'),
]

def fix_css_file(file_path, dry_run=False):
    """Corrige les variables CSS dans un fichier donné"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        changes_made = []
        
        # 1. Corriger les variables malformées en premier
        for pattern, replacement in MALFORMED_PATTERNS:
            matches = re.findall(pattern, content)
            if matches:
                content = re.sub(pattern, replacement, content)
                changes_made.append(f"Variables malformées: {len(matches)} occurrences")
        
        # 2. Corriger les variables --tc-color-*
        for old_var, new_var in VARIABLE_MAPPINGS.items():
            # Pattern pour capturer var(--tc-color-xxx) et --tc-color-xxx
            patterns = [
                f'var\\({re.escape(old_var)}\\)',
                re.escape(old_var)
            ]
            
            for pattern in patterns:
                matches = re.findall(pattern, content)
                if matches:
                    if pattern.startswith('var\\('):
                        replacement = f'var({new_var})'
                    else:
                        replacement = new_var
                    
                    content = re.sub(pattern, replacement, content)
                    changes_made.append(f"{old_var} → {new_var}: {len(matches)} occurrences")
        
        # 3. Écrire le fichier si des changements ont été effectués
        if content != original_content:
            if not dry_run:
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(content)
            
            return True, changes_made
        
        return False, []
        
    except Exception as e:
        print(f"Erreur lors du traitement de {file_path}: {e}")
        return False, []

def find_css_files(base_path):
    """Trouve tous les fichiers CSS dans le projet"""
    css_files = []
    
    # Patterns de fichiers CSS à traiter
    patterns = [
        '**/*.css',
        '**/*.module.css'
    ]
    
    for pattern in patterns:
        css_files.extend(glob.glob(os.path.join(base_path, pattern), recursive=True))
    
    # Exclure certains dossiers
    excluded_dirs = ['node_modules', '.git', 'dist', 'build', 'coverage']
    css_files = [f for f in css_files if not any(excluded in f for excluded in excluded_dirs)]
    
    return sorted(css_files)

def main():
    parser = argparse.ArgumentParser(description='Corriger les variables CSS non conformes')
    parser.add_argument('--dry-run', action='store_true', 
                       help='Afficher les changements sans les appliquer')
    parser.add_argument('--path', default='./src', 
                       help='Chemin de base pour la recherche (défaut: ./src)')
    parser.add_argument('--verbose', '-v', action='store_true',
                       help='Affichage détaillé')
    
    args = parser.parse_args()
    
    # Vérifier que le chemin existe
    if not os.path.exists(args.path):
        print(f"Erreur: Le chemin {args.path} n'existe pas")
        return 1
    
    print(f"🔍 Recherche des fichiers CSS dans {args.path}...")
    css_files = find_css_files(args.path)
    
    if not css_files:
        print("Aucun fichier CSS trouvé")
        return 0
    
    print(f"📁 {len(css_files)} fichiers CSS trouvés")
    
    if args.dry_run:
        print("🧪 Mode DRY-RUN - Aucun fichier ne sera modifié\n")
    else:
        print("✏️  Mode CORRECTION - Les fichiers seront modifiés\n")
    
    total_files_changed = 0
    total_changes = 0
    
    for file_path in css_files:
        rel_path = os.path.relpath(file_path)
        changed, changes = fix_css_file(file_path, args.dry_run)
        
        if changed:
            total_files_changed += 1
            total_changes += len(changes)
            
            print(f"✅ {rel_path}")
            if args.verbose:
                for change in changes:
                    print(f"   • {change}")
            else:
                print(f"   • {len(changes)} corrections effectuées")
        elif args.verbose:
            print(f"⚪ {rel_path} - Aucun changement nécessaire")
    
    print(f"\n📊 RÉSUMÉ:")
    print(f"   • Fichiers traités: {len(css_files)}")
    print(f"   • Fichiers modifiés: {total_files_changed}")
    print(f"   • Total corrections: {total_changes}")
    
    if args.dry_run and total_files_changed > 0:
        print(f"\n💡 Pour appliquer les corrections, relancez sans --dry-run")
    elif total_files_changed > 0:
        print(f"\n🎉 Corrections appliquées avec succès!")
    else:
        print(f"\n✨ Aucune correction nécessaire - Tous les fichiers sont conformes!")
    
    return 0

if __name__ == '__main__':
    exit(main()) 