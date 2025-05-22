# Optimisations non documentées ou non implémentées

Ce fichier recense tous les points d'optimisation identifiés lors de l'audit qui n'ont pas encore été documentés ou implémentés dans le projet.

---

## 1. Projection Firestore (sélection de champs)
- [ ] Identifier les champs strictement nécessaires pour l'affichage des concerts
- [ ] Adapter les requêtes Firestore pour ne charger que ces champs (projection)
- [ ] Vérifier l'impact sur la performance
- [ ] Documenter la solution et l'usage dans les hooks

---

## 2. Skeleton loader (squelette visuel de chargement)
- [ ] Choisir une librairie ou créer un composant skeleton maison
- [ ] Intégrer le skeleton loader dans la page concerts (et autres listes si besoin)
- [ ] Remplacer le spinner par le skeleton pendant le chargement
- [ ] Documenter l'usage et l'intégration

---

## 3. Bundle JS/CSS et optimisation des imports
- [ ] Analyser la taille du bundle avec un outil (ex: source-map-explorer)
- [ ] Identifier les imports lourds ou inutiles
- [ ] Mettre en place du code splitting/lazy loading si besoin
- [ ] Documenter les bonnes pratiques d'import

---

## 4. Utilisation de React Query/SWR (cache avancé)
- [ ] Évaluer la pertinence d'intégrer React Query ou SWR
- [ ] Prototyper l'intégration sur une page (ex: concerts)
- [ ] Comparer avec le cache maison actuel
- [ ] Documenter la décision et l'intégration éventuelle

---

## 5. Lazy loading des données secondaires (formulaires/contrats)
- [ ] Charger les données secondaires (formulaires, contrats) après le rendu principal
- [ ] Mettre à jour l'UI dès que les données secondaires sont prêtes
- [ ] Documenter la logique de lazy loading

---

## 6. Optimisation du mapping côté client
- [ ] Analyser le coût du mapping/enrichissement côté client
- [ ] Optimiser si besoin (mémoïsation, pagination plus stricte, etc.)
- [ ] Documenter les choix et les optimisations

---

## 7. Imports CSS/JS lourds
- [ ] Lister tous les imports globaux (CSS, JS, icônes)
- [ ] Identifier ceux qui peuvent être lazy loadés ou supprimés
- [ ] Documenter les recommandations d'import 