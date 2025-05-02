# Documentation du projet TourCraft

## Table des matières
- [Introduction](#introduction)
- [Structure du projet](#structure-du-projet)
- [Hooks](#hooks)
  - [Hooks communs](#hooks-communs)
  - [Hooks pour les concerts](#hooks-pour-les-concerts)
  - [Hooks pour les contrats](#hooks-pour-les-contrats)
  - [Hooks pour les artistes](#hooks-pour-les-artistes)
  - [Hooks pour les lieux](#hooks-pour-les-lieux)
  - [Hooks pour les programmateurs](#hooks-pour-les-programmateurs)
  - [Hooks pour les paramétrages](#hooks-pour-les-paramétrages)
- [Composants](#composants)
  - [Composants UI](#composants-ui)
  - [Composants communs](#composants-communs)
  - [Composants de formulaire](#composants-de-formulaire)
  - [Composants de mise en page](#composants-de-mise-en-page)
  - [Composants d'artistes](#composants-dartistes)
  - [Composants de concerts](#composants-de-concerts)
  - [Composants de contrats](#composants-de-contrats)
  - [Composants de lieux](#composants-de-lieux)
  - [Composants de programmateurs](#composants-de-programmateurs)
  - [Composants de structures](#composants-de-structures)
  - [Composants de paramétrage](#composants-de-paramétrage)
  - [Composants PDF](#composants-pdf)
  - [Composants moléculaires](#composants-moléculaires)
  - [Composants de validation](#composants-de-validation)
- [Services](#services)
- [Pages](#pages)
- [Utilitaires](#utilitaires)
- [Contextes](#contextes)
- [Flux de travail principaux](#flux-de-travail-principaux)
  - [Création et gestion de concerts](#création-et-gestion-de-concerts)
  - [Gestion des contrats](#gestion-des-contrats)
  - [Gestion des artistes](#gestion-des-artistes)

## Introduction

TourCraft est une application de gestion de booking pour concerts et événements musicaux. Elle permet de gérer l'ensemble du processus de booking, de la prise de contact initiale avec les programmateurs, à la signature du contrat et au suivi post-événement.

## Structure du projet

Le projet est organisé en plusieurs dossiers principaux :
- `src/components` : Contient tous les composants React, organisés par domaine fonctionnel
- `src/hooks` : Contient les hooks personnalisés, organisés par domaine fonctionnel
- `src/pages` : Les pages principales de l'application
- `src/services` : Services pour la communication avec les APIs externes
- `src/utils` : Fonctions utilitaires
- `src/context` : Contextes React pour la gestion de l'état global
- `src/styles` : Fichiers CSS et modules de style

## Hooks

### Hooks communs

#### hooks/common/useEntitySearch.js
**But :** Fournir une fonctionnalité de recherche réutilisable pour différents types d'entités (artistes, lieux, programmateurs, etc.)  
**Paramètres :** 
- `options: object` - Options de configuration incluant:
  - `entityType: string` - Type d'entité à rechercher ('lieux', 'programmateurs', 'artistes', 'concerts')
  - `searchField: string` - Champ sur lequel effectuer la recherche principale (par défaut: 'nom')
  - `additionalSearchFields: string[]` - Champs supplémentaires pour la recherche (optionnel)
  - `maxResults: number` - Nombre maximum de résultats (par défaut: 10)
  - `onSelect: Function` - Callback pour la sélection d'une entité
  - `filterResults: Function` - Fonction de filtrage des résultats
  - `allowCreate: boolean` - Autorise la création d'entités (par défaut: true)

**Dépendances :** 
- Firebase (collection, query, where, limit, getDocs, doc, setDoc, orderBy, serverTimestamp)
- React (useState, useRef, useEffect)

**Fonctionnalités principales :**
- Recherche d'entités dans Firestore avec debounce
- Filtrage des résultats 
- Sélection d'entités existantes
- Création de nouvelles entités

**API retournée :**
- `searchTerm` & `setSearchTerm` : Gestion du terme de recherche
- `results` : Résultats de la recherche
- `isSearching`, `showResults` : États de l'interface
- `selectedEntity`, `setSelectedEntity` : Gestion de l'entité sélectionnée
- `handleSelect`, `handleRemove`, `handleCreate` : Fonctions d'interaction
- `performSearch` : Fonction de recherche
- `dropdownRef` : Référence pour la gestion du dropdown

**Utilisation :** Ce hook est utilisé dans de nombreux formulaires et composants pour rechercher et sélectionner des entités (artistes, lieux, programmateurs) à associer.

#### hooks/common/useResponsive.js
**But :** Fournir une API pour adapter l'interface selon la taille d'écran  
**Paramètres :** Aucun

**Dépendances :**
- React (useState, useEffect)
- Window API pour les dimensions d'écran

**Fonctionnalités principales :**
- Détection de la taille d'écran
- Détection de l'orientation (portrait/paysage)
- Définition des breakpoints pour responsive design

**API retournée :**
- `isMobile`, `isTablet`, `isDesktop` : Boolean indiquant le type d'appareil
- `isPortrait`, `isLandscape` : Boolean indiquant l'orientation
- `screenWidth`, `screenHeight` : Dimensions actuelles de l'écran
- `breakpoints` : Objet contenant les valeurs des breakpoints

#### hooks/common/useTheme.js
**But :** Gérer le thème de l'application (sombre/clair)  
**Paramètres :** Aucun

**Fonctionnalités :**
- Basculement entre thème clair et sombre
- Persistance du choix de thème
- Application des styles CSS correspondants

### Hooks pour les concerts

#### hooks/concerts/useConcertDetails.js
**But :** Gérer les détails d'un concert, y compris le chargement des données, l'édition, la suppression et les interactions avec les entités associées (artistes, lieux, programmateurs).  
**Paramètres :** 
- `id: string` - L'identifiant du concert
- `location: object` - L'objet de location React Router

**Dépendances :** 
- Firebase (db, doc, getDoc, updateDoc, deleteDoc)
- React Router (useNavigate)
- Hooks personnalisés (useEntitySearch, useConcertStatus, useConcertFormsManagement, useConcertAssociations)
- Utilitaires (formatDate, formatMontant, isDatePassed, copyToClipboard, getCacheKey)

**Fonctionnalités principales :**
- Chargement des données du concert et des entités associées (lieu, programmateur, artiste)
- Gestion de l'édition du concert avec validation du formulaire
- Suppression du concert avec nettoyage des références
- Gestion des formulaires liés au concert
- Gestion du statut du concert
- Rafraîchissement des données
- Utilitaires pour le formatage et l'affichage des données

**API retournée :**
- Données principales (concert, lieu, programmateur, artiste, loading, isSubmitting)
- États du formulaire (formData, formDataStatus, showFormGenerator, generatedFormLink)
- Mode d'édition (isEditMode, formState)
- Fonctions de recherche d'entités (lieuSearch, programmateurSearch, artisteSearch)
- Fonctions de gestion (handleChange, handleSubmit, handleDelete, toggleEditMode, validateForm)
- Fonctions utilitaires (copyToClipboard, formatDate, formatMontant, isDatePassed, getStatusInfo)

**Utilisation :** Ce hook est utilisé dans les composants de page et de détail de concert pour gérer toutes les interactions avec les données de concert.

#### hooks/concerts/useConcertAssociations.js
**But :** Gérer les associations bidirectionnelles entre concerts et autres entités  
**Paramètres :** Aucun

**Fonctionnalités principales :**
- Mise à jour des associations concert-programmateur
- Mise à jour des associations concert-artiste
- Gestion des références croisées dans Firestore

#### hooks/concerts/useConcertStatus.js
**But :** Gérer les statuts d'un concert et les transitions d'état  
**Paramètres :** Aucun

**Fonctionnalités principales :**
- Fourniture de la liste des statuts possibles
- Logique de transition entre statuts
- Validation des transitions de statut

#### hooks/concerts/useConcertFormsManagement.js
**But :** Gérer les formulaires associés à un concert  
**Paramètres :**
- `id: string` - L'identifiant du concert

**Fonctionnalités principales :**
- Génération de formulaires personnalisés
- Stockage des formulaires
- Validation des réponses aux formulaires

### Hooks pour les contrats

#### hooks/contrats/useContratGenerator.js
**But :** Gérer la génération de contrats à partir de templates  
**Paramètres :**
- `concert: object` - L'objet concert
- `programmateur: object` - L'objet programmateur
- `artiste: object` - L'objet artiste
- `lieu: object` - L'objet lieu

**Dépendances :**
- Firebase (db et diverses fonctions Firestore)
- React (useState, useEffect)

**Fonctionnalités principales :**
- Chargement des templates de contrat
- Préparation des variables pour injection dans les templates
- Génération de PDF
- Sauvegarde des contrats générés
- Gestion des erreurs

**API retournée :**
- États des templates (templates, selectedTemplateId, selectedTemplate)
- États de génération (loading, generatingPdf, pdfUrl)
- Données contextuelles (entrepriseInfo, contratId)
- États d'interface (errorMessage, showErrorAlert, showSuccessAlert, showDebugInfo)
- Fonctions de validation et traitement (validateDataBeforeGeneration, handleTemplateChange, prepareContractVariables, saveGeneratedContract)
- Fonctions utilitaires (toggleDebugInfo, resetAlerts, showSuccess, setPdfUrl)

**Utilisation :** Ce hook est utilisé pour générer des contrats PDF à partir de templates, en injectant les données du concert, de l'artiste, du programmateur et du lieu.

#### hooks/contrats/useContratTemplateEditor.js
**But :** Édition des templates de contrat  
**Paramètres :**
- `id: string` - ID du template à éditer

**Fonctionnalités principales :**
- Chargement et sauvegarde des templates
- Édition interactive des différentes sections
- Prévisualisation des modifications

#### hooks/contrats/usePdfPreview.js
**But :** Générer et afficher des prévisualisations de documents PDF  
**Paramètres :**
- `htmlContent: string` - Contenu HTML à convertir en PDF
- `options: object` - Options de mise en page et de style

**Fonctionnalités principales :**
- Conversion HTML vers PDF
- Prévisualisation de PDF
- Téléchargement de PDF

### Hooks pour les artistes

#### hooks/artistes/useArtistesList.js
**But :** Gérer la liste des artistes avec filtrage et pagination  
**Paramètres :** Aucun

**Fonctionnalités principales :**
- Chargement paginé de la liste des artistes
- Filtrage et recherche
- Tri des résultats

#### hooks/artistes/useArtisteSearch.js
**But :** Recherche spécialisée pour les artistes  
**Paramètres :**
- `options: object` - Options supplémentaires pour la recherche

**Fonctionnalités principales :**
- Recherche adaptée au contexte des artistes
- Filtrage par genre
- Tri par popularité ou date de création

### Hooks pour les paramétrages

#### hooks/parametres/useEntrepriseForm.js
**But :** Gestion du formulaire des informations d'entreprise  
**Paramètres :** Aucun

**Fonctionnalités principales :**
- Chargement et sauvegarde des données d'entreprise
- Validation du formulaire
- Gestion des logos et images d'entreprise

## Composants

### Composants UI

#### components/ui/Button.js
**But :** Composant réutilisable de bouton avec différentes variantes  
**Props :** 
- `label: string` - Texte du bouton
- `onClick: () => void` - Fonction de callback
- `variant: 'primary'|'secondary'|'danger'|'success'|'outline'` - Style du bouton
- `size: 'small'|'medium'|'large'` - Taille du bouton
- `isLoading: boolean` - État de chargement
- `icon: ReactNode` - Icône optionnelle
- `className: string` - Classes CSS additionnelles

**Dépendances :** 
- React
- Modules CSS
- Contexte de thème

**Utilisation :** Utilisé dans toute l'application pour les actions utilisateur (soumission de formulaire, navigation, actions CRUD).

#### components/ui/ActionButton.js
**But :** Bouton spécialisé pour les actions contextuelles avec support d'icônes et de tooltips  
**Props :** 
- `icon: ReactNode` - Icône du bouton
- `onClick: () => void` - Fonction de callback
- `tooltip: string` - Texte du tooltip
- `variant: 'primary'|'secondary'|'danger'|'ghost'` - Style du bouton
- `disabled: boolean` - État désactivé

**Dépendances :** 
- components/ui/Button.js
- Modules CSS

**Utilisation :** Actions contextuelles dans les listes, tableaux et détails d'entités.

#### components/ui/Badge.js
**But :** Afficher une étiquette stylisée pour les statuts, catégories, etc.  
**Props :** 
- `text: string` - Texte à afficher
- `color: string` - Couleur du badge
- `size: 'small'|'medium'|'large'` - Taille du badge
- `icon: ReactNode` - Icône optionnelle

**Dépendances :** 
- Modules CSS

**Utilisation :** Affichage de statuts, catégories, tags dans les listes et détails.

#### components/ui/StatutBadge.js
**But :** Badge spécialisé pour l'affichage des statuts d'entités (concerts, contrats, etc.)  
**Props :** 
- `status: string` - Code du statut
- `compact: boolean` - Mode d'affichage compact
- `date: string` - Date associée au statut

**Dépendances :** 
- components/ui/Badge.js
- utils/formatters.js

**Utilisation :** Affichage des statuts de concerts, contrats et autres entités.

#### components/ui/AddressDisplay.js
**But :** Afficher une adresse formatée  
**Props :** 
- `address: object` - Objet contenant les éléments d'adresse
- `compact: boolean` - Mode d'affichage compact

**Dépendances :** 
- Modules CSS

**Utilisation :** Affichage d'adresses dans les détails de lieux, programmateurs, etc.

#### components/ui/AddressInput.js
**But :** Champ de saisie d'adresse avec autocomplétion  
**Props :** 
- `value: object` - Valeur actuelle de l'adresse
- `onChange: (address) => void` - Fonction appelée lors du changement
- `error: string` - Message d'erreur

**Dépendances :** 
- hooks/useLocationIQ.js
- Modules CSS

**Utilisation :** Formulaires de lieux, programmateurs, structures.

#### components/ui/ContactDisplay.js
**But :** Afficher les informations de contact (téléphone, email, réseaux sociaux)  
**Props :** 
- `contact: object` - Objet contenant les informations de contact
- `type: 'full'|'compact'|'icons'` - Style d'affichage

**Dépendances :** 
- Modules CSS
- utils/formatters.js

**Utilisation :** Fiches de contact dans les détails d'artistes, programmateurs, etc.

#### components/ui/EntitySearchField.js
**But :** Champ de recherche pour trouver des entités (artistes, lieux, programmateurs)  
**Props :** 
- `entityType: string` - Type d'entité à rechercher
- `onSelect: (entity) => void` - Fonction appelée lors de la sélection
- `placeholder: string` - Texte de placeholder
- `allowCreate: boolean` - Autoriser la création de nouvelles entités

**Dépendances :** 
- hooks/common/useEntitySearch.js
- Modules CSS

**Utilisation :** Formulaires nécessitant la sélection d'entités existantes.

#### components/ui/SectionTitle.js
**But :** Titre de section réutilisable avec options de style  
**Props :** 
- `title: string` - Texte du titre
- `subtitle: string` - Sous-titre optionnel
- `icon: ReactNode` - Icône optionnelle
- `actions: ReactNode` - Composants d'action à afficher à droite

**Dépendances :** 
- Modules CSS

**Utilisation :** Titres de sections dans les pages et formulaires.

### Composants communs

#### components/common/StatusWithInfo.js
**But :** Afficher un statut avec une info-bulle détaillée  
**Props :** 
- `status: string` - Code du statut
- `info: string` - Information additionnelle
- `type: 'success'|'warning'|'error'|'info'` - Type de statut

**Dépendances :** 
- components/ui/Badge.js
- Modules CSS

**Utilisation :** Affichage des statuts avec contexte supplémentaire.

#### components/common/LoadingSpinner.js
**But :** Indicateur de chargement réutilisable  
**Props :** 
- `size: 'small'|'medium'|'large'` - Taille du spinner
- `message: string` - Message optionnel à afficher
- `overlay: boolean` - Afficher en superposition de l'UI

**Dépendances :** 
- Modules CSS

**Utilisation :** Indication de chargement dans toute l'application.

#### components/common/EmptyState.js
**But :** Afficher un état vide avec illustration et actions  
**Props :** 
- `title: string` - Titre de l'état vide
- `message: string` - Message descriptif
- `icon: ReactNode` - Icône ou illustration
- `action: ReactNode` - Composant d'action (bouton, lien, etc.)

**Dépendances :** 
- Modules CSS

**Utilisation :** États vides dans les listes et tableaux.

### Composants de mise en page

#### components/layout/AppLayout.js
**But :** Mise en page principale de l'application avec navigation et sidebars  
**Props :** 
- `children: ReactNode` - Contenu principal

**Dépendances :** 
- components/layout/Navbar.js
- components/layout/Sidebar.js
- context/AuthContext.js
- hooks/common/useResponsive.js
- Modules CSS

**Utilisation :** Wrapper de mise en page pour toutes les pages authentifiées.

#### components/layout/Navbar.js
**But :** Barre de navigation principale de l'application  
**Props :** 
- `onMenuToggle: () => void` - Callback pour basculer le menu latéral

**Dépendances :** 
- context/AuthContext.js
- hooks/common/useTheme.js
- Modules CSS

**Utilisation :** Partie de la mise en page principale.

#### components/layout/Sidebar.js
**But :** Barre latérale de navigation  
**Props :** 
- `isOpen: boolean` - État d'ouverture
- `onClose: () => void` - Callback pour fermer la sidebar

**Dépendances :** 
- context/AuthContext.js
- hooks/common/useResponsive.js
- Modules CSS

**Utilisation :** Navigation principale de l'application.

#### components/layout/PageHeader.js
**But :** En-tête standard pour les pages  
**Props :** 
- `title: string` - Titre de la page
- `subtitle: string` - Sous-titre optionnel
- `actions: ReactNode` - Actions disponibles pour cette page
- `breadcrumbs: Array` - Fil d'Ariane

**Dépendances :** 
- components/ui/Button.js
- Modules CSS

**Utilisation :** En-tête des pages principales.

### Composants d'artistes

#### components/artistes/ArtisteForm.js
**But :** Formulaire pour la création et l'édition d'artistes  
**Props :** 
- `id: string` - ID de l'artiste (optionnel pour création)
- `onSuccess: () => void` - Callback après sauvegarde réussie

**Dépendances :**
- hooks/artistes/useArtisteForm.js
- components/forms/FormLayout.js
- components/ui/Button.js
- Modules CSS

**Utilisation :** Création et édition d'artistes.

#### components/artistes/ArtistesList.js
**But :** Liste paginée et filtrable des artistes  
**Props :** 
- `onSelect: (artiste) => void` - Callback de sélection d'artiste
- `filter: object` - Critères de filtrage

**Dépendances :**
- hooks/artistes/useArtistesList.js
- components/artistes/sections/ArtistesTable.js
- components/common/EmptyState.js
- Modules CSS

**Utilisation :** Affichage et gestion des artistes.

#### components/artistes/ArtisteDetail.js
**But :** Vue détaillée d'un artiste avec actions  
**Props :** 
- `id: string` - ID de l'artiste
- `compact: boolean` - Affichage compact ou complet

**Dépendances :**
- hooks/artistes/useArtisteDetails.js
- components/ui/ContactDisplay.js
- components/concerts/ConcertsAssociesListe.js
- Modules CSS

**Utilisation :** Affichage détaillé d'un artiste et de ses concerts associés.

#### components/artistes/sections/ArtistesTable.js
**But :** Tableau des artistes avec tri et actions  
**Props :** 
- `artistes: Array` - Liste des artistes à afficher
- `onEdit: (id) => void` - Callback d'édition
- `onDelete: (id) => void` - Callback de suppression
- `onSelect: (artiste) => void` - Callback de sélection

**Dépendances :**
- components/ui/ActionButton.js
- components/ui/Badge.js
- Modules CSS

**Utilisation :** Affichage tabulaire des artistes dans ArtistesList.

### Composants de concerts

#### components/concerts/ConcertForm.js
**But :** Formulaire pour la création et l'édition de concerts  
**Props :** 
- `id: string` - ID du concert (optionnel pour création)
- `onSuccess: () => void` - Callback après sauvegarde réussie

**Dépendances :**
- hooks/concerts/useConcertForm.js
- components/ui/EntitySearchField.js
- components/forms/FormLayout.js
- Modules CSS

**Utilisation :** Création et édition de concerts.

#### components/concerts/ConcertsList.js
**But :** Liste paginée et filtrable des concerts  
**Props :** 
- `filter: object` - Critères de filtrage
- `onSelect: (concert) => void` - Callback de sélection

**Dépendances :**
- hooks/concerts/useConcertsList.js
- components/concerts/sections/ConcertsTable.js
- components/common/EmptyState.js
- Modules CSS

**Utilisation :** Affichage et gestion des concerts.

#### components/concerts/ConcertDetail.js
**But :** Vue détaillée d'un concert avec actions  
**Props :** 
- `id: string` - ID du concert
- `compact: boolean` - Affichage compact ou complet

**Dépendances :**
- hooks/concerts/useConcertDetails.js
- components/ui/StatutBadge.js
- components/contrats/ContratSection.js
- Modules CSS

**Utilisation :** Affichage détaillé d'un concert et de ses entités associées.

#### components/concerts/ConcertStatusBadge.js
**But :** Afficher le statut d'un concert avec code couleur approprié  
**Props :** 
- `status: string` - Statut du concert
- `compact: boolean` - Affichage compact ou normal
- `date: string` - Date du concert pour contextualiser le statut

**Dépendances :**
- components/ui/Badge.js
- utils/formatters.js
- Modules CSS

**Utilisation :** Affichage des statuts de concerts.

### Composants de contrats

#### components/contrats/ContratGenerator.js
**But :** Générateur de contrats à partir de templates  
**Props :** 
- `concertId: string` - ID du concert associé
- `onContratGenerated: (url) => void` - Callback après génération du PDF

**Dépendances :**
- hooks/contrats/useContratGenerator.js
- components/ui/Button.js
- components/contrats/TemplateSelector.js
- Modules CSS

**Utilisation :** Génération de contrats pour les concerts.

#### components/contrats/ContratSection.js
**But :** Section de gestion des contrats dans la page de détails d'un concert  
**Props :** 
- `concertId: string` - ID du concert associé
- `artisteId: string` - ID de l'artiste associé
- `programmateurId: string` - ID du programmateur associé

**Dépendances :**
- hooks/contrats/useContratDetails.js
- components/ui/SectionTitle.js
- components/contrats/ContratActions.js
- Modules CSS

**Utilisation :** Gestion des contrats depuis la page de détails d'un concert.

#### components/contrats/TemplateSelector.js
**But :** Sélecteur de templates de contrat avec prévisualisation  
**Props :** 
- `templates: Array` - Liste des templates disponibles
- `selectedId: string` - ID du template sélectionné
- `onChange: (id) => void` - Callback de changement de sélection

**Dépendances :**
- components/ui/Button.js
- Modules CSS

**Utilisation :** Sélection de templates dans le générateur de contrats.

### Composants de lieux

#### components/lieux/LieuForm.js
**But :** Formulaire pour la création et l'édition de lieux  
**Props :** 
- `id: string` - ID du lieu (optionnel pour création)
- `onSuccess: () => void` - Callback après sauvegarde réussie

**Dépendances :**
- hooks/lieux/useLieuForm.js
- components/ui/AddressInput.js
- components/forms/FormLayout.js
- Modules CSS

**Utilisation :** Création et édition de lieux.

#### components/lieux/LieusList.js
**But :** Liste paginée et filtrable des lieux  
**Props :** 
- `filter: object` - Critères de filtrage
- `onSelect: (lieu) => void` - Callback de sélection

**Dépendances :**
- hooks/lieux/useLieusList.js
- components/lieux/sections/LieuxTable.js
- components/common/EmptyState.js
- Modules CSS

**Utilisation :** Affichage et gestion des lieux.

#### components/lieux/LieuDetail.js
**But :** Vue détaillée d'un lieu avec actions  
**Props :** 
- `id: string` - ID du lieu
- `compact: boolean` - Affichage compact ou complet

**Dépendances :**
- hooks/lieux/useLieuDetails.js
- components/ui/AddressDisplay.js
- components/concerts/ConcertsAssociesListe.js
- Modules CSS

**Utilisation :** Affichage détaillé d'un lieu et de ses concerts associés.

### Composants de programmateurs

#### components/programmateurs/ProgrammateurForm.js
**But :** Formulaire pour la création et l'édition de programmateurs  
**Props :** 
- `id: string` - ID du programmateur (optionnel pour création)
- `onSuccess: () => void` - Callback après sauvegarde réussie

**Dépendances :**
- hooks/programmateurs/useProgrammateurForm.js
- components/forms/FormLayout.js
- components/ui/EntitySearchField.js
- Modules CSS

**Utilisation :** Création et édition de programmateurs.

#### components/programmateurs/ProgrammateursList.js
**But :** Liste paginée et filtrable des programmateurs  
**Props :** 
- `filter: object` - Critères de filtrage
- `onSelect: (programmateur) => void` - Callback de sélection

**Dépendances :**
- hooks/programmateurs/useProgrammateursList.js
- components/programmateurs/sections/ProgrammateursTable.js
- components/common/EmptyState.js
- Modules CSS

**Utilisation :** Affichage et gestion des programmateurs.

#### components/programmateurs/ProgrammateurDetail.js
**But :** Vue détaillée d'un programmateur avec actions  
**Props :** 
- `id: string` - ID du programmateur
- `compact: boolean` - Affichage compact ou complet

**Dépendances :**
- hooks/programmateurs/useProgrammateurDetails.js
- components/ui/ContactDisplay.js
- components/concerts/ConcertsAssociesListe.js
- Modules CSS

**Utilisation :** Affichage détaillé d'un programmateur et de ses concerts associés.

### Composants de structures

#### components/structures/StructureForm.js
**But :** Formulaire pour la création et l'édition de structures  
**Props :** 
- `id: string` - ID de la structure (optionnel pour création)
- `onSuccess: () => void` - Callback après sauvegarde réussie

**Dépendances :**
- hooks/structures/useStructureForm.js
- components/forms/FormLayout.js
- components/ui/AddressInput.js
- Modules CSS

**Utilisation :** Création et édition de structures.

#### components/structures/StructuresList.js
**But :** Liste paginée et filtrable des structures  
**Props :** 
- `filter: object` - Critères de filtrage
- `onSelect: (structure) => void` - Callback de sélection

**Dépendances :**
- hooks/structures/useStructuresList.js
- components/structures/sections/StructuresTable.js
- components/common/EmptyState.js
- Modules CSS

**Utilisation :** Affichage et gestion des structures.

#### components/structures/StructureDetail.js
**But :** Vue détaillée d'une structure avec actions  
**Props :** 
- `id: string` - ID de la structure
- `compact: boolean` - Affichage compact ou complet

**Dépendances :**
- hooks/structures/useStructureDetails.js
- components/ui/AddressDisplay.js
- components/programmateurs/ProgrammateursAssociesListe.js
- Modules CSS

**Utilisation :** Affichage détaillé d'une structure et de ses programmateurs associés.

### Composants de paramétrage

#### components/parametres/ParametresEntreprise.js
**But :** Gestion des informations de l'entreprise utilisatrice  
**Props :** Aucune

**Dépendances :**
- hooks/parametres/useEntrepriseForm.js
- components/parametres/sections/EntrepriseFormFields.js
- components/parametres/sections/EntrepriseLegalSection.js
- Modules CSS

**Utilisation :** Configuration des informations d'entreprise.

#### components/parametres/ParametresExport.js
**But :** Configuration des exports de données  
**Props :** Aucune

**Dépendances :**
- hooks/parametres/useExportConfig.js
- components/ui/Button.js
- Modules CSS

**Utilisation :** Configuration et déclenchement des exports de données.

#### components/parametres/ParametresNotifications.js
**But :** Configuration des préférences de notification  
**Props :** Aucune

**Dépendances :**
- hooks/parametres/useNotificationsConfig.js
- components/forms/FormLayout.js
- Modules CSS

**Utilisation :** Configuration des préférences de notification.

#### components/parametres/ParametresApparence.js
**But :** Configuration de l'apparence de l'application  
**Props :** Aucune

**Dépendances :**
- hooks/common/useTheme.js
- components/forms/FormLayout.js
- Modules CSS

**Utilisation :** Personnalisation de l'apparence de l'application.

### Composants PDF

#### components/pdf/PDFWrapper.js
**But :** Composant de base pour le rendu PDF  
**Props :** 
- `children: ReactNode` - Contenu à rendre en PDF
- `pageSize: 'A4'|'Letter'|'Legal'` - Format de page
- `orientation: 'portrait'|'landscape'` - Orientation de la page

**Dépendances :**
- Bibliothèque de génération PDF
- Styles CSS spécifiques au PDF

**Utilisation :** Base pour tous les documents PDF générés.

#### components/pdf/ContratPDF.js
**But :** Modèle de document PDF pour les contrats  
**Props :** 
- `contratData: object` - Données du contrat
- `template: object` - Structure du template
- `variables: object` - Variables à injecter

**Dépendances :**
- components/pdf/PDFWrapper.js
- components/pdf/sections/PDFHeader.js
- components/pdf/sections/PDFFooter.js
- Styles CSS spécifiques au PDF

**Utilisation :** Génération des documents contractuels en PDF.

#### components/pdf/FacturePDF.js
**But :** Modèle de document PDF pour les factures  
**Props :** 
- `factureData: object` - Données de la facture
- `entrepriseInfo: object` - Informations de l'entreprise émettrice
- `destinataire: object` - Informations du destinataire

**Dépendances :**
- components/pdf/PDFWrapper.js
- components/pdf/sections/PDFHeader.js
- components/pdf/sections/PDFFooter.js
- Styles CSS spécifiques au PDF

**Utilisation :** Génération des factures en PDF.

## Services

### services/firebaseService.js
**But :** Centraliser et abstraire les interactions avec Firebase  
**Méthodes principales :**
- `getDocument(collection, id)` - Récupérer un document
- `getCollection(collection, query)` - Récupérer une collection
- `addDocument(collection, data)` - Ajouter un document
- `updateDocument(collection, id, data)` - Mettre à jour un document
- `deleteDocument(collection, id)` - Supprimer un document

### services/pdfService.js
**But :** Gestion de la génération et manipulation de documents PDF  
**Méthodes principales :**
- `generatePdf(html, options)` - Générer un PDF à partir d'HTML
- `uploadPdf(file)` - Envoyer un PDF sur le serveur
- `getPdfUrl(path)` - Obtenir l'URL d'un PDF stocké

### services/locationService.js
**But :** Services d'API géographique pour les adresses  
**Méthodes principales :**
- `searchAddress(query)` - Rechercher une adresse
- `getCoordinates(address)` - Obtenir les coordonnées GPS d'une adresse
- `getAddressFromCoordinates(lat, lng)` - Géocodage inversé

## Utilitaires

### utils/formatters.js
**But :** Fonctions de formatage pour les dates, montants, etc.  
**Fonctions principales :**
- `formatDate(date, format)` - Formater une date
- `formatMontant(amount)` - Formater un montant monétaire
- `isDatePassed(date)` - Vérifier si une date est passée
- `copyToClipboard(text)` - Copier un texte dans le presse-papier
- `getCacheKey(id)` - Générer une clé de cache unique

### utils/validators.js
**But :** Fonctions de validation pour les formulaires  
**Fonctions principales :**
- `validateEmail(email)` - Valider une adresse email
- `validatePhone(phone)` - Valider un numéro de téléphone
- `validateRequired(value)` - Vérifier qu'une valeur est présente
- `validatePostalCode(code)` - Valider un code postal français

## Contextes

### context/AuthContext.js
**But :** Gestion de l'état d'authentification  
**Fonctionnalités :**
- État utilisateur connecté
- Fonctions de login/logout
- Vérification des permissions
- Persistance de la session

### context/ParametresContext.js
**But :** Gestion des paramètres de l'application  
**Fonctionnalités :**
- Paramètres globaux de l'application
- Informations de l'entreprise
- Préférences utilisateur
- Paramètres d'interface

## Flux de travail principaux

### Création et gestion de concerts

Le flux de travail de gestion de concert dans TourCraft suit plusieurs étapes clés :

1. **Création initiale du concert**
   - L'utilisateur crée un nouveau concert avec les informations de base (date, titre)
   - Association d'un lieu existant ou création d'un nouveau lieu
   - Association d'un artiste existant ou création d'un nouvel artiste
   - Association d'un programmateur existant ou création d'un nouveau programmateur

2. **Prise de contact avec le programmateur**
   - Génération d'un formulaire personnalisé pour le programmateur
   - Envoi du formulaire par email
   - Le programmateur remplit le formulaire avec ses informations et ses besoins

3. **Validation du formulaire rempli**
   - L'utilisateur valide les informations fournies par le programmateur
   - Mise à jour du statut du concert vers "préaccord"

4. **Génération du contrat**
   - Sélection d'un template de contrat
   - Personnalisation du contrat avec les informations du concert, de l'artiste, du lieu et du programmateur
   - Génération du PDF du contrat

5. **Finalisation du contrat**
   - Envoi du contrat au programmateur
   - Suivi de la signature
   - Mise à jour du statut vers "contrat signé"

6. **Facturation et suivi financier**
   - Génération de la facture d'acompte
   - Suivi du paiement de l'acompte
   - Après le concert, génération de la facture du solde
   - Suivi du paiement du solde

### Gestion des contrats

La gestion des contrats dans TourCraft est un processus en plusieurs étapes :

1. **Création de templates de contrat**
   - Création de templates HTML avec variables de substitution
   - Définition des sections (en-tête, pied de page, corps)
   - Configuration des styles et de la mise en page

2. **Génération de contrats**
   - Sélection du template approprié pour un concert
   - Injection des données spécifiques au concert
   - Prévisualisation et ajustements
   - Génération du PDF final

3. **Cycle de vie du contrat**
   - Envoi du contrat
   - Suivi de la signature
   - Archivage des contrats signés
   - Génération de rappels si nécessaire

### Gestion des artistes

Le module de gestion des artistes comprend les fonctionnalités suivantes :

1. **Fiche artiste**
   - Informations de base (nom, genre, description)
   - Contacts et réseaux sociaux
   - Historique des concerts
   - Documents associés (riders techniques, fiches promo)

2. **Planification des tournées**
   - Visualisation des dates de concert sur un calendrier
   - Optimisation des déplacements
   - Gestion des disponibilités

3. **Suivi des performances**
   - Évaluation post-concert
   - Métriques de performance (affluence, ventes)
   - Retours des programmateurs