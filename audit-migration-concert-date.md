# Audit Migration Concert → Date

## Résumé Exécutif

La migration de "concert" vers "date" **N'EST PAS TERMINÉE**. Il reste **903 occurrences** du mot "concert" dans **132 fichiers**.

## Points Critiques à Corriger

### 1. Collection Firebase "concerts" encore active
- `DateCreationPage.js` crée toujours dans la collection "concerts" (ligne 571)
- `useSafeRelations.js` gère les relations bidirectionnelles avec "concerts"
- Les hooks de suppression vérifient encore les références dans "concerts"

### 2. Fichiers les plus impactés (Top 10)
1. `useContratGenerator.js` - 49 occurrences
2. `EntityCreationTester.js` - 45 occurrences  
3. `ContratRedactionPage.js` - 39 occurrences
4. `EntityRelationsDebugger.js` - 38 occurrences
5. `useSimpleContactDetails.js` - 32 occurrences
6. `ContratGeneratorNew.js` - 31 occurrences
7. `GenericDetailView.js` - 30 occurrences
8. `FactureGeneratorPage.js` - 27 occurrences
9. `useDeleteArtiste.js` - 25 occurrences
10. `ContratTemplateEditorSimple.js` - 24 occurrences

### 3. Types de références trouvées
- **Variables**: `concert` (575 fois)
- **Collections**: `concerts` (225 fois)  
- **Relations**: `concertsIds` (84 fois)
- **Associations**: `concertsAssocies` (48 fois)
- **Routes**: `/concerts` (8 fois)

### 4. Zones du code affectées

#### A. Pages principales
- `DateCreationPage.js` - Crée toujours dans "concerts"
- `DateDetailsPage.js` - Références multiples
- `ContratGenerationPage.js` - Variables et commentaires
- `FactureGeneratorPage.js` - Logique métier

#### B. Hooks critiques
- `useSafeRelations.js` - Relations bidirectionnelles
- `useContratGenerator.js` - Génération de contrats
- `useDeleteArtiste.js` - Vérification des dépendances
- `useSimpleContactDetails.js` - Gestion des contacts

#### C. Services
- `emailService.js` - Templates d'emails
- `brevoTemplateService.js` - Service d'envoi

#### D. Composants
- `GenericDetailView.js` - Affichage générique
- `ContactSelectorRelational.js` - Sélection de contacts
- Tables et listes diverses

### 5. Actions Requises

#### Phase 1: Corrections critiques
1. **DateCreationPage.js**: Changer la collection de "concerts" à "dates"
2. **useSafeRelations.js**: Mettre à jour toutes les relations
3. **Hooks de suppression**: Adapter les vérifications

#### Phase 2: Refactoring des variables
1. Renommer `concert` → `date` dans les variables
2. Renommer `concerts` → `dates` dans les tableaux
3. Renommer `concertsIds` → `datesIds`
4. Renommer `concertsAssocies` → `datesAssociees`

#### Phase 3: Migration Firebase
1. Créer un script de migration des données
2. Migrer la collection "concerts" vers "dates"
3. Mettre à jour les routes et permissions

#### Phase 4: Nettoyage
1. Supprimer les références obsolètes
2. Mettre à jour la documentation
3. Tester toutes les fonctionnalités

## Recommandations

1. **NE PAS** considérer cette migration comme terminée
2. **PLANIFIER** une migration complète et structurée
3. **TESTER** chaque modification en environnement de développement
4. **SAUVEGARDER** avant toute migration de données

## Scripts utiles

```bash
# Compter les occurrences
rg -c "concert" --type js | awk -F: '{sum+=$2} END {print sum}'

# Trouver les collections Firebase
rg "collection.*concerts" --type js

# Identifier les variables
rg "\bconcert\b" --type js -C 2
```

## Clarification Importante

**"Concert" vs "concert"** : Il faut distinguer :
- **Collection "concerts"** → à migrer vers "dates" ✓
- **Type "Concert"** → à conserver comme type d'événement valide (avec Résidence, Répétition, etc.)

## Checklist de Migration

### ✅ Phase 0: Analyse et préparation
- [x] Audit complet des occurrences
- [x] Distinction concert (collection) vs Concert (type)
- [ ] Backup de la base de données

### ✅ Phase 1: Corrections critiques (Collection concerts → dates) - TERMINÉE
- [x] `DateCreationPage.js` - Ligne 571 : collection "concerts" → "dates" ✓
- [x] `useSafeRelations.js` - Toutes les références à la collection ✓
- [x] `useDeleteArtiste.js` - Vérification des dépendances ✓
- [x] `useLieuDelete.js` - Vérification des dépendances ✓
- [x] `useContratDetails.js` - Collection de référence ✓

### 🟡 Phase 2: Variables et propriétés
- [ ] Variables `concert` → `date` (quand il s'agit d'une date)
- [ ] Arrays `concerts` → `dates`
- [ ] Relations `concertsIds` → `datesIds`
- [ ] Associations `concertsAssocies` → `datesAssociees`
- [ ] Paramètres de fonctions
- [ ] Commentaires et documentation

### 🟠 Phase 3: Composants et hooks
- [ ] `useContratGenerator.js` - 49 occurrences
- [ ] `ContratRedactionPage.js` - 39 occurrences
- [ ] `useSimpleContactDetails.js` - 32 occurrences
- [ ] `GenericDetailView.js` - 30 occurrences
- [ ] `FactureGeneratorPage.js` - 27 occurrences
- [ ] Services email (`emailService.js`, `brevoTemplateService.js`)

### 🟢 Phase 4: Firebase et routes
- [ ] Script de migration des données Firebase
- [ ] Routes `/concerts` → `/dates`
- [ ] Permissions et règles de sécurité
- [ ] Redirections pour compatibilité

### 🔵 Phase 5: Tests et validation
- [ ] Tests unitaires
- [ ] Tests d'intégration
- [ ] Tests manuels des workflows
- [ ] Validation des emails
- [ ] Validation des PDF générés

### ⚫ Phase 6: Nettoyage
- [ ] Fichiers de debug et test
- [ ] Scripts de migration temporaires
- [ ] Documentation obsolète
- [ ] Suppression de l'ancienne collection

## Conclusion

La migration nécessite encore un travail conséquent. Les références à "concert" sont profondément ancrées dans le code, notamment dans la logique métier et les relations entre entités. Il est crucial de distinguer entre la migration de la collection (concerts → dates) et la conservation du type "Concert" comme type d'événement valide.