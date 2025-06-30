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

### Composants standardisés

#### Composant Card

Depuis Mai 2025, une standardisation complète du composant Card a été réalisée. Tous les composants de l'application utilisent désormais le composant Card standardisé. 

- **Import correct** : `import Card from '@/components/ui/Card';`
- **Documentation** : Pour l'utilisation correcte et les exemples, consultez la [documentation du composant Card](/docs/components/Card.md)
- **Standards** : Les règles et standards sont détaillés dans [Standards des Composants](/docs/standards/components-standardises.md)

**À ne jamais faire** :
- Ne créez pas d'implémentations DIY de cartes avec des `<div className="card">`
- N'importez pas directement le composant Card de React-Bootstrap
- N'utilisez pas d'anciens chemins d'importation

### Hooks standardisés

Depuis Mai 2025, une standardisation complète des hooks a été mise en place. Tous les hooks sont maintenant organisés dans le dossier `/src/hooks/` avec une structure cohérente par entité.

#### Principes clés :

- Les hooks sont organisés par domaine fonctionnel (`/hooks/common/`, `/hooks/lieux/`, etc.)
- Utilisez les imports via les fichiers index.js : `import { useHookName } from '@/hooks/category'`
- Ne créez jamais de hooks dans les dossiers de composants
- Suivez les conventions d'API documentées pour chaque hook

#### Hooks récemment standardisés :
- `useProgrammateurSearch` - Recherche et sélection de programmateurs
- `useAddressSearch` - Recherche et sélection d'adresses 
- `useLieuDetails` - Gestion des détails d'un lieu

### Refactorisation des composants

Une séparation claire entre les composants de vue et d'édition a été implémentée. Voir la [documentation de refactorisation](/docs/components/CONCERT_REFACTORING.md) pour plus de détails.

### Composants UI

Les composants UI réutilisables se trouvent dans `/components/ui/`.

## Documentation technique

- [Architecture du projet](/docs/ARCHITECTURE.md)
- [Standardisation des composants](/docs/standards/components-standardises.md)
- [Documentation du composant Card](/docs/components/Card.md)
- [Standardisation des hooks](/src/docs/hooks/StandardisationHooks.md)
- [Refactorisation des composants](/docs/components/CONCERT_REFACTORING.md)
- [Documentation des composants communs](/docs/components/COMMON_COMPONENTS.md)
- [Documentation des hooks](/docs/hooks/HOOKS.md)
- [Workflows fonctionnels](/docs/workflows/WORKFLOWS.md)

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
