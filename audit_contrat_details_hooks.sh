#!/bin/bash

# Script d'audit complet pour les hooks useContratDetails
# Analyse tous les imports, exports et dépendances

echo "🔍 AUDIT COMPLET: HOOKS CONTRAT DETAILS"
echo "======================================"
echo ""

# 1. Inventaire des fichiers hooks contrats
echo "📁 1. INVENTAIRE DES FICHIERS HOOKS CONTRATS"
echo "--------------------------------------------"
find src/hooks/contrats/ -name "*ontrat*etails*" -type f | sort
echo ""

# 2. Analyse des exports dans index.js
echo "📤 2. EXPORTS DANS INDEX.JS"
echo "---------------------------"
grep -n "ontrat.*etails" src/hooks/contrats/index.js || echo "Aucun export trouvé"
echo ""

# 3. Analyse des imports externes
echo "📥 3. IMPORTS EXTERNES (hors domaine hooks/contrats)"
echo "---------------------------------------------------"
echo "🔎 useContratDetails:"
grep -r "import.*useContratDetails[^V]" src/ --include="*.js" --include="*.jsx" --exclude-dir="hooks/contrats" 2>/dev/null || echo "  Aucun import trouvé"
echo ""
echo "🔎 useContratDetailsMigrated:"
grep -r "import.*useContratDetailsMigrated" src/ --include="*.js" --include="*.jsx" --exclude-dir="hooks/contrats" 2>/dev/null || echo "  Aucun import trouvé"
echo ""
echo "🔎 useContratDetailsV2:"
grep -r "import.*useContratDetailsV2" src/ --include="*.js" --include="*.jsx" --exclude-dir="hooks/contrats" 2>/dev/null || echo "  Aucun import trouvé"
echo ""

# 4. Analyse des usages externes
echo "🎯 4. USAGES EXTERNES (appels de hooks)"
echo "---------------------------------------"
echo "🔎 useContratDetails():"
grep -r "useContratDetails(" src/ --include="*.js" --include="*.jsx" --exclude-dir="hooks/contrats" 2>/dev/null || echo "  Aucun usage trouvé"
echo ""
echo "🔎 useContratDetailsMigrated():"
grep -r "useContratDetailsMigrated(" src/ --include="*.js" --include="*.jsx" --exclude-dir="hooks/contrats" 2>/dev/null || echo "  Aucun usage trouvé"
echo ""
echo "🔎 useContratDetailsV2():"
grep -r "useContratDetailsV2(" src/ --include="*.js" --include="*.jsx" --exclude-dir="hooks/contrats" 2>/dev/null || echo "  Aucun usage trouvé"
echo ""

# 5. Analyse des imports INTERNES (dans le domaine hooks/contrats)
echo "🏠 5. IMPORTS INTERNES (dans hooks/contrats)"
echo "--------------------------------------------"
for file in src/hooks/contrats/*ontrat*etails*.js; do
    if [ -f "$file" ]; then
        echo "📄 $(basename "$file"):"
        grep -n "import.*useContrat.*etails" "$file" 2>/dev/null || echo "  Aucun import interne"
        echo ""
    fi
done

# 6. Analyse du contenu des fichiers
echo "📖 6. ANALYSE DU CONTENU DES FICHIERS"
echo "-------------------------------------"

for file in src/hooks/contrats/*ontrat*etails*.js; do
    if [ -f "$file" ]; then
        filename=$(basename "$file")
        echo "📄 $filename:"
        echo "  📏 Lignes: $(wc -l < "$file")"
        echo "  🎯 Fonction principale:"
        grep -n "^const.*=" "$file" | head -1 | sed 's/^/    /'
        echo "  📦 Imports:"
        grep -n "^import" "$file" | sed 's/^/    /' || echo "    Aucun import"
        echo "  📤 Exports:"
        grep -n "^export" "$file" | sed 's/^/    /' || echo "    Aucun export"
        
        # Vérifier si c'est un wrapper
        if grep -q "const.*Hook.*=" "$file" 2>/dev/null; then
            echo "  🔄 WRAPPER détecté (utilise un autre hook)"
        fi
        
        # Vérifier si utilise useGenericEntityDetails
        if grep -q "useGenericEntityDetails" "$file" 2>/dev/null; then
            echo "  ⚡ MODERNE (utilise useGenericEntityDetails)"
        fi
        
        echo ""
    fi
done

# 7. Résumé des dépendances
echo "🔗 7. GRAPHE DES DÉPENDANCES"
echo "----------------------------"
echo "🌐 useContratDetails:"
if [ -f "src/hooks/contrats/useContratDetails.js" ]; then
    deps=$(grep "import.*useContrat.*etails" "src/hooks/contrats/useContratDetails.js" 2>/dev/null | sed 's/.*useContrat\([^"'\'']*\).*/useContrat\1/' || echo "  Aucune dépendance")
    echo "  └── $deps"
else
    echo "  📄 Fichier non trouvé"
fi

echo ""
echo "🌐 useContratDetailsMigrated:"
if [ -f "src/hooks/contrats/useContratDetailsMigrated.js" ]; then
    deps=$(grep "import.*useContrat.*etails" "src/hooks/contrats/useContratDetailsMigrated.js" 2>/dev/null | sed 's/.*useContrat\([^"'\'']*\).*/useContrat\1/' || echo "  Aucune dépendance")
    echo "  └── $deps"
else
    echo "  📄 Fichier non trouvé"
fi

echo ""
echo "📊 8. RECOMMANDATIONS DE MIGRATION"
echo "-----------------------------------"

# Compter les usages externes
contrat_details_count=$(grep -r "useContratDetails[^VM]" src/ --include="*.js" --include="*.jsx" --exclude-dir="hooks/contrats" 2>/dev/null | wc -l)
contrat_details_v2_count=$(grep -r "useContratDetailsV2" src/ --include="*.js" --include="*.jsx" --exclude-dir="hooks/contrats" 2>/dev/null | wc -l)
contrat_details_migrated_count=$(grep -r "useContratDetailsMigrated" src/ --include="*.js" --include="*.jsx" --exclude-dir="hooks/contrats" 2>/dev/null | wc -l)

echo "📈 Statistiques d'usage externe:"
echo "  🔸 useContratDetails: $contrat_details_count usages"
echo "  🔸 useContratDetailsV2: $contrat_details_v2_count usages"  
echo "  🔸 useContratDetailsMigrated: $contrat_details_migrated_count usages"
echo ""

echo "💡 STRATÉGIE RECOMMANDÉE:"
if [ -f "src/hooks/contrats/useContratDetailsMigrated.js" ] && grep -q "useGenericEntityDetails" "src/hooks/contrats/useContratDetailsMigrated.js" 2>/dev/null; then
    echo "  ✅ useContratDetailsMigrated est la version MODERNE (avec useGenericEntityDetails)"
    echo "  🎯 CIBLE: Migrer tout vers useContratDetails (renommer useContratDetailsMigrated)"
    echo "  📝 ÉTAPES:"
    echo "    1. Remplacer tous les imports useContratDetailsV2 → useContratDetails"
    echo "    2. Remplacer tous les usages useContratDetailsV2() → useContratDetails()"
    echo "    3. Renommer useContratDetailsMigrated.js → useContratDetails.js (écrasement)"
    echo "    4. Mettre à jour les exports dans index.js"
    echo "    5. Supprimer les anciens exports"
else
    echo "  ⚠️  Situation complexe détectée - analyse manuelle nécessaire"
fi

echo ""
echo "🎉 AUDIT TERMINÉ"
echo "===============" 