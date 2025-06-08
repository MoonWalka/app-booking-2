# Standardisation des modèles de données

*Document créé le: 4 mai 2025*

## Introduction

Ce document définit les standards pour les modèles de données utilisés dans l'application TourCraft. Il sert de référence pour tous les développeurs travaillant sur le projet afin d'assurer la cohérence et la maintenabilité du code.

## Principes généraux

1. **Cohérence** : Les mêmes données doivent être accessibles de la même manière partout dans l'application.
2. **Prévisibilité** : La structure des données doit être prévisible et documentée.
3. **Typage** : Toutes les entités doivent avoir des interfaces TypeScript correspondantes.
4. **Validation** : Les données doivent être validées avec des schémas Yup.

## Convention pour les relations entre entités

### Décision : Approche hybride avec relation principale par référence

Après analyse des composants existants et des besoins de l'application, nous adopterons une approche hybride :

1. **Relation principale par ID** : Les entités principales seront liées par ID (ex: `structureId` pour lier un programmateur à une structure).
2. **Cache des données liées** : Les données fréquemment utilisées de l'entité liée seront dupliquées dans l'entité parent.

Exemple pour un programmateur lié à une structure :

```typescript
// Bon exemple - Approche hybride
interface Programmateur {
  id: string;
  nom: string;
  // Relation principale par ID
  structureId: string;
  // Cache des données fréquemment utilisées (données dupliquées pour performance)
  structureCache: {
    raisonSociale: string;
    type: string;
    ville?: string;
  };
}
```

### À éviter

```typescript
// À éviter - Approche inconsistante
interface Programmateur {
  id: string;
  nom: string;
  // Mélange d'ID et de propriétés à plat 
  structureId: string;
  structure: string; // Juste le nom
  structureType: string; 
  structureVille: string;
}
```

## Interfaces des entités principales

### Programmateur

```typescript
interface Programmateur {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  fonction?: string;
  // Relation avec Structure
  structureId?: string;
  structureCache?: {
    raisonSociale: string;
    type: string;
    adresse?: string;
    codePostal?: string;
    ville?: string;
    pays?: string;
    siret?: string;
    tva?: string;
  };
  // Autres propriétés
  adresse?: string;
  codePostal?: string;
  ville?: string;
  pays?: string;
  notes?: string;
  dateCreation: Date | number | string;
  dateModification?: Date | number | string;
  tags?: string[];
}
```

### Structure

```typescript
interface Structure {
  id: string;
  raisonSociale: string;
  type: string;
  adresse?: string;
  codePostal?: string;
  ville?: string;
  pays?: string;
  siret?: string;
  tva?: string;
  // Relations avec Programmateurs (références)
  programmateursIds?: string[];
  // Autres propriétés
  telephone?: string;
  email?: string;
  siteWeb?: string;
  logo?: string;
  description?: string;
  dateCreation: Date | number | string;
  dateModification?: Date | number | string;
}
```

### Concert

```typescript
interface Concert {
  id: string;
  titre: string;
  date: Date | number | string;
  // Relations
  lieuId?: string;
  artistesIds: string[];
  programmateursIds?: string[];
  contratId?: string;
  // Cache des données liées fréquemment utilisées
  lieuCache?: {
    nom: string;
    adresse?: string;
    ville?: string;
  };
  artistesCache?: Array<{
    id: string;
    nom: string;
  }>;
  programmateursCache?: Array<{
    id: string;
    nom: string;
    prenom: string;
    structureCache?: {
      raisonSociale: string;
    };
  }>;
  // Autres propriétés
  statut: 'en_negociation' | 'confirme' | 'annule' | 'termine';
  cachet?: number;
  description?: string;
  heureArrivee?: string;
  heureBalances?: string;
  heureOuverture?: string;
  heurePassage?: string;
  notes?: string;
  dateCreation: Date | number | string;
  dateModification?: Date | number | string;
}
```

## Schémas de validation Yup

### Programmateur

```javascript
import * as Yup from 'yup';

export const ProgrammateurValidationSchema = Yup.object().shape({
  nom: Yup.string().required('Le nom est requis'),
  prenom: Yup.string().required('Le prénom est requis'),
  email: Yup.string().email('Email invalide').required('L\'email est requis'),
  telephone: Yup.string(),
  fonction: Yup.string(),
  structureId: Yup.string(),
  structureCache: Yup.object().shape({
    raisonSociale: Yup.string(),
    type: Yup.string(),
    // ... autres propriétés
  }),
  // ... autres validations
});
```

## Mise en œuvre dans les composants

### Accès aux données dans les formulaires

Pour les formulaires, toujours utiliser la même structure de données en mode édition et en mode visualisation :

```jsx
// Bon exemple - Mode édition
<Form.Control
  name="structureCache.raisonSociale"
  value={formData?.structureCache?.raisonSociale || ''}
  onChange={handleChange}
/>

// Bon exemple - Mode visualisation
<p>{formatValue(programmateur?.structureCache?.raisonSociale)}</p>
```

### Migration des composants existants

Pour les composants existants qui ne suivent pas cette convention, un plan de migration progressif sera mis en place :

1. D'abord, adapter les composants pour utiliser les mêmes chemins d'accès en mode édition et visualisation
2. Ensuite, refactoriser pour utiliser la nouvelle structure de données standardisée
3. Mettre à jour les services et hooks qui manipulent ces données

## Traitement des données dans les Hooks

Les hooks devraient gérer la transformation des données brutes de Firebase vers le format standardisé :

```javascript
// Exemple dans un hook
const useProgrammateur = (id) => {
  // ... logique pour récupérer les données

  // Transformation des données
  const transformProgrammateur = (rawData) => {
    return {
      id: rawData.id,
      nom: rawData.nom,
      // ... autres propriétés directes
      
      // Création du cache de structure standardisé à partir des données plates
      structureId: rawData.structureId,
      structureCache: {
        raisonSociale: rawData.structure || '',
        type: rawData.structureType || '',
        adresse: rawData.structureAdresse || '',
        // ... autres propriétés de structure
      }
    };
  };

  return {
    programmateur: data ? transformProgrammateur(data) : null,
    // ... autres retours
  };
};
```

## Gestion de la bidirectionalité

Pour maintenir l'intégrité référentielle dans les relations bidirectionnelles, toujours mettre à jour les deux côtés de la relation :

```javascript
// Exemple d'association programmateur-structure
const associateProgrammateurWithStructure = async (programmateur, structure) => {
  const batch = writeBatch(db);
  
  // Mettre à jour le programmateur avec l'ID de la structure
  const programmeurRef = doc(db, 'programmateurs', programmateur.id);
  batch.update(programmeurRef, { 
    structureId: structure.id,
    // Mettre à jour le cache en même temps
    structureCache: {
      raisonSociale: structure.raisonSociale,
      type: structure.type,
      ville: structure.ville
    }
  });
  
  // Mettre à jour la structure avec l'ID du programmateur
  const structureRef = doc(db, 'structures', structure.id);
  batch.update(structureRef, { 
    programmateursIds: arrayUnion(programmateur.id) 
  });
  
  await batch.commit();
};
```

---

*Ce document sera mis à jour au fur et à mesure que de nouvelles entités ou des cas particuliers sont identifiés.*