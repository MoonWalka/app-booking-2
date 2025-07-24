import { useState, useCallback } from 'react';
import introJs from 'intro.js';
import 'intro.js/introjs.css';
import '../styles/tour.css'; // Nos styles après pour écraser les défauts

/**
 * Hook pour gérer un tour guidé interactif avec actions
 */
export const useInteractiveTour = () => {
  const [tourInstance, setTourInstance] = useState(null);
  const [isRunning, setIsRunning] = useState(false);

  /**
   * Démarre le tour interactif
   * @param {Array} steps - Tableau des étapes avec actions
   * @param {Object} options - Options Intro.js
   */
  const startInteractiveTour = useCallback((steps, options = {}) => {
    const intro = introJs();
    
    // Configuration par défaut
    intro.setOptions({
      steps: steps.map((step, index) => ({
        ...step,
        // Ajouter un identifiant unique pour chaque étape
        step: index + 1
      })),
      nextLabel: 'Suivant →',
      prevLabel: '← Précédent',
      skipLabel: 'Passer le tour',
      doneLabel: 'Terminer',
      tooltipClass: 'tourcraft-tooltip',
      highlightClass: 'tourcraft-highlight',
      exitOnOverlayClick: false,
      exitOnEsc: true,
      showProgress: true,
      showBullets: true,
      scrollToElement: true,
      disableInteraction: false, // Permettre l'interaction
      ...options
    });

    // Événements du tour
    intro.onbeforechange(async function(targetElement) {
      const currentStep = this._currentStep;
      const stepData = steps[currentStep];
      
      // Exécuter l'action avant de montrer l'étape
      if (stepData && stepData.beforeShow) {
        try {
          await stepData.beforeShow();
        } catch (error) {
          console.error('Erreur dans beforeShow:', error);
        }
      }
    });

    intro.onafterchange(function(targetElement) {
      const currentStep = this._currentStep;
      const stepData = steps[currentStep];
      
      // Exécuter l'action après avoir montré l'étape
      if (stepData && stepData.afterShow) {
        setTimeout(() => {
          try {
            stepData.afterShow();
          } catch (error) {
            console.error('Erreur dans afterShow:', error);
          }
        }, 100);
      }
    });

    intro.oncomplete(() => {
      localStorage.setItem('hasSeenInteractiveTour', 'true');
      setIsRunning(false);
      setTourInstance(null);
      console.log('Tour interactif terminé');
    });

    intro.onexit(() => {
      setIsRunning(false);
      setTourInstance(null);
      console.log('Tour interactif quitté');
    });

    // Démarrer le tour
    intro.start();
    setTourInstance(intro);
    setIsRunning(true);
    
    return intro;
  }, []);

  /**
   * Arrête le tour en cours
   */
  const stopTour = useCallback(() => {
    if (tourInstance) {
      tourInstance.exit();
      setTourInstance(null);
      setIsRunning(false);
    }
  }, [tourInstance]);

  /**
   * Passe à l'étape suivante
   */
  const nextStep = useCallback(() => {
    if (tourInstance) {
      tourInstance.nextStep();
    }
  }, [tourInstance]);

  /**
   * Retourne à l'étape précédente
   */
  const previousStep = useCallback(() => {
    if (tourInstance) {
      tourInstance.previousStep();
    }
  }, [tourInstance]);

  /**
   * Va à une étape spécifique
   */
  const goToStep = useCallback((stepNumber) => {
    if (tourInstance) {
      tourInstance.goToStep(stepNumber);
    }
  }, [tourInstance]);

  return {
    startInteractiveTour,
    stopTour,
    nextStep,
    previousStep,
    goToStep,
    isRunning,
    hasSeenTour: localStorage.getItem('hasSeenInteractiveTour') === 'true',
    resetTour: () => localStorage.removeItem('hasSeenInteractiveTour')
  };
};