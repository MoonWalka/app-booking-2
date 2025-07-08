# Audit complet : Renommage Organisation → Entreprise

## Vue d'ensemble

Cet audit identifie toutes les références à "organisation" qui doivent être renommées en "entreprise" dans le projet TourCraft.

## État de la migration - 8 Juillet 2025 - VÉRIFICATION FINALE

⚠️ **ATTENTION : Migration partiellement complète - 52 fichiers restants**

### ✅ Éléments déjà migrés :

1. **Contexte principal** : 
   - `OrganizationContext` → `EntrepriseContext` ✓
   - `useOrganization` → `useEntreprise` ✓
   - `currentOrg` → `currentEntreprise` ✓
   - `userOrgs` → `userEntreprises` ✓

2. **Hook multi-entreprise** :
   - `useMultiOrgQuery` → `useMultiEntQuery` ✓
   - Préfixe `_org_` → `_ent_` ✓

3. **Sélecteur d'entreprise** :
   - `OrganizationSelector` → `EntrepriseSelector` ✓

4. **Onboarding** :
   - `OnboardingFlow.js` : Toutes les références migrées ✓
   - Textes UI : "organisation" → "entreprise" ✓
   - Variables : `orgData` → `entrepriseData` ✓

5. **Utilisation dans le code** :
   - 116 fichiers utilisent maintenant `useEntreprise` ✓
   - Faute de frappe `currentEntrepriseanization` corrigée ✓

6. **Structure de dossiers** :
   - `/src/components/organization/` → `/src/components/entreprise/` ✓
   - Tous les imports mis à jour ✓

7. **Variables et paramètres** (hors Firebase) :
   - `entrepriseId` → `entrepriseId` dans le code applicatif ✓
   - `orgId` → `entrepriseId` dans les callbacks ✓
   - Messages et commentaires mis à jour ✓

### ❌ Éléments restants :

1. **52 fichiers contiennent encore "organization" (192 occurrences)** :
   - `EntrepriseContextDiagnostic.js` - 25 occurrences (variables locales)
   - `brevoEmailIntegration.test.js` - 11 occurrences
   - `factureService.js` - 10 occurrences
   - `ParametresPage.js` - 10 occurrences
   - Et 48 autres fichiers...

2. **Collections Firestore** (reporté volontairement) :
   - Collection `organizations` → `entreprises`
   - Collection `user_organizations` → `user_entreprises`
   - Collection `organization_invitations` → `entreprise_invitations`
   - Conservées pour compatibilité avec les données existantes

3. **Types d'occurrences restantes** :
   - Variables locales : `organizationContext` dans les diagnostics
   - Tests : références dans les tests d'intégration
   - Services : références dans factureService.js
   - Configuration : références aux collections Firebase

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
  - `entrepriseId` (field) → `entrepriseId`
  - `_org_` (prefix) → `_ent_`
  - Logs et commentaires

## 2. Services Firebase

### firebase-service.js
- **Fichier** : `/src/services/firebase-service.js`
- **Éléments à renommer** :
  - `currentEntrepriseId` → `currentEntrepriseId`
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
  - LocalStorage key `currentEntrepriseId` → `currentEntrepriseId`

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

## 4. Workflow d'Onboarding

### OnboardingFlow.js
- **Fichier** : `/src/components/organization/OnboardingFlow.js`
- **Éléments à renommer** :
  - `OnboardingFlow` → `OnboardingFlow` (garder le nom, changer le contenu)
  - `orgData` → `entrepriseData`
  - `handleCreateOrganization` → `handleCreateEntreprise`
  - `handleJoinOrganization` → `handleJoinEntreprise`
  - `createOrganization` → `createEntreprise`
  - `joinOrganization` → `joinEntreprise`
  - `loadUserOrganizations` → `loadUserEntreprises`

### Textes UI de l'onboarding
- **Étapes à modifier** :
  - "Créer une organisation" → "Créer une entreprise"
  - "Rejoindre une organisation" → "Rejoindre une entreprise"
  - "Nom de l'organisation" → "Nom de l'entreprise"
  - "Type d'organisation" → "Type d'entreprise"
  - "Description de l'organisation" → "Description de l'entreprise"
  - "Créer l'organisation" → "Créer l'entreprise"
  - "Rejoindre l'organisation" → "Rejoindre l'entreprise"
  - "Code d'invitation pour rejoindre l'organisation" → "Code d'invitation pour rejoindre l'entreprise"

### Types d'entreprise dans l'onboarding
- **Options du select à adapter** :
  - `venue` → `salle_spectacle`
  - `festival` → `festival`
  - `booking_agency` → `agence_booking`
  - `artist_management` → `management_artistes`
  - `production` → `production`
  - `other` → `autre`

### Messages et descriptions
- **Textes à modifier** :
  - "Vous êtes responsable d'une salle, d'un festival ou d'une agence ? Créez votre organisation pour commencer." → "Vous êtes responsable d'une salle, d'un festival ou d'une agence ? Créez votre entreprise pour commencer."
  - "Vous avez reçu une invitation ? Utilisez votre code pour rejoindre une organisation existante." → "Vous avez reçu une invitation ? Utilisez votre code pour rejoindre une entreprise existante."
  - "Pour commencer, vous devez créer ou rejoindre une organisation" → "Pour commencer, vous devez créer ou rejoindre une entreprise"

### Variables d'état
- **État local à renommer** :
  - `orgData` → `entrepriseData`
  - `orgData.name` → `entrepriseData.name`
  - `orgData.type` → `entrepriseData.type`
  - `orgData.description` → `entrepriseData.description`
  - `orgData.settings` → `entrepriseData.settings`

### Fonctions de gestion
- **Fonctions à adapter** :
  - `handleCreateOrganization` → `handleCreateEntreprise`
  - `handleJoinOrganization` → `handleJoinEntreprise`
  - Appels vers `createOrganization` → `createEntreprise`
  - Appels vers `joinOrganization` → `joinEntreprise`

## 5. Routes et Navigation

### Routes à modifier
- `/parametres/organisations` → `/parametres/entreprises`
- `/onboarding` (paramètres liés aux organisations)
- Tous les liens vers ces routes

## 6. Base de données Firestore

### Collections à renommer
- `organizations` → `entreprises`
- `organization_invitations` → `entreprise_invitations`
- `user_organizations` → `user_entreprises`
- Collections avec suffixe `_org_` → `_ent_`

### Champs à renommer dans les documents
- `entrepriseId` → `entrepriseId`
- `defaultOrganization` → `defaultEntreprise`
- Références dans les membres, invitations, etc.

## 7. Autres fichiers impactés

### Services
- Tous les services utilisant `entrepriseId` ou accédant aux collections org
- Services de contacts, factures, contrats, etc.

### Hooks
- Hooks utilisant `useOrganization` ou `entrepriseId`
- Hooks de recherche et de données

### Composants de debug
- `EntrepriseIdFixer.js`
- `OrganizationContextDiagnostic.js`
- `ArtisteOrganizationMatcher.js`
- Autres outils de debug

### Tests
- Fichiers de test mentionnant organization
- Mocks et fixtures

## 8. Plan de migration recommandé

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
2. Mettre à jour tous les `entrepriseId` → `entrepriseId`
3. Nettoyer les anciennes collections

### Phase 4 : Nettoyage
1. Supprimer les alias de rétrocompatibilité
2. Supprimer les anciennes collections
3. Mettre à jour la documentation

### Phase 5 : Migration de l'Onboarding (NOUVELLE PHASE)
1. **Modifier OnboardingFlow.js** :
   - Renommer toutes les variables `orgData` → `entrepriseData`
   - Mettre à jour tous les textes UI
   - Adapter les appels de fonctions
   - Modifier les types d'entreprise

2. **Mettre à jour les services d'onboarding** :
   - `createOrganization` → `createEntreprise`
   - `joinOrganization` → `joinEntreprise`
   - `loadUserOrganizations` → `loadUserEntreprises`

3. **Adapter les messages utilisateur** :
   - Tous les textes d'aide et d'erreur
   - Messages de confirmation
   - Descriptions des étapes

4. **Tester le workflow complet** :
   - Création d'entreprise via onboarding
   - Rejoindre une entreprise
   - Initialisation des collaborateurs
   - Synchronisation avec le nouveau système

## 9. Points d'attention

- **LocalStorage** : Les utilisateurs devront se reconnecter après la migration
- **URLs** : Les liens partagés vers `/parametres/organisations` devront être redirigés
- **Événements** : Les listeners sur `organizationChanged` devront être mis à jour
- **Multi-tenant** : S'assurer que le système multi-entreprise continue de fonctionner
- **Permissions** : Vérifier que les rôles et permissions restent intacts
- **Onboarding** : S'assurer que le workflow de création d'entreprise fonctionne correctement
- **Compatibilité** : Maintenir la compatibilité avec les données existantes pendant la transition

## 10. Estimation et Statut Final

### Travail accompli :
- **116 fichiers** migrés automatiquement (imports EntrepriseContext)
- **240 fichiers** migrés pour organizationId → entrepriseId
- **18 fichiers debug** supprimés
- **Contexte, hooks et composants** : 100% migrés
- **Onboarding** : 100% migré

### Travail restant :
- **52 fichiers** avec 192 occurrences de "organization"
- Principalement dans :
  - Tests d'intégration
  - Outils de diagnostic
  - Services (factureService.js)
  - Références aux collections Firebase

### Recommandations :
1. **Prioriser** : Les 52 fichiers restants sont majoritairement des tests et outils de debug
2. **Collections Firebase** : Garder les noms actuels jusqu'à une migration des données
3. **Variables locales** : Certaines occurrences dans EntrepriseContextDiagnostic.js sont des variables locales qui pourraient rester ainsi pour la clarté du code

### Conclusion :
La migration est fonctionnellement complète à **~80%**. Les éléments critiques (contexte, hooks, composants UI) sont tous migrés. Les occurrences restantes sont principalement dans des fichiers non critiques ou sont liées aux collections Firebase.