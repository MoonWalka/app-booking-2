# Plan de Migration Complète Concert → Date

## Phase 1 : Services Critiques (Firebase Collections)

### 1.1 Services utilisant la collection 'concerts'
- [ ] `contratService.js` - Remplacer toutes les références
- [ ] `preContratService.js` - Migrer concertId → dateId
- [ ] `factureService.js` - Migrer les références
- [ ] `devisService.js` - Vérifier et migrer
- [ ] `firebase-emulator-service.js` - Mettre à jour les seeds
- [ ] `testDataService.js` - Migrer les données de test
- [ ] `testDataServiceSimple.js` - Migrer les données de test
- [ ] `cacheService.js` - Mettre à jour les clés de cache

### 1.2 Hooks utilisant la collection 'concerts'
- [ ] `useContactContrats.js`
- [ ] `useContactFactures.js` 
- [ ] `useSimpleContactDetails.js`
- [ ] `useLieuDetails.js`
- [ ] `useStructureDetails.js`

## Phase 2 : Composants (40 fichiers dans concerts/)

### 2.1 Composants principaux
- [ ] `ConcertView.js` → `DateView.js`
- [ ] `ConcertForm.js` → `DateForm.js`
- [ ] `ConcertsList.js` → `DatesList.js` (déjà fait mais vérifier)
- [ ] `ConcertsCalendar.js` → `DatesCalendar.js`
- [ ] `ConcertsTableView.js` → `DatesTableView.js`

### 2.2 Composants mobiles
- [ ] `mobile/ConcertView.js` → `mobile/DateView.js`
- [ ] `mobile/ConcertForm.js` → `mobile/DateForm.js`
- [ ] `mobile/ConcertBottomTabs.js` → `mobile/DateBottomTabs.js`

### 2.3 Composants sections
- [ ] Tous les fichiers dans `sections/` (environ 15 fichiers)

### 2.4 Renommer le dossier
- [ ] `src/components/concerts/` → `src/components/dates/`

## Phase 3 : Pages et Routes

### 3.1 Pages
- [ ] `ConcertsPage.js` → `DatesPage.js`
- [ ] Mettre à jour les imports dans les pages

### 3.2 Routes (App.js)
- [ ] Remplacer toutes les routes `/concerts` → `/dates`
- [ ] Ajouter des redirections temporaires `/concerts` → `/dates`

## Phase 4 : Configuration

### 4.1 Entity Configurations
- [ ] `entityConfigurations.js` - Sections 'concerts' → 'dates' pour:
  - [ ] Artistes
  - [ ] Lieux
  - [ ] Contacts
  - [ ] Structures

### 4.2 Sidebar et Navigation
- [ ] Vérifier `sidebarConfig.js` (déjà fait mais revérifier)
- [ ] Mettre à jour les breadcrumbs

## Phase 5 : Variables et Propriétés

### 5.1 Props et paramètres
- [ ] `concertId` → `dateId`
- [ ] `concertIds` → `dateIds`
- [ ] `concert` → `date` (objet)
- [ ] `concerts` → `dates` (tableau)
- [ ] `concertData` → `dateData`

### 5.2 Variables dans les fonctions
- [ ] Rechercher et remplacer dans tous les fichiers

## Phase 6 : Utilitaires et Tests

### 6.1 Utilitaires
- [ ] `concertsDiagnostic.js` → `datesDiagnostic.js`
- [ ] `fixBidirectionalRelationsBrowser.js` - Mettre à jour

### 6.2 Tests
- [ ] Mettre à jour les tests unitaires
- [ ] Mettre à jour les tests d'intégration

## Phase 7 : Debug et Outils

### 7.1 Composants de debug
- [ ] `ConcertContactsDebug.js`
- [ ] Autres fichiers de debug utilisant 'concerts'

## Phase 8 : Documentation et Commentaires

### 8.1 Documentation
- [ ] README files
- [ ] Commentaires JSDoc
- [ ] Messages utilisateur et labels

## Ordre d'Exécution Recommandé

1. **Phase 1** - Services critiques (pour que l'app fonctionne)
2. **Phase 4** - Configuration (pour la cohérence)
3. **Phase 3** - Routes (pour la navigation)
4. **Phase 2** - Composants (renommage en masse)
5. **Phase 5** - Variables (nettoyage)
6. **Phase 6-8** - Finalisation

## Commandes Utiles

```bash
# Rechercher toutes les occurrences
grep -r "concert" src --include="*.js" --include="*.jsx"

# Renommer en masse (avec prudence)
find src -name "*Concert*" -type f

# Vérifier les imports
grep -r "from.*concert" src --include="*.js"
```

## Points d'Attention

1. **Backup** : Faire un commit avant chaque phase
2. **Tests** : Tester après chaque phase majeure
3. **Firebase** : Vérifier que la DB est vide avant de migrer
4. **Cache** : Vider le cache après migration
5. **Hot Reload** : Redémarrer le serveur de dev régulièrement