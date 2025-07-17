# Scripts TourCraft

Ce dossier contient les scripts utilitaires actifs du projet. Suite au nettoyage complet du 16 juillet 2025, nous sommes passés de ~150 scripts à seulement 16 scripts actifs.

## 📂 Structure après nettoyage

### Scripts essentiels conservés (16 scripts)

#### Analyse de fichiers non utilisés
- `analyze-unused-files.js` - Analyse basique des fichiers non utilisés
- `analyze-unused-files-enhanced.js` - Analyse avancée avec plus de détails
- `detect_unused_files.js` - Détection des fichiers non utilisés
- `verify-unused-files.js` - Vérification des fichiers non utilisés
- `verify-all-unused-files.js` - Vérification complète
- `verify-single-file.js` - Vérification d'un fichier spécifique
- `delete-confirmed-unused-files.js` - Suppression des fichiers confirmés non utilisés

#### Analyse générale
- `analyze-data-flow.js` - Analyse du flux de données dans l'application
- `analyzeRelations.js` - Analyse des relations entre entités

#### Scripts NPM
- `check-css-vars.js` - Vérification des variables CSS (**utilisé par `npm run css:fix`**)
- `audit_card_usage.js` - Audit des composants Card (**utilisé par `npm run audit:card`**)

#### Utilitaires
- `check-realtime-updates.js` - Vérification des mises à jour temps réel
- `detect-duplicates.sh` - Détection des doublons dans le code
- `improved_card_detection.js` - Détection améliorée des composants Card
- `generate-audit-report.js` - Génération de rapports d'audit
- `run-full-audit.js` - Exécution d'un audit complet du projet

### 📁 analyses/
Scripts d'analyse spécifiques
- `analyze-contact-duplicates.js` - Analyse des doublons de contacts
- `analyze-hooks-differences.js` - Analyse des différences entre hooks
- `diagnostic-contact-associations.js` - Diagnostic des associations de contacts

### 📁 audits/
Rapports d'audit générés
- `audit-associations-bidirectionnelles.js` - Audit des relations bidirectionnelles
- `audit-cleanup-migration.js` - Audit post-migration
- `audit-firebase-organizationid.js` - Audit Firebase pour entrepriseId
- `audit-relations-system.js` - Audit du système de relations

### 📁 cleanup/
Scripts de nettoyage sécurisés
- `cleanup-contact-duplicates.js` - Nettoyage des doublons de contacts
- `cleanup-migration-safe.js` - Nettoyage sécurisé post-migration
- `cleanup-remaining-references.js` - Nettoyage des références restantes

### 📁 firebase-migration/
Scripts pour migrations Firebase (voir README dans le dossier)

### 📁 migration/
Scripts de migration des composants Card

### 📁 standardization/
Scripts de standardisation du code

### 📁 setup/
Scripts de configuration initiale

### 📁 maintenance/
Scripts de maintenance

### 📁 _archive_2025-07-16/
Archive contenant ~144 scripts obsolètes (après 2 phases de nettoyage) :
- Scripts de migrations terminées (CSS, Concert→Date, Programmateur→Contact, Organisation→Entreprise, etc.)
- Scripts d'audit déjà exécutés
- Scripts de fix déjà appliqués
- Scripts de test temporaires
- Scripts de vérification ponctuels
- Scripts de problèmes résolus

## 📝 Utilisation

La plupart des scripts s'exécutent avec Node.js :
```bash
node scripts/[nom-du-script].js
```

Les scripts shell s'exécutent avec :
```bash
./scripts/[nom-du-script].sh
```

## ⚠️ Précautions

- Toujours faire un backup avant d'exécuter des scripts de migration ou de nettoyage
- Certains scripts nécessitent Firebase Admin SDK
- Lire les commentaires en début de fichier pour les instructions spécifiques