# Analyse complète du workflow de l'application
**Date : 22 juillet 2025**
**Basé uniquement sur le code réel, pas la documentation**

## 1. Création d'une structure

### Fichier : `StructureCreationModal.js`

**Champs stockés dans Firebase :**
```javascript
// Ligne 245-280
const structureData = {
  // Champs principaux (sans préfixe)
  raisonSociale: formData.raisonSociale,
  adresse: formData.adresse,
  codePostal: formData.codePostal,
  ville: formData.ville,
  email: formData.email,
  telephone: formData.telephone,
  
  // Champs administratifs (le préfixe "admin" est retiré)
  siret: formData.adminSiret,  // Note: "admin" retiré
  codeApe: formData.adminCodeApe,
  numeroLicence: formData.adminNumeroLicence,
  tva: formData.adminTva,
  numeroTva: formData.adminNumeroTva,
  
  // Métadonnées
  dateCreation: serverTimestamp(),
  createdAt: serverTimestamp()
}
```

**Points clés :**
- Les champs administratifs ont le préfixe "admin" dans le formulaire mais pas dans Firebase
- Double stockage des timestamps (`dateCreation` et `createdAt`)
- Pas de champ `structureNom` - c'est `raisonSociale`

## 2. Création d'une date

### Fichier : `DateCreationPage.js`

**Champs stockés (ligne 227) :**
```javascript
const dateData = {
  // Références
  structureId: selectedStructure?.id,
  artisteId: selectedArtist?.id,
  
  // Données copiées
  artisteNom: artiste.artisteNom,  // ⚠️ Copié
  projetNom: artiste.projetNom,    // ⚠️ Copié
  
  // Note: PAS de structureNom (ligne 309)
  // "structureNom sera chargé dynamiquement"
  
  // Autres champs
  date: dateValue,
  montant: montant,
  statut: 'option'
}
```

**Incohérence détectée :**
- `artisteNom` est copié mais `structureNom` ne l'est pas
- Stratégie mixte : certains noms copiés, d'autres chargés dynamiquement

## 3. Génération d'un devis

### Fichier : `DevisEditor.js`

**Récupération des données (ligne 177-262) :**
```javascript
// Charge la structure dynamiquement
const structureDoc = await getDoc(doc(db, 'structures', structureId));
const structureData = structureDoc.data();
const structureNomDynamique = structureData?.raisonSociale || structureData?.nom || '';

// Utilise les données de la date
const devisData = {
  artisteNom: dateData.artisteNom || '',  // Depuis la date
  projetNom: dateData.projetNom || '',    // Depuis la date
  structureId: structureId,
  structureNom: structureNomDynamique,    // Chargé dynamiquement
  
  // Montants (nouveau format)
  montantHT: montantHT,
  montantTTC: montantTTC,
  // Plus: totalHT, totalTTC (ancien format)
}
```

**Migration en cours :**
- Ancien format : `totalHT`, `totalTTC`
- Nouveau format : `montantHT`, `montantTTC`

## 4. Création du pré-contrat

### Fichier : `PreContratGenerator.js`

**Données utilisées (ligne 244-327) :**
```javascript
// Si devis disponible
if (latestDevis) {
  formData = {
    montantHT: latestDevis.montantHT.toString(),
    dateDebut: latestDevis.dateDebut,
    dateFin: latestDevis.dateFin
  }
}

// Après validation publique, stockage dans :
publicFormData = {
  raisonSociale: data.raisonSociale,
  adresse: data.adresse,
  siret: data.siret,
  montantHT: data.montantHT,
  // ... toutes les données du formulaire public
}
```

**Point important :**
- Si `confirmationValidee === true`, les données sont dans `publicFormData`
- Sinon, elles sont directement dans l'objet pré-contrat

## 5. Génération du contrat

### Fichier : `ContratGeneratorNew.js`

**Structure des données (ligne 44-160) :**
```javascript
const contratData = {
  // Partie A - Organisateur (celui qui engage)
  organisateur: {
    raisonSociale: '',  // Depuis structure/pré-contrat
    siret: '',
    adresse: '',
    // ...
  },
  
  // Partie B - Producteur (votre entreprise)
  producteur: {
    raisonSociale: '',  // Depuis entrepriseData
    siret: '',
    // ...
  },
  
  // Représentations
  representations: {
    salle: '',  // Nom du lieu
    debut: '',
    fin: ''
  },
  
  // Négociation
  negociation: {
    montantNet: 0,  // = montantHT
    montantTTC: 0
  }
}
```

**Données sauvegardées (ligne 568-586) :**
```javascript
const dataToSave = {
  ...contratData,
  
  // IDs de référence
  dateId: dateId,
  artisteId: artiste?.id,
  structureId: structure?.id,
  lieuId: lieu?.id,
  
  // Objets complets pour le PDF
  date: date || null,
  artiste: artiste || null,
  structure: structure || null,
  lieu: lieu || null
}
```

## 6. Création de la facture

### Fichier : `factureService.js`

**Récupération des données (ligne 180-294) :**
```javascript
// Données de la structure (4 formats d'adresse possibles !)
adresse_structure: (() => {
  if (structure?.adresseFacturation) return structure.adresseFacturation;
  if (structure?.adresseLieu?.adresse) return structure.adresseLieu.adresse;
  if (structure?.adresse_siege?.ligne1) return structure.adresse_siege.ligne1;
  return structure?.adresse || '';
})()

// TVA par défaut
tauxTva: factureParams?.tva || 20  // ⚠️ Pas depuis le contrat
```

## Problèmes identifiés

### 1. **Incohérence de nommage**
- Structure : `raisonSociale` dans Firebase vs `structureNom` dans le code
- Montants : `totalHT`/`totalTTC` (ancien) vs `montantHT`/`montantTTC` (nouveau)
- Signataire : `signataire` vs `nomSignataire` vs `representant`

### 2. **Stratégie de stockage mixte**
- `artisteNom` : copié dans la date
- `structureNom` : chargé dynamiquement
- Pas de logique claire sur quoi copier ou référencer

### 3. **Données à plusieurs endroits**
- Pré-contrat : données dans l'objet OU dans `publicFormData`
- Structure : 4 formats d'adresse différents
- TVA : depuis params entreprise, pas depuis le contrat

### 4. **Variables non standardisées**
- Le mapper doit gérer trop de variations
- Les templates utilisent différents formats
- Pas de dictionnaire unique de variables

## Pourquoi ça fonctionne quand même ?

1. **Le mapper compense** : `simpleDataMapper.js` gère toutes les variations
2. **Données dupliquées** : Les objets complets sont stockés dans le contrat
3. **Fallbacks multiples** : Le code cherche à plusieurs endroits

## Recommandations simples

1. **Standardiser les noms** : Un seul nom par concept
2. **Clarifier la stratégie** : Soit tout copier, soit tout référencer
3. **Un seul format d'adresse** : Pas 4 différents
4. **Dictionnaire de variables** : Une seule source de vérité