import { useEffect } from 'react';
import { useParametres } from '../contexts/ParametresContext';

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
    root.style.setProperty('--primary-color', couleurPrincipale);
    root.style.setProperty('--font-size-base', `${taillePolicePx}px`);
    root.style.setProperty('--spacing-unit', compactMode ? '0.75rem' : '1rem');

    // Gestion des animations
    if (!parametres.apparence.animations) {
      root.style.setProperty('--transition-duration', '0s');
    } else {
      root.style.setProperty('--transition-duration', '0.3s');
    }

    // Variables de thème sombre/clair
    const themeVariables = {
      light: {
        '--bg-color': '#ffffff',
        '--text-color': '#212529',
        '--border-color': '#dee2e6',
        '--card-bg': '#ffffff',
        '--input-bg': '#ffffff',
        '--hover-bg': '#f8f9fa'
      },
      dark: {
        '--bg-color': '#212529',
        '--text-color': '#f8f9fa',
        '--border-color': '#495057',
        '--card-bg': '#343a40',
        '--input-bg': '#495057',
        '--hover-bg': '#343a40'
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