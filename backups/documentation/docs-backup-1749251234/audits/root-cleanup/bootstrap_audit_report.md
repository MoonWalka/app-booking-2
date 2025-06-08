# Rapport d'audit des classes Bootstrap

*Date de génération: 5/31/2025, 11:10:27 PM*

## Résumé

- **Fichiers analysés**: 488
- **Fichiers avec problèmes**: 45
- **Problèmes de boutons**: 35
- **Problèmes de cartes**: 76
- **Autres problèmes**: 69

## Recommandations

### Boutons

Remplacer les classes Bootstrap par les classes standardisées TourCraft :

**Exemple avant** :
```jsx
<button className="btn btn-primary">Enregistrer</button>
```

**Exemple après** :
```jsx
<button className="tc-btn tc-btn-primary">Enregistrer</button>
```

### Cartes

Utiliser le composant Card standardisé au lieu des classes Bootstrap :

**Exemple avant** :
```jsx
<div className="card"><div className="card-body">Contenu</div></div>
```

**Exemple après** :
```jsx
<Card>Contenu</Card>
```

## Fichiers à corriger

### Priorité haute (plus de 5 occurrences)

- **src/pages/DashboardPage.js** (16 occurrences)
- **src/components/programmateurs/desktop/ProgrammateurView.js** (16 occurrences)
- **src/components/organization/OnboardingFlow.js** (13 occurrences)
- **src/pages/admin/MigrationPage.js** (11 occurrences)
- **src/components/concerts/desktop/ConcertStructureSection.js** (10 occurrences)
- **src/components/concerts/desktop/ConcertOrganizerSection.js** (10 occurrences)
- **src/components/concerts/desktop/ConcertArtistSection.js** (10 occurrences)
- **src/components/concerts/desktop/ConcertLocationSection.js** (9 occurrences)
- **src/components/concerts/desktop/ConcertGeneralInfo.js** (8 occurrences)
- **src/pages/FormResponsePage.js** (7 occurrences)
- **src/components/concerts/desktop/ConcertOrganizerSectionFixed.js** (6 occurrences)

### Priorité moyenne (2-5 occurrences)

- **src/components/concerts/desktop/ConcertLocationSectionFixed.js** (5 occurrences)
- **src/components/concerts/desktop/ConcertLocationSectionDebug.js** (5 occurrences)
- **src/pages/CreateDefaultTemplate.js** (4 occurrences)
- **src/components/lieux/desktop/sections/LieuAddressSection.js** (4 occurrences)
- **src/components/lieux/desktop/sections/LieuInfoSection.js** (3 occurrences)
- **src/components/lieux/desktop/sections/LieuContactSection.js** (3 occurrences)
- **src/components/forms/public/AdminFormValidation.js** (3 occurrences)
- **src/components/common/layout/MobileLayout.js** (3 occurrences)
- **src/components/artistes/desktop/ArtisteForm.js** (3 occurrences)
- **src/pages/ContratGenerationPage.js** (2 occurrences)
- **src/components/structures/desktop/sections/StructureAssociationsSection.js** (2 occurrences)
- **src/components/programmateurs/RenderedView.jsx** (2 occurrences)
- **src/components/parametres/sections/EntrepriseSearchResults.js** (2 occurrences)
- **src/components/forms/public/FormSubmitBlock.js** (2 occurrences)
- **src/components/concerts/desktop/ConcertsList.js** (2 occurrences)

### Priorité basse (1 occurrence)

- **src/pages/contratTemplatesPage.js**
- **src/pages/ContratDetailsPage.js**
- **src/components/structures/desktop/StructureForm.js**
- **src/components/structures/desktop/sections/StructureBillingSection.js**
- **src/components/programmateurs/desktop/ProgrammateurFormMaquette.js**
- **src/components/programmateurs/desktop/sections/ProgrammateurHeader.js**
- **src/components/molecules/GenericList.js**
- **src/components/lieux/desktop/sections/LieuOrganizerSection.js**
- **src/components/forms/FormSubmissionViewer.js**
- **src/components/forms/public/PublicFormContainer.js**
- **src/components/contrats/fullscreenEditorModal.js**
- **src/components/contrats/sections/ContratPdfViewer.js**
- **src/components/contrats/desktop/sections/ContratTemplateHeader.js**
- **src/components/concerts/mobile/sections/ConcertLocationSectionMobile.js**
- **src/components/concerts/desktop/ConcertsListSimplified.js**
- **src/components/concerts/desktop/ConcertHeader.js**
- **src/components/common/Modal.js**
- **src/components/artistes/mobile/ArtisteView.js**
- **src/components/artistes/desktop/ArtisteView.js**
