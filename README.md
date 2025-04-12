# App Booking - Application de Gestion pour Label Indépendant

Application web permettant aux labels indépendants de gérer efficacement leur activité de booking : gestion des dates de concert, centralisation des infos programmateurs et lieux, tâches de relance, génération automatique de contrats en PDF.

## Fonctionnalités principales (version MVP)

- Base concerts avec date, lieu, montant, statut
- Base programmateurs avec infos légales
- Base lieux liée à plusieurs concerts et programmateurs
- Envoi de formulaire de collecte d'infos au programmateur
- Validation et mise à jour des fiches à partir des réponses
- Suivi des relances et des tâches
- Historique des échanges
- Génération automatique de contrat PDF (modèle à variables dynamiques)

## Installation

```bash
# Cloner le dépôt
git clone [URL_DU_DÉPÔT]

# Installer les dépendances
cd app-booking
npm install

# Démarrer l'application en mode développement
npm start
```

## Structure du projet

```
app-booking/
├── public/
└── src/
    ├── components/
    │   └── common/
    │       └── Layout.js
    ├── context/
    │   └── AuthContext.js
    ├── pages/
    │   ├── Dashboard.js
    │   ├── ConcertsPage.js
    │   ├── ProgrammateursPage.js
    │   ├── LieuxPage.js
    │   └── ContratsPage.js
    ├── App.css
    ├── App.js
    ├── firebase.js
    └── index.js
```

## Technologies utilisées

- React.js
- Firebase (Authentication, Firestore, Storage)
- React Router

## Mode développement

En mode développement, l'authentification est en mode bypass pour faciliter les tests. Un utilisateur de test est automatiquement connecté.

## Déploiement

Pour créer une version de production :

```bash
npm run build
```

## Licence

Tous droits réservés
