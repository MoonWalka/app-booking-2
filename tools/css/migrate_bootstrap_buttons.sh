#!/bin/bash

# Script d'aide pour migrer les boutons Bootstrap vers composants standardisés
# Analyse et propose des remplacements

echo "🔍 AUDIT MIGRATION BOOTSTRAP → COMPOSANTS"
echo "=========================================="

# Créer dossier de logs
mkdir -p tools/logs

# 1. Identifier tous les fichiers avec usages Bootstrap
echo "📋 Identification des fichiers à migrer..."
grep -r "className.*btn btn-" src/ --include="*.js" --include="*.jsx" -l > tools/logs/files_bootstrap_buttons.txt
echo "✅ $(wc -l < tools/logs/files_bootstrap_buttons.txt) fichiers identifiés"

# 2. Analyse des patterns les plus fréquents
echo ""
echo "📊 PATTERNS BOOTSTRAP LES PLUS FRÉQUENTS:"
grep -r "className.*btn btn-" src/ | sed 's/.*className="[^"]*btn \(btn-[^"]*\)".*/\1/' | sort | uniq -c | sort -nr | head -10

# 3. Générer fichier de mapping des remplacements
echo ""
echo "📝 Génération du guide de migration..."
cat > tools/logs/bootstrap_migration_guide.md << 'EOF'
# Guide Migration Bootstrap → Composants

## Mappings Recommandés

### Boutons Primaires
```jsx
// ❌ AVANT
<button className="btn btn-primary">Action</button>

// ✅ APRÈS  
<Button variant="primary">Action</Button>
```

### Boutons Secondaires
```jsx
// ❌ AVANT
<button className="btn btn-secondary">Action</button>

// ✅ APRÈS
<Button variant="secondary">Action</Button>
```

### Boutons Outline
```jsx
// ❌ AVANT  
<button className="btn btn-outline-primary">Action</button>

// ✅ APRÈS
<Button variant="outline-primary">Action</Button>
```

### Boutons Petits
```jsx
// ❌ AVANT
<button className="btn btn-sm btn-primary">Action</button>

// ✅ APRÈS
<Button size="sm" variant="primary">Action</Button>
```

### Boutons Danger
```jsx
// ❌ AVANT
<button className="btn btn-danger">Supprimer</button>

// ✅ APRÈS  
<Button variant="danger">Supprimer</Button>
```

## Import Nécessaire

Ajouter en haut de chaque fichier migré :
```jsx
import Button from '@ui/Button';
```

## Fichiers Prioritaires (Plus d'usages)

EOF

# 4. Lister les fichiers avec le plus d'usages Bootstrap
echo "🎯 FICHIERS PRIORITAIRES (plus d'usages):" >> tools/logs/bootstrap_migration_guide.md
grep -r "className.*btn btn-" src/ --include="*.js" --include="*.jsx" -c | sort -t: -k2 -nr | head -10 >> tools/logs/bootstrap_migration_guide.md

# 5. Créer checklist pour chaque fichier
echo ""
echo "📋 Génération des checklists par fichier..."
echo "## Checklist Migration par Fichier" >> tools/logs/bootstrap_migration_guide.md
echo "" >> tools/logs/bootstrap_migration_guide.md

while read -r file; do
    echo "### $(basename "$file")" >> tools/logs/bootstrap_migration_guide.md
    echo "**Chemin:** \`$file\`" >> tools/logs/bootstrap_migration_guide.md
    echo "" >> tools/logs/bootstrap_migration_guide.md
    echo "**Usages Bootstrap détectés:**" >> tools/logs/bootstrap_migration_guide.md
    grep "className.*btn btn-" "$file" | sed 's/^/- /' >> tools/logs/bootstrap_migration_guide.md
    echo "" >> tools/logs/bootstrap_migration_guide.md
    echo "- [ ] Import Button ajouté" >> tools/logs/bootstrap_migration_guide.md
    echo "- [ ] Usages Bootstrap remplacés" >> tools/logs/bootstrap_migration_guide.md
    echo "- [ ] Test de rendu OK" >> tools/logs/bootstrap_migration_guide.md
    echo "" >> tools/logs/bootstrap_migration_guide.md
done < tools/logs/files_bootstrap_buttons.txt

echo "✅ Guide de migration créé: tools/logs/bootstrap_migration_guide.md"

# 6. Vérifier existence du composant Button
echo ""
echo "🔍 Vérification du composant Button standardisé..."
if [ -f "src/components/ui/Button/Button.js" ]; then
    echo "✅ Composant Button trouvé: src/components/ui/Button/Button.js"
    echo "📋 Props supportées:"
    grep -A 5 "Button.propTypes\|propTypes\s*=" src/components/ui/Button/Button.js || grep -A 10 "function Button\|const Button" src/components/ui/Button/Button.js | head -10
else
    echo "❌ Composant Button non trouvé à l'emplacement attendu"
    echo "🔍 Recherche dans ui/..."
    find src/components/ui -name "*Button*" -type f
fi

# 7. Exemple de migration d'un fichier
echo ""
echo "💡 EXEMPLE DE MIGRATION (premier fichier):"
first_file=$(head -1 tools/logs/files_bootstrap_buttons.txt)
echo "Fichier: $first_file"
echo ""
echo "AVANT (usages Bootstrap):"
grep -n "className.*btn btn-" "$first_file" | head -3
echo ""
echo "Consultez tools/logs/bootstrap_migration_guide.md pour les remplacements suggérés"

echo ""
echo "🎯 PROCHAINES ÉTAPES:"
echo "1. Consulter: tools/logs/bootstrap_migration_guide.md"
echo "2. Commencer par les fichiers avec le plus d'usages"  
echo "3. Migrer manuellement (remplacement automatique = risqué)"
echo "4. Tester après chaque fichier"
echo "5. Lancer npm start pour vérifier le rendu"

echo ""
echo "📊 IMPACT ESTIMÉ:"
echo "Migration complète = +10 points (85% → 95%)" 