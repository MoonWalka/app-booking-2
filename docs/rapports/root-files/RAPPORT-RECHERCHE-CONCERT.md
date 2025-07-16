# Rapport de Recherche Approfondie : Références "concert" dans le Codebase

## Résumé Exécutif

### Statistiques Globales
- **132 fichiers** contiennent le mot "concert" (insensible à la casse)
- **903 occurrences totales** du mot "concert" dans les fichiers source
- **0 fichiers** avec "concert" ou "Concert" dans leur nom de fichier

### Patterns les Plus Fréquents
1. `concert` (575 occurrences) - Variable/propriété simple
2. `concerts` (225 occurrences) - Pluriel, souvent pour des listes
3. `concertsIds` (84 occurrences) - IDs de concerts dans les relations
4. `concertsAssocies` (48 occurrences) - Concerts associés à une entité
5. `concertRef` (28 occurrences) - Référence Firebase

## Analyse Détaillée

### 1. Collections Firebase
Les références à la collection 'concerts' apparaissent dans :
- **Fichiers de debug** : Nombreuses références pour la migration et les tests
- **Hooks de relations** : `useSafeRelations.js` gère les relations bidirectionnelles
- **Services de suppression** : Les hooks de suppression vérifient les références
- **Page de création** : `DateCreationPage.js` crée toujours dans la collection "concerts"

### 2. Fichiers Principaux Impactés

#### Components (30 premiers fichiers)
- Artistes : Views et sections de recherche
- Contacts : Tables, vues, formulaires d'échange
- Contrats : Générateurs, éditeurs, actions
- Common : Sélecteurs relationnels, cartes de relation
- Debug : Nombreux outils de debug et migration

### 3. Types de Références

#### Variables et Propriétés
- `concert` : Objet concert individuel
- `concerts` : Liste/tableau de concerts
- `concertsIds` : Tableau d'IDs pour les relations
- `concertsAssocies` : Concerts liés à une entité
- `concertRef` : Référence Firestore

#### Navigation et Routes
- `/concerts` : Route encore présente dans plusieurs fichiers
- Redirections temporaires déjà en place dans `App.js`

### 4. Fichiers Critiques à Migrer

1. **DateCreationPage.js** : Crée encore dans la collection "concerts"
2. **useSafeRelations.js** : Gère les relations avec la collection concerts
3. **Hooks de suppression** : Vérifient les références dans concerts
4. **Navigation** : Routes /concerts dans plusieurs composants
5. **Debug tools** : Nombreuses références pour les migrations

## Recommandations

### Phase 1 : Migration Base de Données
1. Créer un script de migration pour copier `concerts` → `dates`
2. Maintenir les deux collections en parallèle temporairement
3. Migrer les références dans les autres collections

### Phase 2 : Migration Code
1. Remplacer progressivement les références dans le code
2. Commencer par les services et hooks critiques
3. Puis migrer les composants par module

### Phase 3 : Nettoyage
1. Supprimer les anciennes références
2. Retirer les redirections temporaires
3. Nettoyer les fichiers de debug

## Points d'Attention

1. **Pas de fichiers nommés *Concert*** : La migration des noms de fichiers semble déjà faite
2. **Relations bidirectionnelles** : Attention aux relations dans `useSafeRelations.js`
3. **Routes** : Plusieurs fichiers utilisent encore `/concerts`
4. **Collection Firebase** : La collection "concerts" est encore activement utilisée

## Prochaines Étapes

1. Établir un plan de migration détaillé
2. Créer des scripts de migration pour la base de données
3. Identifier les composants critiques à tester
4. Planifier la migration progressive avec tests