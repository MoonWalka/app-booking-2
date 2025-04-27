#!/usr/bin/env python3
import re
import os
import sys

# Dos
sier contenant les fichiers CSS
base_dir = '/Users/meltinrecordz/Documents/TourCraft/code/app-booking-2/src/styles'

# Obtenir la liste des fichiers CSS
css_files = []
for root, dirs, files in os.walk(base_dir):
    for file in files:
        if file.endswith('.css'):
            css_files.append(os.path.join(root, file))

# Variables à ne pas préfixer (celles de Bootstrap ou déjà préfixées)
exclude_vars = ['tc-', 'bs-', 'primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark']

# Regex pour trouver les définitions de variables
def_pattern = re.compile(r'(^|\s|\n|\t)(--(?!tc-)[a-zA-Z0-9-]+)(\s*:)', re.MULTILINE)

# Regex pour trouver les utilisations de variables
use_pattern = re.compile(r'(var\()(--)(?!tc-)([a-zA-Z0-9-]+)(\))')

# Compteurs pour les statistiques
total_defs_replaced = 0
total_uses_replaced = 0

# Pour chaque fichier CSS
for css_file in css_files:
    with open(css_file, 'r') as f:
        content = f.read()
    
    # Remplacer les définitions de variables
    def_matches = def_pattern.findall(content)
    defs_replaced = 0
    
    for match in def_matches:
        var_name = match[1][2:]  # Enlever le "--" du début
        
        # Vérifier si cette variable ne doit pas être remplacée
        if any(var_name == excl for excl in exclude_vars) or any(var_name.startswith(excl) for excl in exclude_vars):
            continue
        
        # Remplacer la définition
        old_def = match[0] + match[1] + match[2]
        new_def = match[0] + "--tc-" + var_name + match[2]
        content = content.replace(old_def, new_def)
        defs_replaced += 1
    
    # Remplacer les utilisations de variables
    use_matches = use_pattern.findall(content)
    uses_replaced = 0
    
    for match in use_matches:
        var_name = match[2]  # Nom de la variable sans "--"
        
        # Vérifier si cette variable ne doit pas être remplacée
        if any(var_name == excl for excl in exclude_vars) or any(var_name.startswith(excl) for excl in exclude_vars):
            continue
        
        # Remplacer l'utilisation
        old_use = match[0] + match[1] + var_name + match[3]
        new_use = match[0] + "--tc-" + var_name + match[3]
        content = content.replace(old_use, new_use)
        uses_replaced += 1
    
    # Sauvegarder le fichier modifié
    if defs_replaced > 0 or uses_replaced > 0:
        with open(css_file, 'w') as f:
            f.write(content)
        print(f"{css_file}: {defs_replaced} définitions et {uses_replaced} utilisations remplacées")
    
    total_defs_replaced += defs_replaced
    total_uses_replaced += uses_replaced

print(f"\nTerminé! {total_defs_replaced} définitions et {total_uses_replaced} utilisations de variables remplacées au total.")
