# Correction de la structure imbriquée des contacts

## Problème identifié

Les contacts sont sauvegardés dans Firebase avec une structure imbriquée incorrecte :

```json
{
  "contact": {
    "nom": "Dupont",
    "prenom": "Jean",
    "email": "jean.dupont@example.com",
    "fonction": "Directeur",
    "telephone": "0123456789"
  },
  "structure": {
    "raisonSociale": "Ma Structure",
    "type": "Association",
    "adresse": "123 rue Example",
    "codePostal": "75001",
    "ville": "Paris"
  },
  "entrepriseId": "org123",
  "concertsAssocies": []
}
```

Au lieu de la structure aplatie attendue :

```json
{
  "nom": "Dupont",
  "prenom": "Jean", 
  "email": "jean.dupont@example.com",
  "fonction": "Directeur",
  "telephone": "0123456789",
  "structureId": "struct123",
  "structureNom": "Ma Structure",
  "entrepriseId": "org123",
  "concertsAssocies": []
}
```

## Cause du problème

Le hook `useContactForm` utilisait une fonction `transformContactData` qui maintenait la structure imbriquée au lieu de l'aplatir avant la sauvegarde.

## Solution appliquée

### 1. Correction de la transformation des données

La fonction `transformContactData` dans `useContactForm` a été modifiée pour aplatir la structure :

```javascript
const transformContactData = useCallback((data) => {
  // Aplatir la structure pour éviter l'imbrication
  const transformedData = {
    // Extraire les champs du contact au niveau racine
    nom: data.contact?.nom || '',
    prenom: data.contact?.prenom || '',
    fonction: data.contact?.fonction || '',
    email: data.contact?.email || '',
    telephone: data.contact?.telephone || '',
    
    // Conserver les informations de structure
    structureId: data.structureId || '',
    structureNom: data.structureNom || data.structure?.raisonSociale || '',
    
    // Informations de structure si pas de structureId (nouvelle structure)
    ...((!data.structureId && data.structure) ? {
      structureInfo: {
        raisonSociale: data.structure.raisonSociale || '',
        type: data.structure.type || '',
        adresse: data.structure.adresse || '',
        codePostal: data.structure.codePostal || '',
        ville: data.structure.ville || '',
        pays: data.structure.pays || 'France',
        siret: data.structure.siret || '',
        tva: data.structure.tva || ''
      }
    } : {}),
    
    // Autres champs
    concertsAssocies: data.concertsAssocies || [],
    updatedAt: new Date()
  };
  
  return transformedData;
}, []);
```

### 2. Gestion de la rétrocompatibilité

Pour gérer les données existantes qui peuvent être soit aplaties soit imbriquées, une fonction `transformLoadedData` a été ajoutée :

```javascript
const transformLoadedData = useCallback((data) => {
  if (!data) return null;
  
  // Si les données sont déjà dans la structure imbriquée, les retourner telles quelles
  if (data.contact && typeof data.contact === 'object') {
    return data;
  }
  
  // Transformer les données aplaties en structure imbriquée pour le formulaire
  return {
    contact: {
      nom: data.nom || '',
      prenom: data.prenom || '',
      fonction: data.fonction || '',
      email: data.email || '',
      telephone: data.telephone || ''
    },
    structure: data.structureInfo || {
      raisonSociale: '',
      type: '',
      adresse: '',
      codePostal: '',
      ville: '',
      pays: 'France',
      siret: '',
      tva: ''
    },
    structureId: data.structureId || '',
    structureNom: data.structureNom || '',
    concertsAssocies: data.concertsAssocies || [],
    id: data.id,
    entrepriseId: data.entrepriseId
  };
}, []);
```

### 3. Script de migration des données existantes

Un script `fix-nested-contacts.js` a été créé pour migrer les contacts existants avec une structure imbriquée :

```bash
node scripts/fix-nested-contacts.js
```

Ce script :
- Recherche tous les contacts avec une structure imbriquée
- Les transforme en structure aplatie
- Supprime les champs imbriqués `contact` et `structure`
- Préserve toutes les autres données

## Vérification

Pour vérifier que la correction fonctionne :

1. Créer un nouveau contact et vérifier dans Firebase que la structure est aplatie
2. Éditer un contact existant et vérifier que les données sont correctement sauvegardées
3. Exécuter le script de migration pour corriger les contacts existants

## Impact

- Les nouveaux contacts seront sauvegardés avec la structure aplatie
- Les contacts existants avec structure imbriquée seront automatiquement transformés lors du chargement dans le formulaire
- Le script de migration permet de corriger tous les contacts existants en une seule fois

## Date de correction

6 janvier 2025