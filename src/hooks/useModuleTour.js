import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useInteractiveTour } from './useInteractiveTour';

/**
 * Hook pour gérer les tours contextuels par module
 * Lance automatiquement le tour approprié quand l'utilisateur navigue vers un module
 */
export const useModuleTour = () => {
  const location = useLocation();
  const { startInteractiveTour, hasSeenTour } = useInteractiveTour();
  const [hasSeenModuleTours, setHasSeenModuleTours] = useState(() => {
    const seen = localStorage.getItem('hasSeenModuleTours');
    return seen ? JSON.parse(seen) : {};
  });

  // Marquer un tour de module comme vu
  const markModuleTourAsSeen = (module) => {
    const newSeen = { ...hasSeenModuleTours, [module]: true };
    setHasSeenModuleTours(newSeen);
    localStorage.setItem('hasSeenModuleTours', JSON.stringify(newSeen));
  };

  // Tours spécifiques pour chaque module
  const moduleTours = {
    contacts: [
      {
        element: '.contacts-header',
        intro: `
          <div class="tour-welcome">
            <h3>📋 Module Contacts</h3>
            <p>Gérez tous vos contacts professionnels au même endroit.</p>
          </div>
        `,
        position: 'bottom'
      },
      {
        element: '[data-tour="contacts-add-button"]',
        intro: '<strong>Ajouter un contact</strong><br/>Créez des structures, personnes ou salles.',
        position: 'bottom'
      },
      {
        element: '[data-tour="contacts-search"]',
        intro: '<strong>Recherche avancée</strong><br/>Trouvez rapidement vos contacts avec des filtres puissants.',
        position: 'bottom'
      },
      {
        element: '[data-tour="contacts-table"]',
        intro: '<strong>Liste des contacts</strong><br/>Double-cliquez sur une ligne pour voir les détails.',
        position: 'top'
      }
    ],
    
    booking: [
      {
        element: '.dates-header',
        intro: `
          <div class="tour-welcome">
            <h3>🎵 Module Booking</h3>
            <p>Créez et gérez toutes vos dates de concerts.</p>
          </div>
        `,
        position: 'bottom'
      },
      {
        element: '[data-tour="dates-add-button"]',
        intro: '<strong>Nouvelle date</strong><br/>Créez une nouvelle date de concert.',
        position: 'bottom'
      },
      {
        element: '[data-tour="dates-filters"]',
        intro: '<strong>Filtres</strong><br/>Filtrez par statut, période, artiste...',
        position: 'bottom'
      },
      {
        element: '[data-tour="dates-table"]',
        intro: '<strong>Tableau des dates</strong><br/>Visualisez toutes vos dates avec leur statut.',
        position: 'top'
      }
    ],
    
    taches: [
      {
        element: '.taches-header',
        intro: `
          <div class="tour-welcome">
            <h3>✅ Module Tâches</h3>
            <p>Organisez votre travail avec un système de tâches intelligent.</p>
          </div>
        `,
        position: 'bottom'
      },
      {
        element: '[data-tour="taches-stats"]',
        intro: '<strong>Statistiques</strong><br/>Vue d\'ensemble de vos tâches.',
        position: 'bottom'
      },
      {
        element: '[data-tour="taches-filters"]',
        intro: '<strong>Filtres</strong><br/>Trouvez rapidement les tâches importantes.',
        position: 'bottom'
      },
      {
        element: '[data-tour="taches-table"]',
        intro: '<strong>Liste des tâches</strong><br/>Gérez vos tâches avec priorités et échéances.',
        position: 'top'
      }
    ],
    
    tableau: [
      {
        element: '.tableau-header',
        intro: `
          <div class="tour-welcome">
            <h3>📊 Tableau de bord</h3>
            <p>Vue d'ensemble de votre activité booking.</p>
          </div>
        `,
        position: 'bottom'
      },
      {
        element: '[data-tour="tableau-stats"]',
        intro: '<strong>Statistiques globales</strong><br/>Suivez vos performances en temps réel.',
        position: 'bottom'
      },
      {
        element: '[data-tour="tableau-calendar"]',
        intro: '<strong>Calendrier</strong><br/>Visualisez vos dates sur un calendrier.',
        position: 'left'
      }
    ],
    
    contrats: [
      {
        element: '.contrats-header',
        intro: `
          <div class="tour-welcome">
            <h3>📄 Module Contrats</h3>
            <p>Créez et gérez vos contrats professionnels.</p>
          </div>
        `,
        position: 'bottom'
      },
      {
        element: '[data-tour="contrats-table"]',
        intro: '<strong>Liste des contrats</strong><br/>Tous vos contrats avec leur statut.',
        position: 'top'
      },
      {
        element: '[data-tour="contrats-actions"]',
        intro: '<strong>Actions</strong><br/>Créez, éditez, finalisez vos contrats.',
        position: 'left'
      }
    ]
  };

  useEffect(() => {
    // Déterminer le module actuel basé sur l'URL
    let currentModule = null;
    
    if (location.pathname.includes('/contacts')) {
      currentModule = 'contacts';
    } else if (location.pathname.includes('/dates') || location.pathname.includes('/booking')) {
      currentModule = 'booking';
    } else if (location.pathname.includes('/taches')) {
      currentModule = 'taches';
    } else if (location.pathname.includes('/tableau-de-bord')) {
      currentModule = 'tableau';
    } else if (location.pathname.includes('/contrats')) {
      currentModule = 'contrats';
    }
    
    // Si on est sur un module et qu'on n'a pas vu son tour
    if (currentModule && moduleTours[currentModule] && !hasSeenModuleTours[currentModule]) {
      // Attendre un peu que la page se charge
      setTimeout(() => {
        startInteractiveTour(moduleTours[currentModule], {
          doneLabel: 'Compris !',
          skipLabel: 'Passer',
          onComplete: () => markModuleTourAsSeen(currentModule),
          onExit: () => markModuleTourAsSeen(currentModule)
        });
      }, 500);
    }
  }, [location.pathname]);

  // Fonction pour relancer manuellement le tour d'un module
  const startModuleTour = (module) => {
    if (moduleTours[module]) {
      startInteractiveTour(moduleTours[module], {
        doneLabel: 'Compris !',
        skipLabel: 'Passer'
      });
    }
  };

  // Réinitialiser tous les tours
  const resetAllTours = () => {
    setHasSeenModuleTours({});
    localStorage.removeItem('hasSeenModuleTours');
  };

  return {
    startModuleTour,
    resetAllTours,
    hasSeenModuleTours
  };
};