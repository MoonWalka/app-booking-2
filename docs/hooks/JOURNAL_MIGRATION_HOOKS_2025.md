# Journal de Migration des Hooks - Mai 2025

*Document créé le: 8 mai 2025*

Ce document résume les actions réalisées dans le cadre du plan de migration et d'amélioration des hooks dans le projet TourCraft.

## Résumé des actions

### 1. Inventaire et migration des hooks dépréciés

**Étape 1.1: Inventaire des hooks non encore migrés**
- Exécution du script `detect_deprecated_hooks.js` pour identifier tous les hooks dépréciés
- Résultats: 32 occurrences identifiées dans le code (25 sévérité haute, 7 sévérité moyenne)

**Étape 1.2: Création d'une liste prioritaire**
- Liste établie et documentée dans `/docs/bugs/LISTE_PRIORITAIRE_HOOKS_MIGRATION.md`
- Priorisation basée sur la fréquence d'utilisation et l'importance des hooks

**Étape 1.3: Migration des hooks manquants**
- Standardisation du hook `useLieuForm` pour suivre le modèle des autres hooks
  - Création d'un fichier `useLieuFormMigrated.js`
  - Conversion de `useLieuForm.js` en wrapper avec avertissement de dépréciation
  - Mise à jour des exports dans `index.js`
- Exécution du script `migrate_to_hooks_v2.js` pour mettre à jour les imports vers les versions V2 des hooks
  - 14 fichiers mis à jour pour utiliser les versions V2

### 2. Élimination des duplications dans les hooks utilitaires

**Étape 2.1: Identification des hooks dupliqués**
- Analyse des hooks utilitaires comme `useSearchAndFilter`, `useEntitySearch`, `useFormSubmission` et `useAddressSearch`
- Constat: centralisation déjà en cours, avec des redirections depuis les dossiers spécifiques vers `hooks/common`

**Étape 2.2: Standardisation des redirections**
- Création du script `standardize_utility_hooks_redirects.js` pour harmoniser les redirections
- 8 fichiers de redirection standardisés avec des messages de dépréciation clairs
- Documentation des bonnes pratiques dans `/docs/hooks/UTILISATION_HOOKS_UTILITAIRES.md`

### 3. Nettoyage des logs de débogage

**Étape 3.1: Analyse des patterns de logs**
- Identification de différents types de logs: TRACE-UNIQUE, INFO, logs généraux
- Hooks concernés: `useGenericEntityForm`, `useResponsive`, `useLocationIQ`, etc.

**Étape 3.2: Implémentation d'une solution de log conditionnelle**
- Création de l'utilitaire `/src/utils/logUtils.js` avec fonctions `debugLog` et `perfLog`
- Logs conditionnels qui ne s'affichent qu'en développement ou avec DEBUG_HOOKS=true

**Étape 3.3: Migration des logs**
- Mise à jour de `useGenericEntityForm.js` pour utiliser `debugLog` au lieu de `console.log`
- Mise à jour de `useResponsive.js` pour utiliser `debugLog` au lieu de `console.log`

## Prochaines étapes

1. **Continuer la standardisation des logs**: Appliquer notre utilitaire `logUtils.js` à tous les hooks restants
2. **Harmoniser les approches de gestion d'erreurs**: Standardiser la gestion des erreurs dans tous les hooks
3. **Documentation**: Compléter la documentation sur l'architecture des hooks et les bonnes pratiques
4. **Tests**: Ajouter des tests unitaires pour les hooks génériques
5. **Supprimer les hooks dépréciés**: Planifier la suppression progressive des hooks dépréciés avant la date limite du 6 novembre 2025

## Recommandations

1. **Standardiser l'import des hooks**: Encourager l'utilisation des versions V2 des hooks pour tous les nouveaux développements
2. **Utiliser les hooks génériques**: Privilégier l'utilisation des hooks génériques (`useGenericEntityDetails`, `useGenericEntityForm`) plutôt que de créer de nouveaux hooks spécifiques
3. **Logs conditionnels**: Systématiser l'utilisation de `debugLog` et `perfLog` plutôt que des `console.log` directs
4. **Documentation**: Maintenir une documentation à jour sur les hooks disponibles et leurs options

---

*Document préparé par l'équipe TourCraft*