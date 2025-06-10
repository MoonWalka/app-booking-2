# Sécurité des données RIB dans TourCraft

## Vue d'ensemble

Les données RIB (IBAN, BIC, nom de banque) sont des informations sensibles stockées de manière sécurisée dans Firebase Firestore.

## Architecture de sécurité

### 1. Structure de stockage

Les données RIB sont stockées dans :
```
organizations/{orgId}/settings/entreprise
{
  iban: "FR76...",
  bic: "BNPAFRPP",
  banque: "BNP Paribas",
  // ... autres données d'entreprise
}
```

### 2. Règles d'accès

#### Lecture
- ✅ **Membres de l'organisation** : Peuvent lire les données RIB de leur organisation
- ❌ **Non-membres** : Aucun accès
- ❌ **Autres organisations** : Aucun accès

#### Écriture
- ✅ **Administrateurs/Propriétaires** : Peuvent modifier les données RIB
- ❌ **Membres simples** : Ne peuvent pas modifier
- ❌ **Non-membres** : Aucun accès

### 3. Isolation des données

Chaque organisation a ses propres données RIB complètement isolées :
- **Multi-tenant** : Chaque organisation est un tenant isolé
- **Pas de partage** : Les données ne sont jamais partagées entre organisations
- **Filtre automatique** : L'application filtre automatiquement par `organizationId`

### 4. Règles Firestore appliquées

```javascript
// Règle pour les paramètres d'organisation
match /organizations/{orgId}/settings/{settingDoc} {
  // Lecture : membres uniquement
  allow read: if request.auth != null && 
                isOrgMember(orgId, request.auth.uid);
  
  // Écriture : admins uniquement pour les données sensibles
  allow write: if request.auth != null && 
                 settingDoc in ['entreprise', 'factureParameters'] &&
                 isOrgAdmin(orgId, request.auth.uid);
}
```

## Bonnes pratiques de sécurité

### 1. Côté client (React)
- Les données RIB ne sont jamais stockées dans le localStorage
- Elles transitent uniquement via HTTPS
- Les formulaires utilisent des champs de type `password` pour masquer la saisie

### 2. Côté serveur (Firebase)
- Authentication obligatoire
- Vérification des rôles à chaque accès
- Logs d'audit pour les modifications

### 3. Migration sécurisée
- La migration RIB s'exécute côté client avec les permissions de l'utilisateur
- Aucune élévation de privilèges
- Traçabilité via le flag de migration

## Conformité RGPD

### Droits des utilisateurs
1. **Accès** : Via Paramètres → Entreprise
2. **Modification** : Admins uniquement
3. **Suppression** : Possible via suppression de l'organisation
4. **Portabilité** : Export des données possible

### Minimisation des données
- Seules les données nécessaires sont stockées
- Pas de duplication inutile
- Migration unique pour éviter les doublons

## Audit et monitoring

### Traçabilité
Chaque modification est tracée avec :
- `updatedAt` : Date de modification
- `updatedBy` : Identifiant de l'utilisateur

### Logs de sécurité
Les tentatives d'accès non autorisées sont :
- Bloquées par les règles Firestore
- Loggées dans la console Firebase
- Monitorables via Firebase Analytics

## Recommandations

1. **Ne jamais afficher les RIB complets** dans les logs ou console
2. **Utiliser le débogueur RIB** uniquement en environnement de développement
3. **Former les utilisateurs** à ne partager leurs identifiants avec personne
4. **Activer l'authentification 2FA** pour les comptes administrateurs

## En cas de compromission

1. Révoquer immédiatement les accès suspects
2. Changer les données RIB via l'interface
3. Vérifier les logs d'audit
4. Notifier les utilisateurs concernés