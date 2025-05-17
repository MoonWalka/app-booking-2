# Rapport d'audit des classes Bootstrap

*Date de génération: 5/17/2025, 3:53:39 AM*

## Résumé

- **Fichiers analysés**: 481
- **Fichiers avec problèmes**: 76
- **Problèmes de boutons**: 55
- **Problèmes de cartes**: 19
- **Autres problèmes**: 149

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
- **src/components/exemples/ProgrammateurFormExemple.js** (15 occurrences)
- **src/components/exemples/ArtisteFormExemple.js** (10 occurrences)
- **src/components/concerts/desktop/ConcertOrganizerSection.js** (9 occurrences)
- **src/components/concerts/desktop/ConcertGeneralInfo.js** (9 occurrences)
- **src/components/concerts/desktop/ConcertStructureSection.js** (8 occurrences)
- **src/components/exemples/FormulairesOptimisesIndex.js** (7 occurrences)
- **src/components/concerts/desktop/ConcertLocationSection.js** (7 occurrences)
- **src/components/concerts/desktop/ConcertArtistSection.js** (7 occurrences)

### Priorité moyenne (2-5 occurrences)

- **src/components/programmateurs/desktop/ProgrammateurContactSection.js** (5 occurrences)
- **src/components/lieux/desktop/sections/LieuOrganizerSection.js** (5 occurrences)
- **src/components/forms/FormGenerator.js** (5 occurrences)
- **src/components/programmateurs/desktop/ProgrammateurAddressSection.js** (4 occurrences)
- **src/components/lieux/desktop/sections/LieuAddressSection.js** (4 occurrences)
- **src/components/forms/validation/FormValidationInterfaceNew.js** (4 occurrences)
- **src/components/forms/validation/FormValidationInterface.js** (4 occurrences)
- **src/components/contrats/desktop/sections/ContratGenerationActions.js** (4 occurrences)
- **src/components/artistes/desktop/ArtisteForm.js** (4 occurrences)
- **src/pages/LoginPage.js** (3 occurrences)
- **src/components/structures/desktop/StructuresList.js** (3 occurrences)
- **src/components/programmateurs/mobile/ProgrammateurForm.js** (3 occurrences)
- **src/components/programmateurs/desktop/DeleteProgrammateurModal.js** (3 occurrences)
- **src/components/lieux/desktop/sections/LieuStructuresSection.js** (3 occurrences)
- **src/components/lieux/desktop/sections/LieuInfoSection.js** (3 occurrences)
- **src/components/lieux/desktop/sections/LieuContactSection.js** (3 occurrences)
- **src/components/forms/public/AdminFormValidation.js** (3 occurrences)
- **src/components/contrats/sections/ContratPdfViewer.js** (3 occurrences)
- **src/components/common/layout/MobileLayout.js** (3 occurrences)
- **src/pages/contratTemplatesEditPage.js** (2 occurrences)
- **src/components/ui/LegalInfoSection.js** (2 occurrences)
- **src/components/structures/desktop/sections/StructureAssociationsSection.js** (2 occurrences)
- **src/components/programmateurs/RenderedView.jsx** (2 occurrences)
- **src/components/parametres/sections/EntrepriseSearchResults.js** (2 occurrences)
- **src/components/molecules/GenericList.js** (2 occurrences)
- **src/components/lieux/mobile/LieuView.js** (2 occurrences)
- **src/components/lieux/desktop/LieuView.js** (2 occurrences)
- **src/components/lieux/desktop/LieuFormOptimized.js** (2 occurrences)
- **src/components/lieux/desktop/LieuDetails.js** (2 occurrences)
- **src/components/lieux/desktop/sections/LieuGeneralInfo.js** (2 occurrences)
- **src/components/lieux/desktop/sections/LieuConcertsSection.js** (2 occurrences)
- **src/components/forms/public/FormSubmitBlock.js** (2 occurrences)
- **src/components/debug/PerformanceMonitor.js** (2 occurrences)
- **src/components/contrats/sections/ContratPdfTabs.js** (2 occurrences)
- **src/components/contrats/desktop/sections/ContratTemplateHeaderSection.js** (2 occurrences)
- **src/components/contrats/desktop/sections/ContratTemplateFooterSection.js** (2 occurrences)
- **src/components/concerts/desktop/DeleteConcertModal.js** (2 occurrences)

### Priorité basse (1 occurrence)

- **src/pages/contratTemplatesPage.js**
- **src/pages/ContratDetailsPage.js**
- **src/components/structures/desktop/sections/StructureBillingSection.js**
- **src/components/programmateurs/desktop/ProgrammateursList.js**
- **src/components/programmateurs/desktop/ProgrammateurLegalSection.js**
- **src/components/programmateurs/desktop/ProgrammateurHeader.js**
- **src/components/parametres/sections/EntrepriseHeader.js**
- **src/components/lieux/desktop/LieuForm.js**
- **src/components/lieux/desktop/sections/LieuxListEmptyState.js**
- **src/components/forms/public/PublicFormContainer.js**
- **src/components/contrats/fullscreenEditorModal.js**
- **src/components/contrats/desktop/ContratTemplateEditor.js**
- **src/components/contrats/desktop/sections/ContratTemplateInfoSection.js**
- **src/components/contrats/desktop/sections/ContratTemplateHeader.js**
- **src/components/contrats/desktop/sections/ContratNoTemplates.js**
- **src/components/concerts/sections/SearchDropdown.js**
- **src/components/concerts/sections/DeleteConfirmModal.js**
- **src/components/concerts/sections/ConcertsListHeader.js**
- **src/components/concerts/sections/ConcertFormActions.js**
- **src/components/concerts/mobile/sections/ConcertLocationSectionMobile.js**
- **src/components/concerts/desktop/ConcertsList.js**
- **src/components/concerts/desktop/ConcertHeader.js**
- **src/components/concerts/desktop/ConcertDetails.js**
- **src/components/common/Modal.js**
- **src/components/common/Layout.js**
- **src/components/common/layout/DesktopLayout.js**
- **src/components/artistes/mobile/ArtisteView.js**
- **src/components/artistes/desktop/ArtistesList.js**
- **src/components/artistes/desktop/ArtisteView.js**
- **src/components/artistes/desktop/ArtisteDetail.js**
