# Composants Standardisés

*Document créé le: 16 May 2025*

Ce document liste les composants qui ont été standardisés dans le cadre de la refactorisation pour éliminer les doublons et les conflits CSS.

## Composants UI

### ActionButton
- **Emplacement standardisé**: `src/components/common/ActionButton.js`
- **Statut**: Composant principal
- **Redirection**: `src/components/ui/ActionButton.js` redirige vers ce composant

### Spinner
- **Emplacement standardisé**: `src/components/common/Spinner.js`
- **Statut**: Composant principal
- **Redirection**: `src/components/ui/LoadingSpinner.js` redirige vers ce composant

### Card
- **Emplacement standardisé**: `src/components/ui/Card.js`
- **Statut**: Composant principal
- **Redirection**: Le fichier de redirection dans common/ui a été supprimé

## Variables CSS Standardisées

Toutes les variables CSS ont été standardisées pour utiliser le préfixe `--tc-` conformément au Guide de Style CSS de TourCraft.

## Imports CSS Standardisés

Les imports de styles ont été standardisés pour utiliser des chemins absolus avec le préfixe `@/` au lieu de chemins relatifs.

## Prochaines Étapes Recommandées

1. **Réorganisation des dossiers**:
   - Créer un dossier `src/components/core/` pour les composants de base
   - Déplacer progressivement les composants UI et common vers cette nouvelle structure

2. **Standardisation complète des styles**:
   - Créer un système de design tokens centralisé
   - Migrer tous les styles vers ce système

3. **Tests d'intégration**:
   - Vérifier que toutes les redirections fonctionnent correctement
   - S'assurer que les styles sont appliqués de manière cohérente

---

*Document mis à jour manuellement le 16 mai 2025 après correction des redirections*
