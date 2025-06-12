# Phase 2 : Changements de Configuration

## Date : 11 janvier 2025

## Modifications apportées dans entityConfigurations.js

### 1. Configuration Concert

#### Relations modifiées :
```javascript
// AVANT
contact: { 
  collection: 'contacts', 
  field: 'contactId',     // Singulier
  isArray: false,         // Un seul contact
  displayName: 'Organisateur',
  bidirectional: true,
  inverseField: 'concertsIds'
}

// APRÈS
contact: { 
  collection: 'contacts', 
  field: 'contactIds',    // Pluriel
  isArray: true,          // Plusieurs contacts
  displayName: 'Contacts',
  bidirectional: true,
  inverseField: 'concertsIds'
}
```

#### Sections modifiées :
```javascript
// AVANT
{
  id: 'contact',
  title: 'Organisateur',
  icon: 'bi-person',
  type: 'relations',
  relation: 'contact',
  displayType: 'card',    // Affichage unique
  single: true            // Un seul contact
}

// APRÈS
{
  id: 'contact',
  title: 'Contacts',      // Pluriel
  icon: 'bi-person',
  type: 'relations',
  relation: 'contact',
  displayType: 'cards',   // Affichage multiple
  single: false           // Plusieurs contacts
}
```

### 2. Configuration Structure

#### Relations harmonisées :
```javascript
// AVANT
contacts: { 
  collection: 'contacts', 
  field: 'contactsIds',   // Incohérent avec le reste
  isArray: true,
  displayName: 'Contacts',
  inverseField: 'structureId',
  bidirectional: true
}

// APRÈS
contacts: { 
  collection: 'contacts', 
  field: 'contactIds',    // Harmonisé
  isArray: true,
  displayName: 'Contacts',
  inverseField: 'structureId',
  bidirectional: true
}
```

### 3. Configuration Contact

#### Relation inverse modifiée :
```javascript
// AVANT
structure: { 
  collection: 'structures', 
  field: 'structureId', 
  isArray: false,
  displayName: 'Structure',
  bidirectional: true,
  inverseField: 'contactsIds'  // Incohérent
}

// APRÈS
structure: { 
  collection: 'structures', 
  field: 'structureId', 
  isArray: false,
  displayName: 'Structure',
  bidirectional: true,
  inverseField: 'contactIds'    // Harmonisé
}
```

## Impact des changements

### ✅ Positif
- Configuration prête pour la migration multi-contacts
- Harmonisation des noms de champs (tous en `contactIds`)
- Cohérence dans l'affichage (cards au pluriel)

### ⚠️ À surveiller
- Les composants existants doivent être adaptés pour gérer les tableaux
- Les données existantes doivent être migrées
- Les relations bidirectionnelles doivent être maintenues

## Prochaines étapes

1. **Phase 3** : Migration des hooks pour gérer les nouveaux formats
2. **Phase 4** : Adaptation des composants UI
3. **Phase 5** : Migration des services
4. **Phase 6** : Script de migration des données

## Notes importantes

- La configuration est maintenant cohérente : tous utilisent `contactIds` (pluriel)
- Concert est configuré pour accepter plusieurs contacts
- L'affichage est préparé pour le mode multi-contacts
- Les relations bidirectionnelles sont préservées

## Compatibilité temporaire

Pendant la phase de migration, il faudra gérer :
- Concerts avec `contactId` (ancien format)
- Concerts avec `contactIds` (nouveau format)
- Conversion automatique dans les hooks et composants