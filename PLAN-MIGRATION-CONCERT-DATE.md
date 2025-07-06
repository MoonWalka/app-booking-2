# Plan de Migration Concert → Date

## Vue d'ensemble
Migration complète pour transformer toutes les références "concert" en "date" dans l'application, permettant de gérer tous types de dates (concerts, répétitions, résidences, etc.).

## Phase 1 : Services et Base de données

### 1.1 Collection Firebase
- `concerts` → `dates`
- Fichiers impactés : Tous les fichiers avec `collection(db, 'concerts')`

### 1.2 Service principal
- Renommer `src/services/concertService.js` → `src/services/dateService.js`
- Classe `ConcertService` → `DateService`
- Instance `concertsService` → `datesService`
- Méthodes :
  - `getConcertById` → `getDateById`
  - `createConcert` → `createDate`
  - `updateConcert` → `updateDate`
  - `deleteConcert` → `deleteDate`
  - `searchConcerts` → `searchDates`

### 1.3 Champs de données
Dans toutes les collections :
- `concertId` → `dateId`
- `concertsIds` → `datesIds`
- `concertData` → `dateData`

## Phase 2 : Hooks

### 2.1 Hooks principaux
- `useConcertListData` → `useDateListData`
- `useConcertDetails` → `useDateDetails`
- `useConcertForm` → `useDateForm`
- `useConcertSearch` → `useDateSearch`

### 2.2 Hooks contextuels
- `useConcertActions` → `useDateActions`
- `useConcertFilters` → `useDateFilters`
- `useConcertStats` → `useDateStats`

## Phase 3 : Composants

### 3.1 Composants principaux
- `ConcertsList` → `DatesList`
- `ConcertView` → `DateView`
- `ConcertForm` → `DateForm`
- `ConcertCard` → `DateCard`
- `ConcertDetails` → `DateDetails`

### 3.2 Composants secondaires
- `ConcertSelectorRelational` → `DateSelectorRelational`
- `ConcertActions` → `DateActions`
- `ConcertFilters` → `DateFilters`
- `ConcertTabs` → `DateTabs`

### 3.3 Pages
- `ConcertCreationPage` → `DateCreationPage` (déjà fait)
- `ConcertEditPage` → `DateEditPage`

## Phase 4 : Routes et Navigation

### 4.1 Routes
- `/concerts` → `/dates`
- `/concerts/:id` → `/dates/:id`
- `/concerts/new` → `/dates/new`
- `/concerts/:id/edit` → `/dates/:id/edit`

### 4.2 Navigation (sidebar)
- Label : "Concerts" → "Dates"
- Icon : Garder ou changer
- Path : `/concerts` → `/dates`

### 4.3 Onglets
- `openConcertTab` → `openDateTab`
- Type : `concert` → `date`

## Phase 5 : Événements et Messages

### 5.1 Événements système
- `concertCreated` → `dateCreated`
- `concertUpdated` → `dateUpdated`
- `concertDeleted` → `dateDeleted`

### 5.2 Messages et labels
- "Nouveau concert" → "Nouvelle date"
- "Modifier le concert" → "Modifier la date"
- "Supprimer le concert" → "Supprimer la date"
- "Concert créé avec succès" → "Date créée avec succès"

## Phase 6 : Configuration

### 6.1 Entity Configuration
Dans `entityConfigurations.js` :
- Clé `concert` → `date`
- Relations : `concerts` → `dates`

### 6.2 Types TypeScript (si applicable)
- `Concert` → `Date`
- `ConcertData` → `DateData`
- `ConcertFormData` → `DateFormData`

## Phase 7 : Styles CSS

### 7.1 Classes CSS
- `.concert-*` → `.date-*`
- `#concert-*` → `#date-*`

### 7.2 Modules CSS
- `Concert*.module.css` → `Date*.module.css`

## Ordre d'exécution

1. **Services** (base)
2. **Hooks** (logique)
3. **Composants** (UI)
4. **Routes** (navigation)
5. **Configuration** (système)
6. **Tests** (validation)

## Fichiers à modifier (estimé)

- Services : ~5 fichiers
- Hooks : ~15 fichiers
- Composants : ~30 fichiers
- Pages : ~5 fichiers
- Configuration : ~5 fichiers
- Utils : ~10 fichiers
- **Total : ~70 fichiers**

## Validation

Après chaque phase :
1. Build sans erreur
2. Création d'une date
3. Liste des dates
4. Détails d'une date
5. Relations (artistes, lieux, contacts)
6. Système d'onglets