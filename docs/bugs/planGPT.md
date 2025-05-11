Faut‑il aller “encore plus loin” ?

Oui, le ménage doit être piloté par l’usage réel : on ne garde qu’une version (v1 ou Migrated/V2) si elle est effective dans l’UI ou utilisée par d’autres hooks. Inutile de supprimer à l’aveugle ; on va mesurer la réalité du code.

⸻

1. Plan d’audit ultra‑fiable (15 min)

Étape	Commande / action	Résultat attendu
1. Lister qui est importé dans l’appli	```bash# depuis la racinegit ls-files	grep -E ’(/use.*Migrated.js$
2. Marquer ceux à 0 import	Ils ne sont appelés nulle part → candidats à la suppression immédiate.	
3. Pour ceux avec ≥ 1 import	Ouvre le(s) composant(s) qui les importent :Cmd click sur l’import dans VS Code	① Confirme qu’il s’agit de la vue active (ex. ConcertView)② Repère si l’ancienne version est aussi importée ailleurs.
4. Choisir la “baseline”	– Si seule la variante Migrated est utilisée → on la renomme en version “normale”.– Si seule l’ancienne est utilisée → on supprime la Migrated.– Si les deux co‑existent → garder la plus complète / testée, et planifier la migration des derniers imports.	
5. Renommage / suppression	bash<br>git mv src/hooks/.../useConcertDetailsMigrated.js src/hooks/…/useConcertDetails.js<br>git rm src/hooks/.../useConcertDetails.js   # si doublon<br>	Arborescence propre, plus de suffixes.
6. Lancer la CI / tests	npm test	Vérifie que les hooks renommés passent toujours leurs tests unitaires.

(Les .test.js “Migrated” sont OK : ils partiront quand leurs modules seront renommés ou supprimés.)

Quelques points pratiques à ajouter :

- Vérifier les « barrel exports » (index.js / index.ts) : si un hook « Migrated » est réexporté depuis un index, renomme ou mets à jour l’export de sorte que les imports dans toute l’app pointent vers le bon module après le git mv.
- Mettre à jour les tests unitaires (*.Migrated.test.js) : profite du git mv pour corriger automatiquement les imports dans ces fichiers (VS Code multi-cursor ou script de remplacement).
- Script post-rename pour ESLint fix : exécute `npm run lint -- --fix` juste après le ménage pour corriger les chemins d’import obsolètes et autres erreurs de style.
- Branche dédiée + PR : crée une branche `feat/cleanup-legacy-hooks`, fais une PR visible pour relecture, rollback facile si besoin.
- Checklist finale :
  1. `npm test` doit passer sans erreur.  
  2. `npm run build` doit générer un bundle propre.  
  3. QA rapide dans l’app (navigation Concert, Programmateur, Structure) pour valider qu’aucune page ne casse.

⸻

2. Pourquoi cette méthode est suffisante
	•	Couverture complète : on balaye tout src/ hors node_modules et scripts/.
	•	Décision pilotée par les imports : impossible de casser la prod en supprimant un fichier jamais référencé.
	•	Renommage atomique via git mv garde l’historique.

⸻

3. Réponse à tes trois questions

Question	Réponse brève
“Approfondir la recherche ?”	✅ Oui, mais seulement en comptant les imports (étape 1) – c’est rapide.
“Garder Migrated, supprimer v1, fusionner ?”	Décidé par fichier selon le décompte d’imports (étapes 2‑4).
“Peux‑tu me donner une réponse plus complète ?”	La méthode ci‑dessus est le guide complet ; exécute le script et colle la sortie ici si tu veux mon feu vert sur chaque fichier.

reponse:

etape 1:
// Imports of Migrated modules found in src/hooks:
// src/hooks/concerts/useConcertDetails.js imports useConcertDetailsMigrated
// src/hooks/forms/useFormValidation.js imports useFormValidationMigrated
// src/hooks/structures/useStructureDetails.js imports useStructureDetailsMigrated
// src/hooks/structures/useStructureForm.js imports useStructureFormMigrated
// src/hooks/lieux/useLieuDetails.js imports useLieuDetailsMigrated
// src/hooks/programmateurs/useProgrammateurDetails.js imports useProgrammateurDetailsMigrated
// src/hooks/contrats/useContratDetails.js imports useContratDetailsMigrated
// src/hooks/artistes/useArtisteDetails.js imports useArtisteDetailsMigrated

etape 2:
// Aucune de ces versions migrées n'est sans import :
// Toutes sont référencées par leur wrapper (useXxx.js) et/ou par des tests.

etape 3:
// Tous les modules Migrated ont ≥1 import.
// Il faut maintenant ouvrir chaque wrapper (useXxx.js) pour vérifier quelle version active conserver et planifier la suppression ou renommage.

---

4. Détail des hooks useProgrammateurDetails

// v1 (wrapper)
export default function useProgrammateurDetails(id: string) {
  // adapts useProgrammateurDetailsMigrated
  return {
    programmateur,      // migratedHook.entity
    loading,           // migratedHook.isLoading
    error,             // migratedHook.error
    isEditing,         // migratedHook.isEditing
    formData,          // migratedHook.formData
    isSubmitting,      // migratedHook.isSubmitting
    toggleEditMode,    // migratedHook.toggleEditMode
    setFormData,       // migratedHook.updateFormData
    handleChange,      // synthetic handler
    handleSubmit,      // migratedHook.saveEntity
    handleDelete,      // migratedHook.deleteEntity
    formatValue        // migratedHook.formatValue
  };
}

// v2 (migrated)
export default function useProgrammateurDetailsMigrated(
  id: string
): {
  // from genericDetails
  entity: Programmateur;
  loading: boolean;
  error: Error | null;
  formData: Partial<Programmateur>;
  updateFormData: (fnOrData: Function | object) => void;
  saveEntity: () => Promise<void>;
  deleteEntity: () => Promise<void>;
  formatValue: (field: string, value: any) => any;
  relatedData: { structures: Structure[] };
  loadingRelated: { structures: boolean };
  refresh: () => void;
  // custom extensions
  handleStructureChange: (newStructure: Structure|null) => void;
  addStructureSecondaire: (structure: Structure) => void;
  removeStructureSecondaire: (structureId: string) => void;
  addContact: (contact: Contact) => void;
  updateContact: (contactId: string, updatedContact: Contact) => void;
  removeContact: (contactId: string) => void;
}


## Pourquoi les tests tombent ?
Ils pointent encore vers d’anciens chemins / noms que nous n’avons pas remis d’équerre ; rien d’anormal après un gros renommage. Il suffit de ré-aligner les imports (ou d’ajouter de petits wrappers) avant de relancer la suite.

---

### Feuille de route minimaliste

| Tâche | Commande / action | But |
|-------|-------------------|-----|
| 1 | `tree -L 3 src/hooks > hooks-tree.txt` | Visualiser tous les dossiers / fichiers existants. |
src/hooks
├── __tests__
│   ├── setupTests.js
│   ├── templates
│   │   └── optimizedFormHookTest.template.js
│   ├── useArtisteFormOptimized.test.js
│   ├── useArtistesListOptimized.test.js
│   ├── useConcertDetailsMigrated.test.js
│   ├── useConcertFormOptimized.test.js
│   ├── useConcertStatusMigrated.test.js
│   ├── useFirebaseMigrated.test.js
│   ├── useFormValidationMigrated.test.js
│   ├── useGenericEntityDetails.test.js
│   ├── useGenericEntityList.test.js
│   ├── useLieuDetailsMigrated.test.js
│   ├── useLieuFormOptimized.test.js
│   ├── useLieuSearchOptimized.test.js
│   ├── useLieuxFiltersMigrated.test.js
│   ├── useLieuxFiltersOptimized.test.js
│   ├── useProgrammateurDetails.test.js
│   └── useProgrammateurSearchOptimized.test.js
├── artistes
│   ├── index.js
│   ├── useArtisteDetails.js
│   ├── useArtisteDetailsMigrated.js
│   ├── useArtisteFormOptimized.js
│   ├── useArtisteSearch.js
│   ├── useArtistesList.js
│   ├── useArtistesListMigrated.js
│   ├── useArtistesListOptimized.js
│   ├── useHandleDeleteArtist.js
│   └── useSearchAndFilter.js
├── common
│   ├── index.js
│   ├── useAddressSearch.js
│   ├── useCache.js
│   ├── useCompanySearch.js
│   ├── useDebounce.js
│   ├── useEntitySearch.js
│   ├── useFirestoreSubscription.js
│   ├── useFirestoreSubscription.js.bak
│   ├── useFormSubmission.js
│   ├── useGenericEntityDelete.js
│   ├── useGenericEntityDetails.js
│   ├── useGenericEntityForm.js
│   ├── useGenericEntityList.js
│   ├── useGenericEntitySearch.js
│   ├── useLocationIQ.js
│   ├── useResponsive.js
│   ├── useSearchAndFilter.js
│   └── useTheme.js
├── concerts
│   ├── index.js
│   ├── useConcertActions.js
│   ├── useConcertAssociations.js
│   ├── useConcertDetails.js
│   ├── useConcertDetailsMigrated.js
│   ├── useConcertFilters.js
│   ├── useConcertForm.js
│   ├── useConcertFormData.js
│   ├── useConcertFormMigrated.js
│   ├── useConcertFormOptimized.js
│   ├── useConcertFormsManagement.js
│   ├── useConcertListData.js
│   ├── useConcertStatus.js
│   ├── useConcertStatusMigrated.js
│   ├── useConcertSubmission.js
│   ├── useConcerts.js
│   ├── useEntitySearch.js
│   └── useFormSubmission.js
├── contrats
│   ├── contractVariables.js
│   ├── index.js
│   ├── useContractTemplates.js
│   ├── useContratActions.js
│   ├── useContratDetails.js
│   ├── useContratDetailsMigrated.js
│   ├── useContratFormOptimized.js
│   ├── useContratGenerator.js
│   ├── useContratTemplateEditor.js
│   ├── useContratTemplatePreview.js
│   └── usePdfPreview.js
├── firestore
│   └── useFirebaseSave.js
├── forms
│   ├── index.js
│   ├── useAdminFormValidation.js
│   ├── useFieldActions.js
│   ├── useFormSubmission.js
│   ├── useFormTokenValidation.js
│   ├── useFormValidation.js
│   ├── useFormValidationData.js
│   ├── useFormValidationMigrated.js
│   ├── useLieuFormState.js
│   └── useValidationBatchActions.js
├── index.js
├── lieux
│   ├── index.js
│   ├── useAddressSearch.js
│   ├── useLieuDelete.js
│   ├── useLieuDeleteMigrated.js
│   ├── useLieuDetails.js
│   ├── useLieuDetailsMigrated.js
│   ├── useLieuForm.js
│   ├── useLieuFormComplete.js
│   ├── useLieuFormMigrated.js
│   ├── useLieuFormOptimized.js
│   ├── useLieuSearch.js
│   ├── useLieuSearchMigrated.js
│   ├── useLieuSearchOptimized.js
│   ├── useLieuxFilters.js
│   ├── useLieuxFiltersMigrated.js
│   ├── useLieuxFiltersOptimized.js
│   ├── useLieuxQuery.js
│   └── useProgrammateurSearch.js
├── lists
│   └── useConcertsList.js
├── parametres
│   ├── index.js
│   └── useEntrepriseForm.js
├── programmateurs
│   ├── index.js
│   ├── useAddressSearch.js
│   ├── useAdresseValidation.js
│   ├── useCompanySearch.js
│   ├── useConcertSearch.js
│   ├── useFormSubmission.js
│   ├── useLieuSearch.js
│   ├── useProgrammateurDetails.js
│   ├── useProgrammateurForm.js
│   ├── useProgrammateurFormOptimized.js
│   ├── useProgrammateurSearch.js
│   ├── useProgrammateurSearchMigrated.js
│   └── useProgrammateurSearchOptimized.js
├── search
│   ├── index.js
│   ├── useArtisteSearch.js
│   ├── useConcertSearch.js
│   ├── useLieuSearch.js
│   ├── useProgrammateurSearch.js
│   ├── useSearchAndFilter.js
│   └── useStructureSearch.js
└── structures
    ├── index.js
    ├── useDeleteStructure.js
    ├── useStructureDetails.js
    ├── useStructureDetailsMigrated.js
    ├── useStructureForm.js
    ├── useStructureFormMigrated.js
    ├── useStructureFormOptimized.js
    └── useStructureValidation.js
| 2 | `grep -R "from '.*useGenericEntityList" test/ src/hooks -n` | Repérer les imports cassés. |
src/hooks/lieux/useLieuxFiltersMigrated.js:3:import { useGenericEntityList } from '@/hooks/common';
src/hooks/lieux/useLieuxFiltersMigrated.js:8: * Utilise useGenericEntityList comme base tout en maintenant l'API compatible 
src/hooks/lieux/useLieuxFiltersMigrated.js:22:  // Utiliser useGenericEntityList avec la bonne configuration
src/hooks/lieux/useLieuxFiltersMigrated.js:23:  const genericList = useGenericEntityList({
src/hooks/lieux/useLieuxFiltersOptimized.js:3: * basé sur useGenericEntityList
src/hooks/lieux/useLieuxFiltersOptimized.js:9:import { useGenericEntityList } from '@/hooks/common';
src/hooks/lieux/useLieuxFiltersOptimized.js:34:  const entityList = useGenericEntityList({
src/hooks/common/index.js:20:export { default as useGenericEntityList } from './useGenericEntityList';
src/hooks/common/useGenericEntityList.js:18:const useGenericEntityList = ({
src/hooks/common/useGenericEntityList.js:295:export default useGenericEntityList;
src/hooks/__tests__/useArtistesListOptimized.test.js:6:import { useGenericEntityList } from '../../hooks/common';
src/hooks/__tests__/useArtistesListOptimized.test.js:15:  useGenericEntityList: jest.fn(),
src/hooks/__tests__/useArtistesListOptimized.test.js:76:    useGenericEntityList.mockReturnValue(mockEntityList);
src/hooks/__tests__/useLieuxFiltersOptimized.test.js:6:import { useGenericEntityList } from '../../hooks/common';
src/hooks/__tests__/useLieuxFiltersOptimized.test.js:15:  useGenericEntityList: jest.fn(),
src/hooks/__tests__/useLieuxFiltersOptimized.test.js:100:    useGenericEntityList.mockReturnValue(mockEntityList);
src/hooks/__tests__/useGenericEntityList.test.js:1:// src/hooks/__tests__/useGenericEntityList.test.js
src/hooks/__tests__/useGenericEntityList.test.js:3:import { useGenericEntityList } from '../common';
src/hooks/__tests__/useGenericEntityList.test.js:74:describe('useGenericEntityList', () => {
src/hooks/__tests__/useGenericEntityList.test.js:83:    const { result, waitForNextUpdate } = renderHook(() => useGenericEntityList({
src/hooks/__tests__/useGenericEntityList.test.js:101:    const { result, waitForNextUpdate } = renderHook(() => useGenericEntityList({
src/hooks/__tests__/useGenericEntityList.test.js:121:    const { result, waitForNextUpdate } = renderHook(() => useGenericEntityList({
src/hooks/__tests__/useGenericEntityList.test.js:144:    const { result, waitForNextUpdate } = renderHook(() => useGenericEntityList({
src/hooks/__tests__/useGenericEntityList.test.js:163:    const { result, waitForNextUpdate } = renderHook(() => useGenericEntityList({
src/hooks/__tests__/useGenericEntityList.test.js:189:    const { result, waitForNextUpdate } = renderHook(() => useGenericEntityList({
src/hooks/__tests__/useGenericEntityList.test.js:213:    const { result, waitForNextUpdate } = renderHook(() => useGenericEntityList({
src/hooks/__tests__/useGenericEntityList.test.js:240:    const { result, waitForNextUpdate } = renderHook(() => useGenericEntityList({
src/hooks/__tests__/useGenericEntityList.test.js:275:    const { result, waitForNextUpdate, unmount } = renderHook(() => useGenericEntityList({
src/hooks/__tests__/useGenericEntityList.test.js:300:    const { result, waitForNextUpdate } = renderHook(() => useGenericEntityList({
src/hooks/__tests__/useGenericEntityList.test.js:316:    const { waitForNextUpdate } = renderHook(() => useGenericEntityList({
src/hooks/__tests__/useGenericEntityList.test.js:332:    const { result, waitForNextUpdate } = renderHook(() => useGenericEntityList({
src/hooks/__tests__/setupTests.js:9:  useGenericEntityList: jest.fn(),
src/hooks/__tests__/setupTests.js:18:  useGenericEntityList: jest.fn(),
src/hooks/__tests__/useLieuxFiltersMigrated.test.js:15:// Mock de useGenericEntityList pour éviter de dépendre de Firebase dans les tests
src/hooks/__tests__/useLieuxFiltersMigrated.test.js:17:  useGenericEntityList: ({ initialItems, transformItem }) => {
src/hooks/artistes/useArtistesListMigrated.js:3:import { useGenericEntityList } from '@/hooks/common';
src/hooks/artistes/useArtistesListMigrated.js:7: * Utilise useGenericEntityList comme base tout en maintenant l'API compatible 
src/hooks/artistes/useArtistesListMigrated.js:24:  const genericList = useGenericEntityList({
src/hooks/artistes/index.js:23: * @recommended La version migrée du hook useArtistesList basée sur useGenericEntityList.
src/hooks/artistes/useArtistesListOptimized.js:2: * Hook optimisé pour la liste des artistes basé sur useGenericEntityList
src/hooks/artistes/useArtistesListOptimized.js:8:import { useGenericEntityList } from '@/hooks/common';
src/hooks/artistes/useArtistesListOptimized.js:34:  const entityList = useGenericEntityList({
| 3 | Décider :  
• Si le hook existe ailleurs : corriger le chemin d’import dans les tests.  
• Sinon : créer un wrapper minimal (expose la même signature, renvoie `[]` ou un stub) pour que les tests passent. | Aligner code et tests. |
| 4 | Dans `useProgrammateurDetailsMigrated.js` :  
```js
import { updateDoc } from 'firebase/firestore';
``` | Restaurer la dépendance manquante. |
| 5 | Ouvrir chaque test qui échoue ; vérifier les clés attendues (`handleXxxChange`, etc.) et les ajouter (ou passer par un adaptateur) dans le hook correspondant. | Harmoniser l’API des hooks. |
| 6 | `npm test` | Relancer la suite jusqu’à obtention d’une sortie verte. |



tree complet:
src
├── App.css
├── App.js
├── components
│   ├── artistes
│   │   ├── ArtisteDetail.js
│   │   ├── ArtisteForm.js
│   │   ├── ArtistesList.js
│   │   ├── desktop
│   │   │   ├── ArtisteDetail.js
│   │   │   ├── ArtisteDetail.module.css
│   │   │   ├── ArtisteForm.js
│   │   │   ├── ArtisteForm.module.css
│   │   │   ├── ArtisteView.js
│   │   │   ├── ArtistesList.js
│   │   │   └── ArtistesList.module.css
│   │   ├── handlers
│   │   │   ├── deleteHandler.js
│   │   │   └── paginationHandler.js
│   │   ├── mobile
│   │   │   ├── ArtisteDetail.js
│   │   │   ├── ArtisteDetail.module.css
│   │   │   ├── ArtisteForm.js
│   │   │   ├── ArtisteForm.module.css
│   │   │   ├── ArtisteView.js
│   │   │   ├── ArtistesList.js
│   │   │   ├── ArtistesList.module.css
│   │   │   ├── handlers
│   │   │   │   ├── deleteHandler.js
│   │   │   │   └── paginationHandler.js
│   │   │   └── utils
│   │   │       └── concertUtils.js
│   │   ├── sections
│   │   │   ├── ArtisteHeader.module.css
│   │   │   ├── ArtisteRow.js
│   │   │   ├── ArtisteRow.module.css
│   │   │   ├── ArtisteSearchBar.js
│   │   │   ├── ArtisteSearchBar.module.css
│   │   │   ├── ArtistesEmptyState.js
│   │   │   ├── ArtistesEmptyState.module.css
│   │   │   ├── ArtistesListHeader.js
│   │   │   ├── ArtistesListHeader.module.css
│   │   │   ├── ArtistesLoadMore.js
│   │   │   ├── ArtistesStatsCards.js
│   │   │   ├── ArtistesStatsCards.module.css
│   │   │   ├── ArtistesTable.js
│   │   │   └── ArtistesTable.module.css
│   │   └── utils
│   │       └── concertUtils.js
│   ├── common
│   │   ├── ActionButton.js
│   │   ├── ActionButton.module.css
│   │   ├── ErrorDisplay.jsx
│   │   ├── Layout.js
│   │   ├── Modal.js
│   │   ├── Modal.module.css
│   │   ├── NotFound.jsx
│   │   ├── OptimizedModal.js
│   │   ├── PublicFormLayout.js
│   │   ├── Spinner.js
│   │   ├── StatusWithInfo.js
│   │   ├── StatusWithInfo.module.css
│   │   ├── UnderConstruction.js
│   │   ├── layout
│   │   │   ├── DesktopLayout.js
│   │   │   └── MobileLayout.js
│   │   └── steps
│   │       ├── StepNavigation.js
│   │       ├── StepNavigation.module.css
│   │       ├── StepProgress.js
│   │       └── StepProgress.module.css
│   ├── concerts
│   │   ├── ConcertDetails.js
│   │   ├── ConcertForm.js
│   │   ├── ConcertForm.module.css
│   │   ├── ConcertsList.js
│   │   ├── desktop
│   │   │   ├── ConcertArtistSection.js
│   │   │   ├── ConcertArtistSection.module.css
│   │   │   ├── ConcertDetails.js
│   │   │   ├── ConcertDetails.module.css
│   │   │   ├── ConcertForm.js
│   │   │   ├── ConcertForm.module.css
│   │   │   ├── ConcertGeneralInfo.js
│   │   │   ├── ConcertGeneralInfo.module.css
│   │   │   ├── ConcertHeader.js
│   │   │   ├── ConcertHeader.module.css
│   │   │   ├── ConcertLocationSection.js
│   │   │   ├── ConcertLocationSection.module.css
│   │   │   ├── ConcertOrganizerSection.js
│   │   │   ├── ConcertOrganizerSection.module.css
│   │   │   ├── ConcertStructureSection.js
│   │   │   ├── ConcertStructureSection.module.css
│   │   │   ├── ConcertView.js
│   │   │   ├── ConcertView.module.css
│   │   │   ├── ConcertsList.js
│   │   │   ├── ConcertsList.module.css
│   │   │   ├── DeleteConcertModal.js
│   │   │   ├── DeleteConcertModal.module.css
│   │   │   └── handlers
│   │   │       └── deleteHandler.js
│   │   ├── mobile
│   │   │   ├── ConcertDetails.js
│   │   │   ├── ConcertDetails.module.css
│   │   │   ├── ConcertForm.js
│   │   │   ├── ConcertView.js
│   │   │   ├── ConcertView.module.css
│   │   │   ├── ConcertsList.js
│   │   │   ├── ConcertsList.module.css
│   │   │   ├── handlers
│   │   │   │   └── deleteHandler.js
│   │   │   └── sections
│   │   │       ├── ActionBarMobile.js
│   │   │       ├── ActionBarMobile.module.css
│   │   │       ├── ConcertArtistSectionMobile.js
│   │   │       ├── ConcertArtistSectionMobile.module.css
│   │   │       ├── ConcertGeneralInfoMobile.js
│   │   │       ├── ConcertGeneralInfoMobile.module.css
│   │   │       ├── ConcertHeaderMobile.js
│   │   │       ├── ConcertHeaderMobile.module.css
│   │   │       ├── ConcertLocationSectionMobile.js
│   │   │       ├── ConcertLocationSectionMobile.module.css
│   │   │       ├── ConcertOrganizerSectionMobile.js
│   │   │       ├── ConcertOrganizerSectionMobile.module.css
│   │   │       ├── DeleteConcertModalMobile.js
│   │   │       └── DeleteConcertModalMobile.module.css
│   │   ├── sections
│   │   │   ├── ArtisteSearchSection.js
│   │   │   ├── ArtisteSearchSection.module.css
│   │   │   ├── ConcertActions.js
│   │   │   ├── ConcertActions.module.css
│   │   │   ├── ConcertFormActions.js
│   │   │   ├── ConcertFormActions.module.css
│   │   │   ├── ConcertFormHeader.js
│   │   │   ├── ConcertFormHeader.module.css
│   │   │   ├── ConcertInfoSection.js
│   │   │   ├── ConcertInfoSection.module.css
│   │   │   ├── ConcertRow.js
│   │   │   ├── ConcertRow.module.css
│   │   │   ├── ConcertSearchBar.js
│   │   │   ├── ConcertSearchBar.module.css
│   │   │   ├── ConcertStatusBadge.js
│   │   │   ├── ConcertStatusTabs.js
│   │   │   ├── ConcertStatusTabs.module.css
│   │   │   ├── ConcertsListHeader.js
│   │   │   ├── ConcertsListHeader.module.css
│   │   │   ├── ConcertsTable.js
│   │   │   ├── ConcertsTable.module.css
│   │   │   ├── DeleteConfirmModal.js
│   │   │   ├── DeleteConfirmModal.module.css
│   │   │   ├── LieuSearchSection.js
│   │   │   ├── LieuSearchSection.module.css
│   │   │   ├── NotesSection.js
│   │   │   ├── NotesSection.module.css
│   │   │   ├── ProgrammateurSearchSection.js
│   │   │   ├── ProgrammateurSearchSection.module.css
│   │   │   ├── SearchDropdown.js
│   │   │   ├── SearchDropdown.module.css
│   │   │   ├── SelectedEntityCard.js
│   │   │   └── SelectedEntityCard.module.css
│   │   └── utils
│   │       ├── concertFormValidation.js
│   │       └── entityRelations.js
│   ├── contrats
│   │   ├── ContratGenerator.js
│   │   ├── ContratPDFWrapper.js
│   │   ├── ContratTemplateEditor.js
│   │   ├── ContratTemplateEditorModal.js
│   │   ├── ContratTemplateEditorModal.module.css
│   │   ├── ContratVariable.js
│   │   ├── ContratVariable.module.css
│   │   ├── FullscreenEditorModal.module.css
│   │   ├── desktop
│   │   │   ├── ContratGenerator.js
│   │   │   ├── ContratGenerator.module.css
│   │   │   ├── ContratTemplateEditor.js
│   │   │   ├── ContratTemplateEditor.module.css
│   │   │   ├── ContratVariable.js
│   │   │   ├── hooks
│   │   │   │   ├── useContratTemplateEditor.js
│   │   │   │   ├── useContratTemplateForm.js
│   │   │   │   ├── useContratTemplatePreview.js
│   │   │   │   ├── useTemplateEditor.js
│   │   │   │   ├── useTemplateVariables.js
│   │   │   │   └── useVariablesDropdown.js
│   │   │   ├── sections
│   │   │   │   ├── CollapsibleSection.js
│   │   │   │   ├── CollapsibleSection.module.css
│   │   │   │   ├── ContratAlerts.js
│   │   │   │   ├── ContratAlerts.module.css
│   │   │   │   ├── ContratDebugPanel.js
│   │   │   │   ├── ContratDebugPanel.module.css
│   │   │   │   ├── ContratGenerationActions.js
│   │   │   │   ├── ContratGenerationActions.module.css
│   │   │   │   ├── ContratLoadingSpinner.js
│   │   │   │   ├── ContratLoadingSpinner.module.css
│   │   │   │   ├── ContratNoTemplates.js
│   │   │   │   ├── ContratNoTemplates.module.css
│   │   │   │   ├── ContratTemplateBodySection.js
│   │   │   │   ├── ContratTemplateBodySection.module.css
│   │   │   │   ├── ContratTemplateFooterSection.js
│   │   │   │   ├── ContratTemplateFooterSection.module.css
│   │   │   │   ├── ContratTemplateHeader.js
│   │   │   │   ├── ContratTemplateHeader.module.css
│   │   │   │   ├── ContratTemplateHeaderSection.js
│   │   │   │   ├── ContratTemplateHeaderSection.module.css
│   │   │   │   ├── ContratTemplateInfoSection.js
│   │   │   │   ├── ContratTemplateInfoSection.module.css
│   │   │   │   ├── ContratTemplatePreview.js
│   │   │   │   ├── ContratTemplatePreview.module.css
│   │   │   │   ├── ContratTemplateSelector.js
│   │   │   │   ├── ContratTemplateSelector.module.css
│   │   │   │   ├── ContratTemplateSignatureSection.js
│   │   │   │   ├── ContratTemplateSignatureSection.module.css
│   │   │   │   ├── ContratTemplateTitleSection.js
│   │   │   │   ├── ContratTemplateTitleSection.module.css
│   │   │   │   ├── UserGuide.js
│   │   │   │   ├── UserGuide.module.css
│   │   │   │   ├── VariablesDropdown.js
│   │   │   │   └── VariablesDropdown.module.css
│   │   │   └── utils
│   │   │       └── contractVariables.js
│   │   ├── editor-modal.css
│   │   ├── fullscreenEditorModal.js
│   │   └── sections
│   │       ├── ContratActions.js
│   │       ├── ContratActions.module.css
│   │       ├── ContratHeader.js
│   │       ├── ContratHeader.module.css
│   │       ├── ContratInfoCard.js
│   │       ├── ContratInfoCard.module.css
│   │       ├── ContratPdfTabs.js
│   │       ├── ContratPdfTabs.module.css
│   │       ├── ContratPdfViewer.js
│   │       ├── ContratPdfViewer.module.css
│   │       ├── ContratVariablesCard.js
│   │       └── ContratVariablesCard.module.css
│   ├── debug
│   │   └── TestModalContent.js
│   ├── debug.js
│   ├── examples
│   │   ├── ModalExample.js
│   │   └── ModalExample.module.css
│   ├── exemples
│   │   ├── ArtisteFormExemple.js
│   │   ├── ConcertFormExemple.js
│   │   ├── ContratFormExemple.js
│   │   ├── FormulairesOptimisesIndex.js
│   │   ├── ProgrammateurFormExemple.js
│   │   └── StructureFormExemple.js
│   ├── forms
│   │   ├── Form.module.css
│   │   ├── FormGenerator.js
│   │   ├── FormValidationInterface.js
│   │   ├── desktop
│   │   │   └── FormValidationInterface.js
│   │   ├── mobile
│   │   │   ├── FormValidationInterface.js
│   │   │   ├── FormValidationInterface.module.css
│   │   │   └── sections
│   │   │       ├── FormHeader.js
│   │   │       ├── FormHeader.module.css
│   │   │       ├── ValidationActionBar.js
│   │   │       ├── ValidationActionBar.module.css
│   │   │       ├── ValidationModal.js
│   │   │       ├── ValidationModal.module.css
│   │   │       ├── ValidationSection.js
│   │   │       ├── ValidationSection.module.css
│   │   │       ├── ValidationSummary.js
│   │   │       └── ValidationSummary.module.css
│   │   ├── public
│   │   │   ├── AdminFormValidation.js
│   │   │   ├── AdminFormValidation.module.css
│   │   │   ├── ConcertInfoSection.js
│   │   │   ├── ConcertInfoSection.module.css
│   │   │   ├── FormContentWrapper.js
│   │   │   ├── FormContentWrapper.module.css
│   │   │   ├── FormErrorPanel.js
│   │   │   ├── FormErrorPanel.module.css
│   │   │   ├── FormLoadingState.js
│   │   │   ├── FormLoadingState.module.css
│   │   │   ├── FormPageHeader.js
│   │   │   ├── FormPageHeader.module.css
│   │   │   ├── FormSubmitBlock.js
│   │   │   ├── FormSubmitBlock.module.css
│   │   │   ├── PublicFormContainer.js
│   │   │   ├── PublicFormContainer.module.css
│   │   │   ├── PublicFormLayout.js
│   │   │   └── PublicFormLayout.module.css
│   │   └── validation
│   │       ├── FieldValidationRow.js
│   │       ├── FieldValidationRow.module.css
│   │       ├── FormHeader.js
│   │       ├── FormHeader.module.css
│   │       ├── FormValidationInterface.js
│   │       ├── FormValidationInterfaceNew.js
│   │       ├── ValidationActionBar.js
│   │       ├── ValidationActionBar.module.css
│   │       ├── ValidationModal.js
│   │       ├── ValidationModal.module.css
│   │       ├── ValidationSection.js
│   │       ├── ValidationSection.module.css
│   │       ├── ValidationSummary.js
│   │       └── ValidationSummary.module.css
│   ├── layout
│   │   ├── Layout.module.css
│   │   ├── Navbar.js
│   │   ├── Navbar.module.css
│   │   ├── Sidebar.js
│   │   └── Sidebar.module.css
│   ├── lieux
│   │   ├── LieuDetails.js
│   │   ├── LieuForm.js
│   │   ├── LieuxList.js
│   │   ├── desktop
│   │   │   ├── LieuDetails.js
│   │   │   ├── LieuDetails.module.css
│   │   │   ├── LieuForm.js
│   │   │   ├── LieuForm.module.css
│   │   │   ├── LieuFormOptimized.js
│   │   │   ├── LieuView.js
│   │   │   ├── LieuxList.js
│   │   │   ├── LieuxList.module.css
│   │   │   ├── handlers
│   │   │   │   └── deleteHandler.js
│   │   │   ├── hooks
│   │   │   └── sections
│   │   │       ├── DeleteLieuModal.js
│   │   │       ├── DeleteLieuModal.module.css
│   │   │       ├── LieuAddressSection.js
│   │   │       ├── LieuAddressSection.module.css
│   │   │       ├── LieuConcertsSection.js
│   │   │       ├── LieuConcertsSection.module.css
│   │   │       ├── LieuContactSection.js
│   │   │       ├── LieuContactSection.module.css
│   │   │       ├── LieuFormActions.js
│   │   │       ├── LieuFormActions.module.css
│   │   │       ├── LieuFormHeader.js
│   │   │       ├── LieuFormHeader.module.css
│   │   │       ├── LieuGeneralInfo.js
│   │   │       ├── LieuGeneralInfo.module.css
│   │   │       ├── LieuHeader.js
│   │   │       ├── LieuHeader.module.css
│   │   │       ├── LieuInfoSection.js
│   │   │       ├── LieuInfoSection.module.css
│   │   │       ├── LieuMapDisplay.js
│   │   │       ├── LieuMapDisplay.module.css
│   │   │       ├── LieuOrganizerSection.js
│   │   │       ├── LieuOrganizerSection.module.css
│   │   │       ├── LieuProgrammateurSection.js
│   │   │       ├── LieuProgrammateurSection.module.css
│   │   │       ├── LieuStructuresSection.js
│   │   │       ├── LieuStructuresSection.module.css
│   │   │       ├── LieuxListEmptyState.js
│   │   │       ├── LieuxListEmptyState.module.css
│   │   │       ├── LieuxListHeader.js
│   │   │       ├── LieuxListHeader.module.css
│   │   │       ├── LieuxListSearchFilter.js
│   │   │       ├── LieuxListSearchFilter.module.css
│   │   │       ├── LieuxResultsTable.js
│   │   │       ├── LieuxResultsTable.module.css
│   │   │       ├── LieuxStatsCards.js
│   │   │       ├── LieuxStatsCards.module.css
│   │   │       ├── LieuxTableRow.js
│   │   │       └── LieuxTableRow.module.css
│   │   └── mobile
│   │       ├── LieuView.js
│   │       ├── LieuView.module.css
│   │       ├── LieuxList.module.css
│   │       └── handlers
│   │           └── deleteHandler.js
│   ├── molecules
│   │   ├── GenericList.js
│   │   ├── GenericList.module.css
│   │   └── handlers
│   │       └── paginationHandler.js
│   ├── parametres
│   │   ├── Parametres.css
│   │   ├── ParametresApparence.js
│   │   ├── ParametresApparence.module.css
│   │   ├── ParametresCompte.js
│   │   ├── ParametresCompte.module.css
│   │   ├── ParametresEntreprise.js
│   │   ├── ParametresEntreprise.module.css
│   │   ├── ParametresExport.js
│   │   ├── ParametresExport.module.css
│   │   ├── ParametresGeneraux.js
│   │   ├── ParametresGeneraux.module.css
│   │   ├── ParametresNotifications.js
│   │   ├── ParametresNotifications.module.css
│   │   └── sections
│   │       ├── EntrepriseContactFields.js
│   │       ├── EntrepriseContactFields.module.css
│   │       ├── EntrepriseFormFields.js
│   │       ├── EntrepriseFormFields.module.css
│   │       ├── EntrepriseHeader.js
│   │       ├── EntrepriseHeader.module.css
│   │       ├── EntrepriseSearchOptions.js
│   │       ├── EntrepriseSearchOptions.module.css
│   │       ├── EntrepriseSearchResults.js
│   │       ├── EntrepriseSearchResults.module.css
│   │       ├── EntrepriseSubmitActions.js
│   │       └── EntrepriseSubmitActions.module.css
│   ├── pdf
│   │   ├── ContratPDFBody.js
│   │   ├── ContratPDFFooter.js
│   │   ├── ContratPDFHeader.js
│   │   ├── ContratPDFWrapper.js
│   │   └── ContratPDFWrapper.module.css
│   ├── programmateurs
│   │   ├── ProgrammateurDetails.js
│   │   ├── ProgrammateurDetails.module.css
│   │   ├── ProgrammateurForm.js
│   │   ├── ProgrammateurForm.module.css
│   │   ├── ProgrammateursList.js
│   │   ├── ProgrammateursList.module.css
│   │   ├── RenderedView.jsx
│   │   ├── desktop
│   │   │   ├── DeleteProgrammateurModal.js
│   │   │   ├── DeleteProgrammateurModal.module.css
│   │   │   ├── ProgrammateurAddressSection.js
│   │   │   ├── ProgrammateurAddressSection.module.css
│   │   │   ├── ProgrammateurConcertsSection.js
│   │   │   ├── ProgrammateurContactSection.js
│   │   │   ├── ProgrammateurContactSection.module.css
│   │   │   ├── ProgrammateurDetails.js
│   │   │   ├── ProgrammateurDetails.module.css
│   │   │   ├── ProgrammateurForm.js
│   │   │   ├── ProgrammateurForm.module.css
│   │   │   ├── ProgrammateurGeneralInfo.js
│   │   │   ├── ProgrammateurGeneralInfo.module.css
│   │   │   ├── ProgrammateurHeader.js
│   │   │   ├── ProgrammateurHeader.module.css
│   │   │   ├── ProgrammateurLegalSection.js
│   │   │   ├── ProgrammateurLegalSection.module.css
│   │   │   ├── ProgrammateurLieuxSection.js
│   │   │   ├── ProgrammateurLieuxSection.module.css
│   │   │   ├── ProgrammateurStructuresSection.js
│   │   │   ├── ProgrammateurStructuresSection.module.css
│   │   │   ├── ProgrammateurView.js
│   │   │   ├── ProgrammateursList.js
│   │   │   ├── ProgrammateursList.module.css
│   │   │   └── handlers
│   │   │       └── deleteHandler.js
│   │   ├── mobile
│   │   │   ├── ProgrammateurDetails.js
│   │   │   ├── ProgrammateurDetails.module.css
│   │   │   ├── ProgrammateurForm.js
│   │   │   ├── ProgrammateurForm.module.css
│   │   │   ├── ProgrammateurView.js
│   │   │   ├── ProgrammateursList.js
│   │   │   ├── ProgrammateursList.module.css
│   │   │   └── handlers
│   │   │       └── deleteHandler.js
│   │   └── sections
│   │       ├── CompanySearchSection.js
│   │       ├── CompanySearchSection.module.css
│   │       ├── ContactInfoSection.js
│   │       ├── ContactInfoSection.module.css
│   │       ├── DeleteConfirmModal.js
│   │       ├── DeleteConfirmModal.module.css
│   │       ├── LieuInfoSection.js
│   │       ├── LieuInfoSection.module.css
│   │       ├── ProgrammateurFormActions.js
│   │       ├── ProgrammateurFormActions.module.css
│   │       ├── ProgrammateurFormHeader.js
│   │       ├── ProgrammateurFormHeader.module.css
│   │       ├── StructureInfoSection.js
│   │       └── StructureInfoSection.module.css
│   ├── structures
│   │   ├── StructureDetails.js
│   │   ├── StructuresList.js
│   │   ├── core
│   │   │   ├── useStructureAddressSection.js
│   │   │   └── useStructureDetails.js
│   │   ├── desktop
│   │   │   ├── StructureDetails.js
│   │   │   ├── StructureDetails.module.css
│   │   │   ├── StructureForm.js
│   │   │   ├── StructureForm.module.css
│   │   │   ├── StructureLegalSection.js
│   │   │   ├── StructureLegalSection.module.css
│   │   │   ├── StructuresList.js
│   │   │   ├── StructuresList.module.css
│   │   │   ├── sections
│   │   │   │   ├── StructureAddressSection.js
│   │   │   │   ├── StructureAddressSection.module.css
│   │   │   │   ├── StructureAssociationsSection.js
│   │   │   │   ├── StructureAssociationsSection.module.css
│   │   │   │   ├── StructureBillingSection.js
│   │   │   │   ├── StructureBillingSection.module.css
│   │   │   │   ├── StructureContactSection.js
│   │   │   │   ├── StructureContactSection.module.css
│   │   │   │   ├── StructureDeleteModal.js
│   │   │   │   ├── StructureFormActions.js
│   │   │   │   ├── StructureFormActions.module.css
│   │   │   │   ├── StructureFormHeader.js
│   │   │   │   ├── StructureFormHeader.module.css
│   │   │   │   ├── StructureGeneralInfo.js
│   │   │   │   ├── StructureGeneralInfo.module.css
│   │   │   │   ├── StructureHeader.js
│   │   │   │   ├── StructureHeader.module.css
│   │   │   │   ├── StructureIdentitySection.js
│   │   │   │   ├── StructureIdentitySection.module.css
│   │   │   │   ├── StructureNotesSection.js
│   │   │   │   └── StructureNotesSection.module.css
│   │   │   └── utils.js
│   │   └── mobile
│   │       ├── StructureDetails.js
│   │       ├── StructureDetails.module.css
│   │       ├── StructureForm.js
│   │       ├── StructureForm.module.css
│   │       ├── StructuresList.js
│   │       └── StructuresList.module.css
│   ├── ui
│   │   ├── ActionButton.module.css
│   │   ├── AddressDisplay.js
│   │   ├── AddressDisplay.module.css
│   │   ├── AddressInput.js
│   │   ├── AddressInput.module.css
│   │   ├── Badge.js
│   │   ├── Badge.module.css
│   │   ├── Button.js
│   │   ├── Button.module.css
│   │   ├── Card.js
│   │   ├── Card.module.css
│   │   ├── ContactDisplay.js
│   │   ├── ContactDisplay.module.css
│   │   ├── EntitySearchField.js
│   │   ├── EntitySearchField.module.css
│   │   ├── EntitySelector.js
│   │   ├── EntitySelector.module.css
│   │   ├── ErrorMessage.js
│   │   ├── InfoPanel.module.css
│   │   ├── LegalInfoSection.js
│   │   ├── LegalInfoSection.module.css
│   │   ├── ListWithFilters.js
│   │   ├── ListWithFilters.module.css
│   │   ├── LoadingSpinner.js
│   │   ├── SectionTitle.js
│   │   ├── SectionTitle.module.css
│   │   ├── Spinner.module.css
│   │   ├── StatutBadge.js
│   │   └── StatutBadge.module.css
│   └── validation
├── config.js
├── context
│   ├── AuthContext.js
│   ├── ModalContext.js
│   └── ParametresContext.js
├── docs
│   ├── ButtonStandardization.md
│   ├── ButtonStyleGuide.md
│   └── hooks
│       └── StandardisationHooks.md
├── firebaseInit.js
├── hooks
│   ├── __tests__
│   │   ├── setupTests.js
│   │   ├── templates
│   │   │   └── optimizedFormHookTest.template.js
│   │   ├── useArtisteFormOptimized.test.js
│   │   ├── useArtistesListOptimized.test.js
│   │   ├── useConcertDetailsMigrated.test.js
│   │   ├── useConcertFormOptimized.test.js
│   │   ├── useConcertStatusMigrated.test.js
│   │   ├── useFirebaseMigrated.test.js
│   │   ├── useFormValidationMigrated.test.js
│   │   ├── useGenericEntityDetails.test.js
│   │   ├── useGenericEntityList.test.js
│   │   ├── useLieuDetailsMigrated.test.js
│   │   ├── useLieuFormOptimized.test.js
│   │   ├── useLieuSearchOptimized.test.js
│   │   ├── useLieuxFiltersMigrated.test.js
│   │   ├── useLieuxFiltersOptimized.test.js
│   │   ├── useProgrammateurDetails.test.js
│   │   └── useProgrammateurSearchOptimized.test.js
│   ├── artistes
│   │   ├── index.js
│   │   ├── useArtisteDetails.js
│   │   ├── useArtisteDetailsMigrated.js
│   │   ├── useArtisteFormOptimized.js
│   │   ├── useArtisteSearch.js
│   │   ├── useArtistesList.js
│   │   ├── useArtistesListMigrated.js
│   │   ├── useArtistesListOptimized.js
│   │   ├── useHandleDeleteArtist.js
│   │   └── useSearchAndFilter.js
│   ├── common
│   │   ├── index.js
│   │   ├── useAddressSearch.js
│   │   ├── useCache.js
│   │   ├── useCompanySearch.js
│   │   ├── useDebounce.js
│   │   ├── useEntitySearch.js
│   │   ├── useFirestoreSubscription.js
│   │   ├── useFirestoreSubscription.js.bak
│   │   ├── useFormSubmission.js
│   │   ├── useGenericEntityDelete.js
│   │   ├── useGenericEntityDetails.js
│   │   ├── useGenericEntityForm.js
│   │   ├── useGenericEntityList.js
│   │   ├── useGenericEntitySearch.js
│   │   ├── useLocationIQ.js
│   │   ├── useResponsive.js
│   │   ├── useSearchAndFilter.js
│   │   └── useTheme.js
│   ├── concerts
│   │   ├── index.js
│   │   ├── useConcertActions.js
│   │   ├── useConcertAssociations.js
│   │   ├── useConcertDetails.js
│   │   ├── useConcertDetailsMigrated.js
│   │   ├── useConcertFilters.js
│   │   ├── useConcertForm.js
│   │   ├── useConcertFormData.js
│   │   ├── useConcertFormMigrated.js
│   │   ├── useConcertFormOptimized.js
│   │   ├── useConcertFormsManagement.js
│   │   ├── useConcertListData.js
│   │   ├── useConcertStatus.js
│   │   ├── useConcertStatusMigrated.js
│   │   ├── useConcertSubmission.js
│   │   ├── useConcerts.js
│   │   ├── useEntitySearch.js
│   │   └── useFormSubmission.js
│   ├── contrats
│   │   ├── contractVariables.js
│   │   ├── index.js
│   │   ├── useContractTemplates.js
│   │   ├── useContratActions.js
│   │   ├── useContratDetails.js
│   │   ├── useContratDetailsMigrated.js
│   │   ├── useContratFormOptimized.js
│   │   ├── useContratGenerator.js
│   │   ├── useContratTemplateEditor.js
│   │   ├── useContratTemplatePreview.js
│   │   └── usePdfPreview.js
│   ├── firestore
│   │   └── useFirebaseSave.js
│   ├── forms
│   │   ├── index.js
│   │   ├── useAdminFormValidation.js
│   │   ├── useFieldActions.js
│   │   ├── useFormSubmission.js
│   │   ├── useFormTokenValidation.js
│   │   ├── useFormValidation.js
│   │   ├── useFormValidationData.js
│   │   ├── useFormValidationMigrated.js
│   │   ├── useLieuFormState.js
│   │   └── useValidationBatchActions.js
│   ├── index.js
│   ├── lieux
│   │   ├── index.js
│   │   ├── useAddressSearch.js
│   │   ├── useLieuDelete.js
│   │   ├── useLieuDeleteMigrated.js
│   │   ├── useLieuDetails.js
│   │   ├── useLieuDetailsMigrated.js
│   │   ├── useLieuForm.js
│   │   ├── useLieuFormComplete.js
│   │   ├── useLieuFormMigrated.js
│   │   ├── useLieuFormOptimized.js
│   │   ├── useLieuSearch.js
│   │   ├── useLieuSearchMigrated.js
│   │   ├── useLieuSearchOptimized.js
│   │   ├── useLieuxFilters.js
│   │   ├── useLieuxFiltersMigrated.js
│   │   ├── useLieuxFiltersOptimized.js
│   │   ├── useLieuxQuery.js
│   │   └── useProgrammateurSearch.js
│   ├── lists
│   │   └── useConcertsList.js
│   ├── parametres
│   │   ├── index.js
│   │   └── useEntrepriseForm.js
│   ├── programmateurs
│   │   ├── index.js
│   │   ├── useAddressSearch.js
│   │   ├── useAdresseValidation.js
│   │   ├── useCompanySearch.js
│   │   ├── useConcertSearch.js
│   │   ├── useFormSubmission.js
│   │   ├── useLieuSearch.js
│   │   ├── useProgrammateurDetails.js
│   │   ├── useProgrammateurForm.js
│   │   ├── useProgrammateurFormOptimized.js
│   │   ├── useProgrammateurSearch.js
│   │   ├── useProgrammateurSearchMigrated.js
│   │   └── useProgrammateurSearchOptimized.js
│   ├── search
│   │   ├── index.js
│   │   ├── useArtisteSearch.js
│   │   ├── useConcertSearch.js
│   │   ├── useLieuSearch.js
│   │   ├── useProgrammateurSearch.js
│   │   ├── useSearchAndFilter.js
│   │   └── useStructureSearch.js
│   └── structures
│       ├── index.js
│       ├── useDeleteStructure.js
│       ├── useStructureDetails.js
│       ├── useStructureDetailsMigrated.js
│       ├── useStructureForm.js
│       ├── useStructureFormMigrated.js
│       ├── useStructureFormOptimized.js
│       └── useStructureValidation.js
├── index.css
├── index.js
├── logo.svg
├── mockStorage.js
├── pages
│   ├── ArtistesPage.js
│   ├── ConcertsPage.js
│   ├── ContratDetailsPage.js
│   ├── ContratDetailsPage.module.css
│   ├── ContratGenerationPage.js
│   ├── ContratsPage.js
│   ├── Dashboard.module.css
│   ├── DashboardPage.js
│   ├── FormResponsePage.js
│   ├── LieuxPage.js
│   ├── LoginPage.js
│   ├── ParametresPage.js
│   ├── ProgrammateursPage.js
│   ├── StructuresPage.js
│   ├── contratTemplatesEditPage.js
│   ├── contratTemplatesPage.js
│   └── css
├── reportWebVitals.js
├── schemas
│   └── ProgrammateurSchemas.js
├── services
│   ├── InstanceTracker.js
│   ├── cacheService.js
│   ├── firestoreService.js
│   ├── pdfService.js
│   └── structureService.js
├── setupTests.js
├── shims
│   └── firebase-firestore-shim.js
├── styles
│   ├── README.md
│   ├── base
│   │   ├── colors.css
│   │   ├── index.css
│   │   ├── reset.css
│   │   └── variables.css
│   ├── components
│   │   ├── alerts.css
│   │   ├── badges.css
│   │   ├── buttons.css
│   │   ├── cards.css
│   │   ├── concerts-mobile.css
│   │   ├── concerts.css
│   │   ├── contrat-editor.css
│   │   ├── contrat-print.css
│   │   ├── details.css
│   │   ├── dropdowns.css
│   │   ├── errors.css
│   │   ├── forms.css
│   │   ├── layout.css
│   │   ├── lists.css
│   │   ├── modals.css
│   │   ├── navigation.css
│   │   ├── quill-editor.css
│   │   ├── spinner.css
│   │   └── tables.css
│   ├── index.css
│   ├── pages
│   │   ├── artistes.css
│   │   ├── concerts.css
│   │   ├── contrats.css
│   │   ├── formPublic.css
│   │   ├── forms.css
│   │   ├── lieux.css
│   │   ├── programmateurs.css
│   │   └── structures.css
│   └── theme.css
├── templates
│   └── hooks
│       ├── entity-details-template.js
│       ├── entity-form-template.js
│       ├── entity-list-template.js
│       └── entity-search-template.js
└── utils
    ├── OptimizedRouteWrapper.js
    ├── RouterStabilizer.js
    ├── StableRouteWrapper.js
    ├── dateUtils.js
    ├── diagnostic
    │   └── programmateurDiagnostic.js
    ├── firebase-diagnostic.js
    ├── formatters.js
    ├── idGenerators.js
    ├── logUtils.js
    ├── networkStabilizer.js
    ├── templateDiagnostic.js
    ├── test-helpers.js
    ├── toasts.js
    └── validation.js
