# Rapport de suppression des structures imbriquées

## Date : 6/9/2025

## Objectif
Supprimer ou commenter tous les endroits où on crée encore des structures imbriquées `contact: {}` ou `structure: {}` pour garantir une structure de données plate.

## Fichiers modifiés

### 1. ContactFormMaquette.js (ligne 367)
**Avant :**
```javascript
const contact = {
  contact: {
    prenom: formData.prenom.trim(),
    nom: formData.nom.trim(),
    email: formData.email.trim(),
    // ...
  },
  structure: {
    raisonSociale: formData.structureNom.trim(),
    type: formData.structureType,
    // ...
  }
}
```

**Après :**
```javascript
const contact = {
  // Données du contact directement à la racine
  prenom: formData.prenom.trim(),
  nom: formData.nom.trim(),
  email: formData.email.trim(),
  telephone: formData.telephone.trim(),
  adresse: formData.adresse.trim(),
  codePostal: formData.codePostal.trim(),
  ville: formData.ville.trim(),
  // Données de la structure avec préfixe
  structureRaisonSociale: formData.structureNom.trim(),
  structureType: formData.structureType,
  structureSiret: formData.structureSiret.trim(),
  structureSiteWeb: formData.structureSiteWeb.trim(),
  // ...
}
```

### 2. useStructureForm.js (ligne 132 et 155)
**Avant :**
```javascript
// Ligne 132
contact: {
  nom: '',
  telephone: '',
  email: '',
  fonction: ''
}

// Ligne 155
contact: {
  ...prev.contact,
  [field]: value
}
```

**Après :**
```javascript
// Ligne 132
// Données du contact avec préfixe
contactNom: '',
contactTelephone: '',
contactEmail: '',
contactFonction: ''

// Ligne 155
// Utiliser des champs plats avec préfixe
[`contact${field.charAt(0).toUpperCase() + field.slice(1)}`]: value
```

### 3. useLieuDetails.js (ligne 575)
**Avant :**
```javascript
contact: {
  id: newContact.id,
  nom: newContact.nom,
  prenom: newContact.prenom
}
```

**Après :**
```javascript
// Données du contact directement à la racine avec préfixe
contactId: newContact.id,
contactNom: newContact.nom,
contactPrenom: newContact.prenom,
contactFullName: `${newContact.prenom} ${newContact.nom}`.trim()
```

### 4. useContactForm.js (ligne 181)
**Avant :**
```javascript
return {
  contact: {
    nom: data.nom || '',
    prenom: data.prenom || '',
    // ...
  },
  structure: data.structureInfo || {
    raisonSociale: '',
    // ...
  }
}
```

**Après :**
```javascript
return {
  // Données du contact à la racine
  nom: data.nom || '',
  prenom: data.prenom || '',
  fonction: data.fonction || '',
  email: data.email || '',
  telephone: data.telephone || '',
  
  // Données de la structure avec préfixe
  structureRaisonSociale: data.structureRaisonSociale || data.structureInfo?.raisonSociale || '',
  structureType: data.structureType || data.structureInfo?.type || '',
  // ...
}
```

### 5. structureService.js (ligne 169)
**Avant :**
```javascript
await updateDoc(progRef, {
  structure: {
    id: structureId,
    nom: structureData.nom,
    type: structureData.type
  },
  updatedAt: Timestamp.now()
});
```

**Après :**
```javascript
await updateDoc(progRef, {
  // Données de structure plates avec préfixe
  structureId: structureId,
  structureNom: structureData.nom,
  structureType: structureData.type,
  updatedAt: Timestamp.now()
});
```

### 6. StructureInfoSection.js (ligne 23-24)
**Avant :**
```javascript
const values = isFormikMode 
  ? (formik.values || { structure: {}, structureId: '' })
  : (formData || { structure: {}, structureId: '' });
```

**Après :**
```javascript
const values = isFormikMode 
  ? (formik.values || { structureId: '' })
  : (formData || { structureId: '' });
```

## Script de vérification créé
Un script `check-nested-structures.js` a été créé pour vérifier automatiquement la présence de structures imbriquées dans le code.

## Faux positifs identifiés
Les fichiers suivants contiennent `contact: {` ou `structure: {` mais ce sont des configurations légitimes :
- entityConfigurations.js : Configuration des relations entre entités
- useSafeRelations.js : Configuration des relations bidirectionnelles
- EntityCard.js : Styles CSS par type d'entité
- StatutBadge.js : Configuration des badges de statut
- useConcertStatus.js : Configuration des statuts
- useGenericEntityStatus.js : Configuration générique des statuts
- useAdminFormValidation.js : Commentaire dans JSDoc

## Résultat
✅ Toutes les créations de structures imbriquées ont été supprimées ou converties en structures plates avec préfixes.

## Recommandations
1. Toujours utiliser des structures plates avec préfixes pour les données composées
2. Utiliser le script `check-nested-structures.js` régulièrement pour vérifier
3. Documenter clairement la convention de nommage avec préfixes