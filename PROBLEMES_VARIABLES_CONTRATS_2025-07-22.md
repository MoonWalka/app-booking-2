# Analyse du Stockage et Flux des Données dans l'Application
**Date : 22 juillet 2025**

## 1. FLUX DE DONNÉES : Date → Devis → Contrat

### 1.1 Création d'une Date (DateCreationPage.js)

#### Données stockées dans Firebase (collection `dates`)
```javascript
{
  // Données principales
  date: "2025-07-22",
  artisteId: "xyz123",
  artisteNom: "Nom de l'artiste",     // COPIÉ depuis la sélection
  projetNom: "Nom du projet",         // COPIÉ depuis la sélection
  structureId: "abc456",              // RÉFÉRENCE (ID seulement)
  // structureNom: SUPPRIMÉ - sera chargé dynamiquement
  libelle: "Description événement",
  montant: 0,
  statut: "En cours",
  
  // Métadonnées
  priseOption: "2025-07-22",
  entrepriseId: "ent789",
  creePar: "uid",
  creeParNom: "Nom utilisateur",
  dateCreation: timestamp,
  dateModification: timestamp
}
```

**PROBLÈME 1**: Duplication de données
- `artisteNom` et `projetNom` sont COPIÉS au lieu d'être référencés
- Si l'artiste change de nom dans sa fiche, la date garde l'ancien nom
- `structureNom` a été supprimé (bien) mais pas les autres

### 1.2 Création d'un Devis (DevisEditor.js)

#### Chargement depuis la Date (lignes 175-262)
```javascript
// Récupération des données de la date
const dateData = { id: finalDateId, ...dateDoc.data() };

// Chargement dynamique du nom de la structure (BIEN)
let structureNomDynamique = '';
if (structureIdToUse) {
  const structureDoc = await getDoc(doc(db, 'structures', structureIdToUse));
  if (structureDoc.exists()) {
    const structureData = structureDoc.data();
    structureNomDynamique = structureData.raisonSociale || structureData.nom || '';
  }
}

// Mise à jour du devis avec COPIE des données
const updatedDevisData = {
  dateId: finalDateId,                    // RÉFÉRENCE (OK)
  artisteId: dateData.artisteId || '',    // RÉFÉRENCE (OK)
  artisteNom: dateData.artisteNom || '', // COPIÉ (problème)
  projetNom: dateData.projetNom || '',   // COPIÉ (problème)
  structureId: structureIdToUse || '',   // RÉFÉRENCE (OK)
  structureNom: structureNomDynamique    // Chargé dynamiquement (OK)
};
```

**PROBLÈME 2**: Duplication partielle
- `artisteNom` et `projetNom` sont encore COPIÉS depuis la date
- `structureNom` est bien chargé dynamiquement
- Incohérence dans l'approche

### 1.3 Génération du Contrat (ContratGeneratorNew.js)

#### Mapping des données (lignes 282-401)
```javascript
// Organisateur (Partie A) - Structure qui organise
organisateur: {
  raisonSociale: structure.raisonSociale || '',
  adresse: structure.adresse || '',
  // ... autres champs copiés
}

// Producteur (Partie B) - Entreprise du label (utilisateur)
producteur: {
  raisonSociale: entrepriseData.nom || '',  // CORRECT : entreprise du label
  adresse: entrepriseData.adresse || '',
  // ... mappé depuis les paramètres entreprise
}

// MAIS : l'artiste n'est stocké nulle part dans le contrat !
```

**PROBLÈME 3**: Données manquantes
- L'artiste (`artisteNom`, `projetNom`) n'est PAS stocké dans le contrat
- Les données sont stockées via références : `artisteId: artiste?.id`
- Mais lors de la génération PDF, ces données ne sont pas disponibles

### 1.4 Remplacement des Variables (ContratRedactionPage.js)

#### Préparation des données pour le template
```javascript
// Dans prepareContractData (contractVariablesUnified.js)
// Les données sont mappées mais l'artiste est manquant

// Dans replaceVariables
// Recherche {artiste_nom} mais la donnée n'existe pas dans contratData
```

**PROBLÈME 4**: Variables non remplacées
- Le template cherche `{artiste_nom}` mais cette donnée n'est pas dans `contratData`
- Elle est dans `date.artisteNom` mais pas passée au mapper

## 2. INCOHÉRENCES DE STOCKAGE

### 2.1 Approches mixtes

| Donnée | Date | Devis | Contrat | Approche |
|--------|------|-------|---------|----------|
| Structure ID | ✓ Référence | ✓ Référence | ✓ Référence | Cohérent |
| Structure Nom | ✗ Supprimé | ✓ Dynamique | ✓ Copié | Mixte |
| Artiste ID | ✓ Référence | ✓ Référence | ✓ Référence | Cohérent |
| Artiste Nom | ✗ Copié | ✗ Copié | ✗ Absent | Incohérent |
| Projet Nom | ✗ Copié | ✗ Copié | ✗ Absent | Incohérent |

### 2.2 Noms de variables incohérents

| Contexte | Variable Structure | Variable Artiste |
|----------|-------------------|------------------|
| Date Firebase | `structureId` | `artisteNom` |
| Devis | `structureNom` | `artisteNom` |
| Contrat | `organisateur.raisonSociale` | Absent |
| Template | `{organisateur_raisonSociale}` | `{artiste_nom}` |

## 3. EXEMPLES DE CODE MONTRANT LES PROBLÈMES

### Problème 1 : Duplication lors de la création de date
```javascript
// DateCreationPage.js ligne 227-234
handleArtisteSelect = (artiste) => {
  setFormData(prev => ({
    ...prev,
    artisteId: artiste.id,
    artisteNom: artiste.artisteNom,  // ❌ COPIÉ au lieu d'être référencé
    projetNom: artiste.projetNom      // ❌ COPIÉ au lieu d'être référencé
  }));
};
```

### Problème 2 : Chargement incohérent dans le devis
```javascript
// DevisEditor.js ligne 228-244
const updatedDevisData = {
  artisteNom: dateData.artisteNom || '', // ❌ COPIÉ depuis la date
  structureNom: structureNomDynamique    // ✓ Chargé dynamiquement
};
```

### Problème 3 : Artiste absent du contrat
```javascript
// ContratGeneratorNew.js ligne 568-586
const dataToSave = {
  ...contratData,
  dateId: dateId,
  artisteId: artiste?.id || null,     // ✓ Référence sauvegardée
  artiste: artiste || null,            // ✓ Objet complet pour PDF
  // MAIS : artisteNom n'est pas dans contratData !
};
```

### Problème 4 : Variables non remplacées
```javascript
// contractVariablesUnified.js ligne 162-166
// La fonction cherche data.artiste_nom
// Mais cette variable n'existe pas dans les données passées
console.log('[replaceVariables] Exemple de variables à remplacer:', {
  'artiste_nom': data.artiste_nom,  // undefined !
});
```

## 4. RECOMMANDATIONS

### 4.1 Approche cohérente : Tout en références
- Stocker UNIQUEMENT les IDs dans les documents
- Charger dynamiquement TOUTES les données lors de l'affichage
- Avantages : Données toujours à jour, pas de duplication

### 4.2 Approche alternative : Snapshot au moment de la validation
- Continuer à stocker les IDs
- Au moment de FINALISER un document (devis/contrat), créer un snapshot
- Stocker le snapshot dans un champ séparé pour l'historique

### 4.3 Normalisation des noms de variables
- Utiliser TOUJOURS les mêmes noms : `artisteNom`, `structureNom`, etc.
- Éviter les variations : `organisateur.raisonSociale` vs `structureNom`

---

*Ce document remplace l'ancienne version et fournit une analyse complète du flux de données*