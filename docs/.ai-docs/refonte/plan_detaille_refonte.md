# Plan d'Action Détaillé pour la Refonte TourCraft - Version Map

## Checklist de Refonte Visuelle

Ce document présente un plan d'action détaillé avec une checklist pour transformer l'interface actuelle de TourCraft afin qu'elle ressemble parfaitement à la version map de référence, tout en minimisant les changements structurels.
basé sur l'audit de refonte ./refonte_TC_V2.md
capture du rendu final: /Users/meltinrecordz/Desktop/design webUI

## Phase 1 : Préparation et Configuration (Jour 1)

### 1.1 Mise en place de l'environnement
- [ ] Créer une branche Git dédiée à la refonte visuelle (`git checkout -b refonte-map`)
- [ ] Configurer un environnement de développement isolé pour tester les changements
- [ ] Créer une page de démonstration pour visualiser les modifications en temps réel
- [ ] Prendre des captures d'écran "avant" pour documenter la progression

### 1.2 Audit des ressources existantes
- [ ] Inventorier tous les fichiers CSS à modifier (variables, composants, modules)
- [ ] Identifier les composants React qui nécessiteront des ajustements
- [ ] Documenter la structure actuelle des variables CSS et des thèmes
- [ ] Vérifier les dépendances externes (bibliothèques d'icônes, polices, etc.)

## Phase 2 : Fondations Visuelles (Jour 2)

### 2.1 Palette de couleurs
- [ ] Extraire la palette de couleurs exacte de la référence map
- [ ] Mettre à jour les variables de couleurs dans `/src/styles/base/variables.css`:
  - [ ] Couleurs primaires (`--tc-primary-color`, `--tc-primary-dark`, etc.)
  - [ ] Couleurs secondaires (`--tc-secondary-color`, etc.)
  - [ ] Couleurs d'état (`--tc-success-color`, `--tc-danger-color`, etc.)
  - [ ] Couleurs de fond (`--tc-background-color`, `--tc-card-bg`, etc.)
  - [ ] Couleurs de texte (`--tc-text-color`, `--tc-text-secondary`, etc.)
- [ ] Vérifier l'application des couleurs sur la page de démonstration

### 2.2 Typographie
- [ ] Identifier les polices utilisées dans la référence map
- [ ] Mettre à jour les variables de typographie dans `/src/styles/base/typography.css`:
  - [ ] Famille de polices (`--tc-font-family-base`, `--tc-font-family-headings`)
  - [ ] Tailles de police (`--tc-font-size-base`, `--tc-font-size-lg`, etc.)
  - [ ] Poids de police (`--tc-font-weight-normal`, `--tc-font-weight-bold`, etc.)
  - [ ] Hauteurs de ligne (`--tc-line-height-base`, `--tc-line-height-headings`)
- [ ] Vérifier le rendu typographique sur différents éléments

### 2.3 Espacements et bordures
- [ ] Mesurer les espacements utilisés dans la référence map
- [ ] Mettre à jour les variables d'espacement dans `/src/styles/base/variables.css`:
  - [ ] Espacements (`--tc-spacing-xs`, `--tc-spacing-sm`, `--tc-spacing-md`, etc.)
  - [ ] Marges (`--tc-margin-base`, etc.)
  - [ ] Paddings (`--tc-padding-base`, etc.)
- [ ] Mettre à jour les variables de bordure:
  - [ ] Épaisseurs (`--tc-border-width`, `--tc-border-width-lg`, etc.)
  - [ ] Rayons (`--tc-border-radius`, `--tc-border-radius-sm`, `--tc-border-radius-lg`)
  - [ ] Couleurs (`--tc-border-color`, `--tc-border-color-light`, etc.)
- [ ] Vérifier l'application des espacements sur la page de démonstration

## Phase 3 : Sidebar et Navigation (Jour 3)

### 3.1 Refonte de la sidebar
- [ ] Mettre à jour `/src/components/layout/Sidebar.module.css`:
  - [ ] Couleur de fond (`--tc-sidebar-bg-color`)
  - [ ] Couleur de texte (`--tc-sidebar-text-color`)
  - [ ] Largeur et hauteur (`--tc-sidebar-width`)
  - [ ] Ombres et bordures
- [ ] Ajuster les styles des éléments internes:
  - [ ] En-tête de la sidebar (`.sidebarHeader`)
  - [ ] Contenu principal (`.sidebarContent`)
  - [ ] Pied de page (`.sidebarFooter`)
- [ ] Vérifier la cohérence sur toutes les pages

### 3.2 Liens de navigation
- [ ] Mettre à jour les styles des liens dans la sidebar:
  - [ ] État normal (`.navLinks a`)
  - [ ] État survolé (`.navLinks a:hover`)
  - [ ] État actif (`.navLinks a.active`)
- [ ] Ajuster l'alignement et l'espacement des icônes
- [ ] Standardiser les effets de transition et d'animation
- [ ] Tester la navigation entre les différentes pages

### 3.3 Responsive design de la sidebar
- [ ] Ajuster le comportement responsive de la sidebar
- [ ] Vérifier les points de rupture (`@media queries`)
- [ ] Tester sur différentes tailles d'écran (mobile, tablette, desktop)
- [ ] S'assurer que le menu hamburger fonctionne correctement

## Phase 4 : Dashboard et Cartes (Jour 4-5)

### 4.1 Cartes statistiques du dashboard
- [ ] Mettre à jour les styles des cartes statistiques:
  - [ ] Couleurs de fond et bordures
  - [ ] Espacements internes (padding)
  - [ ] Ombres et effets visuels
- [ ] Ajuster la typographie des chiffres et labels
- [ ] Standardiser les icônes utilisées
- [ ] Vérifier l'alignement et la disposition des éléments

### 4.2 Tableaux de données
- [ ] Mettre à jour `/src/styles/components/tables.css`:
  - [ ] En-têtes de colonnes
  - [ ] Lignes de données (normales et alternées)
  - [ ] Bordures et séparateurs
  - [ ] Espacements et alignements
- [ ] Ajuster les styles des cellules spéciales (statut, actions, etc.)
- [ ] Standardiser les icônes d'action dans les tableaux
- [ ] Tester avec différentes quantités de données

### 4.3 Sections d'activité récente
- [ ] Mettre à jour les styles des listes d'activité:
  - [ ] Items individuels
  - [ ] Icônes et indicateurs
  - [ ] Horodatage et métadonnées
- [ ] Ajuster les espacements et alignements
- [ ] Vérifier la cohérence avec le reste de l'interface

## Phase 5 : Composants Interactifs (Jour 6-7)

### 5.1 Boutons
- [ ] Mettre à jour `/src/components/ui/Button.module.css`:
  - [ ] Classe de base (`.btn`)
  - [ ] Variantes principales (`.btnPrimary`, `.btnSecondary`, etc.)
  - [ ] Variantes outline (`.btnOutlinePrimary`, etc.)
  - [ ] Tailles (`.btnSm`, `.btnLg`)
- [ ] Ajuster les rayons de bordure, padding et effets de survol
- [ ] Standardiser l'intégration des icônes dans les boutons
- [ ] Vérifier l'accessibilité (contraste, focus visible)

### 5.2 Formulaires
- [ ] Mettre à jour les styles des champs de formulaire:
  - [ ] Inputs texte
  - [ ] Selects et dropdowns
  - [ ] Checkboxes et radios
  - [ ] Textareas
- [ ] Ajuster les styles des labels et des messages d'aide
- [ ] Standardiser les états de validation (erreur, succès)
- [ ] Vérifier l'accessibilité des formulaires

### 5.3 Filtres et recherche
- [ ] Mettre à jour les composants de recherche:
  - [ ] Champ de recherche
  - [ ] Boutons de filtre
  - [ ] Dropdowns de tri
- [ ] Ajuster les styles des badges et tags de filtre
- [ ] Standardiser les icônes utilisées
- [ ] Tester les fonctionnalités de recherche et filtrage

## Phase 6 : Pages Spécifiques (Jour 8-9)

### 6.1 Page Concerts
- [ ] Mettre à jour les styles spécifiques à la page Concerts:
  - [ ] En-tête et filtres
  - [ ] Liste des concerts
  - [ ] Indicateurs de statut
  - [ ] Actions disponibles
- [ ] Vérifier la cohérence avec la référence map
- [ ] Tester toutes les interactions

### 6.2 Page Artistes
- [ ] Mettre à jour les styles spécifiques à la page Artistes:
  - [ ] Cartes d'artiste
  - [ ] Informations affichées
  - [ ] Actions disponibles
- [ ] Vérifier la cohérence avec la référence map
- [ ] Tester toutes les interactions

### 6.3 Page Paramètres
- [ ] Mettre à jour les styles spécifiques à la page Paramètres:
  - [ ] Navigation par onglets
  - [ ] Formulaires de configuration
  - [ ] Sections et groupes de champs
- [ ] Vérifier la cohérence avec la référence map
- [ ] Tester toutes les interactions

## Phase 7 : Raffinements et Tests (Jour 10)

### 7.1 Animations et transitions
- [ ] Mettre à jour les variables de transition dans `/src/styles/base/variables.css`
- [ ] Standardiser les animations sur l'ensemble du site:
  - [ ] Transitions de page
  - [ ] Effets de survol
  - [ ] Apparition/disparition d'éléments
- [ ] Vérifier la fluidité et la cohérence des animations

### 7.2 Icônes
- [ ] Standardiser la bibliothèque d'icônes utilisée
- [ ] Remplacer les icônes non conformes
- [ ] Ajuster les tailles et couleurs des icônes
- [ ] Vérifier la cohérence sur l'ensemble du site

### 7.3 Tests complets
- [ ] Tester sur différents navigateurs (Chrome, Firefox, Safari, Edge)
- [ ] Vérifier la responsivité sur différentes tailles d'écran
- [ ] Tester les performances (temps de chargement, fluidité)
- [ ] Vérifier l'accessibilité (contraste, navigation clavier)

## Phase 8 : Finalisation et Déploiement (Jour 11)

### 8.1 Documentation
- [ ] Mettre à jour la documentation du design system
- [ ] Documenter les nouveaux composants et variables
- [ ] Créer un guide de style visuel à jour
- [ ] Préparer des captures d'écran "après" pour documenter les changements

### 8.2 Revue de code
- [ ] Effectuer une revue complète des modifications CSS
- [ ] Nettoyer les styles inutilisés ou redondants
- [ ] Optimiser les performances (minification, regroupement)
- [ ] Vérifier la qualité du code (linting, formatage)

### 8.3 Déploiement
- [ ] Fusionner la branche de refonte avec la branche principale
- [ ] Déployer sur un environnement de staging pour validation finale
- [ ] Effectuer les derniers ajustements si nécessaire
- [ ] Déployer en production

## Ressources et Références

### Outils recommandés
- ColorZilla ou similaire pour extraire les couleurs exactes
- PerfectPixel ou similaire pour la comparaison visuelle
- Chrome DevTools pour l'inspection et le débogage
- Lighthouse pour les tests de performance et d'accessibilité

### Documentation
- Guide de style CSS TourCraft
- Documentation des composants React
- Captures d'écran de référence de la version map

---

## Suivi de Progression

| Phase | Progression | Date de début | Date de fin | Notes |
|-------|------------|--------------|------------|-------|
| 1. Préparation | 0% | | | |
| 2. Fondations | 0% | | | |
| 3. Sidebar | 0% | | | |
| 4. Dashboard | 0% | | | |
| 5. Composants | 0% | | | |
| 6. Pages | 0% | | | |
| 7. Raffinements | 0% | | | |
| 8. Finalisation | 0% | | | |

**Progression globale: 0%**
