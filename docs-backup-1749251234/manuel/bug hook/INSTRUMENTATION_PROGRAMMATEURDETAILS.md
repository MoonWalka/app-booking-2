# Instrumentation de ProgrammateurDetails pour l'audit des cycles de vie

## Objectif
Tracer précisément les cycles de vie (montage, démontage, changement d'ID, chargement des données) du composant ProgrammateurDetails afin d'identifier les causes des bugs de cycle de vie et de requêtes dupliquées lors de la navigation ou de l'ouverture/fermeture de la page.

## Modifications apportées

- Ajout de logs dans ProgrammateurDetails.js pour :
  - Le montage et le démontage du composant (useEffect)
  - Le changement d'ID (useRef et logs)
  - Le chargement effectif des données via le hook (useEffect sur detailsHook.entity)
- Ces logs permettent d'observer dans la console :
  - Les cycles de montage/démontage rapides
  - Les changements d'ID lors de la navigation
  - Les chargements effectifs de données

## Exemple de logs attendus

```
[DEBUG] [ProgrammateurDetails] MONTAGE pour ID: 123
[INFO] Changement d'ID programmateur: 123 → 456
[DEBUG] [ProgrammateurDetails] DEMONTAGE pour ID: 123
[DEBUG] [ProgrammateurDetails] MONTAGE pour ID: 456
[DEBUG] [ProgrammateurDetails] Données chargées pour ID: 456
```

## Utilité

- Permet de vérifier si le problème de cycle de vie vient du composant parent ou du hook de données.
- Sert de base pour affiner l'audit et cibler les corrections dans le hook ou la logique de navigation.

## Prochaine étape

- Analyser les logs lors de la navigation entre différents programmateurs.
- Si des cycles de montage/démontage rapides ou des requêtes dupliquées sont observés, instrumenter le hook useGenericEntityDetails pour une traçabilité encore plus fine.
