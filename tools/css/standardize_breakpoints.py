#!/usr/bin/env python3

import os
import re
import sys
import glob
import time
from datetime import datetime

def standardize_breakpoints(content):
    """
    Standardise les points de rupture (media queries) dans un fichier CSS
    en utilisant les variables CSS standardisées
    """
    # Définition des points de rupture standards selon variables.css
    breakpoint_mapping = {
        r'max-width:\s*576px': 'max-width: var(--tc-breakpoint-xs, 576px)',
        r'max-width:\s*600px': 'max-width: var(--tc-breakpoint-xs, 576px)', # Non-standard -> standard
        r'max-width:\s*768px': 'max-width: var(--tc-breakpoint-sm, 768px)',
        r'max-width:\s*800px': 'max-width: var(--tc-breakpoint-sm, 768px)', # Non-standard -> standard
        r'max-width:\s*900px': 'max-width: var(--tc-breakpoint-md, 992px)', # Non-standard -> standard
        r'max-width:\s*992px': 'max-width: var(--tc-breakpoint-md, 992px)',
        r'max-width:\s*1200px': 'max-width: var(--tc-breakpoint-lg, 1200px)',
        r'max-width:\s*1400px': 'max-width: var(--tc-breakpoint-xl, 1400px)',
        
        r'min-width:\s*576px': 'min-width: var(--tc-breakpoint-xs, 576px)',
        r'min-width:\s*600px': 'min-width: var(--tc-breakpoint-xs, 576px)', # Non-standard -> standard
        r'min-width:\s*768px': 'min-width: var(--tc-breakpoint-sm, 768px)',
        r'min-width:\s*800px': 'min-width: var(--tc-breakpoint-sm, 768px)', # Non-standard -> standard
        r'min-width:\s*900px': 'min-width: var(--tc-breakpoint-md, 992px)', # Non-standard -> standard
        r'min-width:\s*992px': 'min-width: var(--tc-breakpoint-md, 992px)',
        r'min-width:\s*1200px': 'min-width: var(--tc-breakpoint-lg, 1200px)',
        r'min-width:\s*1400px': 'min-width: var(--tc-breakpoint-xl, 1400px)'
    }
    
    # Remplacer toutes les media queries par les versions standardisées
    for pattern, replacement in breakpoint_mapping.items():
        # Utiliser une expression régulière pour trouver les media queries dans différents formats
        media_query_pattern = r'(@media[^{]*?)(' + pattern + r')([^{]*?{)'
        replacement_query = r'\1' + replacement + r'\3'
        
        # Appliquer le remplacement
        content = re.sub(media_query_pattern, replacement_query, content, flags=re.IGNORECASE)
    
    return content

def standardize_file(file_path):
    """Standardise les points de rupture dans un fichier CSS"""
    print(f"Traitement de {file_path}...")
    
    if not os.path.exists(file_path):
        print(f"⚠️ Fichier non trouvé: {file_path}")
        return False
    
    try:
        # Lire le contenu du fichier
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Créer une sauvegarde
        backup_path = f"{file_path}.bak"
        with open(backup_path, 'w', encoding='utf-8') as f:
            f.write(content)
        
        # Standardiser les points de rupture
        modified_content = standardize_breakpoints(content)
        
        # Enregistrer les modifications si le contenu a changé
        if modified_content != content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(modified_content)
            print(f"✅ {file_path} standardisé avec succès")
            return True
        else:
            print(f"ℹ️ Aucune modification nécessaire pour {file_path}")
            return True
    except Exception as e:
        print(f"❌ Erreur lors du traitement de {file_path}: {str(e)}")
        return False

def process_directory(directory, file_pattern="**/*.module.css"):
    """Traite tous les fichiers CSS dans un répertoire et ses sous-répertoires"""
    count_success = 0
    count_error = 0
    count_skipped = 0
    
    start_time = time.time()
    date_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    print(f"=== STANDARDISATION DES POINTS DE RUPTURE ===")
    print(f"Date: {date_str}")
    print(f"Répertoire: {directory}")
    print(f"Pattern: {file_pattern}")
    print("=" * 40)
    
    # Rechercher tous les fichiers correspondant au pattern
    file_paths = glob.glob(os.path.join(directory, file_pattern), recursive=True)
    total_files = len(file_paths)
    
    print(f"Trouvé {total_files} fichiers à traiter")
    
    for i, file_path in enumerate(file_paths, 1):
        print(f"\n[{i}/{total_files}] Traitement de {file_path}")
        
        if standardize_file(file_path):
            count_success += 1
        else:
            count_error += 1
    
    # Générer un rapport de fin
    elapsed_time = time.time() - start_time
    print("\n" + "=" * 40)
    print(f"RAPPORT DE STANDARDISATION")
    print(f"Temps d'exécution: {elapsed_time:.2f} secondes")
    print(f"Fichiers traités: {total_files}")
    print(f"✅ Succès: {count_success}")
    print(f"❌ Erreurs: {count_error}")
    print(f"⏭️ Ignorés: {count_skipped}")
    print("=" * 40)
    
    # Générer un rapport dans un fichier texte
    report_path = os.path.join(os.path.dirname(directory), "breakpoints_standardization_report.txt")
    try:
        with open(report_path, 'w', encoding='utf-8') as f:
            f.write(f"RAPPORT DE STANDARDISATION DES POINTS DE RUPTURE CSS\n")
            f.write(f"Date: {date_str}\n")
            f.write(f"Répertoire: {directory}\n")
            f.write(f"Pattern: {file_pattern}\n")
            f.write(f"Temps d'exécution: {elapsed_time:.2f} secondes\n")
            f.write(f"Fichiers traités: {total_files}\n")
            f.write(f"Succès: {count_success}\n")
            f.write(f"Erreurs: {count_error}\n")
            f.write(f"Ignorés: {count_skipped}\n")
        
        print(f"Rapport généré: {report_path}")
    except Exception as e:
        print(f"Erreur lors de la génération du rapport: {str(e)}")

def main():
    """Fonction principale"""
    # Vérifier les arguments
    if len(sys.argv) == 1 or "--help" in sys.argv:
        print("""
Usage:
    python standardize_breakpoints.py [options] [chemin]

Options:
    --all        Traite tous les fichiers CSS du projet
    --mobile     Traite seulement les fichiers CSS mobiles
    --desktop    Traite seulement les fichiers CSS desktop
    --components Traite seulement les fichiers CSS des composants
    --help       Affiche cette aide

Exemples:
    python standardize_breakpoints.py --all
    python standardize_breakpoints.py --mobile
    python standardize_breakpoints.py src/components/programmateurs
        """)
        return
    
    src_dir = "/Users/meltinrecordz/Documents/TourCraft/code/app-booking-2/src"
    
    # Traiter selon les options
    if "--all" in sys.argv:
        process_directory(src_dir)
    elif "--mobile" in sys.argv:
        process_directory(src_dir, "**/mobile/*.module.css")
    elif "--desktop" in sys.argv:
        process_directory(src_dir, "**/desktop/*.module.css")
    elif "--components" in sys.argv:
        process_directory(src_dir, "components/**/*.module.css")
    else:
        # Traiter un chemin spécifique
        path = sys.argv[1] if len(sys.argv) > 1 else src_dir
        if os.path.isfile(path):
            standardize_file(path)
        else:
            process_directory(path)

if __name__ == "__main__":
    main()