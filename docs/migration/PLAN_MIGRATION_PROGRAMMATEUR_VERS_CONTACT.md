# Migration du domaine "Programmateur" vers "Contact"

## Objectif
Remplacer **toutes** les occurrences du domaine `programmateur` (et variantes : Programmateur, programmateurs, etc.) par le domaine `contact` dans toute l'application, afin d'unifier la gestion des contacts et de supprimer la notion de programmateur.

---

## 1. Audit exhaustif des fichiers et usages

### a) **Pages**
- [ ] `src/pages/ProgrammateursPage.js`
- [ ] `src/pages/DashboardPage.js` (statistiques, widgets, logs)
- [ ] `src/pages/ContratsPage.js`
- [ ] `src/pages/ContratDetailsPage.js`
- [ ] `src/pages/ContratGenerationPage.js`
- [ ] `src/pages/contratTemplatesPage.js`
- [ ] `src/pages/contratTemplatesEditPage.js`
- [ ] Toute page utilisant ou listant des programmateurs

### b) **Composants**
- [ ] `src/components/programmateurs/` (TOUS les fichiers JS/JSX/TS/TSX, y compris :
  - [ ] `ProgrammateurForm`
  - [ ] `ProgrammateurDetails`
  - [ ] `ProgrammateursList`
  - [ ] `ProgrammateurGeneralInfo`
  - [ ] `ProgrammateurContactSection`
  - [ ] `ProgrammateurLegalSection`
  - [ ] `ProgrammateurLieuxSection`
  - [ ] `ProgrammateurStructuresSection`
  - [ ] `ProgrammateurConcertsSection`
  - [ ] `ProgrammateurHeader`
  - [ ] Mobile et desktop
  - [ ] Sections, modals, helpers, exemples, etc.
- Composants de sélection/recherche dans d'autres entités (lieux, concerts, structures, etc.)
- Composants de formulaires utilisant un champ programmateur

### c) **Hooks**
- [ ] `src/hooks/programmateurs/` (TOUS les hooks)
- [ ] `src/hooks/search/useProgrammateurSearch.js`
- [ ] `src/hooks/lieux/useLieuFormMigrated.js` (et tout hook qui référence un programmateur)
- [ ] `src/hooks/common/useGenericEntityForm.js` (si spécifique)

### d) **Schémas et validation**
- [ ] `src/schemas/ProgrammateurSchemas.js`
- [ ] Toute validation ou transformation de données liée à un programmateur

### e) **Services et utilitaires**
- [ ] `src/services/structureService.js` (gestion des liens structure <-> programmateur)
- [ ] `src/utils/idGenerators.js` (génération d'ID)

### f) **Styles**
- [ ] `src/styles/pages/programmateurs.css`
- [ ] Tous les fichiers CSS/SCSS/LESS/SASS dans `src/components/programmateurs/`
- [ ] Classes, variables, mixins, couleurs, icônes, etc.
- [ ] Fichiers de styles globaux ou partagés (ex : `src/components/concerts/ConcertForm.module.css`, `src/components/lieux/desktop/LieuForm.module.css`, etc.)

### g) **Tests et mocks**
- [ ] Fichiers de tests unitaires, d'intégration, snapshots, mocks, fixtures, etc.

### h) **Documentation**
- [ ] Fichiers Markdown, guides, audits, rapports, snippets, etc. (ex : `docs/`, `card_audit_report.md`, `css_audit_report.md`, etc.)

### i) **Configuration, scripts, migration**
- [ ] Fichiers de migration, scripts, configs, JSON, etc. (ex : `firebase-migration/validation-report.json`)

---

## 2. Plan de migration (stratégie renommage)

### **Étape 1 : Préparation**
- [ ] Faire une branche dédiée à la migration.
- [ ] Geler les développements sur le domaine programmateur pendant la migration.
- [ ] Lister tous les fichiers à modifier (voir audit ci-dessus).

### **Étape 2 : Renommage des fichiers et dossiers**
- [ ] Renommer tous les dossiers et fichiers contenant "programmateur" ou "programmateurs" en "contact" ou "contacts" (respecter le singulier/pluriel et la casse).
- [ ] Exemples :
  - [ ] `src/components/programmateurs/` → `src/components/contacts/`
  - [ ] `ProgrammateurForm.js` → `ContactForm.js`
  - [ ] `useProgrammateurForm.js` → `useContactForm.js`
  - [ ] `ProgrammateurSchemas.js` → `ContactSchemas.js`
  - [ ] etc.

### **Étape 3 : Renommage dans le code**
- [ ] Remplacer **toutes** les occurrences dans le code (import, export, variables, fonctions, hooks, classes, types, interfaces, commentaires, logs, tests, etc.) :
  - [ ] `programmateur` → `contact`
  - [ ] `programmateurs` → `contacts`
  - [ ] `Programmateur` → `Contact`
  - [ ] `Programmateurs` → `Contacts`
- [ ] Adapter les noms de variables, props, hooks, schémas, etc.
- [ ] Adapter les routes, URLs, endpoints, chemins d'accès, etc.

### **Étape 4 : Mise à jour des dépendances**
- [ ] Mettre à jour les entités qui référencent un programmateur (lieux, concerts, structures, contrats, etc.) pour pointer vers un contact.
- [ ] Adapter les schémas de données, les relations, les hooks, les composants concernés.

### **Étape 5 : Mise à jour des styles**
- [ ] Renommer les classes CSS, variables, mixins, couleurs, icônes, etc.
- [ ] Adapter les fichiers de styles globaux et spécifiques.

### **Étape 6 : Mise à jour de la documentation**
- [ ] Mettre à jour tous les guides, audits, rapports, snippets, etc.
- [ ] Vérifier les exemples de code, les captures d'écran, les schémas, etc.

### **Étape 7 : Tests et validation**
- [ ] Lancer tous les tests unitaires, d'intégration, end-to-end.
- [ ] Vérifier manuellement toutes les fonctionnalités liées aux contacts (ex-programmateurs).
- [ ] Corriger toute régression ou oubli.

### **Étape 8 : Nettoyage et suppression**
- [ ] Supprimer les anciens fichiers/dossiers "programmateur" restants.
- [ ] Nettoyer les imports, dépendances, scripts, etc.

### **Étape 9 : Revue et merge**
- [ ] Faire relire la PR par plusieurs développeurs.
- [ ] Merger la branche une fois validée.

---

## 3. Points de vigilance et pièges fréquents
- [ ] **Relations entre entités** : bien vérifier tous les liens (ex : lieux, concerts, structures, contrats, formulaires, etc.)
- [ ] **Imports relatifs/absolus** : attention aux chemins lors du renommage de dossiers/fichiers.
- [ ] **Tests et snapshots** : ne pas oublier les fichiers de tests, mocks, fixtures, snapshots.
- [ ] **Styles** : bien vérifier les classes CSS, variables, mixins, icônes, couleurs, etc.
- [ ] **Scripts, configs, migrations** : scripts d'import/export, migration, configs Firebase, etc.
- [ ] **Documentation** : guides, audits, rapports, snippets, captures d'écran, schémas.
- [ ] **Données en base** : prévoir une migration des données si nécessaire (ex : collection Firestore "programmateurs" → "contacts").
- [ ] **Pluriel/singulier et casse** : attention à la cohérence dans tout le code.
- [ ] **Références croisées** : vérifier les entités qui référencent un programmateur (id, nom, email, etc.).
- [ ] **Scripts CI/CD** : pipelines, scripts de build, déploiement, etc.

---

## 4. Suivi de migration (checklist globale)
- [ ] Pages renommées et adaptées
- [ ] Composants renommés et adaptés
- [ ] Hooks renommés et adaptés
- [ ] Schémas et validation adaptés
- [ ] Services et utilitaires adaptés
- [ ] Styles adaptés
- [ ] Tests et mocks adaptés
- [ ] Documentation adaptée
- [ ] Configurations/scripts/migrations adaptés
- [ ] Données migrées si besoin
- [ ] Tests manuels et automatiques passés
- [ ] Nettoyage final effectué

---

**Cette migration est critique : toute occurrence oubliée peut casser l'application.**

---

*Document généré automatiquement pour garantir l'exhaustivité du plan de migration et limiter tout oubli.* 