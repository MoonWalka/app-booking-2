# Rapport des incohérences de noms de variables entre les composants PreContrat

## Vue d'ensemble
Ce rapport détaille toutes les incohérences trouvées dans les noms de variables entre :
- PreContratGenerator.js
- PreContratFormPublic.js
- PreContratFormContainer.js

## 1. Incohérences principales identifiées

### 1.1 Champs de l'organisateur/structure

| PreContratGenerator | PreContratFormPublic | PreContratFormContainer (mapping) | Notes |
|-------------------|---------------------|----------------------------------|-------|
| `cp` | `codePostalOrga` | `cp: formData.codePostalOrga` | ⚠️ Incohérence |
| `tel` | `telOrga` | `tel: formData.telOrga` | ⚠️ Incohérence |
| `site` | `siteWebOrga` | `site: formData.siteWebOrga` | ⚠️ Incohérence |
| `codeActivite` | `codeAPE` | `codeActivite: formData.codeAPE` | ⚠️ Incohérence |
| `numeroTvaIntracommunautaire` | `tvaIntracom` | `numeroTvaIntracommunautaire: formData.tvaIntracom` | ⚠️ Incohérence |
| `numeroLicence` | `licences` | `numeroLicence: formData.licences` | ⚠️ Incohérence |
| `nomSignataire` | `signataire` | `nomSignataire: formData.signataire` | ⚠️ Incohérence |

### 1.2 Champs de négociation

| PreContratGenerator | PreContratFormPublic | PreContratFormContainer (mapping) | Notes |
|-------------------|---------------------|----------------------------------|-------|
| `montantHT` | `cachetMinimum` | `montantHT: formData.cachetMinimum` | ⚠️ Incohérence |
| `moyenPaiement` | `modePaiement` | `moyenPaiement: formData.modePaiement` | ⚠️ Incohérence |
| `precisionsNegoc` | `precisionNego` | `precisionsNegoc: formData.precisionNego` | ⚠️ Incohérence |

### 1.3 Champs de date/représentation

| PreContratGenerator | PreContratFormPublic | PreContratFormContainer (mapping) | Notes |
|-------------------|---------------------|----------------------------------|-------|
| `horaireDebut` | `heureDebut` | `horaireDebut: formData.heureDebut` | ⚠️ Incohérence |
| `horaireFin` | `heureFin` | `horaireFin: formData.heureFin` | ⚠️ Incohérence |
| `nbRepresentations` | `nombreRepresentations` | `nbRepresentations: formData.nombreRepresentations` | ⚠️ Incohérence |
| `nbAdmins` | `nombreAdmis` | `nbAdmins: formData.nombreAdmis` | ⚠️ Incohérence |
| `invitations` | `invitationsExos` | `invitations: formData.invitationsExos` | ⚠️ Incohérence |
| `festival` | `festivalEvenement` | `festival: formData.festivalEvenement` | ⚠️ Incohérence |

### 1.4 Champs de régie

| PreContratGenerator | PreContratFormPublic | PreContratFormContainer (mapping) | Notes |
|-------------------|---------------------|----------------------------------|-------|
| `responsableRegie` | `nomRegie` | `responsableRegie: formData.nomRegie` | ⚠️ Incohérence |
| `emailProRegie` | `emailRegie` | `emailProRegie: formData.emailRegie` | ⚠️ Incohérence |
| `telProRegie` | `telRegie` | `telProRegie: formData.telRegie` | ⚠️ Incohérence |
| `mobileProRegie` | `mobileRegie` | `mobileProRegie: formData.mobileRegie` | ⚠️ Incohérence |
| `horaires` | `horairesRegie` | `horaires: formData.horairesRegie` | ⚠️ Incohérence |

### 1.5 Champs de promo

| PreContratGenerator | PreContratFormPublic | PreContratFormContainer (mapping) | Notes |
|-------------------|---------------------|----------------------------------|-------|
| `responsablePromo` | `nomPromo` | `responsablePromo: formData.nomPromo` | ⚠️ Incohérence |
| `emailProPromo` | `emailPromo` | `emailProPromo: formData.emailPromo` | ⚠️ Incohérence |
| `telProPromo` | `telPromo` | `telProPromo: formData.telPromo` | ⚠️ Incohérence |
| `mobileProPromo` | `mobilePromo` | `mobileProPromo: formData.mobilePromo` | ⚠️ Incohérence |

### 1.6 Autres incohérences

| PreContratGenerator | PreContratFormPublic | PreContratFormContainer (mapping) | Notes |
|-------------------|---------------------|----------------------------------|-------|
| `receptif` | `accueilHebergement` | Non mappé correctement | ⚠️ Incohérence |

## 2. Analyse des problèmes

### 2.1 Problème de ligne 809 dans PreContratGenerator.js
```javascript
// Ligne 809 - Erreur: utilise 'siteWeb' au lieu de 'site'
value={formData.siteWeb}
onChange={(e) => handleInputChange('siteWeb', e.target.value)}
```
**Devrait être :**
```javascript
value={formData.site}
onChange={(e) => handleInputChange('site', e.target.value)}
```

### 2.2 Mapping dans PreContratFormPublic.js
Le composant `mapExistingData` fait des corrections mais certaines sont incorrectes :
- Ligne 78: `siteWebOrga: data.siteWeb || ''` devrait être `siteWebOrga: data.site || ''`
- Ligne 82: `codeAPE: data.codeAPE || ''` devrait être `codeAPE: data.codeActivite || ''`
- Ligne 83: `tvaIntracom: data.tvaIntracom || ''` devrait être `tvaIntracom: data.numeroTvaIntracommunautaire || ''`
- Ligne 84: `licences: data.licence || ''` devrait être `licences: data.numeroLicence || ''`

## 3. Impact

Ces incohérences causent :
1. **Perte de données** : Les données saisies dans PreContratGenerator ne sont pas correctement transmises au formulaire public
2. **Confusion** : Les développeurs doivent maintenir un mapping complexe entre différents noms
3. **Bugs** : Certains champs ne fonctionnent pas correctement (comme le site web ligne 809)

## 4. Recommandations

1. **Standardiser tous les noms de variables** en utilisant les noms de PreContratGenerator comme référence
2. **Corriger le bug ligne 809** dans PreContratGenerator.js
3. **Mettre à jour le mapping** dans PreContratFormPublic.js et PreContratFormContainer.js
4. **Créer un fichier de constantes** avec tous les noms de champs pour éviter les erreurs futures

## 5. Liste complète des corrections nécessaires

### PreContratGenerator.js
- Ligne 809: Changer `formData.siteWeb` en `formData.site`
- Ligne 810: Changer `handleInputChange('siteWeb', e.target.value)` en `handleInputChange('site', e.target.value)`

### PreContratFormPublic.js
- Mettre à jour la fonction `mapExistingData` pour utiliser les bons noms de source
- Renommer tous les champs du formulaire pour correspondre aux noms standards

### PreContratFormContainer.js
- Simplifier le mapping en utilisant les mêmes noms partout

## 6. Priorité des corrections

1. **CRITIQUE** : Corriger le bug ligne 809 de PreContratGenerator.js
2. **HAUTE** : Standardiser les noms des champs principaux (cp, tel, site, etc.)
3. **MOYENNE** : Harmoniser les noms des champs secondaires (régie, promo)
4. **BASSE** : Nettoyer le code et ajouter des commentaires