# Scripts TourCraft

Ce dossier contient tous les scripts utilitaires du projet, organisés par catégorie.

## 📂 Structure

### 📁 analyses/
Scripts d'analyse du code et des données
- `analyze-contact-duplicates.js` - Analyse des doublons de contacts
- `analyze-hooks-differences.js` - Analyse des différences entre hooks
- `diagnostic-contact-associations.js` - Diagnostic des associations de contacts

### 📁 audits/
Scripts d'audit et leurs rapports
- `audit-associations-bidirectionnelles.js` - Audit des relations bidirectionnelles
- `audit-cleanup-migration.js` - Audit post-migration
- `audit-firebase-organizationid.js` - Audit Firebase pour organizationId
- `audit-relations-system.js` - Audit du système de relations

### 📁 cleanup/
Scripts de nettoyage
- `cleanup-contact-duplicates.js` - Nettoyage des doublons de contacts
- `cleanup-migration-safe.js` - Nettoyage sécurisé post-migration
- `cleanup-remaining-references.js` - Nettoyage des références restantes

### 📁 firebase-migration/
Scripts de migration Firebase (voir README dans le dossier)

### 📁 migration/
Scripts de migration de composants

### 📁 standardization/
Scripts de standardisation du code

### 📁 archived-*
Scripts archivés des versions précédentes

## 🚀 Scripts Importants

### Multi-Organisation
- `migrate-missing-organizationid.js` - Migration des documents sans organizationId
- `check-organization-ids.js` - Vérification des organizationId

### Audits
- `audit-*.js` - Tous les scripts d'audit
- `audit_hooks_usage.sh` - Audit de l'utilisation des hooks

### Migration CSS
- `migrate-css-*.sh` - Scripts de migration CSS par phases

### Nettoyage
- `cleanup-*.js` - Scripts de nettoyage divers
- `clean_debug_logs.js` - Nettoyage des logs de debug

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