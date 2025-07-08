# Plan de Migration Finale - 8 Juillet 2025

## Vue d'ensemble

Suite à la vérification exhaustive du 8 juillet 2025, voici l'état réel des migrations et le plan pour les finaliser.

## 1. Migration Organisation → Entreprise

### État actuel : ~80% complété

#### ✅ Complété :
- Contexte principal (OrganizationContext → EntrepriseContext)
- Hooks (useOrganization → useEntreprise)
- Composants UI migrés
- 240 fichiers avec organizationId → entrepriseId
- Onboarding complètement migré
- 18 fichiers debug obsolètes supprimés

#### ❌ Restant : 52 fichiers (192 occurrences)
- **Principalement** : tests, outils de diagnostic, services
- **Fichiers critiques** :
  - `factureService.js` (10 occurrences)
  - `ParametresPage.js` (10 occurrences)
- **Collections Firebase** : Conservées pour compatibilité

### Plan d'action :
1. **Priorité BASSE** - La plupart sont des fichiers non critiques
2. Migrer `factureService.js` et `ParametresPage.js` en priorité
3. Les collections Firebase peuvent rester jusqu'à une migration des données

## 2. Migration Concert → Date

### État actuel : ~30% complété

#### ✅ Complété :
- 6 fichiers de production majeurs (159 occurrences)
- 9 fichiers test/debug supprimés
- Scripts de migration créés

#### ❌ Restant : 104 fichiers (555 occurrences)
- **Fichiers critiques** :
  1. `contractVariables.js` (16 occ.) - Variables de template
  2. `ContratInfoCard.js` (18 occ.)
  3. `ContratDetailsPage.js` (16 occ.)
  4. `ContratGeneratorNew.js` (16 occ.)
  5. `BrevoTemplateCreator.js` (15 occ.)

### Plan d'action :

#### Phase 1 : Variables de template (URGENT)
```bash
# Migrer contractVariables.js
sed -i '' 's/concert_titre/date_titre/g' src/hooks/contrats/contractVariables.js
sed -i '' 's/concert_date/date_date/g' src/hooks/contrats/contractVariables.js
sed -i '' 's/concert_montant/date_montant/g' src/hooks/contrats/contractVariables.js
sed -i '' 's/concert_heure/date_heure/g' src/hooks/contrats/contractVariables.js
```

#### Phase 2 : Composants de contrat (10 fichiers prioritaires)
```bash
# Script pour les 10 fichiers avec le plus d'occurrences
for file in \
  "src/components/contrats/sections/ContratInfoCard.js" \
  "src/pages/ContratDetailsPage.js" \
  "src/components/contrats/desktop/ContratGeneratorNew.js" \
  "src/components/pdf/ContratPDFWrapper.js" \
  "src/components/structures/desktop/StructureForm.js" \
  "src/components/lieux/desktop/sections/LieuxListSearchFilter.js" \
  "src/components/structures/desktop/StructureView.js" \
  "src/components/debug/DateLieuDebug.js" \
  "src/components/debug/BrevoTemplateCreator.js" \
  "src/hooks/artistes/useArtisteDetails.js"
do
  echo "Migration de $file..."
  # Props et paramètres
  sed -i '' 's/({ concert,/({ date,/g' "$file"
  sed -i '' 's/, concert,/, date,/g' "$file"
  sed -i '' 's/, concert }/, date }/g' "$file"
  
  # États
  sed -i '' 's/\[concert, setDate\]/[date, setDate]/g' "$file"
  
  # Accès aux propriétés
  sed -i '' 's/concert\./date./g' "$file"
  sed -i '' 's/concert\?/date?/g' "$file"
done
```

#### Phase 3 : Reste des fichiers
Utiliser le script de migration existant pour les 94 fichiers restants.

## 3. Recommandations d'exécution

### Ordre de priorité :
1. **Concert → Date** : Plus urgent car impacte les contrats
   - Commencer par `contractVariables.js`
   - Puis les 10 fichiers principaux
   - Tester après chaque batch
   
2. **Organisation → Entreprise** : Peut attendre
   - Migrer seulement `factureService.js` et `ParametresPage.js`
   - Le reste sont majoritairement des tests/debug

### Validation :
- Après chaque phase, exécuter les tests
- Vérifier la génération de contrats
- Tester l'envoi d'emails
- Valider les PDF générés

### Temps estimé :
- **Concert → Date** : 1-2 jours
- **Organisation → Entreprise** (fichiers critiques) : 2-3 heures
- **Total** : 2-3 jours pour finaliser complètement

## 4. Scripts de vérification

```bash
# Vérifier progression Concert → Date
echo "=== CONCERT → DATE ==="
rg -c "concert" --type js | wc -l
echo "fichiers restants"
rg -c "concert" --type js | awk -F: '{sum+=$2} END {print sum}'
echo "occurrences totales"

# Vérifier progression Organisation → Entreprise
echo "=== ORGANIZATION → ENTREPRISE ==="
rg -c "organization" --type js | wc -l
echo "fichiers restants"
rg -c "organization" --type js | awk -F: '{sum+=$2} END {print sum}'
echo "occurrences totales"
```

## 5. Notes importantes

1. **Ne pas annoncer** une migration complète avant vérification exhaustive
2. **Toujours tester** après chaque batch de modifications
3. **Conserver** la rétrocompatibilité pour les variables de template
4. **Documenter** tous les changements effectués

Ce plan permettra de finaliser les deux migrations de manière méthodique et sûre.