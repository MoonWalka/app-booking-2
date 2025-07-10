# Suivi de Migration Concert → Date
**Date de début : 9 juillet 2025**

## Fichiers JavaScript/JSX à migrer (73 fichiers)

### Section Artistes
- [ ] src/components/artistes/sections/ArtisteSearchBar.js
- [ ] src/components/artistes/sections/ArtistesStatsCards.js
- [ ] src/components/artistes/sections/ArtistesTable.js

### Section Common
- [x] src/components/common/RelationCard.js
- [x] src/components/common/modals/SalleCreationModal.js

### Section Contacts
- [x] src/components/contacts/ContactDatesTable.js
- [x] src/components/contacts/ContactViewTabs.js
- [x] src/components/contacts/EchangeForm.js
- [x] src/components/contacts/mobile/ContactView.js
- [x] src/components/contacts/sections/ContactBottomTabs.js

### Section Contrats
- [x] src/components/contrats/ContratTemplateEditorSimple.js
- [x] src/components/contrats/desktop/ContratGenerator.js
- [x] src/components/contrats/desktop/ContratGeneratorNew.js
- [x] src/components/contrats/desktop/sections/ContratDebugPanel.js
- [x] src/components/contrats/desktop/sections/ContratGenerationActions.js
- [x] src/components/contrats/sections/ContratActions.js
- [x] src/components/contrats/sections/ContratPdfViewer.js
- [x] src/components/contrats/sections/ContratsTableNew.js

### Section Debug
- [ ] src/components/debug/ArtisteSearchLiveDebug.js
- [ ] src/components/debug/BidirectionalRelationsFixer.js
- [ ] src/components/debug/BrevoDiagnostic.js
- [ ] src/components/debug/BrevoTemplateCreator.js
- [ ] src/components/debug/BrevoTemplateCustomizer.js
- [ ] src/components/debug/DateLieuDebug.js
- [ ] src/components/debug/ListDebugger.js
- [ ] src/components/debug/MigrateContractTemplates.js
- [ ] src/components/debug/MigrateContractVariables.js

### Section Devis
- [ ] src/components/devis/DevisEditor.js
- [ ] src/components/devis/DevisForm.js

### Section Factures
- [ ] src/components/factures/FactureTemplateEditor.js
- [ ] src/components/factures/FacturesTableView.js

### Section Forms
- [ ] src/components/forms/mobile/sections/FormHeader.js
- [ ] src/components/forms/mobile/sections/ValidationSection.js
- [ ] src/components/forms/public/AdminFormValidation.js
- [x] src/components/forms/public/DateInfoSection.js
- [ ] src/components/forms/public/FormPageHeader.js
- [ ] src/components/forms/public/PublicFormContainer.js
- [ ] src/components/forms/validation/FormHeader.js
- [ ] src/components/forms/validation/ValidationSection.js

### Section Lieux
- [ ] src/components/lieux/LieuxList.js
- [x] src/components/lieux/desktop/LieuView.js
- [ ] src/components/lieux/desktop/sections/LieuxListSearchFilter.js
- [ ] src/components/lieux/desktop/sections/LieuxResultsTable.js
- [ ] src/components/lieux/desktop/sections/LieuxStatsCards.js
- [ ] src/components/lieux/mobile/LieuMobileForm.js
- [ ] src/components/lieux/mobile/LieuView.js

### Section PDF
- [x] src/components/pdf/ContratPDFWrapper.js

### Section Recherches
- [ ] src/components/recherches/sections/InfosArtisteSection.js

### Section Structures
- [x] src/components/structures/StructureViewTabs.js
- [ ] src/components/structures/desktop/StructureForm.js
- [ ] src/components/structures/desktop/StructureView.js

### Section Tabs
- [x] src/components/tabs/TabManager.js

### Section UI
- [x] src/components/ui/EntityCard.js
- [x] src/components/ui/StatutBadge.js

### Section Hooks
- [x] src/hooks/artistes/useSearchAndFilter.js
- [x] src/hooks/common/useEntitySearch.js
- [x] src/hooks/contrats/useContratActions.js
- [x] src/hooks/contrats/useContratGenerator.js
- [x] src/hooks/contrats/usePdfPreview.js
- [x] src/hooks/forms/useFormValidationData.js

### Section Pages
- [ ] src/pages/ConfirmationPage.js
- [ ] src/pages/ContratGenerationNewPage.js
- [x] src/pages/ContratGenerationPage.js
- [ ] src/pages/ContratRedactionPage.js
- [x] src/pages/DateDetailsPage.js
- [x] src/pages/FactureDetailsPage.js
- [ ] src/pages/FacturesPage.js
- [ ] src/pages/InventairePagesPage.js
- [x] src/pages/LoginPage.js
- [x] src/pages/PreContratGenerationPage.js
- [ ] src/pages/admin/MigrationPage.js
- [ ] src/pages/contratTemplatesPage.js
- [ ] src/pages/factureTemplatesPage.js

### Section Services
- [ ] src/services/__tests__/brevoTemplateService.test.js

## Fichiers CSS à migrer (35 fichiers)
- [x] src/styles/components/concerts.css (SUPPRIMÉ)
- [x] src/styles/pages/concerts.css (SUPPRIMÉ)
- [x] src/styles/base/colors.css
- [ ] Autres fichiers CSS avec références "concert"

## Statistiques
- Total à migrer : 108 fichiers (73 JS + 35 CSS)
- Migrés : 46/108 (43%)