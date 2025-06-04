/**
 * @deprecated Ce hook est une redirection vers la version centralisée.
 * Veuillez utiliser directement l'importation depuis @/hooks/common:
 * import { useAddressSearch } from '@/hooks/common';
 * 
 * Cette redirection sera supprimée dans une future version (après le 6 novembre 2025).
 */

// Import de la version centralisée
import useAddressSearch from '@/hooks/common/useAddressSearch';

// Export pour maintenir la compatibilité avec le code existant
export default useAddressSearch;
