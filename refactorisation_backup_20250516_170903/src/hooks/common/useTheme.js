// src/hooks/common/useTheme.js
import { useEffect } from 'react';
import { useParametres } from '@/context/ParametresContext';

/**
 * Hook pour gérer l'application du thème et des variables CSS
 * Applique les préférences de thème et d'apparence depuis le contexte des paramètres
 * @returns {null} - Ce hook ne renvoie rien
 */
const useTheme = () => {
  const { parametres } = useParametres();

  useEffect(() => {
    if (!parametres.apparence) return;

    const root = document.documentElement;
    const { theme, couleurPrincipale, taillePolicePx, compactMode } = parametres.apparence;

    // Application du thème
    document.body.setAttribute('data-theme', theme);
    if (theme === 'system') {
      const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.body.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
    }

    // Application des variables CSS
    root.style.setProperty('--tc-primary-color', couleurPrincipale);
    root.style.setProperty('--tc-font-size-base', `${taillePolicePx}px`);
    root.style.setProperty('--tc-spacing-unit', compactMode ? '0.75rem' : '1rem');

    // Gestion des animations
    if (!parametres.apparence.animations) {
      root.style.setProperty('--tc-transition-duration', '0s');
    } else {
      root.style.setProperty('--tc-transition-duration', '0.3s');
    }

    // Variables de thème sombre/clair
    const themeVariables = {
      light: {
        '--tc-bg-color': '#ffffff',
        '--tc-text-color': '#212529',
        '--tc-border-color': '#dee2e6',
        '--tc-card-bg': '#ffffff',
        '--tc-input-bg': '#ffffff',
        '--tc-hover-bg': '#f8f9fa'
      },
      dark: {
        '--tc-bg-color': '#212529',
        '--tc-text-color': '#f8f9fa',
        '--tc-border-color': '#495057',
        '--tc-card-bg': '#343a40',
        '--tc-input-bg': '#495057',
        '--tc-hover-bg': '#343a40'
      }
    };

    const currentTheme = theme === 'system' 
      ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : theme;

    Object.entries(themeVariables[currentTheme]).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });

  }, [parametres.apparence]);

  return null;
};

export default useTheme;