import React, { useEffect } from 'react';
import { useInteractiveTour } from '@/hooks/useInteractiveTour';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTabs } from '@/context/TabsContext';

/**
 * Composant pour gérer le tour guidé de l'application
 */
const AppTour = () => {
  const { startInteractiveTour, hasSeenTour } = useInteractiveTour();
  const location = useLocation();
  const navigate = useNavigate();
  const { openTab } = useTabs();

  // Fonction pour déployer un menu
  const expandMenu = (menuName) => {
    const menuElement = document.querySelector(`[data-menu="${menuName}"]`);
    if (menuElement) {
      menuElement.click();
      return new Promise(resolve => setTimeout(resolve, 300)); // Attendre l'animation
    }
    return Promise.resolve();
  };

  // Fonction pour simuler un clic
  const simulateClick = (selector) => {
    const element = document.querySelector(selector);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Ajouter un effet visuel
      element.style.transition = 'transform 0.3s';
      element.style.transform = 'scale(1.05)';
      setTimeout(() => {
        element.style.transform = 'scale(1)';
      }, 300);
    }
  };

  // Les étapes du tour - version simplifiée
  const tourSteps = [
    {
      intro: `
        <div style="text-align: center; padding: 20px;">
          <h2 style="margin-bottom: 20px;">👋 Bienvenue dans TourCraft !</h2>
          <p style="font-size: 16px; margin-bottom: 20px;">Découvrons ensemble comment utiliser l'application pour gérer vos concerts et événements.</p>
          <p style="color: #6c757d;">Ce tour va vous montrer les fonctionnalités principales.</p>
        </div>
      `
    },
    {
      element: '[data-menu="collaboration"]',
      intro: '<strong>🤝 Collaboration</strong><br/>Ici vous trouvez vos tâches, mails et notes. Cliquez pour ouvrir le menu.',
      position: 'right',
      beforeShow: async () => {
        await expandMenu('collaboration');
      }
    },
    {
      element: '[data-menu="contact"]',
      intro: '<strong>📋 Contacts</strong><br/>Gérez tous vos contacts : structures, personnes, salles...',
      position: 'right',
      beforeShow: async () => {
        await expandMenu('contact');
      }
    },
    {
      element: '[data-menu="booking"]',
      intro: '<strong>🎵 Booking</strong><br/>Le cœur de l\'application : créez et gérez vos dates de concerts',
      position: 'right',
      beforeShow: async () => {
        await expandMenu('booking');
      }
    },
    {
      element: '[data-menu="admin"]',
      intro: '<strong>📊 Admin</strong><br/>Tableau de bord, contrats, factures et devis',
      position: 'right', 
      beforeShow: async () => {
        await expandMenu('admin');
      }
    },
    {
      intro: `
        <div style="text-align: center; padding: 20px;">
          <h3>🎯 Le workflow TourCraft</h3>
          <div style="margin: 20px 0; text-align: left; max-width: 400px; margin: 0 auto;">
            <p><strong>1.</strong> Créez une date dans <strong>Booking > Nouvelle date</strong></p>
            <p><strong>2.</strong> Générez un devis → niveau passe automatiquement à "Option"</p>
            <p><strong>3.</strong> Envoyez le pré-contrat → niveau passe à "Confirmé"</p>
            <p><strong>4.</strong> Rédigez le contrat final</p>
            <p><strong>5.</strong> Créez la facture</p>
          </div>
          <p style="color: #28a745; font-weight: bold; margin-top: 20px;">✅ Les tâches se créent automatiquement à chaque étape !</p>
        </div>
      `
    },
    {
      intro: `
        <div style="text-align: center; padding: 20px;">
          <h3>💡 Conseils</h3>
          <div style="text-align: left; max-width: 400px; margin: 20px auto;">
            <p>• Les <strong>tâches</strong> sont dans <strong>Collaboration > Tâches</strong></p>
            <p>• Le <strong>tableau de bord</strong> est dans <strong>Admin > Tableau de bord</strong></p>
            <p>• Certaines fonctionnalités marquées 🚧 sont en développement</p>
          </div>
          <p style="margin-top: 30px;">Bonne utilisation de TourCraft ! 🎵</p>
        </div>
      `
    }
  ];

  // Fonction pour démarrer le tour manuellement
  const startManualTour = React.useCallback(() => {
    startInteractiveTour(tourSteps);
  }, [startInteractiveTour]);

  // Exposer la fonction via un événement global
  useEffect(() => {
    window.startAppTour = startManualTour;
    
    return () => {
      delete window.startAppTour;
    };
  }, [startManualTour]);

  return null; // Ce composant ne rend rien visuellement
};

export default AppTour;