# Plan de correction CSS prioritaire

*Date de génération: 5/17/2025, 3:55:43 AM*

## Ordre de priorité des composants à corriger

### Critères de priorisation

- Les composants sont classés par priorité de 1 à 4 (4 étant la plus haute priorité)
- Les composants partagés (UI, common, base) reçoivent un bonus de priorité
- Les fichiers avec de nombreux problèmes CSS et Bootstrap sont priorisés

### Priorité 4 (Critique - Composants partagés)

*Aucun composant de priorité 4*

### Priorité 3 (Haute)

- **src/pages/DashboardPage.js** - 0 problèmes CSS, 0 problèmes Bootstrap 
- **src/components/exemples/ProgrammateurFormExemple.js** - 0 problèmes CSS, 0 problèmes Bootstrap 
- **src/components/exemples/ArtisteFormExemple.js** - 0 problèmes CSS, 0 problèmes Bootstrap 
- **src/components/concerts/desktop/ConcertOrganizerSection.js** - 0 problèmes CSS, 0 problèmes Bootstrap 
- **src/components/concerts/desktop/ConcertGeneralInfo.js** - 0 problèmes CSS, 0 problèmes Bootstrap 
- **src/components/concerts/desktop/ConcertStructureSection.js** - 0 problèmes CSS, 0 problèmes Bootstrap 
- **src/components/exemples/FormulairesOptimisesIndex.js** - 0 problèmes CSS, 0 problèmes Bootstrap 
- **src/components/concerts/desktop/ConcertLocationSection.js** - 0 problèmes CSS, 0 problèmes Bootstrap 
- **src/components/concerts/desktop/ConcertArtistSection.js** - 0 problèmes CSS, 0 problèmes Bootstrap 
- **src/components/common/layout/MobileLayout.js** - 0 problèmes CSS, 0 problèmes Bootstrap (Partagé)
- **src/components/ui/LegalInfoSection.js** - 0 problèmes CSS, 0 problèmes Bootstrap (Partagé)

### Priorité 2 (Moyenne)

- **src/components/programmateurs/desktop/ProgrammateurContactSection.js** - 0 problèmes CSS, 0 problèmes Bootstrap 
- **src/components/lieux/desktop/sections/LieuOrganizerSection.js** - 0 problèmes CSS, 0 problèmes Bootstrap 
- **src/components/forms/FormGenerator.js** - 0 problèmes CSS, 0 problèmes Bootstrap 
- **src/components/programmateurs/desktop/ProgrammateurAddressSection.js** - 0 problèmes CSS, 0 problèmes Bootstrap 
- **src/components/lieux/desktop/sections/LieuAddressSection.js** - 0 problèmes CSS, 0 problèmes Bootstrap 
- **src/components/forms/validation/FormValidationInterfaceNew.js** - 0 problèmes CSS, 0 problèmes Bootstrap 
- **src/components/forms/validation/FormValidationInterface.js** - 0 problèmes CSS, 0 problèmes Bootstrap 
- **src/components/contrats/desktop/sections/ContratGenerationActions.js** - 0 problèmes CSS, 0 problèmes Bootstrap 
- **src/components/artistes/desktop/ArtisteForm.js** - 0 problèmes CSS, 0 problèmes Bootstrap 
- **src/pages/LoginPage.js** - 0 problèmes CSS, 0 problèmes Bootstrap 
- **src/components/structures/desktop/StructuresList.js** - 0 problèmes CSS, 0 problèmes Bootstrap 
- **src/components/programmateurs/mobile/ProgrammateurForm.js** - 0 problèmes CSS, 0 problèmes Bootstrap 
- **src/components/programmateurs/desktop/DeleteProgrammateurModal.js** - 0 problèmes CSS, 0 problèmes Bootstrap 
- **src/components/lieux/desktop/sections/LieuStructuresSection.js** - 0 problèmes CSS, 0 problèmes Bootstrap 
- **src/components/lieux/desktop/sections/LieuInfoSection.js** - 0 problèmes CSS, 0 problèmes Bootstrap 
- **src/components/lieux/desktop/sections/LieuContactSection.js** - 0 problèmes CSS, 0 problèmes Bootstrap 
- **src/components/forms/public/AdminFormValidation.js** - 0 problèmes CSS, 0 problèmes Bootstrap 
- **src/components/contrats/sections/ContratPdfViewer.js** - 0 problèmes CSS, 0 problèmes Bootstrap 
- **src/pages/contratTemplatesEditPage.js** - 0 problèmes CSS, 0 problèmes Bootstrap 
- **src/components/structures/desktop/sections/StructureAssociationsSection.js** - 0 problèmes CSS, 0 problèmes Bootstrap 
- **src/components/programmateurs/RenderedView.jsx** - 0 problèmes CSS, 0 problèmes Bootstrap 
- **src/components/parametres/sections/EntrepriseSearchResults.js** - 0 problèmes CSS, 0 problèmes Bootstrap 
- **src/components/molecules/GenericList.js** - 0 problèmes CSS, 0 problèmes Bootstrap 
- **src/components/lieux/mobile/LieuView.js** - 0 problèmes CSS, 0 problèmes Bootstrap 
- **src/components/lieux/desktop/LieuView.js** - 0 problèmes CSS, 0 problèmes Bootstrap 
- **src/components/lieux/desktop/LieuFormOptimized.js** - 0 problèmes CSS, 0 problèmes Bootstrap 
- **src/components/lieux/desktop/LieuDetails.js** - 0 problèmes CSS, 0 problèmes Bootstrap 
- **src/components/lieux/desktop/sections/LieuGeneralInfo.js** - 0 problèmes CSS, 0 problèmes Bootstrap 
- **src/components/lieux/desktop/sections/LieuConcertsSection.js** - 0 problèmes CSS, 0 problèmes Bootstrap 
- **src/components/forms/public/FormSubmitBlock.js** - 0 problèmes CSS, 0 problèmes Bootstrap 
- **src/components/debug/PerformanceMonitor.js** - 0 problèmes CSS, 0 problèmes Bootstrap 
- **src/components/contrats/sections/ContratPdfTabs.js** - 0 problèmes CSS, 0 problèmes Bootstrap 
- **src/components/contrats/desktop/sections/ContratTemplateHeaderSection.js** - 0 problèmes CSS, 0 problèmes Bootstrap 
- **src/components/contrats/desktop/sections/ContratTemplateFooterSection.js** - 0 problèmes CSS, 0 problèmes Bootstrap 
- **src/components/concerts/desktop/DeleteConcertModal.js** - 0 problèmes CSS, 0 problèmes Bootstrap 

### Priorité 1 (Basse)

*Aucun composant de priorité 1*

## Instructions pour la correction

### Correction des problèmes CSS

1. Remplacer les valeurs codées en dur par des variables CSS avec préfixe `--tc-`
2. Standardiser les breakpoints selon les valeurs dans `src/styles/mixins/breakpoints.css`
3. Utiliser les utilitaires CSS existants plutôt que de créer des styles dupliqués

### Correction des problèmes Bootstrap

1. Remplacer les classes `btn-*` par `tc-btn-*`
2. Remplacer les classes `card` par le composant `Card` standardisé
3. Évaluer et remplacer les autres composants Bootstrap par leurs équivalents TourCraft

### Processus de correction

1. Créer une branche de fonctionnalité pour chaque composant ou groupe de composants liés
2. Exécuter les outils de correction automatique quand c'est possible :
   - `npm run audit:css:fix` pour ajouter automatiquement le préfixe `--tc-`
   - `npm run audit:bootstrap:fix` pour corriger automatiquement certaines classes Bootstrap
3. Vérifier visuellement les corrections dans l'environnement de test
4. Soumettre une pull request pour chaque groupe de corrections
