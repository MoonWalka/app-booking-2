# Scripts TourCraft

Ce dossier contient les scripts utilitaires actifs du projet. Suite au nettoyage du 16 juillet 2025, nous sommes passés de ~150 scripts à 38 scripts actifs.

## 📂 Structure après nettoyage

### Scripts d'analyse (à la racine)
- `analyze-unused-files.js` / `analyze-unused-files-enhanced.js` - Analyse des fichiers non utilisés
- `analyze-data-flow.js` - Analyse du flux de données
- `analyze-contract-content-problem.js` - Analyse des problèmes de contrats
- `analyzeRelations.js` - Analyse des relations entre entités

### Scripts de vérification
- `check-css-vars.js` - Vérification des variables CSS (utilisé par `npm run css:fix`)
- `check-contact-email.js` - Vérification des emails de contacts
- `check-contract-statuses.js` - Vérification des statuts de contrats
- `check-nested-structures.js` - Vérification des structures imbriquées
- `check-realtime-updates.js` - Vérification des mises à jour temps réel
- `check-recent-contact-changes.js` - Vérification des changements récents
- `check-structure-migration-status.js` - Statut de migration des structures

### Scripts d'audit
- `audit_card_usage.js` - Audit de l'utilisation des composants Card (utilisé par `npm run audit:card`)
- `audit-boutons-ajout.js` - Audit des boutons d'ajout
- `audit-consolidation.js` - Audit de consolidation
- `generate-audit-report.js` - Génération de rapports d'audit
- `run-full-audit.js` - Exécution d'un audit complet

### Scripts de détection
- `detect_unused_files.js` - Détection des fichiers non utilisés
- `detect-duplicates.sh` - Détection des doublons
- `improved_card_detection.js` - Détection améliorée des composants Card

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
Archive contenant ~120 scripts obsolètes :
- Scripts de migrations terminées (CSS, Concert→Date, Programmateur→Contact, etc.)
- Scripts d'audit déjà exécutés
- Scripts de fix déjà appliqués
- Scripts de test temporaires

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