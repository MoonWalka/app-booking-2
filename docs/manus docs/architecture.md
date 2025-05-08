# Plan d'Action : Amélioration de l'Architecture du Code

## 1. Optimisation de la Structure des Dossiers et des Imports

- **Objectif :** Améliorer la lisibilité, la maintenabilité et réduire la complexité de navigation dans le code.
- **Priorité :** Moyenne

### Actions :

1.  **Réduire la profondeur d'imbrication des composants et hooks** :
    *   Contexte : Certains fichiers sont imbriqués à 4 niveaux ou plus (ex: `src/components/artistes/desktop/ArtisteDetail.js`).
    *   Action : Identifier les composants et hooks concernés. Évaluer la pertinence de remonter certains éléments à un niveau supérieur ou de réorganiser les dossiers pour aplatir la structure là où c'est logique.
    *   Exemple : Pour `src/components/artistes/desktop/ArtisteDetail.js`, envisager si le sous-dossier `desktop` est toujours pertinent ou si une convention de nommage (ex: `ArtisteDetailDesktop.js`) au niveau `src/components/artistes/` serait suffisante.

2.  **Standardiser l'utilisation des alias d'importation pour les chemins absolus** :
    *   Contexte : Prédominance des imports relatifs (`../../composant`), ce qui peut rendre le code difficile à suivre et à refactoriser.
    *   Action : Configurer et utiliser systématiquement les alias Webpack/Babel (ex: `@/components`, `@/hooks`) pour les importations, en remplacement des chemins relatifs longs.
    *   Mettre à jour les imports existants progressivement, en commençant par les nouveaux développements et les refactorisations.
    *   Documenter la convention d'alias dans le guide de contribution du projet.

3.  **Revue de la pertinence de la structure `molecules`, `organisms` (Atomic Design)** :
    *   Contexte : Présence d'un dossier `src/components/molecules/` qui semble peu peuplé (`AddressDisplay.js`, `ContactDisplay.js`).
    *   Action : Évaluer si l'adoption partielle d'Atomic Design est toujours la stratégie souhaitée ou si une simplification vers une structure plus classique (`common`, `ui`, `[feature]`) serait plus adaptée à la taille et à la complexité actuelle du projet.
    *   Si Atomic Design est conservé, s'assurer que les principes sont bien compris et appliqués de manière cohérente.

## 2. Gestion des Dépendances

- **Objectif :** Assurer une gestion saine des dépendances entre modules.
- **Priorité :** Haute

### Actions :

1.  **Surveillance continue des dépendances circulaires** :
    *   Contexte : L'outil Madge n'a pas détecté de dépendances circulaires lors du dernier audit. C'est un bon signe.
    *   Action : Intégrer `madge` (ou un outil similaire) dans le processus de CI/CD ou comme un hook de pre-commit pour détecter automatiquement les dépendances circulaires à l'avenir.
    *   Former les développeurs à l'identification et à la résolution des dépendances circulaires.

## Checklist d'Amélioration de l'Architecture

- [ ] Stratégie pour réduire l'imbrication des fichiers définie et appliquée (si jugé nécessaire).
- [ ] Alias d'importation configurés et leur usage systématisé.
- [ ] Pertinence de la structure Atomic Design (dossier `molecules`) évaluée et décision prise.
- [ ] Outil de détection de dépendances circulaires intégré au workflow de développement.

