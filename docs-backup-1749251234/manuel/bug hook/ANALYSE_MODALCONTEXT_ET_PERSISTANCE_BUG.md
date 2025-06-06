# Analyse du ModalContext et persistance du bug

## 1. Contexte

Le composant `ModalContext` gère l'ouverture, la fermeture et la gestion des modales dans l'application. Il utilise un composant optimisé `OptimizedModal` pour limiter les rerendus inutiles. Malgré la migration vers des hooks génériques et l'optimisation du système de modales, certains bugs persistent, notamment lors de l'affichage de composants utilisant des hooks complexes comme `useGenericEntityDetails` à l'intérieur des modales.

## 2. Fonctionnement du ModalContext

- Stocke toutes les modales actives dans un état local (`modals`).
- Permet d'ouvrir une modale en passant un composant React, ses props, des props spécifiques à la modale, et un callback `onClose`.
- Gère la fermeture individuelle ou globale des modales.
- Permet la mise à jour dynamique des props d'une modale.
- Rendu effectif via `OptimizedModal` qui encapsule le composant cible.

## 3. Problème identifié

Même après migration et optimisation, des bugs de cycle de vie persistent lorsque des composants utilisant `useGenericEntityDetails` (ou ses wrappers) sont affichés dans une modale. Cela peut entraîner :
- Des cycles de montage/démontage rapides
- Des requêtes Firebase dupliquées ou interrompues
- Des états incohérents ou des chargements infinis

## 4. Hypothèses

- Les composants affichés dans les modales héritent des problèmes du hook `useGenericEntityDetails`.
- Les cycles de vie des modales (création/destruction dynamique) amplifient les effets de bord des hooks complexes.
- Les optimisations du ModalContext ne suffisent pas à elles seules si le hook sous-jacent reste instable.

## 5. Pistes de test et solutions à explorer

- Vérifier si le problème se manifeste uniquement dans les modales ou aussi dans les pages classiques.
- Tester l'utilisation de `React.memo` ou d'une clé stable sur les composants rendus dans la modale.
- Isoler un composant simple dans une modale pour vérifier si le bug dépend du hook utilisé.
- Ajouter des logs de cycle de vie dans les composants affichés en modale.
- Tester la désactivation du cache ou du mode temps réel dans `useGenericEntityDetails` pour voir l'impact.
- Compléter la checklist de tests sur les cycles de vie et la gestion des requêtes Firebase.

## 6. Prochaines étapes

- Mettre en place des tests ciblés sur les modales affichant des entités via les hooks génériques.
- Documenter les résultats et ajuster la stratégie de correction en fonction des observations.
