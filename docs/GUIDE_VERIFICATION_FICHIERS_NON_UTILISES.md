# Guide de Vérification des Fichiers Non Utilisés - 100% Sûr

## 🎯 Méthodologie en 4 Étapes

### 1. Analyse Automatique
```bash
node scripts/analyze-unused-files-enhanced.js
```

### 2. Vérification Manuelle
```bash
node scripts/verify-unused-files.js
```

### 3. Recherche Manuelle Avancée
```bash
# Par nom de fichier
grep -r "NomDuFichier" src/ --exclude-dir=node_modules

# Par nom de composant
grep -r "NomDuComposant" src/ --exclude-dir=node_modules

# Dans les routes
grep -r "NomDuFichier" src/App.js src/context/TabsContext.js
```

### 4. Vérification Contextuelle
- Analyser le contenu du fichier (exports)
- Vérifier les dépendances inverses
- Tester la suppression temporaire

## ✅ Checklist Finale

Avant suppression, vérifier :
- [ ] Aucun import statique
- [ ] Aucun require
- [ ] Aucun import dynamique
- [ ] Aucune référence dans les routes
- [ ] Aucune référence dans les tests
- [ ] Aucune référence dans la config
- [ ] Aucun usage JSX
- [ ] Aucune référence dans les registres

## 🚨 Cas Particuliers

- **Fichiers de config** : package.json, craco.config.js
- **Fichiers de routage** : App.js, TabsContext.js
- **Imports dynamiques** : `lazy(() => import('./Component'))`
- **Références indirectes** : registres de composants

## 🛠️ Script de Vérification Rapide

```bash
#!/bin/bash
FILE_PATH=$1
FILE_NAME=$(basename "$FILE_PATH" .js)

echo "🔍 Vérification de: $FILE_PATH"
grep -r "import.*$FILE_NAME" src/ --exclude-dir=node_modules || echo "✅ Aucun import"
grep -r "require.*$FILE_NAME" src/ --exclude-dir=node_modules || echo "✅ Aucun require"
grep -r "import.*$FILE_NAME" src/ --exclude-dir=node_modules || echo "✅ Aucun import dynamique"
grep -r "$FILE_NAME" src/App.js src/context/TabsContext.js 2>/dev/null || echo "✅ Aucune référence route"
```

## 📊 Résultats de l'Analyse Actuelle

- **Total fichiers** : 723
- **Fichiers utilisés** : 435
- **Fichiers chargés dynamiquement** : 57
- **Fichiers référencés** : 286
- **Fichiers non utilisés confirmés** : 0
- **Fichiers potentiellement non utilisés** : 288

## ⚠️ Faux Positifs Courants

- Composants chargés via registres dynamiques
- Utilitaires utilisés via imports conditionnels
- Fichiers de configuration externes
- Fichiers de migration temporaires

## 🚀 Processus de Suppression Sécurisée

1. **Sauvegarde** : `cp fichier.js backup/`
2. **Test** : `mv fichier.js fichier.js.backup && npm start`
3. **Suppression** : `rm fichier.js.backup` (si tout fonctionne) 