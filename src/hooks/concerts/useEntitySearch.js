/**
 * @deprecated Ce hook est une redirection vers la version centralisée.
 * Veuillez utiliser directement l'importation depuis @/hooks/common:
 * import { useEntitySearch } from '@/hooks/common';
 * 
 * Cette redirection sera supprimée dans une future version (après le 6 novembre 2025).
 */

// Import de la version centralisée
import { useEntitySearch } from '@/hooks/common/useEntitySearch';

// Export pour maintenir la compatibilité avec le code existant
export default useEntitySearch;
