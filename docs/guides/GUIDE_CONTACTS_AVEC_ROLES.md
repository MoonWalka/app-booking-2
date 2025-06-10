# Guide : Système de contacts avec rôles

## 🎯 Objectif

Permettre d'avoir plusieurs contacts par concert avec des rôles différents (coordinateur, signataire, technique, etc.) sans écraser le contact principal lors de la validation du formulaire public.

## 🔍 Problème résolu

**Avant** : Le signataire du formulaire public écrasait le contact coordinateur
**Après** : Le signataire est ajouté comme un contact séparé avec le rôle "signataire"

## 📋 Structure de données

### Ancienne structure (toujours supportée)
```javascript
{
  contactId: "id-unique",
  // ... autres champs
}
```

### Nouvelle structure
```javascript
{
  contactsWithRoles: [
    {
      contactId: "id-nathan",
      role: "coordinateur",
      isPrincipal: true
    },
    {
      contactId: "id-sophie",
      role: "signataire", 
      isPrincipal: false
    }
  ],
  // ... autres champs
}
```

## 🏷️ Rôles disponibles

- `coordinateur` : Contact principal pour la coordination (par défaut)
- `signataire` : Personne qui signe le contrat
- `technique` : Contact technique
- `administratif` : Contact administratif
- `commercial` : Contact commercial
- `autre` : Autre rôle

## 🚀 Utilisation

### 1. Dans ConcertForm

Remplacer `ContactSearchSection` par `ContactSearchSectionWithRoles` :

```javascript
import ContactSearchSectionWithRoles from './sections/ContactSearchSectionWithRoles';

// Dans le render
<ContactSearchSectionWithRoles
  // Props existantes
  progSearchTerm={progSearchTerm}
  setProgSearchTerm={setProgSearchTerm}
  // ... autres props
  
  // Nouvelles props
  contactsWithRoles={formData.contactsWithRoles || []}
  onContactsWithRolesChange={(contacts) => 
    handleChange({ target: { name: 'contactsWithRoles', value: contacts } })
  }
/>
```

### 2. Dans FormValidationInterface

Lors de la validation, créer un contact signataire au lieu d'écraser :

```javascript
import { createSignataireContact } from './ContactSearchSectionWithRoles';

// Dans handleValidation
if (formData.signataireData) {
  const signataire = createSignataireContact(formData.signataireData);
  // Ajouter aux contacts existants au lieu de remplacer
  updatedData.contactsWithRoles = [
    ...(existingData.contactsWithRoles || []),
    { contactId: signataire.id, role: 'signataire', isPrincipal: false }
  ];
}
```

### 3. Dans les templates de contrat

Les variables utilisent automatiquement le bon contact :

```javascript
// Variables disponibles
{{signataire_nom}} // Nom du signataire
{{signataire_fonction}} // Fonction du signataire
{{contact_nom}} // Nom du contact principal
{{coordinateur_nom}} // Nom du coordinateur
```

## 🔄 Migration progressive

### Phase 1 : Coexistence
- Le système supporte les deux structures
- `contactId` est automatiquement converti en `contactsWithRoles`
- Les variables de contrat continuent de fonctionner

### Phase 2 : Migration des données
```javascript
// Script de migration
if (concert.contactId && !concert.contactsWithRoles) {
  concert.contactsWithRoles = [{
    contactId: concert.contactId,
    role: 'coordinateur',
    isPrincipal: true
  }];
}
```

### Phase 3 : Nettoyage
- Supprimer `contactId` après migration complète
- Utiliser uniquement `contactsWithRoles`

## ✅ Avantages

1. **Pas d'écrasement** : Le coordinateur n'est jamais remplacé
2. **Flexibilité** : Plusieurs contacts avec des rôles différents
3. **Traçabilité** : On sait qui fait quoi
4. **Rétrocompatibilité** : L'ancien système continue de fonctionner
5. **Variables intelligentes** : Le contrat utilise automatiquement le bon contact

## 🛠️ Composants créés

- `ContactSearchSectionWithRoles.js` : Version améliorée avec gestion des rôles
- `ContactWithRoleSelector.js` : Sélecteur de rôle pour chaque contact
- `useContratGeneratorWithRoles.js` : Hook qui utilise le contact signataire

## 📝 Exemple concret

1. **Création concert** : Nathan est ajouté comme coordinateur
2. **Envoi formulaire** : Le formulaire public est envoyé à l'organisateur
3. **Remplissage** : Sophie remplit et met son nom comme signataire
4. **Validation** : Sophie est ajoutée comme contact signataire (Nathan reste coordinateur)
5. **Génération contrat** : Le contrat utilise Sophie comme signataire

## 🔧 Configuration

Aucune configuration nécessaire. Le système détecte automatiquement :
- Si `contactsWithRoles` existe → nouveau système
- Si seulement `contactId` existe → ancien système (converti automatiquement)

## 🚨 Points d'attention

1. **Unicité des rôles** : Éviter d'avoir plusieurs contacts avec le même rôle
2. **Contact principal** : Toujours avoir un contact avec `isPrincipal: true`
3. **Permissions** : Vérifier que l'utilisateur peut ajouter/modifier des contacts
4. **Validation** : S'assurer qu'au moins un contact existe avant génération

## 📊 Impact sur l'existant

- ✅ Templates de contrat : Continuent de fonctionner
- ✅ Exports : Adaptés automatiquement
- ✅ API : Rétrocompatible
- ⚠️ Rapports : Peuvent nécessiter une adaptation pour afficher tous les contacts