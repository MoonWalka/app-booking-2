# Guide des Standards et Conventions TourCraft

*Document créé le: 5 mai 2025*
*Dernière mise à jour: 5 mai 2025*

Ce guide centralise toutes les conventions de code, normes de nommage, standards techniques et bonnes pratiques à suivre dans le projet TourCraft (app-booking-2).

## Table des matières

1. [Standards généraux de codage](#standards-généraux-de-codage)
2. [Conventions de nommage](#conventions-de-nommage)
3. [Standards CSS](#standards-css)
4. [Standards des composants React](#standards-des-composants-react)
5. [Hooks et logique métier](#hooks-et-logique-métier)
6. [Modèles de données](#modèles-de-données)
7. [Validation des données](#validation-des-données)
8. [Documentation](#documentation)
9. [Tests](#tests)
10. [Processus de développement](#processus-de-développement)

## Standards généraux de codage

### Formatage du code

- Utiliser **Prettier** avec la configuration du projet
- Indentation de 2 espaces
- Pas d'espaces de fin de ligne
- Utiliser des points-virgules à la fin des instructions
- Limite de 100 caractères par ligne
- Utiliser des guillemets simples pour les chaînes de caractères

### Pratiques générales

- Éviter les variables globales
- Préférer les fonctions pures
- Utiliser des fonctions fléchées pour les fonctions anonymes
- Éviter les effets de bord
- Éviter la duplication de code
- DRY (Don't Repeat Yourself)

### ESLint

Le projet utilise ESLint avec une configuration personnalisée. Les règles clés incluent :

```javascript
// .eslintrc.js
module.exports = {
  // Configuration de base
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'prettier'
  ],
  // Règles spécifiques
  rules: {
    'react/prop-types': 'warn',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'prefer-const': 'error',
    'no-console': ['warn', { allow: ['warn', 'error'] }]
  }
};
```

## Conventions de nommage

### Fichiers et dossiers

- **Composants React** : PascalCase (ex: `UserProfile.js`)
- **Hooks personnalisés** : camelCase préfixé par "use" (ex: `useUserData.js`)
- **Services** : camelCase suffixé par "Service" (ex: `userService.js`)
- **Utilitaires** : camelCase (ex: `formatDate.js`)
- **Tests** : Nom du fichier testé suffixé par ".test" ou ".spec" (ex: `UserProfile.test.js`)
- **Modules CSS** : Nom du composant suffixé par ".module.css" (ex: `UserProfile.module.css`)

### Variables et fonctions

- **Variables et fonctions** : camelCase (ex: `getUserData`)
- **Constantes** : UPPER_SNAKE_CASE (ex: `MAX_RETRY_COUNT`)
- **Classes et composants React** : PascalCase (ex: `UserProfileCard`)
- **Interfaces TypeScript** : PascalCase préfixé par "I" (ex: `IUserProfile`)
- **Types TypeScript** : PascalCase (ex: `UserProfileType`)

### Conventions spécifiques au domaine métier

- **Entités métier** : Noms singuliers et descriptifs (ex: `Programmateur`, `Lieu`, `Concert`)
- **Collections Firestore** : Noms pluriels (ex: `programmateurs`, `lieux`, `concerts`)
- **Hooks spécifiques aux entités** : Préfixés par "use" suivi du nom de l'entité (ex: `useConcert`, `useLieuDetails`)
- **Composants de l'entité** : Préfixés par le nom de l'entité (ex: `ConcertForm`, `ProgrammateurList`)

## Standards CSS

### Architecture CSS

Le projet utilise une architecture CSS basée sur:

- **Variables CSS** pour la réutilisation des valeurs
- **Modules CSS** pour l'isolation des styles
- **Classes utilitaires** pour les styles communs
- **Media queries** pour le responsive design

> 📋 **Référence complète** : Pour tous les détails sur les standards CSS, consultez le [**Guide CSS TourCraft Consolidé**](/docs/css/GUIDE_STANDARDISATION_CSS.md) qui contient :
> - Système complet de variables CSS avec préfixe `--tc-`
> - Conventions de nommage BEM
> - Structure des modules CSS
> - Points de rupture responsive
> - Composants UI standardisés
> - Optimisations de performance
> - Checklist de qualité

### Variables CSS essentielles

Toutes les valeurs répétées doivent utiliser les variables CSS avec le préfixe `--tc-` :

```css
/* Exemples de variables principales */
--tc-color-primary: #1a73e8;
--tc-spacing-4: 16px;
--tc-font-size-md: 1rem;
--tc-border-radius-md: 4px;
```

### Modules CSS

Chaque composant React doit avoir son propre module CSS :

```
Button.js
Button.module.css
```

### Media Queries Standards

Approche mobile-first avec points de rupture standardisés :

```css
/* Mobile first */
@media (min-width: 576px) { /* Petits appareils et plus */ }
@media (min-width: 768px) { /* Tablettes et plus */ }
@media (min-width: 992px) { /* Ordinateurs de bureau et plus */ }
@media (min-width: 1200px) { /* Grands écrans */ }
```

## Standards des composants React

### Structure des composants

```jsx
// Imports
import React from 'react';
import PropTypes from 'prop-types';
import styles from './ComponentName.module.css';

// Type definitions (si TypeScript)
interface ComponentNameProps {
  title: string;
  items: Array<Item>;
  onItemClick: (item: Item) => void;
}

/**
 * Description du composant
 * @param {Object} props - Props du composant
 * @returns {React.ReactElement} Le composant rendu
 */
const ComponentName = ({ title, items, onItemClick }) => {
  // Hooks (useState, useEffect, custom hooks)
  const [state, setState] = React.useState(initialState);
  
  // Comportements, effets, etc.
  React.useEffect(() => {
    // Logique d'effet
    return () => {
      // Nettoyage
    };
  }, [dependencies]);
  
  // Fonctions de gestion d'événements
  const handleClick = (item) => {
    // Logique
    onItemClick(item);
  };
  
  // Rendu conditionnel ou des sous-composants
  const renderItems = () => {
    return items.map((item) => (
      <div key={item.id} onClick={() => handleClick(item)}>
        {item.name}
      </div>
    ));
  };
  
  // Rendu principal
  return (
    <div className={styles.container}>
      <h2 className={styles.title}>{title}</h2>
      <div className={styles.itemsList}>
        {renderItems()}
      </div>
    </div>
  );
};

// PropTypes (si JavaScript)
ComponentName.propTypes = {
  title: PropTypes.string.isRequired,
  items: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
    })
  ).isRequired,
  onItemClick: PropTypes.func.isRequired,
};

// Export
export default ComponentName;
```

### Principes de conception des composants

1. **Composants fonctionnels**: Préférer les composants fonctionnels avec les hooks
2. **Responsabilité unique**: Un composant doit faire une seule chose
3. **Props drilling**: Éviter de passer des props à travers plusieurs niveaux de composants
4. **Composition sur l'héritage**: Utiliser la composition de composants plutôt que l'héritage
5. **Séparation des préoccupations**: Séparer l'UI de la logique métier (hooks)
6. **Memoization**: Utiliser React.memo, useCallback, useMemo pour optimiser les performances

## Hooks et logique métier

### Structure standard d'un hook

```jsx
/**
 * Description du hook
 * @param {Object} options - Options du hook
 * @returns {Object} - Valeurs et fonctions exposées par le hook
 */
const useCustomHook = (options = {}) => {
  // Destructuration des options avec valeurs par défaut
  const { 
    initialValue = '', 
    validateOnChange = true 
  } = options;
  
  // États locaux
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Références
  const prevValueRef = useRef(initialValue);
  
  // Effets
  useEffect(() => {
    // Logique d'effet...
    
    return () => {
      // Nettoyage...
    };
  }, [dependencies]);
  
  // Fonctions dérivées (memoized si nécessaire)
  const validateValue = useCallback((valueToValidate) => {
    // Logique de validation...
    return isValid;
  }, [dependencies]);
  
  // Fonctions d'interaction
  const handleChange = useCallback((newValue) => {
    setValue(newValue);
    
    if (validateOnChange) {
      const isValid = validateValue(newValue);
      setError(isValid ? null : 'Erreur de validation');
    }
  }, [validateOnChange, validateValue]);
  
  // Actions asynchrones
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Appel asynchrone...
      setValue(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [dependencies]);
  
  // Valeurs dérivées
  const isValid = error === null;
  const isDirty = value !== initialValue;
  
  // Valeurs exposées
  return {
    value,
    setValue: handleChange,
    error,
    isLoading,
    isValid,
    isDirty,
    fetchData,
    // Autres valeurs/fonctions utiles...
  };
};

export default useCustomHook;
```

### Structure des hooks génériques d'entités

Pour les hooks génériques tels que `useGenericEntityList`, `useGenericEntityDetails`, etc., utiliser une structure cohérente:

```jsx
/**
 * Hook générique pour la gestion des listes d'entités
 * @param {Object} config - Configuration du hook
 * @returns {Object} - Valeurs et fonctions exposées par le hook
 */
export const useGenericEntityList = (config = {}) => {
  const {
    collectionName,
    searchFields = [],
    initialFilters = {},
    initialSort = { field: 'createdAt', direction: 'desc' }
  } = config;
  
  // Implementation...
  
  return {
    items,
    loading,
    error,
    sortField,
    sortDirection,
    setSorting,
    searchTerm,
    setSearchTerm,
    filters,
    setFilter,
    clearFilters,
    refresh
  };
};
```

### Hook Custom vs Logic dans les composants

- **Hook custom** : Pour la logique réutilisable ou complexe
- **Dans le composant** : Pour la logique simple et spécifique au composant

## Modèles de données

### Interfaces TypeScript

Toutes les entités métier doivent être définies avec une interface TypeScript :

```typescript
// src/models/Programmateur.ts
export interface IProgrammateur {
  id?: string;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  structureId?: string;
  structureNom?: string;
  contacts?: IContact[];
  notes?: string;
  createdAt: Date | number;
  updatedAt: Date | number;
}

export interface IContact {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  poste?: string;
}
```

### Valeurs par défaut

Chaque entité doit avoir un objet de valeurs par défaut :

```typescript
// src/models/defaults/ProgrammateurDefaults.ts
import { IProgrammateur } from '../Programmateur';

export const DEFAULT_PROGRAMMATEUR: IProgrammateur = {
  nom: '',
  prenom: '',
  email: '',
  telephone: '',
  contacts: [],
  notes: '',
  createdAt: Date.now(),
  updatedAt: Date.now()
};
```

## Validation des données

### Schémas Yup

Chaque entité doit avoir un schéma de validation Yup :

```javascript
// src/validations/programmateur.schema.js
import * as Yup from 'yup';

export const contactSchema = Yup.object().shape({
  nom: Yup.string().required('Le nom est obligatoire'),
  prenom: Yup.string().required('Le prénom est obligatoire'),
  email: Yup.string().email('Email invalide').required('Email obligatoire'),
  telephone: Yup.string().nullable(),
  poste: Yup.string().nullable()
});

export const programmateurSchema = Yup.object().shape({
  nom: Yup.string().required('Le nom est obligatoire'),
  prenom: Yup.string().required('Le prénom est obligatoire'),
  email: Yup.string().email('Email invalide').required('Email obligatoire'),
  telephone: Yup.string()
    .nullable()
    .matches(/^(\+\d{1,3}|0)\s?[1-9](\s?\d{2}){4}$/, 'Format de téléphone invalide'),
  structureId: Yup.string().nullable(),
  structureNom: Yup.string().nullable(),
  contacts: Yup.array().of(contactSchema).nullable(),
  notes: Yup.string().nullable()
});
```

### Integration avec Formik

Exemple d'utilisation avec Formik :

```jsx
import { Formik, Form, Field } from 'formik';
import { programmateurSchema } from '../validations/programmateur.schema';
import { DEFAULT_PROGRAMMATEUR } from '../models/defaults/ProgrammateurDefaults';

const ProgrammateurForm = ({ initialData = DEFAULT_PROGRAMMATEUR, onSubmit }) => {
  return (
    <Formik
      initialValues={initialData}
      validationSchema={programmateurSchema}
      onSubmit={onSubmit}
    >
      {({ errors, touched, isSubmitting }) => (
        <Form>
          {/* Fields... */}
        </Form>
      )}
    </Formik>
  );
};
```

## Documentation

### Documentation du code

- **JSDoc** pour documenter les fonctions, classes, etc.
- **PropTypes** (ou TypeScript) pour documenter les props des composants
- **Commentaires** pour les sections complexes

Exemple:

```jsx
/**
 * Composant qui affiche les détails d'un concert
 * @component
 * @param {Object} props - Propriétés du composant
 * @param {string} props.concertId - ID du concert à afficher
 * @param {boolean} [props.isEditable=false] - Indique si le concert est éditable
 * @param {Function} [props.onEdit] - Fonction appelée lors de l'édition
 * @returns {React.ReactElement} Composant ConcertDetails
 */
const ConcertDetails = ({ concertId, isEditable = false, onEdit }) => {
  // Implémentation...
};
```

### Documentation de l'architecture

Les décisions architecturales importantes doivent être documentées dans `/docs` avec:

1. **Contexte** : Pourquoi cette décision a été prise
2. **Problème** : Quel problème résout cette décision
3. **Solution** : Description de la solution implémentée
4. **Conséquences** : Avantages et inconvénients de cette décision

## Tests

### Types de tests

1. **Tests unitaires** : Tester les fonctions et composants isolés
2. **Tests d'intégration** : Tester l'interaction entre plusieurs composants
3. **Tests de bout en bout** : Tester le flux complet de l'application

### Structure des tests unitaires

```jsx
// ConcertCard.test.js
import { render, screen, fireEvent } from '@testing-library/react';
import ConcertCard from './ConcertCard';

// Mock des données
const mockConcert = {
  id: '123',
  titre: 'Concert Test',
  date: new Date(),
  lieu: 'Salle de test'
};

// Mock des fonctions
const mockOnClick = jest.fn();

describe('ConcertCard Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should render concert title', () => {
    render(<ConcertCard concert={mockConcert} onClick={mockOnClick} />);
    expect(screen.getByText('Concert Test')).toBeInTheDocument();
  });

  test('should call onClick when clicked', () => {
    render(<ConcertCard concert={mockConcert} onClick={mockOnClick} />);
    fireEvent.click(screen.getByRole('button'));
    expect(mockOnClick).toHaveBeenCalledWith('123');
  });
});
```

## Processus de développement

### Branches Git

- **main** : Code en production
- **develop** : Code en développement
- **feature/[nom]** : Nouvelle fonctionnalité
- **bugfix/[nom]** : Correction de bug
- **refactor/[nom]** : Refactorisation de code
- **hotfix/[nom]** : Correction urgente en production

### Commits

Format : `type(scope): message court`

Types:
- **feat** : Nouvelle fonctionnalité
- **fix** : Correction de bug
- **docs** : Documentation
- **style** : Formatage (pas de changement de code)
- **refactor** : Refactorisation de code
- **test** : Ajout ou modification de tests
- **chore** : Tâches de maintenance

### Pull Requests

Chaque PR doit:
- Avoir un titre descriptif
- Avoir une description qui explique les changements
- Être revue par au moins un développeur
- Passer tous les tests automatisés
- Suivre les standards de code

---

*Document préparé par l'équipe Documentation*
*Pour toute question: documentation@tourcraft.com*