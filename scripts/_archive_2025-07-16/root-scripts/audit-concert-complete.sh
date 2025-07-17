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
CONCERT_COUNT=$(rg -c "\bconcert\b" --type js src/ | awk -F: '{sum+=$2} END {print sum}')
echo "- Occurrences de 'concert' (minuscule): $CONCERT_COUNT" >> "$REPORT_FILE"

# Occurrences de "Concert" (majuscule)
CONCERT_UPPER_COUNT=$(rg -c "\bConcert\b" --type js src/ | awk -F: '{sum+=$2} END {print sum}')
echo "- Occurrences de 'Concert' (majuscule): $CONCERT_UPPER_COUNT" >> "$REPORT_FILE"

# Occurrences de "concerts" (pluriel)
CONCERTS_COUNT=$(rg -c "\bconcerts\b" --type js src/ | awk -F: '{sum+=$2} END {print sum}')
echo "- Occurrences de 'concerts' (pluriel): $CONCERTS_COUNT" >> "$REPORT_FILE"

echo "" >> "$REPORT_FILE"

# 2. Analyser par type d'usage
echo "2️⃣ Analyse par type d'usage..."
echo "## 2. Types d'Usage" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

# Collections Firebase
echo "### 2.1 Collections Firebase" >> "$REPORT_FILE"
rg "collection.*concerts" --type js src/ -n >> "$REPORT_FILE" 2>/dev/null || echo "Aucune collection 'concerts' trouvée" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

# Variables et propriétés
echo "### 2.2 Variables et Propriétés" >> "$REPORT_FILE"
echo "#### Variables 'concert'" >> "$REPORT_FILE"
rg "let concert|const concert|var concert" --type js src/ -n | head -20 >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

echo "#### Propriétés 'concertsAssocies'" >> "$REPORT_FILE"
rg "concertsAssocies" --type js src/ -n | head -20 >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

echo "#### Propriétés 'concertsIds'" >> "$REPORT_FILE"
rg "concertsIds" --type js src/ -n | head -20 >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

# 3. Fichiers les plus impactés
echo "3️⃣ Identification des fichiers critiques..."
echo "## 3. Fichiers les Plus Impactés" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

echo "### Top 20 des fichiers avec le plus d'occurrences:" >> "$REPORT_FILE"
rg -c "concert" --type js src/ | sort -t: -k2 -nr | head -20 >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

# 4. Analyse contextuelle
echo "4️⃣ Analyse contextuelle..."
echo "## 4. Analyse Contextuelle" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

# Type d'événement vs Collection
echo "### 4.1 'Concert' comme type d'événement (à CONSERVER)" >> "$REPORT_FILE"
rg "type.*Concert|eventType.*Concert|'Concert'" --type js src/ -n | head -10 >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

echo "### 4.2 'concert' dans les maps/forEach (à MIGRER)" >> "$REPORT_FILE"
rg "\.map\((concert|\.forEach\((concert" --type js src/ -n | head -10 >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

# 5. Routes et navigation
echo "5️⃣ Analyse des routes..."
echo "## 5. Routes et Navigation" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

rg "/concerts|navigate.*concert" --type js src/ -n >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

# 6. Fonctions et méthodes
echo "6️⃣ Analyse des fonctions..."
echo "## 6. Fonctions et Méthodes" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

echo "### Fonctions avec 'concert' dans le nom:" >> "$REPORT_FILE"
rg "function.*concert|const.*concert.*=" --type js src/ -n | head -20 >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

# 7. Imports et exports
echo "7️⃣ Analyse des imports/exports..."
echo "## 7. Imports et Exports" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

rg "import.*concert|export.*concert" --type js src/ -n >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

# 8. Recommandations
echo "## 8. Recommandations de Migration" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
cat >> "$REPORT_FILE" << EOF
### Priorité 1 - Collections Firebase
- Migrer toutes les références à la collection "concerts" vers "dates"
- Vérifier les hooks et services utilisant ces collections

### Priorité 2 - Variables dans les boucles
- Remplacer les variables 'concert' par 'date' dans les maps et forEach
- Attention aux propriétés d'objet correspondantes

### Priorité 3 - Propriétés d'objets
- concertsAssocies → datesAssociees
- concertsIds → datesIds
- concertId → dateId

### Priorité 4 - Noms de fonctions
- Renommer les fonctions contenant 'concert'
- Mettre à jour tous les appels correspondants

### ⚠️ NE PAS MODIFIER
- Les références à 'Concert' comme type d'événement
- Les énumérations contenant 'Concert'
- Les textes utilisateur mentionnant "concert"
EOF

# Résumé final
echo "" >> "$REPORT_FILE"
echo "## 9. Résumé des Actions" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
echo "- Total d'occurrences à analyser: $((CONCERT_COUNT + CONCERTS_COUNT))" >> "$REPORT_FILE"
echo "- Fichiers impactés: $(rg -l "concert" --type js src/ | wc -l)" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

echo "✅ Audit terminé !"
echo "📄 Rapport généré : $REPORT_FILE"
echo ""
echo "Prochaine étape : Analyser le rapport et créer un plan de migration détaillé"