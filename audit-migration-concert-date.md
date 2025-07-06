# Rapport d'Audit : Migration Concert → Date

Date : 2025-07-05
Statut : **EN COURS - PARTIELLEMENT MIGRÉ**

## Résumé Exécutif

La migration concert → date est **partiellement réalisée**. Bien que certains éléments clés aient été migrés (service `dateService`, pages principales), de nombreuses références à "concert" subsistent dans le code, notamment dans :
- La collection Firebase 'concerts' (toujours utilisée)
- Les composants Concert* (non renommés)
- Les services (contratService, factureService, etc.)
- Les routes (/concerts)
- Les variables et paramètres

## 1. Collections Firebase

### ❌ CRITIQUE : Collection 'concerts' toujours utilisée

**Fichiers impactés majeurs :**
- `src/services/contratService.js` : Lignes 59, 165, 226 - `collection(db, 'concerts')`
- `src/services/firebase-emulator-service.js` : Référence à la collection 'concerts'
- `src/services/testDataService.js` : Création de données dans 'concerts'
- `src/services/cacheService.js` : Cache pour 'concerts'
- `src/debug/OrganizationIdFixer.js` : Ligne 103 - Traite encore la collection 'concerts'

**Sévérité : CRITIQUE** - La base de données utilise toujours l'ancienne collection

## 2. Services

### ✅ Service Principal Migré
- `dateService.js` existe et utilise la collection 'dates'
- Pas de `concertService.js` trouvé

### ❌ Services Dépendants Non Migrés

**ContratService** (CRITIQUE) :
- Toutes les méthodes utilisent `concertId` comme paramètre
- `getContratByConcert()`, `saveContrat(concertId, ...)` 
- Références à la collection 'concerts' aux lignes 59, 165, 226

**FactureService** :
- Contient des références à 'concerts'
- Utilise probablement `concertId` dans ses méthodes

**PreContratService** :
- Références à 'concerts'

## 3. Imports

### ✅ Aucun import de concertService/concertsService trouvé
C'est positif, suggérant que la migration du service principal est effective.

## 4. Hooks

### ✅ Aucun hook useConcert* trouvé
Les hooks ont apparemment été migrés vers useDate*.

## 5. Composants

### ❌ IMPORTANT : Nombreux composants Concert* non migrés

**Répertoire src/components/concerts/** (38 fichiers) :
- `ConcertDetails.js`
- `ConcertsList.js`
- `ConcertsTableView.js`
- `desktop/ConcertView.js`, `ConcertForm.js`, etc.
- `mobile/ConcertView.js`, `ConcertForm.js`, etc.
- `sections/ConcertActions.js`, `ConcertSearchBar.js`, etc.

**Composants utilisant ces éléments :**
- `src/components/contacts/ContactViewTabs.js` : Section "concerts"
- `src/components/artistes/[mobile|desktop]/ArtisteView.js` : Relations concerts
- `src/components/lieux/[mobile|desktop]/LieuView.js` : Relations concerts

**Sévérité : IMPORTANT** - L'interface utilisateur affiche toujours "concerts"

## 6. Routes

### ❌ CRITIQUE : Routes /concerts toujours actives

**Dans App.js :**
- Route `/concerts/*` active
- Route `/preview/concerts` active
- Redirection vers `/concerts`

**Page ConcertsPage.js :**
- Existe toujours et charge `DatesList` (partiellement migré)
- Route `/concerts/nouveau` utilisée dans DatesList

**Sévérité : CRITIQUE** - Les URLs ne reflètent pas la migration

## 7. Variables et Fonctions

### ❌ IMPORTANT : Nombreuses références concert/concertId

**Paramètres de fonctions :**
- ContratService : `concertId` partout
- Méthodes avec "concert" dans le nom : `getContratByConcert`

**Variables dans le code :**
- `concert`, `concerts`, `concertData`
- `concertId`, `concertsIds`

**Props de composants :**
- Relations concerts dans entityConfigurations
- Props concert* dans de nombreux composants

## 8. Événements

### ⚠️ MINEUR : Événements partiellement migrés

**Événements trouvés :**
- `dateCreated` utilisé dans DatesList (✅ migré)
- Mais probablement des `concertCreated`, `concertUpdated` ailleurs

## 9. Configuration

### ❌ IMPORTANT : entityConfigurations.js non migré

Sections avec `id: 'concerts'` dans les configurations :
- Artiste : Section concerts (ligne 47)
- Lieu : Section concerts 
- Contact : Section concerts
- Structure : Section concerts

## Recommandations par Priorité

### CRITIQUE (Bloquant)
1. **Migration de la collection Firebase** 'concerts' → 'dates'
2. **Migration des routes** /concerts → /dates dans App.js
3. **Migration ContratService** : Remplacer tous les `concertId` par `dateId`

### IMPORTANT (Fonctionnel)
1. **Renommer tous les composants** Concert* → Date*
2. **Mettre à jour entityConfigurations.js** : sections concerts → dates
3. **Migrer les services dépendants** : factureService, preContratService

### MINEUR (Cosmétique)
1. **Labels et messages** : "concert" → "date" dans l'UI
2. **Variables internes** : concert → date dans le code
3. **Commentaires et documentation**

## Faux Positifs Identifiés

1. **DatesList.js** : Déjà migré mais toujours dans `/components/concerts/`
2. **DateCreationPage.js** : Déjà migré
3. Certains commentaires légitimes mentionnant "concert" comme type d'événement

## État Global

- **Services** : 30% migré (service principal fait, dépendances non migrées)
- **Base de données** : 0% migré (collection 'concerts' toujours utilisée)
- **Composants** : 10% migré (structure créée mais composants non renommés)
- **Routes** : 0% migré
- **Configuration** : 0% migré

**Estimation globale : 15-20% de la migration effectuée**

## Prochaines Étapes Recommandées

1. **Script de migration des données** : concerts → dates dans Firebase
2. **Refactoring ContratService** en priorité
3. **Batch rename** des composants Concert* → Date*
4. **Mise à jour des routes** et redirections
5. **Tests exhaustifs** après chaque phase