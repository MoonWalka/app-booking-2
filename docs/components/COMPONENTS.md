# Vue d'ensemble des composants

## Introduction

L'architecture de TourCraft est organisée autour de composants React spécialisés. Cette organisation permet de maximiser la réutilisation du code et de maintenir une séparation claire des préoccupations. Les composants sont organisés par domaine fonctionnel et par niveau d'abstraction.

## Catégories de composants

### Par niveau d'abstraction

#### 1. Composants UI élémentaires
- [Voir la documentation détaillée](UI_COMPONENTS.md)
- Composants de base comme les boutons, champs de formulaire, étiquettes, etc.
- Hautement réutilisables et indépendants du domaine métier
- Exemples: Button, TextField, Badge, StatutBadge

#### 2. Composants Moléculaires
- Assemblages de composants UI élémentaires avec une logique simple
- Réutilisables entre différents domaines métier
- Exemples: SearchField, StatusFilterBar, DateRangePicker

#### 3. Composants Organismes
- Assemblages fonctionnels complets avec logique métier
- Généralement spécifiques à un domaine métier
- Exemples: ConcertForm, ProgrammateurDetails, ContratPreview

#### 4. Layouts
- Structures de mise en page globales
- Gèrent la disposition et la navigation
- Exemples: MainLayout, SidebarLayout, TabLayout

### Par domaine métier

#### 1. Composants Artistes
- Gestion des informations sur les artistes
- Exemples: ArtisteForm, ArtisteCard, ArtisteFilter

#### 2. Composants Concerts
- Gestion du cycle de vie des concerts
- Exemples: ConcertCalendar, ConcertDetails, ConcertStatusFlow

#### 3. Composants Contrats
- Génération et gestion des contrats
- Exemples: ContratGenerator, SignaturePanel, ContratVersionControl

#### 4. Composants Lieux
- Gestion des informations sur les lieux de concert
- Exemples: LieuMap, LieuDetails, CapacityVisualizer

#### 5. Composants Programmateurs
- Gestion des relations avec les programmateurs
- Exemples: ProgrammateurForm, ContactHistory, ProgrammateurRoleSelector

## Principes de conception

### 1. Composants fonctionnels
Tous les composants sont implémentés comme des fonctions utilisant les Hooks React pour gérer leur état et leurs effets secondaires.

### 2. CSS Modules
Les styles sont encapsulés avec CSS Modules pour éviter les conflits de noms de classes et faciliter la maintenabilité.

```jsx
// Exemple d'utilisation de CSS Modules
import styles from './Button.module.css';

function Button({ label }) {
  return <button className={styles.button}>{label}</button>;
}
```

### 3. Props typées
Les props des composants sont typées explicitement pour faciliter le débogage et l'autocomplétion.

```jsx
// Exemple de typage de props
Button.propTypes = {
  label: PropTypes.string.isRequired,
  onClick: PropTypes.func,
  variant: PropTypes.oneOf(['primary', 'secondary', 'danger']),
};
```

### 4. Composition plutôt qu'héritage
L'architecture favorise la composition de composants plutôt que l'héritage pour maximiser la réutilisation.

```jsx
// Exemple de composition
function EnhancedButton({ icon, label, ...props }) {
  return (
    <Button {...props}>
      {icon && <span className="icon">{icon}</span>}
      <span>{label}</span>
    </Button>
  );
}
```

## Structure de fichiers des composants

```
components/
  ├── ui/                    # Composants UI élémentaires
  │   ├── Button.js          # Implémentation du composant
  │   ├── Button.module.css  # Styles spécifiques au composant
  │   └── Button.test.js     # Tests unitaires
  ├── molecules/             # Composants moléculaires
  │   ├── SearchBar.js
  │   └── ...
  ├── artistes/              # Composants spécifiques au domaine Artistes
  │   ├── index.js           # Point d'entrée pour faciliter les imports
  │   ├── ArtisteForm.js
  │   └── ...
  ├── concerts/              # Composants spécifiques au domaine Concerts
  └── ...                    # Autres domaines métier
```

## Bonnes pratiques

### 1. Séparation des préoccupations
- La logique métier complexe est encapsulée dans des hooks personnalisés
- Les composants restent concentrés sur le rendu et les interactions utilisateur

### 2. Performance
- Utilisez React.memo() pour les composants qui se re-rendent souvent
- Évitez les calculs coûteux dans le corps du composant
- Utilisez useCallback() et useMemo() pour stabiliser les références

### 3. Accessibilité
- Tous les composants doivent respecter les principes d'accessibilité WCAG
- Utilisez des attributs ARIA appropriés
- Assurez-vous que tous les composants sont utilisables au clavier

## Navigation
- [Composants UI](UI_COMPONENTS.md)
- [Composants communs](COMMON_COMPONENTS.md)
- [Composants de formulaire](FORM_COMPONENTS.md)
- [Retour à la documentation principale](../README.md)