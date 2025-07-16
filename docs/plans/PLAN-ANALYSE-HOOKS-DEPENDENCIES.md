# Plan d'Analyse des Warnings de Dépendances des Hooks

## 📋 Liste des warnings à analyser

### 1. ArtistesList.js (8 warnings)
- `setSearchTerm` fait changer les dépendances de useCallback (lignes 105, 118, 169)
- `filters` object fait changer les dépendances de useMemo (ligne 174)
- `setFilter` fait changer les dépendances de useCallback (ligne 130)
- `resetFilters` fait changer les dépendances de useCallback (ligne 169)
- `setSortBy` fait changer les dépendances de useCallback (ligne 142)
- `setSortDirection` fait changer les dépendances de useCallback (ligne 155)

### 2. DatesList.js (2 warnings)
- useEffect manque la dépendance 'loadData' (lignes 76, 91)

### 3. ContactViewTabs.js (3 warnings)
- useEffect manque la dépendance 'contact' (ligne 171)
- useMemo manque la dépendance 'contact' (ligne 493)
- useMemo manque la dépendance 'extractedData' (ligne 610)

### 4. ContratGeneratorNew.js (3 warnings)
- useEffect manque 'contratData.negociation' (lignes 457, 477)
- useEffect manque 'contratData.echeances' (ligne 520)

### 5. AssociatePersonModal.js (1 warning)
- useEffect manque 'existingPersonIds' (ligne 124)

### 6. useContactActionsRelational.js (1 warning)
- useCallback a des dépendances inutiles: 'currentUser', 'getPersonneWithStructures' (ligne 195)

### 7. useContactsRelational.js (1 warning)
- useEffect manque 'loading' (ligne 158)

### 8. useSimpleContactDetails.js (4 warnings)
- useCallback manque 'id' (lignes 104, 178, 269)
- useCallback a une dépendance inutile 'currentOrganization.id' (ligne 317)

### 9. ConcertContactsDebug.js (1 warning)
- useEffect manque 'currentOrg' (ligne 85)

## 🔍 Plan d'analyse détaillé

### Phase 1 : Catégorisation des risques

#### Risque ÉLEVÉ (peut causer des boucles infinies)
1. **Ajout de dépendances d'état qui changent dans le hook**
   - `loading` dans useEffect qui modifie `loading`
   - `filters` object qui est recréé à chaque render

#### Risque MOYEN (peut causer des re-renders excessifs)
1. **Ajout de dépendances d'objets complexes**
   - `contact` object complet
   - `contratData.negociation`, `contratData.echeances`
   - `extractedData` object

#### Risque FAIBLE (optimisation mineure)
1. **Suppression de dépendances inutiles**
   - `currentUser`, `getPersonneWithStructures` dans useCallback
   - `currentOrganization.id` si stable

### Phase 2 : Analyse par fichier

#### 1. ArtistesList.js
- **Problème** : Les fonctions setState ne sont pas wrappées dans useCallback
- **Solution** : Wrapper les handlers dans useCallback ou utiliser l'updater function pattern
- **Risque** : FAIBLE - amélioration de performance seulement

#### 2. DatesList.js
- **Problème** : `loadData` est une fonction qui peut changer
- **Solution** : Vérifier si `loadData` est stable ou la wrapper dans useCallback
- **Risque** : MOYEN - dépend de l'implémentation de loadData

#### 3. ContactViewTabs.js
- **Problème** : Dépendances d'objets complexes manquantes
- **Solution** : Utiliser des propriétés spécifiques au lieu d'objets complets
- **Risque** : ÉLEVÉ - risque de données obsolètes

#### 4. ContratGeneratorNew.js
- **Problème** : Propriétés imbriquées manquantes
- **Solution** : Destructurer les propriétés nécessaires
- **Risque** : MOYEN - dépend de la fréquence de changement

#### 5. AssociatePersonModal.js
- **Problème** : Array `existingPersonIds` manquant
- **Solution** : Ajouter la dépendance ou utiliser une ref
- **Risque** : MOYEN - peut manquer des mises à jour

#### 6. useContactActionsRelational.js
- **Problème** : Dépendances inutiles
- **Solution** : Simplement les retirer
- **Risque** : FAIBLE - amélioration mineure

#### 7. useContactsRelational.js
- **Problème** : `loading` dans useEffect qui pourrait le modifier
- **Solution** : Vérifier la logique pour éviter la boucle
- **Risque** : ÉLEVÉ - risque de boucle infinie

#### 8. useSimpleContactDetails.js
- **Problème** : `id` manquant dans plusieurs callbacks
- **Solution** : Ajouter `id` aux dépendances
- **Risque** : FAIBLE - callbacks stables si id ne change pas

#### 9. ConcertContactsDebug.js
- **Problème** : `currentOrg` manquant
- **Solution** : Ajouter la dépendance
- **Risque** : FAIBLE - outil de debug

## 📊 Plan de correction proposé

### Étape 1 : Corrections sans risque (FAIBLE)
1. Retirer les dépendances inutiles dans useContactActionsRelational
2. Ajouter `id` dans useSimpleContactDetails (si id est stable)
3. Ajouter `currentOrg` dans ConcertContactsDebug (outil de debug)

### Étape 2 : Corrections avec analyse approfondie (MOYEN)
1. DatesList : Analyser `loadData` et sa stabilité
2. AssociatePersonModal : Vérifier l'usage de `existingPersonIds`
3. ContratGeneratorNew : Analyser la structure de `contratData`

### Étape 3 : Corrections nécessitant refactoring (ÉLEVÉ)
1. ContactViewTabs : Refactorer pour utiliser des propriétés spécifiques
2. useContactsRelational : Revoir la logique pour éviter la boucle
3. ArtistesList : Refactorer les handlers avec useCallback

## ⚠️ Points d'attention critiques

1. **Ne jamais ajouter un état comme dépendance s'il est modifié dans le même hook**
2. **Préférer les propriétés spécifiques aux objets complets**
3. **Utiliser des refs pour les valeurs qui ne doivent pas déclencher de re-render**
4. **Considérer le coût/bénéfice de chaque correction**

## 🎯 Recommandations finales

### Corrections recommandées (sans risque)
- useContactActionsRelational : Retirer dépendances inutiles
- ConcertContactsDebug : Ajouter currentOrg (debug only)

### Corrections à éviter (risque élevé)
- useContactsRelational : Ne pas ajouter 'loading'
- ContactViewTabs : Ne pas ajouter 'contact' entier

### Corrections nécessitant investigation
- DatesList : Vérifier loadData avant modification
- ContratGeneratorNew : Analyser l'usage de contratData