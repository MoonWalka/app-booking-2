import { useTabs } from '@/context/TabsContext';

/**
 * Hook sécurisé pour utiliser les tabs
 * Retourne des valeurs par défaut si utilisé en dehors du TabsProvider
 */
export const useTabsSafe = () => {
  try {
    return useTabs();
  } catch (error) {
    // Si on est en dehors du TabsProvider, retourner des valeurs par défaut
    return {
      tabs: [],
      activeTabId: null,
      openTab: () => console.warn('openTab non disponible en dehors du TabsProvider'),
      closeTab: () => console.warn('closeTab non disponible en dehors du TabsProvider'),
      setActiveTab: () => console.warn('setActiveTab non disponible en dehors du TabsProvider'),
      getActiveTab: () => null,
      updateTab: () => console.warn('updateTab non disponible en dehors du TabsProvider'),
      getTabById: () => null,
      clearAllTabs: () => console.warn('clearAllTabs non disponible en dehors du TabsProvider'),
    };
  }
};

export default useTabsSafe;