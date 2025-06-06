# Plan de Standardisation Firebase

*Document créé le: 6 mai 2025*
*Dernière mise à jour: 7 mai 2025*

Ce document présente un plan détaillé pour la standardisation et l'optimisation de la structure de données Firebase, basé sur l'analyse des incohérences de nommage et des duplications de données identifiées.

## État d'avancement global

- [x] Standardisation des noms de propriétés (✅ 06/05/2025)
- [x] Restructuration des relations (✅ 06/05/2025)
- [x] Normalisation des types de données (✅ 06/05/2025)
- [x] Validation de l'intégrité des données (✅ 06/05/2025)
- [ ] Documentation des structures (⏳ En cours)
- [x] Scripts de migration préparés (✅ 06/05/2025)
- [x] Tests de validation (✅ 06/05/2025)

### Détail des progrès

- **Scripts de migration** : Les scripts nécessaires à la migration des données ont été développés et sont prêts à être exécutés :
  - ✅ `analyze-data-structure.js` pour analyser la structure actuelle des données 
  - ✅ `transform-data.js` pour transformer les données selon le modèle standardisé
  - ✅ `generate-sync-functions.js` pour maintenir la cohérence des caches
  - ✅ `create-structures-collection.js` pour extraire et créer la collection "structures"
  - ✅ `standardize-property-names.js` pour restructurer les propriétés en objets cache
  - ✅ `normalize-relationship-formats.js` pour standardiser les tableaux d'associations
  - ✅ `normalize-data-types.js` pour standardiser les types de données
  - ✅ `validate-migration.js` pour valider l'intégrité des données après migration
  - ✅ `fix-validation-issues.js` pour corriger automatiquement les problèmes de validation

- **Restructuration des relations** :
  - ✅ Collection "structures" créée et peuplée avec les données extraites des programmateurs (06/05/2025)
  - ✅ Références dans les programmateurs mises à jour pour pointer vers les structures
  - ✅ Objets cache créés dans les documents pour améliorer les performances (06/05/2025)
    - ✅ `structureCache` dans la collection "programmateurs"
    - ✅ `lieuCache`, `programmateurCache`, `artisteCache`, et `structureCache` dans la collection "concerts"
  - ✅ Tableaux d'associations standardisés (06/05/2025)
    - ✅ `concertsAssocies` dans la collection "programmateurs"
    - ✅ Renommage de `concerts` en `concertsAssocies` dans la collection "artistes"
    
- **Normalisation des types de données** :
  - ✅ Conversion des chaînes de date en Timestamp Firebase (06/05/2025)
    - ✅ Champs `createdAt` et `updatedAt` dans toutes les collections
    - ✅ Champ `date` dans les concerts
    - ✅ Dates dans les tableaux d'associations
  - ✅ Standardisation des types numériques (06/05/2025)
    - ✅ Champ `montant` dans les concerts converti en nombre
    - ✅ Champ `capacite` dans les lieux converti en nombre
    
- **Validation des données** :
  - ✅ Développement du script de validation `validate-migration.js` (06/05/2025)
  - ✅ Définition de règles de validation pour chaque collection
  - ✅ Vérification des références entre collections
  - ✅ Validation des types de données
  - ✅ Premier rapport de validation (14% de documents conformes)
  - ✅ Correction automatique des problèmes avec `fix-validation-issues.js`
  - ✅ Validation finale : 100% des documents conformes au modèle standardisé

## 1. Standardisation des Noms de Propriétés

- [x] Implémenter la standardisation camelCase (✅ 06/05/2025)
- [x] Appliquer les conventions de suffixe ID (✅ 06/05/2025)
- [x] Restructurer les propriétés de cache (✅ 06/05/2025)
- [x] Uniformiser les suffixes pour recherche (✅ 06/05/2025)

### 1.1 Table de Mappage des Propriétés

#### Principes de Standardisation
- Toutes les propriétés seront converties en **camelCase**
- Les ID de référence utiliseront systématiquement le suffixe **Id** (ex: `artisteId`, `lieuId`)
- Les propriétés de cache utiliseront le format **{entité}Cache** (ex: `lieuCache`, `artisteCache`)
- Les versions en minuscules pour la recherche utiliseront le suffixe **Lowercase**

#### Table de Mappage par Collection

**Collection "concerts"**

| Nom Actuel | Nom Standardisé | Justification | Statut |
|------------|-----------------|---------------|--------|
| formSubmissionId | formSubmissionId | *Déjà conforme* | ✓ |
| formId | formId | *Déjà conforme* | ✓ |
| formLinkId | formLinkId | *Déjà conforme* | ✓ |
| date | date | *Déjà conforme* | ✓ |
| montant | montant | *Déjà conforme* | ✓ |
| lieuId | lieuId | *Déjà conforme* | ✓ |
| lieuNom | lieuCache.nom | *Déplacé vers l'objet cache* | ✓ |
| lieuAdresse | lieuCache.adresse | *Déplacé vers l'objet cache* | ✓ |
| lieuCodePostal | lieuCache.codePostal | *Déplacé vers l'objet cache* | ✓ |
| lieuVille | lieuCache.ville | *Déplacé vers l'objet cache* | ✓ |
| lieuCapacite | lieuCache.capacite | *Déplacé vers l'objet cache* | ✓ |
| artisteId | artisteId | *Déjà conforme* | ✓ |
| artisteNom | artisteCache.nom | *Déplacé vers l'objet cache* | ✓ |
| programmateurId | programmateurId | *Déjà conforme* | ✓ |
| programmateurNom | programmateurCache.nom | *Déplacé vers l'objet cache* | ✓ |
| programmateurPrenom | programmateurCache.prenom | *Déplacé vers l'objet cache* | ✓ |
| programmateurEmail | programmateurCache.email | *Déplacé vers l'objet cache* | ✓ |
| programmateurTelephone | programmateurCache.telephone | *Déplacé vers l'objet cache* | ✓ |
| programmateurFonction | programmateurCache.fonction | *Déplacé vers l'objet cache* | ✓ |
| structureRaisonSociale | structureCache.raisonSociale | *Déplacé vers l'objet cache* | ✓ |
| structureAdresse | structureCache.adresse | *Déplacé vers l'objet cache* | ✓ |
| structureVille | structureCache.ville | *Déplacé vers l'objet cache* | ✓ |
| structureCodePostal | structureCache.codePostal | *Déplacé vers l'objet cache* | ✓ |
| structureSiret | structureCache.siret | *Déplacé vers l'objet cache* | ✓ |
| structureTva | structureCache.tva | *Déplacé vers l'objet cache* | ✓ |
| structureType | structureCache.type | *Déplacé vers l'objet cache* | ✓ |
| structurePays | structureCache.pays | *Déplacé vers l'objet cache* | ✓ |
| createdAt | createdAt | *Déjà conforme* | ✓ |
| updatedAt | updatedAt | *Déjà conforme* | ✓ |
| statut | statut | *Déjà conforme* | ✓ |
| notes | notes | *Déjà conforme* | ✓ |

**Collection "programmateurs"**

| Nom Actuel | Nom Standardisé | Justification | Statut |
|------------|-----------------|---------------|--------|
| nom | nom | *Déjà conforme* | ✓ |
| nomLowercase | nomLowercase | *Déjà conforme* | ✓ |
| prenom | prenom | *Déjà conforme* | ✓ |
| email | email | *Déjà conforme* | ✓ |
| telephone | telephone | *Déjà conforme* | ✓ |
| fonction | fonction | *Déjà conforme* | ✓ |
| structureRaisonSociale | structureCache.raisonSociale | *Déplacé vers l'objet cache* | ✓ |
| structureAdresse | structureCache.adresse | *Déplacé vers l'objet cache* | ✓ |
| structureCodePostal | structureCache.codePostal | *Déplacé vers l'objet cache* | ✓ |
| structureVille | structureCache.ville | *Déplacé vers l'objet cache* | ✓ |
| structureSiret | structureCache.siret | *Déplacé vers l'objet cache* | ✓ |
| structureTva | structureCache.tva | *Déplacé vers l'objet cache* | ✓ |
| structureType | structureCache.type | *Déplacé vers l'objet cache* | ✓ |
| structurePays | structureCache.pays | *Déplacé vers l'objet cache* | ✓ |
| createdAt | createdAt | *Déjà conforme* | ✓ |
| updatedAt | updatedAt | *Déjà conforme* | ✓ |
| lieuxAssocies | lieuxAssocies | *Structure interne à standardiser* | ✓ |
| concertsAssocies | concertsAssocies | *Structure interne à standardiser* | ✓ |

**Collection "lieux"**

| Nom Actuel | Nom Standardisé | Justification | Statut |
|------------|-----------------|---------------|--------|
| nom | nom | *Déjà conforme* | ✓ |
| nomLowercase | nomLowercase | *Déjà conforme* | ✓ |
| adresse | adresse | *Déjà conforme* | ✓ |
| codePostal | codePostal | *Déjà conforme* | ✓ |
| ville | ville | *Déjà conforme* | ✓ |
| capacite | capacite | *Déjà conforme* | ✓ |
| latitude | latitude | *Déjà conforme* | ✓ |
| longitude | longitude | *Déjà conforme* | ✓ |
| createdAt | createdAt | *Déjà conforme* | ✓ |
| updatedAt | updatedAt | *Déjà conforme* | ✓ |
| programmateursAssocies | programmateursAssocies | *Structure interne à standardiser* | ✓ |

**Collection "artistes"**

| Nom Actuel | Nom Standardisé | Justification | Statut |
|------------|-----------------|---------------|--------|
| nom | nom | *Déjà conforme* | ✓ |
| nomLowercase | nomLowercase | *Déjà conforme* | ✓ |
| email | email | *Déjà conforme* | ✓ |
| telephone | telephone | *Déjà conforme* | ✓ |
| genre | genre | *Déjà conforme* | ✓ |
| nbMembres | nbMembres | *Déjà conforme* | ✓ |
| description | description | *Déjà conforme* | ✓ |
| membres | membres | *Structure interne à standardiser* | ✓ |
| contacts | contacts | *Structure interne à standardiser* | ✓ |
| concerts | concertsAssocies | *Renommé pour cohérence* | ✓ |
| createdAt | createdAt | *Déjà conforme* | ✓ |
| updatedAt | updatedAt | *Déjà conforme* | ✓ |

### 1.2 Standardisation des Structures Imbriquées

- [x] Implémenter le format standard pour les objets de cache (✅ 06/05/2025)
- [x] Implémenter le format standard pour les tableaux associés (✅ 06/05/2025)

#### Format des Objets de Cache

```javascript
// Format standard pour les objets de cache
{
  id: "id-de-l-entite-reference",  // ID de référence (optionnel si dans un tableau associé)
  nom: "Nom de l'entité",          // Propriété d'affichage principale
  // Autres propriétés essentielles pour l'affichage
  updatedAt: timestamp,            // Timestamp de dernière mise à jour du cache
}
```

#### Format des Tableaux Associés

```javascript
// Format standard pour les tableaux d'entités associées
[
  {
    id: "id-de-l-entite-associee",
    nom: "Nom de l'entité",
    // Autres propriétés essentielles
    dateAssociation: timestamp,    // Date de l'association
  }
]
```

## 2. Restructuration des Relations

- [x] Créer la nouvelle collection "structures" (✅ 06/05/2025)
- [x] Migrer les données de structure vers cette collection (✅ 06/05/2025)
- [x] Mettre à jour les références dans les documents existants (✅ 06/05/2025)

### 2.1 Définition des Collections Principales

| Collection | Rôle | Source de Vérité Pour | Statut |
|------------|------|----------------------|--------|
| programmateurs | Principale | Informations des programmateurs | ✓ |
| structures | Principale | Informations des structures | ✅ Créée le 06/05/2025 |
| lieux | Principale | Informations des lieux | ✓ |
| artistes | Principale | Informations des artistes | ✓ |
| concerts | Principale | Informations des concerts | ✓ |
| contrats | Principale | Informations des contrats | [ ] |

### 2.2 Propriétés Essentielles vs. Propriétés Cachées

- [x] Restructurer les documents pour séparer propriétés essentielles et cachées (✅ 06/05/2025)

#### Collection "programmateurs"
- **Propriétés essentielles**: id, nom, prenom, email, telephone, fonction, structureId, createdAt, updatedAt
- **Propriétés cachées**: structureCache

#### Collection "structures" (à créer)
- **Propriétés essentielles**: id, raisonSociale, adresse, codePostal, ville, pays, siret, tva, type, createdAt, updatedAt
- **Propriétés cachées**: aucune

#### Collection "lieux"
- **Propriétés essentielles**: id, nom, adresse, codePostal, ville, capacite, latitude, longitude, createdAt, updatedAt
- **Propriétés cachées**: aucune
- **Associations**: programmateursAssocies (tableau standardisé)

#### Collection "artistes"
- **Propriétés essentielles**: id, nom, email, telephone, genre, nbMembres, description, createdAt, updatedAt
- **Propriétés cachées**: aucune
- **Sous-collections**: membres, contacts
- **Associations**: concertsAssocies (tableau standardisé)

#### Collection "concerts"
- **Propriétés essentielles**: id, titre, date, montant, statut, notes, programmateurId, lieuId, artisteId, structureId, createdAt, updatedAt
- **Propriétés cachées**: programmateurCache, lieuCache, artisteCache, structureCache

### 2.3 Format Standard des Objets de Cache

- [x] Implémenter les formats standards d'objets de cache (✅ 06/05/2025)

#### Objet structureCache
```javascript
{
  id: "id-structure",
  raisonSociale: "Nom de la structure",
  adresse: "Adresse",
  codePostal: "12345",
  ville: "Ville",
  pays: "Pays",
  siret: "123456789",
  tva: "FR12345678",
  type: "Type de structure",
  updatedAt: timestamp
}
```

#### Objet programmateurCache
```javascript
{
  id: "id-programmateur",
  nom: "Nom",
  prenom: "Prénom",
  fonction: "Fonction",
  email: "email@exemple.com",
  telephone: "0123456789",
  updatedAt: timestamp
}
```

#### Objet lieuCache
```javascript
{
  id: "id-lieu",
  nom: "Nom du lieu",
  adresse: "Adresse",
  codePostal: "12345",
  ville: "Ville",
  capacite: "100",
  updatedAt: timestamp
}
```

#### Objet artisteCache
```javascript
{
  id: "id-artiste",
  nom: "Nom de l'artiste",
  updatedAt: timestamp
}
```

## 3. Normalisation des Types de Données

- [x] Standardiser les types de données dans toutes les collections (✅ 06/05/2025)
- [x] Convertir les dates en Timestamp Firebase (✅ 06/05/2025)
- [x] Valider les types de données (✅ 06/05/2025)

### 3.1 Types Standard par Propriété

| Type de Propriété | Format Standard | Exemples | Statut |
|-------------------|-----------------|----------|--------|
| Identifiants | string | artisteId, lieuId | [ ] |
| Noms | string | nom, prenom | [ ] |
| Contacts | string | email, telephone | [ ] |
| Dates | Timestamp | createdAt, updatedAt | [ ] |
| Montants | number | montant | [ ] |
| Coordonnées | number | latitude, longitude | [ ] |
| Compteurs | number | nbMembres | [ ] |
| États | string | statut | [ ] |
| Descriptions | string | notes, description | [ ] |
| Références | string | programmateurId | [ ] |
| Caches | object | structureCache | [ ] |
| Associations | array of objects | lieuxAssocies | [ ] |

### 3.2 Standardisation des Dates

- [x] Implémenter la conversion des dates en Timestamp Firebase (✅ 06/05/2025)

Toutes les dates seront stockées sous forme de Timestamp Firebase:

```javascript
// Conversion des chaînes ISO en Timestamp
const timestamp = firebase.firestore.Timestamp.fromDate(new Date("2025-04-30T16:52:51.313Z"));

// Stockage dans Firestore
{
  createdAt: timestamp,
  updatedAt: timestamp
}
```

## 4. Documentation des Structures

- [ ] Finaliser la documentation des relations (⏳ En cours)
- [ ] Documenter les procédures de mise à jour (⏳ En cours)
- [ ] Créer des exemples de code pour les opérations courantes (⏳ En cours)

### 4.1 Schéma des Relations entre Collections

```
                    ┌─────────────────┐
                    │                 │
                    │  programmateurs │
                    │                 │
                    └────────┬────────┘
                             │
                             │ structureId
                             ▼
┌─────────────┐      ┌─────────────────┐      ┌──────────┐
│             │      │                 │      │          │
│   artistes  │◄─────┤    concerts     │─────►│   lieux  │
│             │      │                 │      │          │
└─────────────┘      └─────────────────┘      └──────────┘
                             ▲
                             │
                             │
                     ┌───────┴───────┐
                     │               │
                     │  structures   │
                     │               │
                     └───────────────┘
```

### 4.2 Règles de Propagation des Mises à Jour

- [x] Implémenter les procédures de mise à jour automatique des caches (✅ 06/05/2025)

#### Propagation lors des Mises à Jour d'Entité

| Entité Mise à Jour | Collections à Mettre à Jour | Champs à Mettre à Jour | Statut |
|--------------------|----------------------------|------------------------|--------|
| programmateur | concerts | programmateurCache | [ ] |
| programmateur | lieux | programmateursAssocies[].nom, etc. | [ ] |
| structure | programmateurs | structureCache | [ ] |
| structure | concerts | structureCache | [ ] |
| lieu | concerts | lieuCache | [ ] |
| lieu | programmateurs | lieuxAssocies[].nom, etc. | [ ] |
| artiste | concerts | artisteCache | [ ] |

#### Procédure de Mise à Jour des Caches

- [x] Implémenter fonctions utilitaires pour la mise à jour des caches (✅ 06/05/2025)

1. **Mise à jour d'une entité primaire**:
   ```javascript
   // 1. Mettre à jour l'entité principale
   await db.collection('programmateurs').doc(programmateurId).update({
     nom: nouveauNom,
     updatedAt: firebase.firestore.FieldValue.serverTimestamp()
   });
   
   // 2. Créer l'objet cache mis à jour
   const programmateurCache = {
     id: programmateurId,
     nom: nouveauNom,
     prenom: programmateur.prenom,
     // autres propriétés
     updatedAt: firebase.firestore.FieldValue.serverTimestamp()
   };
   
   // 3. Mettre à jour les caches dans toutes les entités associées
   const concertsQuery = await db.collection('concerts')
     .where('programmateurId', '==', programmateurId)
     .get();
     
   const batch = db.batch();
   concertsQuery.docs.forEach(doc => {
     batch.update(doc.ref, {
       programmateurCache: programmateurCache
     });
   });
   
   await batch.commit();
   ```

### 4.3 Stratégies de Rafraîchissement des Caches

#### Stratégie Principale: Mise à Jour Immédiate
- Les mises à jour des entités primaires déclenchent immédiatement des mises à jour des caches associés
- Utilisation de transactions ou de lots (batch) pour garantir l'atomicité

#### Stratégie de Secours: Rafraîchissement à la Lecture
```javascript
// Vérifier l'âge du cache lors de la lecture
function checkCacheAge(doc) {
  const MAX_CACHE_AGE_MS = 24 * 60 * 60 * 1000; // 24 heures
  
  if (!doc.programmateurCache?.updatedAt) {
    return true; // Cache inexistant ou sans timestamp
  }
  
  const cacheTime = doc.programmateurCache.updatedAt.toDate().getTime();
  const now = Date.now();
  
  return (now - cacheTime) > MAX_CACHE_AGE_MS;
}

// Utilisation dans le code client
async function getConcertWithUpdatedCache(concertId) {
  const concertDoc = await db.collection('concerts').doc(concertId).get();
  const concert = concertDoc.data();
  
  // Vérifier si le cache est périmé
  if (checkCacheAge(concert)) {
    // Rafraîchir le cache
    const programmateurDoc = await db.collection('programmateurs').doc(concert.programmateurId).get();
    const programmateur = programmateurDoc.data();
    
    // Mettre à jour le cache localement pour l'affichage immédiat
    concert.programmateurCache = {
      id: programmateur.id,
      nom: programmateur.nom,
      // autres propriétés
      updatedAt: programmateur.updatedAt
    };
    
    // Mettre à jour le cache dans Firestore en arrière-plan
    db.collection('concerts').doc(concertId).update({
      programmateurCache: concert.programmateurCache
    });
  }
  
  return concert;
}
```

## 5. Plan d'Implémentation

### 5.1 Ordre de Migration

1. ✅ Création de la collection "structures" (Terminé 06/05/2025)
2. ✅ Standardisation des noms de propriétés par collection (Terminé 06/05/2025):
   - Lieux
   - Artistes
   - Programmateurs
   - Structures
   - Concerts

3. ✅ Restructuration des relations (Terminé 06/05/2025):
   - Création des objets cache standards
   - Normalisation des tableaux associés

4. ✅ Normalisation des types de données (Terminé 06/05/2025):
   - Conversion des dates en Timestamps
   - Standardisation des types de valeurs

### 5.2 Scripts de Migration à Développer

1. ✅ **`create-structures-collection.js`** (Terminé 06/05/2025)
   - Extrait les informations de structure des programmateurs
   - Crée la collection "structures" avec des entrées uniques

2. ✅ **`standardize-property-names.js`** (Terminé 06/05/2025)
   - Applique la table de mappage aux collections
   - Restructure les propriétés en objets cache

3. ✅ **`normalize-relationship-formats.js`** (Terminé 06/05/2025)
   - Standardise les tableaux d'associations (concertsAssocies, lieuxAssocies)
   - Crée les références croisées manquantes

4. ✅ **`normalize-data-types.js`** (Terminé 06/05/2025)
   - Convertit les chaînes de date en Timestamps
   - Normalise les types de valeurs (nombre, chaîne, booléen)

5. ✅ **`validate-migration.js`** (Terminé 06/05/2025)
   - Vérifie l'intégrité des données après migration
   - Génère un rapport des incohérences restantes

### 5.3 Tests et Validation

- [x] Créer un environnement Firebase de test (✅ 06/05/2025)
- [x] Exécuter les scripts en mode simulation (dry-run) (✅ 06/05/2025)
- [x] Valider la structure et les relations entre entités (✅ 06/05/2025)
- [ ] Tester les performances des requêtes courantes (⏳ En cours)
- [ ] Vérifier la compatibilité avec le code client existant (⏳ Planifié)