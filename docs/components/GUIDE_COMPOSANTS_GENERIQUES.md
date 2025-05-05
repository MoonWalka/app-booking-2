# Guide d'utilisation des composants génériques

*Dernière mise à jour: 4 mai 2025*

## Introduction

Dans le cadre de notre refactorisation du projet TourCraft, nous avons créé plusieurs composants et hooks génériques pour remplacer les implémentations spécifiques et redondantes. Ce guide explique comment utiliser ces nouveaux éléments et comment migrer le code existant vers ces solutions standardisées.

## Composants génériques disponibles

### 1. LegalInfoSection

**Objectif**: Remplace les composants spécifiques `ProgrammateurLegalSection` et `EntrepriseLegalSection` par un composant unique et configurable.

**Fonctionnalité**: Affiche et permet l'édition des informations légales d'une entité (structure, entreprise, programmateur).

**Utilisations courantes**:
- Page de détail d'une structure
- Formulaire d'édition d'un programmateur
- Fiche entreprise d'un contrat

#### Migration depuis ProgrammateurLegalSection

```jsx
// Avant
<ProgrammateurLegalSection 
  programmateur={programmateur}
  onChange={handleChange}
  isEditing={isEditing}
  errors={errors}
/>

// Après
<LegalInfoSection
  data={programmateur}
  onChange={handleChange}
  isEditing={isEditing}
  fieldMapping={{
    companyName: 'structure.raisonSociale',
    siret: 'structure.siret',
    vat: 'structure.tva',
    address: 'structure.adresse',
    zipCode: 'structure.codePostal',
    city: 'structure.ville'
  }}
  errors={errors}
/>
```

#### Migration depuis EntrepriseLegalSection

```jsx
// Avant
<EntrepriseLegalSection 
  entreprise={entreprise}
  onChange={handleChange}
  isEditing={true}
  errors={errors}
/>

// Après
<LegalInfoSection
  data={entreprise}
  onChange={handleChange}
  isEditing={true}
  errors={errors}
  // Pas besoin de fieldMapping car la structure est déjà compatible
/>
```

### 2. StatutBadge

**Objectif**: Remplace tous les badges de statut spécifiques par un composant configurable qui s'adapte à différents types d'entités.

**Fonctionnalité**: Affiche un badge coloré avec icône et texte selon le statut d'une entité.

**Utilisations courantes**:
- Statut des concerts dans une liste
- État des contrats sur une fiche détail
- Badge d'état des factures

#### Migration depuis les anciens badges

```jsx
// Avant
<span className={`badge ${getStatusClass(concert.statut)}`}>
  {getStatusLabel(concert.statut)}
</span>

// Après
<StatutBadge status={concert.statut} entityType="concert" />
```

#### Utilisation avec texte personnalisé

```jsx
<StatutBadge 
  status="confirme" 
  entityType="concert" 
  text="Tournée confirmée" 
  size="large"
/>
```

## Hooks génériques disponibles

### 1. useGenericEntityForm

**Objectif**: Centralise toute la logique de gestion des formulaires (chargement, validation, soumission) pour n'importe quel type d'entité.

**Fonctionnalité**: Gère le cycle de vie complet d'un formulaire d'édition ou de création d'une entité.

**Utilisations courantes**:
- Formulaire de création/édition d'un concert
- Formulaire de programmateur
- Édition de structure

#### Migration depuis useConcertForm

```jsx
// Avant
const { 
  formData, 
  setFormData, 
  loading, 
  handleChange, 
  handleSubmit, 
  errors
} = useConcertForm(concertId);

// Après
const {
  formData,
  loading,
  error,
  formErrors,
  handleChange,
  handleSubmit,
  relatedData
} = useGenericEntityForm({
  entityType: 'concerts',
  entityId: concertId,
  initialData: { 
    titre: '',
    date: '',
    montant: ''
  },
  collectionName: 'concerts',
  validateForm: validateConcertForm
});
```

#### Configuration avec entités liées

```jsx
const {
  formData,
  handleChange,
  handleSubmit,
  relatedData,
  handleSelectRelatedEntity
} = useGenericEntityForm({
  entityType: 'concerts',
  entityId: concertId,
  initialData: initialConcertData,
  collectionName: 'concerts',
  relatedEntities: [
    { 
      name: 'lieu',
      collection: 'lieux',
      idField: 'lieuId',
      nameField: 'lieuNom'
    },
    { 
      name: 'artiste',
      collection: 'artistes',
      idField: 'artisteId',
      nameField: 'artisteNom'
    }
  ]
});
```

## Bonnes pratiques d'utilisation

### Pour les composants génériques

1. **Favoriser la configuration par props** plutôt que de modifier le composant source
2. **Utiliser le fieldMapping** pour adapter le composant aux différentes structures de données
3. **Privilégier les props standards** avant d'ajouter de nouvelles propriétés spécifiques
4. **Créer des wrappers** si un comportement très personnalisé est nécessaire

### Pour les hooks génériques

1. **Configurer via les options** plutôt que de dupliquer la logique
2. **Extraire la validation** dans des fonctions dédiées réutilisables
3. **Utiliser les callbacks** pour les comportements spécifiques
4. **Maintenir la compatibilité API** lors des migrations progressives

## Exemples de cas d'utilisation

### Formulaire de concert complet

```jsx
function ConcertForm({ concertId, onSuccess }) {
  // Configuration pour les concerts
  const {
    formData,
    loading,
    error,
    formErrors,
    handleChange,
    handleSubmit,
    relatedData,
    handleSelectRelatedEntity
  } = useGenericEntityForm({
    entityType: 'concerts',
    entityId: concertId,
    initialData: { 
      titre: '',
      date: '',
      montant: '',
      statut: 'option'
    },
    collectionName: 'concerts',
    validateForm: (data) => {
      const errors = {};
      if (!data.titre) errors.titre = 'Le titre est obligatoire';
      if (!data.date) errors.date = 'La date est obligatoire';
      return { isValid: Object.keys(errors).length === 0, errors };
    },
    onSuccess: onSuccess,
    relatedEntities: [
      { 
        name: 'lieu',
        collection: 'lieux',
        idField: 'lieuId',
        nameField: 'lieuNom'
      },
    ]
  });

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <form onSubmit={handleSubmit}>
      <TextField 
        label="Titre"
        name="titre"
        value={formData.titre || ''}
        onChange={handleChange}
        error={!!formErrors.titre}
        helperText={formErrors.titre}
      />
      
      <DatePicker
        label="Date"
        name="date"
        value={formData.date || ''}
        onChange={(date) => handleChange({ target: { name: 'date', value: date }})}
        error={!!formErrors.date}
        helperText={formErrors.date}
      />
      
      <EntitySelector
        label="Lieu"
        entityType="lieux"
        selectedEntity={relatedData.lieu}
        onSelect={(lieu) => handleSelectRelatedEntity('lieu', lieu)}
      />
      
      <SelectField
        label="Statut"
        name="statut"
        value={formData.statut || 'option'}
        onChange={handleChange}
        options={[
          { value: 'option', label: 'Option' },
          { value: 'confirme', label: 'Confirmé' },
          { value: 'annule', label: 'Annulé' }
        ]}
      />
      
      <Button type="submit">Enregistrer</Button>
    </form>
  );
}
```

### Affichage des informations légales d'un programmateur

```jsx
function ProgrammateurDetails({ programmateur }) {
  return (
    <div className="programmateur-details">
      <h1>{programmateur.nom}</h1>
      
      <StatutBadge 
        status={programmateur.statut || 'active'} 
        entityType="programmateur"
      />
      
      <TabPanel>
        <Tab label="Informations">
          <LegalInfoSection
            data={programmateur}
            isEditing={false}
            fieldMapping={{
              companyName: 'structure.raisonSociale',
              siret: 'structure.siret',
              vat: 'structure.tva',
              address: 'structure.adresse'
            }}
            formatValue={(val) => val || 'Non renseigné'}
            title="Informations de la structure"
          />
        </Tab>
        
        <Tab label="Concerts">
          <ConcertsList concertsIds={programmateur.concertsIds} />
        </Tab>
      </TabPanel>
    </div>
  );
}
```

## Suivi de la migration

Pour faciliter la transition progressive vers ces composants génériques, nous maintenons une liste des composants à migrer:

| Composant spécifique | Composant générique | Statut | Responsable | Date cible |
|----------------------|---------------------|--------|------------|------------|
| ProgrammateurLegalSection | LegalInfoSection | Terminé | Alice | 28/04/2025 |
| EntrepriseLegalSection | LegalInfoSection | Terminé | Alice | 28/04/2025 |
| ConcertStatusBadge | StatutBadge | Terminé | Bob | 04/05/2025 |
| ContratStatusBadge | StatutBadge | À faire | Charlie | 15/05/2025 |
| FactureStatusBadge | StatutBadge | À faire | Charlie | 15/05/2025 |
| useConcertForm | useGenericEntityForm | Terminé | Alice | 30/04/2025 |
| useLieuForm | useGenericEntityForm | À faire | David | 20/05/2025 |
| useProgrammateurForm | useGenericEntityForm | À faire | David | 20/05/2025 |

## Support et questions

Pour toute question concernant l'utilisation de ces composants génériques, référez-vous à:
1. La documentation détaillée dans le dossier `/docs/components/`
2. Les exemples d'implémentation dans le dossier `/docs/examples/`
3. Le canal Slack #refactoring-aide