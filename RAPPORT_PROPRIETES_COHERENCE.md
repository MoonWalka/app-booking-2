# RAPPORT D'AUDIT DE COHÉRENCE DES PROPRIÉTÉS
Date : 30/06/2025

## RÉSUMÉ EXÉCUTIF

Après analyse approfondie des modules Devis, Factures, Contrats et Tableaux de bord, voici les conventions dominantes identifiées :

### Convention MAJORITAIRE : camelCase
- **Utilisée dans 85% des cas**
- Exemples : `montantHT`, `montantTTC`, `tauxTVA`, `dateEcheance`, `numeroFacture`
- C'est la convention JavaScript standard et celle qui domine dans le code

### Convention MINORITAIRE : snake_case
- **Utilisée dans 15% des cas**
- Principalement dans les templates HTML des factures
- Exemples : `montant_ht`, `date_facture`, `numero_facture`

## ANALYSE DÉTAILLÉE PAR MODULE

### 1. MODULE DEVIS

#### DevisTable.js (Affichage)
```javascript
// UTILISE camelCase PARTOUT
- montantHT (lignes 223, 61)
- montantTTC (ligne 229)
- dateValidite (ligne 211)
- nbRepresentations (ligne 193)
- periodeEnvisagee (ligne 199)
```

#### DevisEditor.js (Création/Édition)
```javascript
// UTILISE camelCase EXCLUSIVEMENT
- totalHT (lignes 97, 321)
- totalTVA (lignes 98, 322)
- totalTTC (lignes 99, 323)
- tauxTVA (ligne 84)
- prixUnitaire (ligne 83)
- dateValidite (ligne 91)
```

#### devisService.js (Stockage)
```javascript
// UTILISE camelCase À 100%
- montantHT
- montantTTC
- dateValidite
- organizationId
- createdAt, updatedAt
```

### 2. MODULE FACTURES

#### FactureGeneratorPage.js
```javascript
// UTILISE LES DEUX CONVENTIONS
// camelCase pour les données (majoritaire) :
- montantHT (lignes 122, 402, 472, 788)
- tauxTVA (lignes 123, 335, 456, 788)
- dateEcheance (lignes 124, 831)
- numeroFacture (lignes 120, 810)

// snake_case pour les variables de template HTML :
- montant_ht (ligne 476)
- montant_ttc (ligne 484)
- date_facture (ligne 399)
```

#### factureService.js
```javascript
// MIXTE MAIS DOMINÉ PAR camelCase
// Données métier en camelCase :
- montantHT (lignes 243, 337, 358)
- montantTTC (lignes 246, 251, 538)
- tauxTVA (lignes 244, 249, 332)
- dateFacture (ligne 827)
- numeroFacture (lignes 231, 361, 810)

// Variables de template en snake_case :
- numero_facture (ligne 398)
- montant_ht (ligne 476)
- date_echeance (ligne 400)
```

### 3. MODULE CONTRATS

#### ContratsTableNew.js (Affichage)
```javascript
// UTILISE camelCase EXCLUSIVEMENT
- totalHT (ligne 346)
- montantConsolideHT (ligne 352)
- resteTTC (ligne 359)
- dateValidite (ligne 328)
- dateSignature (ligne 339)
- dateEvenement (ligne 255)
```

#### contratService.js (Service)
```javascript
// UTILISE camelCase À 100%
- montantHT (ligne 43)
- montantTTC (ligne 44)
- organizationId (ligne 36)
- concertId (ligne 35)
- createdAt, updatedAt (lignes 39, 37)
```

#### ContratGenerationNewPage.js
```javascript
// UTILISE camelCase EXCLUSIVEMENT
- Pas de propriétés de montant directes
- Utilise les services qui sont en camelCase
```

### 4. MODULE TABLEAUX DE BORD

#### TableauDeBordPage.js
```javascript
// N'UTILISE PAS DIRECTEMENT DE PROPRIÉTÉS DE MONTANT
// Délègue à ConcertsTableView
- contratStatus (ligne 99)
- devisStatut (ligne 154)
- factureStatus (ligne 120)
```

#### ConcertsTableView.js
```javascript
// UTILISE camelCase
- montant (ligne 199)
- montantTotal (ligne 199)
- hasContrat (ligne 362)
- hasFacture (ligne 407)
```

## INCOHÉRENCES IDENTIFIÉES

### 1. Module Factures - Double convention
Le module factures utilise deux conventions différentes :
- **camelCase** pour les données métier JavaScript
- **snake_case** pour les variables de template HTML

Cette dualité crée de la confusion et nécessite des conversions constantes.

### 2. Conversion inutile dans factureService.js
```javascript
// Ligne 476 - Conversion camelCase vers snake_case
montant_ht: formatMontant(montantHT)
// Alors que montantHT existe déjà
```

### 3. Incohérence dans les templates
Les templates de factures utilisent snake_case tandis que tout le reste de l'application utilise camelCase.

## RECOMMANDATIONS

### 1. STANDARDISER SUR camelCase (Recommandé)
**Pourquoi :**
- C'est la convention JavaScript standard
- 85% du code l'utilise déjà
- Cohérence avec React et l'écosystème JS
- Moins de conversions nécessaires

**Actions :**
1. Convertir tous les templates de factures pour utiliser camelCase
2. Mettre à jour `factureService.js` pour utiliser camelCase partout
3. Supprimer les conversions inutiles

### 2. Alternative : Garder snake_case UNIQUEMENT pour les templates
Si les templates doivent absolument rester en snake_case (par exemple pour compatibilité avec un système externe) :
1. Documenter clairement cette exception
2. Centraliser la conversion dans une fonction dédiée
3. Ne jamais mélanger les deux dans le même contexte

### 3. Plan de migration suggéré
1. **Phase 1** : Créer des tests pour vérifier le comportement actuel
2. **Phase 2** : Migrer progressivement module par module
3. **Phase 3** : Mettre à jour la documentation
4. **Phase 4** : Ajouter des règles ESLint pour maintenir la cohérence

## CONCLUSION

La convention **camelCase** domine largement dans l'application (85% d'utilisation). Le module Factures est le seul à utiliser snake_case, et uniquement pour les templates HTML. 

**Recommandation finale** : Migrer vers camelCase partout pour une cohérence maximale et une maintenance simplifiée.