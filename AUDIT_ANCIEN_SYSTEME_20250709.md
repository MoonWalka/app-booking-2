# Audit des Restes de l'Ancien Système dans nouvelle-interface
**Date : 9 juillet 2025**

## Contexte
Cet audit identifie les éléments de l'ancien système (présent dans `main`) qui sont encore présents dans la branche `nouvelle-interface`. L'objectif est de nettoyer complètement la nouvelle interface de toute trace de l'ancien système.

**Note importante** : Les chiffres excluent les fichiers de backup/migration/archived.

## 1. Terminologie "concert" → "date" (319 références restantes, dont seulement 2 dans des backups)

### Fichiers CSS avec l'ancienne terminologie
```
src/styles/components/concerts.css
src/styles/pages/concerts.css
src/styles/base/colors.css (variables --tc-color-concert)
```

### Pages utilisant encore "concert"
- `ContratGenerationPage.js` : `const [concert, setDate] = useState(null)`
- `PreContratGenerationPage.js` : `const [concert, setDate] = useState(null)`  
- `ContratGenerationNewPage.js` : Utilise `concert` dans les props
- `FactureDetailsPage.js` : Utilise `concert` dans un objet
- `DateDetailsPage.js` : Commentaires avec "concert"

### Hooks avec références "concert"
- `useContratActions.js` : `concert` comme paramètre
- `usePdfPreview.js` : Vérifie `data.concert`
- `useFormValidationData.js` : `const [concert, setDate] = useState(null)`
- `contractVariables.js` : Variables de template avec "concert"

### Composants avec références "concert"
- `ContratGenerator.js` : `concert` dans les props
- `ContratGeneratorNew.js` : `concert` dans les props
- `ContratPDFWrapper.js` : Utilise `concert` dans les props
- `BrevoTemplateCustomizer.js` : Templates avec "concert"

### Services et utilitaires
- `brevoTemplateService.js` : Variables de template "concert"
- `templateVariables.js` : Définitions de variables "concert"
- `firebaseDataUtils.js` : Références dans les commentaires

## 2. Terminologie "organization" → "entreprise" (61 références restantes, aucune dans des backups)

### Pages avec "organization"
- `PreContratFormResponsePage.js` : `const [organizationName, setOrganizationName]`
- `DateDetailsPage.js` : Commentaires

### Composants debug
- `BrevoKeyRecovery.js` : `organization: orgBrevoConfig`
- `EntrepriseContextDiagnostic.js` : `const organizationContext`

### Hooks
- `useFormTokenValidation.js` : `organizationData: null`

### CSS
- `Sidebar.module.css` : Classes `.organizationSelector`
- `contacts.css` : `.tc-contact-organization`

### Tests
- `contactCreationFromForms.test.js` : `mockOrganization`
- `brevoEmailIntegration.test.js` : Import de ParametresEmail (qui n'existe plus)

## 3. Composants de l'ancien système encore référencés

### Import fantôme
- `brevoEmailIntegration.test.js` : Importe `ParametresEmail` qui n'existe plus

### Variables de contexte obsolètes
- Références à `parametres` dans plusieurs fichiers
- Utilisation de `organizationContext` au lieu de `entrepriseContext`

## 4. Statistiques vérifiées (hors fichiers backup)

- **319 références à "concert"** dans le code (seulement 2 dans des backups)
- **61 références à "organization"** (aucune dans des backups)
- **2 fichiers CSS dédiés** aux concerts + **33 fichiers CSS** contenant le mot "concert"
- **1 test** qui importe un composant supprimé (ParametresEmail)
- **1 seul dossier backup** trouvé dans src/

## 5. Plan de nettoyage recommandé

### Phase 1 : Renommage automatique (rechercher/remplacer)
1. `concert` → `date` dans toutes les variables
2. `Concert` → `Date` dans les noms de composants
3. `organization` → `entreprise`
4. `Organization` → `Entreprise`

### Phase 2 : Nettoyage manuel
1. Supprimer les fichiers CSS concerts
2. Mettre à jour les variables CSS dans colors.css
3. Corriger les imports dans les tests
4. Réviser les commentaires et documentation

### Phase 3 : Validation
1. Vérifier que tous les tests passent
2. Faire un build de production
3. Tester les fonctionnalités principales

## 6. Fichiers prioritaires à modifier

### Haute priorité (impact fonctionnel)
1. **Pages de génération de contrats** : Remplacer `concert` par `date`
2. **Hooks de contrats** : Mettre à jour les paramètres
3. **Services Brevo** : Actualiser les variables de template
4. **Tests** : Corriger les imports cassés

### Moyenne priorité (cohérence)
1. **Composants PDF** : Harmoniser la terminologie
2. **Variables CSS** : Renommer les variables de couleur
3. **Commentaires** : Mettre à jour la documentation

### Basse priorité (cosmétique)
1. **Fichiers de debug** : Peuvent être supprimés après validation
2. **CSS orphelins** : À supprimer

## 7. Liste exhaustive des fichiers à corriger

### Fichiers JavaScript/JSX avec "concert" (73 fichiers)
```
src/components/artistes/sections/ArtisteSearchBar.js
src/components/artistes/sections/ArtistesStatsCards.js
src/components/artistes/sections/ArtistesTable.js
src/components/common/RelationCard.js
src/components/common/modals/SalleCreationModal.js
src/components/contacts/ContactDatesTable.js
src/components/contacts/ContactViewTabs.js
src/components/contacts/EchangeForm.js
src/components/contacts/mobile/ContactView.js
src/components/contacts/sections/ContactBottomTabs.js
src/components/contrats/ContratTemplateEditorSimple.js
src/components/contrats/desktop/ContratGenerator.js
src/components/contrats/desktop/ContratGeneratorNew.js
src/components/contrats/desktop/sections/ContratDebugPanel.js
src/components/contrats/desktop/sections/ContratGenerationActions.js
src/components/contrats/sections/ContratActions.js
src/components/contrats/sections/ContratPdfViewer.js
src/components/contrats/sections/ContratsTableNew.js
src/components/debug/ArtisteSearchLiveDebug.js
src/components/debug/BidirectionalRelationsFixer.js
src/components/debug/BrevoDiagnostic.js
src/components/debug/BrevoTemplateCreator.js
src/components/debug/BrevoTemplateCustomizer.js
src/components/debug/DateLieuDebug.js
src/components/debug/ListDebugger.js
src/components/debug/MigrateContractTemplates.js
src/components/debug/MigrateContractVariables.js
src/components/devis/DevisEditor.js
src/components/devis/DevisForm.js
src/components/factures/FactureTemplateEditor.js
src/components/factures/FacturesTableView.js
src/components/forms/mobile/sections/FormHeader.js
src/components/forms/mobile/sections/ValidationSection.js
src/components/forms/public/AdminFormValidation.js
src/components/forms/public/DateInfoSection.js
src/components/forms/public/FormPageHeader.js
src/components/forms/public/PublicFormContainer.js
src/components/forms/validation/FormHeader.js
src/components/forms/validation/ValidationSection.js
src/components/lieux/LieuxList.js
src/components/lieux/desktop/LieuView.js
src/components/lieux/desktop/sections/LieuxListSearchFilter.js
src/components/lieux/desktop/sections/LieuxResultsTable.js
src/components/lieux/desktop/sections/LieuxStatsCards.js
src/components/lieux/mobile/LieuMobileForm.js
src/components/lieux/mobile/LieuView.js
src/components/pdf/ContratPDFWrapper.js
src/components/recherches/sections/InfosArtisteSection.js
src/components/structures/StructureViewTabs.js
src/components/structures/desktop/StructureForm.js
src/components/structures/desktop/StructureView.js
src/components/tabs/TabManager.js
src/components/ui/EntityCard.js
src/components/ui/StatutBadge.js
src/hooks/artistes/useSearchAndFilter.js
src/hooks/common/useEntitySearch.js
src/hooks/contrats/useContratActions.js
src/hooks/contrats/useContratGenerator.js
src/hooks/contrats/usePdfPreview.js
src/hooks/forms/useFormValidationData.js
src/pages/ConfirmationPage.js
src/pages/ContratGenerationNewPage.js
src/pages/ContratGenerationPage.js
src/pages/ContratRedactionPage.js
src/pages/FactureDetailsPage.js
src/pages/FacturesPage.js
src/pages/InventairePagesPage.js
src/pages/LoginPage.js
src/pages/PreContratGenerationPage.js
src/pages/admin/MigrationPage.js
src/pages/contratTemplatesPage.js
src/pages/factureTemplatesPage.js
src/services/__tests__/brevoTemplateService.test.js
```

### Fichiers JavaScript/JSX avec "organization" (15 fichiers)
```
src/__tests__/integration/brevoEmailIntegration.test.js
src/__tests__/integration/contactCreationFromForms.test.js
src/components/common/layout/DesktopLayout.js
src/components/debug/ArtisteFirestoreDiagnostic.js
src/components/debug/BrevoDiagnostic.js
src/components/debug/BrevoKeyRecovery.js
src/components/debug/BrevoTemplateCustomizer.js
src/components/debug/EntrepriseContextDiagnostic.js
src/components/debug/TagsHierarchyDebug.js
src/components/forms/public/PreContratFormContainer.js
src/components/forms/public/PreContratFormPublic.js
src/components/forms/public/PublicFormLayout.js
src/components/ui/EntitySelector.js
src/hooks/forms/useFormTokenValidation.js
src/pages/PreContratFormResponsePage.js
```

### Fichiers CSS avec "concert" (35 fichiers)
```
src/components/artistes/desktop/ArtisteDetail.module.css
src/components/artistes/mobile/ArtisteDetail.module.css
src/components/artistes/mobile/ArtistesList.module.css
src/components/artistes/sections/ArtistesTable.module.css
src/components/common/GenericDetailView.module.css
src/components/contacts/ContactDatesTable.module.css
src/components/contacts/desktop/ContactForm.module.css
src/components/contacts/mobile/ContactsList.module.css
src/components/dates/DateForm.module.css
src/components/dates/desktop/DateForm.module.css
src/components/dates/desktop/DateView.module.css
src/components/dates/desktop/DatesList.module.css
src/components/dates/mobile/DateView.module.css
src/components/dates/mobile/DatesList.module.css
src/components/dates/mobile/sections/DateHeaderMobile.module.css
src/components/dates/sections/DatesTable.module.css
src/components/forms/Form.module.css
src/components/forms/mobile/sections/ValidationSection.module.css
src/components/forms/public/PreContratFormPublic.module.css
src/components/forms/validation/ValidationSection.module.css
src/components/lieux/desktop/LieuxList.module.css
src/components/lieux/desktop/sections/LieuxResultsTable.module.css
src/components/lieux/mobile/LieuView.module.css
src/components/lieux/mobile/LieuxList.module.css
src/components/structures/desktop/StructureForm.module.css
src/pages/FormResponsePage.module.css
src/pages/TableauDeBordPage.module.css
src/styles/base/colors.css
src/styles/components/concerts.css
src/styles/index.css
src/styles/pages/concerts.css
src/styles/pages/contacts.css
src/styles/pages/forms.css
src/styles/pages/lieux.css
```

### Total : 123 fichiers à modifier
- 73 fichiers JS/JSX avec "concert"
- 15 fichiers JS/JSX avec "organization"
- 35 fichiers CSS avec "concert"

## Conclusion

La migration vers le nouveau système n'est pas complète. Il reste **380 références** à l'ancienne terminologie (319 "concert" + 61 "organization") qui doivent être mises à jour. Les fichiers de backup ne représentent qu'une infime partie du problème (moins de 1%). 

La grande majorité des références sont dans des fichiers actifs du système :
- Pages de contrats et formulaires
- Hooks et services
- Composants de debug
- Fichiers CSS (35 fichiers au total)

Un effort systématique de rechercher/remplacer suivi d'une révision manuelle est nécessaire pour finaliser la migration.