# Analyse des Scripts Restants

## Scripts à SUPPRIMER (obsolètes ou plus nécessaires)

### 1. Scripts de problèmes déjà résolus
- `analyze-contract-content-problem.js` - Analyse d'un problème spécifique déjà résolu
- `check-contact-email.js` - Vérification ponctuelle
- `check-missing-contacts.js` - Vérification ponctuelle
- `check-recent-contact-changes.js` - Vérification ponctuelle
- `find-recently-unlinked-contacts.js` - Recherche ponctuelle

### 2. Scripts de migration probablement terminées
- `migrate-contact-to-contacts.js` - Migration ancienne (juin)
- `migrate-lists-to-generic.js` - Migration des listes (juin)
- `migrate-nested-data-secure.js` - Migration des données imbriquées
- `migrate-searches-to-new-collection.js` - Migration des recherches (récent mais probablement terminé)

### 3. Scripts d'audit ponctuels
- `audit-boutons-ajout.js` - Audit spécifique déjà fait
- `audit-consolidation.js` - Audit de consolidation déjà fait
- `check-contract-statuses.js` - Vérification ponctuelle
- `check-nested-structures.js` - Vérification déjà faite
- `check-structure-migration-status.js` - Migration terminée

### 4. Scripts de vérification Firebase ponctuels
- `check-contacts-lieux-organizationid.js` - Vérification déjà faite
- `check-lieu-contact-relation.js` - Vérification déjà faite
- `ultimate-firebase-audit.js` - Audit ponctuel
- `scan_firestore_rest.js` - Scan ponctuel

### 5. Scripts anciens peu utilisés
- `identify_non_migrated_hooks.js` - Migration hooks terminée
- `prioritize_components.js` - Priorisation déjà faite
- `update-file-contents.sh` - Script générique peu utilisé
- `validate-card-migration.sh` - Migration Cards terminée

## Scripts à GARDER (toujours utiles)

### 1. Scripts d'analyse de fichiers non utilisés (GARDER)
- `analyze-unused-files.js` ✅
- `analyze-unused-files-enhanced.js` ✅
- `detect_unused_files.js` ✅
- `verify-unused-files.js` ✅
- `verify-all-unused-files.js` ✅
- `verify-single-file.js` ✅
- `delete-confirmed-unused-files.js` ✅

### 2. Scripts d'analyse générale (GARDER)
- `analyze-data-flow.js` ✅ - Analyse du flux de données
- `analyzeRelations.js` ✅ - Analyse des relations entre entités

### 3. Scripts utilisés dans package.json (GARDER)
- `check-css-vars.js` ✅ - Utilisé par `npm run css:fix`
- `audit_card_usage.js` ✅ - Utilisé par `npm run audit:card`

### 4. Scripts de détection (GARDER)
- `detect-duplicates.sh` ✅ - Détection des doublons
- `improved_card_detection.js` ✅ - Détection des Cards

### 5. Scripts d'audit général (GARDER)
- `generate-audit-report.js` ✅ - Génération de rapports
- `run-full-audit.js` ✅ - Audit complet
- `check-realtime-updates.js` ✅ - Vérification temps réel

## Résumé
- **Scripts à supprimer** : 24 scripts
- **Scripts à garder** : 14 scripts
- **Total actuel** : 38 scripts
- **Total après nettoyage** : 14 scripts