# 🧹 Nettoyage des Fichiers de la Racine - Documentation

**Date du nettoyage :** 1er juin 2025  
**Objectif :** Nettoyer la racine du projet des fichiers temporaires et de développement

## 📁 Fichiers Déplacés

### 🗂️ Rapports d'Audit (vers `docs/audits/root-cleanup/`)
- `AUDIT_COMPOSANTS_TEST.md` - Audit des composants de test en production
- `AUDIT_CONTRATS_COMPLET.md` - Audit complet des fichiers contrats
- `RAPPORT_AUDIT_COULEURS_COMPLET.md` - Audit des couleurs et cohérence CSS
- `RAPPORT_DOUBLONS_PHASE2.md` - Inventaire des doublons desktop/mobile
- `RAPPORT_FINAL_INCOHERENCES.md` - Rapport final des incohérences UI
- `bootstrap_audit_report.md` - Rapport d'audit des classes Bootstrap
- `audit_contraste_rapport.json` - Rapport de contraste des couleurs
- `audit_couleurs_rapport.json` - Rapport d'audit des couleurs
- `audit_incoherences_detail.json` - Détail des incohérences détectées
- `couleurs_variables_manquantes.css` - Variables CSS manquantes

### 🐛 Diagnostics et Solutions (vers `docs/bugs/`)
- `DIAGNOSTIC_CARTES_LIEUX.md` - Diagnostic problème cartes lieux
- `SOLUTION_CARTES_LIEUX.md` - Solution pour les cartes lieux

### 📖 Guides d'Intégration (vers `docs/`)
- `GOOGLE_DOCS_COPIER_COLLER_FIX.md` - Solution copier-coller Google Docs
- `TAILLES_TEXTE_INTEGRATION.md` - Intégration tailles texte et interligne

### 🔧 Scripts Temporaires (vers `scripts/archived-root-scripts/`)
- `audit_couleurs_contraste.js` - Script d'audit contraste
- `audit_couleurs.js` - Script d'audit couleurs
- `audit_incoherences_systematique.js` - Script audit incohérences
- `fix_critical_incoherences.js` - Script correction incohérences critiques
- `fix_debug_components.js` - Script correction composants debug
- `fix_couleurs_hardcodees.js` - Script correction couleurs hardcodées
- `debug-concerts.js` - Script debug concerts
- `validate_corrections.js` - Script validation corrections

## ✅ Fichiers Conservés à la Racine

**Seuls les fichiers essentiels restent à la racine :**
- `README.md` - Documentation principale du projet
- `package.json` / `package-lock.json` - Configuration npm
- `craco.config.js` - Configuration Create React App
- `jest.config.js` / `jest.setup.js` - Configuration tests
- `jsconfig.json` - Configuration IDE JavaScript
- `firebase.json` / `firestore.indexes.json` / `firestore.rules` - Configuration Firebase
- `.eslintrc.js` - Configuration ESLint (conservé à la racine)

## 🎯 Résultat

**Avant :** 21+ fichiers temporaires à la racine  
**Après :** 11 fichiers essentiels uniquement  

La racine du projet est maintenant **propre** et **organisée**, avec tous les fichiers temporaires correctement archivés dans leur dossier approprié.