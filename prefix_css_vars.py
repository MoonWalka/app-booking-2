#!/usr/bin/env python3

import os
import re
import fileinput

def prefix_css_vars(directory):
    """
    Parcourt tous les fichiers CSS dans le répertoire spécifié et
    remplace les variables CSS non préfixées par leurs équivalents avec --tc-
    """
    # Définir les patterns de recherche et de remplacement
    search_pattern = r'var\(--([a-zA-Z0-9-]+)(?!-tc)'
    replacement_pattern = r'var(--tc-\1'
    
    # Extensions de fichiers à traiter
    extensions = ('.css', '.js', '.jsx')
    
    # Liste des fichiers modifiés
    modified_files = []
    
    # Parcourir récursivement le répertoire
    for root, dirs, files in os.walk(directory):
        # Ignorer le répertoire styles.bak
        if 'styles.bak' in root:
            continue
            
        for file in files:
            if file.endswith(extensions):
                file_path = os.path.join(root, file)
                file_modified = False
                
                # Lire le contenu du fichier
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                # Rechercher et remplacer les variables CSS
                modified_content = re.sub(search_pattern, replacement_pattern, content)
                
                # Si des modifications ont été apportées, écrire le nouveau contenu
                if modified_content != content:
                    with open(file_path, 'w', encoding='utf-8') as f:
                        f.write(modified_content)
                    modified_files.append(file_path)
                    file_modified = True
                
                if file_modified:
                    print(f"Modifié: {file_path}")
    
    return modified_files

if __name__ == "__main__":
    directory = './src'
    print(f"Recherche de variables CSS non préfixées dans {directory}...")
    modified_files = prefix_css_vars(directory)
    
    print(f"\n{len(modified_files)} fichiers modifiés:")
    for file in modified_files:
        print(f"- {file}")