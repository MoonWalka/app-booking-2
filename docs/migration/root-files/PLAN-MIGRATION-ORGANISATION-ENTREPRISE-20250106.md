# Plan de migration : Organisation → Entreprise
**Date : 06/01/2025**

## 🎯 Objectif
Renommer "organisation" en "entreprise" dans toute l'application tout en préservant les fonctionnalités multi-tenant.

## ⚠️ Fonctionnalités critiques à préserver

### 1. Multi-tenant
- Un utilisateur peut appartenir à plusieurs entreprises
- Switch entre entreprises via `EntrepriseSelector`
- Isolation stricte des données par entreprise

### 2. Collections organisationnelles
- Pattern actuel : `{collection}_org_{entrepriseId}`
- Nouveau pattern : `{collection}_ent_{entrepriseId}`
- Maintenir la rétrocompatibilité pendant la migration

### 3. Permissions et rôles
- owner, admin, member
- Fonctions `isOwner()`, `isAdmin()`
- Vérifications d'accès

## 📋 Phase 1 : Préparation (Jour 1)

### 1.1 Création des alias
```javascript
// Dans OrganizationContext.js
export const EntrepriseContext = OrganizationContext;
export const useEntreprise = useOrganization;

// Dans firebase-service.js
export const getEntCollection = getOrgCollection;
export const getCurrentEntreprise = getCurrentOrganization;
```

### 1.2 Nouveau contexte avec rétrocompatibilité
- [ ] Créer `EntrepriseContext.js` qui hérite de `OrganizationContext`
- [ ] Mapper toutes les propriétés :
  - `currentOrg` → `currentEntreprise` (avec alias)
  - `userOrgs` → `userEntreprises` (avec alias)
  - `switchOrganization` → `switchEntreprise` (avec alias)

### 1.3 Tests de non-régression
- [ ] Créer suite de tests pour vérifier :
  - Switch entre entreprises
  - Isolation des données
  - Permissions
  - LocalStorage

## 📋 Phase 2 : Migration progressive (Jour 2)

### 2.1 Services et hooks
- [ ] Créer nouveaux services avec ancien nom en alias :
  ```javascript
  // entrepriseService.js
  export const organizationService = entrepriseService; // Alias
  ```

### 2.2 Composants UI
- [ ] `OrganizationSelector` → `EntrepriseSelector`
- [ ] Garder l'ancien composant qui importe le nouveau
- [ ] Mettre à jour les labels progressivement

### 2.3 Firebase Functions
- [ ] Créer nouvelles fonctions avec pattern `_ent_`
- [ ] Fallback automatique vers `_org_` si pas de données

### 2.4 LocalStorage migration
```javascript
// Migration automatique au démarrage
const migrateLocalStorage = () => {
  const orgId = localStorage.getItem('currentEntrepriseId');
  if (orgId && !localStorage.getItem('currentEntrepriseId')) {
    localStorage.setItem('currentEntrepriseId', orgId);
  }
};
```

## 📋 Phase 3 : Basculement (Jour 3)

### 3.1 Migration de la base de données
- [ ] Script pour copier `organizations` → `entreprises`
- [ ] Ajouter champ `_migrated: true`
- [ ] Dupliquer les références dans les documents

### 3.2 Mise à jour des routes
- [ ] `/parametres/organisations` → `/parametres/entreprises`
- [ ] Redirections automatiques pour les anciennes URLs

### 3.3 Événements
- [ ] Émettre les deux événements pendant la transition :
  ```javascript
  window.dispatchEvent(new CustomEvent('organizationChanged', { detail }));
  window.dispatchEvent(new CustomEvent('entrepriseChanged', { detail }));
  ```

## 📋 Phase 4 : Nettoyage (Semaine suivante)

### 4.1 Suppression des alias
- [ ] Retirer les imports d'alias
- [ ] Supprimer les anciens fichiers
- [ ] Nettoyer les commentaires

### 4.2 Documentation
- [ ] Mettre à jour la documentation
- [ ] README et guides utilisateur
- [ ] Commentaires dans le code

## 🔧 Scripts de migration

### 1. Migration des collections
```javascript
// migrateCollections.js
const migrateOrgToEnt = async () => {
  const collections = ['artistes', 'dates', 'contacts', ...];
  
  for (const col of collections) {
    const orgDocs = await db.collection(`${col}_org_${orgId}`).get();
    
    for (const doc of orgDocs.docs) {
      await db.collection(`${col}_ent_${orgId}`)
        .doc(doc.id)
        .set({
          ...doc.data(),
          entrepriseId: orgId, // Garder pour compat
          entrepriseId: orgId    // Nouveau champ
        });
    }
  }
};
```

### 2. Migration des champs
```javascript
// migrateFields.js
const migrateEntrepriseIdFields = async () => {
  const collections = ['users', 'invitations', ...];
  
  for (const col of collections) {
    const docs = await db.collection(col)
      .where('entrepriseId', '!=', null)
      .get();
    
    const batch = db.batch();
    docs.forEach(doc => {
      batch.update(doc.ref, {
        entrepriseId: doc.data().entrepriseId
      });
    });
    
    await batch.commit();
  }
};
```

## ✅ Checklist de validation

### Avant chaque phase
- [ ] Backup complet de la base de données
- [ ] Tests sur environnement de staging
- [ ] Communication aux utilisateurs

### Tests fonctionnels
- [ ] Création de compte avec première entreprise
- [ ] Switch entre entreprises
- [ ] Création de données dans chaque entreprise
- [ ] Vérification de l'isolation
- [ ] Permissions par rôle
- [ ] Invitation de membres
- [ ] Déconnexion/reconnexion

### Tests techniques
- [ ] LocalStorage migration
- [ ] Collections _org_ → _ent_
- [ ] Événements JS
- [ ] URLs et routes
- [ ] API calls
- [ ] Analytics tracking

## 🚨 Rollback plan

En cas de problème :
1. Les alias permettent un retour rapide
2. Les données sont dupliquées, pas supprimées
3. Script de rollback prêt :
   ```javascript
   // rollback.js
   const rollbackToOrg = async () => {
     // Restaurer localStorage
     // Réactiver les anciennes routes
     // Pointer vers collections _org_
   };
   ```

## 📊 Métriques de succès

- Aucune perte de données
- Aucune interruption de service
- Temps de migration < 5 secondes par utilisateur
- 100% des tests passent
- Aucun ticket support lié à la migration

---
*Ce plan assure une migration sécurisée en préservant toutes les fonctionnalités multi-tenant*