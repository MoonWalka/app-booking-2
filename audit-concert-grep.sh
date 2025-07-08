#!/bin/bash

# Script d'audit exhaustif pour la migration concert → date
# Date: $(date +%Y-%m-%d)

echo "🔍 AUDIT EXHAUSTIF MIGRATION CONCERT → DATE"
echo "=========================================="
echo ""

# Créer un dossier pour les résultats
mkdir -p audit-results
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
REPORT_FILE="audit-results/audit-concert-${TIMESTAMP}.md"

# En-tête du rapport
cat > "$REPORT_FILE" << EOF
# Audit Exhaustif Migration Concert → Date
Date: $(date)

## Résumé Exécutif

EOF

# 1. Compter toutes les occurrences
echo "1️⃣ Comptage des occurrences..."
echo "## 1. Comptage Global" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

# Occurrences exactes de "concert" (sensible à la casse)
CONCERT_COUNT=$(grep -r "\bconcert\b" src/ --include="*.js" | wc -l)
echo "- Occurrences de 'concert' (minuscule): $CONCERT_COUNT" >> "$REPORT_FILE"

# Occurrences de "Concert" (majuscule)
CONCERT_UPPER_COUNT=$(grep -r "\bConcert\b" src/ --include="*.js" | wc -l)
echo "- Occurrences de 'Concert' (majuscule): $CONCERT_UPPER_COUNT" >> "$REPORT_FILE"

# Occurrences de "concerts" (pluriel)
CONCERTS_COUNT=$(grep -r "\bconcerts\b" src/ --include="*.js" | wc -l)
echo "- Occurrences de 'concerts' (pluriel): $CONCERTS_COUNT" >> "$REPORT_FILE"

TOTAL_COUNT=$((CONCERT_COUNT + CONCERT_UPPER_COUNT + CONCERTS_COUNT))
echo "- **TOTAL**: $TOTAL_COUNT occurrences" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

# 2. Analyser par type d'usage
echo "2️⃣ Analyse par type d'usage..."
echo "## 2. Types d'Usage" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

# Collections Firebase
echo "### 2.1 Collections Firebase" >> "$REPORT_FILE"
echo '```javascript' >> "$REPORT_FILE"
grep -rn "collection.*concerts" src/ --include="*.js" | head -10 >> "$REPORT_FILE" 2>/dev/null || echo "Aucune collection 'concerts' trouvée" >> "$REPORT_FILE"
echo '```' >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

# Variables et propriétés
echo "### 2.2 Variables et Propriétés" >> "$REPORT_FILE"
echo "#### Variables 'concert'" >> "$REPORT_FILE"
echo '```javascript' >> "$REPORT_FILE"
grep -rn "let concert\|const concert\|var concert" src/ --include="*.js" | head -10 >> "$REPORT_FILE"
echo '```' >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

echo "#### Propriétés 'concertsAssocies'" >> "$REPORT_FILE"
echo '```javascript' >> "$REPORT_FILE"
grep -rn "concertsAssocies" src/ --include="*.js" | head -10 >> "$REPORT_FILE"
echo '```' >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

echo "#### Propriétés 'concertsIds'" >> "$REPORT_FILE"
echo '```javascript' >> "$REPORT_FILE"
grep -rn "concertsIds" src/ --include="*.js" | head -10 >> "$REPORT_FILE"
echo '```' >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

# 3. Fichiers les plus impactés
echo "3️⃣ Identification des fichiers critiques..."
echo "## 3. Fichiers les Plus Impactés" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

echo "### Top 20 des fichiers avec le plus d'occurrences:" >> "$REPORT_FILE"
echo '```' >> "$REPORT_FILE"
grep -rc "concert" src/ --include="*.js" | sort -t: -k2 -nr | head -20 >> "$REPORT_FILE"
echo '```' >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

# 4. Analyse contextuelle
echo "4️⃣ Analyse contextuelle..."
echo "## 4. Analyse Contextuelle" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

# Type d'événement vs Collection
echo "### 4.1 'Concert' comme type d'événement (à CONSERVER)" >> "$REPORT_FILE"
echo '```javascript' >> "$REPORT_FILE"
grep -rn "type.*Concert\|eventType.*Concert\|'Concert'" src/ --include="*.js" | head -10 >> "$REPORT_FILE"
echo '```' >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

echo "### 4.2 'concert' dans les maps/forEach (à MIGRER)" >> "$REPORT_FILE"
echo '```javascript' >> "$REPORT_FILE"
grep -rn "\.map(.*concert\|\.forEach(.*concert" src/ --include="*.js" | head -10 >> "$REPORT_FILE"
echo '```' >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

# 5. Routes et navigation
echo "5️⃣ Analyse des routes..."
echo "## 5. Routes et Navigation" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
echo '```javascript' >> "$REPORT_FILE"
grep -rn "/concerts\|navigate.*concert" src/ --include="*.js" | head -10 >> "$REPORT_FILE"
echo '```' >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

# 6. Spécifiquement DateCreationPage.js
echo "6️⃣ Analyse de DateCreationPage.js..."
echo "## 6. Fichier Critique: DateCreationPage.js" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
if [ -f "src/pages/DateCreationPage.js" ]; then
    echo "### Ligne 571 (collection concerts):" >> "$REPORT_FILE"
    echo '```javascript' >> "$REPORT_FILE"
    sed -n '570,575p' src/pages/DateCreationPage.js >> "$REPORT_FILE"
    echo '```' >> "$REPORT_FILE"
else
    echo "Fichier DateCreationPage.js non trouvé" >> "$REPORT_FILE"
fi
echo "" >> "$REPORT_FILE"

# 7. Fichiers avec concertsAssocies
echo "7️⃣ Analyse des associations..."
echo "## 7. Fichiers utilisant concertsAssocies" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
echo '```' >> "$REPORT_FILE"
grep -rl "concertsAssocies" src/ --include="*.js" | head -20 >> "$REPORT_FILE"
echo '```' >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

# 8. Recommandations
echo "## 8. Plan de Migration Recommandé" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
cat >> "$REPORT_FILE" << EOF
### Phase 1: Vérification et Backup
1. Faire un backup complet de la base de données
2. Créer une branche de migration
3. Exécuter ce script d'audit pour avoir l'état initial

### Phase 2: Migration des Collections Firebase
1. Migrer la collection "concerts" vers "dates" dans DateCreationPage.js
2. Vérifier tous les hooks utilisant cette collection
3. Mettre à jour les services Firebase

### Phase 3: Migration des Propriétés
1. concertsAssocies → datesAssociees
2. concertsIds → datesIds
3. concertId → dateId

### Phase 4: Migration des Variables
1. Dans les maps : concert → date
2. Dans les fonctions : concert → date (sauf si c'est un type)
3. Dans les états : concert → date

### Phase 5: Tests et Validation
1. Tester la création de dates
2. Tester l'affichage des dates
3. Tester les associations avec artistes/lieux/contacts
4. Tester la génération de contrats et factures

### ⚠️ ATTENTION - NE PAS MODIFIER
- Les références à 'Concert' comme type d'événement (ex: type: 'Concert')
- Les valeurs d'énumération contenant 'Concert'
- Les textes affichés à l'utilisateur mentionnant "concert"
EOF

# Nombre de fichiers impactés
IMPACTED_FILES=$(grep -rl "concert" src/ --include="*.js" | wc -l)

# Résumé final
echo "" >> "$REPORT_FILE"
echo "## 9. Résumé des Actions" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
echo "- Total d'occurrences à analyser: $TOTAL_COUNT" >> "$REPORT_FILE"
echo "- Fichiers impactés: $IMPACTED_FILES" >> "$REPORT_FILE"
echo "- Temps estimé: 2-3 jours pour une migration complète et sûre" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

echo "✅ Audit terminé !"
echo "📄 Rapport généré : $REPORT_FILE"
echo ""
echo "📊 Résumé rapide:"
echo "   - Total occurrences: $TOTAL_COUNT"
echo "   - Fichiers impactés: $IMPACTED_FILES"
echo ""
echo "Prochaine étape : cat $REPORT_FILE pour voir le rapport complet"