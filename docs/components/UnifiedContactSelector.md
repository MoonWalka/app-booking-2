# UnifiedContactSelector

## Vue d'ensemble

Le composant `UnifiedContactSelector` est un sélecteur de contacts unifié qui remplace les anciens composants `ContactSearchSection` et `LieuContactSearchSection`. Il gère à la fois la sélection mono-contact et multi-contacts, offrant une interface cohérente pour toutes les entités de l'application.

## Objectif

- **Unification** : Un seul composant pour tous les besoins de sélection de contacts
- **Flexibilité** : Support des modes mono et multi-contacts
- **Cohérence** : Interface uniforme dans toute l'application
- **Migration** : Facilite la transition de `contactId` vers `contactIds`

## Props

| Prop | Type | Défaut | Description |
|------|------|---------|-------------|
| `multiple` | `boolean` | `false` | Active le mode multi-contacts |
| `value` | `string \| string[]` | - | ID(s) du/des contact(s) sélectionné(s) |
| `onChange` | `function` | **requis** | Callback appelé lors du changement |
| `isEditing` | `boolean` | `false` | Active le mode édition |
| `entityId` | `string` | - | ID de l'entité parente (pour relations bidirectionnelles) |
| `entityType` | `string` | - | Type de l'entité parente ('concert', 'lieu', etc.) |
| `label` | `string` | `'Contact(s)'` | Label à afficher |
| `required` | `boolean` | `false` | Si true, au moins un contact est requis |
| `className` | `string` | `''` | Classes CSS additionnelles |

## Utilisation

### Mode mono-contact (par défaut)

```jsx
import UnifiedContactSelector from '@/components/common/UnifiedContactSelector';

// Dans un formulaire de concert
<UnifiedContactSelector
  value={concert.contactId}
  onChange={(contactId) => handleFieldChange('contactId', contactId)}
  isEditing={true}
  entityId={concert.id}
  entityType="concert"
  label="Organisateur"
  required={true}
/>
```

### Mode multi-contacts

```jsx
// Dans un formulaire de lieu
<UnifiedContactSelector
  multiple={true}
  value={lieu.contactIds || []}
  onChange={(contactIds) => handleFieldChange('contactIds', contactIds)}
  isEditing={true}
  entityId={lieu.id}
  entityType="lieu"
  label="Contacts du lieu"
/>
```

### Mode lecture seule

```jsx
// Affichage des contacts sans édition
<UnifiedContactSelector
  multiple={true}
  value={structure.contactIds}
  onChange={() => {}} // Non utilisé en lecture seule
  isEditing={false}
  label="Contacts associés"
/>
```

## Comportements

### Normalisation des valeurs

Le composant normalise automatiquement les valeurs en tableau en interne :
- `null` → `[]`
- `"id"` → `["id"]`
- `["id1", "id2"]` → `["id1", "id2"]`

### Mode mono-contact
- Un seul contact peut être sélectionné
- La sélection d'un nouveau contact remplace l'ancien
- `onChange` reçoit une string (ID) ou `null`

### Mode multi-contacts
- Plusieurs contacts peuvent être sélectionnés
- Bouton "Ajouter un autre contact" disponible
- `onChange` reçoit toujours un tableau d'IDs
- Évite automatiquement les doublons

### Chargement des données
- Charge automatiquement les informations des contacts depuis Firestore
- Affiche un indicateur de chargement pendant l'opération
- Filtre les contacts inexistants

### Mode édition
- Affiche un formulaire de recherche/sélection
- Permet la création de nouveaux contacts
- Affiche les contacts sélectionnés avec possibilité de suppression

### Mode lecture
- Affiche les informations détaillées des contacts
- Liens cliquables pour email et téléphone
- Message "Aucun contact associé" si vide

## Styles

Le composant utilise un module CSS (`UnifiedContactSelector.module.css`) avec les classes suivantes :

- `.readOnlyList` : Container pour la liste en lecture seule
- `.contactItem` : Un contact dans la liste
- `.contactInfo` : Nom et structure du contact
- `.contactDetails` : Email et téléphone
- `.selectedList` : Liste des contacts sélectionnés en édition
- `.addAnotherButton` : Bouton pour ajouter un contact
- `.loading` : Indicateur de chargement

## Migration

### Avant (ContactSearchSection)
```jsx
<ContactSearchSection
  contactId={concert.contactId}
  handleContactChange={(contact) => setValue('contactId', contact?.id)}
  isEditing={isEditing}
/>
```

### Après (UnifiedContactSelector)
```jsx
<UnifiedContactSelector
  value={concert.contactId}
  onChange={(contactId) => handleFieldChange('contactId', contactId)}
  isEditing={isEditing}
  entityId={concert.id}
  entityType="concert"
  label="Organisateur"
/>
```

### Migration vers multi-contacts
```jsx
// Étape 1 : Garder la compatibilité
<UnifiedContactSelector
  value={concert.contactId} // Ancien champ
  onChange={(contactId) => handleFieldChange('contactId', contactId)}
  isEditing={isEditing}
/>

// Étape 2 : Migrer vers le nouveau format
<UnifiedContactSelector
  multiple={true}
  value={concert.contactIds || (concert.contactId ? [concert.contactId] : [])}
  onChange={(contactIds) => handleFieldChange('contactIds', contactIds)}
  isEditing={isEditing}
/>
```

## Dépendances

- `@/components/ui/Card` : Container visuel
- `@/components/concerts/sections/SearchDropdown` : Recherche de contacts
- `@/components/concerts/sections/SelectedEntityCard` : Affichage des sélections
- `@/hooks/common/useEntitySearch` : Hook de recherche
- `@/services/firebase-service` : Accès aux données

## Tests

Le composant est testé dans `__tests__/UnifiedContactSelector.test.js` avec une couverture complète :
- Mode lecture/édition
- Mono/multi-contacts
- Normalisation des valeurs
- Gestion des erreurs
- Props et configuration

## Exemples d'intégration

### Dans ConcertForm
```jsx
// Remplacer ContactSearchSection
<UnifiedContactSelector
  value={formData.contactId}
  onChange={(contactId) => handleFieldChange('contactId', contactId)}
  isEditing={true}
  entityId={formData.id}
  entityType="concert"
  label="Organisateur principal"
  required={true}
/>
```

### Dans LieuForm
```jsx
// Remplacer LieuContactSearchSection
<UnifiedContactSelector
  multiple={true}
  value={formData.contactIds || []}
  onChange={(contactIds) => handleFieldChange('contactIds', contactIds)}
  isEditing={true}
  entityId={formData.id}
  entityType="lieu"
  label="Contacts du lieu"
/>
```

### Dans StructureForm
```jsx
// Harmoniser contactsIds → contactIds
<UnifiedContactSelector
  multiple={true}
  value={formData.contactIds || formData.contactsIds || []}
  onChange={(contactIds) => handleFieldChange('contactIds', contactIds)}
  isEditing={true}
  entityId={formData.id}
  entityType="structure"
  label="Contacts de la structure"
/>
```

## Performance

- Chargement asynchrone des contacts uniquement quand nécessaire
- Mise en cache locale des contacts chargés
- Évite les re-rendus inutiles avec `useCallback`
- Limite les résultats de recherche à 10 éléments

## Accessibilité

- Labels clairs pour tous les éléments interactifs
- Support du clavier pour la navigation
- Messages d'état pour les lecteurs d'écran
- Contraste approprié pour tous les textes

## Notes de migration

1. **Phase 1** : Utiliser le composant en mode mono-contact pour remplacer les anciens composants
2. **Phase 2** : Activer `multiple={true}` après migration des données
3. **Phase 3** : Supprimer les anciens composants et le code legacy
4. **Phase 4** : Harmoniser tous les noms de champs vers `contactIds`

---

*Dernière mise à jour : 11 janvier 2025*