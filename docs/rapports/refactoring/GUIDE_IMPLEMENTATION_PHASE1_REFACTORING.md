# 📚 Guide d'Implémentation Phase 1 - Refactoring Anti-Boucles

> ⚠️ **NOTE IMPORTANTE** : Cette architecture a été conçue et documentée mais n'a jamais été déployée en production. Les composants "Refactored" mentionnés n'existent pas dans le code actuel. Ce document est conservé comme référence pour un futur refactoring potentiel.

## 🎯 Vue d'ensemble

Ce guide documente l'implémentation de la Phase 1 du plan de refactoring TourCraft, qui vise à éliminer les boucles infinies dans l'affichage des relations bidirectionnelles.

## 🔧 Composants créés

### 1. RelationCard (`src/components/common/RelationCard.js`)

**Objectif** : Afficher une relation de manière uniforme sans créer de boucles infinies.

```javascript
// Utilisation
<RelationCard
  entity={artiste}
  type="artiste"
  onClick={(id) => navigate(`/artistes/${id}`)}
  showBadge={true}
  className="custom-class"
/>
```

**Props** :
- `entity` : L'objet entité à afficher
- `type` : Type d'entité (artiste, lieu, programmateur, etc.)
- `onClick` : Fonction appelée au clic (optionnelle)
- `showBadge` : Afficher le badge de type (défaut: true)
- `className` : Classes CSS additionnelles

### 2. useSafeRelations (`src/hooks/common/useSafeRelations.js`)

**Objectif** : Charger les relations sans créer de boucles infinies.

```javascript
// Utilisation
const { data, loading, error } = useSafeRelations('concert', concertId, 1, {
  includeRelations: true,
  maxRelationsPerType: 5,
  relationTypes: ['artistes', 'lieu'] // optionnel
});
```

**Paramètres** :
- `entityType` : Type de l'entité principale
- `entityId` : ID de l'entité
- `depth` : Profondeur de chargement (défaut: 1)
- `options` : Options de configuration

**Mécanismes de protection** :
- `Set` pour tracker les entités déjà chargées
- `Map` pour éviter les chargements multiples
- Profondeur limitée pour éviter les récursions

### 3. ConcertDetailsRefactored (`src/components/concerts/ConcertDetailsRefactored.js`)

**Objectif** : Version refactorisée de ConcertDetails utilisant les nouveaux composants.

## ⚠️ Pièges et solutions

### 1. Routes imbriquées

**Problème** : Les routes peuvent être définies à plusieurs endroits.

**Solution** : 
- Les routes principales sont dans `App.js`
- Les sous-routes sont dans les pages (ex: `ConcertsPage.js`)
- Toujours vérifier les deux emplacements

**Exemple** :
```javascript
// Dans ConcertsPage.js
<Route path="/:id/refactored" element={<ConcertDetailsRefactored />} />
```

### 2. Import des composants UI

**Problème** : Certains composants utilisent des exports nommés, d'autres des exports par défaut.

**Solution** :
```javascript
// Export par défaut
import Card from '../ui/Card';
// Export nommé
import { Button } from '../ui/Button';
```

### 3. Props de FormHeader

**Problème** : Le prop `actions` attend des éléments React, pas des objets.

**Solution** :
```javascript
// ❌ Incorrect
actions={[{ label: 'Retour', onClick: handleBack }]}

// ✅ Correct
actions={[
  <button key="back" onClick={handleBack}>Retour</button>
]}
```

## 🚀 Guide de migration pour les autres composants

### Étape 1 : Identifier les boucles

1. Ouvrir les DevTools React
2. Aller sur l'onglet Profiler
3. Observer les re-renders continus
4. Identifier les composants problématiques

### Étape 2 : Implémenter la solution

1. **Remplacer les hooks de chargement** :
```javascript
// Avant
const { data: artiste } = useArtisteDetails(id);
const { data: concerts } = useConcertsByArtiste(artiste?.id);

// Après
const { data: artiste } = useSafeRelations('artiste', id, 1, {
  includeRelations: true,
  relationTypes: ['concerts']
});
```

2. **Remplacer l'affichage des relations** :
```javascript
// Avant
{artiste.concerts.map(concert => (
  <div onClick={() => navigate(`/concerts/${concert.id}`)}>
    {concert.titre}
  </div>
))}

// Après
{artiste.concerts.map(concert => (
  <RelationCard
    key={concert.id}
    entity={concert}
    type="concert"
  />
))}
```

### Étape 3 : Tester

1. Créer une route test : `/:id/refactored`
2. Implémenter le composant refactorisé
3. Utiliser `RefactoringTestButton` pour basculer
4. Vérifier l'absence de boucles

## 📊 Checklist de migration

Pour chaque composant de détails :

- [ ] Identifier les relations chargées
- [ ] Remplacer par `useSafeRelations`
- [ ] Remplacer l'affichage par `RelationCard`
- [ ] Ajouter la route `/refactored`
- [ ] Tester avec le bouton de bascule
- [ ] Vérifier les performances
- [ ] Supprimer l'ancienne version

## 🔍 Debug et dépannage

### Logs utiles

```javascript
// Dans le composant
useEffect(() => {
  console.log('🎵 Composant monté avec ID:', id);
}, [id]);

// Dans useSafeRelations
console.log('🔄 Chargement de:', entityType, entityId);
console.log('📦 Résultat:', data);
```

### Erreurs communes

1. **Page blanche** : Vérifier les imports et les routes
2. **"Objects are not valid as React child"** : Vérifier les props passés
3. **Boucles infinies** : Vérifier la profondeur et les dépendances

## 🎯 Prochaines étapes

1. **Phase 2** : Créer `GenericDetailView`
2. **Phase 3** : Migrer tous les composants
3. **Phase 4** : Supprimer le code legacy

### Relations inverses

Pour les cas où la relation est stockée dans l'autre sens (ex: concert → lieu au lieu de lieu → concerts), utilisez `reverseField` :

```javascript
// Dans relationConfigs
lieu: {
  concerts: { 
    collection: 'concerts', 
    field: 'concertsIds', // peut ne pas exister
    isArray: true, 
    reverseField: 'lieuId' // cherche les concerts où lieuId == lieu.id
  }
}
```

Le hook `useSafeRelations` détectera automatiquement l'absence du champ direct et effectuera une requête inverse.

## 📝 Notes importantes

- **Ne pas modifier** l'ancienne version pendant la migration
- **Toujours tester** avec des données réelles
- **Documenter** les spécificités de chaque entité
- **Communiquer** avec l'équipe sur les changements

## 🤝 Support

En cas de problème :
1. Consulter ce guide
2. Vérifier les logs de la console
3. Utiliser les outils de debug React
4. Demander de l'aide sur le canal d'équipe