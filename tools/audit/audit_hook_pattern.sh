#!/bin/bash

# Script d'audit générique pour analyser des patterns de hooks
# Usage: ./audit_hook_pattern.sh <base_name> <domain>
# Exemple: ./audit_hook_pattern.sh useLieuDetails lieux

if [ $# -ne 2 ]; then
    echo "❌ Usage: $0 <hook_base_name> <domain>"
    echo "   Exemple: $0 useLieuDetails lieux"
    exit 1
fi

HOOK_BASE="$1"
DOMAIN="$2"

echo "🔍 AUDIT COMPLET: $HOOK_BASE"
echo "$(printf '=%.0s' {1..50})"
echo ""

# 1. Inventaire des fichiers
echo "📁 1. INVENTAIRE DES FICHIERS DANS $DOMAIN"
echo "--------------------------------------------"
find "src/hooks/$DOMAIN/" -name "*$(echo $HOOK_BASE | sed 's/use//')*.js" -type f 2>/dev/null | sort
echo ""

# 2. Analyse des exports dans index.js
echo "📤 2. EXPORTS DANS INDEX.JS"
echo "---------------------------"
INDEX_FILE="src/hooks/$DOMAIN/index.js"
if [ -f "$INDEX_FILE" ]; then
    grep -n "$(echo $HOOK_BASE | sed 's/use//')" "$INDEX_FILE" || echo "Aucun export trouvé"
else
    echo "❌ Fichier index.js non trouvé dans $DOMAIN"
fi
echo ""

# 3. Trouver toutes les variantes du hook
echo "🔍 3. DETECTION DES VARIANTES"
echo "-----------------------------"
VARIANTS=()
for variant in "" "Migrated" "Optimized" "Complete" "V2"; do
    HOOK_NAME="${HOOK_BASE}${variant}"
    HOOK_FILE="src/hooks/$DOMAIN/$HOOK_NAME.js"
    if [ -f "$HOOK_FILE" ]; then
        VARIANTS+=("$HOOK_NAME")
        echo "✅ $HOOK_NAME"
    fi
done

if [ ${#VARIANTS[@]} -eq 0 ]; then
    echo "❌ Aucune variante trouvée pour $HOOK_BASE dans $DOMAIN"
    exit 1
fi
echo ""

# 4. Analyse des imports externes pour chaque variante
echo "📥 4. IMPORTS EXTERNES (hors domaine hooks/$DOMAIN)"
echo "---------------------------------------------------"
for variant in "${VARIANTS[@]}"; do
    echo "🔎 $variant:"
    imports=$(grep -r "import.*$variant" src/ --include="*.js" --include="*.jsx" --exclude-dir="hooks/$DOMAIN" 2>/dev/null | wc -l)
    if [ "$imports" -gt 0 ]; then
        grep -r "import.*$variant" src/ --include="*.js" --include="*.jsx" --exclude-dir="hooks/$DOMAIN" 2>/dev/null | head -3
        if [ "$imports" -gt 3 ]; then
            echo "  ... et $((imports - 3)) autres imports"
        fi
    else
        echo "  Aucun import externe trouvé"
    fi
    echo ""
done

# 5. Analyse des usages externes
echo "🎯 5. USAGES EXTERNES (appels de hooks)"
echo "---------------------------------------"
for variant in "${VARIANTS[@]}"; do
    echo "🔎 $variant():"
    usages=$(grep -r "$variant(" src/ --include="*.js" --include="*.jsx" --exclude-dir="hooks/$DOMAIN" 2>/dev/null | wc -l)
    if [ "$usages" -gt 0 ]; then
        grep -r "$variant(" src/ --include="*.js" --include="*.jsx" --exclude-dir="hooks/$DOMAIN" 2>/dev/null | head -3
        if [ "$usages" -gt 3 ]; then
            echo "  ... et $((usages - 3)) autres usages"
        fi
    else
        echo "  Aucun usage externe trouvé"
    fi
    echo ""
done

# 6. Analyse des imports INTERNES
echo "🏠 6. IMPORTS INTERNES (dans hooks/$DOMAIN)"
echo "--------------------------------------------"
for variant in "${VARIANTS[@]}"; do
    HOOK_FILE="src/hooks/$DOMAIN/$variant.js"
    if [ -f "$HOOK_FILE" ]; then
        echo "📄 $variant:"
        internal_imports=$(grep -n "import.*$(echo $HOOK_BASE | sed 's/use//')" "$HOOK_FILE" 2>/dev/null)
        if [ -n "$internal_imports" ]; then
            echo "$internal_imports" | sed 's/^/  /'
        else
            echo "  Aucun import interne"
        fi
        echo ""
    fi
done

# 7. Analyse du contenu des fichiers
echo "📖 7. ANALYSE DU CONTENU DES FICHIERS"
echo "-------------------------------------"
for variant in "${VARIANTS[@]}"; do
    HOOK_FILE="src/hooks/$DOMAIN/$variant.js"
    if [ -f "$HOOK_FILE" ]; then
        echo "📄 $variant:"
        echo "  📏 Lignes: $(wc -l < "$HOOK_FILE")"
        
        # Fonction principale
        main_func=$(grep -n "^const.*=" "$HOOK_FILE" | head -1)
        if [ -n "$main_func" ]; then
            echo "  🎯 Fonction principale:"
            echo "    $main_func"
        fi
        
        # Imports
        echo "  📦 Imports clés:"
        grep -n "^import" "$HOOK_FILE" | head -3 | sed 's/^/    /' || echo "    Aucun import"
        
        # Détection de patterns
        if grep -q "const.*Hook.*=" "$HOOK_FILE" 2>/dev/null; then
            echo "  🔄 WRAPPER détecté (utilise un autre hook)"
        fi
        
        if grep -q "useGenericEntityDetails" "$HOOK_FILE" 2>/dev/null; then
            echo "  ⚡ MODERNE (utilise useGenericEntityDetails)"
        fi
        
        if grep -q "@deprecated" "$HOOK_FILE" 2>/dev/null; then
            echo "  🚫 DÉPRÉCIÉ (marqué deprecated)"
        fi
        
        # Complexité approximative
        complexity=$(grep -c "const\|function\|=>" "$HOOK_FILE" 2>/dev/null || echo "0")
        if [ "$complexity" -gt 20 ]; then
            echo "  🏗️ COMPLEXE ($complexity fonctions/constantes)"
        elif [ "$complexity" -gt 10 ]; then
            echo "  📊 MOYEN ($complexity fonctions/constantes)"
        else
            echo "  🎯 SIMPLE ($complexity fonctions/constantes)"
        fi
        
        echo ""
    fi
done

# 8. Graphe des dépendances
echo "🔗 8. GRAPHE DES DÉPENDANCES"
echo "----------------------------"
for variant in "${VARIANTS[@]}"; do
    HOOK_FILE="src/hooks/$DOMAIN/$variant.js"
    if [ -f "$HOOK_FILE" ]; then
        echo "🌐 $variant:"
        deps=$(grep "import.*$(echo $HOOK_BASE | sed 's/use//')" "$HOOK_FILE" 2>/dev/null | sed 's/.*import[^{]*{\?\s*\([^}]*\)\s*}\?.*/\1/' | tr ',' '\n' | xargs)
        if [ -n "$deps" ]; then
            echo "  └── $deps"
        else
            echo "  └── Aucune dépendance interne"
        fi
    fi
done

echo ""

# 9. Statistiques et recommandations
echo "📊 9. STATISTIQUES ET RECOMMANDATIONS"
echo "-------------------------------------"

echo "📈 Statistiques d'usage externe:"
total_external=0
most_used_variant=""
most_used_count=0

for variant in "${VARIANTS[@]}"; do
    import_count=$(grep -r "import.*$variant" src/ --include="*.js" --include="*.jsx" --exclude-dir="hooks/$DOMAIN" 2>/dev/null | wc -l)
    usage_count=$(grep -r "$variant(" src/ --include="*.js" --include="*.jsx" --exclude-dir="hooks/$DOMAIN" 2>/dev/null | wc -l)
    total_count=$((import_count + usage_count))
    total_external=$((total_external + total_count))
    
    echo "  🔸 $variant: $total_count usages ($import_count imports + $usage_count appels)"
    
    if [ "$total_count" -gt "$most_used_count" ]; then
        most_used_count=$total_count
        most_used_variant=$variant
    fi
done

echo ""
echo "💡 RECOMMANDATIONS DE MIGRATION:"

if [ ${#VARIANTS[@]} -eq 1 ]; then
    echo "  ✅ Une seule variante trouvée - aucune migration nécessaire"
elif [ "$total_external" -eq 0 ]; then
    echo "  ⚠️  Aucun usage externe détecté - tous les hooks peuvent être supprimés sauf un"
    echo "  🎯 RECOMMANDATION: Garder la version la plus moderne et supprimer les autres"
else
    echo "  🎯 VERSION LA PLUS UTILISÉE: $most_used_variant ($most_used_count usages)"
    
    # Analyser quelle version est la plus moderne
    modern_variant=""
    for variant in "${VARIANTS[@]}"; do
        HOOK_FILE="src/hooks/$DOMAIN/$variant.js"
        if [ -f "$HOOK_FILE" ] && grep -q "useGenericEntityDetails" "$HOOK_FILE" 2>/dev/null; then
            modern_variant=$variant
            break
        fi
    done
    
    if [ -n "$modern_variant" ]; then
        echo "  ⚡ VERSION LA PLUS MODERNE: $modern_variant (utilise useGenericEntityDetails)"
        
        if [ "$modern_variant" = "$most_used_variant" ]; then
            echo "  ✅ SITUATION IDÉALE: Version moderne = version la plus utilisée"
            echo "  📝 STRATÉGIE: Migrer les autres variantes vers $modern_variant"
        else
            echo "  🔄 SITUATION COMPLEXE: Version moderne ≠ version la plus utilisée"
            echo "  📝 STRATÉGIE: Évaluer le contenu et choisir la cible appropriée"
        fi
    else
        echo "  ⚠️  Aucune version moderne détectée (useGenericEntityDetails)"
        echo "  📝 STRATÉGIE: Migrer vers la version la plus utilisée: $most_used_variant"
    fi
fi

echo ""
echo "🎉 AUDIT TERMINÉ"
echo "===============" 