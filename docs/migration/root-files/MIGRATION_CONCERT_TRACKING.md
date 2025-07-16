# Suivi de Migration Concert → Date
**Date de début : 9 juillet 2025**
**Dernière mise à jour : 10 juillet 2025**

## Fichiers JavaScript/JSX à migrer (73 fichiers)

### Section Artistes
- [x] src/components/artistes/sections/ArtisteSearchBar.js
- [x] src/components/artistes/sections/ArtistesStatsCards.js
- [x] src/components/artistes/sections/ArtistesTable.js

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
- [x] src/components/devis/DevisEditor.js
- [x] src/components/devis/DevisForm.js

### Section Factures
- [x] src/components/factures/FactureTemplateEditor.js
- [x] src/components/factures/FacturesTableView.js

### Section Forms
- [x] src/components/forms/mobile/sections/FormHeader.js
- [x] src/components/forms/mobile/sections/ValidationSection.js
- [x] src/components/forms/public/AdminFormValidation.js
- [x] src/components/forms/public/DateInfoSection.js
- [x] src/components/forms/public/FormPageHeader.js
- [x] src/components/forms/public/PublicFormContainer.js
- [x] src/components/forms/validation/FormHeader.js
- [x] src/components/forms/validation/ValidationSection.js

### Section Lieux (SYSTÈME HYBRIDE - COMPATIBILITÉ)
Note: Evolution vers un système hybride lieu/libellé :
- L'ancien système "lieux" est conservé pour compatibilité
- Les nouvelles pages : SallesPage et FestivalsDatesPage
- Les dates peuvent utiliser soit une référence (lieuId), soit un libellé libre (lieuNom)
- Cela permet plus de flexibilité pour les lieux non répertoriés
- [x] ~~src/components/lieux/LieuxList.js~~ (OBSOLÈTE)
- [x] ~~src/components/lieux/desktop/LieuView.js~~ (OBSOLÈTE)
- [x] ~~src/components/lieux/desktop/sections/LieuxListSearchFilter.js~~ (OBSOLÈTE)
- [x] ~~src/components/lieux/desktop/sections/LieuxResultsTable.js~~ (OBSOLÈTE)
- [ ] ~~src/components/lieux/desktop/sections/LieuxStatsCards.js~~ (OBSOLÈTE)
- [ ] ~~src/components/lieux/mobile/LieuMobileForm.js~~ (OBSOLÈTE)
- [ ] ~~src/components/lieux/mobile/LieuView.js~~ (OBSOLÈTE)

### Section PDF
- [x] src/components/pdf/ContratPDFWrapper.js

### Section Recherches
- [x] src/components/recherches/sections/InfosArtisteSection.js

### Section Structures
- [x] src/components/structures/StructureViewTabs.js
- [x] src/components/structures/desktop/StructureForm.js
- [x] src/components/structures/desktop/StructureView.js

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

### Hooks dans /hooks/dates/ (à vérifier si utilisés)
Note: Ces hooks sont utilisés par les composants dates mais ne contiennent pas "concert"
- useDateActions.js
- useDateAssociations.js
- useDateDelete.js
- useDateDetails.js
- useDateForm.js
- useDateFormWithRelations.js
- useDateFormsManagement.js
- useDateListData.js
- useDateStatus.js

### Section Pages
- [x] src/pages/ConfirmationPage.js
- [x] src/pages/ContratGenerationNewPage.js
- [x] src/pages/ContratGenerationPage.js
- [x] src/pages/ContratRedactionPage.js
- [x] src/pages/DateDetailsPage.js
- [x] src/pages/FactureDetailsPage.js
- [x] src/pages/FacturesPage.js
- [x] src/pages/InventairePagesPage.js
- [x] src/pages/LoginPage.js
- [x] src/pages/PreContratGenerationPage.js
- [x] src/pages/admin/MigrationPage.js
- [x] src/pages/contratTemplatesPage.js
- [x] src/pages/factureTemplatesPage.js

### Section Services
- [x] src/services/__tests__/brevoTemplateService.test.js

## Fichiers CSS à migrer

### CSS dans /components/dates/ (24 fichiers)
- [ ] src/components/dates/desktop/DateView.module.css
- [ ] src/components/dates/sections/DateActions.module.css
- [ ] src/components/dates/desktop/DateForm.module.css
- [ ] src/components/dates/sections/DatesTable.module.css
- [ ] src/components/dates/desktop/sections/DateLieuMap.module.css
- [ ] src/components/dates/desktop/DateOrganizerSection.module.css
- [ ] src/components/dates/sections/DatesStatsCards.module.css
- [ ] src/components/dates/sections/DatesListHeader.module.css
- [ ] src/components/dates/sections/DatesEmptyState.module.css
- [ ] src/components/dates/sections/DateSearchBar.module.css
- [ ] src/components/dates/sections/DateInfoSection.module.css
- [ ] src/components/dates/sections/DateFormActions.module.css
- [ ] src/components/dates/mobile/sections/DateOrganizerSectionMobile.module.css
- [ ] src/components/dates/mobile/sections/DateLocationSectionMobile.module.css
- [ ] src/components/dates/mobile/sections/DateHeaderMobile.module.css
- [ ] src/components/dates/mobile/sections/DateGeneralInfoMobile.module.css
- [ ] src/components/dates/mobile/sections/DateArtistSectionMobile.module.css
- [ ] src/components/dates/mobile/DatesList.module.css
- [ ] src/components/dates/mobile/DateView.module.css
- [ ] src/components/dates/desktop/DatesList.module.css
- [ ] src/components/dates/desktop/DateStructureSection.module.css
- [ ] src/components/dates/desktop/DateLocationSection.module.css
- [ ] src/components/dates/desktop/DateGeneralInfo.module.css
- [ ] src/components/dates/desktop/DateArtistSection.module.css

### CSS dans /pages/ (2 fichiers)
- [ ] src/pages/TableauDeBordPage.module.css
- [ ] src/pages/FormResponsePage.module.css

### CSS dans /components/ (autres que dates/) (16 fichiers)
- [ ] src/components/contacts/ContactDatesTable.module.css
- [ ] src/components/contacts/desktop/ContactForm.module.css
- [ ] src/components/contacts/mobile/ContactsList.module.css
- [ ] src/components/forms/public/PreContratFormPublic.module.css
- [ ] src/components/forms/validation/ValidationSection.module.css
- [ ] src/components/forms/mobile/sections/ValidationSection.module.css
- [ ] src/components/forms/Form.module.css
- [ ] src/components/ui/EntityCard.module.css
- [ ] src/components/ui/Card.module.css
- [ ] src/components/common/GenericDetailView.module.css
- [ ] src/components/structures/desktop/StructureForm.module.css
- [ ] src/components/artistes/sections/ArtistesTable.module.css
- [ ] src/components/artistes/sections/ArtistesStatsCards.module.css
- [ ] src/components/artistes/mobile/ArtistesList.module.css
- [ ] src/components/artistes/mobile/ArtisteDetail.module.css
- [ ] src/components/artistes/desktop/ArtisteDetail.module.css

### CSS dans /styles/ (5 fichiers)
- [x] src/styles/components/concerts.css (SUPPRIMÉ)
- [x] src/styles/pages/concerts.css (SUPPRIMÉ)
- [x] src/styles/base/colors.css
- [ ] src/styles/pages/forms.css
- [ ] src/styles/components/badges.css

### CSS OBSOLÈTES (ne pas migrer)
- src/styles/pages/lieux.css (composant obsolète)
- Tous les CSS dans /components/lieux/ (5 fichiers)

## Statistiques
- Total JS à migrer : 66 fichiers (73 - 7 lieux obsolètes)
- Total CSS à migrer : 47 fichiers (24 dates + 2 pages + 16 components + 5 styles)
- **Total général : 113 fichiers**
- JS migrés : 58/66 (88%) - excluant les 4 lieux marqués migrés mais obsolètes
- CSS migrés : 3/47 (6%)
- **Total migrés : 61/113 (54%)**