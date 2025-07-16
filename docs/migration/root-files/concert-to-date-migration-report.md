# Rapport de Migration : Concert → Date

## Vue d'ensemble

Ce rapport identifie tous les endroits où le terme "concert" devrait être remplacé par "date" pour supporter une approche plus générique (concerts, répétitions, résidences, etc.).

## 1. Collection Firebase

### Collection principale
- **Actuel** : `concerts`
- **Proposé** : `dates`
- **Impact** : Toutes les requêtes Firebase devront être mises à jour

## 2. Services

### concertService.js
- **Méthodes à renommer** :
  - `getConcertsByStructureId` → `getDatesByStructureId`
  - `getConcertsByStructure` → `getDatesByStructure`
- **Classe à renommer** : `ConcertService` → `DateService`
- **Export à renommer** : `concertsService` → `datesService`

### Autres services impactés :
- `contratService.js` : références à `concertId`
- `factureService.js` : références à `concertId`
- `preContratService.js` : références à `concertId`
- `devisService.js` : références à `concertId`
- `testDataService.js` : création de concerts de test

## 3. Hooks

### Hooks principaux à migrer :
1. **useConcertListData** → **useDateListData**
   - Variables : `concerts`, `concertsWithForms`, `concertsWithContracts`
   - Événements : `concertCreated`, `concertUpdated`, `concertDeleted`

2. **useConcertDetails** → **useDateDetails**
   - Toutes les références à `concert` et `concertId`

3. **useConcertForm** → **useDateForm**
   - Gestion des formulaires de création/édition

4. **useConcertActions** → **useDateActions**
   - Actions sur les dates

5. **useConcertStatus** → **useDateStatus**
   - Gestion des statuts

### Autres hooks impactés :
- `useContactContrats` : références à `concertId`
- `useContactFactures` : références à `concertId`
- `useContratGenerator` : références à `concertId`

## 4. Composants

### Composants principaux :
1. **ConcertsList** → **DatesList**
2. **ConcertView** → **DateView**
3. **ConcertForm** → **DateForm**
4. **ConcertDetails** → **DateDetails**
5. **ConcertsTableView** → **DatesTableView**
6. **ConcertSelectorRelational** → **DateSelectorRelational**

### Sections et sous-composants :
- `ConcertOrganizerSection` → `DateOrganizerSection`
- `ConcertStructureSection` → `DateStructureSection`
- `ConcertInfoSection` → `DateInfoSection`
- `ConcertFormActions` → `DateFormActions`
- `ConcertFormHeader` → `DateFormHeader`

### Composants de contact/structure :
- `ContactConcertsSection` → `ContactDatesSection`
- `ContactDatesTable` (déjà migré)
- `StructureConcertsManagementSection` → `StructureDatesManagementSection`

## 5. Pages

### Pages à renommer :
1. **ConcertsPage** → **DatesPage**
2. **DateCreationPage** : Déjà nommé correctement mais utilise encore `concerts` en interne
3. **DateDetailsPage** : Déjà nommé correctement mais utilise encore `concert` en interne

### Pages impactées :
- `ContratsPage` : références à `concertId`
- `FacturesPage` : références à `concertId`
- `TableauDeBordPage` : affichage des concerts

## 6. Événements système

### Événements à renommer :
- `concertCreated` → `dateCreated`
- `concertUpdated` → `dateUpdated`
- `concertDeleted` → `dateDeleted`
- `concertDataRefreshed` → `dateDataRefreshed`
- `concertStatusChanged` → `dateStatusChanged`

## 7. Champs de données

### Champs principaux à migrer :
- `concertId` → `dateId`
- `concertsIds` → `datesIds` (pour les relations)
- `concertsList` → `datesList`

### Dans les documents :
- Contrats : `concertId` → `dateId`
- Factures : `concertId` → `dateId`
- Formulaires : `concertId` → `dateId`
- Devis : `concertId` → `dateId`

## 8. Routes et Navigation

### Routes actuelles :
- `/concerts` → `/dates`
- `/concerts/:id` → `/dates/:id`

### Navigation (TabsContext) :
- `openConcertsListTab` → `openDatesListTab`
- `openConcertDetailsTab` → `openDateDetailsTab` (déjà migré)

### Configuration sidebar :
```javascript
// Dans sidebarConfig.js
{
  id: 'concerts',
  label: 'Concerts',  // → 'Dates'
  icon: 'bi-music-note-list',  // → 'bi-calendar-week'
  path: '/concerts'  // → '/dates'
}
```

## 9. Labels et textes d'interface

### Labels principaux :
- "Concerts" → "Dates"
- "Concert" → "Date"
- "Nouveau Concert" → "Nouvelle Date"
- "Créer un concert" → "Créer une date"
- "Liste des concerts" → "Liste des dates"
- "Détails du concert" → "Détails de la date"

### Messages et notifications :
- "Concert créé avec succès" → "Date créée avec succès"
- "Concert modifié" → "Date modifiée"
- "Concert supprimé" → "Date supprimée"

## 10. Configuration des entités

### Dans entityConfigurations.js :
```javascript
// Renommer la configuration
concert: { ... } → date: { ... }

// Mettre à jour les relations dans les autres entités :
- artiste.relations.concerts → artiste.relations.dates
- lieu.relations.concerts → lieu.relations.dates
- contact.relations.concerts → contact.relations.dates
- structure.relations.concerts → structure.relations.dates
```

## 11. Plan de migration recommandé

### Phase 1 : Backend et données
1. Créer une nouvelle collection `dates` en copiant `concerts`
2. Mettre à jour les services pour utiliser `dates`
3. Migrer les références dans les autres collections

### Phase 2 : Hooks et logique
1. Créer de nouveaux hooks avec la nomenclature `date`
2. Faire coexister temporairement les deux systèmes
3. Migrer progressivement les composants

### Phase 3 : Interface utilisateur
1. Mettre à jour les composants un par un
2. Adapter les routes et la navigation
3. Changer les labels et textes

### Phase 4 : Nettoyage
1. Supprimer les anciens hooks `concert`
2. Supprimer l'ancienne collection `concerts`
3. Nettoyer les références obsolètes

## 12. Points d'attention

### Compatibilité ascendante
- Certains champs comme `organisateurId` sont déjà en place pour la compatibilité
- Prévoir une période de transition avec les deux systèmes

### Impact sur les formulaires publics
- Les formulaires publics référencent des `concertId`
- Prévoir une migration des tokens et références

### Relations bidirectionnelles
- S'assurer que toutes les relations inverses sont mises à jour
- Vérifier les impacts sur les vues liées (artistes, lieux, contacts)

## 13. Estimation de l'effort

### Complexité par catégorie :
- **Services** : Moyen (2-3 jours)
- **Hooks** : Élevé (3-4 jours)
- **Composants** : Élevé (4-5 jours)
- **Migration données** : Moyen (2 jours)
- **Tests et validation** : Élevé (3-4 jours)

### Total estimé : 14-18 jours

## 14. Bénéfices attendus

1. **Flexibilité** : Support de différents types d'événements
2. **Clarté** : Terminologie plus générique et inclusive
3. **Évolutivité** : Facilite l'ajout de nouveaux types d'événements
4. **Cohérence** : Alignement avec la vision produit élargie