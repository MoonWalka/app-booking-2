# Guide Utilisateur - Formulaire Programmateur TourCraft

## Introduction

Le nouveau formulaire programmateur de TourCraft offre une interface moderne et intuitive pour créer et modifier les informations des programmateurs. Basé sur une maquette professionnelle, il intègre toutes les fonctionnalités nécessaires pour une gestion complète des contacts, structures et associations.

## Accès au Formulaire

### Création d'un Nouveau Programmateur
1. Accédez à la **Liste des Programmateurs** via le menu principal
2. Cliquez sur le bouton **"Nouveau Programmateur"**
3. Le formulaire s'ouvre en mode création

### Modification d'un Programmateur Existant
1. Dans la **Liste des Programmateurs**, cliquez sur un programmateur
2. Dans la page de détails, cliquez sur **"Modifier"**
3. Le formulaire s'ouvre en mode édition avec les données pré-remplies

## Interface du Formulaire

### En-tête (Header)
L'en-tête contient :
- **Titre dynamique** : "Nouveau Programmateur" ou "Modifier Programmateur"
- **Boutons d'action** :
  - 🟢 **Enregistrer** : Sauvegarde les modifications
  - 🔵 **Annuler** : Retour sans enregistrer
  - 🔴 **Supprimer** : Suppression (uniquement en mode édition)

### Sections du Formulaire

## 1. Informations de Contact

Cette section contient les données personnelles du programmateur.

### Champs Disponibles
- **Prénom*** (obligatoire) : Prénom du contact
- **Nom*** (obligatoire) : Nom de famille
- **Email*** (obligatoire) : Adresse email professionnelle
- **Téléphone** : Numéro de téléphone (format libre)
- **Adresse** : Adresse postale complète
- **Code postal** : Code postal français
- **Ville** : Ville de résidence

### Conseils de Saisie
- Les champs marqués d'un **astérisque rouge*** sont obligatoires
- L'email doit respecter le format standard (exemple@domaine.com)
- Le téléphone accepte tous les formats (fixes, mobiles, internationaux)

## 2. Structure

Cette section gère les informations de l'organisation du programmateur.

### Champs Disponibles
- **Nom de la structure** : Raison sociale de l'organisation
- **Type de structure** : Menu déroulant avec les options :
  - Association
  - SAS (Société par Actions Simplifiée)
  - SARL (Société À Responsabilité Limitée)
  - Entreprise individuelle
  - Autre
- **SIRET** : Numéro SIRET français (14 chiffres)
- **Site web** : URL du site internet (format: https://...)

### Validation Automatique
- Le **SIRET** est vérifié automatiquement (format français)
- L'**URL** doit commencer par http:// ou https://

## 3. Recherche de Structure

Cette section permet d'associer une structure existante ou d'en créer une nouvelle.

### Fonctionnement
1. **Saisie** : Tapez le nom de la structure ou son SIRET (minimum 2 caractères)
2. **Recherche** : L'API gouvernementale française est interrogée en temps réel
3. **Résultats** : Une liste de suggestions apparaît avec :
   - Nom de l'entreprise
   - Numéro SIRET
   - Ville du siège social
4. **Sélection** : Cliquez sur un résultat pour pré-remplir automatiquement

### Actions Disponibles
- **🔍 Rechercher** : Lance la recherche manuellement
- **➕ Nouvelle structure** : Ouvre le formulaire de création de structure

### Avantages
- **Données officielles** : Informations directement depuis la base gouvernementale
- **Pré-remplissage** : Evite les erreurs de saisie
- **Validation** : SIRET automatiquement vérifié

## 4. Ajouter un Lieu

Cette section permet d'associer des lieux de concert au programmateur.

### Fonctionnement
1. **Recherche** : Tapez le nom du lieu ou son adresse
2. **Base TourCraft** : Recherche dans les lieux déjà enregistrés
3. **Résultats** : Affichage avec :
   - Nom du lieu
   - Adresse complète
   - Capacité (si renseignée)
4. **Association** : Clic pour ajouter le lieu au programmateur

### Actions Disponibles
- **🔍 Rechercher** : Recherche dans la base de lieux
- **➕ Nouveau lieu** : Création d'un nouveau lieu

### Critères de Recherche
- Nom du lieu
- Adresse (rue, ville)
- Capacité d'accueil
- Code postal

## 5. Lieux Associés

Affiche la liste des lieux déjà associés au programmateur.

### Informations Affichées
- Nom du lieu
- Adresse complète
- Capacité
- Actions (modifier, supprimer)

### États Possibles
- **Liste remplie** : Affichage en tableau avec actions
- **Aucun lieu** : Message informatif avec suggestion d'ajout

## 6. Concerts Associés

Cette section présente les concerts liés au programmateur.

### Tableau des Concerts
Colonnes affichées :
- **Titre** : Nom du concert
- **Date** : Date de l'événement
- **Lieu** : Lieu de concert
- **Montant** : Budget associé
- **Statut** : État du concert avec badge coloré
  - 🟢 **Confirmé** : Concert validé
  - 🟡 **En attente** : Concert en préparation
- **Actions** : Bouton 👁️ pour voir les détails

### Navigation
- Cliquez sur l'**icône œil** pour accéder aux détails du concert
- Les concerts s'ouvrent dans un nouvel onglet/page

## Fonctionnalités Avancées

### Autocomplétion
- **Adresses** : Suggestions automatiques pour les adresses
- **Structures** : Recherche en temps réel dans l'API gouvernementale
- **Lieux** : Recherche dans la base TourCraft

### Validation Intelligente
- **Format email** : Vérification automatique
- **SIRET** : Contrôle du format français (14 chiffres)
- **URL** : Validation du format web
- **Champs obligatoires** : Indication visuelle en temps réel

### Notifications
- **Succès** : Confirmation verte lors de l'enregistrement
- **Erreurs** : Alerte rouge en cas de problème
- **Information** : Messages bleus pour les conseils

## Raccourcis Clavier

### Navigation
- **Tab** : Passer au champ suivant
- **Shift + Tab** : Revenir au champ précédent
- **Enter** : Valider le formulaire (depuis n'importe quel champ)
- **Escape** : Annuler et retourner

### Recherche
- **Flèches haut/bas** : Naviguer dans les résultats de recherche
- **Enter** : Sélectionner le résultat en surbrillance
- **Escape** : Fermer les résultats de recherche

## Interface Mobile

### Adaptations Automatiques
- **Layout vertical** : Formulaires en colonne unique
- **Boutons agrandis** : Facilité de clic sur mobile
- **Recherche simplifiée** : Interfaces optimisées pour écran tactile
- **Navigation intuitive** : Scroll fluide entre sections

### Fonctionnalités Conservées
- Toutes les fonctionnalités desktop restent disponibles
- Recherche en temps réel maintenue
- Validation automatique active
- Notifications adaptées

## Conseils d'Utilisation

### Workflow Recommandé
1. **Commencer par les informations contact** (obligatoires)
2. **Rechercher la structure** plutôt que saisir manuellement
3. **Associer les lieux** en fin de processus
4. **Vérifier les concerts** associés avant validation

### Bonnes Pratiques
- **Sauvegarde régulière** : Utilisez "Enregistrer" fréquemment
- **Vérification des données** : Contrôlez l'email et le SIRET
- **Recherche précise** : Utilisez des termes spécifiques pour les recherches
- **Association logique** : Liez les lieux pertinents au programmateur

### Gestion des Erreurs
- **Champs manquants** : Suivez les indications visuelles (rouge)
- **Erreurs de format** : Corrigez selon les messages d'aide
- **Échec de sauvegarde** : Vérifiez la connexion et réessayez
- **Données perdues** : Utilisez "Annuler" pour revenir à l'état précédent

## Support et Assistance

### Ressources Disponibles
- **Messages d'aide** : Bulles d'information dans l'interface
- **Validation temps réel** : Indicateurs visuels immédiats
- **Notifications explicites** : Messages d'erreur détaillés

### Contact Support
Pour toute assistance technique :
- **Documentation** : Consultez ce guide
- **Interface** : Utilisez les messages d'aide intégrés
- **Support technique** : Contactez l'équipe TourCraft

---

*Guide mis à jour : 29 Mai 2025*
*Version du formulaire : 2.0.0 (Style Maquette)*
*TourCraft - Gestion de Concerts Professionnelle* 