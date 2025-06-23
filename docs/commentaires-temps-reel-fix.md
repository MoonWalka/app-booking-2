# Mise à jour en temps réel des commentaires

## Problème identifié

Les commentaires ne se mettaient pas à jour en temps réel contrairement aux tags. Un utilisateur devait rafraîchir la page pour voir les nouveaux commentaires ajoutés par d'autres utilisateurs.

## Cause du problème

Dans `useContactActionsRelational.js`, les fonctions `handleAddComment` et `handleDeleteComment` utilisaient :
- `structuresService.getStructure()` pour les structures
- `personnesService.getPersonne()` pour les personnes

Ces appels faisaient des requêtes directes à Firebase au lieu d'utiliser les données réactives du cache maintenu par les listeners Firebase.

## Solution implémentée

### 1. Utilisation des données réactives du cache

Les fonctions ont été modifiées pour utiliser :
- `getStructureWithPersonnes(contactId)` pour les structures
- `getPersonneWithStructures(contactId)` pour les personnes

Ces fonctions retournent les données du cache qui sont automatiquement mises à jour par les listeners Firebase.

### 2. Changements dans handleAddComment

```javascript
// Avant
const structureData = await structuresService.getStructure(contactId);
existingComments = structureData.data?.commentaires || [];

// Après
const structure = getStructureWithPersonnes(contactId);
existingComments = structure?.commentaires || [];
```

### 3. Changements dans handleDeleteComment

Même principe appliqué, avec ajout de logs de debug pour tracer le flux de suppression.

### 4. Suppression des imports inutiles

`structuresService` n'est plus nécessaire dans ce hook car nous utilisons maintenant les méthodes du hook `useContactsRelational`.

## Résultat

Les commentaires fonctionnent maintenant exactement comme les tags :
- Ajout/suppression en temps réel sur tous les clients connectés
- Pas besoin de rafraîchir la page
- Les listeners Firebase propagent automatiquement les changements

## Architecture technique

Le flux de données suit maintenant ce chemin :

1. **Ajout/Suppression** : L'utilisateur effectue une action
2. **Mise à jour locale** : Les données du cache sont utilisées pour calculer la nouvelle liste
3. **Sauvegarde Firebase** : `updateStructure` ou `updatePersonne` sauvegarde dans Firestore
4. **Listeners Firebase** : Les listeners détectent le changement (dans `useContactsRelational`)
5. **Mise à jour du cache** : Le state local est mis à jour avec les nouvelles données
6. **Re-render automatique** : React re-render les composants avec les nouvelles données

## Tests recommandés

1. Ouvrir deux fenêtres/onglets sur la même fiche contact
2. Ajouter un commentaire dans la première fenêtre
3. Vérifier que le commentaire apparaît immédiatement dans la deuxième fenêtre
4. Supprimer un commentaire et vérifier la mise à jour en temps réel