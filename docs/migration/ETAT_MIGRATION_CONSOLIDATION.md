# État Consolidé des Migrations et Refactorisations TourCraft

*Document créé le: 5 mai 2025*
*Dernière mise à jour: 7 mai 2025*

Ce document centralise l'état d'avancement de toutes les initiatives de refactorisation et migration en cours dans le projet TourCraft. Il a été créé suite à l'audit de documentation qui a révélé des incohérences entre différents documents de planification.

## 1. État Général des Chantiers de Refactorisation

| Initiative | État global | Prochaine échéance | Documents associés |
|------------|------------|-------------------|-------------------|
| Migration hooks génériques | ✅ **100%** | - (Terminé et archivé le 5 mai 2025) | [Journal Migration](/docs/hooks/JOURNAL_MIGRATION_HOOKS.md), [Plan Migration [ARCHIVÉ]](/docs/hooks/PLAN_MIGRATION_HOOKS_GENERIQUES.md), [Version archivée complète](/docs/archive/PLAN_MIGRATION_HOOKS_GENERIQUES_ARCHIVE.md) |
| Restructuration des hooks | 🟡 **70%** | 09/05/2025 (finalisation de la Phase 2) | [Plan Restructuration](/docs/hooks/PLAN_RESTRUCTURATION_HOOKS.md) |
| Refactorisation CSS | 🟡 **55%** | 15/05/2025 (composants médias) | [Plan CSS](/docs/css/PLAN_REFACTORISATION_CSS_PROGRESSIF.md), [Style Guide](/docs/standards/CSS_STYLE_GUIDE.md) |
| Refactorisation composants | 🟠 **30%** | 20/05/2025 (composants de formulaire) | [Plan Composants](/docs/components/PLAN_REFACTORISATION_COMPOSANTS.md) |
| Migration Firebase | 🟠 **25%** | 30/05/2025 (migration auth) | [Plan Firebase](/docs/migration/PLAN_MIGRATION_FIREBASE.md) |

## 2. Chronologie Unifiée

Cette chronologie consolidée présente les jalons passés et futurs de tous les chantiers de refactorisation:

### Jalons passés

- **28/04/2025**: ✅ Implémentation de useGenericEntityDetails
- **30/04/2025**: ✅ Implémentation de useGenericEntityList  
- **01/05/2025**: ✅ Implémentation de useGenericEntitySearch
- **03/05/2025**: ✅ Implémentation de useGenericEntityForm
- **Date antérieure**: ✅ Implémentation du hook useResponsive dans common/ (remplace useIsMobile et useResponsiveComponent)
- **05/05/2025**: ✅ Migration de useLieuDetails et useProgrammateurDetails vers hooks génériques
- **05/05/2025**: ✅ Consolidation des tests de hooks (Phase 1 de la restructuration)
- **05/05/2025**: ✅ Standardisation des exports de hooks (useLocationIQ.js, useTheme.js, etc.)
- **05/05/2025**: ✅ Migration de useConcertDetails vers hooks génériques
- **05/05/2025**: ✅ Archivage du plan de migration des hooks génériques (toutes les phases terminées)
- **06/05/2025**: ✅ Migration de useArtisteDetails vers hooks génériques
- **07/05/2025**: ✅ Migration de useStructureDetails vers hooks génériques
- **07/05/2025**: ✅ Migration de useContratDetails vers hooks génériques (en avance sur le planning)
- **07/05/2025**: ✅ Migration des composants ContratGenerator.js et ContratTemplateEditor.js vers useResponsive
- **07/05/2025**: ✅ Création du guide de migration useIsMobile → useResponsive

### Jalons actuels/imminents

- **09/05/2025**: 🔄 Finalisation de la Phase 2 de restructuration des hooks
- **10/05/2025**: 🔄 Tests unitaires pour les hooks migrés

### Jalons futurs

- **12/05/2025**: 📝 Début de la Phase 3 de restructuration des hooks (gestion hooks migrés/originaux)
- **12/05/2025**: 📝 Début de la refactorisation des composants pour utiliser les nouveaux hooks génériques
- **15/05/2025**: 📝 Phase finale de dépréciation de useIsMobile.js
- **15/05/2025**: 📝 Refactorisation CSS des composants médias
- **16/05/2025**: 📝 Finalisation de la Phase 4 de restructuration des hooks (implémentation et validation)
- **18/05/2025**: 📝 Finalisation de la Phase 5 de restructuration des hooks (nettoyage final)
- **20/05/2025**: 📝 Refactorisation des composants de formulaire
- **30/05/2025**: 📝 Migration Firebase (authentification)

## 3. Clarification des Incohérences

Les points suivants clarifient les incohérences identifiées dans l'audit de documentation:

1. **Migration des hooks génériques terminée et archivée**:
   - **État actuel**: Toutes les phases ont été terminées avec succès (100%)
   - **Date d'archivage**: 5 mai 2025
   - **Document archivé**: Plan complet disponible dans `/docs/archive/PLAN_MIGRATION_HOOKS_GENERIQUES_ARCHIVE.md`
   - **Hooks génériques implémentés**: Les quatre hooks génériques sont entièrement fonctionnels dans `src/hooks/common/`
   - **Impact**: Les développeurs doivent maintenant utiliser directement ces hooks génériques au lieu de créer de nouveaux hooks spécifiques

2. **Incohérence sur useIsMobile.js**:
   - **État actuel**: Le hook useResponsive.js qui remplace useIsMobile.js est déjà implémenté dans common/
   - **Clarification**: Les composants ContratGenerator.js et ContratTemplateEditor.js qui utilisaient useIsMobile ont été migrés le 7 mai 2025
   - **Plan de transition**: 
     * Phase immédiate (d'ici le 7 mai): ✅ Migration des composants actifs **COMPLÉTÉ**
     * Phase intermédiaire (8-15 mai): Transformation en wrapper
     * Phase finale (après 15 mai): Suppression complète
   - **Documentation**: Un guide de migration complet a été créé dans `/docs/hooks/GUIDE_MIGRATION_USEMOBILE.md`

3. **Incohérence de dates pour la Phase 1**:
   - **Clarification**: La date du 01/05/2025 dans le journal correspond à la complétion du hook useGenericEntitySearch
   - **Clarification**: La date du 11/05/2025 dans le plan correspond à la fin prévue de toutes les migrations de hooks d'entités
   - **Correctif**: Ces dates ne sont pas contradictoires mais font référence à des jalons différents

4. **Incohérence sur la refactorisation des composants mobiles**:
   - **État actuel**: La refactorisation a été reportée au 15/05/2025
   - **Justification**: Priorisation des composants de formulaire qui sont plus critiques
   - **Correctif**: Cette décision a été prise le 02/05/2025 mais n'a pas été reflétée dans tous les documents

5. **Incohérence sur la migration de useConcertDetails**:
   - **État actuel**: La migration de useConcertDetails a déjà été réalisée le 05/05/2025
   - **Clarification**: Le fichier useConcertDetailsMigrated.js existe et implémente déjà le hook générique
   - **Correctif**: Ce jalon a été déplacé de la section "imminents" à la section "passés"

6. **Incohérence sur la migration de useStructureDetails et useContratDetails**:
   - **État actuel**: Les migrations ont été complétées le 07/05/2025
   - **Clarification**: useContratDetails a été migré en avance sur le planning initial (prévu pour le 10/05/2025)
   - **Correctif**: Ces jalons ont été déplacés dans la section "passés"

## 4. Prochaines Mises à Jour

Ce document sera mis à jour chaque semaine (vendredi) pour refléter l'état le plus récent de toutes les initiatives de refactorisation. 

## 5. Processus de Mise à Jour

Pour éviter de futures incohérences, le processus suivant sera appliqué:

1. Toute modification majeure du planning sera d'abord documentée dans ce document central
2. Les plans spécifiques seront ensuite mis à jour pour refléter les changements
3. Chaque mise à jour inclura:
   - La date de modification
   - La nature du changement
   - Les documents impactés
   - Le responsable de la mise à jour

## 6. Migration de useIsMobile vers useResponsive - Feuille de Route

La migration de useIsMobile vers useResponsive est un cas particulier qui mérite une attention spéciale:

### État actuel
- Le hook useResponsive est déjà implémenté dans `/src/hooks/common/useResponsive.js`
- useIsMobile existe toujours à la racine avec un avertissement de dépréciation
- ✅ Les composants qui utilisaient encore useIsMobile (ContratGenerator.js, ContratTemplateEditor.js) ont été migrés
- ✅ Guide de migration complet avec documentation des cas d'utilisation avancés créé et mis à jour (7 mai 2025)

### Fonctionnalités additionnelles de useResponsive
- Configuration avancée (breakpoint personnalisable, force desktop mode)
- Dimensions précises de l'écran
- Chargement dynamique de composants selon le type d'appareil
- Gestion d'erreurs améliorée
- API plus riche (isMobile, dimensions, updateDimensions, checkIsMobile, getResponsiveComponent)

### Prochaines étapes
1. ✅ Migration des composants actifs (d'ici le 7 mai) **COMPLÉTÉ**
2. ✅ Documentation des cas d'utilisation avancés de useResponsive **COMPLÉTÉ**
3. 🔄 Phase de coexistence avec useIsMobile implémenté comme wrapper (8-15 mai) **EN COURS**
4. 📝 Suppression complète du hook déprécié (après le 15 mai) **PLANIFIÉ**

Pour plus de détails et des exemples de migration, consultez le [Guide de Migration useIsMobile → useResponsive](/docs/hooks/GUIDE_MIGRATION_USEMOBILE.md).

---

*Document préparé par l'équipe Documentation*
*Pour toute question: documentation@tourcraft.com*