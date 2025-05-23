#!/bin/bash

# ============================================================================
# Script de Génération de Rapport - Migration Bootstrap
# ============================================================================
# 
# Génère automatiquement un rapport complet de l'état de migration Bootstrap
# avec statistiques en temps réel et recommandations d'actions
#
# Usage: ./tools/css/generate_migration_report.sh
# ============================================================================

echo "🚀 Génération du rapport de migration Bootstrap..."
echo "=============================================="

# Configuration
REPORT_DIR="docs/.ai-docs/audit-css"
REPORT_FILE="$REPORT_DIR/migration_bootstrap_rapport_automatique.md"
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

# Créer le répertoire si nécessaire
mkdir -p "$REPORT_DIR"

# Compter les usages Bootstrap restants
echo "📊 Analyse des usages Bootstrap restants..."
BOOTSTRAP_COUNT=$(grep -r 'className="btn' src/ --include="*.js" --include="*.jsx" | wc -l | tr -d ' ')
BOOTSTRAP_FILES=$(grep -r 'className="btn' src/ --include="*.js" --include="*.jsx" -l | wc -l | tr -d ' ')

# Compter les usages du composant Button
BUTTON_COUNT=$(grep -r 'Button' src/ --include="*.js" --include="*.jsx" | grep -E "(import.*Button|<Button)" | wc -l | tr -d ' ')

# Calculer le pourcentage de migration
TOTAL_ESTIMATED=74
MIGRATED=$((TOTAL_ESTIMATED - BOOTSTRAP_COUNT))
PROGRESS_PERCENT=$(((MIGRATED * 100) / TOTAL_ESTIMATED))

# Générer le rapport
cat > "$REPORT_FILE" << EOF
# Rapport Automatique - Migration Bootstrap

**Généré le :** $TIMESTAMP  
**Par :** \`tools/css/generate_migration_report.sh\`

---

## 📊 **STATISTIQUES EN TEMPS RÉEL**

### Progression Globale
- **Usages Bootstrap restants** : $BOOTSTRAP_COUNT
- **Fichiers avec Bootstrap** : $BOOTSTRAP_FILES
- **Usages composant Button** : $BUTTON_COUNT
- **Progression estimée** : $PROGRESS_PERCENT% ($MIGRATED/$TOTAL_ESTIMATED)

### Analyse de l'État
EOF

# Ajouter l'analyse conditionnelle
if [ $PROGRESS_PERCENT -ge 80 ]; then
    cat >> "$REPORT_FILE" << EOF
🎉 **EXCELLENT PROGRÈS !** Plus de 80% de migration accomplie.
EOF
elif [ $PROGRESS_PERCENT -ge 60 ]; then
    cat >> "$REPORT_FILE" << EOF
🚀 **BON PROGRÈS !** Plus de 60% de migration accomplie.
EOF
elif [ $PROGRESS_PERCENT -ge 40 ]; then
    cat >> "$REPORT_FILE" << EOF
⚡ **PROGRÈS CORRECT** Plus de 40% de migration accomplie.
EOF
else
    cat >> "$REPORT_FILE" << EOF
⚠️ **DÉBUT DE MIGRATION** Moins de 40% accompli.
EOF
fi

# Lister les fichiers restants
cat >> "$REPORT_FILE" << EOF

---

## 📋 **FICHIERS AVEC USAGES BOOTSTRAP RESTANTS**

EOF

if [ $BOOTSTRAP_COUNT -gt 0 ]; then
    echo "### Fichiers à traiter :" >> "$REPORT_FILE"
    grep -r 'className="btn' src/ --include="*.js" --include="*.jsx" -l | sort | while read file; do
        count=$(grep 'className="btn' "$file" | wc -l | tr -d ' ')
        echo "- \`$file\` ($count usages)" >> "$REPORT_FILE"
    done
    
    echo "" >> "$REPORT_FILE"
    echo "### Détail des usages :" >> "$REPORT_FILE"
    grep -r 'className="btn' src/ --include="*.js" --include="*.jsx" -n | head -20 | while read line; do
        echo "\`$line\`" >> "$REPORT_FILE"
    done
else
    echo "🎉 **AUCUN FICHIER RESTANT !** Migration Bootstrap 100% terminée !" >> "$REPORT_FILE"
fi

# Ajouter les recommandations
cat >> "$REPORT_FILE" << EOF

---

## 🎯 **RECOMMANDATIONS D'ACTIONS**

EOF

if [ $BOOTSTRAP_COUNT -le 10 ]; then
    cat >> "$REPORT_FILE" << EOF
### Phase Finale 🏁
1. **Migrer les derniers $BOOTSTRAP_COUNT usages** manuellement
2. **Traiter les cas particuliers** (Links, PDFDownloadLink)
3. **Validation finale** de l'application
4. **Célébrer** la migration 100% terminée ! 🎉
EOF
elif [ $BOOTSTRAP_COUNT -le 30 ]; then
    cat >> "$REPORT_FILE" << EOF
### Phase d'Accélération ⚡
1. **Utiliser le script** \`./tools/css/migrate_bootstrap_buttons.sh\`
2. **Traiter les fichiers par priorité** (plus d'usages d'abord)
3. **Tester régulièrement** avec \`npm run build\`
4. **Documenter les cas particuliers**
EOF
else
    cat >> "$REPORT_FILE" << EOF
### Phase de Progression 🚀
1. **Exécuter l'analyse** \`./tools/css/migrate_bootstrap_buttons.sh\`
2. **Migrer 5-10 fichiers par session**
3. **Prioriser les fichiers** avec le plus d'usages
4. **Maintenir la documentation** à jour
EOF
fi

# Ajouter les outils disponibles
cat >> "$REPORT_FILE" << EOF

---

## 🛠️ **OUTILS DISPONIBLES**

### Scripts de Migration
- \`tools/css/migrate_bootstrap_buttons.sh\` - Analyse et guide
- \`tools/css/generate_migration_report.sh\` - Ce rapport
- \`tools/css/cleanup_css_fallbacks.sh\` - Nettoyage fallbacks

### Documentation
- \`docs/.ai-docs/audit-css/migration_bootstrap_rapport_etapes_1_2_3.md\` - Rapport détaillé
- \`docs/.ai-docs/audit complex/recommendations_progress_report.md\` - Vue globale

### Composant Cible
\`\`\`jsx
import Button from '@ui/Button';

<Button variant="primary" size="sm" onClick={handleClick}>
  Mon Bouton
</Button>
\`\`\`

---

**Rapport généré automatiquement** - Exécuter à nouveau pour mise à jour
EOF

echo "✅ Rapport généré : $REPORT_FILE"
echo "📊 Statistiques :"
echo "   • $BOOTSTRAP_COUNT usages Bootstrap restants"
echo "   • $BOOTSTRAP_FILES fichiers concernés"
echo "   • $PROGRESS_PERCENT% de progression"

if [ $BOOTSTRAP_COUNT -eq 0 ]; then
    echo "🎉 MIGRATION 100% TERMINÉE !"
else
    echo "🎯 Prochaine action : Voir $REPORT_FILE"
fi 