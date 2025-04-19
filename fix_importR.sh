#!/usr/bin/env python3

import os
import re
import glob
import sys

# Couleurs pour la console
GREEN = '\033[0;32m'
YELLOW = '\033[1;33m'
BLUE = '\033[0;34m'
RED = '\033[0;31m'
NC = '\033[0m'  # No Color

def fix_imports(file_path):
    """Corrige les imports sans ./ dans un fichier"""
    with open(file_path, 'r') as file:
        content = file.read()
    
    # Pattern pour trouver les imports sans ./
    pattern_js = r"from\s+['\"]([^\./@][^'\"]*\.js)['\"]"
    pattern_css = r"import\s+['\"]([^\./@][^'\"]*\.css)['\"]"
    pattern_jsx = r"from\s+['\"]([^\./@][^'\"]*\.jsx)['\"]"
    pattern_no_ext = r"from\s+['\"]([^\./@][^'\"]*)['\"]"
    
    # Trouver tous les imports problématiques
    js_imports = re.findall(pattern_js, content)
    css_imports = re.findall(pattern_css, content)
    jsx_imports = re.findall(pattern_jsx, content)
    no_ext_imports = re.findall(pattern_no_ext, content)
    
    problems_found = len(js_imports) + len(css_imports) + len(jsx_imports) + len(no_ext_imports)
    if problems_found == 0:
        return 0
    
    print(f"{YELLOW}Fichier: {file_path}{NC}")
    
    # Sauvegarder le fichier
    backup_path = f"{file_path}.import_bak"
    with open(backup_path, 'w') as backup:
        backup.write(content)
    print(f"{BLUE}Fichier sauvegardé: {backup_path}{NC}")
    
    # Corriger les imports
    replacements = []
    
    # Corriger les imports JS
    for js_import in js_imports:
        old_import = f"from '{js_import}'"
        new_import = f"from './{js_import}'"
        content = content.replace(old_import, new_import)
        
        old_import = f'from "{js_import}"'
        new_import = f'from "./{js_import}"'
        content = content.replace(old_import, new_import)
        
        print(f"{RED}- {old_import} -> {GREEN}{new_import}{NC}")
        replacements.append((js_import, f"./{js_import}"))
    
    # Corriger les imports CSS
    for css_import in css_imports:
        old_import = f"import '{css_import}'"
        new_import = f"import './{css_import}'"
        content = content.replace(old_import, new_import)
        
        old_import = f'import "{css_import}"'
        new_import = f'import "./{css_import}"'
        content = content.replace(old_import, new_import)
        
        print(f"{RED}- {old_import} -> {GREEN}{new_import}{NC}")
        replacements.append((css_import, f"./{css_import}"))
    
    # Corriger les imports JSX
    for jsx_import in jsx_imports:
        old_import = f"from '{jsx_import}'"
        new_import = f"from './{jsx_import}'"
        content = content.replace(old_import, new_import)
        
        old_import = f'from "{jsx_import}"'
        new_import = f'from "./{jsx_import}"'
        content = content.replace(old_import, new_import)
        
        print(f"{RED}- {old_import} -> {GREEN}{new_import}{NC}")
        replacements.append((jsx_import, f"./{jsx_import}"))
    
    # Corriger les imports sans extension
    for no_ext in no_ext_imports:
        # Exclure certains modules courants de node_modules
        if no_ext in ['react', 'react-dom', 'react-router-dom', 'firebase', 'react-bootstrap', 'react-quill', 'uuid']:
            continue
        
        old_import = f"from '{no_ext}'"
        new_import = f"from './{no_ext}'"
        content = content.replace(old_import, new_import)
        
        old_import = f'from "{no_ext}"'
        new_import = f'from "./{no_ext}"'
        content = content.replace(old_import, new_import)
        
        print(f"{RED}- {old_import} -> {GREEN}{new_import}{NC}")
        replacements.append((no_ext, f"./{no_ext}"))
    
    # Écrire le contenu modifié
    with open(file_path, 'w') as file:
        file.write(content)
    
    print(f"{GREEN}✓ {len(replacements)} imports corrigés{NC}")
    print("")
    
    return len(replacements)

def main():
    print(f"{BLUE}=== Correction des imports sans ./ ==={NC}\n")
    
    # Trouver tous les fichiers JS/JSX
    js_files = glob.glob("./src/**/*.js", recursive=True)
    jsx_files = glob.glob("./src/**/*.jsx", recursive=True)
    all_files = js_files + jsx_files
    
    total_files = len(all_files)
    total_fixed = 0
    fixed_files = 0
    
    print(f"{YELLOW}Analyse de {total_files} fichiers...{NC}\n")
    
    for file_path in all_files:
        fixes = fix_imports(file_path)
        if fixes > 0:
            fixed_files += 1
            total_fixed += fixes
    
    print(f"{BLUE}=== Résumé ==={NC}")
    print(f"{GREEN}✓ {fixed_files} fichiers corrigés{NC}")
    print(f"{GREEN}✓ {total_fixed} imports corrigés au total{NC}")
    
    print(f"\n{BLUE}=== Nettoyage du cache ==={NC}")
    os.system("rm -rf node_modules/.cache")
    print(f"{GREEN}✓ Cache nettoyé{NC}")
    
    print(f"\n{BLUE}=== Script terminé ==={NC}")
    print(f"{YELLOW}Testez maintenant la compilation avec:{NC}")
    print(f"{BLUE}npm run build{NC}")

if __name__ == "__main__":
    main()
