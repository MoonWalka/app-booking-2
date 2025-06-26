# Résumé des modifications - Nomenclature Structure/Organisateur

## Problème identifié
Les concerts utilisent deux nomenclatures différentes :
- Anciens concerts : `organisateurId` / `organisateurNom`
- Nouveaux concerts : `structureId` / `structureNom`

Cela causait des problèmes :
1. Les dates n'apparaissaient pas dans l'onglet dates des contacts
2. Les pré-contrats ne trouvaient pas les données de structure

## Solutions appliquées

### 1. Service de recherche étendu (concertService.js)
- `getConcertsByStructureId()` cherche maintenant par `structureId` ET `organisateurId`
- `getConcertsByStructure()` cherche par `structureNom` ET `organisateurNom`

### 2. Formulaire de création unifié (DateCreationPage.js)
- Utilise maintenant `structure` comme terme principal dans l'interface
- Sauvegarde les deux ensembles de champs pour compatibilité :
  ```javascript
  structureId: formData.structureId,
  structureNom: formData.structureNom,
  organisateurId: formData.structureId, // Compatibilité
  organisateurNom: formData.structureNom, // Compatibilité
  ```

## Résultat
- ✅ Les nouvelles dates apparaissent dans l'onglet dates
- ✅ Les pré-contrats trouvent les données de structure
- ✅ Compatibilité maintenue avec l'ancien code

## Recommandations futures
1. Migration progressive des anciens concerts pour unifier sur `structureId`
2. Ou continuer avec la double sauvegarde pour compatibilité totale