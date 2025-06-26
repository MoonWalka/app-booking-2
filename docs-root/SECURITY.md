# 🔒 Guide de Sécurité - Protection contre les fuites de secrets

## ⚠️ Problème résolu
Une clé API Firebase a été exposée dans le code en juin 2025. Ce guide vous aide à éviter que cela se reproduise.

## 🛡️ Protection automatique mise en place

### Git Secrets
Le projet est maintenant configuré avec `git-secrets` qui bloque automatiquement les commits contenant :

- ✅ **Clés Google/Firebase** : `AIza...`
- ✅ **Tokens OAuth Google** : `ya29...`
- ✅ **Clés OpenAI** : `sk-...`
- ✅ **Clés AWS** : `AKIA...`
- ✅ **Tokens GitHub** : `ghp_...`, `gho_...`, etc.
- ✅ **Clés Stripe** : `sk_live_...`, `sk_test_...`
- ✅ **Patterns de mots de passe** : `password="..."`

### Comment ça marche
```bash
# ❌ Ce commit sera BLOQUÉ automatiquement
git add script.js  # contient: const key = "AIzaSyD..."
git commit -m "Fix"
# ERROR: Matched prohibited patterns

# ✅ Solution : utiliser des variables d'environnement
const key = process.env.FIREBASE_API_KEY;
```

## 📁 Organisation des secrets

### Variables d'environnement principales (.env)
```bash
REACT_APP_FIREBASE_API_KEY=votre_clé
REACT_APP_FIREBASE_AUTH_DOMAIN=projet.firebaseapp.com
# ... autres variables
```

### Variables pour scripts (.env.scripts)
```bash
FIREBASE_API_KEY=votre_clé
FIREBASE_PROJECT_ID=votre-projet
# ... pour les scripts de migration/nettoyage
```

## 🚨 Que faire en cas de fuite

### Actions immédiates
1. **Révoquer la clé** dans la console Google Cloud
2. **Générer une nouvelle clé** avec des restrictions
3. **Mettre à jour** les variables d'environnement
4. **Nettoyer l'historique Git** (si nécessaire)

### Commandes utiles
```bash
# Scanner l'historique pour des secrets
git secrets --scan-history

# Bypasser temporairement (usage exceptionnel)
git commit --no-verify -m "Fix urgent"

# Voir les patterns configurés
git secrets --list
```

## 🔧 Configuration pour nouveaux développeurs

```bash
# Exécuter ce script une seule fois
./gitsecrets-setup.sh
```

## 📋 Checklist avant chaque commit

- [ ] Aucune clé API en dur dans le code
- [ ] Variables d'environnement utilisées partout
- [ ] Fichiers `.env*` dans `.gitignore`
- [ ] Scripts utilisent `.env.scripts` (ignoré)

## 🎯 Bonnes pratiques

### ✅ À FAIRE
```javascript
// Utiliser des variables d'environnement
const config = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN
};
```

### ❌ À ÉVITER
```javascript
// JAMAIS de clés en dur
const config = {
  apiKey: "AIzaXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX", // ❌
  authDomain: "votre-projet.firebaseapp.com"
};
```

## 🔍 Surveillance continue

- **Pre-commit hooks** : Bloquent les secrets avant commit
- **Patterns mis à jour** : Couvrent les principales plateformes
- **Documentation** : Guide les développeurs

---

💡 **Rappel** : La sécurité est la responsabilité de tous. En cas de doute, demandez !