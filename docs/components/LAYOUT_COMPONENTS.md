# Composants de Mise en Page

## Introduction

Les composants de mise en page de TourCraft définissent la structure globale de l'application et organisent le contenu de manière cohérente. Ils fournissent un cadre réutilisable pour toutes les pages et vues de l'application.

## Principes de conception

- **Cohérence** : Structure uniforme sur toutes les pages
- **Réactivité** : Adaptation à toutes les tailles d'écran
- **Accessibilité** : Navigation facile et conforme aux standards d'accessibilité
- **Flexibilité** : Possibilité d'adapter la mise en page selon le contexte

## Composants principaux

### AppLayout

**But :** Conteneur principal de l'application avec navigation et structure globale

**Props :**
- `children: ReactNode` - Contenu principal à afficher

**Dépendances :**
- components/layout/Navbar.js
- components/layout/Sidebar.js
- components/layout/Footer.js
- context/AuthContext.js
- hooks/common/useResponsive.js
- Modules CSS

**Structure :**
```
+--------------------------------------+
|               NAVBAR                 |
+------+-----------------------------+-+
|      |                             | |
|      |                             | |
|      |                             | |
|  S   |                             | |
|  I   |        MAIN CONTENT         | |
|  D   |                             | |
|  E   |                             | |
|  B   |                             | |
|  A   |                             | |
|  R   |                             | |
|      |                             | |
+------+-----------------------------+-+
|               FOOTER                 |
+--------------------------------------+
```

**Exemple d'utilisation :**

```jsx
import AppLayout from '../components/layout/AppLayout';

function App() {
  return (
    <AppLayout>
      <Switch>
        <Route path="/concerts" component={ConcertsPage} />
        <Route path="/artistes" component={ArtistesPage} />
        {/* Autres routes */}
      </Switch>
    </AppLayout>
  );
}
```

### Navbar

**But :** Barre de navigation supérieure avec logo, menu principal et actions rapides

**Props :**
- `onMenuToggle: () => void` - Callback pour ouvrir/fermer le menu latéral
- `showMobileMenu: boolean` - Si le menu mobile doit être affiché
- `user: object` - Information sur l'utilisateur connecté

**Dépendances :**
- components/ui/Button.js
- components/ui/Avatar.js
- components/ui/Dropdown.js
- context/AuthContext.js
- hooks/common/useTheme.js
- hooks/common/useResponsive.js
- Modules CSS

**Exemple d'utilisation :**

```jsx
import Navbar from '../components/layout/Navbar';

function AppHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  
  return (
    <Navbar 
      onMenuToggle={() => setMenuOpen(!menuOpen)} 
      showMobileMenu={menuOpen} 
      user={currentUser}
    />
  );
}
```

### Sidebar

**But :** Barre latérale de navigation principale

**Props :**
- `isOpen: boolean` - Si la sidebar est ouverte
- `onClose: () => void` - Callback pour fermer la sidebar
- `compact: boolean` - Mode d'affichage compact (icônes seulement)
- `activePath: string` - Chemin actif pour la mise en évidence
- `items: Array` - Éléments de menu à afficher

**Dépendances :**
- components/ui/Button.js
- components/ui/icons
- hooks/common/useResponsive.js
- react-router-dom
- Modules CSS

**Exemple d'utilisation :**

```jsx
import Sidebar from '../components/layout/Sidebar';
import { useLocation } from 'react-router-dom';

function AppSidebar({ isOpen, onClose }) {
  const location = useLocation();
  const isMobile = useResponsive().isMobile;
  
  const menuItems = [
    { label: 'Tableau de bord', path: '/dashboard', icon: 'dashboard' },
    { label: 'Concerts', path: '/concerts', icon: 'event' },
    { label: 'Artistes', path: '/artistes', icon: 'music_note' },
    { label: 'Contrats', path: '/contrats', icon: 'description' },
    { label: 'Lieux', path: '/lieux', icon: 'place' },
    { label: 'Programmateurs', path: '/programmateurs', icon: 'people' },
    { label: 'Paramètres', path: '/parametres', icon: 'settings' }
  ];
  
  return (
    <Sidebar 
      isOpen={isOpen} 
      onClose={onClose}
      compact={!isMobile && !isOpen}
      activePath={location.pathname}
      items={menuItems}
    />
  );
}
```

### PageContainer

**But :** Conteneur standard pour les pages avec marges et espacements cohérents

**Props :**
- `children: ReactNode` - Contenu de la page
- `maxWidth: 'xs'|'sm'|'md'|'lg'|'xl'|'full'` - Largeur maximale du contenu
- `padding: boolean` - Si des marges intérieures doivent être appliquées
- `spacing: 'none'|'small'|'medium'|'large'` - Espacement entre les éléments enfants

**Dépendances :**
- hooks/common/useResponsive.js
- Modules CSS

**Exemple d'utilisation :**

```jsx
import PageContainer from '../components/layout/PageContainer';

function ArtisteDetailPage() {
  return (
    <PageContainer maxWidth="lg" spacing="medium">
      <PageHeader title="Détails de l'artiste" />
      <ArtisteInfo />
      <RelatedConcerts />
    </PageContainer>
  );
}
```

### PageHeader

**But :** En-tête de page standardisé avec titre, actions et fil d'Ariane

**Props :**
- `title: string` - Titre principal de la page
- `subtitle: string` - Sous-titre optionnel
- `breadcrumbs: Array` - Configuration du fil d'Ariane
- `actions: ReactNode` - Boutons d'action à afficher
- `backLink: {label: string, path: string}` - Lien de retour optionnel
- `status: ReactNode` - Indicateur de statut optionnel

**Dépendances :**
- components/ui/Button.js
- components/common/Breadcrumbs.js
- components/ui/Badge.js
- Modules CSS

**Exemple d'utilisation :**

```jsx
import PageHeader from '../components/layout/PageHeader';
import { Button } from '../components/ui/Button';
import { PlusIcon } from '../components/ui/icons';

function ConcertsPage() {
  const breadcrumbs = [
    { label: 'Accueil', path: '/' },
    { label: 'Concerts', path: '/concerts' }
  ];
  
  const actions = (
    <Button 
      variant="primary"
      startIcon={<PlusIcon />}
      onClick={() => navigate('/concerts/nouveau')}
    >
      Nouveau concert
    </Button>
  );
  
  return (
    <>
      <PageHeader 
        title="Concerts"
        subtitle="Liste de tous les concerts planifiés"
        breadcrumbs={breadcrumbs}
        actions={actions}
      />
      <ConcertsList />
    </>
  );
}
```

### Section

**But :** Diviser le contenu d'une page en sections visuellement distinctes

**Props :**
- `title: string` - Titre de la section
- `subtitle: string` - Sous-titre optionnel
- `actions: ReactNode` - Actions associées à la section
- `children: ReactNode` - Contenu de la section
- `collapsible: boolean` - Si la section peut être réduite/agrandie
- `defaultExpanded: boolean` - Si la section est développée par défaut
- `divider: boolean` - Si un séparateur doit être affiché

**Dépendances :**
- components/ui/SectionTitle.js
- Modules CSS

**Exemple d'utilisation :**

```jsx
import Section from '../components/layout/Section';
import { Button } from '../components/ui/Button';

function ArtisteDetail({ artiste }) {
  const actions = (
    <Button 
      variant="text" 
      onClick={() => setEditMode(true)}
    >
      Modifier
    </Button>
  );
  
  return (
    <Section 
      title="Informations générales"
      subtitle="Coordonnées et détails de l'artiste"
      actions={actions}
      collapsible
      defaultExpanded={true}
    >
      <div className="artiste-info-grid">
        <div className="info-item">
          <span className="label">Nom</span>
          <span className="value">{artiste.nom}</span>
        </div>
        <div className="info-item">
          <span className="label">Genre</span>
          <span className="value">{artiste.genre}</span>
        </div>
        {/* Autres informations */}
      </div>
    </Section>
  );
}
```

### GridContainer

**But :** Organiser le contenu en grille responsive

**Props :**
- `children: ReactNode` - Éléments de la grille
- `spacing: number` - Espacement entre les éléments (1-10)
- `columns: number|{xs: number, sm: number, md: number, lg: number, xl: number}` - Nombre de colonnes par taille d'écran

**Dépendances :**
- hooks/common/useResponsive.js
- Modules CSS

**Exemple d'utilisation :**

```jsx
import GridContainer from '../components/layout/GridContainer';
import GridItem from '../components/layout/GridItem';
import Card from '../components/ui/Card';

function DashboardStats() {
  return (
    <GridContainer 
      spacing={3}
      columns={{
        xs: 1,  // 1 colonne sur mobile
        sm: 2,  // 2 colonnes sur tablette
        md: 3,  // 3 colonnes sur desktop
        lg: 4   // 4 colonnes sur grand écran
      }}
    >
      <GridItem>
        <Card>
          <h3>Concerts à venir</h3>
          <div className="stat">12</div>
        </Card>
      </GridItem>
      <GridItem>
        <Card>
          <h3>Artistes actifs</h3>
          <div className="stat">8</div>
        </Card>
      </GridItem>
      <GridItem>
        <Card>
          <h3>Contrats en attente</h3>
          <div className="stat">5</div>
        </Card>
      </GridItem>
      <GridItem>
        <Card>
          <h3>Revenus du mois</h3>
          <div className="stat">2 500 €</div>
        </Card>
      </GridItem>
    </GridContainer>
  );
}
```

### GridItem

**But :** Élément individuel d'une grille responsive

**Props :**
- `children: ReactNode` - Contenu de l'élément
- `xs: number` - Nombre de colonnes occupées sur mobile
- `sm: number` - Nombre de colonnes occupées sur tablette
- `md: number` - Nombre de colonnes occupées sur desktop
- `lg: number` - Nombre de colonnes occupées sur grand écran
- `xl: number` - Nombre de colonnes occupées sur très grand écran

**Dépendances :**
- Modules CSS

**Exemple d'utilisation :**

```jsx
import GridContainer from '../components/layout/GridContainer';
import GridItem from '../components/layout/GridItem';

function DetailLayout() {
  return (
    <GridContainer spacing={4} columns={12}>
      <GridItem xs={12} md={8}>
        <MainContent />
      </GridItem>
      <GridItem xs={12} md={4}>
        <Sidebar />
      </GridItem>
    </GridContainer>
  );
}
```

### Divider

**But :** Fournir une séparation visuelle entre les sections de contenu

**Props :**
- `orientation: 'horizontal'|'vertical'` - Orientation du séparateur
- `variant: 'fullWidth'|'inset'|'middle'` - Style du séparateur
- `light: boolean` - Si le séparateur doit être plus léger

**Dépendances :**
- Modules CSS

**Exemple d'utilisation :**

```jsx
import Divider from '../components/layout/Divider';

function InfoSection() {
  return (
    <div className="info-section">
      <div className="section-content">
        <h3>Informations générales</h3>
        <p>Contenu de la section...</p>
      </div>
      
      <Divider orientation="horizontal" />
      
      <div className="section-content">
        <h3>Coordonnées</h3>
        <p>Contenu de la section...</p>
      </div>
    </div>
  );
}
```

### Footer

**But :** Pied de page standardisé avec informations légales et liens utiles

**Props :**
- `showLegal: boolean` - Si les informations légales doivent être affichées
- `showSocial: boolean` - Si les liens sociaux doivent être affichés
- `variant: 'full'|'compact'` - Style du footer

**Dépendances :**
- context/ParametresContext.js
- Modules CSS

**Exemple d'utilisation :**

```jsx
import Footer from '../components/layout/Footer';

function AppLayout({ children }) {
  return (
    <div className="app-container">
      <Navbar />
      <main>{children}</main>
      <Footer showLegal showSocial variant="full" />
    </div>
  );
}
```

## Mises en page spécialisées

### TwoColumnsLayout

**But :** Mise en page à deux colonnes pour les pages de détail et formulaires complexes

**Props :**
- `leftColumn: ReactNode` - Contenu de la colonne gauche
- `rightColumn: ReactNode` - Contenu de la colonne droite
- `leftWidth: string` - Largeur de la colonne gauche (ex: '60%')
- `sticky: boolean` - Si la colonne droite doit rester visible lors du défilement
- `breakpoint: 'sm'|'md'|'lg'` - Point de rupture pour passer en format une colonne

**Dépendances :**
- hooks/common/useResponsive.js
- Modules CSS

**Exemple d'utilisation :**

```jsx
import TwoColumnsLayout from '../components/layout/TwoColumnsLayout';

function ConcertDetailPage() {
  return (
    <TwoColumnsLayout 
      leftColumn={<ConcertDetailForm />} 
      rightColumn={<ConcertSummary />}
      leftWidth="65%"
      sticky
      breakpoint="md"
    />
  );
}
```

### TabsLayout

**But :** Organiser le contenu en onglets pour les pages détaillées

**Props :**
- `tabs: Array<{id: string, label: string, icon?: ReactNode, content: ReactNode}>` - Configuration des onglets
- `defaultTab: string` - ID de l'onglet actif par défaut
- `onTabChange: (tabId: string) => void` - Callback lors du changement d'onglet
- `orientation: 'horizontal'|'vertical'` - Orientation des onglets
- `variant: 'standard'|'fullWidth'|'scrollable'` - Style d'affichage des onglets

**Dépendances :**
- components/common/TabNavigation.js
- Modules CSS

**Exemple d'utilisation :**

```jsx
import TabsLayout from '../components/layout/TabsLayout';

function ArtisteDetailPage({ artiste }) {
  const tabs = [
    { 
      id: 'info', 
      label: 'Informations', 
      content: <ArtisteInfo artiste={artiste} /> 
    },
    { 
      id: 'concerts', 
      label: 'Concerts', 
      content: <ArtisteConcerts artisteId={artiste.id} /> 
    },
    { 
      id: 'media', 
      label: 'Médias', 
      content: <ArtisteMedia artisteId={artiste.id} /> 
    },
    { 
      id: 'documents', 
      label: 'Documents', 
      content: <ArtisteDocuments artisteId={artiste.id} /> 
    }
  ];
  
  return (
    <TabsLayout 
      tabs={tabs}
      defaultTab="info"
      variant="standard"
    />
  );
}
```

### CardLayout

**But :** Mise en page basée sur des cartes pour les pages de type dashboard

**Props :**
- `cards: Array<{id: string, title?: string, width?: string, height?: string, content: ReactNode}>` - Configuration des cartes
- `spacing: number` - Espacement entre les cartes
- `draggable: boolean` - Si les cartes peuvent être réorganisées
- `layout: Array` - Configuration du positionnement des cartes

**Dépendances :**
- components/ui/Card.js
- react-grid-layout (optionnel pour le drag-n-drop)
- Modules CSS

**Exemple d'utilisation :**

```jsx
import CardLayout from '../components/layout/CardLayout';

function DashboardPage() {
  const dashboardCards = [
    {
      id: 'upcoming-concerts',
      title: 'Concerts à venir',
      width: '50%',
      content: <UpcomingConcertsList />
    },
    {
      id: 'quick-stats',
      title: 'Statistiques',
      width: '50%',
      content: <StatisticsCards />
    },
    {
      id: 'recent-activities',
      title: 'Activités récentes',
      width: '100%',
      content: <ActivitiesFeed />
    },
    {
      id: 'contracts-status',
      title: 'État des contrats',
      width: '50%',
      content: <ContractsStatusChart />
    },
    {
      id: 'calendar',
      title: 'Calendrier',
      width: '50%',
      content: <EventsCalendar />
    }
  ];
  
  return (
    <CardLayout 
      cards={dashboardCards}
      spacing={3}
      draggable
    />
  );
}
```

## Bonnes pratiques de mise en page

### Adaptation mobile

Toutes les mises en page doivent s'adapter aux différentes tailles d'écran. Utilisez `useResponsive` pour adapter dynamiquement la mise en page :

```jsx
import { useResponsive } from '../hooks/common/useResponsive';

function AdaptiveLayout({ children }) {
  const { isMobile, isTablet, isDesktop } = useResponsive();
  
  if (isMobile) {
    return <MobileLayout>{children}</MobileLayout>;
  }
  
  if (isTablet) {
    return <TabletLayout>{children}</TabletLayout>;
  }
  
  return <DesktopLayout>{children}</DesktopLayout>;
}
```

### Performance

Pour les mises en page complexes avec beaucoup de contenu, utilisez le chargement différé pour améliorer les performances :

```jsx
import { lazy, Suspense } from 'react';
import LoadingSpinner from '../components/common/LoadingSpinner';

// Chargement différé des composants lourds
const HeavyChart = lazy(() => import('../components/analytics/HeavyChart'));
const ComplexTable = lazy(() => import('../components/tables/ComplexTable'));

function AnalyticsPage() {
  return (
    <PageContainer>
      <PageHeader title="Analytiques" />
      <Section title="Graphiques">
        <Suspense fallback={<LoadingSpinner />}>
          <HeavyChart />
        </Suspense>
      </Section>
      <Section title="Données détaillées">
        <Suspense fallback={<LoadingSpinner />}>
          <ComplexTable />
        </Suspense>
      </Section>
    </PageContainer>
  );
}
```

### Composabilité

Les composants de mise en page sont conçus pour être combinés de manière flexible :

```jsx
function ComplexPage() {
  return (
    <PageContainer>
      <PageHeader title="Tableau de bord" />
      
      <Section title="Vue d'ensemble">
        <GridContainer spacing={3} columns={{xs: 1, md: 3}}>
          <GridItem xs={1} md={1}>
            <StatsCard title="Concerts" value="42" />
          </GridItem>
          <GridItem xs={1} md={1}>
            <StatsCard title="Artistes" value="15" />
          </GridItem>
          <GridItem xs={1} md={1}>
            <StatsCard title="Contrats" value="38" />
          </GridItem>
        </GridContainer>
      </Section>
      
      <Divider />
      
      <TwoColumnsLayout
        leftColumn={
          <Section title="Activité récente">
            <ActivityFeed />
          </Section>
        }
        rightColumn={
          <Section title="À faire">
            <TodoList />
          </Section>
        }
      />
    </PageContainer>
  );
}
```

## Navigation
- [Vue d'ensemble des composants](COMPONENTS.md)
- [Composants UI](UI_COMPONENTS.md)
- [Composants communs](COMMON_COMPONENTS.md)
- [Composants de formulaire](FORM_COMPONENTS.md)
- [Retour à la documentation principale](../README.md)