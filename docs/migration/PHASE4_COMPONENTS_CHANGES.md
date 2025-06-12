# Phase 4 : Migration des Composants

## Date : 11 janvier 2025

## Modifications apportées

### 1. ConcertForm.js (Desktop)

#### Import du nouveau composant :
```javascript
// AVANT
import ContactSearchSection from '../sections/ContactSearchSection';

// APRÈS
import UnifiedContactSelector from '@/components/common/UnifiedContactSelector';
```

#### Suppression de la logique de recherche :
- Supprimé `useEntitySearch` pour les contacts
- Le composant UnifiedContactSelector gère la recherche en interne

#### Mise à jour des props du hook :
```javascript
// Ajout dans la déstructuration
contacts,              // Array de contacts
contact,               // Premier contact (rétrocompat)
handleContactsChange,  // Pour multi-contacts
handleContactChange,   // Gardé pour rétrocompat
```

#### Remplacement dans le template :
```javascript
// AVANT
<ContactSearchSection 
  progSearchTerm={progSearchTerm}
  setProgSearchTerm={setProgSearchTerm}
  // ... beaucoup de props
/>

// APRÈS
<UnifiedContactSelector
  multiple={true}  // Mode multi-contacts
  value={formData.contactIds || (formData.contactId ? [formData.contactId] : [])}
  onChange={handleContactsChange}
  isEditing={true}
  entityId={formData.id}
  entityType="concert"
  label="Organisateurs"
  required={false}
/>
```

### 2. ConcertViewWithRelances.js

#### Gestion des contacts multiples :
```javascript
// Props du hook
contacts,      // Array de contacts
contact,       // Premier contact (rétrocompat)
```

#### Affichage adapté pour multi-contacts :
```javascript
// AVANT - Un seul contact
{contact && (
  <EntityCard
    entityType="contact"
    name={contact.nom || 'Contact'}
    subtitle="Organisateur"
  />
)}

// APRÈS - Plusieurs contacts
{contacts && contacts.length > 0 ? (
  contacts.map((contact, index) => (
    <EntityCard
      key={contact.id || `contact-${index}`}
      entityType="contact"
      name={contact.nom || 'Contact'}
      subtitle={contacts.length > 1 ? `Organisateur ${index + 1}` : 'Organisateur'}
    />
  ))
) : (
  // Fallback pour rétrocompatibilité
  contact && <EntityCard ... />
)}
```

### 3. LieuForm.js

#### Remplacement de LieuContactSearchSection :
```javascript
// AVANT
import LieuContactSearchSection from './sections/LieuContactSearchSection';

// APRÈS
import UnifiedContactSelector from '@/components/common/UnifiedContactSelector';
```

#### Utilisation dans le template :
```javascript
// AVANT
<LieuContactSearchSection 
  lieu={lieu}
  isEditing={true}
  onContactsChange={(contactIds) => {
    handleChange({ target: { name: 'contactIds', value: contactIds } });
  }}
/>

// APRÈS
<UnifiedContactSelector
  multiple={true}
  value={lieu.contactIds || []}
  onChange={(contactIds) => {
    handleChange({ target: { name: 'contactIds', value: contactIds } });
  }}
  isEditing={true}
  entityId={lieu.id}
  entityType="lieu"
  label="Contacts du lieu"
  required={false}
/>
```

## Avantages de la migration

### 🎯 Simplification du code :
- Un seul composant au lieu de 3 (ContactSearchSection, LieuContactSearchSection, etc.)
- Moins de props à gérer
- Logique de recherche centralisée

### 🔄 Cohérence :
- Interface uniforme pour tous les formulaires
- Mêmes comportements partout
- Style visuel cohérent

### 🚀 Fonctionnalités :
- Support natif du mode multi-contacts
- Gestion automatique de la rétrocompatibilité
- Relations bidirectionnelles intégrées

## Points d'attention

### ⚠️ Rétrocompatibilité :
- Les anciens concerts avec `contactId` sont automatiquement convertis
- Le composant gère `value` comme string ou array
- `onChange` retourne toujours un array en mode multiple

### 📝 Props importantes :
- `multiple={true}` : Active le mode multi-contacts
- `isEditing={true}` : Mode édition (sinon lecture seule)
- `entityId` et `entityType` : Pour les relations bidirectionnelles
- `value` : Accepte string ou array selon le mode

## Composants à migrer (futures phases)

- StructureForm
- ContactForm (pour ses propres relations)
- Tous les composants utilisant ContactSearchSection ou similaires

## Tests recommandés

1. **Création** : Ajouter plusieurs contacts à un nouveau concert
2. **Édition** : Modifier les contacts d'un concert existant
3. **Migration** : Vérifier qu'un concert avec `contactId` s'affiche correctement
4. **Suppression** : Retirer un contact spécifique
5. **Recherche** : Tester la recherche intégrée dans UnifiedContactSelector