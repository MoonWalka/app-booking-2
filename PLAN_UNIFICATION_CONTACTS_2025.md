# Plan d'Unification du Système de Gestion des Contacts - Janvier 2025

## 📋 Résumé Exécutif

**Objectif** : Unifier la gestion des contacts pour toutes les entités (concerts, lieux, structures) en utilisant un système cohérent basé sur des tableaux (`contactIds`).

**Problème actuel** :
- Concert utilise `contactId` (1 seul contact)
- Lieu utilise `contactIds` (tableau)
- Structure utilise `contactsIds` (tableau)
- Interface suggère multi-contacts mais ne sauvegarde qu'un seul pour Concert

**Solution** : Migration vers `contactIds` (tableau) partout avec un composant unifié.

## 🔍 Audit Détaillé

### État Actuel du Système

| Entité | Champ Actuel | Type | Multi-contacts | Bidirectionnel |
|--------|--------------|------|----------------|----------------|
| Concert | contactId | String | ❌ | ✅ |
| Lieu | contactIds | Array | ✅ | ✅ |
| Structure | contactsIds | Array | ✅ | ✅ |

### Infrastructure Existante

✅ **Points Positifs** :
- `bidirectionalRelationsService` gère déjà les relations 1-1 et 1-N
- Les composants de sélection supportent déjà plusieurs contacts
- Les règles Firestore n'ont pas besoin de modification
- Le système de relations inverses fonctionne

⚠️ **Points d'Attention** :
- 30+ fichiers référencent `contactId` (singulier)
- Incohérence dans les noms (contactIds vs contactsIds)
- Duplication de code entre ContactSearchSection et LieuContactSearchSection

### Impact de la Migration

**Fichiers à Modifier** :

1. **Hooks** (10+ fichiers) :
   - `/src/hooks/concerts/useConcertForm.js`
   - `/src/hooks/concerts/useConcertFormWithRelations.js`
   - `/src/hooks/concerts/useConcertDetails.js`
   - Tous les hooks spécifiques aux concerts

2. **Composants** (20+ fichiers) :
   - `/src/components/concerts/ConcertForm.js`
   - `/src/components/concerts/ConcertDetails.js`
   - `/src/components/concerts/sections/ContactSearchSection.js`
   - Tous les composants affichant des contacts

3. **Services** (5 fichiers) :
   - `/src/services/concertService.js`
   - `/src/services/emailService.js`
   - `/src/services/pdfService.js`
   - `/src/services/bidirectionalRelationsService.js`
   - `/src/services/syncService.js`

4. **Configuration** :
   - `/src/config/entityConfigurations.js`

### Matrice de Risques

| Risque | Probabilité | Impact | Mitigation |
|--------|-------------|--------|------------|
| Perte de données lors migration | Faible | Élevé | Script avec validation + backup |
| Relations bidirectionnelles cassées | Moyen | Moyen | Tests exhaustifs du service |
| Régression fonctionnelle | Moyen | Moyen | Tests E2E avant mise en prod |
| Performance dégradée | Faible | Faible | Index Firestore sur contactIds |
| Incompatibilité anciens concerts | Moyen | Faible | Gestion rétrocompatible |

## ✅ Checklist de Migration

### Phase 0 : Préparation (Jour 1)

- [x] Créer une branche `feature/unified-contact-system`
- [x] Faire un backup complet de la base de données
  ```
  Note : En dev avec peu de données, backup manuel suffisant
  ```
- [x] Documenter l'état actuel avec captures d'écran
  ```
  Diagnostic exporté : 3 concerts avec contactId, 0 avec contactIds
  ```
- [x] Créer le script de diagnostic initial :
  ```javascript
  // Compter les concerts avec contactId
  // Identifier les données orphelines
  // Vérifier les relations bidirectionnelles existantes
  ```
- [x] Exécuter l'audit complet dans `/debug-tools`
- [x] Noter tous les IDs de test pour validation post-migration
  ```
  Résultats : 3 concerts à migrer, 0 conflits, relations OK
  ```

### Phase 1 : Création du Composant Unifié (Jours 2-3)

- [x] Créer `/src/components/common/UnifiedContactSelector.js`
  - [x] Props : `multiple` (boolean), `value` (string ou array), `onChange`
  - [x] Gestion du mode mono/multi contact
  - [x] Import des fonctionnalités de ContactSearchSection et LieuContactSearchSection
  
- [x] Créer les tests unitaires du composant
  - [x] Tests complets dans `__tests__/UnifiedContactSelector.test.js`
  - [x] Couverture : modes lecture/édition, mono/multi, normalisation, erreurs
- [x] Créer la documentation du composant
  - [x] Documentation complète dans `/docs/components/UnifiedContactSelector.md`
  - [x] Exemples d'utilisation et guide de migration
- [x] Tester en isolation avec Storybook ou page de test
  - [x] Page de test créée : `/debug-tools` → "Test UnifiedContactSelector"
  - [x] Tests interactifs pour toutes les configurations

### Phase 2 : Adaptation de la Configuration (Jour 4)

- [x] Modifier `/src/config/entityConfigurations.js` :
  ```javascript
  // Concert : changer contactId → contactIds
  contact: {
    collection: 'contacts',
    field: 'contactIds', // était 'contactId'
    isArray: true,      // était false
    displayName: 'Contacts',
    bidirectional: true,
    inverseField: 'concertsIds'
  }
  ```
  - [x] Configuration Concert adaptée pour multi-contacts
  - [x] Section d'affichage mise à jour (cards au pluriel)

- [x] Vérifier toutes les configurations d'entités
  - [x] Concert : `contactId` → `contactIds` ✅
  - [x] Lieu : déjà `contactIds` ✅
  - [x] Structure : `contactsIds` → `contactIds` ✅
  - [x] Contact : relation inverse mise à jour ✅
  
- [x] Harmoniser `contactsIds` → `contactIds` pour Structure
  - [x] Champ principal harmonisé
  - [x] Relation inverse dans Contact mise à jour
  - [x] Documentation des changements créée

### Phase 3 : Migration des Hooks (Jours 5-6)

#### Hooks de Formulaire

- [x] **useConcertForm.js** :
  - [x] Remplacer `contactId` par `contactIds`
  - [x] Adapter `handleContactChange` pour gérer un tableau
  - [x] Initialiser avec `contactIds: []` au lieu de `contactId: null`
  - [x] Ajouter `handleContactsChange` pour multi-contacts
  - [x] Migration automatique dans `transformConcertData`
  - [x] Gestion des relations bidirectionnelles pour arrays

- [x] **useConcertFormWithRelations.js** :
  - [x] Adapter le chargement des contacts (tableau)
  - [x] Modifier la logique de sauvegarde
  - [x] État `contacts` au lieu de `contact`
  - [x] Rétrocompatibilité maintenue

- [x] **useGenericEntityForm.js** :
  - [x] Vérifier la gestion des tableaux ✅
  - [x] S'assurer que handleFieldChange gère les arrays ✅
  - [x] Hook déjà assez flexible, pas de modification nécessaire

#### Hooks de Détails

- [x] **useConcertDetails.js** :
  - [x] Charger `contactIds` au lieu de `contactId`
  - [x] Adapter l'affichage pour plusieurs contacts
  - [x] Configuration relation `one-to-many`
  - [x] Fonction `normalizeIds` pour rétrocompatibilité
  - [x] Gestion des relations bidirectionnelles multiples
  - [x] Export de `contacts` (array) et `contact` (rétrocompat)

### Phase 4 : Migration des Composants (Jours 7-8)

#### Formulaires

- [x] **ConcertForm.js** :
  - [x] Remplacer ContactSearchSection par UnifiedContactSelector
  - [x] Passer `multiple={true}` au sélecteur
  - [x] Adapter handleContactChange
  - [x] Supprimer la logique de recherche de contacts
  - [x] Utiliser handleContactsChange du hook

- [x] **LieuForm.js** :
  - [x] Remplacer LieuContactSearchSection par UnifiedContactSelector
  - [x] Vérifier que tout fonctionne encore
  - [x] Configuration pour multi-contacts

#### Affichage

- [x] **ConcertDetails.js** :
  - [x] Wrapper qui délègue à ConcertViewWithRelances
  - [x] Pas de modification nécessaire

- [x] **ConcertViewWithRelances.js** :
  - [x] Afficher tous les contacts (pas juste le premier)
  - [x] Adapter la section contacts avec map()
  - [x] Gérer les labels "Organisateur 1, 2, etc."
  - [x] Rétrocompatibilité avec contact singulier

- [x] **ConcertInfoSection.js** :
  - [x] Ne gère pas les contacts, pas de modification nécessaire

### Phase 5 : Migration des Services (Jour 9) ✅

- [x] **bidirectionalRelationsService.js** :
  - [x] Vérifier la compatibilité avec le nouveau format ✅ **Déjà compatible !**
  - [x] Le service gère parfaitement `isArray: true` avec `arrayUnion()`
  - [x] Relations bidirectionnelles multiples fonctionnelles

- [x] **concertService.js** :
  - [x] Fichier vide, pas d'adaptation nécessaire ✅
  - [x] Les opérations CRUD passent par les hooks génériques

- [x] **emailService.js** :
  - [x] Adapter la documentation pour plusieurs destinataires ✅
  - [x] Ajouter méthode `sendToConcertContacts(contacts, emailData)` ✅
  - [x] Ajouter méthode `extractContactEmails(contacts)` ✅
  - [x] Support `to` comme string ou array partout ✅

### Phase 6 : Script de Migration des Données (Jour 10) ✅

- [x] **migrate-contact-to-contacts.js** :
  - [x] Script principal de migration avec options `--dry-run` et `--verbose` ✅
  - [x] Migration par lots pour éviter les timeouts ✅
  - [x] Gestion des relations bidirectionnelles ✅
  - [x] Sauvegarde des données originales (`contactId_migrated`) ✅
  - [x] Validation et vérification post-migration ✅

- [x] **test-migration.js** :
  - [x] Script de test et validation ✅
  - [x] Tests du format de données ✅
  - [x] Tests des relations bidirectionnelles ✅
  - [x] Validation du processus de rollback ✅

- [x] **rollback-contact-migration.js** :
  - [x] Script de rollback sécurisé ✅
  - [x] Restauration depuis `contactId_migrated` ✅
  - [x] Gestion des relations bidirectionnelles inverses ✅
  - [x] Confirmation et délai de sécurité ✅

- [x] **Documentation complète** :
  - [x] Guide de migration détaillé (`PHASE6_DATA_MIGRATION_GUIDE.md`) ✅
  - [x] Procédure step-by-step ✅
  - [x] Plan de rollback ✅
  - [x] Diagnostic et débogage ✅

### Phase 7 : Exécution de la Migration (Jour 11)

- [ ] **Backup** :
  - [ ] Export Firestore complet
  - [ ] Sauvegarder les scripts de migration

- [ ] **Migration** :
  - [ ] Exécuter le script en mode dry-run
  - [ ] Vérifier les résultats
  - [ ] Exécuter la migration réelle
  - [ ] Valider les relations bidirectionnelles

- [ ] **Validation** :
  - [ ] Vérifier 10 concerts au hasard
  - [ ] Tester la création d'un nouveau concert
  - [ ] Tester la modification d'un concert existant

### Phase 8 : Tests et Validation (Jours 12-13)

#### Tests Fonctionnels

- [ ] **Concerts** :
  - [ ] Créer un concert avec 0 contact
  - [ ] Créer un concert avec 1 contact
  - [ ] Créer un concert avec 3 contacts
  - [ ] Modifier les contacts d'un concert existant
  - [ ] Supprimer un contact d'un concert

- [ ] **Relations Bidirectionnelles** :
  - [ ] Vérifier qu'un contact ajouté à un concert apparaît dans le contact
  - [ ] Vérifier qu'un contact supprimé d'un concert disparaît du contact
  - [ ] Tester avec Lieux et Structures

- [ ] **Rétrocompatibilité** :
  - [ ] Les anciens concerts s'affichent correctement
  - [ ] Les URLs ne sont pas cassées
  - [ ] Les PDF se génèrent correctement

#### Tests de Performance

- [ ] Charger une liste de 100+ concerts
- [ ] Rechercher des contacts dans un concert
- [ ] Vérifier les temps de chargement

### Phase 9 : Nettoyage (Jour 14)

- [ ] **Supprimer les composants obsolètes** :
  - [ ] ContactSearchSection (remplacé par UnifiedContactSelector)
  - [ ] LieuContactSearchSection (remplacé par UnifiedContactSelector)
  - [ ] Autres doublons identifiés

- [ ] **Nettoyer le code** :
  - [ ] Rechercher toutes les références à `contactId`
  - [ ] Supprimer le code mort
  - [ ] Mettre à jour les commentaires

- [ ] **Documentation** :
  - [ ] Mettre à jour le README
  - [ ] Documenter le nouveau système
  - [ ] Créer un guide de migration

### Phase 10 : Déploiement (Jour 15)

- [ ] **Pré-production** :
  - [ ] Déployer sur environnement de test
  - [ ] Tests utilisateurs
  - [ ] Corriger les bugs trouvés

- [ ] **Production** :
  - [ ] Planifier la fenêtre de maintenance
  - [ ] Exécuter la migration de données
  - [ ] Déployer le code
  - [ ] Monitorer les erreurs

- [ ] **Post-déploiement** :
  - [ ] Vérifier les logs
  - [ ] Suivre les métriques
  - [ ] Être prêt pour un rollback

## 📊 Métriques de Succès

- ✅ Tous les concerts peuvent avoir plusieurs contacts
- ✅ Les relations bidirectionnelles fonctionnent
- ✅ Pas de perte de données
- ✅ Performance maintenue ou améliorée
- ✅ Code plus maintenable (1 composant au lieu de 3)

## 🚨 Plan de Rollback

Si problème critique :

1. Restaurer le backup Firestore
2. Redéployer la version précédente
3. Exécuter le script inverse :
   ```javascript
   // Pour chaque concert avec contactIds à 1 élément
   // Recréer contactId = contactIds[0]
   ```

## 📝 Notes Importantes

1. **Contact Principal** : Le premier contact du tableau sera considéré comme principal
2. **Emails** : Les notifications seront envoyées à tous les contacts
3. **PDF** : Affichera "Organisateurs" au pluriel si plusieurs contacts
4. **API** : Vérifier la compatibilité avec les intégrations externes

## 🎯 Résultat Attendu

Après cette migration :
- **Une seule façon** de gérer les contacts (tableau)
- **Un seul composant** de sélection (UnifiedContactSelector)
- **Flexibilité** pour tous les types d'entités
- **Cohérence** dans tout le système

---

*Document créé le 11 janvier 2025 - À mettre à jour pendant la migration*