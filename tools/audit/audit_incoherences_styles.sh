#!/bin/bash

# Script d'audit des incohérences de styles
# Mesure les progrès dans l'élimination des classes Bootstrap résiduelles

echo "🔍 AUDIT DES INCOHÉRENCES DE STYLES"
echo "=================================="
echo ""

# Fonction pour compter les occurrences
count_occurrences() {
    local pattern="$1"
    local description="$2"
    local count=$(grep -r "$pattern" src/ --include="*.js" --include="*.jsx" 2>/dev/null | wc -l | tr -d ' ')
    echo "📊 $description: $count occurrences"
    return $count
}

# 1. Classes Bootstrap btn btn-*
echo "1️⃣ CLASSES BOOTSTRAP BTN"
count_occurrences "className.*btn btn-" "Classes btn btn-*"
btn_count=$?

if [ $btn_count -eq 0 ]; then
    echo "   ✅ PARFAIT - Aucune classe Bootstrap btn résiduelle"
else
    echo "   ❌ À corriger - Fichiers concernés:"
    grep -r "className.*btn btn-" src/ --include="*.js" --include="*.jsx" -l 2>/dev/null | head -5
fi
echo ""

# 2. Classes Bootstrap d-flex
echo "2️⃣ CLASSES BOOTSTRAP D-FLEX"
count_occurrences "className.*d-flex" "Classes d-flex"
dflex_count=$?

if [ $dflex_count -lt 10 ]; then
    echo "   ✅ BON - Moins de 10 occurrences (acceptable)"
elif [ $dflex_count -lt 50 ]; then
    echo "   ⚠️ MOYEN - Réduction nécessaire"
else
    echo "   ❌ ÉLEVÉ - Migration prioritaire requise"
fi
echo ""

# 3. Classes Bootstrap alert (exclure les CSS Modules styles.alert*)
echo "3️⃣ CLASSES BOOTSTRAP ALERT"
alert_count=$(grep -r "className.*alert" src/ --include="*.js" --include="*.jsx" 2>/dev/null | grep -v "styles\.alert" | wc -l | tr -d ' ')
echo "📊 Classes alert Bootstrap: $alert_count occurrences"

if [ $alert_count -lt 5 ]; then
    echo "   ✅ BON - Moins de 5 occurrences (acceptable)"
elif [ $alert_count -lt 30 ]; then
    echo "   ⚠️ MOYEN - Réduction nécessaire"
else
    echo "   ❌ ÉLEVÉ - Migration prioritaire requise"
fi
echo ""

# 4. Classes Bootstrap form-* (exclure les CSS Modules styles.form*)
echo "4️⃣ CLASSES BOOTSTRAP FORM"
form_count=$(grep -r "className.*form-" src/ --include="*.js" --include="*.jsx" 2>/dev/null | grep -v "styles\.form" | wc -l | tr -d ' ')
echo "📊 Classes form-* Bootstrap: $form_count occurrences"

if [ $form_count -lt 10 ]; then
    echo "   ✅ BON - Moins de 10 occurrences (acceptable)"
elif [ $form_count -lt 30 ]; then
    echo "   ⚠️ MOYEN - Réduction nécessaire"
else
    echo "   ❌ ÉLEVÉ - Migration prioritaire requise"
fi
echo ""

# Calcul du score global
total_issues=$((btn_count + dflex_count + alert_count + form_count))
echo "📈 RÉSUMÉ GLOBAL"
echo "==============="
echo "Total des incohérences: $total_issues"

if [ $total_issues -lt 20 ]; then
    echo "🎉 EXCELLENT - Très peu d'incohérences restantes"
    score="A+"
elif [ $total_issues -lt 50 ]; then
    echo "👍 BON - Quelques incohérences à corriger"
    score="B+"
elif [ $total_issues -lt 100 ]; then
    echo "⚠️ MOYEN - Migration en cours"
    score="C"
else
    echo "❌ ÉLEVÉ - Migration prioritaire nécessaire"
    score="D"
fi

echo "Score de cohérence: $score"
echo ""

# Top 5 des fichiers les plus problématiques (exclure CSS Modules)
echo "🔥 TOP 5 FICHIERS LES PLUS PROBLÉMATIQUES"
echo "========================================"
{
    grep -r "className.*btn btn-\|className.*d-flex\|className.*alert\|className.*form-" src/ --include="*.js" --include="*.jsx" -l 2>/dev/null | \
    xargs -I {} sh -c 'echo "$(grep -c "className.*btn btn-\|className.*d-flex\|className.*alert\|className.*form-" "{}" 2>/dev/null | grep -v "styles\." | wc -l) {}"' | \
    sort -nr | head -5
} 2>/dev/null

echo ""
echo "✨ Audit terminé - $(date)"

# Sauvegarder le rapport
mkdir -p tools/logs/audits
{
    echo "# Rapport d'Audit des Incohérences de Styles - $(date)"
    echo ""
    echo "## Métriques"
    echo "- Classes btn btn-*: $btn_count"
    echo "- Classes d-flex: $dflex_count" 
    echo "- Classes alert: $alert_count"
    echo "- Classes form-*: $form_count"
    echo "- **Total: $total_issues**"
    echo "- **Score: $score**"
    echo ""
    echo "## Objectifs"
    echo "- btn btn-*: 0 ✅"
    echo "- d-flex: <10"
    echo "- alert: <5"
    echo "- form-*: <10"
} > tools/logs/audits/incoherences_styles_$(date +%Y%m%d_%H%M%S).md

echo "📄 Rapport sauvegardé dans tools/logs/audits/" 