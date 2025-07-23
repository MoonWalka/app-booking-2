# Analyse du Flux des Montants dans les Contrats
**Date : 22 juillet 2025**

## 1. SOURCES DES MONTANTS

### 1.1 Origine des données
Le montant affiché dans le contrat peut provenir de plusieurs sources, dans cet ordre de priorité :

1. **`contratData.negociation.montantNet`** (Source principale)
   - Défini dans ContratGeneratorNew.js lors de la création du contrat
   - Initialisé depuis : `date?.montant` ou données du pré-contrat

2. **`contratData.negociation.montantHT`** (Alternative)
   - Même source que montantNet

3. **`contratData.montantHT`** (Fallback)
   - Directement sur l'objet contrat

4. **`contratData.montant`** (Fallback)
   - Directement sur l'objet contrat

5. **`date.montant`** (Dernière option)
   - Montant provenant de la date associée

### 1.2 Flux de données complet

```
Date (collection Firebase)
    ↓
    montant: 1000 (stocké dans la date)
    ↓
ContratGeneratorNew.js (ligne 329-330)
    ↓
    negociation: {
        montantNet: date?.montant || 0,
        montantBrut: date?.montant || 0,
        tauxTva: 20
    }
    ↓
Sauvegarde dans Firebase (collection contrats)
    ↓
ContratRedactionPage.js charge le contrat
    ↓
contractVariablesUnified.js (prepareContractData)
    ↓
    Calcul : montantHT = contratData.negociation.montantNet
    Calcul : montantTTC = montantHT + (montantHT * tauxTVA / 100)
    ↓
Remplacement des variables dans le template
```

## 2. CALCUL DES MONTANTS

### 2.1 Dans contractVariablesUnified.js (lignes 285-295)
```javascript
// Recherche du montant HT dans plusieurs endroits
const montantHT = parseFloat(contratData?.negociation?.montantNet) || 
                  parseFloat(contratData?.negociation?.montantHT) ||
                  parseFloat(contratData?.montantHT) ||
                  parseFloat(contratData?.montant) ||
                  parseFloat(date?.montant) || 0;

// TVA par défaut à 20% si non spécifiée
const tauxTVA = parseFloat(contratData?.negociation?.tauxTva) || 
                parseFloat(contratData?.tauxTVA) || 20;

// Calculs
const montantTVA = montantHT * (tauxTVA / 100);
const montantTTC = montantHT + montantTVA;
```

### 2.2 Variables créées pour le template (lignes 348-352)
```javascript
montant_ht: montantHT.toFixed(2).replace('.', ',') + ' €',
montant_ttc: montantTTC.toFixed(2).replace('.', ',') + ' €',
montant_lettres: montantEnLettres(montantTTC),
total_ttc: montantTTC.toFixed(2).replace('.', ',') + ' €',
total_ttc_lettres: montantEnLettres(montantTTC),
```

## 3. REMPLACEMENT DANS LE TEMPLATE

### 3.1 Dans ContratRedactionPage.js (lignes 937-972)

Le système cherche les montants dans cet ordre :

1. **`dataForReplacement.reglement.totalTTC`** (ligne 940)
   - Si existe dans l'objet règlement

2. **`dataForReplacement.prestations`** (lignes 942-945)
   - Calcule la somme de tous les montantTTC des prestations

3. **`contratData.negociation.montantTTC`** (lignes 946-949)
   - Utilise le montant de la négociation

4. **`contratData.montantTTC`** (lignes 950-953)
   - Montant direct du contrat

5. **`contratData.date.montant`** (lignes 954-958)
   - Montant de la date associée

### 3.2 Variables remplacées dans le template
```javascript
// Remplacements effectués (lignes 961-972)
{total_ttc} → "1 200,00 €"
{total_ttc_lettres} → "mille deux cents euros"
{date_montant} → "1 200,00 €"
{date_montant_lettres} → "mille deux cents euros"
[montant_ttc] → "1 200,00 €"
[total_ttc] → "1 200,00 €"
[total_ttc_lettres] → "mille deux cents euros"
```

## 4. FONCTION DE CONVERSION EN LETTRES

### 4.1 Implémentation (montantEnLettres)
- Définie dans : contractVariablesUnified.js (lignes 236-266)
- Dupliquée dans : simpleDataMapper.js (lignes 240-271)
- Également dans : ContratRedactionPage.js (lignes 1027-1100)

### 4.2 Logique de conversion
```javascript
// Gère les montants de 0 à 9999 euros
// Au-delà, retourne le format numérique
// Exemples :
// 0 → "zéro euro"
// 1 → "un euro"
// 150 → "cent cinquante euros"
// 1200 → "mille deux cents euros"
```

## 5. PROBLÈMES IDENTIFIÉS

### 5.1 Sources multiples de montants
- Le montant peut venir de 5 endroits différents
- Risque d'incohérence si les données ne sont pas synchronisées

### 5.2 Duplication de code
- La fonction `montantEnLettres` est dupliquée dans 3 fichiers
- Risque de divergence des implémentations

### 5.3 Calculs multiples
- Les montants TTC sont recalculés à plusieurs endroits
- Dans ContratGeneratorNew.js (useEffect lignes 480-497)
- Dans contractVariablesUnified.js (prepareContractData)
- Dans ContratRedactionPage.js (replaceVariables)

### 5.4 Noms de variables incohérents
- `montant_ttc` vs `total_ttc` (utilisés de manière interchangeable)
- `montantNet` vs `montantHT` (conceptuellement identiques)

## 6. RECOMMANDATIONS

1. **Centraliser la source du montant**
   - Toujours utiliser `contratData.negociation` comme source unique
   - Supprimer les fallbacks multiples

2. **Unifier les fonctions utilitaires**
   - Créer un module unique pour `montantEnLettres`
   - Importer depuis ce module partout

3. **Standardiser les noms de variables**
   - Choisir entre `montant_ttc` et `total_ttc`
   - Documenter le choix dans un guide de style

4. **Éviter les recalculs**
   - Calculer une seule fois lors de la sauvegarde
   - Stocker les montants calculés dans Firebase