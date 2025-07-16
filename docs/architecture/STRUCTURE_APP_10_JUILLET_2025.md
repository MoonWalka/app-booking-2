# Structure de l'Application TourCraft
**Date : 10 juillet 2025**

## 🗺️ Architecture des Pages Actives

Cette documentation représente la structure réelle de l'application basée sur le menu de navigation dans `DesktopLayout.js`.

### 📊 Dashboard
- **Route** : `/`
- **Composant** : `DashboardPage`
- **Onglet** : Non fermable

---

### 👥 Contact

#### Menu principal
- **Tous les contacts** → `/contacts` → `openContactsListTab()`
- **Ajouter un contact** (sous-menu) :
  - **Ajouter une structure** → `/contacts/nouveau/structure` → `openStructureModal()`
  - **Ajouter une personne** → `/contacts/nouveau/personne` → `openPersonneModal()`
- **Mes recherches** (sous-menu) :
  - **Nouvelle recherche** → `/contacts/recherches` → `MesRecherchesPage`
  - **Nouveau dossier** → `/contacts/recherches/nouveau-dossier` → `NouveauDossierPage`
  - **Dossiers enregistrés** → `/contacts/recherches/dossiers` → `DossiersEnregistresPage`
- **Mes sélections** → `/contacts/selections` → `MesSelectionsPage`
- **Tags** → `/contacts/tags` → `ContactTagsPage`
- **Paramétrage** → `/contact/parametrage` → `ContactParametragePage`

---

### 📅 Booking

#### Menu principal
- **Nouvelle date** → `/booking/nouvelle-date` → `DateCreationPage`
- **Liste des dates** → `/dates` → `openDatesListTab()`
- **Publications** → `/publications` → `openPublicationsListTab()`
- **Projets** → `/projets` → `ProjetsPage`
- **Salle** → `/salles` → `SallesPage` ⚡ *(Pas de "lieux" !)*
- **Date des festivals** → `/festivals/dates` → `FestivalsDatesPage`
- **Paramétrage** → `/booking/parametrage` → `BookingParametragePage`

---

### 🤝 Collaboration

#### Menu principal
- **Échanges de mails** → `/mails` → `MailsPage`
- **Tâches** → `/taches` → `TachesPage`
- **Notes & Commentaires** → `/notes` → `NotesPage`
- **Paramétrage** → `/collaboration/parametrage` → `CollaborationParametragePage`

---

### 📋 Admin

#### Menu principal
- **Tableau de bord** → `/tableau-de-bord` → `TableauDeBordPage`
- **Contrats** → `/contrats` → `ContratsPage`
- **Factures** → `/factures` → `FacturesPage`
- **Devis** → `/devis` → `DevisPage`
- **Équipe dispo** → `#equipe` ⚠️ *(Non implémenté)*
- **Paramétrage** → `/admin/parametrage` → `AdminParametragePage`

---

### 🔧 Outils

#### Menu principal
- **Debug Tools** → `/debug-tools` → `openDebugToolsTab()`
- **Inventaire des pages** → `/inventaire-pages` → Navigation directe (hors onglets)
- **Test Onglets** → `/tabs-test` → Navigation directe

---

## ⚠️ Pages/Composants Absents du Menu

### Potentiellement Obsolètes :
- 🚨 **LieuxPage** et tous les composants `/lieux/*`
  - Remplacé par `SallesPage` et `FestivalsDatesPage`
- 🚨 **openLieuxListTab()** dans le switch mais PAS dans le menu
- **StructuresPage** → `/structures` (dans le switch mais pas dans le menu)

### Routes dans App.js mais pas dans le menu :
- `/preview/lieux`
- `/lieux/*`
- Probablement d'autres routes obsolètes

---

## ✅ Constats Importants

1. **"Lieux" est obsolète** : Le concept générique de "lieux" a été remplacé par :
   - **Salles** (pour les salles de spectacle)
   - **Festivals** (avec une page dédiée aux dates)

2. **Structure du nouveau système** :
   - Collection Firebase `salles` (confirmé dans `SalleCreationModal`)
   - Probablement une collection `festivals`
   - L'ancienne collection `lieux` est probablement à supprimer

3. **Migration concert → date** :
   - Ne pas migrer les fichiers sous `/components/lieux/`
   - Vérifier que `SallesPage` et `FestivalsDatesPage` utilisent bien "date"
   - Confirmer que les nouveaux composants sont à jour

---

## 🎯 Actions Recommandées

1. **Vérifier la terminologie** dans :
   - `/pages/SallesPage.js`
   - `/pages/FestivalsDatesPage.js`
   - Les composants associés

2. **Ignorer dans la migration** :
   - Tous les fichiers `/components/lieux/*`
   - `/pages/LieuxPage.js`

3. **Nettoyer plus tard** :
   - Supprimer les routes `/lieux` dans App.js
   - Supprimer les composants lieux
   - Supprimer `openLieuxListTab()` du switch

---

## 🔍 Analyse Détaillée des Pages et leurs Dépendances

### 📊 DashboardPage
- **Fichier** : `/pages/DashboardPage.js`
- **Implémentation** : Simple wrapper qui affiche `TachesPage`
- **Dépendances de TachesPage** :
  - **Hooks custom** : `useTaches` (gestion des tâches)
  - **Contextes** : `useEntreprise`, `useAuth`
  - **Services** : Direct Firebase (`addDoc`, `updateDoc`, `deleteDoc`)
  - **Composants** : `Modal`, `Card`, `Badge`, composants React Bootstrap

### 👥 ContactsPage
- **Fichier** : `/pages/ContactsPage.js`
- **Type** : Page de routage (pas de logique métier)
- **Composants enfants** :
  - `ContactsList` : Liste des contacts
  - `ContactView` : Vue détaillée
  - `ContactForm` : Formulaire d'édition
  - `ContactTypeSelector` : Sélection du type
- **Pattern** : Délégation de la logique aux composants enfants

### 📅 DatesPage
- **Fichier** : `/pages/DatesPage.js`
- **Type** : Wrapper simple
- **Composant principal** : `DatesList` (contient toute la logique)
- **Note** : Très peu de code, juste du routage

### 🏢 SallesPage
- **Fichier** : `/pages/SallesPage.js`
- **Hooks custom** : `useGenericEntityList` (utilisé 2 fois)
  - Pour les salles (collection `salles`)
  - Pour les contacts avec infos salles
- **Particularité** : Fusion de deux sources de données
- **Composants** : `SalleCreationModal`
- **Collections Firebase** : `salles` ✅ (confirmé)

### 💰 FacturesPage
- **Fichier** : `/pages/FacturesPage.js`
- **Contextes** : `useEntreprise`
- **Services** : 
  - Direct Firebase pour la lecture
  - `factureService.deleteFacture()` pour la suppression
- **Composant principal** : `FacturesTableView`
- **Pattern** : Logique dans la page + service métier

---

## 📦 Hooks Custom Identifiés

### Hooks principaux utilisés :
1. **`useTaches`** : Gestion complète des tâches (CRUD)
2. **`useGenericEntityList`** : Hook générique pour listes d'entités
3. **`useEntreprise`** : Contexte pour l'entreprise courante
4. **`useAuth`** : Contexte pour l'authentification
5. **`useContactModals`** : Gestion des modals de contact (dans DesktopLayout)

### Services métier identifiés :
1. **`factureService`** : Opérations sur les factures
2. **`devisService`** : Opérations sur les devis (probablement)
3. **`contractService`** : Opérations sur les contrats (probablement)
4. **Direct Firebase** : Utilisé dans plusieurs pages

---

## 🗂️ Collections Firebase Actives

### Confirmées :
- `taches` : Tâches (DashboardPage/TachesPage)
- `salles` : Salles de spectacle (SallesPage)
- `factures` : Factures (FacturesPage)
- `contacts` : Contacts
- `dates` : Dates d'événements
- `entreprises` : Entreprises (remplace organizations)

### Obsolètes :
- `lieux` : Remplacé par `salles` et festivals
- `organizations` : Remplacé par `entreprises`
- `concerts` : Remplacé par `dates`

---

## 🛠️ Analyse des Hooks et Services Principaux

### Hooks Majeurs

#### 1. `useTaches` (src/hooks/taches/)
- **Fonction** : Gestion complète des tâches avec sync temps réel
- **Méthodes** :
  - `refreshTaches()` : Force le rechargement
  - `getTachesByStatut()` : Filtre par statut
  - `getTachesByPriorite()` : Filtre par priorité
  - `getTachesEnRetard()` : Tâches en retard
  - `getStats()` : Statistiques complètes
- **Dépendances** : `EntrepriseContext`, Firebase Firestore

#### 2. `useGenericEntityList` (src/hooks/common/)
- **Fonction** : Hook générique pour toutes les listes d'entités
- **Capacités** :
  - Pagination avancée
  - Tri multi-colonnes
  - Filtrage et recherche
  - Sélection multiple et actions en lot
  - Virtualisation pour performance
  - Auto-refresh configurable
- **Pattern** : Remplace progressivement les hooks spécifiques

#### 3. Hooks Contacts (src/hooks/contacts/)
- **`useContactSearch`** : Recherche de contacts (wrapper)
- **`useContactFactures`** : Factures liées à un contact
- **`useHistoriqueEchanges`** : Historique complet des échanges
  - CRUD des échanges
  - Gestion des rappels
  - Statistiques par type

### Services Métier

#### 1. `factureService` (src/services/)
- **Fonctions principales** :
  - Génération de numéros uniques
  - Calcul automatique TVA
  - Gestion des templates
  - Variables Handlebars
  - Création de tâches automatiques
- **Intégration** : `tachesService` pour automatisation

#### 2. `devisService` (src/services/)
- **Fonctions principales** :
  - CRUD complet des devis
  - Génération de numéros
  - Duplication de devis
  - Tâches automatiques à la création
- **Pattern** : Similaire à factureService

#### 3. `tachesService` (src/services/)
- **Rôle** : Service central pour l'automatisation
- **Utilisé par** : `factureService`, `devisService`
- **Fonction** : Création automatique de tâches de suivi

---

## 🏗️ Patterns Architecturaux

### 1. Migration Progressive
- **Ancien** : Hooks spécifiques (`useContacts`, `useDates`, etc.)
- **Nouveau** : Hook générique `useGenericEntityList`
- **Avantage** : Code unifié, maintenance simplifiée

### 2. Temps Réel
- **Firebase Firestore** : `onSnapshot` pour sync live
- **Pattern** : Listeners dans les hooks, cleanup automatique

### 3. Automatisation
- **Principe** : Actions déclenchent des tâches
- **Exemples** : 
  - Création devis → Tâche "Relancer pour signature"
  - Création facture → Tâche "Vérifier paiement"

### 4. Séparation des Responsabilités
- **Pages** : Orchestration et UI
- **Hooks** : État React et sync données
- **Services** : Logique métier pure
- **Contextes** : État global (auth, entreprise)

### 5. Performance
- **Virtualisation** : Pour grandes listes (useGenericEntityList)
- **Memoization** : `useMemo`, `useCallback` extensifs
- **Lazy loading** : Pagination côté serveur

---

## 📝 Fichiers Actifs Non Visibles dans l'UI

### Services (src/services/)
- `firebase-service.js` : Configuration Firebase
- `factureService.js` : Logique factures
- `devisService.js` : Logique devis
- `tachesService.js` : Automatisation tâches
- `contractService.js` : Logique contrats (probable)
- `contactServiceRelational.js` : Service contacts nouvelle architecture

### Hooks (src/hooks/)
- Dossier `common/` : Hooks génériques réutilisables
- Dossier `taches/` : Hooks spécifiques aux tâches
- Dossier `contacts/` : Hooks pour les contacts
- Dossier `dates/` : Hooks pour les dates (probablement avec "concert" à migrer)
- Dossier `contrats/` : Hooks pour les contrats

### Contextes (src/context/)
- `AuthContext.js` : Authentification
- `EntrepriseContext.js` : Entreprise courante
- `TabsContext.js` : Gestion des onglets
- `ContactModalsContext.js` : Modals de contact
- `ParametresContext.js` : Paramètres globaux

### Utils (src/utils/)
- Fonctions de formatage (montants, dates)
- Helpers divers
- Constantes et configurations

---

## 📋 Analyse Détaillée des Pages de Paramétrage

### 🤝 CollaborationParametragePage
**Route** : `/collaboration/parametrage`

#### Composants utilisés :
- `GroupesPermissionsManager` : Gestion des groupes et permissions
- `EntreprisesManager` (EntreprisesManagerFirebase) : Configuration entreprise
- `CollaborateursManagerFirebase` : Gestion des collaborateurs

#### Sections et configuration :
1. **Entreprise** :
   - Nom, secteur, taille équipe
   - Fuseau horaire, langue
   - Notifications
2. **Collaborateurs** :
   - Invitations
   - Rôles personnalisés
   - Approbation requise
   - Timeout session
3. **Tâches** :
   - Statuts personnalisés
   - Tags
   - Assignation automatique
   - Notifications
4. **Permissions** :
   - Droits par rôle (création/suppression/modification)

#### Collection Firebase :
- `collaborationConfig/{entrepriseId}` : Configuration centralisée

---

### 📊 AdminParametragePage
**Route** : `/admin/parametrage`

#### Composants utilisés (10 managers spécialisés) :
1. **Administration** :
   - `ModeleContratContent` : Modèles de contrat
   - `TvaManager` : Taux de TVA
2. **Devis** :
   - `UnitesManager` : Unités de mesure
   - `MentionsManager` : Mentions légales
3. **Équipes** :
   - `RolesManager` : Rôles d'équipe
   - `RegimesManager` : Régimes de travail
   - `MetiersManager` : Métiers
4. **Feuilles de route** :
   - `ModelesFeuilleRouteManager` : Modèles
   - `HorairesManager` : Créneaux horaires
   - `MoyensTransportManager` : Moyens de transport
5. **Comptabilité** :
   - Configuration générale

#### Collections Firebase :
- `modelesContrat`, `tauxTva`, `unites`, `mentions`
- `roles`, `regimes`, `metiers`
- `modelesFeuilleRoute`, `horaires`, `moyensTransport`

---

### 👤 ContactParametragePage
**Route** : `/contact/parametrage`

#### Composants utilisés :
1. **Tags** :
   - `TagsManager` : Activités, Genres, Réseaux, Mots-clés
2. **Qualifications** :
   - `QualificationsManager` : Pays, Fonctions, Sources
3. **Messagerie** :
   - `MessagerieManager` : Comptes email, Serveurs SMTP
   - `BrevoManager` : Configuration API Brevo
4. **Messages & tâches** :
   - `MessagesTachesManager` : Modèles email, Formules, Signatures

#### Collections Firebase :
- `tags`, `qualifications`
- `comptesMessagerie`, `serveursEnvoi`, `configBrevo`
- `modelesEmail`, `formulesTypes`, `signatures`

---

### 🎵 BookingParametragePage
**Route** : `/booking/parametrage`

#### Composants utilisés :
- `ArtisteCreationModal` : CRUD artistes
- `ProjetCreationModal` : CRUD projets
- `TypesEvenementContent` : Types d'événements
- `TypesSalleContent` : Types de salles

#### Structure de navigation (3 niveaux) :
1. Section → 2. Liste artistes → 3. Détail artiste avec projets

#### Collections Firebase :
- `artistes` : Artistes avec code, actif, auCatalogue
- `projets` : Projets avec artistesSelectionnes[]
- `typesEvenement`, `typesSalle`

#### Particularité :
- Migration en cours : ancien format (projet dans artiste) → nouveau (projets séparés)

---

## 🚀 Analyse Exhaustive de Tous les Services

### Services Principaux

#### 1. **firebase-service.js** - Service central Firebase
- **Méthodes** : Toutes les méthodes Firestore + multi-entreprise
- **Collections** : Toutes (service central)
- **Patterns** : Basculement local/production, multi-entreprise

#### 2. **cacheService.js** - Cache en mémoire
- **Méthodes** : `getEntity`, `setEntity`, `invalidate`, analyse performance
- **TTL configurable** : Contacts (5min), Dates (10min), Lieux (15min)
- **Patterns** : Nettoyage auto, statistiques avancées

#### 3. **contactServiceRelational.js** - Contacts unifiés
- **Collections** : `structures`, `personnes`, `contacts` (legacy)
- **Méthodes** : Recherche unifiée, CRUD complet
- **Pattern** : Nouveau système relationnel avec compatibilité

#### 4. **personnesService.js** - Personnes physiques
- **Collections** : `personnes`, `liaisons`, `personnes_archives`
- **Méthodes** : CRUD, import bulk, fusion d'entités
- **Validation** : Schémas Joi, unicité email

#### 5. **structuresService.js** - Organisations
- **Collections** : `structures`, `liaisons`
- **Méthodes** : CRUD, tags, statut client
- **Validation** : Schémas Joi, unicité raison sociale

#### 6. **contratService.js** - Gestion des contrats
- **Collections** : `contrats`, `dates`, `taches`
- **Workflow** : draft → finalized → signed
- **Pattern** : Relation 1:1 avec dates, tâches auto

#### 7. **factureService.js** - Gestion des factures
- **Méthodes** : Génération numéros, calcul TVA, templates
- **Variables** : Handlebars, 50+ variables
- **Intégration** : Tâches automatiques

#### 8. **devisService.js** - Gestion des devis
- **Méthodes** : CRUD, duplication, numérotation
- **Pattern** : Similaire à factureService
- **Intégration** : Tâches automatiques

#### 9. **emailService.js** - Envoi d'emails
- **Providers** : SMTP, Brevo (avec fallback)
- **Templates** : Contrats, formulaires, relances
- **Pattern** : Service unifié multi-providers

#### 10. **brevoTemplateService.js** - Templates Brevo
- **Méthodes** : 4 types d'emails spécialisés
- **Variables** : Formatage auto TourCraft → Brevo
- **Config** : Chiffrée dans entreprises/parametres

### Services de Support

#### 11. **searchService.js** - Recherche avancée
- **Capacités** : Multi-critères, multi-collections
- **Méthodes** : Recherche, sauvegarde, pagination
- **Pattern** : Construction dynamique de requêtes

#### 12. **selectionsService.js** - Sélections sauvegardées
- **Collection** : `selections`
- **Features** : Partage, filtrage par type

#### 13. **tachesService.js** - Création de tâches
- **Collection** : `taches`
- **Pattern** : Tâches manuelles vs automatiques

#### 14. **dateService.js** - Dates d'événements
- **Collection** : `dates`
- **Pattern** : Compatibilité multi-formats

#### 15. **projetService.js** - Projets
- **Collection** : `projets`
- **Pattern** : CRUD standard

#### 16. **collaborateurService.js** - Collaborateurs
- **Collection** : `users`
- **Pattern** : Filtrage par organisation

### Services Techniques

#### 17. **bidirectionalRelationsService.js**
- **Rôle** : Cohérence relations bidirectionnelles
- **Pattern** : Réparation auto des incohérences

#### 18. **InstanceTracker.js** - Monitoring hooks
- **Méthodes** : Tracking, health report
- **Pattern** : Détection fuites mémoire

#### 19. **loggerService.js** - Logging
- **Features** : Performance, listeners
- **Pattern** : Désactivé en production

#### 20. **firebase-emulator-service.js**
- **Rôle** : Émulation locale complète
- **Pattern** : Firebase Testing SDK

### Services Non Analysés (mais présents)
- `contacts/liaisonsService.js` : Liaisons personnes-structures
- `historiqueEchangesService.js` : Historique échanges
- `pdfService.js` : Génération PDF
- `preContratService.js` : Pré-contrats
- `structureService.js` : Ancien service (obsolète ?)

---

## 📊 Collections Firebase Complètes

### Collections Actives Confirmées :
1. **Nouveau système relationnel** :
   - `personnes` : Contacts individuels
   - `structures` : Organisations
   - `liaisons` : Relations entre personnes et structures

2. **Booking** :
   - `dates` : Événements (remplace concerts)
   - `artistes` : Artistes
   - `projets` : Projets (nouveau)
   - `salles` : Salles (remplace lieux)
   - `festivals` : Festivals

3. **Admin** :
   - `contrats` : Contrats
   - `factures` : Factures
   - `devis` : Devis
   - `taches` : Tâches

4. **Configuration** :
   - `entreprises` : Entreprises (remplace organizations)
   - `collaborationConfig` : Config collaboration
   - `selections` : Recherches sauvegardées
   - Toutes les collections de paramétrage (tags, tva, etc.)

### Collections Obsolètes :
- `lieux` → Remplacé par `salles` + `festivals`
- `organizations` → Remplacé par `entreprises`
- `concerts` → Remplacé par `dates`
- `contacts` → Remplacé par `personnes` + `structures`

---

## 🔍 Comparaison avec l'Audit de Migration Concert→Date

### État de la Migration (10 juillet 2025)
- **43% complétée** : 46 fichiers migrés sur 108
- **90 fichiers** contiennent encore "concert"

### Analyse des Éléments à Migrer vs Réalité

#### 1. **Collections de Debug** (mentionnées dans l'audit)
```javascript
const collections = ['contacts', 'lieux', 'concerts', 'structures'];
```
**Verdict** : 
- ❌ `lieux` est OBSOLÈTE (remplacé par `salles` + `festivals`)
- ❌ `concerts` est OBSOLÈTE (remplacé par `dates`)
- ⚠️ `contacts` est en migration vers `personnes` + `structures`

#### 2. **Composants Lieux** (dans MIGRATION_CONCERT_TRACKING.md)
**Section Lieux à migrer** :
- src/components/lieux/LieuxList.js
- src/components/lieux/desktop/LieuView.js
- etc...

**Verdict** : ❌ **TOUS OBSOLÈTES**
- Pas dans le menu principal
- Remplacés par `SallesPage` et `FestivalsDatesPage`
- Collection `lieux` n'est plus utilisée

#### 3. **Pages Réellement Actives**
D'après notre analyse exhaustive, voici les pages/composants VRAIMENT utilisés :

**✅ ACTIFS et à continuer la migration** :
- Tous les composants dans `/dates/`
- Tous les composants dans `/contrats/`
- Tous les composants dans `/factures/`
- Tous les composants dans `/devis/`
- Hooks dans `/hooks/dates/`
- Services actifs (contratService, factureService, etc.)

**❌ OBSOLÈTES à ignorer/supprimer** :
- TOUT dans `/components/lieux/`
- `/pages/LieuxPage.js`
- Références à la collection `lieux`
- Probablement : ancien `structureService.js`

#### 4. **Fichiers de Debug**
L'audit mentionne des fichiers de debug avec "concert". Notre analyse :
- La plupart sont dans `/components/debug/`
- **Recommandation** : Ignorer pour la migration, supprimer plus tard

### 🎯 Actions Recommandées Finales

#### Phase 1 - Migration Immédiate
Continuer uniquement sur ces sections :
1. **Recherches** (1 fichier)
2. **Structures** (2 fichiers) - VÉRIFIER si utilisé !
3. **Pages** (8 fichiers) - SAUF LieuxPage
4. **Services** (1 fichier)
5. **Hooks dans /dates/**

#### Phase 2 - Nettoyage
Supprimer complètement :
1. `/components/lieux/*` (toute la section)
2. `/pages/LieuxPage.js`
3. Routes `/lieux` dans App.js
4. `openLieuxListTab()` dans DesktopLayout
5. Références à la collection `lieux` dans Firebase

#### Phase 3 - Vérification
1. Vérifier si `/structures` est encore utilisé (pas dans le menu)
2. Nettoyer les outils de debug
3. Supprimer les variables de compatibilité `concert_*`

### 📊 Résumé : Fichiers à NE PAS migrer
- **6 fichiers lieux** : Tous obsolètes
- **9 fichiers debug** : Ignorer pour l'instant
- **Structures ?** : Vérifier si vraiment utilisé
- **Total économisé** : ~15-20 fichiers inutiles