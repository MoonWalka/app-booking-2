# Scripts et utilitaires

Ce dossier contient tous les scripts utilitaires qui étaient auparavant à la racine du projet.

## Structure des dossiers

### 📁 audits/
Scripts d'audit et d'analyse :
- `audit-*.js` : Scripts d'audit divers
- `analyze-*.js` : Scripts d'analyse de structure

### 📁 checks/
Scripts de vérification :
- `check-*.js` : Scripts pour vérifier différents aspects du système

### 📁 migrations/
Scripts de migration :
- `migrate-*.js` : Scripts pour migrer des données

### 📁 fixes/
Scripts de correction :
- `fix-*.js` : Scripts pour corriger des problèmes spécifiques

### 📁 tests/
Scripts et fichiers de test :
- `test-*.js` : Scripts de test
- `demo-*.js` : Scripts de démonstration
- Fichiers HTML de test

### 📁 debug/
Scripts de débogage :
- `debug-*.js` : Scripts pour déboguer des problèmes

### 📁 data-management/
Scripts de gestion de données :
- `create-*.js` : Création de données
- `list-*.js` : Listage de données
- `search-*.js` : Recherche de données
- `retrieve-*.js` : Récupération de données
- Autres scripts de manipulation de données

## Fichiers restés à la racine

Les fichiers de configuration essentiels restent à la racine :
- `package.json` et `package-lock.json`
- `craco.config.js`
- `jest.config.js` et `jest.setup.js`
- `firebase.json` et `firestore.*.json`
- `jsconfig.json`

## Utilisation

Ces scripts sont des utilitaires pour la maintenance et le développement. Ils peuvent être exécutés avec Node.js :

```bash
node scripts-root/[dossier]/[nom-du-script].js
```