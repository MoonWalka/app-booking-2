# Plan de tests pour useGenericEntityList

*Document créé le: 5 mai 2025*

Ce document détaille le plan de tests pour valider le fonctionnement du hook générique `useGenericEntityList` et des hooks migrés qui l'utilisent.

## 1. Tests unitaires

### 1.1 Tests de base du hook générique

| Test | Description | Critères de succès |
|------|-------------|-------------------|
| Initialisation | Vérifier l'initialisation correcte du hook avec différentes configurations | Hook initialisé sans erreur avec `items`, `loading`, et autres propriétés définies |
| Chargement des données | Vérifier le chargement des données depuis Firestore | `loading` passe à `true` puis à `false`, `items` contient les données attendues |
| Gestion d'erreur | Vérifier le comportement en cas d'erreur de Firestore | `error` contient l'erreur, `loading` passe à `false` |
| Nettoyage | Vérifier que les listeners sont correctement nettoyés | Fonction de désabonnement appelée lors du démontage |

### 1.2 Tests des fonctionnalités de filtrage

| Test | Description | Critères de succès |
|------|-------------|-------------------|
| Filtres d'égalité | Vérifier les filtres de type 'equals' | Requêtes Firestore contiennent les opérateurs '==' |
| Filtres d'appartenance à un tableau | Vérifier les filtres de type 'array-contains' | Requêtes contiennent les opérateurs 'array-contains' |
| Filtres multi-valeurs | Vérifier les filtres de type 'in' | Requêtes contiennent les opérateurs 'in' |
| Filtres de plage | Vérifier les filtres de type 'range' | Requêtes contiennent les opérateurs '>=' et '<=' |
| Filtres de date | Vérifier les filtres de type 'date-range' | Dates correctement formatées et utilisées dans les requêtes |
| Filtres booléens | Vérifier les filtres de type 'boolean' | Requêtes contiennent les opérateurs '==' avec valeurs booléennes |
| Filtres personnalisés | Vérifier les filtres de type 'custom' | Fonction `customFiltering` appelée avec les bons paramètres |

### 1.3 Tests des fonctionnalités de recherche

| Test | Description | Critères de succès |
|------|-------------|-------------------|
| Recherche simple | Vérifier la recherche sur un seul champ | Items correctement filtrés selon le terme de recherche |
| Recherche multi-champ | Vérifier la recherche sur plusieurs champs | Items filtrés si au moins un champ correspond |
| Recherche avec tokenisation | Vérifier la recherche avec tokenisation des termes | Items filtrés selon chaque token individuel |
| Recherche non sensible à la casse | Vérifier la recherche indépendante de la casse | 'Test' et 'test' donnent les mêmes résultats |

### 1.4 Tests des fonctionnalités de tri

| Test | Description | Critères de succès |
|------|-------------|-------------------|
| Tri ascendant | Vérifier le tri ascendant | Items correctement triés dans l'ordre croissant |
| Tri descendant | Vérifier le tri descendant | Items correctement triés dans l'ordre décroissant |
| Tri de différents types | Vérifier le tri de nombres, chaînes, dates | Chaque type correctement trié |
| Tri de valeurs nulles | Vérifier le tri avec des valeurs nulles/undefined | Valeurs nulles placées au début/fin selon direction |
| Tri personnalisé | Vérifier le tri avec customSorting | Fonction customSorting appelée avec les bons paramètres |

### 1.5 Tests des fonctionnalités de pagination

| Test | Description | Critères de succès |
|------|-------------|-------------------|
| Pagination côté client | Vérifier la pagination en mode 'client' | Page correcte affichée, totalPages correct |
| Pagination côté serveur | Vérifier la pagination en mode 'server' | Requêtes Firestore avec limit et startAfter |
| Navigation entre pages | Vérifier nextPage, prevPage, setPage | Page correctement mise à jour, items correspondants |
| Changement de taille | Vérifier setPageSize | Taille de page mise à jour, pagination recalculée |

## 2. Tests d'intégration

### 2.1 Tests avec les hooks migrés

| Hook | Scénario de test | Résultat attendu |
|------|-----------------|------------------|
| useLieuxFilters | Recherche de lieux par nom | Lieux correspondants affichés |
| useLieuxFilters | Filtrage par type de lieu | Seuls les lieux du type choisi affichés |
| useLieuxFilters | Pagination des résultats | Navigation fonctionnelle entre les pages |
| useLieuxFilters | Combinaison recherche + filtre | Résultats respectant les deux contraintes |
| useConcertFilters | Recherche de concerts par titre | Concerts correspondants affichés |
| useConcertFilters | Filtrage par date | Concerts dans la plage de dates affichés |
| useConcertFilters | Chargement en temps réel | Mise à jour automatique lors de changements |

### 2.2 Tests avec les composants d'interface

| Composant | Scénario de test | Résultat attendu |
|-----------|-----------------|------------------|
| LieuxList | Recherche de lieux | Interface réactive, résultats mis à jour |
| LieuxList | Filtrage par type de lieu | Interface réactive, résultats mis à jour |
| LieuxList | Changement de page | Interface réactive, résultats mis à jour |
| ConcertsList | Recherche de concerts | Interface réactive, résultats mis à jour |
| ConcertsList | Filtrage par statut | Interface réactive, résultats mis à jour |

## 3. Tests de performance

| Test | Description | Critères de succès |
|------|-------------|-------------------|
| Grande collection - client | Test avec 1000+ éléments en mode client | Temps de réponse < 500ms pour filtrage/tri |
| Grande collection - serveur | Test avec 1000+ éléments en mode serveur | Temps de chargement initial < 2s |
| Filtrages multiples | Appliquer plusieurs filtres en séquence | Temps de réponse reste stable |
| Changement rapide | Changer rapidement entre les pages | Pas de fuites mémoire, UI réactif |

## 4. Tests de robustesse

| Test | Description | Critères de succès |
|------|-------------|-------------------|
| Données manquantes | Test avec données incomplètes | Pas d'erreurs, valeurs par défaut appliquées |
| Valeurs nulles | Test avec valeurs null/undefined | Gestion gracieuse, pas d'erreurs |
| Pertes de connexion | Simuler perte de connexion | Erreur appropriée, récupération lors de reconnexion |
| Requêtes parallèles | Déclencher plusieurs changements en parallèle | Dernière requête prend le dessus, pas d'incohérences |

## 5. Plan d'exécution des tests

1. **Phase préliminaire** (complété):
   - ✅ Test initial de `useLieuxFilters` avec le composant existant
   - ✅ Vérification de la résolution des bugs identifiés

2. **Phase de tests approfondis**:
   - Tests unitaires du hook générique
   - Tests d'intégration avec plusieurs hooks migrés
   - Tests de performance sur différentes collections
   - Tests de robustesse avec scénarios d'erreur

3. **Phase de validation**:
   - Validation complète sur un environnement de test
   - Tests utilisateur pour confirmer l'expérience
   - Revue de code finale

## 6. Métriques de succès

Pour considérer la migration comme réussie, nous devons atteindre les métriques suivantes:

1. **Fonctionnalité** : 100% des tests unitaires et d'intégration réussis
2. **Performance** : Temps de réponse équivalents ou meilleurs que les hooks spécifiques
3. **Fiabilité** : Zéro erreur lors des tests de robustesse
4. **Maintenabilité** : Réduction d'au moins 30% du code dupliqué entre les hooks de liste

## Annexe: Exemples de code de test

### Exemple de test unitaire pour le filtrage

```javascript
// Test du filtrage par égalité
test('should filter items with equals operator', async () => {
  // Setup
  const { result } = renderHook(() => useGenericEntityList({
    collectionName: 'lieux',
    filterConfig: {
      type: {
        type: 'equals',
        firestoreOperator: '=='
      }
    }
  }));
  
  // Action
  act(() => {
    result.current.setFilter('type', 'salle');
  });
  
  // Wait for async operation
  await waitFor(() => expect(result.current.loading).toBe(false));
  
  // Assert
  expect(result.current.items.every(item => item.type === 'salle')).toBe(true);
});
```

### Exemple de test d'intégration

```javascript
// Test d'intégration avec LieuxList
test('LieuxList should display filtered results', async () => {
  // Setup
  render(<LieuxList />);
  
  // Action
  const searchInput = screen.getByPlaceholderText('Rechercher un lieu...');
  fireEvent.change(searchInput, { target: { value: 'Paris' } });
  
  // Wait for the results
  await waitFor(() => {
    const items = screen.getAllByTestId('lieu-item');
    expect(items.length).toBeGreaterThan(0);
  });
  
  // Assert
  const items = screen.getAllByTestId('lieu-item');
  const containsParis = Array.from(items).some(item => 
    item.textContent.includes('Paris')
  );
  expect(containsParis).toBe(true);
});
```

---

*Ce plan sera mis à jour au fur et à mesure que de nouveaux tests seront identifiés ou que des résultats significatifs seront obtenus.*