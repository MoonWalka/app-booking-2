#!/bin/bash

# Audit complet du nettoyage des scripts
# Vérifie qu'aucun script n'est mal placé ou orphelin

set -e

echo "🔍 AUDIT POST-NETTOYAGE - Vérification Scripts"
echo "================================================"

# Compteurs
TOTAL_SCRIPTS=0
ROOT_SCRIPTS=0
TOOLS_SCRIPTS=0
ORPHAN_SCRIPTS=0
SUSPICIOUS_SCRIPTS=0

echo "📊 1. INVENTAIRE COMPLET DES SCRIPTS..."
echo "========================================"

# Chercher TOUS les scripts .sh dans le projet (hors node_modules)
echo "🔎 Recherche de tous les fichiers .sh..."
ALL_SCRIPTS=$(find . -name "*.sh" -type f -not -path "./node_modules/*" -not -path "./.git/*" | sort)

echo "📋 Scripts trouvés:"
echo "$ALL_SCRIPTS" | nl

TOTAL_SCRIPTS=$(echo "$ALL_SCRIPTS" | wc -l | tr -d ' ')
echo ""
echo "📊 Total scripts trouvés: $TOTAL_SCRIPTS"

echo ""
echo "📊 2. ANALYSE PAR LOCALISATION..."
echo "=================================="

# Scripts dans la racine
echo "🏠 Scripts racine (acceptable: setup, config globaux):"
ROOT_LIST=$(find . -maxdepth 1 -name "*.sh" -type f | sort)
if [ -n "$ROOT_LIST" ]; then
    echo "$ROOT_LIST" | nl
    ROOT_SCRIPTS=$(echo "$ROOT_LIST" | wc -l | tr -d ' ')
else
    echo "   ✅ Aucun script dans la racine"
    ROOT_SCRIPTS=0
fi

# Scripts dans tools/
echo ""
echo "🛠️  Scripts dans tools/ (attendu):"
TOOLS_LIST=$(find tools -name "*.sh" -type f 2>/dev/null | sort)
if [ -n "$TOOLS_LIST" ]; then
    echo "$TOOLS_LIST" | nl
    TOOLS_SCRIPTS=$(echo "$TOOLS_LIST" | wc -l | tr -d ' ')
else
    echo "   ❌ Aucun script dans tools/ (problème!)"
    TOOLS_SCRIPTS=0
fi

# Scripts ailleurs (orphelins)
echo ""
echo "🚨 Scripts orphelins (problématiques):"
ORPHAN_LIST=$(find . -name "*.sh" -type f -not -path "./tools/*" -not -maxdepth 1 -not -path "./node_modules/*" -not -path "./.git/*" | sort)
if [ -n "$ORPHAN_LIST" ]; then
    echo "$ORPHAN_LIST" | nl
    ORPHAN_SCRIPTS=$(echo "$ORPHAN_LIST" | wc -l | tr -d ' ')
    echo "   ⚠️  ATTENTION: Scripts trouvés hors tools/ et racine!"
else
    echo "   ✅ Aucun script orphelin"
    ORPHAN_SCRIPTS=0
fi

echo ""
echo "📊 3. ANALYSE DES SCRIPTS RACINE..."
echo "==================================="

if [ "$ROOT_SCRIPTS" -gt 0 ]; then
    echo "🔍 Vérification des scripts racine (légitimes?):"
    while IFS= read -r script; do
        if [ -n "$script" ]; then
            filename=$(basename "$script")
            echo "   📄 $filename:"
            
            # Vérifier si c'est un script légitime
            case "$filename" in
                "setup-"*|"install"*|"build"*|"deploy"*|"start"*)
                    echo "      ✅ Script légitime (setup/déploiement)"
                    ;;
                "test"*|"lint"*|"format"*)
                    echo "      ✅ Script légitime (qualité code)"
                    ;;
                *)
                    echo "      ⚠️  Script suspect - devrait être dans tools/?"
                    ((SUSPICIOUS_SCRIPTS++))
                    ;;
            esac
        fi
    done <<< "$ROOT_LIST"
else
    echo "✅ Aucun script racine à analyser"
fi

echo ""
echo "📊 4. VÉRIFICATION STRUCTURE TOOLS/..."
echo "======================================"

# Vérifier que tools/ a la bonne structure
EXPECTED_DIRS=("migration" "css" "firebase" "audit" "maintenance")
echo "🏗️  Vérification structure attendue:"

for dir in "${EXPECTED_DIRS[@]}"; do
    if [ -d "tools/$dir" ]; then
        count=$(find "tools/$dir" -name "*.sh" -type f | wc -l | tr -d ' ')
        echo "   ✅ tools/$dir/ ($count scripts)"
    else
        echo "   ❌ tools/$dir/ manquant!"
    fi
done

echo ""
echo "📊 5. RECHERCHE DOUBLONS/CONFLITS..."
echo "===================================="

# Chercher des noms similaires qui pourraient être des doublons
echo "🔍 Recherche de doublons potentiels:"
SCRIPT_NAMES=$(echo "$ALL_SCRIPTS" | xargs -n1 basename | sort)
DUPLICATES=$(echo "$SCRIPT_NAMES" | uniq -d)

if [ -n "$DUPLICATES" ]; then
    echo "⚠️  Noms de scripts dupliqués détectés:"
    echo "$DUPLICATES"
else
    echo "✅ Aucun doublon détecté"
fi

echo ""
echo "📊 6. VÉRIFICATION PERMISSIONS..."
echo "================================="

echo "🔒 Scripts non-exécutables (problème potentiel):"
NON_EXEC=$(find . -name "*.sh" -type f -not -path "./node_modules/*" -not -path "./.git/*" ! -executable)
if [ -n "$NON_EXEC" ]; then
    echo "$NON_EXEC"
    echo "   ⚠️  Scripts sans permission d'exécution trouvés"
else
    echo "✅ Tous les scripts sont exécutables"
fi

echo ""
echo "📊 7. FICHIERS TEMPORAIRES/BACKUP..."
echo "===================================="

echo "🗑️  Fichiers temporaires de scripts:"
TEMP_FILES=$(find . -name "*.sh.*" -o -name "*~" -o -name "*.bak" -o -name "*.backup*" -type f -not -path "./node_modules/*" -not -path "./.git/*")
if [ -n "$TEMP_FILES" ]; then
    echo "$TEMP_FILES"
    echo "   ⚠️  Fichiers temporaires trouvés - nettoyage recommandé"
else
    echo "✅ Aucun fichier temporaire"
fi

echo ""
echo "🎯 RÉSUMÉ FINAL DE L'AUDIT"
echo "=========================="

echo "📊 Statistiques:"
echo "   📄 Total scripts: $TOTAL_SCRIPTS"
echo "   🏠 Scripts racine: $ROOT_SCRIPTS"
echo "   🛠️  Scripts tools/: $TOOLS_SCRIPTS"
echo "   🚨 Scripts orphelins: $ORPHAN_SCRIPTS"
echo "   ⚠️  Scripts suspects: $SUSPICIOUS_SCRIPTS"

echo ""
echo "✅ ÉVALUATION GLOBALE:"

# Score de qualité
SCORE=100
if [ "$ORPHAN_SCRIPTS" -gt 0 ]; then
    SCORE=$((SCORE - ORPHAN_SCRIPTS * 20))
    echo "   ❌ Scripts orphelins détectés (-$((ORPHAN_SCRIPTS * 20)) points)"
fi

if [ "$SUSPICIOUS_SCRIPTS" -gt 0 ]; then
    SCORE=$((SCORE - SUSPICIOUS_SCRIPTS * 10))
    echo "   ⚠️  Scripts suspects en racine (-$((SUSPICIOUS_SCRIPTS * 10)) points)"
fi

if [ "$TOOLS_SCRIPTS" -lt 40 ]; then
    echo "   ⚠️  Peu de scripts dans tools/ (migration incomplète?)"
    SCORE=$((SCORE - 10))
fi

echo ""
if [ "$SCORE" -ge 90 ]; then
    echo "🎉 EXCELLENT! Score: $SCORE/100 - Nettoyage réussi!"
elif [ "$SCORE" -ge 70 ]; then
    echo "👍 BON! Score: $SCORE/100 - Quelques ajustements recommandés"
else
    echo "⚠️  PEUT MIEUX FAIRE! Score: $SCORE/100 - Nettoyage à continuer"
fi

echo ""
echo "🎯 RECOMMANDATIONS:"
if [ "$ORPHAN_SCRIPTS" -gt 0 ]; then
    echo "   📋 Déplacer les scripts orphelins vers tools/"
fi
if [ "$SUSPICIOUS_SCRIPTS" -gt 0 ]; then
    echo "   📋 Évaluer si les scripts racine suspects peuvent être déplacés"
fi
if [ -n "$TEMP_FILES" ]; then
    echo "   📋 Nettoyer les fichiers temporaires/backup"
fi
if [ "$SCORE" -ge 90 ]; then
    echo "   🎊 Nettoyage terminé avec succès - aucune action requise!"
fi

echo ""
echo "📅 Audit terminé le $(date)" 