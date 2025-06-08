# Gestion des contrats

## Introduction

La gestion des contrats dans TourCraft est un processus central qui facilite la formalisation des accords entre les artistes et les programmateurs. Ce module permet de générer, suivre et gérer les contrats tout au long de leur cycle de vie.

## Processus de gestion des contrats

### 1. Création de templates de contrat

Avant de pouvoir générer des contrats, il est nécessaire de créer des templates qui serviront de base:

- **Templates HTML avec variables**
  - Les templates sont définis en HTML avec des variables de substitution au format `{{variable}}`
  - Les variables permettent de personnaliser automatiquement chaque contrat

- **Organisation des sections**
  - En-tête (avec logo et informations de l'entreprise)
  - Corps du contrat (clauses, conditions, termes spécifiques)
  - Pied de page (mentions légales, signatures)

- **Style et mise en page**
  - Définition des styles CSS pour la mise en page professionnelle
  - Formats de page configurables (A4, Letter)
  - Orientations configurables (portrait, paysage)

### 2. Génération de contrats

Une fois le template choisi, le processus de génération suit ces étapes:

- **Sélection du template**
  - L'utilisateur choisit le template approprié pour un concert
  - Interface de sélection avec prévisualisations

- **Injection des données**
  - Informations du concert (date, lieu, heure, etc.)
  - Informations de l'artiste (nom, détails, conditions techniques)
  - Informations du programmateur (structure, contacts)
  - Informations du lieu (adresse, capacité)
  - Conditions financières (cachet, modalités de paiement)

- **Prévisualisation et ajustements**
  - Aperçu du contrat généré
  - Possibilité d'ajuster les valeurs ou de modifier le template

- **Génération PDF finale**
  - Conversion du HTML en PDF
  - Options d'optimisation (qualité, taille de fichier)
  - Protection optionnelle du document

### 3. Cycle de vie du contrat

Une fois le contrat généré, son cycle de vie peut être suivi et géré:

- **Envoi du contrat**
  - Envoi par email directement depuis l'application
  - Suivi de la réception (accusés de réception)
  - Message personnalisable

- **Suivi de la signature**
  - Enregistrement de la date d'envoi
  - Rappels automatiques si non-signé après X jours
  - Enregistrement de la date de signature

- **Archivage et stockage**
  - Stockage sécurisé des contrats signés
  - Organisation par concert, artiste, ou programmateur
  - Historique des versions (si modifications)

- **Rappels et alertes**
  - Rappels pour les contrats non-retournés
  - Alertes sur les échéances de paiement
  - Notifications de modifications

## Composants et hooks utilisés

### Composants principaux

- `ContratGenerator`: Interface pour générer un contrat
- `TemplateSelector`: Sélection du template avec prévisualisation
- `ContratSection`: Gestion des contrats dans la page de détail d'un concert
- `ContratActions`: Actions disponibles pour un contrat (envoyer, télécharger, etc.)

### Hooks principaux

- `useContratGenerator`: Logique de génération de contrat
- `useContratTemplateEditor`: Édition des templates
- `usePdfPreview`: Prévisualisation de documents PDF

## Intégration avec les autres modules

- **Concerts**: Un contrat est toujours lié à un concert spécifique
- **Artistes**: Les informations de l'artiste sont incluses dans le contrat
- **Programmateurs**: Le contrat est établi avec un programmateur spécifique
- **Paramètres**: Les informations de l'entreprise sont utilisées dans l'en-tête et le pied de page

## Statuts de contrat

Les contrats peuvent avoir différents statuts qui reflètent leur progression:

1. **Brouillon**: Le contrat a été généré mais n'est pas encore envoyé
2. **Envoyé**: Le contrat a été envoyé au programmateur
3. **En attente de signature**: Le programmateur a reçu le contrat mais ne l'a pas encore signé
4. **Signé**: Le contrat a été signé par toutes les parties
5. **Annulé**: Le contrat a été annulé (concert annulé ou remplacé)
6. **Modifié**: Une nouvelle version du contrat a été générée suite à des changements

## Navigation
- [Retour à la documentation principale](../README.md)
- [Documentation des hooks des contrats](../hooks/CONTRAT_HOOKS.md)
- [Documentation des composants de contrats](../components/CONTRATS_COMPONENTS.md)
- [Documentation du workflow de concerts](./CONCERT_WORKFLOW.md)
- [Documentation du workflow des associations](./ASSOCIATION_WORKFLOW.md)