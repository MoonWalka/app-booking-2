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
    │   ├── ui/           # Composants UI réutilisables (Button, Badge, etc.)
    │   ├── common/       # Composants partagés (Layout, etc.)
    │   └── [entity]/     # Composants spécifiques aux entités
    │       ├── desktop/  # Version desktop
    │       ├── mobile/   # Version mobile
    │       └── sections/ # Sections de page
    ├── context/
    │   └── AuthContext.js
    ├── hooks/
    │   ├── common/       # Hooks partagés et standardisés
    │   └── [entity]/     # Hooks spécifiques aux entités
    ├── docs/             # Documentation interne
    │   └── hooks/        # Documentation des standards pour les hooks
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

## Directives de développement

### Hooks standardisés

Depuis Mai 2025, les hooks de recherche d'adresse et d'entreprise ont été standardisés. Consultez la [documentation de standardisation des hooks](./src/docs/hooks/StandardisationHooks.md) pour plus de détails. Principes clés :

- Les hooks partagés sont dans `/hooks/common/`
- Importez toujours depuis `@/hooks/common` pour les hooks communs
- Ne dupliquez pas la logique des hooks communs dans des hooks spécifiques

### Composants UI

Les composants UI réutilisables se trouvent dans `/components/ui/`.

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
