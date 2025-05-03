# Composants Communs

## Introduction

Les composants communs de TourCraft sont des éléments d'interface utilisateur réutilisables qui servent de base à l'application mais ne sont pas spécifiques à un domaine fonctionnel particulier. Ils constituent une couche intermédiaire entre les composants UI de base et les composants spécifiques métier.

## Principes de conception

- **Réutilisabilité** : Composants conçus pour être utilisés dans différentes parties de l'application
- **Cohérence** : Interface utilisateur uniforme à travers l'application
- **Extensibilité** : Faciles à modifier ou à étendre pour des besoins spécifiques
- **Accessibilité** : Conformes aux normes d'accessibilité

## Composants de statut

### StatusWithInfo

**But :** Afficher un statut avec une info-bulle détaillée

**Props :** 
- `status: string` - Code du statut
- `info: string` - Information additionnelle
- `type: 'success'|'warning'|'error'|'info'` - Type de statut

**Dépendances :** 
- components/ui/Badge.js
- Modules CSS

**Exemple d'utilisation :**

```jsx
import StatusWithInfo from '../components/common/StatusWithInfo';

function ConcertStatus({ concert }) {
  return (
    <StatusWithInfo 
      status={concert.status} 
      info={getStatusDescription(concert.status)}
      type={concert.status === 'confirme' ? 'success' : 'info'}
    />
  );
}
```

## Composants de chargement

### LoadingSpinner

**But :** Indicateur de chargement réutilisable

**Props :** 
- `size: 'small'|'medium'|'large'` - Taille du spinner
- `message: string` - Message optionnel à afficher
- `overlay: boolean` - Afficher en superposition de l'UI
- `fullscreen: boolean` - Couvrir tout l'écran

**Dépendances :** 
- Modules CSS

**Exemple d'utilisation :**

```jsx
import LoadingSpinner from '../components/common/LoadingSpinner';

function DataLoadingSection({ isLoading, children }) {
  if (isLoading) {
    return <LoadingSpinner size="medium" message="Chargement des données..." />;
  }
  
  return children;
}
```

### LoadingOverlay

**But :** Superposition de chargement avec message bloquant les interactions utilisateur

**Props :** 
- `active: boolean` - Si l'overlay est actif
- `message: string` - Message à afficher
- `spinnerSize: 'small'|'medium'|'large'` - Taille du spinner
- `opacity: number` - Opacité du fond (0-1)

**Dépendances :** 
- components/common/LoadingSpinner.js
- Modules CSS

**Exemple d'utilisation :**

```jsx
import LoadingOverlay from '../components/common/LoadingOverlay';

function FormWithSubmission() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await submitData();
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="form-container">
      <LoadingOverlay 
        active={isSubmitting} 
        message="Enregistrement en cours..." 
      />
      <form onSubmit={handleSubmit}>
        {/* Contenu du formulaire */}
      </form>
    </div>
  );
}
```

## Composants d'état vide

### EmptyState

**But :** Afficher un état vide avec illustration et actions

**Props :** 
- `title: string` - Titre de l'état vide
- `message: string` - Message descriptif
- `icon: ReactNode` - Icône ou illustration
- `action: ReactNode` - Composant d'action (bouton, lien, etc.)
- `variant: 'default'|'compact'|'minimal'` - Style d'affichage

**Dépendances :** 
- components/ui/Button.js
- Modules CSS

**Exemple d'utilisation :**

```jsx
import EmptyState from '../components/common/EmptyState';
import { Button } from '../components/ui/Button';
import { PlusIcon, MusicNoteIcon } from '../components/ui/icons';

function ArtistesList({ artistes, onAddClick }) {
  if (!artistes.length) {
    return (
      <EmptyState 
        title="Aucun artiste trouvé"
        message="Commencez par ajouter votre premier artiste"
        icon={<MusicNoteIcon size="large" />}
        action={
          <Button 
            variant="primary"
            startIcon={<PlusIcon />}
            onClick={onAddClick}
          >
            Ajouter un artiste
          </Button>
        }
      />
    );
  }
  
  return (
    <div className="artistes-list">
      {/* Liste des artistes */}
    </div>
  );
}
```

### NoResults

**But :** Afficher un message de résultat de recherche vide

**Props :** 
- `query: string` - Terme de recherche
- `message: string` - Message personnalisé (optionnel)
- `resetSearch: () => void` - Fonction pour réinitialiser la recherche

**Dépendances :** 
- components/common/EmptyState.js
- components/ui/Button.js
- Modules CSS

**Exemple d'utilisation :**

```jsx
import NoResults from '../components/common/NoResults';

function SearchResults({ results, query, resetSearch }) {
  if (query && results.length === 0) {
    return (
      <NoResults 
        query={query}
        resetSearch={resetSearch}
      />
    );
  }
  
  return (
    <div className="results-list">
      {/* Liste des résultats */}
    </div>
  );
}
```

## Composants de notification

### AlertMessage

**But :** Afficher un message d'alerte ou de notification

**Props :** 
- `type: 'success'|'warning'|'error'|'info'` - Type de message
- `message: string` - Texte du message
- `title: string` - Titre optionnel du message
- `onClose: () => void` - Fonction de fermeture
- `autoHideDuration: number` - Durée en ms avant fermeture automatique
- `action: ReactNode` - Action optionnelle (bouton, lien)

**Dépendances :** 
- components/ui/icons
- Modules CSS

**Exemple d'utilisation :**

```jsx
import AlertMessage from '../components/common/AlertMessage';

function SaveFeedback({ success, error, onDismiss }) {
  if (success) {
    return (
      <AlertMessage 
        type="success"
        message="Vos modifications ont été enregistrées avec succès."
        autoHideDuration={5000}
        onClose={onDismiss}
      />
    );
  }
  
  if (error) {
    return (
      <AlertMessage 
        type="error"
        title="Erreur"
        message={error}
        onClose={onDismiss}
        action={
          <Button variant="text" onClick={retry}>Réessayer</Button>
        }
      />
    );
  }
  
  return null;
}
```

### Toast

**But :** Afficher une notification temporaire flottante

**Props :** 
- `type: 'success'|'warning'|'error'|'info'` - Type de toast
- `message: string` - Texte du message
- `duration: number` - Durée d'affichage en ms
- `position: 'top-right'|'top-center'|'top-left'|'bottom-right'|'bottom-center'|'bottom-left'` - Position à l'écran

**Dépendances :** 
- context/ToastContext.js
- Modules CSS

**Exemple d'utilisation :**

```jsx
import { useToast } from '../context/ToastContext';

function ActionButton() {
  const { showToast } = useToast();
  
  const handleAction = async () => {
    try {
      await performAction();
      showToast({
        type: 'success',
        message: 'Action réalisée avec succès',
        duration: 3000
      });
    } catch (error) {
      showToast({
        type: 'error',
        message: 'Une erreur est survenue',
        duration: 5000
      });
    }
  };
  
  return <Button onClick={handleAction}>Exécuter l'action</Button>;
}
```

## Composants de navigation

### Breadcrumbs

**But :** Afficher un fil d'Ariane pour la navigation hiérarchique

**Props :** 
- `items: Array<{label: string, path: string}>` - Éléments du fil d'Ariane
- `separator: ReactNode` - Séparateur personnalisé
- `maxVisible: number` - Nombre maximum d'éléments visibles

**Dépendances :** 
- react-router-dom
- components/ui/icons
- Modules CSS

**Exemple d'utilisation :**

```jsx
import Breadcrumbs from '../components/common/Breadcrumbs';

function ConcertDetailPage({ concert }) {
  const breadcrumbItems = [
    { label: 'Accueil', path: '/' },
    { label: 'Concerts', path: '/concerts' },
    { label: concert.titre, path: `/concerts/${concert.id}` }
  ];
  
  return (
    <div className="page-container">
      <Breadcrumbs items={breadcrumbItems} maxVisible={3} />
      {/* Contenu de la page */}
    </div>
  );
}
```

### TabNavigation

**But :** Fournir une navigation par onglets

**Props :** 
- `tabs: Array<{id: string, label: string, icon?: ReactNode}>` - Configuration des onglets
- `activeTab: string` - ID de l'onglet actif
- `onChange: (tabId) => void` - Fonction de changement d'onglet
- `variant: 'default'|'pills'|'underlined'` - Style visuel des onglets

**Dépendances :** 
- Modules CSS

**Exemple d'utilisation :**

```jsx
import TabNavigation from '../components/common/TabNavigation';
import { useState } from 'react';

function ArtisteDetail({ artiste }) {
  const [activeTab, setActiveTab] = useState('info');
  
  const tabs = [
    { id: 'info', label: 'Informations' },
    { id: 'concerts', label: 'Concerts' },
    { id: 'media', label: 'Médias' },
    { id: 'documents', label: 'Documents' }
  ];
  
  return (
    <div className="artiste-detail">
      <TabNavigation 
        tabs={tabs}
        activeTab={activeTab}
        onChange={setActiveTab}
        variant="underlined"
      />
      
      <div className="tab-content">
        {activeTab === 'info' && <ArtisteInfo artiste={artiste} />}
        {activeTab === 'concerts' && <ArtisteConcerts artisteId={artiste.id} />}
        {activeTab === 'media' && <ArtisteMedia artisteId={artiste.id} />}
        {activeTab === 'documents' && <ArtisteDocuments artisteId={artiste.id} />}
      </div>
    </div>
  );
}
```

## Composants de liste

### VirtualList

**But :** Afficher efficacement de grandes listes avec virtualisation des éléments

**Props :** 
- `items: Array<any>` - Données à afficher
- `renderItem: (item) => ReactNode` - Fonction de rendu d'un élément
- `itemHeight: number` - Hauteur d'un élément en pixels
- `height: number|string` - Hauteur du conteneur
- `onEndReached: () => void` - Fonction appelée lorsque l'utilisateur atteint la fin de la liste

**Dépendances :** 
- react-window ou bibliothèque similaire
- Modules CSS

**Exemple d'utilisation :**

```jsx
import VirtualList from '../components/common/VirtualList';

function LargeDataList({ items, loadMore }) {
  const renderConcertItem = (item) => (
    <div className="concert-item">
      <span>{item.titre}</span>
      <span>{format(new Date(item.date), 'dd/MM/yyyy')}</span>
    </div>
  );
  
  return (
    <VirtualList 
      items={items}
      renderItem={renderConcertItem}
      itemHeight={60}
      height={400}
      onEndReached={loadMore}
    />
  );
}
```

### ItemsList

**But :** Liste générique avec actions et filtrage

**Props :** 
- `items: Array<any>` - Éléments à afficher
- `renderItem: (item) => ReactNode` - Fonction de rendu d'un élément
- `onItemClick: (item) => void` - Fonction appelée au clic sur un élément
- `emptyState: ReactNode` - État vide à afficher quand la liste est vide
- `loading: boolean` - Si la liste est en cours de chargement
- `filters: ReactNode` - Composants de filtrage à afficher au-dessus de la liste

**Dépendances :** 
- components/common/EmptyState.js
- components/common/LoadingSpinner.js
- Modules CSS

**Exemple d'utilisation :**

```jsx
import ItemsList from '../components/common/ItemsList';

function ProgrammateursList({ programmateurs, isLoading, onSelect }) {
  const renderProgrammateur = (programmateur) => (
    <div className="programmateur-item">
      <span>{programmateur.nom}</span>
      <span>{programmateur.structure}</span>
    </div>
  );
  
  const emptyState = (
    <EmptyState 
      title="Aucun programmateur"
      message="Ajoutez des programmateurs pour les voir apparaître ici."
      action={<Button onClick={onAddNew}>Ajouter</Button>}
    />
  );
  
  return (
    <ItemsList 
      items={programmateurs}
      renderItem={renderProgrammateur}
      onItemClick={onSelect}
      emptyState={emptyState}
      loading={isLoading}
      filters={<ProgrammateursFilters />}
    />
  );
}
```

## Navigation
- [Vue d'ensemble des composants](COMPONENTS.md)
- [Composants UI](UI_COMPONENTS.md)
- [Composants de formulaire](FORM_COMPONENTS.md)
- [Retour à la documentation principale](../README.md)