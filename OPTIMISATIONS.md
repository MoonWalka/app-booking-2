# Optimisations de Performance pour la page Concerts

Ce document décrit les optimisations appliquées pour améliorer les performances de la page Concerts de l'application TourCraft.

## Problèmes identifiés

1. **Chargement inefficace des données** : L'application chargait tous les concerts, formulaires et contrats en une seule requête, ce qui ralentissait considérablement le chargement initial.
2. **Absence de pagination** : Sans pagination, l'application chargeait toutes les données dès le départ.
3. **Utilisation inefficace du cache** : Le système de cache n'était pas optimisé.
4. **Logs excessifs** : Des logs verbeux ralentissaient l'exécution en mode développement.
5. **Fonction `fetchEntitiesBatch` non optimisée** : Malgré son nom, cette fonction n'utilisait pas réellement un chargement par lots efficace.

## Solutions implémentées

### 1. Optimisation de `fetchEntitiesBatch`

- Implémenté un vrai chargement par lots avec Firestore en utilisant correctement `where('__name__', 'in', batchIds)`
- Ajouté des logs de performance pour mesurer les temps de chargement
- Amélioré la gestion des erreurs

### 2. Système de cache amélioré

- Intégré avec le service de cache existant pour éviter les requêtes redondantes
- Ajouté un mécanisme d'expiration de cache

### 3. Service de logging centralisé

- Créé un service `loggerService.js` pour centraliser et standardiser les logs
- Désactivation automatique des logs verbeux en production
- Support pour les métriques de performance

### 4. Moniteurs de performance

- Conservé deux moniteurs de performance avec des objectifs différents :
  - `PerformanceMonitor` (common) : Léger, pour l'usage quotidien
  - `PerformanceMonitorEnhanced` (debug) : Détaillé, pour les investigations approfondies
- Ajouté un affichage des requêtes lentes (>300ms)

### 5. Optimisation du code

- Optimisation du chargement conditionnel des formulaires et contrats
- Réduction des logs verbeux
- Amélioration de la gestion des erreurs

## Comment utiliser les moniteurs de performance

### Moniteur simple (coin inférieur droit)

- Affiche les temps de chargement principaux
- Indique le nombre de requêtes complétées
- Cliquez sur "+" pour voir les requêtes lentes

### Moniteur avancé (bouton bleu)

- Cliquez sur le bouton pour ouvrir le panneau
- Onglet "Cache" : Statistiques d'utilisation du cache
- Onglet "Requêtes récentes" : 20 dernières requêtes
- Onglet "Requêtes lentes" : Requêtes dépassant 300ms

## Recommandations futures

1. Implémenter une stratégie de préchargement intelligent pour les concerts à venir
2. Ajouter un système de "infinite scroll" au lieu du bouton "Charger plus"
3. Utiliser React Query ou SWR pour une meilleure gestion du cache et des requêtes
4. Implémenter la compression des données côté serveur
