# Chaînes de création et de génération de contrat

## 1. Création d'un concert

### a. Liste des concerts
- **Nom** : Liste des concerts
- **URL** : `/concerts`
- **Composant** : [`src/components/concerts/ConcertsList.js`](../src/components/concerts/ConcertsList.js) *(wrapper responsive)*
  - **Desktop** : [`src/components/concerts/desktop/ConcertsList.js`](../src/components/concerts/desktop/ConcertsList.js) *(module CSS : oui)*
  - **Mobile** : [`src/components/concerts/mobile/ConcertsList.js`](../src/components/concerts/mobile/ConcertsList.js) *(module CSS : non, composant "en construction")*
- **Doublons/obsolètes** : Pas de doublon fonctionnel, mobile non implémenté.
- **Rôle** : Affiche tous les concerts existants, permet d'accéder à la création ou à la modification.

### b. Création d'un concert
- **Nom** : Formulaire de création de concert
- **URL** : `/concerts/nouveau`
- **Composant** : [`src/components/concerts/ConcertForm/index.js`](../src/components/concerts/ConcertForm/index.js) *(wrapper responsive)*
  - **Desktop** : [`src/components/concerts/desktop/ConcertForm.js`](../src/components/concerts/desktop/ConcertForm.js) *(module CSS : oui)*
  - **Mobile** : [`src/components/concerts/mobile/ConcertForm.js`](../src/components/concerts/mobile/ConcertForm.js) *(module CSS : à vérifier)*
- **Doublons/obsolètes** : Pas de doublon fonctionnel, attention à bien modifier la version desktop ou mobile selon le besoin.
- **Rôle** : Affiche le formulaire complet pour créer un nouveau concert (infos, lieu, programmateur, artiste, notes, etc).

### c. Détail d'un concert
- **Nom** : Détail d'un concert
- **URL** : `/concerts/:id`
- **Composant** : [`src/components/concerts/ConcertDetails.js`](../src/components/concerts/ConcertDetails.js)
  - **Module CSS** : [`src/components/concerts/ConcertDetails.module.css`](../src/components/concerts/ConcertDetails.module.css) *(présent)*
- **Doublons/obsolètes** : Pas de doublon dans le dossier desktop/mobile.
- **Rôle** : Affiche toutes les informations du concert, accès à la génération de contrat.

### d. Édition d'un concert
- **Nom** : Formulaire d'édition de concert
- **URL** : `/concerts/:id/edit`
- **Composant** : [`src/components/concerts/ConcertForm/index.js`](../src/components/concerts/ConcertForm/index.js) *(voir section création)*

---

## 2. Création d'un programmateur

### a. Liste des programmateurs
- **Nom** : Liste des programmateurs
- **URL** : `/programmateurs`
- **Composant** : [`src/components/programmateurs/ProgrammateursList.js`](../src/components/programmateurs/ProgrammateursList.js) *(wrapper responsive)*
  - **Desktop** : [`src/components/programmateurs/desktop/ProgrammateursList.js`](../src/components/programmateurs/desktop/ProgrammateursList.js) *(module CSS : oui)*
  - **Mobile** : [`src/components/programmateurs/mobile/ProgrammateursList.js`](../src/components/programmateurs/mobile/ProgrammateursList.js) *(module CSS : oui)*
- **Doublons/obsolètes** : Pas de doublon fonctionnel.
- **Rôle** : Affiche tous les programmateurs, accès à la création ou à la fiche détaillée.

### b. Création d'un programmateur
- **Nom** : Formulaire de création de programmateur
- **URL** : `/programmateurs/nouveau`
- **Composant** : [`src/components/programmateurs/desktop/ProgrammateurFormMaquette.js`](../src/components/programmateurs/desktop/ProgrammateurFormMaquette.js)
  - **Module CSS** : [`src/components/programmateurs/desktop/ProgrammateurFormMaquette.module.css`](../src/components/programmateurs/desktop/ProgrammateurFormMaquette.module.css) *(présent)*
- **Doublons/obsolètes** : Pas de doublon, c'est le composant principal utilisé.
- **Rôle** : Formulaire complet pour créer un nouveau programmateur (infos, structure, contacts, etc).

### c. Détail d'un programmateur
- **Nom** : Détail d'un programmateur
- **URL** : `/programmateurs/:id`
- **Composant** : [`src/components/programmateurs/ProgrammateurDetails.js`](../src/components/programmateurs/ProgrammateurDetails.js)
  - **Module CSS** : [`src/components/programmateurs/ProgrammateurDetails.module.css`](../src/components/programmateurs/ProgrammateurDetails.module.css) *(présent)*
- **Doublons/obsolètes** : Il existe une version mobile, mais le routeur utilise bien ce fichier.
- **Rôle** : Affiche toutes les informations du programmateur.

### d. Édition d'un programmateur
- **Nom** : Formulaire d'édition de programmateur
- **URL** : `/programmateurs/:id/edit`
- **Composant** : [`src/components/programmateurs/desktop/ProgrammateurFormMaquette.js`](../src/components/programmateurs/desktop/ProgrammateurFormMaquette.js) *(voir section création)*

---

## 3. Création d'un lieu

### a. Liste des lieux
- **Nom** : Liste des lieux
- **URL** : `/lieux`
- **Composant** : [`src/components/lieux/LieuxList.js`](../src/components/lieux/LieuxList.js) *(wrapper responsive)*
  - **Desktop** : [`src/components/lieux/desktop/LieuxList.js`](../src/components/lieux/desktop/LieuxList.js) *(module CSS : oui, [`LieuxList.module.css`](../src/components/lieux/desktop/LieuxList.module.css))*
  - **Mobile** : [`src/components/lieux/mobile/LieuxMobileList.js`](../src/components/lieux/mobile/LieuxMobileList.js) *(module CSS : oui, [`LieuxList.module.css`](../src/components/lieux/mobile/LieuxList.module.css))*
- **Doublons/obsolètes** : Pas de doublon fonctionnel, les deux versions sont actives.
- **Rôle** : Affiche tous les lieux, accès à la création ou à la fiche détaillée.

### b. Création d'un lieu
- **Nom** : Formulaire de création de lieu
- **URL** : `/lieux/nouveau`
- **Composant** : [`src/components/lieux/LieuForm.js`](../src/components/lieux/LieuForm.js) *(wrapper responsive)*
  - **Desktop** : [`src/components/lieux/desktop/LieuForm.js`](../src/components/lieux/desktop/LieuForm.js) *(module CSS : oui, [`LieuForm.module.css`](../src/components/lieux/desktop/LieuForm.module.css))*
  - **Mobile** : [`src/components/lieux/mobile/LieuMobileForm.js`](../src/components/lieux/mobile/LieuMobileForm.js) *(module CSS : oui, [`LieuForm.module.css`](../src/components/lieux/mobile/LieuForm.module.css))*
- **Doublons/obsolètes** : Pas de doublon fonctionnel, les deux versions sont actives.
- **Rôle** : Formulaire complet pour créer un nouveau lieu (infos, adresse, contacts, etc).

### c. Détail d'un lieu
- **Nom** : Détail d'un lieu
- **URL** : `/lieux/:id`
- **Composant** : [`src/components/lieux/LieuDetails.js`](../src/components/lieux/LieuDetails.js) *(wrapper responsive)*
  - **Desktop** : [`src/components/lieux/desktop/LieuView.js`](../src/components/lieux/desktop/LieuView.js) *(module CSS : oui, [`LieuDetails.module.css`](../src/components/lieux/desktop/LieuDetails.module.css))*
  - **Mobile** : [`src/components/lieux/mobile/LieuView.js`](../src/components/lieux/mobile/LieuView.js) *(module CSS : à vérifier)*
- **Doublons/obsolètes** : Pas de doublon fonctionnel, les deux versions sont actives.
- **Rôle** : Affiche toutes les informations du lieu, y compris les structures associées.

### d. Édition d'un lieu
- **Nom** : Formulaire d'édition de lieu
- **URL** : `/lieux/:id/edit`
- **Composant** : [`src/components/lieux/LieuForm.js`](../src/components/lieux/LieuForm.js) *(voir section création)*

---

## 4. Création d'une structure

### a. Liste des structures
- **Nom** : Liste des structures
- **URL** : `/structures`
- **Composant** : [`src/components/structures/desktop/StructuresList.js`](../src/components/structures/desktop/StructuresList.js) *(version desktop, pas de wrapper responsive)*
  - **Module CSS** : [`StructuresList.module.css`](../src/components/structures/desktop/StructuresList.module.css) *(présent)*
- **Doublons/obsolètes** : Il existe une version mobile (`mobile/StructuresList.js`), mais la navigation principale utilise la version desktop.
- **Rôle** : Affiche toutes les structures, accès à la création ou à la fiche détaillée.

### b. Création d'une structure
- **Nom** : Formulaire de création de structure
- **URL** : `/structures/nouveau`
- **Composant** : [`src/components/structures/desktop/StructureFormEnhanced.js`](../src/components/structures/desktop/StructureFormEnhanced.js)
  - **Module CSS** : [`StructureFormEnhanced.module.css`](../src/components/structures/desktop/StructureFormEnhanced.module.css) *(présent)*
- **Doublons/obsolètes** : Pas de doublon, c'est le composant principal utilisé.
- **Rôle** : Formulaire complet pour créer une nouvelle structure (infos, lieux associés, contacts, etc).

### c. Détail d'une structure
- **Nom** : Détail d'une structure
- **URL** : `/structures/:id`
- **Composant** : [`src/components/structures/desktop/StructureDetails.js`](../src/components/structures/desktop/StructureDetails.js)
  - **Module CSS** : [`StructureDetails.module.css`](../src/components/structures/desktop/StructureDetails.module.css) *(présent)*
- **Doublons/obsolètes** : Il existe une version mobile, mais la navigation principale utilise la version desktop.
- **Rôle** : Affiche toutes les informations de la structure, y compris les lieux associés.

### d. Édition d'une structure
- **Nom** : Formulaire d'édition de structure
- **URL** : `/structures/:id/edit`
- **Composant** : [`src/components/structures/desktop/StructureFormEnhanced.js`](../src/components/structures/desktop/StructureFormEnhanced.js) *(voir section création)*

---

## 5. Génération d'un contrat

### a. Accès à la génération
- **Nom** : Génération de contrat pour un concert
- **URL** : `/contrats/generate/:concertId`
- **Composant** : [`src/pages/ContratGenerationPage.js`](../src/pages/ContratGenerationPage.js)
  - **Module CSS** : utilise des styles globaux, pas de module CSS dédié.
- **Doublons/obsolètes** : Pas de doublon, c'est la page principale.
- **Rôle** : Page qui permet de générer un contrat à partir d'un concert (sélection du modèle, prévisualisation, génération PDF).

### b. Générateur de contrat (UI principale)
- **Nom** : Générateur de contrat
- **Composant** : [`src/components/contrats/desktop/ContratGenerator.js`](../src/components/contrats/desktop/ContratGenerator.js)
  - **Module CSS** : [`ContratGenerator.module.css`](../src/components/contrats/desktop/ContratGenerator.module.css) *(présent)*
- **Doublons/obsolètes** : Pas de doublon, c'est le composant principal utilisé.
- **Rôle** : Interface utilisateur pour choisir le modèle, prévisualiser et générer le contrat PDF.

### c. Liste des contrats générés
- **Nom** : Liste des contrats
- **URL** : `/contrats`
- **Composant** : [`src/pages/ContratsPage.js`](../src/pages/ContratsPage.js)
  - **Module CSS** : utilise des styles globaux, pas de module CSS dédié.
- **Doublons/obsolètes** : Pas de doublon, c'est la page principale.
- **Rôle** : Affiche tous les contrats générés, accès à la visualisation PDF.

### d. Détail d'un contrat
- **Nom** : Détail d'un contrat
- **URL** : `/contrats/:contratId`
- **Composant** : [`src/pages/ContratDetailsPage.js`](../src/pages/ContratDetailsPage.js)
  - **Module CSS** : [`ContratDetailsPage.module.css`](../src/pages/ContratDetailsPage.module.css) *(présent)*
- **Doublons/obsolètes** : Pas de doublon, c'est la page principale.
- **Rôle** : Affiche le PDF du contrat généré et ses informations associées. 