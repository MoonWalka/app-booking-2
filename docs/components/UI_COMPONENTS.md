# Composants UI

## Introduction

Les composants UI constituent les blocs de construction fondamentaux de l'interface utilisateur de TourCraft. Ils sont conçus pour être réutilisables, cohérents et accessibles dans toute l'application.

## Principes de conception

- **Cohérence** : Apparence et comportements uniformes dans toute l'application
- **Réutilisabilité** : Composants génériques adaptables à différents contextes
- **Accessibilité** : Conformité aux normes WCAG pour une expérience utilisateur inclusive
- **Personnalisation** : Utilisation de props pour permettre des variations sans duplication de code

## Composants de base

### Button

Le composant Button est utilisé pour déclencher des actions dans l'application.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'primary'`\|`'secondary'`\|`'danger'`\|`'text'` | `'primary'` | Style visuel du bouton |
| `size` | `'small'`\|`'medium'`\|`'large'` | `'medium'` | Taille du bouton |
| `startIcon` | `ReactNode` | `undefined` | Icône affichée avant le texte |
| `endIcon` | `ReactNode` | `undefined` | Icône affichée après le texte |
| `fullWidth` | `boolean` | `false` | Si true, le bouton prend toute la largeur du conteneur |
| `disabled` | `boolean` | `false` | Si true, le bouton est désactivé |
| `loading` | `boolean` | `false` | Si true, affiche un indicateur de chargement |
| `onClick` | `function` | `undefined` | Fonction appelée lors du clic |

#### Exemple d'utilisation

```jsx
import { Button } from '../components/ui/Button';
import { SaveIcon } from '../components/ui/icons';

function SaveForm() {
  return (
    <Button 
      variant="primary"
      startIcon={<SaveIcon />}
      onClick={() => handleSave()}
      disabled={!isFormValid}
    >
      Enregistrer
    </Button>
  );
}
```

### TextField

Le composant TextField permet de saisir du texte dans l'application.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | `undefined` | Étiquette du champ |
| `placeholder` | `string` | `''` | Texte de substitution |
| `value` | `string` | `''` | Valeur du champ |
| `onChange` | `function` | `undefined` | Fonction appelée lors de la modification |
| `error` | `boolean` | `false` | Si true, le champ est en état d'erreur |
| `helperText` | `string` | `''` | Texte d'aide ou message d'erreur |
| `fullWidth` | `boolean` | `false` | Si true, le champ prend toute la largeur du conteneur |
| `disabled` | `boolean` | `false` | Si true, le champ est désactivé |
| `type` | `'text'`\|`'password'`\|`'email'`\|`'number'` | `'text'` | Type du champ de saisie |

#### Exemple d'utilisation

```jsx
import { TextField } from '../components/ui/TextField';

function LoginForm() {
  const [email, setEmail] = useState('');
  
  return (
    <TextField 
      label="Email"
      type="email"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      error={!isValidEmail(email)}
      helperText={!isValidEmail(email) ? "Email invalide" : ""}
      fullWidth
    />
  );
}
```

### Badge

Le composant Badge affiche une information concise, généralement un statut ou un compteur.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `content` | `string`\|`number` | `''` | Contenu à afficher |
| `color` | `'primary'`\|`'secondary'`\|`'success'`\|`'warning'`\|`'error'`\|`'info'` | `'primary'` | Couleur du badge |
| `size` | `'small'`\|`'medium'` | `'medium'` | Taille du badge |
| `variant` | `'standard'`\|`'dot'` | `'standard'` | Style visuel du badge |

#### Exemple d'utilisation

```jsx
import { Badge } from '../components/ui/Badge';

function NotificationItem() {
  return (
    <div className="notification-item">
      <span>Nouveau message</span>
      <Badge content="3" color="primary" />
    </div>
  );
}
```

### StatutBadge

Le composant StatutBadge est une spécialisation du Badge pour afficher les statuts spécifiques à TourCraft.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `statut` | `'brouillon'`\|`'option'`\|`'confirme'`\|`'annule'`\|`'termine'` | `undefined` | Statut à afficher |
| `size` | `'small'`\|`'medium'` | `'medium'` | Taille du badge |

#### Exemple d'utilisation

```jsx
import { StatutBadge } from '../components/ui/StatutBadge';

function ConcertItem({ concert }) {
  return (
    <div className="concert-item">
      <span>{concert.title}</span>
      <StatutBadge statut={concert.statut} />
    </div>
  );
}
```

### Select

Le composant Select permet à l'utilisateur de sélectionner une option parmi une liste.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | `undefined` | Étiquette du champ |
| `value` | `any` | `undefined` | Valeur sélectionnée |
| `onChange` | `function` | `undefined` | Fonction appelée lors de la sélection |
| `options` | `Array<{value: any, label: string}>` | `[]` | Options disponibles |
| `error` | `boolean` | `false` | Si true, le champ est en état d'erreur |
| `helperText` | `string` | `''` | Texte d'aide ou message d'erreur |
| `fullWidth` | `boolean` | `false` | Si true, le champ prend toute la largeur du conteneur |
| `disabled` | `boolean` | `false` | Si true, le champ est désactivé |

#### Exemple d'utilisation

```jsx
import { Select } from '../components/ui/Select';

function StatusSelector() {
  const [status, setStatus] = useState('');
  
  const options = [
    { value: 'brouillon', label: 'Brouillon' },
    { value: 'option', label: 'Option' },
    { value: 'confirme', label: 'Confirmé' },
    { value: 'annule', label: 'Annulé' },
    { value: 'termine', label: 'Terminé' }
  ];
  
  return (
    <Select 
      label="Statut"
      value={status}
      onChange={(e) => setStatus(e.target.value)}
      options={options}
      fullWidth
    />
  );
}
```

### DatePicker

Le composant DatePicker permet à l'utilisateur de sélectionner une date.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | `undefined` | Étiquette du champ |
| `value` | `Date`\|`null` | `null` | Date sélectionnée |
| `onChange` | `function` | `undefined` | Fonction appelée lors de la sélection |
| `minDate` | `Date` | `undefined` | Date minimum sélectionnable |
| `maxDate` | `Date` | `undefined` | Date maximum sélectionnable |
| `error` | `boolean` | `false` | Si true, le champ est en état d'erreur |
| `helperText` | `string` | `''` | Texte d'aide ou message d'erreur |
| `disabled` | `boolean` | `false` | Si true, le champ est désactivé |

#### Exemple d'utilisation

```jsx
import { DatePicker } from '../components/ui/DatePicker';

function EventDateSelector() {
  const [eventDate, setEventDate] = useState(null);
  const today = new Date();
  
  return (
    <DatePicker 
      label="Date de l'événement"
      value={eventDate}
      onChange={(date) => setEventDate(date)}
      minDate={today}
      helperText="Sélectionnez une date future"
    />
  );
}
```

## Composants d'affichage

### Card

Le composant Card est un conteneur pour présenter des informations de manière groupée.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'outlined'`\|`'elevated'` | `'elevated'` | Style visuel de la carte |
| `onClick` | `function` | `undefined` | Fonction appelée lors du clic |
| `className` | `string` | `''` | Classes CSS additionnelles |

#### Exemple d'utilisation

```jsx
import { Card } from '../components/ui/Card';

function ConcertCard({ concert }) {
  return (
    <Card 
      variant="outlined" 
      onClick={() => navigateToDetail(concert.id)}
    >
      <h3>{concert.title}</h3>
      <p>{format(new Date(concert.date), 'dd/MM/yyyy')}</p>
      <StatutBadge statut={concert.statut} />
    </Card>
  );
}
```

### Modal

Le composant Modal affiche un contenu superposé au reste de l'application.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `open` | `boolean` | `false` | Si true, la modal est affichée |
| `onClose` | `function` | `undefined` | Fonction appelée lors de la fermeture |
| `title` | `string` | `''` | Titre de la modal |
| `maxWidth` | `'xs'`\|`'sm'`\|`'md'`\|`'lg'`\|`'xl'` | `'sm'` | Largeur maximale de la modal |
| `fullWidth` | `boolean` | `false` | Si true, la modal prend toute la largeur disponible |
| `actions` | `ReactNode` | `undefined` | Boutons d'action à afficher dans le pied de la modal |

#### Exemple d'utilisation

```jsx
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';

function DeleteConfirmationModal({ open, onClose, onConfirm, itemName }) {
  return (
    <Modal 
      open={open}
      onClose={onClose}
      title="Confirmation de suppression"
      maxWidth="xs"
      actions={
        <>
          <Button variant="text" onClick={onClose}>Annuler</Button>
          <Button variant="danger" onClick={onConfirm}>Supprimer</Button>
        </>
      }
    >
      <p>Êtes-vous sûr de vouloir supprimer {itemName} ?</p>
      <p>Cette action est irréversible.</p>
    </Modal>
  );
}
```

### LoadingSpinner

Le composant LoadingSpinner affiche un indicateur de chargement avec un message optionnel.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `message` | `string` | `'Chargement en cours...'` | Message à afficher sous l'indicateur de chargement |

#### Exemple d'utilisation

```jsx
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

function DataLoadingSection() {
  return (
    <div className="data-container">
      {isLoading ? (
        <LoadingSpinner message="Chargement des données..." />
      ) : (
        <DataTable data={data} />
      )}
    </div>
  );
}
```

### ErrorMessage

Le composant ErrorMessage affiche un message d'erreur avec une icône d'alerte.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `message` | `string` | `'Une erreur est survenue.'` | Message d'erreur à afficher |
| `variant` | `'danger'`\|`'warning'`\|`'info'` | `'danger'` | Style visuel du message d'erreur |

#### Exemple d'utilisation

```jsx
import { ErrorMessage } from '../components/ui/ErrorMessage';

function DataFetchingComponent() {
  return (
    <div className="data-container">
      {error ? (
        <ErrorMessage message={`Impossible de charger les données: ${error.message}`} />
      ) : (
        <DataTable data={data} />
      )}
    </div>
  );
}
```

## Composants spécifiques

### ProgrammateurConcertsSection

Le composant ProgrammateurConcertsSection affiche une liste de concerts associés à un programmateur.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `concertsAssocies` | `array` | `[]` | Liste des concerts associés au programmateur |

#### Exemple d'utilisation

```jsx
import { ProgrammateurConcertsSection } from '../components/programmateurs/desktop/ProgrammateurConcertsSection';

function ProgrammateurDetails({ programmateur }) {
  return (
    <div className="programmateur-details">
      {/* Autres sections du programmateur */}
      <ProgrammateurConcertsSection concertsAssocies={programmateur.concerts} />
    </div>
  );
}
```

## Bonnes pratiques d'utilisation

### Composition des composants

Les composants UI peuvent être composés pour créer des interfaces plus complexes :

```jsx
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { TextField } from '../components/ui/TextField';

function SearchCard() {
  const [searchTerm, setSearchTerm] = useState('');
  
  return (
    <Card>
      <div className="search-container">
        <TextField 
          label="Rechercher" 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          fullWidth
        />
        <Button 
          variant="primary"
          onClick={() => handleSearch(searchTerm)}
        >
          Rechercher
        </Button>
      </div>
    </Card>
  );
}
```

### Gestion des états de chargement

Utilisez les props `loading` et `disabled` pour indiquer les états de chargement :

```jsx
import { Button } from '../components/ui/Button';

function SubmitButton({ isLoading, isValid }) {
  return (
    <Button 
      variant="primary"
      loading={isLoading}
      disabled={!isValid || isLoading}
      onClick={handleSubmit}
    >
      Enregistrer
    </Button>
  );
}
```

### Adaptabilité mobile

Les composants UI sont conçus pour s'adapter aux différentes tailles d'écran :

```jsx
import { useIsMobile } from '../hooks/useIsMobile';
import { Button } from '../components/ui/Button';

function ResponsiveButton({ label, icon, onClick }) {
  const isMobile = useIsMobile();
  
  return (
    <Button 
      variant="primary"
      size={isMobile ? 'small' : 'medium'}
      startIcon={isMobile ? icon : undefined}
      onClick={onClick}
    >
      {isMobile ? '' : label}
    </Button>
  );
}
```

## Navigation
- [Vue d'ensemble des composants](COMPONENTS.md)
- [Composants communs](COMMON_COMPONENTS.md)
- [Composants de formulaire](FORM_COMPONENTS.md)
- [Retour à la documentation principale](../README.md)