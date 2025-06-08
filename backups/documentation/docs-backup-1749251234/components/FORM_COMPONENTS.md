# Composants de Formulaire

## Introduction

Les composants de formulaire de TourCraft permettent de créer des interfaces utilisateur pour la saisie, la validation et la soumission de données. Ces composants sont conçus pour être réutilisables, accessibles et faciliter la gestion des états de formulaire.

## Principes de conception

- **Validation intégrée** : Support pour la validation des champs avec affichage d'erreurs
- **Accessibilité** : Labels appropriés et support des technologies d'assistance
- **État de formulaire** : Gestion cohérente des états (non modifié, modifié, en cours de soumission, erreur)
- **Réactivité** : Adaptation à tous les formats d'écran

## Composants principaux

### FormLayout

**But :** Conteneur principal pour les formulaires avec mise en page standardisée
  
**Props :** 
- `title: string` - Titre du formulaire
- `subtitle: string` - Sous-titre optionnel
- `onSubmit: (data) => void` - Fonction de soumission
- `isSubmitting: boolean` - État de soumission
- `submitLabel: string` - Texte du bouton de soumission
- `children: ReactNode` - Contenu du formulaire
- `actions: ReactNode` - Actions supplémentaires (boutons, liens, etc.)

**Dépendances :** 
- components/ui/Button.js
- components/ui/SectionTitle.js
- Modules CSS

**Exemple d'utilisation :**

```jsx
import FormLayout from '../components/forms/FormLayout';

function ArtisteForm({ onSubmit, isSubmitting }) {
  return (
    <FormLayout 
      title="Nouveau artiste"
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      submitLabel="Enregistrer"
    >
      {/* Champs du formulaire */}
      <TextField label="Nom" name="nom" required />
      <Select 
        label="Genre musical" 
        name="genre"
        options={genresMusicaux}
      />
      {/* Autres champs */}
    </FormLayout>
  );
}
```

### FormSection

**But :** Regrouper des champs de formulaire connexes dans une section
  
**Props :** 
- `title: string` - Titre de la section
- `description: string` - Description optionnelle
- `collapsible: boolean` - Si la section peut être réduite/agrandie
- `defaultExpanded: boolean` - Si la section est agrandie par défaut
- `children: ReactNode` - Contenu de la section

**Dépendances :** 
- components/ui/SectionTitle.js
- Modules CSS

**Exemple d'utilisation :**

```jsx
import FormSection from '../components/forms/FormSection';

function ContactForm() {
  return (
    <FormLayout title="Contact" onSubmit={handleSubmit}>
      <FormSection 
        title="Informations personnelles"
        description="Informations de base du contact"
      >
        <TextField label="Nom" name="nom" required />
        <TextField label="Prénom" name="prenom" required />
      </FormSection>
      
      <FormSection 
        title="Coordonnées"
        collapsible
        defaultExpanded={true}
      >
        <TextField label="Email" name="email" type="email" />
        <TextField label="Téléphone" name="telephone" />
      </FormSection>
    </FormLayout>
  );
}
```

### FormRow

**But :** Organiser plusieurs champs sur une même ligne
  
**Props :** 
- `spacing: 'normal'|'compact'` - Espacement entre les champs
- `children: ReactNode` - Champs à afficher sur la ligne
- `mobileStack: boolean` - Si les champs s'empilent en version mobile

**Dépendances :** 
- hooks/common/useResponsive.js
- Modules CSS

**Exemple d'utilisation :**

```jsx
import FormRow from '../components/forms/FormRow';
import TextField from '../components/ui/TextField';

function AddressForm() {
  return (
    <>
      <FormRow>
        <TextField label="Rue" name="rue" fullWidth />
        <TextField label="Numéro" name="numero" />
      </FormRow>
      
      <FormRow>
        <TextField label="Code postal" name="codePostal" />
        <TextField label="Ville" name="ville" fullWidth />
      </FormRow>
    </>
  );
}
```

### FormField

**But :** Wrapper pour les champs de formulaire avec label, validation et messages d'erreur standardisés
  
**Props :** 
- `label: string` - Label du champ
- `name: string` - Nom du champ
- `error: string` - Message d'erreur éventuel
- `required: boolean` - Si le champ est obligatoire
- `helpText: string` - Texte d'aide
- `children: ReactNode` - Composant de champ (TextField, Select, etc.)

**Dépendances :** 
- Modules CSS

**Exemple d'utilisation :**

```jsx
import FormField from '../components/forms/FormField';
import TextField from '../components/ui/TextField';

function EmailField({ value, onChange, error }) {
  return (
    <FormField 
      label="Adresse email"
      name="email"
      error={error}
      required
      helpText="Cette adresse sera utilisée pour l'envoi des contrats"
    >
      <TextField 
        value={value}
        onChange={onChange}
        type="email"
      />
    </FormField>
  );
}
```

## Composants spécialisés

### EntitySearchField

**But :** Champ de recherche pour trouver et sélectionner des entités (artistes, lieux, programmateurs)
  
**Props :** 
- `entityType: string` - Type d'entité à rechercher ('lieux', 'programmateurs', 'artistes', 'concerts')
- `onSelect: (entity) => void` - Callback pour la sélection d'une entité
- `placeholder: string` - Texte de placeholder
- `allowCreate: boolean` - Autorise la création d'entités
- `preSelectedEntity: object` - Entité déjà sélectionnée
- `label: string` - Label du champ
- `error: string` - Message d'erreur éventuel

**Dépendances :** 
- hooks/common/useEntitySearch.js
- components/ui/TextField.js
- Modules CSS

**Exemple d'utilisation :**

```jsx
import EntitySearchField from '../components/forms/EntitySearchField';

function ConcertForm() {
  const [artiste, setArtiste] = useState(null);
  
  return (
    <FormLayout title="Nouveau concert" onSubmit={handleSubmit}>
      <EntitySearchField 
        entityType="artistes"
        onSelect={setArtiste}
        placeholder="Rechercher un artiste"
        label="Artiste"
        preSelectedEntity={artiste}
        allowCreate
      />
      
      {/* Autres champs du formulaire */}
    </FormLayout>
  );
}
```

### AddressInput

**But :** Champ de saisie d'adresse avec autocomplétion
  
**Props :** 
- `value: object` - Valeur actuelle de l'adresse
- `onChange: (address) => void` - Fonction appelée lors du changement
- `error: string` - Message d'erreur
- `required: boolean` - Si le champ est obligatoire

**Dépendances :** 
- hooks/useLocationIQ.js
- components/ui/TextField.js
- Modules CSS

**Exemple d'utilisation :**

```jsx
import AddressInput from '../components/forms/AddressInput';

function LieuForm() {
  const [address, setAddress] = useState({
    street: '',
    number: '',
    city: '',
    postalCode: '',
    country: 'France'
  });
  
  return (
    <FormLayout title="Nouveau lieu" onSubmit={handleSubmit}>
      <AddressInput 
        value={address}
        onChange={setAddress}
        required
      />
      
      {/* Autres champs du formulaire */}
    </FormLayout>
  );
}
```

### DateTimeInput

**But :** Saisie de date et heure combinée
  
**Props :** 
- `value: Date` - Date et heure sélectionnée
- `onChange: (date) => void` - Fonction appelée lors du changement
- `label: string` - Label du champ
- `error: string` - Message d'erreur
- `required: boolean` - Si le champ est obligatoire
- `minDate: Date` - Date minimum sélectionnable
- `maxDate: Date` - Date maximum sélectionnable

**Dépendances :** 
- components/ui/DatePicker.js
- components/ui/TimePicker.js
- Modules CSS

**Exemple d'utilisation :**

```jsx
import DateTimeInput from '../components/forms/DateTimeInput';

function ConcertForm() {
  const [eventDate, setEventDate] = useState(new Date());
  
  return (
    <FormLayout title="Nouveau concert" onSubmit={handleSubmit}>
      <DateTimeInput 
        value={eventDate}
        onChange={setEventDate}
        label="Date et heure du concert"
        required
        minDate={new Date()} // Pas de concerts dans le passé
      />
      
      {/* Autres champs du formulaire */}
    </FormLayout>
  );
}
```

### FileUploadField

**But :** Champ pour le téléchargement de fichiers
  
**Props :** 
- `accept: string` - Types de fichiers acceptés (ex: 'image/*', '.pdf')
- `multiple: boolean` - Si plusieurs fichiers peuvent être téléchargés
- `maxSize: number` - Taille maximale en octets
- `onUpload: (files) => void` - Fonction appelée après téléchargement réussi
- `label: string` - Label du champ
- `error: string` - Message d'erreur
- `preview: boolean` - Afficher une prévisualisation des images

**Dépendances :** 
- components/ui/Button.js
- Modules CSS

**Exemple d'utilisation :**

```jsx
import FileUploadField from '../components/forms/FileUploadField';

function ArtisteMediaForm() {
  const handleFilesUploaded = (files) => {
    // Traitement des fichiers
  };
  
  return (
    <FormSection title="Médias">
      <FileUploadField 
        accept="image/*"
        multiple
        maxSize={5 * 1024 * 1024} // 5MB
        onUpload={handleFilesUploaded}
        label="Photos de l'artiste"
        preview
      />
      
      <FileUploadField 
        accept=".pdf"
        multiple={false}
        maxSize={10 * 1024 * 1024} // 10MB
        onUpload={handleRiderUploaded}
        label="Rider technique"
      />
    </FormSection>
  );
}
```

### MoneyInput

**But :** Champ de saisie pour les montants monétaires
  
**Props :** 
- `value: number` - Montant
- `onChange: (amount) => void` - Fonction appelée lors du changement
- `label: string` - Label du champ
- `currency: 'EUR'|'USD'|'GBP'` - Devise
- `error: string` - Message d'erreur
- `required: boolean` - Si le champ est obligatoire

**Dépendances :** 
- components/ui/TextField.js
- utils/formatters.js
- Modules CSS

**Exemple d'utilisation :**

```jsx
import MoneyInput from '../components/forms/MoneyInput';

function ContratForm() {
  const [montant, setMontant] = useState(0);
  
  return (
    <FormSection title="Conditions financières">
      <MoneyInput 
        value={montant}
        onChange={setMontant}
        label="Montant du cachet"
        currency="EUR"
        required
      />
    </FormSection>
  );
}
```

## Validation de formulaire

TourCraft utilise une approche de validation de formulaire basée sur des règles définies par champ:

```jsx
import { useFormValidation } from '../hooks/forms/useFormValidation';

function ConcertForm() {
  const initialValues = {
    titre: '',
    date: null,
    artisteId: '',
    programmateurId: '',
    lieuId: '',
    cachet: 0
  };
  
  const validationRules = {
    titre: { required: true, minLength: 3 },
    date: { required: true, isDate: true, minDate: new Date() },
    artisteId: { required: true },
    programmateurId: { required: true },
    lieuId: { required: true },
    cachet: { isNumber: true, min: 0 }
  };
  
  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
    isSubmitting,
    isValid
  } = useFormValidation({
    initialValues,
    validationRules,
    onSubmit: submitForm
  });
  
  // Rendu du formulaire avec les états appropriés
}
```

## Gestion des états de formulaire

Les formulaires TourCraft utilisent un pattern standard pour gérer leurs différents états:

### Non modifié (pristine)
Formulaire non encore modifié par l'utilisateur.

### Modifié (dirty)
Au moins un champ a été modifié par l'utilisateur.

### En cours de validation
Validation en cours, généralement après changement de valeur ou perte de focus.

### En cours de soumission
Formulaire en cours de soumission, généralement en attente de réponse API.

### Erreur
Une ou plusieurs erreurs de validation sont présentes dans le formulaire.

### Succès
Formulaire soumis avec succès.

## Modèles de formulaire

### useFormModel

Pour les formulaires complexes, TourCraft utilise le pattern de modèle de formulaire:

```jsx
import { useFormModel } from '../hooks/forms/useFormModel';

function ConcertForm() {
  // Définition du modèle
  const concertModel = useFormModel({
    fields: {
      titre: {
        type: 'text',
        label: 'Titre',
        required: true,
        validation: { minLength: 3 }
      },
      date: {
        type: 'datetime',
        label: 'Date et heure',
        required: true
      },
      artisteId: {
        type: 'entity',
        entityType: 'artistes',
        label: 'Artiste',
        required: true
      },
      // Autres champs...
    },
    sections: [
      { 
        title: 'Informations générales',
        fields: ['titre', 'date']
      },
      {
        title: 'Participants',
        fields: ['artisteId', 'programmateurId']
      }
    ]
  });
  
  return concertModel.renderForm({
    onSubmit: handleSubmit,
    submitLabel: 'Enregistrer le concert'
  });
}
```

## Navigation
- [Vue d'ensemble des composants](COMPONENTS.md)
- [Composants UI](UI_COMPONENTS.md)
- [Composants communs](COMMON_COMPONENTS.md)
- [Retour à la documentation principale](../README.md)