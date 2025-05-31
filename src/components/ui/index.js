/**
 * Exports centralisés des composants UI TourCraft
 * Point d'entrée principal pour tous les composants UI réutilisables
 */

// Composants de base
export { default as Button } from './Button';
export { default as Card } from './Card';
export { default as Badge } from './Badge';

// Composants de formulaire
export { default as FormField } from './FormField';
export { default as AddressInput } from './AddressInput';
export { default as AddressDisplay } from './AddressDisplay';
export { default as EntitySearchField } from './EntitySearchField';
export { default as EntitySelector } from './EntitySelector';

// Composants de layout
export { default as FlexContainer } from './FlexContainer';
export { default as SectionTitle } from './SectionTitle';
export { default as Table } from './Table';

// Composants d'affichage
export { default as ContactDisplay } from './ContactDisplay';
export { default as StatutBadge } from './StatutBadge';
export { default as LegalInfoSection } from './LegalInfoSection';
export { default as LoadingSpinner } from './LoadingSpinner';

// Nouveaux composants génériques centralisés
export { default as ConfirmationModal } from './ConfirmationModal';
export { default as EntityListHeader } from './EntityListHeader';
export { default as EntityEmptyState } from './EntityEmptyState';
export { default as ListWithFilters } from './ListWithFilters';

// Composants d'interaction
export { default as AddButton } from './AddButton';
export { default as ActionButton } from '../common/ActionButton';
export { default as Alert } from './Alert';
export { default as ErrorMessage } from './ErrorMessage';