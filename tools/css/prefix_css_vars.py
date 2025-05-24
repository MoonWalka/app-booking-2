#!/usr/bin/env python3

import os
import re
import sys
import datetime
import time

def add_standard_header(content, filename):
    """Ajoute un en-tête standardisé au fichier CSS"""
    # Extrait le nom du composant à partir du nom de fichier
    component_name = os.path.basename(filename).replace('.module.css', '')
    
    current_date = "5 mai 2025"
    header = f"""/*
 * Styles pour {component_name}
 * Standardisé selon le Guide de Style CSS de TourCraft
 * Date de création: Inconnue
 * Dernière mise à jour: {current_date}
 */

"""
    # Si le fichier commence déjà par un commentaire, le remplacer
    if content.lstrip().startswith('/*'):
        return re.sub(r'/\*.*?\*/', header, content, flags=re.DOTALL, count=1)
    else:
        return header + content

def convert_hardcoded_values(content):
    """Convertit les valeurs codées en dur en variables CSS avec fallbacks"""
    # Dictionnaire de correspondance entre valeurs codées en dur et variables CSS
    mappings = {
        # Couleurs
        r'#eee(?!\w)': 'var(--tc-color-border, #eee)',
        r'#ddd(?!\w)': 'var(--tc-color-border-medium, #ddd)',
        r'#dee2e6(?!\w)': 'var(--tc-color-border-light, #dee2e6)',
        r'#f8f9fa(?!\w)': 'var(--tc-bg-light, #f8f9fa)',
        r'white(?!\w)': 'var(--tc-bg-default, white)',
        r'#555(?!\w)': 'var(--tc-color-text-secondary, #555)',
        r'#666(?!\w)': 'var(--tc-color-text-secondary, #666)',
        r'#6c757d(?!\w)': 'var(--tc-color-text-secondary, #6c757d)',
        r'#0d6efd(?!\w)': 'var(--tc-color-primary, #0d6efd)',
        r'#d1e7dd(?!\w)': 'var(--tc-color-success-light, #d1e7dd)',
        r'#0f5132(?!\w)': 'var(--tc-color-success-dark, #0f5132)',
        r'#dc3545(?!\w)': 'var(--tc-color-error)',
        r'rgba\(220, 53, 69, 0\.1\)(?!\w)': 'var(--tc-color-error-light, rgba(220, 53, 69, 0.1))',
        r'#333(?!\w)': 'var(--tc-color-text-primary, #333)',
        r'#4285f4(?!\w)': 'var(--tc-color-info, #4285f4)',
        r'#34a853(?!\w)': 'var(--tc-color-success, #34a853)',
        r'#fbbc04(?!\w)': 'var(--tc-color-warning, #fbbc04)',
        
        # Typographie
        r'0\.75rem(?!\w)': 'var(--tc-font-size-xs)',
        r'0\.8rem(?!\w)': 'var(--tc-font-size-xs)',
        r'0\.85rem(?!\w)': 'var(--tc-font-size-sm)',
        r'0\.9rem(?!\w)': 'var(--tc-font-size-sm)',
        r'1rem(?!\w)': 'var(--tc-font-size-md)',
        r'1\.1rem(?!\w)': 'var(--tc-font-size-lg)',
        r'1\.125rem(?!\w)': 'var(--tc-font-size-lg)',
        r'1\.25rem(?!\w)': 'var(--tc-font-size-xl)',
        r'1\.5rem(?!\w)': 'var(--tc-font-size-2xl)',
        r'500(?!\w)': 'var(--tc-font-weight-medium)',
        r'600(?!\w)': 'var(--tc-font-weight-semibold)',
        r'700(?!\w)': 'var(--tc-font-weight-bold)',
        r'400(?!\w)': 'var(--tc-font-weight-normal)',
        
        # Espacements
        r'0\.25rem(?!\w)': 'var(--tc-spacing-1)',
        r'0\.5rem(?!\w)': 'var(--tc-spacing-2)',
        r'0\.75rem(?!\w)': 'var(--tc-spacing-2)',
        r'1rem(?!\w)': 'var(--tc-spacing-3)',
        r'1\.5rem(?!\w)': 'var(--tc-spacing-4)',
        r'2rem(?!\w)': 'var(--tc-spacing-8)',
        
        # Bordures et ombres
        r'border-radius: 4px': 'border-radius: var(--tc-radius-sm)',
        r'border-radius: 8px': 'border-radius: var(--tc-radius-md)',
        r'border-radius: 0\.25rem': 'border-radius: var(--tc-radius-sm)',
        r'box-shadow: 0 1px 3px rgba\(0,0,0,0\.1\)': 'box-shadow: var(--tc-shadow-sm)',
        r'box-shadow: 0 -2px 10px rgba\(0, 0, 0, 0\.1\)': 'box-shadow: var(--tc-shadow-lg, 0 -2px 10px rgba(0, 0, 0, 0.1))'
    }
    
    # Application des remplacements
    for pattern, replacement in mappings.items():
        content = re.sub(pattern, replacement, content)
        
    return content

def fix_double_prefix(content):
    """Corrige le problème des doubles préfixes var(--tc-tc-xyz)"""
    # Recherche et remplace les doubles préfixes
    return re.sub(r'var\(--tc-tc-', r'var(--tc-', content)

def prefix_css_vars_enhanced(file_path):
    """Version améliorée qui ajoute aussi un en-tête et convertit les valeurs codées en dur"""
    print(f"Traitement de {file_path}...")
    
    # Vérification que le fichier existe
    if not os.path.exists(file_path):
        print(f"⚠️ Fichier non trouvé: {file_path}")
        return False
    
    # Lire le contenu du fichier
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        print(f"⚠️ Erreur lors de la lecture du fichier {file_path}: {e}")
        return False
    
    # Créer une sauvegarde
    try:
        with open(f"{file_path}.bak", 'w', encoding='utf-8') as f:
            f.write(content)
    except Exception as e:
        print(f"⚠️ Erreur lors de la création de la sauvegarde pour {file_path}: {e}")
        return False
    
    # 1. Préfixer les variables CSS existantes
    search_pattern = r'var\(--([a-zA-Z0-9-]+)(?!-tc)'
    replacement_pattern = r'var(--tc-\1'
    content = re.sub(search_pattern, replacement_pattern, content)
    
    # 2. Convertir les valeurs codées en dur
    content = convert_hardcoded_values(content)
    
    # 3. Corriger les doubles préfixes éventuels
    content = fix_double_prefix(content)
    
    # 4. Ajouter l'en-tête standardisé
    if file_path.endswith('.css') or file_path.endswith('.module.css'):
        content = add_standard_header(content, file_path)
    
    # Écrire le contenu modifié
    try:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
    except Exception as e:
        print(f"⚠️ Erreur lors de l'écriture du fichier {file_path}: {e}")
        # Tentative de restauration de la sauvegarde
        try:
            with open(f"{file_path}.bak", 'r', encoding='utf-8') as f:
                original_content = f.read()
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(original_content)
            print(f"La sauvegarde de {file_path} a été restaurée.")
        except Exception as restore_error:
            print(f"⚠️ Erreur lors de la restauration de la sauvegarde: {restore_error}")
        return False
    
    print(f"✅ Fichier {file_path} traité avec succès")
    return True

def extract_paths_from_inventory(inventory_path):
    """Extrait les chemins des fichiers à refactoriser à partir du document d'inventaire"""
    base_dir = "/Users/meltinrecordz/Documents/TourCraft/code/app-booking-2/src"
    file_paths = []
    done_paths = []
    
    try:
        with open(inventory_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Extraction des chemins non cochés (à refactoriser)
        unchecked_pattern = r'- \[ \] `(.*?\.module\.css)`'
        unchecked_paths = re.findall(unchecked_pattern, content)
        
        # Extraction des chemins cochés (déjà refactorisés)
        checked_pattern = r'- \[x\] `(.*?\.module\.css)`'
        done_paths = re.findall(checked_pattern, content)
        
        # Ajout du chemin de base aux chemins relatifs
        for path in unchecked_paths:
            full_path = os.path.join(base_dir, path.lstrip('/'))
            file_paths.append(full_path)
        
    except Exception as e:
        print(f"⚠️ Erreur lors de la lecture de l'inventaire: {e}")
    
    return file_paths, done_paths

def process_specific_files(file_paths):
    """Traite uniquement les fichiers spécifiés"""
    successful = []
    for file_path in file_paths:
        if os.path.exists(file_path) and os.path.isfile(file_path):
            if prefix_css_vars_enhanced(file_path):
                successful.append(file_path)
        else:
            print(f"⚠️ Fichier non trouvé: {file_path}")
    return successful

def process_inventory_files(inventory_path, skip_confirmation=False):
    """Traite tous les fichiers CSS mobiles listés dans l'inventaire qui ne sont pas encore cochés"""
    file_paths, done_paths = extract_paths_from_inventory(inventory_path)
    
    if not file_paths:
        print("Aucun fichier à traiter ou erreur lors de l'extraction des chemins.")
        return [], []
    
    print(f"🔍 {len(file_paths)} fichiers à traiter:")
    for path in file_paths:
        print(f"  - {path}")
    print(f"🟢 {len(done_paths)} fichiers déjà traités (seront ignorés)")
    
    if not skip_confirmation:
        confirm = input("\n⚠️ Êtes-vous sûr de vouloir refactoriser automatiquement ces fichiers ? (o/N) ")
        if confirm.lower() != 'o':
            print("Opération annulée.")
            return [], []
    
    successful_files = []
    failed_files = []
    
    for i, file_path in enumerate(file_paths):
        print(f"\nTraitement du fichier {i+1}/{len(file_paths)}: {file_path}")
        
        if prefix_css_vars_enhanced(file_path):
            successful_files.append(file_path)
        else:
            failed_files.append(file_path)
    
    print("\n===== RAPPORT D'EXÉCUTION =====")
    print(f"Total de fichiers traités: {len(file_paths)}")
    print(f"✅ Succès: {len(successful_files)}")
    print(f"❌ Échecs: {len(failed_files)}")
    
    if failed_files:
        print("\nFichiers en échec:")
        for path in failed_files:
            print(f"  - {path}")
    
    return successful_files, failed_files

if __name__ == "__main__":
    # Si l'option --inventory est utilisée, traiter tous les fichiers de l'inventaire
    if "--inventory" in sys.argv:
        inventory_path = "/Users/meltinrecordz/Documents/TourCraft/code/app-booking-2/docs/css/INVENTAIRE_REFACTORISATION_COMPOSANTS_MOBILES.md"
        skip_confirmation = "--force" in sys.argv
        successful_files, failed_files = process_inventory_files(inventory_path, skip_confirmation)
    
    # Si des arguments de fichiers spécifiques sont fournis
    elif len(sys.argv) > 1 and sys.argv[1] != "--help":
        files_to_process = [arg for arg in sys.argv[1:] if not arg.startswith("--")]
        process_specific_files(files_to_process)
    
    # Afficher l'aide
    else:
        print("""
Usage: 
    python prefix_css_vars.py [options] [fichiers...]

Options:
    --inventory          Traite tous les fichiers listés dans l'inventaire qui ne sont pas encore refactorisés
    --force              Ne demande pas de confirmation avant de traiter les fichiers
    --help               Affiche cette aide

Exemples:
    python prefix_css_vars.py --inventory --force
    python prefix_css_vars.py chemin/vers/fichier1.css chemin/vers/fichier2.css
        """)