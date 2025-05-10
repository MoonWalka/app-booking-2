# Checklist PR — Migration Hooks Génériques

Pour toute PR modifiant des hooks ou composants liés :

- [ ] Utilisation directe des hooks génériques (`useGenericEntityForm`, `useGenericEntityDetails`, `useGenericEntitySearch`, `useGenericEntityList`).
- [ ] Suppression ou refactoring des imports d’anciens hooks dépréciés.
- [ ] Mise à jour des fichiers d'index (`src/hooks/*/index.js`) pour exposer uniquement les versions optimisées/V2.
- [ ] Ajout ou mise à jour des tests unitaires et d'intégration pour couvrir le code migré.
- [ ] Vérification de la couverture de tests (aucune régression, pas de baisse sur les hooks concernés).
- [ ] Mise à jour de la documentation correspondante (`docs/hooks`, `docs/migration`, `docs/workflows`).
- [ ] Lancer `npm run detect-hooks` et s’assurer qu’il n’y a pas d’usage de hooks dépréciés.
- [ ] Respect des standards de code et passer le linter et Prettier.
- [ ] Valider le rapport d’audit de runtime logs (`npm run audit:runtime-logs`).
- [ ] Ajouter un label `migration-hooks` et assigner le responsable indiqué dans le plan d’action.
