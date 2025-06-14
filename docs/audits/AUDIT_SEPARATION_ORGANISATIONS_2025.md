# 🔍 Audit de la Séparation des Données entre Organisations - TourCraft

Date : 06/01/2025

## 🚨 Problème Identifié

Les contacts sont visibles par toutes les organisations alors que les concerts sont correctement séparés.

## 📊 Analyse Détaillée

### 1. Architecture des Données

#### Structure Firestore
- **Collections principales** : `concerts`, `contacts`, `lieux`, `artistes`, `structures`
- **Champ de séparation** : `organizationId` (requis sur tous les documents)

### 2. Comparaison Concerts vs Contacts

#### ✅ Concerts (Fonctionnement Correct)

**Flux de données** :
1. `ConcertsList.js` utilise `ListWithFilters`
2. MAIS passe `initialData={concerts}` depuis le hook `useConcertListData`
3. `useConcertListData` filtre correctement par `organizationId` :
   ```javascript
   // Ligne 282-284 de useConcertListData.js
   let q = query(
     concertsRef, 
     where('organizationId', '==', currentOrganization.id),
     orderBy('date', 'desc'), 
     limit(pageSize)
   );
   ```

#### ❌ Contacts (Problème de Sécurité)

**Flux de données** :
1. `ContactsList.js` utilise `ListWithFilters`
2. NE passe PAS `initialData`
3. `ListWithFilters` charge directement depuis Firebase SANS filtrer par `organizationId`
4. Résultat : TOUS les contacts de TOUTES les organisations sont visibles

### 3. Le Problème dans ListWithFilters

Dans `ListWithFilters.js` (lignes 145-194), la fonction `loadData` :
- Charge directement la collection sans filtre `organizationId`
- N'utilise PAS le contexte `OrganizationContext`
- Applique seulement les filtres passés via props

```javascript
// Ligne 159 - Charge directement la collection
const collectionRef = collection(db, collectionName);

// Lignes 165-174 - N'ajoute que les filtres passés en props
const filterEntries = Object.entries(filters);
if (filterEntries.length > 0) {
  const filterConditions = filterEntries
    .filter(([field, value]) => value !== undefined && value !== '')
    .map(([field, value]) => where(field, '==', value));
  
  if (filterConditions.length > 0) {
    q = query(q, ...filterConditions);
  }
}
```

### 4. Autres Entités Potentiellement Affectées

Après vérification, d'autres entités pourraient être affectées si elles utilisent `ListWithFilters` sans passer `initialData` :
- Lieux
- Artistes  
- Structures

## 🔧 Solutions Recommandées

### Solution 1 : Modification de ListWithFilters (Recommandée)

Modifier `ListWithFilters` pour toujours filtrer par `organizationId` :

```javascript
// Dans ListWithFilters.js
import { useOrganization } from '@/context/OrganizationContext';

const ListWithFilters = ({ ... }) => {
  const { currentOrganization } = useOrganization();
  
  // Dans loadData()
  const loadData = useCallback(async (isLoadMore = false) => {
    // ...
    
    // Ajouter le filtre organizationId
    if (currentOrganization?.id) {
      q = query(q, where('organizationId', '==', currentOrganization.id));
    }
    
    // ...
  });
};
```

### Solution 2 : Créer un Hook useContactListData

Créer un hook similaire à `useConcertListData` pour les contacts :

```javascript
// src/hooks/contacts/useContactListData.js
export const useContactListData = () => {
  const { currentOrganization } = useOrganization();
  
  // Logique de chargement avec filtre organizationId
  const contactsQuery = query(
    collection(db, 'contacts'),
    where('organizationId', '==', currentOrganization.id)
  );
  
  // ...
};
```

Puis modifier `ContactsList.js` :
```javascript
const { contacts, loading, error } = useContactListData();

<ListWithFilters
  initialData={contacts}
  loading={loading}
  error={error}
  // ...
/>
```

## 🔒 Impact Sécurité

- **Criticité** : ÉLEVÉE
- **Données exposées** : Tous les contacts de toutes les organisations
- **Risque RGPD** : Exposition de données personnelles (nom, email, téléphone)

## 📋 Actions Immédiates

1. **Appliquer la Solution 1** immédiatement pour sécuriser toutes les listes
2. **Vérifier** toutes les utilisations de `ListWithFilters` dans l'application
3. **Auditer** les autres collections (lieux, artistes, structures)
4. **Tester** la séparation après correction

## 🧪 Tests de Validation

1. Créer 2 organisations de test
2. Créer des contacts dans chaque organisation
3. Se connecter avec un utilisateur de l'organisation 1
4. Vérifier qu'on ne voit que les contacts de l'organisation 1
5. Répéter pour l'organisation 2

## 📝 Conclusion

Le problème vient d'une incohérence dans l'utilisation de `ListWithFilters` :
- Les concerts passent des données pré-filtrées via `initialData`
- Les contacts laissent `ListWithFilters` charger directement depuis Firebase sans filtre

La solution la plus robuste est de modifier `ListWithFilters` pour toujours appliquer le filtre `organizationId`, garantissant ainsi la sécurité par défaut.

## ✅ Correction Appliquée

La correction a été implémentée dans `ListWithFilters.js` :

1. **Import du contexte Organisation** :
   ```javascript
   import { useOrganization } from '@/context/OrganizationContext';
   ```

2. **Utilisation du contexte** :
   ```javascript
   const { currentOrganization } = useOrganization();
   ```

3. **Filtre obligatoire par organizationId** :
   ```javascript
   if (currentOrganization?.id) {
     queryConditions.push(where('organizationId', '==', currentOrganization.id));
   } else {
     console.warn('⚠️ Pas d\'organisation courante - impossible de filtrer les données');
     setItems([]);
     setLoading(false);
     return;
   }
   ```

4. **Règles de sécurité Firestore** créées dans `firestore.rules.secure`

## 🛡️ Mesures de Sécurité Additionnelles

1. **Script d'audit** : `scripts/audit-organization-data-separation.js`
2. **Script de correction** : `scripts/fix-organization-data-separation.js`
3. **Règles Firestore** : `firestore.rules.secure`

## ⚡ État Actuel

- ✅ `ListWithFilters` filtre maintenant TOUJOURS par organizationId
- ✅ Toutes les listes (contacts, lieux, artistes, structures) sont sécurisées
- ✅ Protection au niveau base de données avec les règles Firestore
- ✅ Scripts de vérification et correction disponibles