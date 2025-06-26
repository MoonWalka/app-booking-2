# Plan d'Audit - Tags et Commentaires

## 🎯 Objectif
Identifier avec certitude pourquoi les tags et commentaires ne s'affichent pas après modification et valider les solutions proposées.

## 📋 Étapes d'audit

### 1. AUDIT DU FLUX DE DONNÉES (Écriture)
**Objectif** : Vérifier que les données sont bien écrites dans Firebase

#### 1.1 Validation côté client
- [ ] Vérifier que `handleTagsChange` reçoit bien les nouveaux tags
- [ ] Vérifier que `updateStructure`/`updatePersonne` est appelé avec les bons paramètres
- [ ] Vérifier la validation des schémas (tags et commentaires sont-ils dans les schémas ?)
- [ ] Vérifier que les données ne sont pas filtrées/nettoyées avant envoi

#### 1.2 Écriture Firebase
- [ ] Vérifier que `updateDoc` est bien exécuté
- [ ] Vérifier le retour de `updateStructure` (success: true ?)
- [ ] Vérifier dans la console Firebase que les données sont bien écrites
- [ ] Vérifier les règles de sécurité Firebase (permissions d'écriture)

### 2. AUDIT DU FLUX DE DONNÉES (Lecture)
**Objectif** : Vérifier que les données sont bien récupérées depuis Firebase

#### 2.1 Listeners Firebase
- [ ] Vérifier que les listeners sont bien configurés (bonne collection, bon filtre)
- [ ] Vérifier que les listeners se déclenchent après modification
- [ ] Vérifier le contenu des snapshots Firebase
- [ ] Vérifier le timing des listeners (délai ?)

#### 2.2 État local (Cache)
- [ ] Vérifier que `setStructures`/`setPersonnes` est appelé avec les bonnes données
- [ ] Vérifier le contenu des états `structures` et `personnes`
- [ ] Vérifier que `getStructureWithPersonnes` retourne les bonnes données
- [ ] Identifier le délai entre mise à jour Firebase et mise à jour du cache

#### 2.3 Transformation des données
- [ ] Vérifier `useUnifiedContact` - comment transforme-t-il les données ?
- [ ] Vérifier où sont placés tags/commentaires dans la structure finale
- [ ] Vérifier `extractedData` dans `ContactViewTabs`
- [ ] Vérifier les chemins d'accès (qualification.tags vs tags)

### 3. AUDIT DE L'AFFICHAGE
**Objectif** : Vérifier que les données sont bien affichées

#### 3.1 Props des composants
- [ ] Vérifier les props passées à `ContactTagsSection`
- [ ] Vérifier les props passées à `ContactCommentsSection`
- [ ] Vérifier les props passées aux modals

#### 3.2 Re-renders
- [ ] Vérifier que les composants se re-render après mise à jour
- [ ] Vérifier les dépendances des useMemo/useCallback
- [ ] Vérifier qu'il n'y a pas de mémoisation excessive

### 4. AUDIT DES CAS SPÉCIFIQUES

#### 4.1 Types d'entités
- [ ] Tester sur une structure
- [ ] Tester sur une personne
- [ ] Tester sur une personne libre
- [ ] Vérifier la cohérence entre les types

#### 4.2 Cas d'usage
- [ ] Ajouter un premier tag (liste vide → 1 tag)
- [ ] Ajouter plusieurs tags
- [ ] Supprimer un tag
- [ ] Supprimer tous les tags
- [ ] Même tests pour les commentaires

### 5. POINTS DE VÉRIFICATION CRITIQUES

#### 5.1 Synchronisation
- [ ] Y a-t-il une course condition entre le cache et Firebase ?
- [ ] Le composant lit-il depuis le cache avant qu'il soit mis à jour ?
- [ ] Les listeners sont-ils attachés avant ou après le chargement initial ?

#### 5.2 Structure de données
- [ ] Les tags sont-ils toujours au même endroit dans toutes les étapes ?
- [ ] Les commentaires sont-ils toujours au même endroit ?
- [ ] Y a-t-il des transformations qui perdent des données ?

#### 5.3 Erreurs silencieuses
- [ ] Vérifier tous les try/catch - y a-t-il des erreurs avalées ?
- [ ] Vérifier la console pour des erreurs
- [ ] Vérifier les validations - bloquent-elles silencieusement ?

## 🔍 Méthodes d'audit

### A. Logs stratégiques
Placer des console.log à ces endroits clés :
1. `handleTagsChange` - début et fin
2. `updateStructure` - avant et après updateDoc
3. Listener Firebase - quand déclenché
4. `setStructures` - nouvelles données
5. `getStructureWithPersonnes` - données retournées
6. `extractedData` - contenu final

### B. Breakpoints debugger
Placer des breakpoints pour examiner :
1. Le contenu exact des données à chaque étape
2. Le timing des opérations
3. L'ordre d'exécution

### C. Tests temporels
1. Ajouter des timestamps à chaque étape
2. Mesurer le délai entre écriture et lecture
3. Identifier où se trouve le goulot d'étranglement

## 📊 Validation des solutions

### Solution 1 : Forcer un reload
**À vérifier** :
- [ ] Est-ce que `reload()` de `useUnifiedContact` recharge bien depuis Firebase ?
- [ ] Est-ce que ça contourne le cache ?
- [ ] Quel est l'impact sur les performances ?
- [ ] Y a-t-il un risque de boucle infinie ?

### Solution 2 : Mise à jour optimiste du cache
**À vérifier** :
- [ ] Peut-on mettre à jour `structures` state directement ?
- [ ] Comment éviter les incohérences avec Firebase ?
- [ ] Que se passe-t-il si l'écriture Firebase échoue ?
- [ ] Comment gérer les conflits ?

### Solution 3 : Lecture directe depuis Firebase
**À vérifier** :
- [ ] Impact sur les performances (requêtes multiples)
- [ ] Cohérence avec le reste de l'application
- [ ] Gestion des états de chargement
- [ ] Coût des lectures Firebase

## 🎬 Plan d'action

1. **Phase 1** : Exécuter l'audit du flux d'écriture
2. **Phase 2** : Exécuter l'audit du flux de lecture
3. **Phase 3** : Identifier précisément où se situe le problème
4. **Phase 4** : Choisir la solution la plus adaptée
5. **Phase 5** : Implémenter et tester la solution

## 🚨 Risques à surveiller

1. **Boucles infinies** : Mise à jour → Listener → Mise à jour
2. **Désynchronisation** : Cache local vs Firebase
3. **Performance** : Trop de requêtes ou re-renders
4. **Cohérence** : Données différentes selon la source