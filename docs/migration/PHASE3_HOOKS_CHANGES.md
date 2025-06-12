# Phase 3 : Migration des Hooks

## Date : 11 janvier 2025

## Modifications apportées

### 1. useConcertForm.js

#### Gestion des contacts multiples :

```javascript
// AVANT
const previousContactIdRef = useRef(null);

// APRÈS
const previousContactIdsRef = useRef([]); // Array pour multi-contacts
```

#### Données initiales :
```javascript
// AVANT
initialData: {
  contactId: '',
  contacts: []
}

// APRÈS
initialData: {
  contactIds: [],      // Array principal
  contacts: []         // Garder pour rétrocompatibilité
}
```

#### Relations configurées :
```javascript
// AVANT
{ name: 'contact', collection: 'contacts', idField: 'contactId' }

// APRÈS
{ name: 'contacts', collection: 'contacts', idField: 'contactIds', isArray: true }
```

#### Nouvelles méthodes :
- `handleContactsChange(contactIds)` : Gère un array d'IDs
- `handleAddContact(contact)` : Adapté pour ajouter à l'array
- `handleRemoveContact(contactId)` : Supprime par ID

#### Transformation des données :
```javascript
// Migration automatique dans transformConcertData
if (data.contactId && (!data.contactIds || data.contactIds.length === 0)) {
  transformedData.contactIds = [data.contactId];
}
```

### 2. useConcertFormWithRelations.js

#### État des contacts :
```javascript
// AVANT
const [contact, setContact] = useState(null);

// APRÈS
const [contacts, setContacts] = useState([]); // Array
```

#### Chargement des contacts :
```javascript
// Gestion de la rétrocompatibilité
let contactIdsToLoad = [];
if (baseHook.formData.contactIds && Array.isArray(baseHook.formData.contactIds)) {
  contactIdsToLoad = baseHook.formData.contactIds;
} else if (baseHook.formData.contactId) {
  contactIdsToLoad = [baseHook.formData.contactId];
}
```

#### Nouvelles méthodes exportées :
- `handleContactsChange` : Pour gérer plusieurs contacts
- `contacts` : Array de contacts
- `contact` : Premier contact (rétrocompatibilité)

### 3. useConcertDetails.js

#### Configuration des relations :
```javascript
// AVANT
{
  name: 'contact',
  collection: 'contacts',
  idField: 'contactId',
  type: 'one-to-one'
}

// APRÈS
{
  name: 'contacts',
  collection: 'contacts',
  idField: 'contactIds',
  alternativeIdFields: ['contactId', 'contact'],
  type: 'one-to-many',
  normalizeIds: (data) => {
    if (data.contactIds && Array.isArray(data.contactIds)) {
      return data.contactIds;
    } else if (data.contactId) {
      return [data.contactId];
    }
    return [];
  }
}
```

#### État initial :
```javascript
// AVANT
const [initialContactId, setInitialContactId] = useState(null);

// APRÈS
const [initialContactIds, setInitialContactIds] = useState([]);
```

#### Relations bidirectionnelles :
- Gestion des ajouts/suppressions multiples
- Comparaison des arrays pour détecter les changements
- Mise à jour incrémentale des relations

#### Valeurs retournées :
- `contacts` : Array complet des contacts
- `contact` : Premier contact (rétrocompatibilité)
- `setContacts` : Définir plusieurs contacts
- `contactsSearch` : Nouvelle interface de recherche multi-contacts

## Impact sur les composants

Les composants utilisant ces hooks devront :

1. **Utiliser UnifiedContactSelector** au lieu de ContactSearchSection
2. **Passer `multiple={true}`** pour activer le mode multi-contacts
3. **Utiliser `handleContactsChange`** au lieu de `handleContactChange`
4. **Accéder à `contacts`** (array) au lieu de `contact` (objet)

## Compatibilité

### ✅ Rétrocompatibilité maintenue :
- `contact` retourne toujours le premier contact de l'array
- `contactId` est automatiquement migré vers `contactIds`
- Les anciens composants continuent de fonctionner

### ⚠️ Points d'attention :
- Les nouvelles sauvegardes utilisent `contactIds`
- Les relations bidirectionnelles gèrent plusieurs contacts
- La validation doit accepter les deux formats

## Tests à effectuer

1. **Création concert** : Vérifier qu'on peut ajouter plusieurs contacts
2. **Édition concert** : Vérifier la migration automatique `contactId` → `contactIds`
3. **Relations bidirectionnelles** : Vérifier que tous les contacts sont liés
4. **Suppression contact** : Vérifier que la relation est bien supprimée
5. **Affichage** : Vérifier que tous les contacts s'affichent

## Prochaines étapes

- Phase 4 : Adapter les composants UI (ConcertForm, ConcertDetails)
- Phase 5 : Migrer les services
- Phase 6 : Script de migration des données existantes