# Audit complet : Renommage Organisation → Entreprise

## Vue d'ensemble

Cet audit identifie toutes les références à "organisation" qui doivent être renommées en "entreprise" dans le projet TourCraft.

## 1. Contexte et Hooks principaux

### OrganizationContext.js
- **Fichier** : `/src/context/OrganizationContext.js`
- **Éléments à renommer** :
  - `OrganizationContext` → `EntrepriseContext`
  - `useOrganization` → `useEntreprise`
  - `OrganizationProvider` → `EntrepriseProvider`
  - `currentOrg` → `currentEntreprise`
  - `userOrgs` → `userEntreprises`
  - `switchOrganization` → `switchEntreprise`
  - `refreshOrganizations` → `refreshEntreprises`
  - `loadUserOrganizations` → `loadUserEntreprises`
  - `hasOrganizations` → `hasEntreprises`
  - `organizationChanged` (event) → `entrepriseChanged`
  - Messages et logs mentionnant "organisation"

### useMultiOrgQuery.js
- **Fichier** : `/src/hooks/useMultiOrgQuery.js`
- **Éléments à renommer** :
  - `useMultiOrgQuery` → `useMultiEntrepriseQuery`
  - `useMultiOrgDocument` → `useMultiEntrepriseDocument`
  - `useMultiOrgMutation` → `useMultiEntrepriseMutation`
  - `organizationId` (field) → `entrepriseId`
  - `_org_` (prefix) → `_ent_`
  - Logs et commentaires

## 2. Services Firebase

### firebase-service.js
- **Fichier** : `/src/services/firebase-service.js`
- **Éléments à renommer** :
  - `currentOrganizationId` → `currentEntrepriseId`
  - `setCurrentOrganization` → `setCurrentEntreprise`
  - `getCurrentOrganization` → `getCurrentEntreprise`
  - `clearCurrentOrganization` → `clearCurrentEntreprise`
  - `getOrgCollection` → `getEntCollection`
  - `getOrgDoc` → `getEntDoc`
  - `createOrganization` → `createEntreprise`
  - `getUserOrganizations` → `getUserEntreprises`
  - `inviteUserToOrganization` → `inviteUserToEntreprise`
  - `updateOrganizationSettings` → `updateEntrepriseSettings`
  - `generateInvitationCode` → fonctions liées aux invitations
  - `joinOrganization` → `joinEntreprise`
  - `getOrganizationMembers` → `getEntrepriseMembers`
  - `leaveOrganization` → `leaveEntreprise`
  - Collection `organizations` → `entreprises`
  - Collection `organization_invitations` → `entreprise_invitations`
  - Collection `user_organizations` → `user_entreprises`
  - LocalStorage key `currentOrganizationId` → `currentEntrepriseId`

## 3. Composants UI

### OrganizationSelector.js
- **Fichier** : `/src/components/organization/OrganizationSelector.js`
- **Éléments à renommer** :
  - `OrganizationSelector` → `EntrepriseSelector`
  - `handleOrganizationChange` → `handleEntrepriseChange`
  - `handleCreateOrganization` → `handleCreateEntreprise`
  - `handleJoinOrganization` → `handleJoinEntreprise`
  - Textes UI : "organisation" → "entreprise"
  - Labels ARIA mentionnant "organisation"
  - IDs des éléments DOM

### ParametresOrganisations.js
- **Fichier** : `/src/components/parametres/ParametresOrganisations.js`
- **Éléments à renommer** :
  - `ParametresOrganisations` → `ParametresEntreprises`
  - `handleLeaveOrganization` → `handleLeaveEntreprise`
  - `handleSetDefaultOrganization` → `handleSetDefaultEntreprise`
  - Messages et textes UI

## 4. Routes et Navigation

### Routes à modifier
- `/parametres/organisations` → `/parametres/entreprises`
- `/onboarding` (paramètres liés aux organisations)
- Tous les liens vers ces routes

## 5. Base de données Firestore

### Collections à renommer
- `organizations` → `entreprises`
- `organization_invitations` → `entreprise_invitations`
- `user_organizations` → `user_entreprises`
- Collections avec suffixe `_org_` → `_ent_`

### Champs à renommer dans les documents
- `organizationId` → `entrepriseId`
- `defaultOrganization` → `defaultEntreprise`
- Références dans les membres, invitations, etc.

## 6. Autres fichiers impactés

### Services
- Tous les services utilisant `organizationId` ou accédant aux collections org
- Services de contacts, factures, contrats, etc.

### Hooks
- Hooks utilisant `useOrganization` ou `organizationId`
- Hooks de recherche et de données

### Composants de debug
- `OrganizationIdFixer.js`
- `OrganizationContextDiagnostic.js`
- `ArtisteOrganizationMatcher.js`
- Autres outils de debug

### Tests
- Fichiers de test mentionnant organization
- Mocks et fixtures

## 7. Plan de migration recommandé

### Phase 1 : Préparation
1. Créer des alias pour la rétrocompatibilité
2. Dupliquer les collections Firestore avec les nouveaux noms
3. Créer un script de migration des données

### Phase 2 : Migration du code
1. Renommer le contexte et les hooks principaux
2. Mettre à jour les services Firebase
3. Modifier les composants UI
4. Ajuster les routes

### Phase 3 : Migration des données
1. Migrer les collections Firestore
2. Mettre à jour tous les `organizationId` → `entrepriseId`
3. Nettoyer les anciennes collections

### Phase 4 : Nettoyage
1. Supprimer les alias de rétrocompatibilité
2. Supprimer les anciennes collections
3. Mettre à jour la documentation

## 8. Points d'attention

- **LocalStorage** : Les utilisateurs devront se reconnecter après la migration
- **URLs** : Les liens partagés vers `/parametres/organisations` devront être redirigés
- **Événements** : Les listeners sur `organizationChanged` devront être mis à jour
- **Multi-tenant** : S'assurer que le système multi-entreprise continue de fonctionner
- **Permissions** : Vérifier que les rôles et permissions restent intacts

## 9. Estimation

- **Fichiers impactés** : ~350+
- **Collections Firestore** : 3 principales + collections avec suffixe
- **Complexité** : Élevée (système central de l'application)
- **Temps estimé** : 2-3 jours pour une migration complète et sûre