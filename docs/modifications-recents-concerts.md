# Modifications Récentes - Gestion des Concerts

Ce document récapitule les récentes évolutions apportées à la gestion des concerts dans l'application.

## 1. Unification du composant d’édition
- Suppression de l’édition inline dans `ConcertDetails`. La vue détail redirige désormais vers la route d’édition dédiée.
- Introduction d’un wrapper `ConcertForm` dans `src/components/concerts/ConcertForm/index.js` qui sélectionne la version desktop ou mobile en fonction du hook `useResponsive`.

## 2. Composant d’édition Desktop
- Remplacement de l’ancien hook déprécié `useConcertFormV2` par le hook recommandé `useConcertFormOptimized` dans `src/components/concerts/desktop/ConcertForm.js`.
- Chargement automatique des données existantes du concert pour pré-remplissage en mode édition.
- Harmonisation des sections de recherche (`LieuSearchSection`, `ProgrammateurSearchSection`, `ArtisteSearchSection`) pour utiliser les états et handlers fournis par le hook optimisé.

## 3. Mise à jour des routes
- Mise à jour de `src/pages/ConcertsPage.js` pour remplacer les imports fixes de la version desktop par le wrapper `ConcertForm`.
- La route `/concerts/:id/edit` et `/concerts/nouveau` utilisent désormais ce wrapper, gérant automatiquement la version mobile ou desktop.

## 4. Simplification des hooks
- Nettoyage de `src/hooks/concerts/index.js` : suppression des aliases redondants (`useConcertFormV2`, `useConcertFormMigrated`, etc.).
- Conservation du seul export optimisé `useConcertFormOptimized` pour la création et l’édition de concerts.
- Vérification et audit de `useConcertFormOptimized` : confirmation qu’il s’interface directement avec `useGenericEntityForm` et qu’il prend en compte `entityId` pour la récupération en édition.

## 5. Ajustements du composant `ConcertDetails`
- Suppression des références aux états de formulaire migrés (`formDataStatus`, `showFormGenerator`, etc.).
- Utilisation de `<Navigate to="edit" replace />` pour rediriger vers la page d’édition.
- Rendu uniquement du mode lecture dans le wrapper responsive.

---

Ces modifications garantissent une architecture plus claire, une logique responsive unifiée et un hook unique pour gérer la création et l’édition des concerts, tout en préparant la future suppression des anciennes versions de hooks.
