# Flux de travail : Création et gestion de concerts

## Vue d'ensemble

Le flux de travail de gestion des concerts représente le cœur du métier de booking dans TourCraft. Il couvre tout le cycle de vie d'un concert, depuis la première prise de contact jusqu'à la réalisation de l'événement et son archivage.

## Étapes du processus

### 1. Création du concert

**Description :** Enregistrement initial d'une opportunité de concert.

**Actions utilisateur :**
- Accéder à la page "Concerts"
- Cliquer sur "Nouveau concert"
- Remplir les informations de base (date, artiste, lieu et/ou contact)
- Enregistrer le concert

**Composants impliqués :**
- `pages/ConcertsPage.js`
- `components/concerts/ConcertForm.js`
- `hooks/concerts/useConcertCreation.js`

**Données créées :**
- Nouveau document dans la collection `concerts` avec un statut "initial"
- Associations avec les entités liées (artiste, lieu, contact)

### 1.5. Édition du concert

**Description :** Modification des détails d'un concert existant.

**Actions utilisateur :**
- Cliquer sur le bouton "Modifier" sur la fiche du concert
- Mettre à jour les informations (date, artiste, lieu, statut, notes, etc.)
- Enregistrer les modifications

**Composants impliqués :**
- `components/concerts/ConcertDetails.js` (bouton Modifier)
- `components/concerts/ConcertForm/index.js` (wrapper responsive)
- `components/concerts/desktop/ConcertForm.js` ou `components/concerts/mobile/ConcertForm.js`
- `hooks/concerts/useConcertFormOptimized.js`

**Données modifiées :**
- Mise à jour du document existant dans la collection `concerts`
- Mise à jour des associations avec les entités liées

### 2. Négociation et suivi

**Description :** Échanges avec le contact pour finaliser les détails et conditions du concert.

**Actions utilisateur :**
- Consulter la fiche du concert
- Mettre à jour le statut (en négociation, option, etc.)
- Ajouter des notes et des rappels
- Définir les conditions financières et techniques

**Composants impliqués :**
- `components/concerts/ConcertDetails.js`
- `components/concerts/ConcertStatusManager.js`
- `components/concerts/ConcertNotes.js`
- `hooks/concerts/useConcertStatus.js`

**Transitions de statut :**
- Initial → En négociation → Option → Confirmé

### 3. Collecte d'informations

**Description :** Obtention des informations nécessaires de la part du contact pour finaliser le contrat.

**Actions utilisateur :**
- Générer un formulaire personnalisé pour le contact
- Envoyer le lien du formulaire par email
- Suivre les réponses au formulaire

**Composants impliqués :**
- `components/forms/FormGenerator.js`
- `components/concerts/ConcertFormManager.js`
- `hooks/concerts/useConcertFormsManagement.js`
- `services/emailService.js`

**Données créées/modifiées :**
- Document dans la collection `formulaires` lié au concert
- URL unique pour accéder au formulaire
- Données de réponse au formulaire stockées en base

### 4. Préparation du contrat

**Description :** Création et finalisation du contrat associé au concert.

**Actions utilisateur :**
- Accéder à l'onglet "Contrat" du concert
- Générer un nouveau contrat
- Remplir les détails manquants
- Valider le contrat

**Composants impliqués :**
- `components/contrats/ContratGenerator.js`
- `hooks/contrats/useContratGeneration.js`
- `components/pdf/PDFContratPreview.js`

**Transitions de statut du concert :**
- Confirmé → En attente de contrat → Contrat envoyé

**Création de données :**
- Nouveau document dans la collection `contrats` lié au concert

### 5. Signature et finalisation

**Description :** Envoi, suivi de la signature et finalisation du contrat.

**Actions utilisateur :**
- Envoyer le contrat PDF au contact
- Suivre l'état de la signature
- Mettre à jour le statut du contrat et du concert

**Composants impliqués :**
- `components/contrats/ContratSendOptions.js`
- `components/contrats/SignatureTracker.js`
- `services/documentService.js`

**Transitions de statut :**
- Contrat envoyé → Contrat signé → Terminé

### 6. Suivi post-concert

**Description :** Suivi des obligations après la réalisation du concert.

**Actions utilisateur :**
- Marquer le paiement comme reçu
- Ajouter des notes de débriefing
- Compléter les détails de l'événement (affluence, incidents, etc.)
- Archiver le concert

**Composants impliqués :**
- `components/concerts/ConcertPostEvent.js`
- `hooks/concerts/useConcertPostEvent.js`

## Diagramme de séquence

```
┌─────────────┐           ┌───────────────┐          ┌──────────────┐         ┌───────────────┐
│ Utilisateur │           │ Concert       │          │ Contact      │         │ Contrat       │
└─────┬───────┘           └───────┬───────┘          └──────┬───────┘         └───────┬───────┘
      │                          │                          │                         │
      │  Crée concert            │                          │                         │
      │─────────────────────────>│                          │                         │
      │                          │                          │                         │
      │                          │    Association           │                         │
      │                          │ ─────────────────────────>                         │
      │                          │                          │                         │
      │  Mise à jour statut      │                          │                         │
      │─────────────────────────>│                          │                         │
      │                          │                          │                         │
      │  Génère formulaire       │                          │                         │
      │─────────────────────────>│                          │                         │
      │                          │      Envoi formulaire    │                         │
      │                          │ ─────────────────────────>                         │
      │                          │                          │                         │
      │                          │      Réponse formulaire  │                         │
      │                          │<─────────────────────────                          │
      │                          │                          │                         │
      │  Génère contrat          │                          │                         │
      │─────────────────────────────────────────────────────────────────────────────>│
      │                          │                          │                         │
      │  Envoie contrat          │                          │                         │
      │─────────────────────────────────────────────────────>─────────────────────────>│
      │                          │                          │                         │
      │                          │                          │    Signature            │
      │                          │                          │ ───────────────────────>│
      │                          │                          │                         │
      │  Mise à jour statut      │                          │                         │
      │─────────────────────────>│                          │                         │
      │                          │                          │                         │
```

## Règles métier importantes

### Validations
- Une date doit être spécifiée pour la création d'un concert
- Un concert doit être associé à au moins un artiste
- Un lieu ou un contact doit être spécifié (ou les deux)
- Les informations financières sont requises avant l'état "Confirmé"

### Règles de transition de statut
- Un concert ne peut pas passer à "Contrat envoyé" sans qu'un contrat ne soit généré
- Un concert ne peut pas être marqué comme "Terminé" avant sa date de réalisation
- L'annulation d'un concert nécessite une note explicative

### Associations
- Un concert est toujours associé bidirectionnellement avec ses entités liées
- La modification d'une association (ex: changement de lieu) met à jour toutes les références croisées

## Navigation
- [Retour à la vue d'ensemble des flux de travail](WORKFLOWS.md)
- [Voir le flux de travail des contrats](CONTRAT_WORKFLOW.md)