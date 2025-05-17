import { useState, useEffect } from 'react';

/**
 * Hook qui permet de débouncer une valeur
 * Utile pour éviter trop d'appels API lors de la saisie utilisateur
 *
 * @param {any} value - La valeur à débouncer
 * @param {number} delay - Le délai en millisecondes
 * @returns {any} La valeur debouncée
 */
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Configurer le timeout pour mettre à jour la valeur debouncée après le délai
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Annuler le timeout si la valeur change à nouveau avant la fin du délai
    // Ceci est la partie "nettoyage" de useEffect qui s'exécute avant le prochain effet
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]); // Ne recréer l'effet que si la valeur ou le délai change

  return debouncedValue;
};

export default useDebounce;