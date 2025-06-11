# Solution pour la recherche d'artistes avec fallback

## Problème

La recherche d'artistes dans le formulaire de concert ne trouve pas les artistes existants car ils n'ont pas d'`organizationId`, ce qui crée des doublons.

## Solution implémentée

### 1. Composant ArtisteSearchSectionWithFallback

J'ai créé un nouveau composant qui :

1. **Cherche d'abord avec le filtre organizationId** (comportement normal)
2. **Si aucun résultat**, cherche dans TOUS les artistes
3. **Affiche un avertissement** si des artistes sont trouvés dans d'autres organisations
4. **Propose d'associer l'artiste** à votre organisation lors de la sélection

### 2. Fonctionnalités

- **Recherche en deux temps** : D'abord filtrée, puis globale
- **Association automatique** : Propose d'ajouter l'organizationId lors de la sélection
- **Indicateurs visuels** : Avertissements clairs sur l'état des artistes
- **Prévention des doublons** : Permet de sélectionner les artistes existants

### 3. Utilisation

Le composant remplace temporairement `ArtisteSearchSection` dans `ConcertForm`.

Quand vous tapez un nom d'artiste :
1. Si trouvé dans votre organisation → Sélection normale
2. Si trouvé ailleurs → Message d'avertissement avec option "Afficher quand même"
3. Lors de la sélection → Proposition d'associer à votre organisation

### 4. Code

```javascript
// Dans ConcertForm.js
import ArtisteSearchSectionWithFallback from '../sections/ArtisteSearchSectionWithFallback';

// Utilisation
<ArtisteSearchSectionWithFallback 
  formData={formData}
  updateFormData={updateFormData}
  displayMode="form"
/>
```

## Solution permanente

Pour une solution permanente, il faut :

1. **Corriger les données existantes** via l'outil de debug
2. **S'assurer que tous les artistes ont un organizationId**
3. **Revenir à ArtisteSearchSection** une fois les données corrigées

## Avantages de cette approche

- ✅ Permet de trouver TOUS les artistes existants
- ✅ Évite la création de doublons
- ✅ Corrige les données au fur et à mesure
- ✅ Maintient la sécurité multi-organisation
- ✅ Interface claire et intuitive