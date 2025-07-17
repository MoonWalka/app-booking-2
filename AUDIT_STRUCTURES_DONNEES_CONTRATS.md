# Audit des Structures de Données - Contrats et Tableaux

Date: 2025-07-17

## Vue d'ensemble

Cet audit analyse les incohérences dans la structure des données entre les différents tableaux de l'application TourCraft, en particulier concernant l'affichage du type de contrat et du collaborateur.

## 1. Collections Firebase et Structure des Données

### 1.1 Collection `dates`

```javascript
{
  id: "xxx",
  titre: "Concert XYZ",
  typeContrat: "Cession",  // Type stocké directement sur le date
  artisteId: "xxx",
  lieuId: "xxx",
  // ... autres champs
}
```

### 1.2 Collection `contrats`

#### Structure ancienne (contrats existants)
```javascript
{
  id: "xxx",
  dateId: "xxx",
  negociation: {
    contratType: "cession",  // Type stocké dans negociation
    montantNet: 1500,
    // ... autres champs
  },
  // Pas de champ 'type' au niveau racine
  // Pas de champ 'collaborateurCode'
}
```

#### Structure nouvelle (après modifications)
```javascript
{
  id: "xxx",
  dateId: "xxx",
  type: "cession",  // Nouveau champ ajouté
  collaborateurCode: "JD",  // Nouveau champ ajouté
  templateSnapshot: {
    type: "cession",  // Type aussi stocké dans le snapshot
    // ... autres champs
  },
  negociation: {
    // ... données de négociation
  }
}
```

## 2. Analyse des Tableaux

### 2.1 DatesTableView (Tableau de bord)

**Fichier**: `src/components/dates/DatesTableView.js`

**Données affichées**: Collection `dates`

**Récupération du type**:
```javascript
// Ligne 261
const typeContrat = item.typeContrat || item.contratType || 'Non défini';
```
- Cherche sur l'objet **date**
- Trouve `date.typeContrat` → Affiche "Cession" ✓

**Collaborateur**: Pas de colonne collaborateur dans ce tableau

### 2.2 ContratsTableNew (Page Contrats)

**Fichier**: `src/components/contrats/sections/ContratsTableNew.js`

**Données affichées**: Collection `contrats`

**Récupération du type**:
```javascript
// ContratsPage.js ligne 154
type: contratData.type || contratData.contratType || 'Standard'
```
- Cherche sur l'objet **contrat**
- NE cherche PAS dans `negociation.contratType`
- Ne trouve rien → Affiche "Standard" ✗

**Récupération du collaborateur**:
```javascript
// ContratsPage.js ligne 153
collaborateurCode: contratData.collaborateurCode || '--'
```
- Cherche `collaborateurCode` sur le contrat
- N'existe pas sur les anciens contrats → Affiche "--" ✗

### 2.3 ContactDatesTable

**Fichier**: `src/components/contacts/ContactDatesTable.js`

- Utilise `DatesTableView` en interne
- Même comportement que le tableau de bord

## 3. Problèmes Identifiés

### 3.1 Incohérence du stockage du type

Le type de contrat est stocké à **3 endroits différents**:
1. `date.typeContrat` (collection dates)
2. `contrat.negociation.contratType` (anciens contrats)
3. `contrat.type` (nouveaux contrats après modification)

### 3.2 Recherche incomplète dans ContratsPage

ContratsPage ne cherche pas au bon endroit pour les contrats existants:
- ✗ Ne cherche pas dans `contrat.negociation.contratType`
- ✓ Cherche dans `contrat.type` (mais n'existe que sur les nouveaux)

### 3.3 Absence du collaborateur

Le champ `collaborateurCode`:
- N'existe pas sur les contrats existants
- Est ajouté uniquement lors de la création/mise à jour
- Nécessite une migration pour les données existantes

## 4. Flux de Données

### 4.1 Création d'un date
```
DateCreationPage → Firebase (dates) 
  └─> typeContrat: "Cession" (défini lors de la création)
```

### 4.2 Génération d'un contrat
```
useContratGenerator → Firebase (contrats)
  └─> type: selectedTemplate.templateType
  └─> negociation.contratType: (depuis DateDetailsPage)
```

### 4.3 Affichage dans les tableaux
```
Tableau de bord:
  dates (Firebase) → DatesTableView
    └─> Lit date.typeContrat ✓

Page Contrats:
  contrats (Firebase) → ContratsPage → ContratsTableNew
    └─> Lit contrat.type ✗ (n'existe pas sur anciens)
    └─> Ne lit PAS contrat.negociation.contratType ✗
```

## 5. Impact des Modifications Récentes

### 5.1 Modifications dans contratService.js
- Ajoute `type` lors de la sauvegarde
- Ajoute `collaborateurCode` depuis collaborationConfig ou users
- **Impact**: Fonctionne uniquement pour les NOUVEAUX contrats

### 5.2 Modifications dans useContratGenerator.js
- Ajoute `type: selectedTemplate.templateType`
- **Impact**: Fonctionne lors de la génération/régénération

### 5.3 Modifications dans ContratsTableNew.js
- Amélioration de `getTypeBadge` pour gérer les minuscules
- **Impact**: Améliore l'affichage mais ne résout pas le problème de données

## 6. Résumé Exécutif

**Pourquoi "Cession" apparaît dans le tableau de bord mais "Standard" dans la page contrats:**

1. Le tableau de bord affiche les **dates** qui ont `typeContrat = "Cession"`
2. La page contrats affiche les **contrats** qui n'ont pas de champ `type` (anciens contrats)
3. Les modifications récentes ne sont pas rétroactives

**Solutions possibles:**
1. Migration des données existantes
2. Modifier ContratsPage pour chercher aussi dans `negociation.contratType`
3. Synchroniser le type entre dates et contrats

## 7. Recommandations

1. **Court terme**: Modifier ContratsPage.js pour chercher dans `negociation.contratType`
2. **Moyen terme**: Script de migration pour ajouter `type` et `collaborateurCode` aux contrats existants
3. **Long terme**: Normaliser la structure de données pour éviter les duplications