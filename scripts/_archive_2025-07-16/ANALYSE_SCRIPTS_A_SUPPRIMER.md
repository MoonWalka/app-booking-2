# Analyse des Scripts à Supprimer

## Scripts utilisés dans package.json (À GARDER)
- `check-css-vars.js` (utilisé par `css:fix`)
- `audit_card_usage.js` (utilisé par `audit:card`)
- Scripts dans `migration/` pour les cards (utilisés par les commandes card:*)

## Scripts de migration terminées (À SUPPRIMER)

### Migration CSS (terminée)
- `migrate-css-*.sh` (tous les scripts de migration CSS phase 1 à 10)
- `apply-harmonized-colors.sh`
- `inline_to_typography_classes.js`
- `fix_css_syntax_errors.js`
- `css_audit_complete.js`
- `cleanup_after_css_fixes.js`

### Migration Concert → Date (terminée)
- `firebase-migrate-concerts-to-dates.js`
- `migrate-concert-to-date-final.js`
- `fix-concert-data.js`

### Migration Programmateur → Contact (terminée)
- `migrate-programmateur-to-contact.sh`
- `cleanup-programmateur-critical.js`
- `final-programmateur-audit.js`

### Migration Organisation → Entreprise (terminée)
- `add-organization-ids.js`
- `check-organization-ids.js`
- `check-organizationid-*.js`
- `fix-organizationid-console.js`
- `fix-missing-organizationids.js`
- `migrate-missing-organizationid.js`

### Migration de structures (terminée)
- `fix-structures-*.js`
- `fix-nested-contacts*.js`
- `cleanup-personne-libre.js`
- `fix-personne-libre-status.js`

### Autres migrations terminées
- `migrate-contract-statuses.js`
- `migrate-contract-templates.js`
- `migrate-comments-format.js`
- `migrate-rib-to-entreprise.js`
- `migrate-all-rib-data.js`
- `migration-add-numeroIntracommunautaire.js`

## Scripts d'audit déjà exécutés (À SUPPRIMER)
- `audit-*.js` (sauf ceux utilisés dans package.json)
- `diagnostic-*.js`
- `diagnose-*.js`
- `analyze-*.js` (sauf si encore utiles)
- `detect-*.js`
- `check-*.js` (sauf ceux utilisés dans package.json)

## Scripts de fix déjà appliqués (À SUPPRIMER)
- `fix-*.js` (tous les fix déjà appliqués)
- `fix_*.js`
- `clean_debug_logs.js`
- `cleanup-*.sh`

## Scripts archivés (À SUPPRIMER)
- Tout le contenu de `archived-migration-v2/`
- Tout le contenu de `archived-root-scripts/`

## Scripts de test temporaires (À SUPPRIMER)
- `test-harmonized-palette.js`
- `test-migration.js`
- `create-test-user.js`
- `generated-runtime-tests.js`

## Scripts obsolètes (À SUPPRIMER)
- `convert-relative-imports.sh`
- `generate-migration-mapping.sh`
- `show-all-contacts-raw.js`
- `rollback-contact-migration.js`

## Scripts à GARDER
1. **Scripts utilisés dans package.json**
2. **Scripts dans setup/** (peuvent être utiles pour nouvelles installations)
3. **Scripts de maintenance/** 
4. **analyze-unused-files*.js** (toujours utiles)
5. **detect_unused_files.js** (toujours utile)
6. **verify-*.js** (vérification de fichiers)

## Résumé
- **Total de scripts** : ~150+
- **À supprimer** : ~120 scripts
- **À garder** : ~30 scripts