# Audit Exhaustif des Hooks - Utilisation vs Orphelins

**Date:** Sat May 25 15:23:17 CEST 2024

**🧹 MISE À JOUR POST-NETTOYAGE:** 5 hooks orphelins ont été supprimés avec succès.

## 📊 Analyse en cours...

## 📋 Liste Complète des Hooks

| ✅ **useArtisteDetails** | 1 utilisations | `src/hooks/artistes/useArtisteDetails.js` |
  - Utilisé dans:
    - `src//hooks/artistes/index.js`

| ✅ **useArtisteForm** | 2 utilisations | `src/hooks/artistes/useArtisteForm.js` |
  - Utilisé dans:
    - `src//components/exemples/ArtisteFormExemple.js`
    - `src//hooks/artistes/index.js`

| ✅ **useArtisteSearch** | 1 utilisations | `src/hooks/artistes/useArtisteSearch.js` |
  - Utilisé dans:
    - `src//hooks/artistes/index.js`

| ✅ **useArtistesList** | 2 utilisations | `src/hooks/artistes/useArtistesList.js` |
  - Utilisé dans:
    - `src//components/artistes/desktop/ArtistesList.js`
    - `src//hooks/artistes/index.js`

| ✅ **useDeleteArtiste** | 4 utilisations | `src/hooks/artistes/useDeleteArtiste.js` |
  - Utilisé dans:
    - `src//components/artistes/desktop/ArtistesList.js`
    - `src//components/artistes/desktop/ArtisteForm.js`
    - `src//hooks/artistes/index.js`

| ✅ **useHandleDeleteArtist** | 1 utilisations | `src/hooks/artistes/useHandleDeleteArtist.js` |
  - Utilisé dans:
    - `src//hooks/artistes/index.js`

| ✅ **useSearchAndFilter** | 8 utilisations | `src/hooks/artistes/useSearchAndFilter.js` |
| ✅ **useAddressSearch** | 15 utilisations | `src/hooks/common/useAddressSearch.js` |
| ✅ **useCache** | 2 utilisations | `src/hooks/common/useCache.js` |
  - Utilisé dans:
    - `src//hooks/common/useGenericEntityDetails.js`

| ✅ **useCompanySearch** | 7 utilisations | `src/hooks/common/useCompanySearch.js` |
| ✅ **useDebounce** | 2 utilisations | `src/hooks/common/useDebounce.js` |
  - Utilisé dans:
    - `src//hooks/common/useGenericEntitySearch.js`

| ✅ **useEntitySearch** | 8 utilisations | `src/hooks/common/useEntitySearch.js` |
| ✅ **useFirestoreSubscription** | 2 utilisations | `src/hooks/common/useFirestoreSubscription.js` |
  - Utilisé dans:
    - `src//hooks/common/useGenericEntityDetails.js`

| ✅ **useFormSubmission** | 14 utilisations | `src/hooks/common/useFormSubmission.js` |
| ✅ **useGenericEntityDelete** | 6 utilisations | `src/hooks/common/useGenericEntityDelete.js` |
| ✅ **useGenericEntityDetails** | 8 utilisations | `src/hooks/common/useGenericEntityDetails.js` |
| ✅ **useGenericEntityForm** | 13 utilisations | `src/hooks/common/useGenericEntityForm.js` |
| ✅ **useGenericEntityList** | 7 utilisations | `src/hooks/common/useGenericEntityList.js` |
| ✅ **useGenericEntitySearch** | 13 utilisations | `src/hooks/common/useGenericEntitySearch.js` |
| ✅ **useLocationIQ** | 7 utilisations | `src/hooks/common/useLocationIQ.js` |
| ✅ **useResponsive** | 20 utilisations | `src/hooks/common/useResponsive.js` |
| ✅ **useSearchAndFilter** | 8 utilisations | `src/hooks/common/useSearchAndFilter.js` |
| ✅ **useTheme** | 1 utilisations | `src/hooks/common/useTheme.js` |
  - Utilisé dans:
    - `src//hooks/common/index.js`

| ✅ **useConcertActions** | 1 utilisations | `src/hooks/concerts/useConcertActions.js` |
  - Utilisé dans:
    - `src//hooks/concerts/index.js`

| ✅ **useConcertAssociations** | 3 utilisations | `src/hooks/concerts/useConcertAssociations.js` |
  - Utilisé dans:
    - `src//hooks/concerts/useConcertDetails.js`
    - `src//hooks/concerts/index.js`

| ✅ **useConcertDelete** | 3 utilisations | `src/hooks/concerts/useConcertDelete.js` |
  - Utilisé dans:
    - `src//components/concerts/desktop/ConcertForm.js`
    - `src//hooks/concerts/index.js`

| ✅ **useConcertDetails** | 3 utilisations | `src/hooks/concerts/useConcertDetails.js` |
  - Utilisé dans:
    - `src//components/concerts/desktop/ConcertView.js`
    - `src//components/concerts/desktop/ConcertDetails.js`
    - `src//hooks/concerts/index.js`

| ✅ **useConcertFilters** | 1 utilisations | `src/hooks/concerts/useConcertFilters.js` |
  - Utilisé dans:
    - `src//hooks/concerts/index.js`

| ✅ **useConcertForm** | 7 utilisations | `src/hooks/concerts/useConcertForm.js` |
| ❌ **useConcertFormData** | 0 utilisation | `src/hooks/concerts/useConcertFormData.js` |
| ✅ **useConcertFormsManagement** | 2 utilisations | `src/hooks/concerts/useConcertFormsManagement.js` |
  - Utilisé dans:
    - `src//hooks/concerts/useConcertDetails.js`

| ✅ **useConcertListData** | 1 utilisations | `src/hooks/concerts/useConcertListData.js` |
  - Utilisé dans:
    - `src//hooks/concerts/index.js`

| ✅ **useConcertStatus** | 4 utilisations | `src/hooks/concerts/useConcertStatus.js` |
  - Utilisé dans:
    - `src//components/concerts/desktop/ConcertView.js`
    - `src//hooks/concerts/useConcertDetails.js`
    - `src//hooks/concerts/index.js`

| ❌ **useConcertSubmission** | 0 utilisation | `src/hooks/concerts/useConcertSubmission.js` |
| ✅ **useConcerts** | 1 utilisations | `src/hooks/concerts/useConcerts.js` |
  - Utilisé dans:
    - `src//hooks/concerts/index.js`

| ✅ **useEntitySearch** | 8 utilisations | `src/hooks/concerts/useEntitySearch.js` |
| ✅ **useFormSubmission** | 14 utilisations | `src/hooks/concerts/useFormSubmission.js` |
| ✅ **contractVariables** | 3 utilisations | `src/hooks/contrats/contractVariables.js` |
  - Utilisé dans:
    - `src//hooks/contrats/index.js`
    - `src//hooks/contrats/useContratTemplatePreview.js`

| ✅ **useContractTemplates** | 1 utilisations | `src/hooks/contrats/useContractTemplates.js` |
  - Utilisé dans:
    - `src//hooks/contrats/index.js`

| ✅ **useContratActions** | 3 utilisations | `src/hooks/contrats/useContratActions.js` |
  - Utilisé dans:
    - `src//hooks/contrats/index.js`
    - `src//pages/ContratDetailsPage.js`

| ✅ **useContratDetails** | 2 utilisations | `src/hooks/contrats/useContratDetails.js` |
  - Utilisé dans:
    - `src//hooks/contrats/index.js`
    - `src//pages/ContratDetailsPage.js`

| ✅ **useContratForm** | 2 utilisations | `src/hooks/contrats/useContratForm.js` |
  - Utilisé dans:
    - `src//components/exemples/ContratFormExemple.js`
    - `src//hooks/contrats/index.js`

| ✅ **useContratGenerator** | 2 utilisations | `src/hooks/contrats/useContratGenerator.js` |
  - Utilisé dans:
    - `src//components/contrats/desktop/ContratGenerator.js`
    - `src//hooks/contrats/index.js`

| ✅ **useContratTemplateEditor** | 1 utilisations | `src/hooks/contrats/useContratTemplateEditor.js` |
  - Utilisé dans:
    - `src//hooks/contrats/index.js`

| ✅ **useContratTemplatePreview** | 1 utilisations | `src/hooks/contrats/useContratTemplatePreview.js` |
  - Utilisé dans:
    - `src//hooks/contrats/index.js`

| ✅ **usePdfPreview** | 2 utilisations | `src/hooks/contrats/usePdfPreview.js` |
  - Utilisé dans:
    - `src//hooks/contrats/index.js`
    - `src//pages/ContratDetailsPage.js`

| ❌ **useFirebaseSave** | 0 utilisation | `src/hooks/firestore/useFirebaseSave.js` |
| ✅ **useAdminFormValidation** | 2 utilisations | `src/hooks/forms/useAdminFormValidation.js` |
  - Utilisé dans:
    - `src//hooks/forms/index.js`
    - `src//pages/FormResponsePage.js`

| ✅ **useFieldActions** | 3 utilisations | `src/hooks/forms/useFieldActions.js` |
  - Utilisé dans:
    - `src//components/forms/validation/FormValidationInterface.js`
    - `src//components/forms/validation/FormValidationInterfaceNew.js`
    - `src//hooks/forms/index.js`

| ✅ **useFormSubmission** | 14 utilisations | `src/hooks/forms/useFormSubmission.js` |
| ✅ **useFormTokenValidation** | 2 utilisations | `src/hooks/forms/useFormTokenValidation.js` |
  - Utilisé dans:
    - `src//hooks/forms/index.js`
    - `src//pages/FormResponsePage.js`

| ✅ **useFormValidation** | 4 utilisations | `src/hooks/forms/useFormValidation.js` |
  - Utilisé dans:
    - `src//components/forms/validation/FormValidationInterface.js`
    - `src//components/forms/validation/FormValidationInterfaceNew.js`
    - `src//hooks/forms/index.js`
    - `src//hooks/forms/index.js`

| ✅ **useFormValidationData** | 3 utilisations | `src/hooks/forms/useFormValidationData.js` |
  - Utilisé dans:
    - `src//components/forms/validation/FormValidationInterface.js`
    - `src//components/forms/validation/FormValidationInterfaceNew.js`
    - `src//hooks/forms/index.js`

| ✅ **useLieuFormState** | 1 utilisations | `src/hooks/forms/useLieuFormState.js` |
  - Utilisé dans:
    - `src//hooks/forms/index.js`

| ✅ **useValidationBatchActions** | 3 utilisations | `src/hooks/forms/useValidationBatchActions.js` |
  - Utilisé dans:
    - `src//components/forms/validation/FormValidationInterface.js`
    - `src//components/forms/validation/FormValidationInterfaceNew.js`
    - `src//hooks/forms/index.js`

| ✅ **useGenericAction** | 5 utilisations | `src/hooks/generics/actions/useGenericAction.js` |
  - Utilisé dans:
    - `src//hooks/generics/forms/useGenericEntityForm.js`
    - `src//hooks/generics/index.js`
    - `src//hooks/generics/actions/useGenericFormAction.js`

| ✅ **useGenericFormAction** | 1 utilisations | `src/hooks/generics/actions/useGenericFormAction.js` |
  - Utilisé dans:
    - `src//hooks/generics/index.js`

| ✅ **useGenericCachedData** | 5 utilisations | `src/hooks/generics/data/useGenericCachedData.js` |
  - Utilisé dans:
    - `src//context/AuthContext.js`
    - `src//utils/RouterStabilizer.js`
    - `src//hooks/generics/index.js`

| ✅ **useGenericDataFetcher** | 5 utilisations | `src/hooks/generics/data/useGenericDataFetcher.js` |
  - Utilisé dans:
    - `src//hooks/generics/lists/useGenericEntityList.js`
    - `src//hooks/generics/index.js`
    - `src//hooks/generics/data/useGenericCachedData.js`

| ✅ **useGenericEntityForm** | 13 utilisations | `src/hooks/generics/forms/useGenericEntityForm.js` |
| ✅ **useGenericFormPersistence** | 3 utilisations | `src/hooks/generics/forms/useGenericFormPersistence.js` |
  - Utilisé dans:
    - `src//components/lieux/desktop/LieuDetails.js`
    - `src//hooks/generics/index.js`

| ✅ **useGenericFormWizard** | 1 utilisations | `src/hooks/generics/forms/useGenericFormWizard.js` |
  - Utilisé dans:
    - `src//hooks/generics/index.js`

| ✅ **useGenericEntityList** | 7 utilisations | `src/hooks/generics/lists/useGenericEntityList.js` |
| ✅ **useGenericFilteredSearch** | 3 utilisations | `src/hooks/generics/search/useGenericFilteredSearch.js` |
  - Utilisé dans:
    - `src//hooks/generics/lists/useGenericEntityList.js`
    - `src//hooks/generics/index.js`

| ✅ **useGenericSearch** | 3 utilisations | `src/hooks/generics/search/useGenericSearch.js` |
  - Utilisé dans:
    - `src//hooks/generics/index.js`
    - `src//hooks/generics/search/useGenericFilteredSearch.js`

| ✅ **useGenericValidation** | 5 utilisations | `src/hooks/generics/validation/useGenericValidation.js` |
  - Utilisé dans:
    - `src//hooks/generics/forms/useGenericFormWizard.js`
    - `src//hooks/generics/forms/useGenericEntityForm.js`
    - `src//hooks/generics/index.js`

| ✅ **useAddressSearch** | 15 utilisations | `src/hooks/lieux/useAddressSearch.js` |
| ✅ **useLieuDelete** | 7 utilisations | `src/hooks/lieux/useLieuDelete.js` |
| ✅ **useLieuDetails** | 4 utilisations | `src/hooks/lieux/useLieuDetails.js` |
  - Utilisé dans:
    - `src//components/lieux/desktop/LieuView.js`
    - `src//components/lieux/desktop/LieuDetails.js`
    - `src//components/lieux/mobile/LieuView.js`
    - `src//hooks/lieux/index.js`

| ✅ **useLieuForm** | 5 utilisations | `src/hooks/lieux/useLieuForm.js` |
  - Utilisé dans:
    - `src//components/lieux/desktop/LieuFormOptimized.js`
    - `src//components/lieux/desktop/LieuForm.js`
    - `src//components/lieux/mobile/LieuMobileForm.js`
    - `src//hooks/forms/index.js`
    - `src//hooks/lieux/index.js`

| ✅ **useLieuSearch** | 6 utilisations | `src/hooks/lieux/useLieuSearch.js` |
| ✅ **useLieuxFilters** | 3 utilisations | `src/hooks/lieux/useLieuxFilters.js` |
  - Utilisé dans:
    - `src//components/lieux/desktop/LieuxList.js`
    - `src//components/lieux/mobile/LieuxMobileList.js`
    - `src//hooks/lieux/index.js`

| ✅ **useLieuxQuery** | 3 utilisations | `src/hooks/lieux/useLieuxQuery.js` |
  - Utilisé dans:
    - `src//components/lieux/desktop/LieuxList.js`
    - `src//components/lieux/mobile/LieuxMobileList.js`
    - `src//hooks/lieux/index.js`

| ❌ **useConcertsList** | 0 utilisation | `src/hooks/lists/useConcertsList.js` |
| ❌ **useConcertsListGeneric** | 0 utilisation | `src/hooks/lists/useConcertsListGeneric.js` |
| ✅ **useEntrepriseForm** | 2 utilisations | `src/hooks/parametres/useEntrepriseForm.js` |
  - Utilisé dans:
    - `src//components/parametres/ParametresEntreprise.js`
    - `src//hooks/parametres/index.js`

| ✅ **useAddressSearch** | 15 utilisations | `src/hooks/programmateurs/useAddressSearch.js` |
| ✅ **useAdresseValidation** | 3 utilisations | `src/hooks/programmateurs/useAdresseValidation.js` |
  - Utilisé dans:
    - `src//components/programmateurs/desktop/ProgrammateurAddressSection.js`
    - `src//components/programmateurs/desktop/ProgrammateurAddressSection.js`
    - `src//hooks/programmateurs/index.js`

| ✅ **useCompanySearch** | 7 utilisations | `src/hooks/programmateurs/useCompanySearch.js` |
| ✅ **useConcertSearch** | 1 utilisations | `src/hooks/programmateurs/useConcertSearch.js` |
  - Utilisé dans:
    - `src//hooks/programmateurs/index.js`

| ✅ **useDeleteProgrammateur** | 4 utilisations | `src/hooks/programmateurs/useDeleteProgrammateur.js` |
  - Utilisé dans:
    - `src//components/programmateurs/desktop/ProgrammateurForm.js`
    - `src//components/programmateurs/desktop/ProgrammateursList.js`
    - `src//hooks/programmateurs/index.js`

| ✅ **useFormSubmission** | 14 utilisations | `src/hooks/programmateurs/useFormSubmission.js` |
| ✅ **useLieuSearch** | 6 utilisations | `src/hooks/programmateurs/useLieuSearch.js` |
| ✅ **useProgrammateurDetails** | 4 utilisations | `src/hooks/programmateurs/useProgrammateurDetails.js` |
  - Utilisé dans:
    - `src//components/programmateurs/desktop/ProgrammateurDetails.js`
    - `src//components/programmateurs/mobile/ProgrammateurView.js`
    - `src//components/programmateurs/ProgrammateurDetails.js`
    - `src//hooks/programmateurs/index.js`

| ✅ **useProgrammateurForm** | 3 utilisations | `src/hooks/programmateurs/useProgrammateurForm.js` |
  - Utilisé dans:
    - `src//components/exemples/ProgrammateurFormExemple.js`
    - `src//components/programmateurs/desktop/ProgrammateurForm.js`
    - `src//hooks/programmateurs/index.js`

| ✅ **useProgrammateurSearch** | 5 utilisations | `src/hooks/programmateurs/useProgrammateurSearch.js` |
  - Utilisé dans:
    - `src//components/lieux/desktop/LieuDetails.js`
    - `src//components/programmateurs/desktop/ProgrammateursList.js`
    - `src//hooks/lieux/useLieuForm.js`
    - `src//hooks/programmateurs/index.js`

| ✅ **useArtisteSearch** | 1 utilisations | `src/hooks/search/useArtisteSearch.js` |
  - Utilisé dans:
    - `src//hooks/artistes/index.js`

| ✅ **useConcertSearch** | 1 utilisations | `src/hooks/search/useConcertSearch.js` |
  - Utilisé dans:
    - `src//hooks/programmateurs/index.js`

| ✅ **useLieuSearch** | 6 utilisations | `src/hooks/search/useLieuSearch.js` |
| ✅ **useSearchAndFilter** | 8 utilisations | `src/hooks/search/useSearchAndFilter.js` |
| ❌ **useStructureSearch** | 0 utilisation | `src/hooks/search/useStructureSearch.js` |
| ✅ **useDeleteStructure** | 5 utilisations | `src/hooks/structures/useDeleteStructure.js` |
  - Utilisé dans:
    - `src//components/structures/desktop/StructureDetails.js`
    - `src//components/structures/desktop/StructureForm.js`
    - `src//hooks/structures/index.js`

| ✅ **useStructureDetails** | 3 utilisations | `src/hooks/structures/useStructureDetails.js` |
  - Utilisé dans:
    - `src//components/structures/desktop/StructureDetails.js`
    - `src//hooks/structures/index.js`

| ✅ **useStructureForm** | 4 utilisations | `src/hooks/structures/useStructureForm.js` |
  - Utilisé dans:
    - `src//components/structures/desktop/StructureForm.js`
    - `src//components/exemples/StructureFormExemple.js`
    - `src//hooks/structures/index.js`

| ✅ **useStructureValidation** | 3 utilisations | `src/hooks/structures/useStructureValidation.js` |
  - Utilisé dans:
    - `src//components/structures/desktop/StructureForm.js`
    - `src//hooks/structures/index.js`


## 📊 Statistiques Globales

| Métrique | Valeur | Pourcentage |
|----------|--------|-------------|
| **Total des hooks** | 95 | 100% |
| **Hooks utilisés** | 89 | 93% |
| **Hooks orphelins** | 6 | 6% |

## 🎯 Hooks Orphelins (Candidats à la Suppression)

- `src/hooks/concerts/useConcertFormData.js`
- `src/hooks/concerts/useConcertSubmission.js`
- `src/hooks/firestore/useFirebaseSave.js`
- `src/hooks/lists/useConcertsList.js`
- `src/hooks/lists/useConcertsListGeneric.js`
- `src/hooks/search/useStructureSearch.js`

## 🔍 Analyse des Duplications

### Hooks avec des noms similaires :

**useArtisteSearch** :
- Principal: `src/hooks/artistes/useArtisteSearch.js`
- Similaire: `src/hooks/search/useArtisteSearch.js`

**useSearchAndFilter** :
- Principal: `src/hooks/artistes/useSearchAndFilter.js`
- Similaire: `src/hooks/search/useSearchAndFilter.js`
- Similaire: `src/hooks/common/useSearchAndFilter.js`

**useAddressSearch** :
- Principal: `src/hooks/common/useAddressSearch.js`
- Similaire: `src/hooks/lieux/useAddressSearch.js`
- Similaire: `src/hooks/programmateurs/useAddressSearch.js`

**useCompanySearch** :
- Principal: `src/hooks/common/useCompanySearch.js`
- Similaire: `src/hooks/programmateurs/useCompanySearch.js`

**useEntitySearch** :
- Principal: `src/hooks/common/useEntitySearch.js`
- Similaire: `src/hooks/concerts/useEntitySearch.js`

**useFormSubmission** :
- Principal: `src/hooks/common/useFormSubmission.js`
- Similaire: `src/hooks/concerts/useFormSubmission.js`
- Similaire: `src/hooks/forms/useFormSubmission.js`
- Similaire: `src/hooks/programmateurs/useFormSubmission.js`

**useGenericEntityForm** :
- Principal: `src/hooks/common/useGenericEntityForm.js`
- Similaire: `src/hooks/generics/forms/useGenericEntityForm.js`

**useGenericEntityList** :
- Principal: `src/hooks/common/useGenericEntityList.js`
- Similaire: `src/hooks/generics/lists/useGenericEntityList.js`

**useSearchAndFilter** :
- Principal: `src/hooks/common/useSearchAndFilter.js`
- Similaire: `src/hooks/search/useSearchAndFilter.js`
- Similaire: `src/hooks/artistes/useSearchAndFilter.js`

**useConcertForm** :
- Principal: `src/hooks/concerts/useConcertForm.js`
- Similaire: `src/hooks/concerts/useConcertFormData.js`
- Similaire: `src/hooks/concerts/useConcertFormsManagement.js`

**useConcerts** :
- Principal: `src/hooks/concerts/useConcerts.js`
- Similaire: `src/hooks/lists/useConcertsListGeneric.js`
- Similaire: `src/hooks/lists/useConcertsList.js`

**useEntitySearch** :
- Principal: `src/hooks/concerts/useEntitySearch.js`
- Similaire: `src/hooks/common/useEntitySearch.js`

**useFormSubmission** :
- Principal: `src/hooks/concerts/useFormSubmission.js`
- Similaire: `src/hooks/forms/useFormSubmission.js`
- Similaire: `src/hooks/programmateurs/useFormSubmission.js`
- Similaire: `src/hooks/common/useFormSubmission.js`

**useFormSubmission** :
- Principal: `src/hooks/forms/useFormSubmission.js`
- Similaire: `src/hooks/concerts/useFormSubmission.js`
- Similaire: `src/hooks/programmateurs/useFormSubmission.js`
- Similaire: `src/hooks/common/useFormSubmission.js`

**useFormValidation** :
- Principal: `src/hooks/forms/useFormValidation.js`
- Similaire: `src/hooks/forms/useFormValidationData.js`

**useGenericEntityForm** :
- Principal: `src/hooks/generics/forms/useGenericEntityForm.js`
- Similaire: `src/hooks/common/useGenericEntityForm.js`

**useGenericEntityList** :
- Principal: `src/hooks/generics/lists/useGenericEntityList.js`
- Similaire: `src/hooks/common/useGenericEntityList.js`

**useAddressSearch** :
- Principal: `src/hooks/lieux/useAddressSearch.js`
- Similaire: `src/hooks/programmateurs/useAddressSearch.js`
- Similaire: `src/hooks/common/useAddressSearch.js`

**useLieuForm** :
- Principal: `src/hooks/lieux/useLieuForm.js`
- Similaire: `src/hooks/forms/useLieuFormState.js`

**useLieuSearch** :
- Principal: `src/hooks/lieux/useLieuSearch.js`
- Similaire: `src/hooks/programmateurs/useLieuSearch.js`
- Similaire: `src/hooks/search/useLieuSearch.js`

**useConcertsList** :
- Principal: `src/hooks/lists/useConcertsList.js`
- Similaire: `src/hooks/lists/useConcertsListGeneric.js`

**useAddressSearch** :
- Principal: `src/hooks/programmateurs/useAddressSearch.js`
- Similaire: `src/hooks/lieux/useAddressSearch.js`
- Similaire: `src/hooks/common/useAddressSearch.js`

**useCompanySearch** :
- Principal: `src/hooks/programmateurs/useCompanySearch.js`
- Similaire: `src/hooks/common/useCompanySearch.js`

**useConcertSearch** :
- Principal: `src/hooks/programmateurs/useConcertSearch.js`
- Similaire: `src/hooks/search/useConcertSearch.js`

**useFormSubmission** :
- Principal: `src/hooks/programmateurs/useFormSubmission.js`
- Similaire: `src/hooks/concerts/useFormSubmission.js`
- Similaire: `src/hooks/forms/useFormSubmission.js`
- Similaire: `src/hooks/common/useFormSubmission.js`

**useLieuSearch** :
- Principal: `src/hooks/programmateurs/useLieuSearch.js`
- Similaire: `src/hooks/lieux/useLieuSearch.js`
- Similaire: `src/hooks/search/useLieuSearch.js`

**useArtisteSearch** :
- Principal: `src/hooks/search/useArtisteSearch.js`
- Similaire: `src/hooks/artistes/useArtisteSearch.js`

**useConcertSearch** :
- Principal: `src/hooks/search/useConcertSearch.js`
- Similaire: `src/hooks/programmateurs/useConcertSearch.js`

**useLieuSearch** :
- Principal: `src/hooks/search/useLieuSearch.js`
- Similaire: `src/hooks/lieux/useLieuSearch.js`
- Similaire: `src/hooks/programmateurs/useLieuSearch.js`

**useSearchAndFilter** :
- Principal: `src/hooks/search/useSearchAndFilter.js`
- Similaire: `src/hooks/common/useSearchAndFilter.js`
- Similaire: `src/hooks/artistes/useSearchAndFilter.js`

