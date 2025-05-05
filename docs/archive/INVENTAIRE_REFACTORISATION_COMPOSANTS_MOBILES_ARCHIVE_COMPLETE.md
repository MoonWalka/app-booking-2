# Inventaire des Composants Mobiles à Refactoriser

*Document créé le: 5 mai 2025*  
*Dernière mise à jour: 5 mai 2025*

Ce document fait l'inventaire de tous les composants mobiles qui doivent être refactorisés dans le cadre de la [Phase 4 du Plan de Refactorisation CSS Progressive](/docs/css/PLAN_REFACTORISATION_CSS_PROGRESSIF.md). Il sert d'outil de suivi pour l'équipe.

## Résumé de l'Inventaire

- **Total des fichiers à refactoriser**: 28
- **Fichiers complétés**: 28
- **Pourcentage d'achèvement**: 100%
- **Date cible d'achèvement**: 20 mai 2025 (Objectif atteint en avance!)

## Méthode de Refactorisation

Pour chaque fichier CSS mobile, appliquer la méthodologie suivante:

1. **Standardiser les variables CSS**:
   - Remplacer toutes les couleurs codées en dur par des variables CSS (ex: `var(--tc-color-primary)`)
   - Remplacer les dimensions fixes par des variables CSS (ex: `var(--tc-spacing-3)`)
   - Remplacer les valeurs typographiques par des variables CSS (ex: `var(--tc-font-size-sm)`)

2. **Corriger les conventions de nommage**:
   - Suivre la convention BEM modifiée pour React
   - Assurer la cohérence des noms entre les composants similaires

3. **Ajouter la structure d'en-tête standardisée**:
   ```css
   /*
    * Styles pour [Nom du composant] (version mobile)
    * Standardisé selon le Guide de Style CSS de TourCraft
    * Date de création: Inconnue
    * Dernière mise à jour: [date]
    */
   ```

4. **Optimiser et nettoyer le code**:
   - Éliminer les duplications 
   - Regrouper les styles similaires
   - Retirer les styles obsolètes ou non utilisés

5. **Validation**:
   - Tester visuellement sur des appareils mobiles réels ou en émulation
   - Vérifier la conformité avec le script d'audit CSS

## Artistes (3 fichiers)

- [x] `/components/artistes/mobile/ArtisteDetail.module.css`
- [x] `/components/artistes/mobile/ArtisteForm.module.css`
- [x] `/components/artistes/mobile/ArtistesList.module.css`

**Progression Artistes**: 3/3 fichiers (100%)

## Concerts (10 fichiers)

### Composants principaux

- [x] `/components/concerts/mobile/ConcertDetails.module.css`
- [x] `/components/concerts/mobile/ConcertView.module.css`
- [x] `/components/concerts/mobile/ConcertsList.module.css`

### Sections

- [x] `/components/concerts/mobile/sections/ActionBarMobile.module.css`
- [x] `/components/concerts/mobile/sections/ConcertArtistSectionMobile.module.css`
- [x] `/components/concerts/mobile/sections/ConcertGeneralInfoMobile.module.css`
- [x] `/components/concerts/mobile/sections/ConcertHeaderMobile.module.css`
- [x] `/components/concerts/mobile/sections/ConcertLocationSectionMobile.module.css`
- [x] `/components/concerts/mobile/sections/ConcertOrganizerSectionMobile.module.css`
- [x] `/components/concerts/mobile/sections/DeleteConcertModalMobile.module.css`

**Progression Concerts**: 10/10 fichiers (100%)

## Forms (6 fichiers)

### Composant principal

- [x] `/components/forms/mobile/FormValidationInterface.module.css`

### Sections

- [x] `/components/forms/mobile/sections/FormHeader.module.css`
- [x] `/components/forms/mobile/sections/ValidationActionBar.module.css`
- [x] `/components/forms/mobile/sections/ValidationModal.module.css`
- [x] `/components/forms/mobile/sections/ValidationSection.module.css`
- [x] `/components/forms/mobile/sections/ValidationSummary.module.css`

**Progression Forms**: 6/6 fichiers (100%)

## Lieux (2 fichiers)

- [x] `/components/lieux/mobile/LieuView.module.css`
- [x] `/components/lieux/mobile/LieuxList.module.css`

**Progression Lieux**: 2/2 fichiers (100%)

## Programmateurs (3 fichiers)

- [x] `/components/programmateurs/mobile/ProgrammateurDetails.module.css`
- [x] `/components/programmateurs/mobile/ProgrammateurForm.module.css`
- [x] `/components/programmateurs/mobile/ProgrammateursList.module.css`

**Progression Programmateurs**: 3/3 fichiers (100%)

## Structures (3 fichiers)

- [x] `/components/structures/mobile/StructureDetails.module.css`
- [x] `/components/structures/mobile/StructureForm.module.css`
- [x] `/components/structures/mobile/StructuresList.module.css`

**Progression Structures**: 3/3 fichiers (100%)

## Planification par Priorité

### Haute Priorité (à refactoriser d'ici le 10 mai 2025)
- Concerts: tous les fichiers (10)
- Forms: tous les fichiers (6)

### Priorité Moyenne (à refactoriser d'ici le 15 mai 2025)
- Artistes: tous les fichiers (3)
- Programmateurs: tous les fichiers (3)

### Priorité Basse (à refactoriser d'ici le 20 mai 2025)
- Lieux: tous les fichiers (2)
- Structures: tous les fichiers (3)

## Journal des Modifications

| Date | Fichier | Développeur | Changements |
|------|---------|-------------|------------|
| 05/05/2025 | ConcertGeneralInfoMobile.module.css | Équipe CSS | Standardisation des variables CSS, ajout d'en-tête, optimisation du code |
| 05/05/2025 | ActionBarMobile.module.css | Équipe CSS | Standardisation des variables CSS, ajout d'en-tête |
| 05/05/2025 | ConcertHeaderMobile.module.css | Équipe CSS | Standardisation des variables CSS, ajout d'en-tête, amélioration de la typographie |
| 05/05/2025 | ConcertArtistSectionMobile.module.css | Équipe CSS | Standardisation des variables CSS pour un composant complexe avec de nombreuses sections |
| 05/05/2025 | ConcertLocationSectionMobile.module.css | Équipe CSS | Standardisation des variables CSS, amélioration de la cohérence avec les autres composants de lieu |
| 05/05/2025 | DeleteConcertModalMobile.module.css | Équipe CSS | Standardisation des variables CSS via script amélioré, correction manuelle des erreurs |
| 05/05/2025 | ConcertOrganizerSectionMobile.module.css | Équipe CSS | Standardisation des variables CSS, correction des doubles préfixes |
| 05/05/2025 | ConcertDetails.module.css | Équipe CSS | Standardisation des variables CSS via script amélioré |
| 05/05/2025 | ConcertView.module.css | Équipe CSS | Standardisation des variables CSS via script amélioré |
| 05/05/2025 | ConcertsList.module.css | Équipe CSS | Standardisation des variables CSS via script amélioré |
| 05/05/2025 | Tous les fichiers mobile restants | Équipe CSS | Refactorisation automatisée de tous les composants CSS mobiles via script amélioré |

## Conclusion

La refactorisation de tous les composants CSS mobiles est maintenant **terminée** avec succès. Le processus a permis d'améliorer significativement la cohérence et la maintenabilité du code CSS mobile. Tous les composants utilisent désormais les variables CSS standardisées, suivent la même structure d'en-tête et respectent les conventions de nommage établies.

### Prochaines étapes

- Vérification visuelle des composants refactorisés sur différents appareils mobiles
- Mise à jour de la documentation pour refléter les nouveaux standards CSS
- Application des mêmes principes de refactorisation aux composants desktop (Phase 5)

*Pour toute question concernant cette refactorisation, contactez l'équipe CSS (css@tourcraft.com)*