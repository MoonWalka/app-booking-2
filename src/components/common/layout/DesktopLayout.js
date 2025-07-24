// src/components/common/layout/DesktopLayout.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTabs } from '@/context/TabsContext';
import TabManagerProduction from '@/components/tabs/TabManagerProduction';
import Button from '@ui/Button';
import { useAuth } from '@/context/AuthContext.js';
import { useResponsive } from '@/hooks/common';
import { EntrepriseSelector } from '@/components/entreprise';
import { useContactModals } from '@/context/ContactModalsContext';
import ContactModalsContainer from '@/components/contacts/modal/ContactModalsContainer';
import AppTour from '@/components/tour/AppTour';
import { useInteractiveTour } from '@/hooks/useInteractiveTour';
import { useModuleTour } from '@/hooks/useModuleTour';
import { APP_NAME } from '@/config.js';
import layoutStyles from '@/components/layout/Layout.module.css';
import sidebarStyles from '@/components/layout/Sidebar.module.css';
import { searchService } from '@/services/searchService';
import { selectionsService } from '@/services/selectionsService';
import { useEntreprise } from '@/context/EntrepriseContext';
import useInvitationNotifications from '@/hooks/useInvitationNotifications';
import usePermissions from '@/hooks/usePermissions';

function DesktopLayout({ children }) {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { isMobile } = useResponsive();
  const { currentEntreprise } = useEntreprise();
  const { canEditSettings } = usePermissions();
  const { resetTour } = useInteractiveTour();
  const { resetAllTours } = useModuleTour();
  const { 
    openContactsListTab,
    openDatesListTab,
    openPublicationsListTab,
    openLieuxListTab,
    openStructuresListTab,
    openDebugToolsTab,
    openTab,
    getActiveTab
  } = useTabs();
  
  const { 
    openStructureModal,
    openPersonneModal
  } = useContactModals();
  
  // État pour stocker les recherches sauvegardées
  const [savedSearches, setSavedSearches] = useState([]);
  // État pour stocker les sélections sauvegardées
  const [savedSelections, setSavedSelections] = useState([]);
  
  // État pour la sidebar mobile (hamburger menu)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  
  // État pour gérer l'expansion des menus
  const [expandedMenu, setExpandedMenu] = useState(null);
  
  // Hook pour vérifier les invitations en attente
  const { pendingInvitations } = useInvitationNotifications();
  // État pour gérer l'expansion des sous-sous-menus
  const [expandedSubMenu, setExpandedSubMenu] = useState(null);
  // État pour le menu utilisateur
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  // État pour savoir si le dropdown organisation est ouvert
  const [isOrgDropdownOpen, setIsOrgDropdownOpen] = useState(false);
  // État pour stocker l'historique du menu précédent
  const [previousMenu, setPreviousMenu] = useState(null);
  // État pour le menu contextuel
  const [contextMenu, setContextMenu] = useState(null);

  // Effet pour fermer les panneaux lors du changement de taille d'écran
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) { // Breakpoint mobile
        setExpandedMenu(null);
        setIsUserMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Effet pour fermer le menu contextuel lors d'un clic à l'extérieur
  useEffect(() => {
    const handleClickOutside = () => {
      if (contextMenu) {
        setContextMenu(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [contextMenu]);

  // Effet pour tracer les changements de contextMenu
  useEffect(() => {
    console.log('🖱️ contextMenu a changé:', contextMenu);
  }, [contextMenu]);

  // Effet pour capturer les clics droits globalement (pour debug)
  useEffect(() => {
    const handleGlobalContextMenu = (e) => {
      console.log('🖱️ GLOBAL: Événement contextmenu capturé!', e.target);
      console.log('🖱️ GLOBAL: Hiérarchie:', {
        target: e.target,
        tagName: e.target.tagName,
        className: e.target.className,
        textContent: e.target.textContent
      });
      
      const target = e.target;
      // Essayer plusieurs sélecteurs pour trouver le bouton
      let button = target.closest('button[data-item-type]');
      if (!button) {
        button = target.closest('button');
        console.log('🖱️ GLOBAL: Bouton trouvé sans data-item-type:', button);
      }
      
      // Vérifier si on est dans un sous-menu de recherches/sélections
      const subMenu = target.closest('.subMenu, [class*="subMenu"]');
      const menuPanel = target.closest('[data-menu-id="mes-recherches"], [data-menu-id="mes-selections"]');
      
      console.log('🖱️ GLOBAL: Debug DOM:', {
        button: button,
        subMenu: subMenu,
        menuPanel: menuPanel,
        buttonClassName: button?.className,
        buttonAttributes: button ? Array.from(button.attributes).map(a => `${a.name}="${a.value}"`) : null
      });
      
      if (button) {
        const itemType = button.getAttribute('data-item-type');
        const buttonText = button.textContent;
        const isSearchByText = buttonText.includes('🔍');
        const isSelectionByText = buttonText.includes('📌');
        
        console.log('🖱️ GLOBAL: Analyse du bouton:', {
          itemType: itemType,
          buttonText: buttonText,
          isSearchByText: isSearchByText,
          isSelectionByText: isSelectionByText
        });
        
        if (itemType === 'search' || itemType === 'selection' || isSearchByText || isSelectionByText) {
          console.log('🖱️ GLOBAL: C\'est une recherche/sélection!');
          // Forcer le preventDefault dans tous les cas
          e.preventDefault();
          e.stopPropagation();
          console.log('🖱️ GLOBAL: preventDefault appelé dans le handler global');
          
          // Créer et afficher le menu contextuel manuellement si nécessaire
          if (isSearchByText || itemType === 'search') {
            const searchName = buttonText.replace('🔍 ', '');
            console.log('🖱️ GLOBAL: Affichage du menu pour recherche:', searchName);
            
            // Essayer de récupérer l'ID depuis les données ou depuis le texte du bouton
            let searchId = button.getAttribute('data-search-id');
            
            // Si pas d'ID dans l'attribut, chercher dans les recherches sauvegardées
            if (!searchId || searchId === 'unknown') {
              const savedSearch = savedSearches.find(s => s.name === searchName);
              searchId = savedSearch?.id || 'unknown';
              console.log('🖱️ GLOBAL: ID trouvé dans savedSearches:', searchId);
            }
            
            setContextMenu({
              x: e.clientX,
              y: e.clientY,
              type: 'search',
              searchId: searchId,
              searchName: searchName
            });
          }
        }
      } else {
        console.log('🖱️ GLOBAL: Aucun bouton trouvé dans la hiérarchie');
      }
    };
    
    // Ajout d'un test immédiat
    console.log('🖱️ GLOBAL: Ajout du listener contextmenu global');
    document.addEventListener('contextmenu', handleGlobalContextMenu, true);
    
    // Test pour vérifier que le listener est bien ajouté
    setTimeout(() => {
      console.log('🖱️ GLOBAL: Le listener contextmenu devrait être actif maintenant');
    }, 1000);
    
    return () => {
      console.log('🖱️ GLOBAL: Suppression du listener contextmenu global');
      document.removeEventListener('contextmenu', handleGlobalContextMenu, true);
    };
  }, [savedSearches]);

  // Effet pour charger les recherches sauvegardées
  useEffect(() => {
    const loadSavedSearches = async () => {
      if (!currentUser?.uid || !currentEntreprise?.id) {
        console.log('🔍 DesktopLayout - Pas de user/entreprise pour charger les recherches');
        return;
      }
      
      console.log('🔍 DesktopLayout - Chargement des recherches sauvegardées...');
      try {
        const searches = await searchService.loadSavedSearches({
          entrepriseId: currentEntreprise.id,
          userId: currentUser.uid
        });
        console.log('🔍 DesktopLayout - Recherches reçues:', searches);
        setSavedSearches(searches);
      } catch (error) {
        console.error('🔍 DesktopLayout - Erreur lors du chargement des recherches:', error);
      }
    };

    loadSavedSearches();
  }, [currentUser, currentEntreprise]);

  // Effet pour charger les sélections sauvegardées
  useEffect(() => {
    const loadSavedSelections = async () => {
      if (!currentUser?.uid || !currentEntreprise?.id) {
        console.log('📌 DesktopLayout - Pas de user/entreprise pour charger les sélections');
        return;
      }
      
      console.log('📌 DesktopLayout - Chargement des sélections sauvegardées...');
      try {
        const result = await selectionsService.getSelectionsByType('contacts', currentUser.uid, currentEntreprise.id);
        if (result.success) {
          console.log('📌 DesktopLayout - Sélections chargées:', result.data.length);
          setSavedSelections(result.data);
        }
      } catch (error) {
        console.error('📌 DesktopLayout - Erreur lors du chargement des sélections:', error);
      }
    };

    loadSavedSelections();
  }, [currentUser, currentEntreprise]);

  // Effet pour écouter les événements de rafraîchissement
  useEffect(() => {
    const handleRefreshSearches = () => {
      console.log('🔄 DesktopLayout - Événement de rafraîchissement reçu');
      if (currentUser?.uid && currentEntreprise?.id) {
        searchService.loadSavedSearches({
          entrepriseId: currentEntreprise.id,
          userId: currentUser.uid
        }).then(searches => {
          console.log('🔄 DesktopLayout - Recherches rafraîchies:', searches.length);
          setSavedSearches(searches);
        }).catch(error => {
          console.error('🔄 DesktopLayout - Erreur lors du rafraîchissement:', error);
        });
      }
    };

    const handleRefreshSelections = () => {
      console.log('🔄 DesktopLayout - Événement de rafraîchissement des sélections reçu');
      if (currentUser?.uid && currentEntreprise?.id) {
        selectionsService.getSelectionsByType('contacts', currentUser.uid, currentEntreprise.id).then(result => {
          if (result.success) {
            console.log('🔄 DesktopLayout - Sélections rafraîchies:', result.data.length);
            setSavedSelections(result.data);
          }
        }).catch(error => {
          console.error('🔄 DesktopLayout - Erreur lors du rafraîchissement des sélections:', error);
        });
      }
    };

    window.addEventListener('refresh-saved-searches', handleRefreshSearches);
    window.addEventListener('refresh-saved-selections', handleRefreshSelections);
    
    return () => {
      window.removeEventListener('refresh-saved-searches', handleRefreshSearches);
      window.removeEventListener('refresh-saved-selections', handleRefreshSelections);
    };
  }, [currentUser, currentEntreprise]);

  // Fermer le menu contextuel au clic ailleurs
  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    const handleEscape = (e) => {
      if (e.key === 'Escape') setContextMenu(null);
    };
    
    if (contextMenu) {
      document.addEventListener('click', handleClick);
      document.addEventListener('keydown', handleEscape);
      return () => {
        document.removeEventListener('click', handleClick);
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [contextMenu]);

  // Fonction pour supprimer une recherche sauvegardée
  const handleDeleteSearch = async (searchId, searchName) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer la recherche "${searchName}" ?`)) {
      try {
        await searchService.deleteSearch(searchId);
        console.log('🗑️ Recherche supprimée:', searchId);
        
        // Rafraîchir la liste des recherches
        if (currentUser?.uid && currentEntreprise?.id) {
          const searches = await searchService.loadSavedSearches({
            entrepriseId: currentEntreprise.id,
            userId: currentUser.uid
          });
          setSavedSearches(searches);
          
          // Forcer la fermeture et réouverture du menu pour le rafraîchir visuellement
          if (expandedMenu === 'contact') {
            setExpandedMenu(null);
            setTimeout(() => {
              setExpandedMenu('contact');
            }, 50);
          }
        }
        
        alert('Recherche supprimée avec succès');
        
        // Déclencher l'événement pour rafraîchir les autres composants
        window.dispatchEvent(new Event('refresh-saved-searches'));
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        alert('Erreur lors de la suppression de la recherche');
      }
    }
    setContextMenu(null);
  };

  const handleDeleteSelection = async (selectionId, selectionName) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer la sélection "${selectionName}" ?`)) {
      try {
        const result = await selectionsService.deleteSelection(selectionId);
        if (result.success) {
          console.log('🗑️ Sélection supprimée:', selectionId);
          
          // Rafraîchir la liste des sélections
          if (currentUser?.uid && currentEntreprise?.id) {
            const selectionsResult = await selectionsService.getSelectionsByType('contacts', currentUser.uid, currentEntreprise.id);
            if (selectionsResult.success) {
              setSavedSelections(selectionsResult.data);
            }
          }
          
          alert('Sélection supprimée avec succès');
        } else {
          alert('Erreur lors de la suppression de la sélection');
        }
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        alert('Erreur lors de la suppression de la sélection');
      }
    }
    setContextMenu(null);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  // Navigation adaptée pour le système d'onglets
  const handleNavigation = (item) => {
    console.log('[DesktopLayout] handleNavigation appelé avec:', item);
    
    // Si c'est une recherche sauvegardée
    if (item.isSearch && item.searchData) {
      // Les recherches sauvegardées contiennent toujours des résultats maintenant
      openTab({
        id: `saved-search-results-${item.searchData.id}`,
        title: item.searchData.name,
        path: `/contacts/recherche-sauvegardee/${item.searchData.id}`,
        component: 'SavedSearchResultsPage',
        icon: 'bi-search',
        params: { savedSearch: item.searchData }
      });
      return;
    }
    
    // Si c'est une sélection sauvegardée
    if (item.isSelection && item.selectionData) {
      openTab({
        id: `saved-selection-results-${item.selectionData.id}`,
        title: item.selectionData.nom,
        path: `/contacts/selection-sauvegardee/${item.selectionData.id}`,
        component: 'SavedSelectionResultsPage',
        icon: 'bi-check2-square',
        params: { savedSelection: item.selectionData }
      });
      return;
    }
    
    // Vérifier si on est déjà sur cet onglet pour éviter un rechargement inutile
    const activeTab = getActiveTab();
    
    // Pour les onglets, on ne change pas l'URL - on utilise seulement le système d'onglets
    // Cela évite tout rechargement/clignotement
    
    // Pour les éléments avec des actions spéciales
    switch (item.to) {
      case '/':
        // Dashboard - activer l'onglet existant
        openTab({
          id: 'dashboard',
          title: 'Dashboard',
          path: '/',
          component: 'DashboardPage',
          icon: 'bi-speedometer2',
          closable: false
        });
        break;
      case '/contacts':
        openContactsListTab();
        break;
      case '/dates':
        console.log('[DesktopLayout] Route /dates détectée, appel de openDatesListTab()');
        openDatesListTab();
        break;
      case '/publications':
        openPublicationsListTab();
        break;
      // OBSOLÈTE - Remplacé par /salles et /festivals/dates
      // case '/lieux':
      //   openLieuxListTab();
      //   break;
      case '/structures':
        openStructuresListTab();
        break;
      case '/debug-tools':
        openDebugToolsTab();
        break;
      case '/inventaire-pages':
        // Page spéciale hors système d'onglets - garde navigate()
        navigate('/inventaire-pages');
        break;
      case '/outils/pdf-viewer-demo':
        openTab({
          id: 'pdf-viewer-demo',
          title: 'Demo PDF Viewer',
          path: '/outils/pdf-viewer-demo',
          component: 'ContratPdfViewerExample',
          icon: 'bi-file-pdf'
        });
        break;
      case '/booking/parametrage':
        openTab({
          id: 'booking-parametrage',
          title: 'Paramétrage Booking',
          path: '/booking/parametrage',
          component: 'BookingParametragePage',
          icon: 'bi-gear-fill'
        });
        break;
      case '/projets':
        openTab({
          id: 'projets-list',
          title: 'Projets',
          path: '/projets',
          component: 'ProjetsPage',
          icon: 'bi-folder'
        });
        break;
      case '/salles':
        openTab({
          id: 'salles-list',
          title: 'Salles',
          path: '/salles',
          component: 'SallesPage',
          icon: 'bi-building'
        });
        break;
      case '/contrats':
        openTab({
          id: 'contrats-list',
          title: 'Contrats',
          path: '/contrats',
          component: 'ContratsPage',
          icon: 'bi-file-earmark-text'
        });
        break;
      case '/factures':
        openTab({
          id: 'factures-list',
          title: 'Factures',
          path: '/factures',
          component: 'FacturesPage',
          icon: 'bi-receipt'
        });
        break;
      case '/devis':
        openTab({
          id: 'devis-list',
          title: 'Devis',
          path: '/devis',
          component: 'DevisPage',
          icon: 'bi-file-earmark-plus'
        });
        break;
      case '/mails':
        openTab({
          id: 'mails',
          title: 'Échanges de mails',
          path: '/mails',
          component: 'MailsPage',
          icon: 'bi-envelope'
        });
        break;
      case '/taches':
        openTab({
          id: 'taches',
          title: 'Tâches',
          path: '/taches',
          component: 'TachesPage',
          icon: 'bi-check2-square'
        });
        break;
      case '/notes':
        openTab({
          id: 'notes',
          title: 'Notes & Commentaires',
          path: '/notes',
          component: 'NotesPage',
          icon: 'bi-journal-text'
        });
        break;
      case '/collaboration/parametrage':
      case '/collaboration/parametrage/entreprise':
      case '/collaboration/parametrage/collaborateurs':
      case '/collaboration/parametrage/invitations':
      case '/collaboration/parametrage/taches':
      case '/collaboration/parametrage/permissions':
        openTab({
          id: 'collaboration-parametrage',
          title: 'Paramétrage Collaboration',
          path: '/collaboration/parametrage',
          component: 'CollaborationParametragePage',
          icon: 'bi-gear'
        });
        break;
      case '/admin/parametrage':
        openTab({
          id: 'admin-parametrage',
          title: 'Paramétrage Admin',
          path: '/admin/parametrage',
          component: 'AdminParametragePage',
          icon: 'bi-gear-fill'
        });
        break;
      case '/contact/parametrage':
        openTab({
          id: 'contact-parametrage',
          title: 'Paramétrage Contact',
          path: '/contact/parametrage',
          component: 'ContactParametragePage',
          icon: 'bi-gear-fill'
        });
        break;
      case '/contacts/nouveau/structure':
        // Ouvrir directement la modal de création de structure
        openStructureModal();
        break;
      case '/contacts/nouveau/personne':
        // Ouvrir directement la modal de création de personne
        openPersonneModal();
        break;
      case '/booking/nouvelle-date':
        // Ouvrir la page de création de date dans un nouvel onglet
        openTab({
          id: 'date-creation',
          title: 'Nouvelle Date',
          path: '/booking/nouvelle-date',
          component: 'DateCreationPage',
          icon: 'bi-calendar-plus'
        });
        break;
      case '/festivals/dates':
        // Ouvrir la page des dates de festivals dans un nouvel onglet
        openTab({
          id: 'festivals-dates',
          title: 'Dates des festivals',
          path: '/festivals/dates',
          component: 'FestivalsDatesPage',
          icon: 'bi-calendar-event'
        });
        break;
      case '/tableau-de-bord':
        openTab({
          id: 'tableau-de-bord',
          title: 'Tableau de bord',
          path: '/tableau-de-bord',
          component: 'TableauDeBordPage',
          icon: 'bi-speedometer2'
        });
        break;
      case '/tabs-test':
        // Page de test - garde navigate()
        navigate(item.to);
        break;
      case '/contacts/recherches':
        openTab({
          id: 'contacts-recherches',
          title: 'Mes recherches',
          path: '/contacts/recherches',
          component: 'MesRecherchesPage',
          icon: 'bi-search'
        });
        break;
      case '/contacts/recherches/nouveau-dossier':
        openTab({
          id: 'nouveau-dossier',
          title: 'Nouveau dossier',
          path: '/contacts/recherches/nouveau-dossier',
          component: 'NouveauDossierPage',
          icon: 'bi-folder-plus'
        });
        break;
      case '/contacts/recherches/dossiers':
        openTab({
          id: 'dossiers-enregistres',
          title: 'Dossiers enregistrés',
          path: '/contacts/recherches/dossiers',
          component: 'DossiersEnregistresPage',
          icon: 'bi-folder2-open'
        });
        break;
      case '/contacts/selections':
        openTab({
          id: 'contacts-selections',
          title: 'Mes sélections',
          path: '/contacts/selections',
          component: 'MesSelectionsPage',
          icon: 'bi-check2-square'
        });
        break;
      case '/contacts/tags':
        openTab({
          id: 'contacts-tags',
          title: 'Tags',
          path: '/contacts/tags',
          component: 'ContactTagsPage',
          icon: 'bi-tags'
        });
        break;
      default:
        // Ignorer les liens qui commencent par # (non implémentés)
        if (item.to?.startsWith('#')) {
          console.log('[DesktopLayout] Lien non implémenté:', item.to);
          return;
        }
        // Pour tout le reste, on utilise le système d'onglets
        console.log('[DesktopLayout] Route non gérée:', item.to);
    }
  };

  // Fonction pour construire les éléments du menu "Mes recherches" dynamiquement
  const buildMesRecherchesSubItems = () => {
    console.log('🔍 DesktopLayout - Construction du menu avec', savedSearches.length, 'recherches');
    
    const baseItems = [
      { to: "/contacts/recherches", icon: "bi-search-plus", label: "Nouvelle recherche" },
      { to: "/contacts/recherches/nouveau-dossier", icon: "bi-folder-plus", label: "Nouveau dossier" }
    ];
    
    // Ajouter les recherches sauvegardées après "Nouveau dossier"
    const savedSearchItems = savedSearches.map(search => {
      console.log('🔍 DesktopLayout - Ajout recherche au menu:', search.name);
      return {
        id: `saved-search-${search.id}`,
        icon: "", // Pas d'icône mais on garde l'espace
        label: `🔍 ${search.name}`,
        searchData: search, // On stocke les données de recherche pour les utiliser lors du clic
        isSearch: true
      };
    });
    
    // Ajouter "Dossiers enregistrés" à la fin
    const dossiersItem = { to: "/contacts/recherches/dossiers", icon: "bi-folder2-open", label: "Dossiers enregistrés" };
    
    return [...baseItems, ...savedSearchItems, dossiersItem];
  };

  // Fonction pour construire les items du sous-menu "Mes sélections"
  const buildMesSelectionsSubItems = () => {
    console.log('📌 DesktopLayout - Construction du menu avec', savedSelections.length, 'sélections');
    
    // Si pas de sélections, afficher un message
    if (savedSelections.length === 0) {
      return [{
        id: 'no-selections',
        icon: "bi-info-circle",
        label: "Aucune sélection",
        disabled: true,
        onClick: () => {} // Ne rien faire au clic
      }];
    }
    
    // Ajouter les sélections sauvegardées
    const savedSelectionItems = savedSelections.map(selection => {
      console.log('📌 DesktopLayout - Ajout sélection au menu:', selection.nom);
      return {
        id: `saved-selection-${selection.id}`,
        icon: "", // Pas d'icône mais on garde l'espace
        label: `📌 ${selection.nom}`,
        selectionData: selection, // On stocke les données de sélection pour les utiliser lors du clic
        isSelection: true
      };
    });
    
    return savedSelectionItems;
  };

  // Nouvelle structure de navigation groupée
  const navigationGroups = [
    {
      id: "contact",
      icon: "bi-person-badge",
      label: "Contact",
      subItems: [
        { 
          id: "add-contact",
          icon: "bi-person-plus", 
          label: "Ajouter un contact",
          subItems: [
            { to: "/contacts/nouveau/structure", icon: "bi-building-add", label: "Ajouter une structure" },
            { to: "/contacts/nouveau/personne", icon: "bi-person-circle", label: "Ajouter une personne" }
          ]
        },
        { to: "/contacts", icon: "bi-people", label: "Tous les contacts" },
        { 
          id: "mes-recherches",
          icon: "bi-search", 
          label: "Mes recherches",
          subItems: buildMesRecherchesSubItems()
        },
        {
          id: "mes-selections",
          icon: "bi-check2-square", 
          label: "Mes sélections",
          subItems: buildMesSelectionsSubItems()
        },
        { to: "/contacts/tags", icon: "bi-tags", label: "Tags" },
        ...(canEditSettings() ? [{ to: "/contact/parametrage", icon: "bi-gear-fill", label: "Paramétrage" }] : [])
      ]
    },
    {
      id: "booking",
      icon: "bi-calendar-event", 
      label: "Booking",
      subItems: [
        { to: "/booking/nouvelle-date", icon: "bi-calendar-plus", label: "Nouvelle date" },
        { to: "/dates", icon: "bi-calendar-event", label: "Liste des dates" },
        { to: "/publications", icon: "bi-newspaper", label: "Publications" },
        { to: "/projets", icon: "bi-folder", label: "Projets" },
        { to: "/salles", icon: "bi-building", label: "Salle" },
        { to: "/festivals/dates", icon: "bi-calendar-event", label: "Date des festivals" },
        ...(canEditSettings() ? [{ to: "/booking/parametrage", icon: "bi-gear-fill", label: "Paramétrage" }] : [])
      ]
    },
    {
      id: "collaboration",
      icon: "bi-people-fill",
      label: "Collaboration",
      subItems: [
        { to: "/mails", icon: "bi-envelope", label: "Échanges de mails" },
        { to: "/taches", icon: "bi-check2-square", label: "Tâches" },
        { to: "/notes", icon: "bi-journal-text", label: "Notes & Commentaires" },
        ...(canEditSettings() ? [{ to: "/collaboration/parametrage", icon: "bi-gear-fill", label: "Paramétrage" }] : [])
      ]
    },
    {
      id: "admin",
      icon: "bi-clipboard-data",
      label: "Admin", 
      subItems: [
        { to: "/tableau-de-bord", icon: "bi-speedometer2", label: "Tableau de bord" },
        { to: "/contrats", icon: "bi-file-earmark-text", label: "Contrats" },
        { to: "/factures", icon: "bi-receipt", label: "Factures" },
        { to: "/devis", icon: "bi-file-earmark-plus", label: "Devis" },
        { to: "#equipe", icon: "bi-people-fill", label: "Équipe dispo" },
        ...(canEditSettings() ? [{ to: "/admin/parametrage", icon: "bi-gear-fill", label: "Paramétrage" }] : [])
      ]
    },
    // Menu Outils visible uniquement en mode développement
    ...(process.env.NODE_ENV === 'development' ? [{
      id: "tools",
      icon: "bi-tools",
      label: "Outils",
      subItems: [
        { to: "/debug-tools", icon: "bi-bug", label: "Debug Tools" },
        { to: "/inventaire-pages", icon: "bi-file-earmark-code", label: "Inventaire des pages" },
        { to: "/tabs-test", icon: "bi-window-stack", label: "Test Onglets" },
        { to: "/outils/pdf-viewer-demo", icon: "bi-file-pdf", label: "Demo PDF Viewer" }
      ]
    }] : []),
  ];

  // Gérer l'expansion/contraction des menus
  const toggleMenu = (menuId) => {
    setPreviousMenu(expandedMenu);
    setExpandedMenu(expandedMenu === menuId ? null : menuId);
    // Fermer les sous-sous-menus quand on change de menu principal
    setExpandedSubMenu(null);
    // Fermer le menu utilisateur si un autre menu s'ouvre
    if (menuId && isUserMenuOpen) {
      setIsUserMenuOpen(false);
    }
  };

  // Gérer l'expansion/contraction des sous-sous-menus
  const toggleSubMenu = (subMenuId) => {
    setExpandedSubMenu(expandedSubMenu === subMenuId ? null : subMenuId);
  };

  // Gérer l'ouverture/fermeture du menu utilisateur
  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
    // Fermer les autres menus si le menu utilisateur s'ouvre
    if (!isUserMenuOpen && expandedMenu) {
      setExpandedMenu(null);
    }
    // Réinitialiser l'état du dropdown quand on ferme
    if (isUserMenuOpen) {
      setIsOrgDropdownOpen(false);
    }
  };

  // Calculer le décalage du contenu principal (sans transition pour éviter le clignotement)
  const getContentOffset = () => {
    if (isMobile) return 0;
    
    const sidebarWidth = 70;
    const panelWidth = 250;
    
    if (isUserMenuOpen) {
      return panelWidth;
    }
    
    if (expandedMenu) {
      return 300;
    }
    return sidebarWidth;
  };

  // Fonction pour rendre un élément de navigation
  const renderNavItem = (item) => {
    // Si l'élément a des sous-éléments (menu expandable)
    if (item.subItems) {
      const isExpanded = expandedMenu === item.id;
      return (
        <li key={item.id} className={sidebarStyles.navGroup}>
          <button 
            className={`${sidebarStyles.navGroupToggle} ${isExpanded ? sidebarStyles.active : ''}`}
            onClick={() => toggleMenu(item.id)}
            aria-expanded={isExpanded}
            title={item.label}
            data-menu={item.id}
          >
            <i className={`bi ${item.icon}`}></i>
            {!isMobile && <span className={sidebarStyles.tooltip}>{item.label}</span>}
            {isUserMenuOpen && <span className={sidebarStyles.navLabel}>{item.label}</span>}
          </button>
          {isExpanded && (
            <>
              <div 
                className={sidebarStyles.subMenuOverlay}
                onClick={() => setExpandedMenu(null)}
              />
              <div 
                className={sidebarStyles.subMenuPanel}
                data-menu-id={item.id}
              >
              <div className={sidebarStyles.subMenuHeader}>
                <h4>{item.label}</h4>
                <button 
                  className={sidebarStyles.closeSubMenu}
                  onClick={() => setExpandedMenu(null)}
                >
                  <i className="bi bi-x"></i>
                </button>
              </div>
              <ul className={sidebarStyles.subMenu}>
                  {item.subItems.map((subItem) => {
                    // Si le sous-item a des sous-éléments (sous-sous-menu)
                    if (subItem.subItems) {
                      const isSubExpanded = expandedSubMenu === subItem.id;
                      return (
                        <li key={subItem.id} className={sidebarStyles.subNavGroup}>
                          <button 
                            className={`${sidebarStyles.navButton} ${sidebarStyles.expandableSubItem}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleSubMenu(subItem.id);
                            }}
                          >
                            <i className={`bi ${subItem.icon}`}></i>
                            <span>{subItem.label}</span>
                            <i className={`bi bi-${isSubExpanded ? 'dash' : 'plus'} ${sidebarStyles.expandIcon}`}></i>
                          </button>
                          {isSubExpanded && (
                            <ul className={sidebarStyles.subSubMenu}>
                              {subItem.subItems.map((subSubItem) => (
                                <li key={subSubItem.to}>
                                  <button 
                                    className={`${sidebarStyles.navButton} ${sidebarStyles.subSubNavButton}`}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleNavigation(subSubItem);
                                      if (isMobile) {
                                        handleMobileNavClick();
                                      }
                                    }}
                                  >
                                    <i className={`bi ${subSubItem.icon}`}></i>
                                    <span>{subSubItem.label}</span>
                                  </button>
                                </li>
                              ))}
                            </ul>
                          )}
                        </li>
                      );
                    }
                    
                    // Sous-item simple (avec 'to' ou recherche/sélection sauvegardée)
                    if (subItem.to || subItem.isSearch || subItem.isSelection || subItem.disabled) {
                      return (
                        <li key={subItem.id || subItem.to}
                            onContextMenu={(e) => {
                              console.log('🖱️ CONTEXTMENU sur LI capturé!');
                              if ((subItem.isSearch && subItem.searchData) || (subItem.isSelection && subItem.selectionData)) {
                                e.preventDefault();
                                e.stopPropagation();
                              }
                            }}
                        >
                          <button 
                            className={`${sidebarStyles.navButton} ${subItem.disabled ? sidebarStyles.disabled : ''}`}
                            disabled={subItem.disabled}
                            onClick={(e) => {
                              if (subItem.disabled) return;
                              e.stopPropagation();
                              handleNavigation(subItem);
                              if (isMobile) {
                                handleMobileNavClick();
                              }
                            }}
                            onContextMenu={(e) => {
                              // FORCER l'interception pour tous les cas
                              e.preventDefault();
                              e.stopPropagation();
                              
                              // Gestion du clic droit pour les recherches et sélections sauvegardées
                              console.log('🖱️ === DEBUT CONTEXTMENU ===');
                              console.log('🖱️ Clic droit détecté sur:', subItem);
                              console.log('🖱️ Event:', e);
                              console.log('🖱️ subItem.isSearch:', subItem.isSearch);
                              console.log('🖱️ subItem.searchData:', subItem.searchData);
                              console.log('🖱️ subItem.isSelection:', subItem.isSelection);
                              console.log('🖱️ subItem.selectionData:', subItem.selectionData);
                              
                              if (subItem.isSearch && subItem.searchData) {
                                console.log('🖱️ => C\'est une recherche sauvegardée');
                                e.preventDefault();
                                e.stopPropagation();
                                console.log('🖱️ preventDefault et stopPropagation appelés');
                                console.log('🖱️ Menu contextuel pour recherche:', subItem.searchData.name);
                                const menuData = {
                                  x: e.clientX,
                                  y: e.clientY,
                                  type: 'search',
                                  searchId: subItem.searchData.id,
                                  searchName: subItem.searchData.name
                                };
                                console.log('🖱️ Données du menu:', menuData);
                                setContextMenu(menuData);
                                console.log('🖱️ setContextMenu appelé');
                              } else if (subItem.isSelection && subItem.selectionData) {
                                console.log('🖱️ => C\'est une sélection sauvegardée');
                                e.preventDefault();
                                e.stopPropagation();
                                console.log('🖱️ preventDefault et stopPropagation appelés');
                                console.log('🖱️ Menu contextuel pour sélection:', subItem.selectionData.nom);
                                const menuData = {
                                  x: e.clientX,
                                  y: e.clientY,
                                  type: 'selection',
                                  selectionId: subItem.selectionData.id,
                                  selectionName: subItem.selectionData.nom
                                };
                                console.log('🖱️ Données du menu:', menuData);
                                setContextMenu(menuData);
                                console.log('🖱️ setContextMenu appelé');
                              } else {
                                console.log('🖱️ => Pas une recherche/sélection sauvegardée, menu natif autorisé');
                              }
                              console.log('🖱️ === FIN CONTEXTMENU ===');
                            }}
                            style={subItem.disabled ? { opacity: 0.5, cursor: 'default' } : {
                              // Style de debug pour les recherches/sélections
                              ...(subItem.isSearch || subItem.isSelection ? {
                                backgroundColor: 'rgba(255, 0, 0, 0.05)',
                                border: '1px solid red'
                              } : {})
                            }}
                            data-search-id={subItem.isSearch ? subItem.searchData?.id : undefined}
                            data-selection-id={subItem.isSelection ? subItem.selectionData?.id : undefined}
                            data-item-type={subItem.isSearch ? 'search' : subItem.isSelection ? 'selection' : 'normal'}
                          >
                            <i className={`bi ${subItem.icon}`} 
                               style={(subItem.isSearch || subItem.isSelection) && !subItem.icon ? {width: '1rem', display: 'inline-block'} : {}}
                            ></i>
                            <span>{subItem.label}</span>
                          </button>
                        </li>
                      );
                    }
                    
                    // Si pas de 'to', pas de 'isSearch' et pas de 'subItems', ne rien rendre
                    return null;
                  })}
                </ul>
              </div>
            </>
          )}
        </li>
      );
    }
    
    // Élément de navigation simple
    return (
      <li key={item.to}>
        <button 
          className={sidebarStyles.navButton}
          onClick={(e) => {
            e.stopPropagation();
            handleNavigation(item);
            if (isMobile) {
              handleMobileNavClick();
            }
          }}
          title={item.label}
        >
          <i className={`bi ${item.icon}`}></i>
          {!isMobile && <span className={sidebarStyles.tooltip}>{item.label}</span>}
          {isUserMenuOpen && <span className={sidebarStyles.navLabel}>{item.label}</span>}
        </button>
      </li>
    );
  };

  // Fonction pour fermer la sidebar mobile au clic sur un lien
  const handleMobileNavClick = () => {
    if (isMobile) {
      setIsMobileSidebarOpen(false);
      setIsUserMenuOpen(false);
    }
  };

  if (isMobile) {
    return (
      <div className={layoutStyles.layoutContainer}>
        {/* Header mobile avec bouton hamburger */}
        <header className={layoutStyles.mobileHeader}>
          <button 
            className={layoutStyles.hamburgerButton}
            onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            aria-label="Menu"
          >
            <i className="bi bi-list"></i>
          </button>
          <h4 className={layoutStyles.mobileTitle}>{APP_NAME}</h4>
          <div className={layoutStyles.mobileUserAction}>
            <Button 
              onClick={handleLogout} 
              variant="outline-primary"
              size="sm"
            >
              <i className="bi bi-box-arrow-right"></i>
            </Button>
          </div>
        </header>

        {/* Overlay pour fermer la sidebar */}
        {isMobileSidebarOpen && (
          <div 
            className={layoutStyles.mobileOverlay}
            onClick={() => setIsMobileSidebarOpen(false)}
          />
        )}

        {/* Sidebar mobile (slide-in from left) */}
        <nav className={`${sidebarStyles.sidebar} ${sidebarStyles.mobileSidebar} ${
          isMobileSidebarOpen ? sidebarStyles.mobileOpen : ''
        }`}>
          <div className={sidebarStyles.sidebarContent}>
            <ul className={sidebarStyles.navLinks}>
              {navigationGroups.map(renderNavItem)}
            </ul>
            
          </div>
          
          <div className={sidebarStyles.sidebarFooter}>
            {currentUser && (
              <div className={sidebarStyles.footerIcons}>
                {/* Icône utilisateur avec texte pour mobile */}
                <button 
                  className={`${sidebarStyles.footerIconButton} ${isUserMenuOpen ? sidebarStyles.active : ''}`}
                  onClick={toggleUserMenu}
                  title="Profil utilisateur"
                >
                  <i className="bi bi-person-circle"></i>
                  {isMobile && <span>Profil</span>}
                </button>
                
                {/* Icône déconnexion avec texte pour mobile */}
                <button 
                  className={sidebarStyles.footerIconButton}
                  onClick={handleLogout}
                  title="Déconnexion"
                >
                  <i className="bi bi-power"></i>
                  {isMobile && <span>Déconnexion</span>}
                </button>
              </div>
            )}
          </div>

          {/* Panneau utilisateur mobile */}
          {isUserMenuOpen && (
            <>
              <div 
                className={layoutStyles.mobileOverlay}
                onClick={() => setIsUserMenuOpen(false)}
              />
              <div className={`${sidebarStyles.userMenuPanel} ${sidebarStyles.mobileUserPanel}`}>
                <div className={sidebarStyles.subMenuHeader}>
                  <h4>Profil & Entreprise</h4>
                  <button 
                    className={sidebarStyles.closeSubMenu}
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    <i className="bi bi-x"></i>
                  </button>
                </div>
                <div className={sidebarStyles.userMenuContent}>
                  {/* Informations utilisateur */}
                  <div className={sidebarStyles.userSection}>
                    <div className={sidebarStyles.userProfile}>
                      <i className="bi bi-person-circle" style={{fontSize: '2rem', marginBottom: '0.5rem'}}></i>
                      <div className={sidebarStyles.userDetails}>
                        <p className={sidebarStyles.userEmail}>{currentUser?.email}</p>
                        <small className={sidebarStyles.userRole}>Utilisateur</small>
                      </div>
                    </div>
                  </div>
                  
                  {/* Sélecteur d'entreprise */}
                  <div className={sidebarStyles.entrepriseSection}>
                    <h5>Entreprise</h5>
                    <EntrepriseSelector />
                  </div>
                </div>
              </div>
            </>
          )}
        </nav>

        {/* Bottom Navigation Mobile - Supprimée pour utiliser les boutons flottants */}

        {/* Contenu principal mobile */}
        <main className={`${layoutStyles.content} ${layoutStyles.mobileContent}`}>
          <TabManagerProduction />
        </main>
        
        {/* Conteneur des modals de contact */}
        <ContactModalsContainer />
      </div>
    );
  }

  // Layout Desktop (inchangé)
  return (
    <div className={layoutStyles.layoutContainer}>
      <nav className={`${sidebarStyles.sidebar} ${isUserMenuOpen ? sidebarStyles.extended : ''} ${expandedMenu ? sidebarStyles.hasMenuOpen : ''}`}>
        <div className={sidebarStyles.sidebarContent}>
          <ul className={sidebarStyles.navLinks}>
            {navigationGroups.map(renderNavItem)}
          </ul>
          
        </div>
        <div className={sidebarStyles.sidebarFooter}>
          {currentUser && (
            <div className={sidebarStyles.footerIcons}>
              {/* Icône utilisateur avec tooltip */}
              <button 
                className={`${sidebarStyles.footerIconButton} ${isUserMenuOpen ? sidebarStyles.active : ''}`}
                onClick={toggleUserMenu}
                title="Profil utilisateur"
              >
                <i className="bi bi-person-circle"></i>
                {!isMobile && <span className={sidebarStyles.tooltip}>Profil</span>}
              </button>
              
              {/* Icône déconnexion avec tooltip */}
              <button 
                className={sidebarStyles.footerIconButton}
                onClick={handleLogout}
                title="Déconnexion"
              >
                <i className="bi bi-power"></i>
                {!isMobile && <span className={sidebarStyles.tooltip}>Déconnexion</span>}
              </button>
            </div>
          )}
        </div>

        {/* Panneau utilisateur latéral */}
        {isUserMenuOpen && (
          <>
            <div 
              className={sidebarStyles.subMenuOverlay}
              onClick={() => setIsUserMenuOpen(false)}
            />
            <div className={`${sidebarStyles.userMenuPanel} ${isOrgDropdownOpen ? sidebarStyles.expanded : ''}`}>
              <div className={sidebarStyles.subMenuHeader}>
                <h4>Profil & Entreprise</h4>
                <button 
                  className={sidebarStyles.closeSubMenu}
                  onClick={() => setIsUserMenuOpen(false)}
                >
                  <i className="bi bi-x"></i>
                </button>
              </div>
              <div className={sidebarStyles.userMenuContent}>
                {/* Informations utilisateur */}
                <div className={sidebarStyles.userSection}>
                  <div className={sidebarStyles.userProfile}>
                    <i className="bi bi-person-circle" style={{fontSize: '2rem', marginBottom: '0.5rem'}}></i>
                    <div className={sidebarStyles.userDetails}>
                      <p className={sidebarStyles.userEmail}>{currentUser?.email}</p>
                      <small className={sidebarStyles.userRole}>Utilisateur</small>
                    </div>
                  </div>
                </div>
                
                {/* Sélecteur d'entreprise */}
                <div className={sidebarStyles.entrepriseSection}>
                  <h5>Entreprise</h5>
                  <EntrepriseSelector onDropdownToggle={setIsOrgDropdownOpen} />
                </div>
              </div>
            </div>
          </>
        )}
      </nav>
      
      {/* Header général sur toute la largeur */}
      <header className={layoutStyles.mainHeader}>
        <div className={layoutStyles.headerContent}>
          <div className={layoutStyles.headerLogo}>
            <h3>{APP_NAME}</h3>
          </div>
          <div className={layoutStyles.headerActions}>
            <Button
              variant="outline-primary"
              size="sm"
              onClick={() => {
                resetTour();
                window.location.reload();
              }}
              title="Lancer le tour guidé de l'application"
            >
              <i className="bi bi-question-circle me-2"></i>
              Tour de l'app
            </Button>
          </div>
        </div>
      </header>

      <main 
        className={layoutStyles.content}
        style={{ marginLeft: `${getContentOffset()}px` }}
      >
        <TabManagerProduction />
      </main>
      
      {/* Conteneur des modals de contact */}
      <ContactModalsContainer />
      
      {/* Tour guidé de l'application */}
      <AppTour />
      
      {/* Menu contextuel pour les recherches et sélections sauvegardées */}
      {console.log('🖱️ Rendu du composant, contextMenu:', contextMenu)}
      {contextMenu && (
        <div
          style={{
            position: 'fixed',
            top: contextMenu.y,
            left: contextMenu.x,
            backgroundColor: 'white',
            border: '1px solid #ddd',
            borderRadius: '4px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            zIndex: 9999,
            minWidth: '150px'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="btn btn-sm btn-link text-danger w-100 text-start"
            onClick={() => {
              if (contextMenu.type === 'search') {
                handleDeleteSearch(contextMenu.searchId, contextMenu.searchName);
              } else if (contextMenu.type === 'selection') {
                handleDeleteSelection(contextMenu.selectionId, contextMenu.selectionName);
              }
            }}
            style={{ 
              padding: '8px 12px',
              textDecoration: 'none',
              borderRadius: '4px'
            }}
          >
            <i className="bi bi-trash me-2"></i>
            Supprimer
          </button>
        </div>
      )}
    </div>
  );
}

export default DesktopLayout;