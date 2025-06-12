# Phase 6 : Guide de Migration des Données

## 📋 Résumé

Cette phase migre les données existantes du système `contactId` (un seul contact) vers `contactIds` (tableau de contacts). La migration est **réversible** et **sécurisée**.

## 🎯 Objectifs

- [x] ✅ Convertir tous les concerts avec `contactId` vers `contactIds`
- [x] ✅ Maintenir les relations bidirectionnelles
- [x] ✅ Assurer la rétrocompatibilité temporaire
- [x] ✅ Fournir un script de rollback sécurisé

## 📁 Scripts Créés

### 1. Script Principal : `migrate-contact-to-contacts.js`

**Fonction :** Convertit `contactId` → `contactIds[]`

**Usage :**
```bash
# Test en mode simulation
node scripts/migrate-contact-to-contacts.js --dry-run --verbose

# Migration réelle
node scripts/migrate-contact-to-contacts.js --verbose
```

**Ce que fait le script :**
1. 🔍 **Analyse** les concerts existants
2. 📊 **Identifie** ceux avec `contactId` mais sans `contactIds`
3. 🔄 **Convertit** par lots pour éviter les timeouts
4. 🔗 **Met à jour** les relations bidirectionnelles
5. ✅ **Vérifie** que la migration s'est bien passée

**Transformation appliquée :**
```javascript
// AVANT
{
  contactId: "contact-abc-123",
  contactIds: undefined
}

// APRÈS
{
  contactId: null,                    // Supprimé
  contactIds: ["contact-abc-123"],    // Nouveau format
  contactId_migrated: "contact-abc-123" // Sauvegarde pour rollback
}
```

### 2. Script de Test : `test-migration.js`

**Fonction :** Valide la logique de migration

**Usage :**
```bash
node scripts/test-migration.js
```

**Tests effectués :**
- ✅ Structure d'analyse des données
- ✅ Format de transformation
- ✅ Relations bidirectionnelles
- ✅ Processus de rollback

### 3. Script de Rollback : `rollback-contact-migration.js`

**Fonction :** Annule la migration en cas de problème

**Usage :**
```bash
# Test du rollback
node scripts/rollback-contact-migration.js --dry-run

# Rollback réel (⚠️ ATTENTION)
node scripts/rollback-contact-migration.js
```

**⚠️ ATTENTION :** Le rollback ne conserve que le premier contact !

## 🚀 Procédure de Migration

### Étape 1 : Préparation

```bash
# 1. Backup de la base de données
firebase firestore:export gs://your-bucket/backup-$(date +%Y%m%d)

# 2. Vérifier l'environnement
echo $VITE_FIREBASE_PROJECT_ID

# 3. Installer les dépendances si nécessaire
npm install firebase
```

### Étape 2 : Tests

```bash
# 1. Lancer les tests de validation
node scripts/test-migration.js

# 2. Simulation de la migration
node scripts/migrate-contact-to-contacts.js --dry-run --verbose
```

**Vérifier dans les logs :**
- 📊 Nombre de concerts à migrer
- 📋 Liste détaillée des concerts
- 🔗 Relations bidirectionnelles identifiées

### Étape 3 : Migration Réelle

```bash
# 1. Migration avec logs détaillés
node scripts/migrate-contact-to-contacts.js --verbose

# 2. Vérifier le rapport final
# - Concerts migrés : X
# - Relations mises à jour : Y
# - Erreurs : Z (doit être 0)
```

### Étape 4 : Validation Post-Migration

1. **Dans l'application :**
   - ✅ Créer un nouveau concert avec plusieurs contacts
   - ✅ Modifier un concert existant
   - ✅ Vérifier l'affichage des contacts multiples

2. **Dans la console Firebase :**
   - ✅ Vérifier que `contactIds` est un array
   - ✅ Vérifier que `contactId` est `null`
   - ✅ Vérifier les relations bidirectionnelles

## 📊 Métriques de Réussite

- ✅ **100%** des concerts migrés sans erreur
- ✅ **0** relation bidirectionnelle cassée
- ✅ **0** perte de données
- ✅ **Performance** maintenue ou améliorée

## 🚨 Plan de Rollback

Si problème critique détecté :

```bash
# 1. Immédiatement arrêter les nouvelles créations
# (maintenance mode dans l'app si possible)

# 2. Lancer le rollback
node scripts/rollback-contact-migration.js --dry-run
node scripts/rollback-contact-migration.js

# 3. Redéployer la version précédente du code
git checkout previous-version
npm run build && firebase deploy

# 4. Restaurer le backup Firebase si nécessaire
firebase firestore:import gs://your-bucket/backup-YYYYMMDD
```

**⚠️ Important :** Le rollback ne conserve que le **premier contact** de chaque concert !

## 🔍 Diagnostic et Débogage

### Commandes Utiles

```bash
# Analyser sans migrer
node scripts/migrate-contact-to-contacts.js --dry-run

# Vérifier un concert spécifique dans Firebase Console
# concerts/[concert-id] → contactId vs contactIds

# Vérifier les relations bidirectionnelles
# contacts/[contact-id] → concertsIds
```

### Erreurs Communes

1. **"Utilisateur non authentifié"**
   ```bash
   # Solution : Configurer les credentials Firebase
   export GOOGLE_APPLICATION_CREDENTIALS="path/to/service-account.json"
   ```

2. **"Contact non trouvé"**
   - Le concert référence un contact supprimé
   - Migration continue, relation nettoyée automatiquement

3. **"Timeout lors du batch"**
   - Réduire `BATCH_SIZE` dans le script
   - Relancer la migration (reprend automatiquement)

## 📈 Monitoring Post-Migration

### Surveillances Recommandées

1. **Performance :**
   - Temps de chargement des concerts
   - Temps de recherche de contacts

2. **Intégrité :**
   - Vérifier les logs d'erreur
   - Surveiller les créations de nouveaux concerts

3. **Fonctionnel :**
   - Tests utilisateurs sur les formulaires
   - Envoi d'emails aux contacts multiples

## 📝 Logs et Rapports

Chaque exécution génère un rapport détaillé :

```
📋 RAPPORT FINAL DE MIGRATION
===============================
Mode d'exécution: LIVE
Concerts totaux: 156
Concerts à migrer: 12
Concerts migrés: 12
Relations bidirectionnelles mises à jour: 12
Erreurs: 0

✅ Migration terminée avec succès !
```

## ✅ Checklist de Migration

- [ ] 🔧 **Préparation**
  - [ ] Backup base de données
  - [ ] Configuration Firebase OK
  - [ ] Scripts testés en local

- [ ] 🧪 **Tests**
  - [ ] `test-migration.js` réussi
  - [ ] `--dry-run` validé
  - [ ] Rapport de simulation OK

- [ ] 🚀 **Migration**
  - [ ] Script principal exécuté
  - [ ] Rapport final sans erreur
  - [ ] Relations vérifiées

- [ ] ✅ **Validation**
  - [ ] Tests fonctionnels OK
  - [ ] Performance acceptable
  - [ ] Aucune régression détectée

## 🎯 Résultat Attendu

Après cette migration :

**Avant :**
```javascript
// Concert avec un seul contact
{
  id: "concert-1",
  nom: "Festival d'été",
  contactId: "contact-organisateur"
}
```

**Après :**
```javascript
// Concert avec support multi-contacts
{
  id: "concert-1", 
  nom: "Festival d'été",
  contactId: null,
  contactIds: ["contact-organisateur"],
  contactId_migrated: "contact-organisateur" // Pour rollback
}
```

**Impact :**
- ✅ **Flexibilité** : Concerts peuvent avoir plusieurs organisateurs
- ✅ **Cohérence** : Même système que lieux et structures
- ✅ **Évolutivité** : Préparé pour les futures fonctionnalités
- ✅ **Sécurité** : Migration réversible avec sauvegarde

---

*Document créé le 11 janvier 2025 - Phase 6 de l'unification des contacts*