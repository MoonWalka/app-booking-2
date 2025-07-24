import { useState } from 'react';
import introJs from 'intro.js';
import 'intro.js/introjs.css';
import '../styles/tour.css'; // Nos styles après pour écraser les défauts

/**
 * Hook personnalisé pour gérer le tour guidé de l'application
 */
export const useAppTour = () => {
  const [hasSeenTour, setHasSeenTour] = useState(() => {
    // Vérifier si l'utilisateur a déjà vu le tour
    return localStorage.getItem('hasSeenTour') === 'true';
  });

  /**
   * Démarre le tour avec les étapes fournies
   * @param {Array} steps - Tableau des étapes du tour
   * @param {Object} options - Options supplémentaires pour Intro.js
   */
  const startTour = (steps, options = {}) => {
    const intro = introJs();
    
    intro.setOptions({
      steps,
      nextLabel: 'Suivant →',
      prevLabel: '← Précédent',
      skipLabel: 'Passer',
      doneLabel: 'Terminer',
      tooltipClass: 'tourcraft-tooltip',
      highlightClass: 'tourcraft-highlight',
      exitOnOverlayClick: false,
      exitOnEsc: true,
      showProgress: true,
      showBullets: true,
      scrollToElement: true,
      disableInteraction: true,
      ...options // Permet de surcharger les options par défaut
    });

    // Quand le tour est terminé
    intro.oncomplete(() => {
      localStorage.setItem('hasSeenTour', 'true');
      setHasSeenTour(true);
      console.log('Tour guidé terminé');
    });

    // Quand le tour est abandonné
    intro.onexit(() => {
      console.log('Tour guidé abandonné');
    });

    // Démarrer le tour
    intro.start();
    
    return intro; // Retourner l'instance pour un contrôle plus fin si nécessaire
  };

  /**
   * Réinitialise le statut du tour (pour les tests ou réafficher)
   */
  const resetTour = () => {
    localStorage.removeItem('hasSeenTour');
    setHasSeenTour(false);
  };

  /**
   * Marque le tour comme vu sans le lancer
   */
  const markTourAsSeen = () => {
    localStorage.setItem('hasSeenTour', 'true');
    setHasSeenTour(true);
  };

  return {
    startTour,
    hasSeenTour,
    resetTour,
    markTourAsSeen
  };
};