
# Rapport d'Audit de Sécurité - Projet TourCraft

## 1. Contexte de l'Audit

Une vulnérabilité a été détectée dans le package `nth-check` utilisée dans le projet via une dépendance transitive de `react-scripts`. Cette faille affecte également les modules `css-select` et `@svgr/webpack`.

## 2. Vulnérabilités Initiales Identifiées

- Total de 15 vulnérabilités (9 modérées, 6 hautes).
- Détails :
  - `nth-check` (vulnérable en < 2.0.1) : Complexité inefficace d'expression régulière.
  - `css-select` (≤ 3.1.0) : dépend de versions vulnérables de `nth-check`.
  - `@svgr/webpack` (4.0.0 - 5.5.0) : dépend de `@svgr/plugin-svgo`.
  - `postcss` : vulnérabilité modérée.
  - `@grpc/grpc-js` : vulnérabilité modérée.
  - `quill` : vulnérabilité XSS.

## 3. Analyse de l'Arbre de Dépendances

- Deux versions de `nth-check` détectées :
  - 2.1.1 (sécurisée).
  - 1.0.2 (vulnérable) via `svgo` v1.3.2 → `css-select` v2.1.0 → `nth-check`.

## 4. Modifications Apportées

### 4.1 Fichier `package.json`

- Ajout de la section `overrides` :
  ```json
  {
    "overrides": {
      "nth-check": "^2.1.1",
      "css-select": {
        "nth-check": "^2.1.1"
      },
      "svgo": {
        "css-select": {
          "nth-check": "^2.1.1"
        }
      },
      "resolve-url-loader": {
        "postcss": "^8.4.31"
      },
      "quill": "^2.0.0",
      "@grpc/grpc-js": "^1.8.22",
      "undici": "^6.21.2"
    }
  }
  ```

- Mise à jour de `firebase` dans `dependencies` :
  ```json
  "firebase": "^10.9.0"
  ```

## 5. Résultats de l'Audit Après Modifications

- Nombre de vulnérabilités réduit à 4 (toutes modérées).
- Vulnérabilités critiques résolues :
  - `nth-check` : corrigé.
  - `css-select` : corrigé.
  - `@svgr/webpack` : corrigé.
  - `quill` : corrigé.
  - `@grpc/grpc-js` : corrigé.
  - `undici` : corrigé.
  - `firebase` : vulnérabilité `_authTokenSyncURL` corrigée.

## 6. Vulnérabilités Restantes

- 4 vulnérabilités modérées liées à `postcss` :
  - Cause : `resolve-url-loader` dépend de `postcss` < 8.4.31.
  - Solution nécessiterait un downgrade de `react-scripts` de la v5.0.1 à la v3.0.1 (non recommandé).

## 7. Recommandations Finales

- Conserver les overrides appliqués.
- Ne pas downgrader `react-scripts` pour le moment.
- Surveiller les mises à jour de `react-scripts` et `resolve-url-loader`.
- Exécuter régulièrement `npm audit`.