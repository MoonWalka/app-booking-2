# Plan d'Action : Nettoyage du Code et des Fichiers

## 1. Suppression du Code Obsolète et Redondant

- **Objectif :** Éliminer le code qui n'est plus utilisé ou qui a été remplacé par des solutions plus récentes et standardisées.
- **Priorité :** Haute

### Actions :

1.  **Vérification des composants `.jsx` mentionnés comme non utilisés** :
    *   Fichiers mentionnés dans l'audit précédent :
        *   `src/components/artistes/ArtisteDetail.jsx`
        *   `src/components/artistes/ArtisteForm.jsx`
    *   Vérification : Ces fichiers n'existent pas dans le projet actuel. Aucune action de suppression n'est nécessaire.

2.  **Vérification des fichiers CSS potentiellement non utilisés** :
    *   Fichiers à analyser :
        *   `src/styles/components/concerts.css` - Vérifier l'utilisation réelle de ce fichier
    *   Remarque importante : `src/styles/components/concerts-mobile.css` contient du code CSS fonctionnel pour l'affichage mobile des concerts et ne doit PAS être supprimé.
    *   Vérification : Avant toute suppression, effectuer une recherche d'importations dans le projet :
        ```bash
        # Exemple de commande pour vérifier l'utilisation d'un fichier CSS
        grep -r "import.*concerts\.css" src/ --include="*.js" --include="*.jsx"
        ```

3.  **Confirmer la suppression des hooks obsolètes** :
    *   Les hooks suivants ont été identifiés comme n'existant plus, confirmant leur migration ou suppression antérieure. Aucune action de suppression n'est nécessaire, mais il est bon de le noter.
        *   `useIsMobile.js`
        *   `useLocationIQ.js`
        *   `useTheme.js`
        *   `src/hooks/artistes/useArtisteDetails.js` (redirige vers la version migrée)

4.  **Revue des composants dupliqués ou similaires** :
    *   Action : Analyser les ensembles de fichiers suivants pour déterminer si une fusion ou une refactorisation est possible pour éviter la duplication de logique.
        * `src/components/common/ActionButton.js` et `src/components/ui/ActionButton.js` - Ces deux fichiers portent le même nom mais sont dans des dossiers différents, ce qui constitue une duplication critique à résoudre.
        * `src/components/common/ActionButton.js` et `src/components/ui/Button.js` - Déterminer si une fusion ou une refactorisation est possible.
        * `src/components/common/Spinner.js` et `src/components/ui/LoadingSpinner.js` - Déterminer si une fusion est possible.
    *   Si fusion possible, définir un plan de refactorisation et de migration des usages.

5.  **Revue des composants longs ou complexes** :
    *   Action : Examiner `src/hooks/common/useGenericEntityDetails.js` (et autres fichiers identifiés comme volumineux dans `largest_files.txt`).
    *   Identifier les opportunités de découpage en plus petits hooks ou fonctions utilitaires pour améliorer la lisibilité et la maintenabilité.

## 2. Nettoyage des Fichiers Inutiles (Général)

- **Objectif :** S'assurer qu'aucun fichier résiduel (backups, tests obsolètes, assets non référencés) ne pollue le dépôt.
- **Priorité :** Moyenne

### Actions :

1.  **Rechercher et supprimer les fichiers de sauvegarde (`.bak`, `.original`)** :
    *   Commande de recherche : `find src/ -name '*.bak' -o -name '*.original'`
    *   Action : Examiner chaque fichier trouvé et le supprimer s'il n'est plus pertinent.

2.  **Vérifier les assets non référencés** (images, polices, etc. dans `public/` ou `src/assets/`) :
    *   Action : Utiliser un outil ou un script pour lister les assets et vérifier s'ils sont référencés dans le code (CSS, JS, JSX, HTML).
    *   Supprimer les assets non référencés après sauvegarde.

3.  **Vérifier les fichiers de documentation obsolètes dans `docs/`** :
    *   Action : Parcourir les sous-dossiers de `docs/` (notamment `docs/migration/`, `docs/archive/`) et identifier les documents qui ne sont plus pertinents ou qui décrivent des états passés sans valeur historique claire.
    *   Proposer une liste de documents à archiver de manière plus formelle ou à supprimer.

## Checklist de Nettoyage

### Vérification des fichiers potentiellement obsolètes

- [ ] `src/components/artistes/ArtisteDetail.jsx` - Ce fichier n'existe pas, aucune action nécessaire.
- [ ] `src/components/artistes/ArtisteForm.jsx` - Ce fichier n'existe pas, aucune action nécessaire.
- [ ] `src/styles/components/concerts.css` - Vérifier l'utilisation avec la commande:
  ```bash
  grep -r "import.*concerts\.css" --include="*.js" --include="*.jsx" src/
  ```
  Si aucun résultat, marquer pour suppression.
- [x] `src/styles/components/concerts-mobile.css` - CONSERVER, contient du code fonctionnel pour l'affichage mobile des concerts.

### Résolution des duplications

- [ ] Comparer `src/components/common/ActionButton.js` et `src/components/ui/ActionButton.js` - Détecter les différences et planifier une fusion.
- [ ] Comparer `ActionButton.js` (fusionné) et `src/components/ui/Button.js` - Évaluer le chevauchement fonctionnel et planifier une refactorisation si nécessaire.
- [ ] Comparer `src/components/common/Spinner.js` et `src/components/ui/LoadingSpinner.js` - Évaluer pour une possible fusion.

### Refactorisation des composants volumineux

- [ ] Analyser `src/hooks/common/useGenericEntityDetails.js` (plus de 500 lignes) pour découpage en modules plus petits.
- [ ] Identifier et lister les autres fichiers volumineux (plus de 200 lignes) pour refactorisation potentielle.

### Nettoyage général

- [ ] Rechercher et supprimer les fichiers de sauvegarde (`.bak`, `.original`).
- [ ] Vérifier et supprimer les assets non référencés.
- [ ] Identifier et archiver les documents obsolètes dans `docs/`.

