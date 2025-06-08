#!/bin/bash

# Script de conversion des imports relatifs en alias
# Cible les imports avec 3+ niveaux de remontée

echo "🔄 Conversion des imports relatifs en alias..."

# Fonction pour convertir un fichier
convert_file() {
    local file="$1"
    local changes=0
    
    # Créer une copie temporaire
    cp "$file" "$file.tmp"
    
    # Services (3+ niveaux)
    if grep -q "from '\.\./\.\./\.\./services/" "$file"; then
        sed -i '' "s|from '\.\./\.\./\.\./services/|from '@services/|g" "$file"
        ((changes++))
    fi
    if grep -q "from \"\.\./\.\./\.\./services/" "$file"; then
        sed -i '' "s|from \"\.\./\.\./\.\./services/|from \"@services/|g" "$file"
        ((changes++))
    fi
    
    # UI Components (3+ niveaux)
    if grep -q "from '\.\./\.\./\.\./components/ui/" "$file"; then
        sed -i '' "s|from '\.\./\.\./\.\./components/ui/|from '@ui/|g" "$file"
        ((changes++))
    fi
    if grep -q "from \"\.\./\.\./\.\./components/ui/" "$file"; then
        sed -i '' "s|from \"\.\./\.\./\.\./components/ui/|from \"@ui/|g" "$file"
        ((changes++))
    fi
    
    # Context (3+ niveaux)
    if grep -q "from '\.\./\.\./\.\./context/" "$file"; then
        sed -i '' "s|from '\.\./\.\./\.\./context/|from '@context/|g" "$file"
        ((changes++))
    fi
    if grep -q "from \"\.\./\.\./\.\./context/" "$file"; then
        sed -i '' "s|from \"\.\./\.\./\.\./context/|from \"@context/|g" "$file"
        ((changes++))
    fi
    
    # Config (3+ niveaux)
    if grep -q "from '\.\./\.\./\.\./config" "$file"; then
        sed -i '' "s|from '\.\./\.\./\.\./config|from '@/config|g" "$file"
        ((changes++))
    fi
    if grep -q "from \"\.\./\.\./\.\./config" "$file"; then
        sed -i '' "s|from \"\.\./\.\./\.\./config|from \"@/config|g" "$file"
        ((changes++))
    fi
    
    # Hooks (3+ niveaux)
    if grep -q "from '\.\./\.\./\.\./hooks/" "$file"; then
        sed -i '' "s|from '\.\./\.\./\.\./hooks/|from '@hooks/|g" "$file"
        ((changes++))
    fi
    if grep -q "from \"\.\./\.\./\.\./hooks/" "$file"; then
        sed -i '' "s|from \"\.\./\.\./\.\./hooks/|from \"@hooks/|g" "$file"
        ((changes++))
    fi
    
    # Utils (3+ niveaux)
    if grep -q "from '\.\./\.\./\.\./utils/" "$file"; then
        sed -i '' "s|from '\.\./\.\./\.\./utils/|from '@utils/|g" "$file"
        ((changes++))
    fi
    if grep -q "from \"\.\./\.\./\.\./utils/" "$file"; then
        sed -i '' "s|from \"\.\./\.\./\.\./utils/|from \"@utils/|g" "$file"
        ((changes++))
    fi
    
    # Même traitement pour 3 niveaux
    # Services
    if grep -q "from '\.\./\.\./services/" "$file"; then
        sed -i '' "s|from '\.\./\.\./services/|from '@services/|g" "$file"
        ((changes++))
    fi
    if grep -q "from \"\.\./\.\./services/" "$file"; then
        sed -i '' "s|from \"\.\./\.\./services/|from \"@services/|g" "$file"
        ((changes++))
    fi
    
    # UI Components
    if grep -q "from '\.\./\.\./components/ui/" "$file"; then
        sed -i '' "s|from '\.\./\.\./components/ui/|from '@ui/|g" "$file"
        ((changes++))
    fi
    if grep -q "from \"\.\./\.\./components/ui/" "$file"; then
        sed -i '' "s|from \"\.\./\.\./components/ui/|from \"@ui/|g" "$file"
        ((changes++))
    fi
    
    # Context
    if grep -q "from '\.\./\.\./context/" "$file"; then
        sed -i '' "s|from '\.\./\.\./context/|from '@context/|g" "$file"
        ((changes++))
    fi
    if grep -q "from \"\.\./\.\./context/" "$file"; then
        sed -i '' "s|from \"\.\./\.\./context/|from \"@context/|g" "$file"
        ((changes++))
    fi
    
    # Config
    if grep -q "from '\.\./\.\./config" "$file"; then
        sed -i '' "s|from '\.\./\.\./config|from '@/config|g" "$file"
        ((changes++))
    fi
    if grep -q "from \"\.\./\.\./config" "$file"; then
        sed -i '' "s|from \"\.\./\.\./config|from \"@/config|g" "$file"
        ((changes++))
    fi
    
    # Si des changements ont été effectués
    if [ $changes -gt 0 ]; then
        echo "  ✓ $file - $changes imports convertis"
        rm "$file.tmp"
        return 0
    else
        # Restaurer le fichier original
        mv "$file.tmp" "$file"
        return 1
    fi
}

# Compteurs
TOTAL_FILES=0
MODIFIED_FILES=0

# Créer un backup
BACKUP_DIR="backups/imports-conversion-$(date +%s)"
mkdir -p "$BACKUP_DIR"

echo "🔍 Recherche des fichiers JavaScript..."

# Trouver tous les fichiers JS/JSX avec des imports relatifs complexes
find src -type f \( -name "*.js" -o -name "*.jsx" \) \
    -not -path "*/node_modules/*" \
    -not -path "*/build/*" \
    -not -path "*/dist/*" | while read -r file; do
    
    # Vérifier si le fichier contient des imports relatifs complexes
    if grep -qE "from ['\"]\.\./(\.\./)+(services|components/ui|context|config|hooks|utils)" "$file"; then
        # Créer un backup
        cp "$file" "$BACKUP_DIR/$(basename "$file")"
        
        if convert_file "$file"; then
            ((MODIFIED_FILES++))
        fi
        ((TOTAL_FILES++))
    fi
done

echo ""
echo "📊 Résumé de la conversion:"
echo "  - Fichiers analysés: $TOTAL_FILES"
echo "  - Fichiers modifiés: $MODIFIED_FILES"
echo ""

if [ $MODIFIED_FILES -gt 0 ]; then
    echo "💾 Backup créé dans: $BACKUP_DIR"
    echo ""
    echo "🔍 Vérifiez le build après conversion:"
    echo "  npm run build"
    echo ""
    echo "↩️  Pour annuler les modifications:"
    echo "  cp $BACKUP_DIR/* ./src/"
else
    echo "✨ Aucun import relatif complexe trouvé!"
    rmdir "$BACKUP_DIR"
fi