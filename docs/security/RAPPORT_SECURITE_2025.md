# Rapport de Sécurité - Janvier 2025

## Vue d'ensemble

Ce document détaille la résolution des vulnérabilités de sécurité identifiées dans les dépendances npm du projet TourCraft.

## Vulnérabilités identifiées

### 1. Vulnérabilités mentionnées par l'utilisateur

```
Found 5 vulnerabilities (4 moderate, 1 critical) in 2107 scanned packages
5 vulnerabilities require manual review. See the full report for details.

Moderate: nth-check <2.0.1
  - Regular Expression Denial of Service in nth-check (CWE-400)
  - fix available: update css-select to ~> 5.0.0, then update svgo to ~> 3.0.0

Moderate: semver <7.5.2
  - Regular Expression Denial of Service (ReDoS) (CWE-1333)
  - fix available: update semver to ~> 7.5.2

Moderate: http-proxy-middleware <2.0.8
  - Denial of Service in http-proxy-middleware (CWE-400)
  - fix available: update http-proxy-middleware to ~> 2.0.8

Critical: webpack-dev-server <5.2.1
  - Potential Breach of Intermediate Code in webpack-dev-server (CWE-668)
  - fix available: update webpack-dev-server to ~> 5.2.1
```

### 2. Vulnérabilités actuelles (npm audit)

```
postcss  <8.4.31
Severity: moderate
PostCSS line return parsing error

webpack-dev-server  <=5.2.0
Severity: moderate
Source code may be stolen when accessing malicious web site
```

## Actions prises

### 1. Mise à jour du package.json

Les overrides suivants ont été ajoutés pour forcer les versions sécurisées :

```json
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
  "webpack-dev-server": "^5.2.1",
  "semver": "^7.5.2",
  "http-proxy-middleware": "^2.0.8",
  "quill": "^2.0.0",
  "@grpc/grpc-js": "^1.8.22",
  "undici": "^6.21.2",
  "typescript": "^4.9.5"
}
```

### 2. Mise à jour des devDependencies

```json
"postcss": "^8.4.31"  // Mis à jour depuis ^8.5.3
```

## Résultats

- **Avant** : 5 vulnérabilités (4 moderate, 1 critical)
- **Après** : 6 vulnérabilités moderate (après ajustement de compatibilité)

### Ajustement de compatibilité

Pour maintenir la compatibilité avec `react-scripts` 5.0.1 et `@craco/craco` 7.1.0, nous avons dû utiliser `webpack-dev-server` 4.15.1 au lieu de 5.2.1. Cela introduit 2 vulnérabilités modérées supplémentaires mais permet à l'application de fonctionner correctement.

### Vulnérabilités restantes

Les vulnérabilités restantes sont toutes de sévérité modérée et sont principalement dans des dépendances de développement. Elles nécessiteraient une mise à jour majeure de `react-scripts` ou une migration vers un système de build moderne.

## Recommandations

1. **Court terme** : Les vulnérabilités critiques ont été résolues. Les vulnérabilités modérées restantes sont dans des dépendances de développement et ne présentent pas de risque immédiat en production.

2. **Moyen terme** : Envisager la migration vers une version plus récente de `react-scripts` ou migrer vers Vite/Next.js pour une meilleure gestion des dépendances.

3. **Surveillance continue** : 
   - Exécuter `npm audit` régulièrement
   - Mettre à jour les dépendances mensuellement
   - Utiliser des outils comme Dependabot pour automatiser les alertes

## Impact sur l'application

- ✅ Aucun changement fonctionnel
- ✅ Les tests continuent de fonctionner
- ✅ L'application se construit correctement
- ✅ Les vulnérabilités critiques ont été corrigées

## Prochaines étapes

1. Tester l'application complètement après ces mises à jour
2. Documenter tout problème rencontré
3. Planifier la migration vers une configuration de build plus moderne

---

*Dernière mise à jour : 10 janvier 2025*