# AUDIT COMPLET DES VARIABLES DU PROJET
**Date : 20 Juillet 2025**
**Dernière mise à jour : Vérification de l'existence des composants**

## Objectif
Identifier toutes les incohérences de nommage des variables dans l'application pour simplifier et clarifier le système de données.

## Méthodologie
1. Analyse du DesktopLayout pour identifier toutes les pages/composants
2. Pour chaque page, lister les variables utilisées pour transférer les données
3. Identifier les incohérences et proposer des solutions
4. Vérifier l'existence réelle de chaque composant

---

## STATUT DE VÉRIFICATION DES COMPOSANTS

### ✅ COMPOSANTS EXISTANTS ET ACTIFS

#### MODULE CONTACT
- **ContactsPage.js** (`/contacts`) - ✅ EXISTE
- **StructureCreationModal.js** - ✅ EXISTE (pas StructureModal)
- **PersonneCreationModal.js** - ✅ EXISTE (pas PersonneModal)
- **SavedSearchResultsPage.js** - ✅ EXISTE
- **SavedSelectionResultsPage.js** - ✅ EXISTE
- **ContactTagsPage.js** (`/contacts/tags`) - ✅ EXISTE
- **ContactParametragePage.js** (`/contact/parametrage`) - ✅ EXISTE

#### MODULE BOOKING
- **DateCreationPage.js** (`/booking/nouvelle-date`) - ✅ EXISTE
- **DatesPage.js** (`/dates`) - ✅ EXISTE
- **PublicationsPage.js** (`/publications`) - ✅ EXISTE
- **ProjetsPage.js** (`/projets`) - ✅ EXISTE
- **SallesPage.js** (`/salles`) - ✅ EXISTE
- **FestivalsDatesPage.js** (`/festivals/dates`) - ✅ EXISTE
- **BookingParametragePage.js** (`/booking/parametrage`) - ✅ EXISTE

#### MODULE COLLABORATION
- **MailsPage.js** (`/mails`) - ❌ N'EXISTE PAS (référencé mais non créé)
- **TachesPage.js** (`/taches`) - ✅ EXISTE
- **NotesPage.js** (`/notes`) - ❌ N'EXISTE PAS (référencé mais non créé)
- **CollaborationParametragePage.js** (`/collaboration/parametrage`) - ✅ EXISTE

#### MODULE ADMIN
- **TableauDeBordPage.js** (`/tableau-de-bord`) - ✅ EXISTE
- **ContratsPage.js** (`/contrats`) - ✅ EXISTE
- **FacturesPage.js** (`/factures`) - ✅ EXISTE
- **DevisPage.js** (`/devis`) - ✅ EXISTE
- **AdminParametragePage.js** (`/admin/parametrage`) - ✅ EXISTE

### ⚠️ COMPOSANTS SUPPLÉMENTAIRES DÉCOUVERTS
Ces composants existent mais ne sont pas référencés dans DesktopLayout :
- **ArtistesPage.js** - Non utilisé actuellement
- **StructuresPage.js** - Utilisé via openStructuresListTab()
- **ContratGenerationPage.js** - Ancienne version (remplacé par ContratGenerationNewPage)
- **FactureGeneratorPage.js** - Page de génération de factures
- **ContratRedactionPage.js** - Page de rédaction/aperçu des contrats
- **DebugToolsPage.js** - Page d'outils de debug
- **TestAddressPage.js** - Page de test pour les adresses
- **ConfirmationPage.js** - Page de confirmation des pré-contrats

### 🗑️ VESTIGES / OBSOLÈTES
- **LieuxPage.js** - N'existe plus (remplacé par SallesPage)
- Le code fait référence à "ContactsListTab" mais le composant réel est "ContactsPage"

### 🔧 ACTIONS RECOMMANDÉES

#### URGENT - Composants manquants
1. **Créer MailsPage.js** - Le menu Collaboration référence cette page qui n'existe pas
   - Pas de case dans TabManagerProduction
   - Référencé dans DesktopLayout ligne 508-516
2. **Créer NotesPage.js** - Le menu Collaboration référence cette page qui n'existe pas
   - Pas de case dans TabManagerProduction
   - Référencé dans DesktopLayout ligne 526-534

#### NETTOYAGE - Références obsolètes
1. Remplacer toutes les références à "ContactsListTab" par "ContactsPage" dans TabsContext
2. Supprimer les références à LieuxPage et openLieuxListTab() dans TabsContext (ligne 243-251)
3. Vérifier si ContratGenerationPage.js peut être supprimé (remplacé par ContratGenerationNewPage)

#### OPTIMISATION - Composants non utilisés
1. ArtistesPage.js - Existe dans TabManagerProduction (case ligne 225-227) mais pas dans le menu
2. StructuresPage.js - Utilisé via ContactsList dans TabManagerProduction
3. TestAddressPage - N'est pas dans TabManagerProduction, peut être supprimé ou ajouté au debug

### 📊 RÉSUMÉ DES INCOHÉRENCES DE NOMMAGE

#### Dans TabsContext vs TabManagerProduction
- TabsContext utilise "ContactsListTab" → TabManagerProduction utilise "ContactsPage"
- TabsContext utilise "DatesListTab" → TabManagerProduction utilise "DatesPage"
- TabsContext utilise "PublicationsListTab" → TabManagerProduction utilise "PublicationsPage"

#### Composants avec double système
- FactureDetailsPage → Remplacé par FactureGeneratorPage (ligne 241-250 dans TabManager)
- ContratGenerationPage → Encore utilisé dans App.js ligne 347, mais remplacé par ContratGenerationNewPage dans TabManager

### 🚨 ROUTES DÉCOUVERTES DANS APP.JS
Ces routes existent mais ne sont pas accessibles via le menu :
- `/migration` - MigrationPage (importé mais pas de route définie)
- `/taches` - TachesPage (pas de route définie dans App.js, mais dans le menu)
- `/mails` - Pas de route (composant n'existe pas)
- `/notes` - Pas de route (composant n'existe pas)
- `/debug-tools` - DebugToolsPage (pas de route dans App.js, mais dans TabManager)
- `/tabs-test` - TabsTestPage (importé mais pas utilisé)
- `/test-address` - TestAddressPage (pas importé dans App.js)

---

## STRUCTURE DE L'APPLICATION

### 1. MODULE CONTACT

#### Pages et composants identifiés :
- ContactsPage (`/contacts`) - Pas ContactsListTab
- StructureCreationModal/PersonneCreationModal (modals de création)
- SavedSearchResultsPage (recherches sauvegardées)
- SavedSelectionResultsPage (sélections sauvegardées)
- ContactTagsPage (`/contacts/tags`)
- ContactParametragePage (`/contact/parametrage`)

#### Variables utilisées :

**Contact/Personne :**
- `contact` vs `personne` vs `contactData`
- `contactId` vs `personneId` vs `id`
- `contact.nom` vs `contact.name`
- `contact.prenom` vs `contact.firstName`
- `contact.structureId` vs `contact.structure` vs `contact.organisation`
- `contact.fonction` vs `contact.role` vs `contact.titre`

**Structure/Organisation :**
- `structure` vs `organisation` vs `company`
- `structureId` vs `organisationId` vs `structureRef`
- `structure.nom` vs `structure.name` vs `structure.raisonSociale`
- `structure.siret` vs `structure.SIRET` vs `structure.numeroSiret`
- `structure.adresse` vs `structure.address` vs `structure.adresseComplete`

**Relations :**
- `contacts` vs `personnes` vs `membres`
- `structures` vs `organisations` vs `companies`

---

### 2. MODULE BOOKING

#### Pages et composants identifiés :
- DateCreationPage (`/booking/nouvelle-date`)
- DatesListTab (`/dates`)
- PublicationsListTab (`/publications`)
- ProjetsPage (`/projets`)
- SallesPage (`/salles`)
- FestivalsDatesPage (`/festivals/dates`)
- BookingParametragePage (`/booking/parametrage`)

#### Variables utilisées :

**Date/Concert :**
- `date` vs `concert` vs `event` vs `dateData`
- `dateId` vs `concertId` vs `eventId`
- `date.date` vs `date.dateOption` vs `date.dateEvent`
- `date.artisteId` vs `date.artiste` vs `date.artisteRef`
- `date.lieuId` vs `date.lieu` vs `date.salleId`
- `date.montant` vs `date.cachet` vs `date.prix`
- `date.statut` vs `date.status` vs `date.etat`

**Artiste :**
- `artiste` vs `artist` vs `artisteData`
- `artisteId` vs `artistId` vs `artisteRef`
- `artiste.nom` vs `artiste.name` vs `artiste.nomArtiste`
- `artiste.genre` vs `artiste.style` vs `artiste.genreMusical`
- `artiste.projetId` vs `artiste.projet` vs `artiste.projectId`

**Projet :**
- `projet` vs `project` vs `projetData`
- `projetId` vs `projectId` vs `projetRef`
- `projetNom` vs `projet.nom` vs `projet.name`
- `projet.artisteId` vs `projet.artiste` vs `projet.artisteRef`

**Lieu/Salle :**
- `lieu` vs `venue` vs `salle` vs `lieuData`
- `lieuId` vs `venueId` vs `salleId`
- `lieu.nom` vs `lieu.name` vs `lieu.nomLieu`
- `lieu.adresse` vs `lieu.address` vs `lieu.adresseComplete`
- `lieu.capacite` vs `lieu.capacity` vs `lieu.jauge`

---

### 3. MODULE COLLABORATION

#### Pages et composants identifiés :
- MailsPage (`/mails`)
- TachesPage (`/taches`)
- NotesPage (`/notes`)
- CollaborationParametragePage (`/collaboration/parametrage`)

#### Variables utilisées :

**Mails :**
- `mail` vs `email` vs `message`
- `mailId` vs `emailId` vs `messageId`
- `mail.sujet` vs `mail.subject` vs `mail.objet`
- `mail.expediteur` vs `mail.sender` vs `mail.from`
- `mail.destinataire` vs `mail.recipient` vs `mail.to`

**Tâches :**
- `tache` vs `task` vs `todo`
- `tacheId` vs `taskId` vs `todoId`
- `tache.titre` vs `tache.title` vs `tache.nom`
- `tache.statut` vs `tache.status` vs `tache.etat`
- `tache.assigneeId` vs `tache.responsable` vs `tache.userId`

**Notes :**
- `note` vs `comment` vs `commentaire`
- `noteId` vs `commentId` vs `commentaireId`
- `note.contenu` vs `note.content` vs `note.texte`
- `note.auteurId` vs `note.userId` vs `note.createdBy`

---

### 4. MODULE ADMIN

#### Pages et composants identifiés :
- TableauDeBordPage (`/tableau-de-bord`)
- ContratsPage (`/contrats`)
- FacturesPage (`/factures`)
- DevisPage (`/devis`)
- AdminParametragePage (`/admin/parametrage`)

#### Variables utilisées :

**Contrat :**
- `contrat` vs `contract` vs `contratData`
- `contratId` vs `contractId` vs `contratRef`
- `contrat.numero` vs `contrat.number` vs `contrat.numeroContrat`
- `contrat.montant` vs `contrat.amount` vs `contrat.montantTotal`
- `contrat.statut` vs `contrat.status` vs `contrat.etat`
- `contrat.organisateur` vs `contrat.client` vs `contrat.acheteur`
- `contrat.signataire` vs `contrat.nomSignataire` vs `contrat.signatory`

**Facture :**
- `facture` vs `invoice` vs `factureData`
- `factureId` vs `invoiceId` vs `factureRef`
- `facture.numero` vs `facture.number` vs `facture.numeroFacture`
- `facture.montantHT` vs `facture.montant` vs `facture.total`
- `facture.client` vs `facture.clientId` vs `facture.destinataire`

**Devis :**
- `devis` vs `quote` vs `devisData`
- `devisId` vs `quoteId` vs `devisRef`
- `devis.numero` vs `devis.number` vs `devis.numeroDevis`
- `devis.montant` vs `devis.total` vs `devis.montantTotal`
- `devis.statut` vs `devis.status` vs `devis.etat`

---

## EXEMPLES CONCRETS D'INCOHÉRENCES

### Dans DateCreationPage.js

**1. Double système pour les structures :**
```javascript
// Double stockage pour compatibilité
structureId: formData.structureId,
structureNom: formData.structureNom,
organisateurId: formData.structureId,  // Duplication !
organisateurNom: formData.structureNom, // Duplication !
```

**2. Noms de structures incohérents :**
```javascript
// 4 façons différentes de nommer la même chose !
const nomStructure = structureData.raisonSociale || 
                   structureData.nom || 
                   structureData.structureRaisonSociale || 
                   'Structure sans nom';
```

**3. Mélange français/anglais dans un même objet :**
```javascript
const dateData = {
  date: formData.date,              // anglais
  artisteId: formData.artisteId,    // français
  createdBy: currentUser?.uid,      // anglais
  statut: 'En cours'                // français
};
```

### Dans ContratGeneratorNew.js

**1. Signataire vs nomSignataire :**
```javascript
// Le formulaire envoie 'signataire'
signataire: "Jean Dupont"

// Mais le contrat cherche 'nomSignataire'
signataire: preContratData.nomSignataire || ''
```

**2. Projet stocké différemment :**
```javascript
// Dans la date
dateData.projetNom = "Mon Projet"

// Dans l'artiste  
artisteData.projet = "Mon Projet"
artisteData.projetId = "abc123"

// Dans le contrat
contratData.projet = ""
contratData.projetId = undefined
```

### Dans les templates de contrat

**1. Trois formats de variables :**
```javascript
// Format 1 : Crochets (ancien)
[artiste_nom]
[contact_siret]

// Format 2 : Accolades (nouveau)
{organisateur_siret}
{producteur_signataire}

// Format 3 : Double accolades (Handlebars)
{{date_montant}}
{{total_ttc}}
```

**2. Noms de variables incohérents :**
```javascript
// Pour le SIRET
[contact_siret]
[siret_entreprise]  
[organisateur_siret]
[programmateur_siret]
[structure_siret]

// Pour le signataire
[contact_nom]
[contact_representant]
[organisateur_signataire]
[programmateur_representant]
```

### Dans ConfirmationPage.js

**1. Mapping complexe des adresses :**
```javascript
// Le formulaire public envoie
adresseOrga: "123 rue Test"
codePostalOrga: "75001"
villeOrga: "Paris"

// Mais la confirmation attend
adresse: ""
codePostal: ""
ville: ""

// Nécessite un mapping manuel
adresse: publicData.adresseOrga || '',
codePostal: publicData.codePostalOrga || '',
ville: publicData.villeOrga || '',
```

**2. Festival vs festivalEvenement :**
```javascript
// Dans le formulaire
festivalEvenement: "Mon Festival"

// Dans la confirmation
festival: publicData.festivalEvenement || ''
```

---

## PROBLÈMES IDENTIFIÉS

### 1. Incohérences linguistiques
- Mélange français/anglais : `date` vs `dateData`, `projet` vs `projectId`
- Utilisation inconsistante des langues dans une même entité

### 2. Formats de référencement
- `Id` vs `Ref` vs objet complet
- `artisteId` vs `artiste` (string vs objet)
- Relations stockées différemment selon les modules

### 3. Nommage des propriétés
- `nom` vs `name`
- `statut` vs `status` vs `etat`
- `montant` vs `amount` vs `total` vs `prix`

### 4. Structure des données
- Parfois ID simple, parfois objet avec ID
- Relations parfois dans l'objet, parfois séparées

---

## RECOMMANDATIONS

### 1. Standardisation linguistique
**Choisir une langue unique (français recommandé) :**
- `date` au lieu de `dateData`
- `projetId` au lieu de `projectId`
- `statut` au lieu de `status`

### 2. Convention de nommage des IDs
**Format uniforme : `{entité}Id` :**
- `artisteId` (pas `artiste` pour un ID)
- `projetId` (pas `projet` pour un ID)
- `structureId` (pas `structure` pour un ID)

### 3. Relations
**Toujours stocker les IDs, charger les objets quand nécessaire :**
```javascript
// BON
date: {
  artisteId: "abc123",
  lieuId: "xyz789",
  // Objets chargés séparément
}

// MAUVAIS
date: {
  artiste: "abc123", // Ambigu
  lieu: { id: "xyz789", nom: "Salle X" } // Dénormalisation
}
```

### 4. Propriétés communes
**Standardiser les noms de propriétés :**
- `nom` (pas `name` ou `title`)
- `statut` (pas `status` ou `etat`)
- `montant` pour les sommes d'argent
- `date` pour les dates (pas `dateOption` ou `dateEvent`)

### 5. Structure recommandée par entité

**Contact/Personne :**
```javascript
{
  id: string,
  nom: string,
  prenom: string,
  email: string,
  telephone: string,
  structureId: string,
  fonction: string,
  tags: string[],
  createdAt: timestamp,
  updatedAt: timestamp
}
```

**Structure :**
```javascript
{
  id: string,
  nom: string,
  siret: string,
  adresse: {
    rue: string,
    codePostal: string,
    ville: string,
    pays: string
  },
  telephone: string,
  email: string,
  siteWeb: string,
  contactsIds: string[],
  createdAt: timestamp,
  updatedAt: timestamp
}
```

**Date (événement) :**
```javascript
{
  id: string,
  date: timestamp,
  libelle: string,
  artisteId: string,
  lieuId: string,
  structureId: string,
  montant: number,
  statut: string,
  contratId: string,
  factureId: string,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

**Artiste :**
```javascript
{
  id: string,
  nom: string,
  genre: string,
  projetId: string,
  contactId: string,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

**Projet :**
```javascript
{
  id: string,
  nom: string,
  description: string,
  artistesIds: string[],
  datesIds: string[],
  statut: string,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

---

## PLAN D'ACTION

### Phase 1 : Documentation
1. ✓ Créer ce document d'audit
2. Valider les recommandations avec l'équipe
3. Créer un guide de style pour les développeurs

### Phase 2 : Migration progressive
1. Créer des fonctions de mapping pour la transition
2. Migrer module par module
3. Tester chaque migration

### Phase 3 : Nettoyage
1. Supprimer les anciennes variables
2. Mettre à jour la documentation
3. Former l'équipe aux nouvelles conventions

---

## EXEMPLES DE MAPPING

### Mapping Contact
```javascript
// Ancien format
{
  contact: "abc123",
  contactData: { name: "Dupont" },
  organisation: "xyz789"
}

// Nouveau format
{
  contactId: "abc123",
  structureId: "xyz789"
}
```

### Mapping Date
```javascript
// Ancien format
{
  dateOption: "2025-07-20",
  artiste: { id: "abc", nom: "Artiste X" },
  montantPropose: "1500"
}

// Nouveau format
{
  date: "2025-07-20",
  artisteId: "abc",
  montant: 1500
}
```

---

## PRIORITÉS DE REFACTORING

### Priorité 1 : Variables critiques du workflow principal
Ces variables cassent actuellement le fonctionnement :

1. **signataire vs nomSignataire** dans le flux contrat
2. **projetNom vs projet** dans les dates/artistes
3. **Mapping des variables de template** ([var] vs {var})
4. **adresseOrga vs adresse** dans les formulaires

### Priorité 2 : Standardisation des IDs
Pour éviter la confusion objet/ID :

1. Toujours utiliser `{entité}Id` pour les IDs
2. Ne jamais stocker `{entité}: "id123"` (ambigu)
3. Charger les objets séparément quand nécessaire

### Priorité 3 : Unification linguistique
Choisir le français partout :

- `date` (OK) mais `statut` au lieu de `status`
- `montant` au lieu de `amount`
- `utilisateur` au lieu de `user`
- `crééPar` au lieu de `createdBy`

---

## EXEMPLE DE MIGRATION

### Avant :
```javascript
// Incohérences multiples
const date = {
  artiste: "abc123",           // Ambigu : ID ou objet ?
  artisteName: "Mon Artiste",  // Anglais
  projet: {                    // Objet complet
    id: "xyz789",
    name: "Mon Projet"
  },
  montantPropose: "1500",      // String au lieu de number
  status: "confirmed"          // Anglais
}
```

### Après :
```javascript
// Standardisé et cohérent
const date = {
  artisteId: "abc123",         // Clair : c'est un ID
  artisteNom: "Mon Artiste",   // Français cohérent
  projetId: "xyz789",          // ID seulement
  projetNom: "Mon Projet",     // Nom stocké séparément si nécessaire
  montant: 1500,               // Number
  statut: "confirmé"           // Français
}
```

### Fonction de migration :
```javascript
function migrerDate(ancienneDate) {
  return {
    // IDs clarifiés
    artisteId: typeof ancienneDate.artiste === 'string' 
      ? ancienneDate.artiste 
      : ancienneDate.artiste?.id,
    
    // Noms unifiés
    artisteNom: ancienneDate.artisteName 
      || ancienneDate.artiste?.nom 
      || ancienneDate.artiste?.name,
    
    // Projets normalisés
    projetId: ancienneDate.projet?.id 
      || ancienneDate.projetId,
    projetNom: ancienneDate.projet?.name 
      || ancienneDate.projet?.nom 
      || ancienneDate.projetNom,
    
    // Montants en number
    montant: parseFloat(ancienneDate.montantPropose 
      || ancienneDate.montant 
      || 0),
    
    // Statuts en français
    statut: traduireStatut(ancienneDate.status 
      || ancienneDate.statut)
  };
}
```

---

## 📌 LISTE OFFICIELLE DES VARIABLES STANDARDISÉES

### RÈGLE D'OR : Utiliser UNIQUEMENT ces noms dans TOUTE l'app

#### 1. IDENTIFIANTS (toujours suffixe "Id")
- `id` (pas `_id` ou `ID`)
- `artisteId` (pas `artiste` quand c'est un ID)
- `projetId` (pas `projet` ou `projectId`)
- `structureId` (PAS `organisateurId`, PAS `organisationId`)
- `lieuId` (pas `lieu`, `salleId` ou `venueId`)
- `contactId` (pas `contact` ou `personneId`)
- `entrepriseId` (pas `organizationId` ou `companyId`)

#### 2. NOMS POUR AFFICHAGE (suffixe "Nom")
- `artisteNom` (pas `artisteName` ou `artiste.nom`)
- `projetNom` (pas `projet.nom` ou `projetIntitule`)
- `structureNom` (PAS `organisateurNom`)
- `lieuNom` (pas `nomLieu` ou `salleName`)

#### 3. DONNÉES STRUCTURE/ORGANISATION
- `raisonSociale` (pas `nom` pour une structure)
- `siret` (PAS `SIRET`, PAS `numeroSiret`)
- `signataire` (PAS `nomSignataire`, PAS `representant`)
- `qualiteSignataire` (PAS `qualite`, PAS `fonction` dans ce contexte)

#### 4. DONNÉES CONTACT/PERSONNE
- `nom` (pas `name` ou `lastName`)
- `prenom` (pas `firstName`)
- `fonction` (pas `role` ou `titre`)
- `email` (pas `mail`)
- `telephone` (pas `tel` ou `phone`)

#### 5. DONNÉES TEMPORELLES
- `date` (pas `dateOption` ou `dateEvent`)
- `heureDebut` (pas `heure` ou `startTime`)
- `heureFin` (pas `endTime`)

#### 6. DONNÉES FINANCIÈRES
- `montant` (PAS `montantPropose`, PAS `cachet`, PAS `prix`)
- `montantHT` (pas `montant_ht`)
- `montantTTC` (pas `total_ttc`)
- `devise` (pas `currency`)

#### 7. STATUTS ET ÉTATS
- `statut` (PAS `status`, PAS `etat`)
- `actif` (pas `active` ou `enabled`)

#### 8. MÉTADONNÉES
- `creePar` (PAS `createdBy`, PAS `userId`)
- `creeParNom` (pas `createdByName`)
- `dateCreation` (PAS `createdAt`)
- `dateModification` (PAS `updatedAt`)

#### 9. ADRESSE
- `adresse` (pas `address`)
- `codePostal` (pas `cp` ou `postalCode`)
- `ville` (pas `city`)
- `pays` (pas `country`)

---

## PLAN DE CORRECTION ET SUIVI

### 📋 CHECKLIST DE CORRECTION PAR MODULE

#### MODULE BOOKING (Priorité 1)
- [x] **DateCreationPage.js** ✅
  - [x] Remplacer `organisateurId/organisateurNom` par `structureId/structureNom`
  - [x] S'assurer que `projetId` et `projetNom` sont cohérents
  - [x] Utiliser `montant` (pas `montantPropose` ou `cachet`)
  - [x] Utiliser `statut` (pas `status`)
  - [x] Utiliser `creePar` (pas `createdBy`)

- [x] **DatesPage.js** / **useDateListData.js** ✅
  - [x] Adapter la lecture pour utiliser `structureId` au lieu de `organisateurId`
  - [x] Ajouter compatibilité pour ancien code
  - [x] Vérifier l'affichage des colonnes (DatesTable utilise bien organisateurNom)

- [x] **DateDetailsPage.js** ✅
  - [x] Utiliser les bonnes variables pour l'affichage
  - [x] Gérer la compatibilité avec anciennes données (déjà fait ligne 185 et 199)

#### MODULE CONTACT (Priorité 2)
- [x] **PersonneCreationModal.js** ✅
  - [x] Utiliser `structureId` (pas `structure` ou `organisationId`) - déjà fait
  - [x] Utiliser `fonction` (pas `role` ou `titre`) - déjà fait
  - [x] Standardiser les champs téléphone - utilise déjà `telephone`

- [x] **StructureCreationModal.js** ✅
  - [x] Utiliser `raisonSociale` pour les structures - déjà fait
  - [x] Utiliser `siret` (pas `SIRET` ou `numeroSiret`) - déjà fait
  - [x] Standardiser `signataire` et `qualiteSignataire` - utilise `signataire` et `qualite`

- [ ] **ContactsPage.js**
  - [ ] Adapter les filtres et recherches
  - [ ] Gérer l'affichage avec les bonnes variables

#### FLUX TRANSVERSAUX (Priorité 3)
- [ ] **PreContratFormPublic.js**
  - [ ] Mapper `nomOrga` → `raisonSociale`
  - [ ] Mapper `signataire` correctement
  - [ ] Unifier les champs d'adresse

- [ ] **ConfirmationPage.js**
  - [ ] Normaliser à la lecture des données
  - [ ] Sauvegarder avec les bons noms
  - [ ] Gérer le mapping signataire

- [ ] **ContratRedactionPage.js**
  - [ ] Utiliser le mapper pour les variables
  - [ ] Gérer les deux formats `[var]` et `{var}`

### 📝 JOURNAL DES CORRECTIONS

#### 20 Juillet 2025 - Début des corrections

**✅ FAIT :**
1. **Création du mapper simple** (`simpleDataMapper.js`)
   - Fonction `normaliserOrganisateur()` pour gérer toutes les variations de signataire
   - Fonction `remplacerVariables()` pour supporter `[var]` et `{var}`
   - Appliqué dans `ContratRedactionPage.js`

2. **DateCreationPage.js** - Standardisation complète
   - Supprimé `organisateurId/organisateurNom` (gardé seulement `structureId/structureNom`)
   - Remplacé `createdBy` → `creePar`, `createdAt` → `dateCreation`
   - Utilise maintenant `montant` et `statut` (pas les variantes anglaises)

3. **useDateListData.js** - Ajout de la compatibilité
   - Ajoute automatiquement `organisateurId/Nom` à partir de `structureId/Nom` pour l'ancien code
   - Gère aussi l'inverse pour les anciennes données
   - DatesTable continue d'afficher correctement avec `organisateurNom`

**🔄 NOUVELLES CORRECTIONS DU 20 JUILLET 2025 (Session 2) :**

4. **useDateListData.js** - Compatibilité complète ajoutée ✅
   - Ajout mappings pour `montant/montantPropose/cachet`
   - Ajout mappings pour `statut/status`
   - Ajout mappings pour `creePar/createdBy` et `dateCreation/createdAt`
   - Compatible avec toutes les variations de noms dans la BD

5. **PreContratFormPublic.js** - Mapping corrigé ✅
   - Fonction `mapExistingData` mise à jour avec compatibilité complète
   - Support des anciens et nouveaux noms : `structureNom/organisateurNom`
   - Support des variations de montant : `montant/montantPropose/cachet/montantHT`
   - Support des variations d'adresse : `codePostal/cp`, `telephone/tel`, etc.

6. **ConfirmationPage.js** - Mapping corrigé ✅
   - `mappedData` mise à jour avec variables standardisées
   - `mesInfos` corrigé pour utiliser les bons noms
   - Compatibilité ajoutée pour tous les anciens noms

**✅ MODULES DÉJÀ CONFORMES (vérifiés) :**
- PersonneCreationModal.js - utilise déjà les bonnes conventions
- StructureCreationModal.js - utilise déjà les bonnes conventions
- ContactsList.js - utilise déjà les bonnes conventions
- ContactsPage.js - simple routeur, pas de données

7. **ContratRedactionPage.js** - Statut corrigé ✅
   - Utilise maintenant `statut` lors de la sauvegarde (avec `status` pour compatibilité)
   - Lecture compatible avec `statut` et `status`
   - Utilise déjà `structureId` avec fallback sur `organisateurId`
   - Utilise `dateModification` avec `updatedAt` pour compatibilité

**✅ RÉCAPITULATIF DES MODULES CORRIGÉS :**
- DateCreationPage.js ✅
- useDateListData.js ✅
- PreContratFormPublic.js ✅
- ConfirmationPage.js ✅
- ContratRedactionPage.js ✅
- PersonneCreationModal.js ✅ (déjà conforme)
- StructureCreationModal.js ✅ (déjà conforme)
- ContactsList.js ✅ (déjà conforme)

**❌ RESTE À FAIRE :**
- Tests de non-régression complets
- Documentation pour les développeurs
- Migration des templates de contrats existants

---

## ⚠️ RISQUES ET STRATÉGIE DE MIGRATION

### RISQUES IDENTIFIÉS :
1. **Casser les données existantes** : Si on change `organisateurId` → `structureId`, l'ancien code ne trouvera plus les données
2. **Rompre les intégrations** : Les API externes ou formulaires publics peuvent envoyer les anciens noms
3. **Perdre des données** : Si on oublie de migrer certains champs

### STRATÉGIE SANS SUR-INGÉNIERIE :

#### 1. À LA SAUVEGARDE - Toujours utiliser les BONS noms
```javascript
// Utiliser les noms officiels
const dateData = {
  structureId: formData.structureId,     // PAS organisateurId
  structureNom: formData.structureNom,   // PAS organisateurNom
  montant: parseFloat(formData.montant), // PAS montantPropose
  creePar: currentUser.uid,              // PAS createdBy
  dateCreation: serverTimestamp()        // PAS createdAt
}
```

#### 2. À LA LECTURE - Ajouter la compatibilité
```javascript
// Après avoir lu depuis Firebase
const data = doc.data();

// Ajouter les anciens noms pour compatibilité
if (data.structureId && !data.organisateurId) {
  data.organisateurId = data.structureId;
  data.organisateurNom = data.structureNom;
}

// Mapper vers les nouveaux si seulement les anciens existent
if (data.organisateurId && !data.structureId) {
  data.structureId = data.organisateurId;
  data.structureNom = data.organisateurNom;
}
```

#### 3. DANS LES FORMULAIRES - Accepter les deux
```javascript
// Accepter plusieurs variations à l'entrée
const structureId = formData.structureId || 
                   formData.organisateurId || 
                   formData.structure;
```

---

## RÈGLES DE CORRECTION

1. **Toujours sauvegarder avec les BONS noms**
   ```javascript
   // BON
   structureId: "123",
   projetNom: "Mon projet"
   
   // MAUVAIS
   organisateurId: "123",
   projet: { nom: "Mon projet" }
   ```

2. **À la lecture, ajouter la compatibilité**
   ```javascript
   const data = doc.data();
   // Ajouter les anciens noms
   data.organisateurId = data.structureId; // pour compatibilité
   ```

3. **Un fichier à la fois, tester après chaque modification**

4. **Pas de service centralisé, juste des corrections locales**

---

## CONCLUSION DE L'AUDIT ÉTENDU

### 🔍 BILAN DE LA VÉRIFICATION DES COMPOSANTS

L'audit approfondi révèle plusieurs problèmes importants :

#### 1. **Composants Manquants** (2)
- **MailsPage.js** - Référencé dans le menu mais n'existe pas
- **NotesPage.js** - Référencé dans le menu mais n'existe pas

#### 2. **Incohérences de Nommage** (3)
- ContactsListTab → ContactsPage
- DatesListTab → DatesPage  
- PublicationsListTab → PublicationsPage

#### 3. **Composants Obsolètes** (2)
- **ContratGenerationPage** - Remplacé par ContratGenerationNewPage mais encore utilisé
- **LieuxPage** - Remplacé par SallesPage

#### 4. **Problèmes de Routing** (7)
- Routes manquantes dans App.js pour plusieurs composants du menu
- Incohérences entre DesktopLayout, TabsContext, TabManagerProduction et App.js

### 📋 PLAN D'ACTION IMMÉDIAT

#### Phase 1 : URGENT (1-2 jours)
1. **Créer les composants manquants** :
   - MailsPage.js avec fonctionnalité basique
   - NotesPage.js avec fonctionnalité basique
   - Ajouter les cases correspondants dans TabManagerProduction

2. **Corriger les bugs bloquants** :
   - signataire vs nomSignataire
   - projetNom vs projet
   - Variables de template

#### Phase 2 : NETTOYAGE (3-5 jours)
1. **Harmoniser les noms** :
   - Remplacer toutes les références *ListTab par *Page
   - Supprimer ContratGenerationPage au profit de ContratGenerationNewPage
   - Nettoyer les références à LieuxPage

2. **Synchroniser le routing** :
   - Aligner App.js, DesktopLayout, TabsContext et TabManagerProduction
   - Supprimer les routes obsolètes
   - Ajouter les routes manquantes

#### Phase 3 : STANDARDISATION (1-2 semaines)
1. **Variables et propriétés** :
   - Appliquer la convention `{entité}Id` partout
   - Unifier en français
   - Créer un dictionnaire de mapping

2. **Documentation** :
   - Créer un guide de style pour les développeurs
   - Documenter les conventions de nommage
   - Créer des templates de composants

### 💡 RECOMMANDATIONS FINALES

1. **Créer un fichier de configuration centralisé** pour mapper les composants aux routes
2. **Implémenter des tests d'intégration** pour vérifier la cohérence des routes
3. **Utiliser TypeScript** pour détecter ces incohérences à la compilation
4. **Mettre en place une revue de code systématique** pour les nouveaux composants

L'état actuel du code montre un besoin urgent de refactoring et de standardisation. Les incohérences identifiées impactent directement l'expérience utilisateur et la maintenabilité du projet.