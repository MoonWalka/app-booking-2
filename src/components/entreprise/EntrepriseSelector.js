import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useEntreprise } from '@/context/EntrepriseContext';
import { useAuth } from '@/context/AuthContext';
import { useTabs } from '@/context/TabsContext';
import styles from './EntrepriseSelector.module.css';

const EntrepriseSelector = ({ className = '', isMobile = false, onDropdownToggle }) => {
  const { currentUser } = useAuth();
  const { 
    currentEntreprise, 
    userEntreprises, 
    switchEntreprise, 
    loading 
  } = useEntreprise();
  const { openTab } = useTabs();

  const [showDropdown, setShowDropdown] = useState(false);
  
  // Notifier le parent quand le dropdown change
  useEffect(() => {
    if (onDropdownToggle) {
      onDropdownToggle(showDropdown);
    }
  }, [showDropdown, onDropdownToggle]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  // Obtenir le nom d'utilisateur (displayName ou email sans @domain)
  const getUserDisplayName = () => {
    if (currentUser?.displayName) {
      return currentUser.displayName;
    }
    if (currentUser?.email) {
      return currentUser.email.split('@')[0];
    }
    return 'Utilisateur';
  };

  const handleEntrepriseChange = useCallback(async (entrepriseId) => {
    if (entrepriseId && entrepriseId !== currentEntreprise?.id) {
      await switchEntreprise(entrepriseId);
      setShowDropdown(false);
      // Recharger la page pour s'assurer que toutes les données sont mises à jour
      window.location.reload();
    }
  }, [currentEntreprise?.id, switchEntreprise]);

  const handleCreateEntreprise = useCallback(() => {
    setShowDropdown(false);
    // Rediriger vers la page d'onboarding en mode création
    window.location.href = '/onboarding?action=create';
  }, []);

  const handleJoinEntreprise = useCallback(() => {
    setShowDropdown(false);
    // Rediriger vers la page d'onboarding en mode rejoindre
    window.location.href = '/onboarding?action=join';
  }, []);

  // Gestion de la navigation clavier
  const handleKeyDown = useCallback((event) => {
    if (!showDropdown) {
      if (event.key === 'Enter' || event.key === ' ' || event.key === 'ArrowDown') {
        event.preventDefault();
        setShowDropdown(true);
        setSelectedIndex(0);
      }
      return;
    }

    // Cas première connexion : seulement 2 options (créer/rejoindre)
    const totalItems = !userEntreprises || userEntreprises.length === 0 ? 2 : userEntreprises.length + 3;
    
    switch (event.key) {
      case 'Escape':
        event.preventDefault();
        setShowDropdown(false);
        setSelectedIndex(-1);
        buttonRef.current?.focus();
        break;
        
      case 'ArrowDown':
        event.preventDefault();
        setSelectedIndex(prev => (prev + 1) % totalItems);
        break;
        
      case 'ArrowUp':
        event.preventDefault();
        setSelectedIndex(prev => prev <= 0 ? totalItems - 1 : prev - 1);
        break;
        
      case 'Enter':
      case ' ':
        event.preventDefault();
        // Première connexion : seulement créer/rejoindre
        if (!userEntreprises || userEntreprises.length === 0) {
          if (selectedIndex === 0) {
            handleCreateEntreprise();
          } else if (selectedIndex === 1) {
            handleJoinEntreprise();
          }
        } else {
          // Utilisateur avec entreprises existantes
          if (userEntreprises && selectedIndex >= 0 && selectedIndex < userEntreprises.length) {
            const selectedEntreprise = userEntreprises[selectedIndex];
            handleEntrepriseChange(selectedEntreprise.id);
          } else if (selectedIndex === (userEntreprises?.length || 0)) {
            handleCreateEntreprise();
          } else if (selectedIndex === (userEntreprises?.length || 0) + 1) {
            handleJoinEntreprise();
          } else if (selectedIndex === (userEntreprises?.length || 0) + 2) {
            setShowDropdown(false);
            window.location.href = '/parametres/entreprises';
          }
        }
        break;
        
      case 'Tab':
        setShowDropdown(false);
        setSelectedIndex(-1);
        break;
        
      default:
        break;
    }
  }, [showDropdown, selectedIndex, userEntreprises, handleEntrepriseChange, handleCreateEntreprise, handleJoinEntreprise]);

  // Fermeture automatique lors d'un clic extérieur
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
        setSelectedIndex(-1);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showDropdown, handleKeyDown]);

  // Si l'utilisateur n'a pas d'entreprises, afficher les options d'inscription
  if (!userEntreprises || userEntreprises.length === 0) {
    return (
      <div className={`${styles.entrepriseSelector} ${className}`}>
        <button
          ref={buttonRef}
          className={styles.userProfileButton}
          type="button"
          onClick={() => setShowDropdown(!showDropdown)}
          onKeyDown={handleKeyDown}
          aria-expanded={showDropdown}
          aria-haspopup="listbox"
          aria-controls="entreprise-dropdown"
          aria-label="Sélecteur d'entreprise et profil utilisateur"
          role="combobox"
        >
          <div className={styles.userAvatar}>
            <i className="bi bi-person-plus" aria-hidden="true"></i>
          </div>
          
          <div className={styles.userInfo}>
            <div className={styles.userName}>
              {getUserDisplayName()}
            </div>
          </div>
          
          <i className={`bi bi-chevron-up ${styles.dropdownIcon}`} aria-hidden="true"></i>
        </button>

        {showDropdown && (
          <div 
            id="entreprise-dropdown"
            className={styles.dropdownMenu}
            role="listbox"
            aria-label="Options d'inscription"
          >
            {/* Informations utilisateur */}
            <div className={styles.dropdownHeader}>
              <div className={styles.userAvatar}>
                <i className="bi bi-person-plus" aria-hidden="true"></i>
              </div>
              <div className={styles.dropdownUserInfo}>
                <div className={styles.dropdownUserName}>{getUserDisplayName()}</div>
                <div className={styles.dropdownUserEmail}>{currentUser?.email}</div>
              </div>
            </div>
            
            <div className={styles.dropdownDivider}></div>
            
            {/* Message de bienvenue */}
            <div className={styles.dropdownSection}>
              <div className={styles.welcomeMessage}>
                <i className="bi bi-info-circle" style={{marginRight: '8px', color: 'var(--tc-color-accent)'}}></i>
                Bienvenue ! Commencez par créer ou rejoindre une entreprise.
              </div>
            </div>
            
            <div className={styles.dropdownDivider}></div>
            
            {/* Actions pour créer/rejoindre */}
            <div className={styles.dropdownSection}>
              <div className={styles.dropdownSectionTitle}>Premiers pas</div>
              
              <button
                className={styles.dropdownItem}
                onClick={handleCreateEntreprise}
                data-index={0}
                tabIndex={selectedIndex === 0 ? 0 : -1}
              >
                <div className={styles.itemContent}>
                  <i className={`bi bi-plus-circle ${styles.itemIcon}`} aria-hidden="true"></i>
                  <div className={styles.itemInfo}>
                    <div className={styles.itemTitle}>Créer une entreprise</div>
                    <div className={styles.itemSubtitle}>Configurez votre propre espace de travail</div>
                  </div>
                </div>
              </button>
              
              <button
                className={styles.dropdownItem}
                onClick={handleJoinEntreprise}
                data-index={1}
                tabIndex={selectedIndex === 1 ? 0 : -1}
              >
                <div className={styles.itemContent}>
                  <i className={`bi bi-people ${styles.itemIcon}`} aria-hidden="true"></i>
                  <div className={styles.itemInfo}>
                    <div className={styles.itemTitle}>Rejoindre une entreprise</div>
                    <div className={styles.itemSubtitle}>Utilisez un code d'invitation existant</div>
                  </div>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Overlay pour fermer le dropdown */}
        {showDropdown && (
          <div 
            className={styles.dropdownOverlay}
            onClick={() => setShowDropdown(false)}
            aria-hidden="true"
          />
        )}
      </div>
    );
  }

  if (loading) {
    return (
      <div className={`${styles.entrepriseSelector} ${className}`}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner} role="status" aria-label="Chargement..."></div>
          <span className={styles.loadingText}>Chargement...</span>
        </div>
      </div>
    );
  }

  // Interface utilisateur avec dropdown d'entreprises
  return (
    <div className={`${styles.entrepriseSelector} ${isMobile ? 'mobile' : ''} ${className}`} ref={dropdownRef}>
      <button
        ref={buttonRef}
        className={styles.userProfileButton}
        type="button"
        onClick={() => setShowDropdown(!showDropdown)}
        onKeyDown={handleKeyDown}
        aria-expanded={showDropdown}
        aria-haspopup="listbox"
        aria-controls="entreprise-dropdown-main"
        aria-label="Sélecteur d'entreprise et profil utilisateur"
        role="combobox"
      >
        <div className={styles.userAvatar}>
          <i className="bi bi-person-fill" aria-hidden="true"></i>
        </div>
        
        <div className={styles.userInfo}>
          <div className={styles.userName}>
            {getUserDisplayName()}
          </div>
          
          <div className={styles.entrepriseInfo}>
            {currentEntreprise ? (
              <>
                <i className="bi bi-building" aria-hidden="true"></i>
                <span>{currentEntreprise.name}</span>
              </>
            ) : (
              <>
                <i className="bi bi-exclamation-circle" aria-hidden="true"></i>
                <span>Aucune entreprise</span>
              </>
            )}
          </div>
        </div>
        
        <i className={`bi bi-chevron-up ${styles.dropdownIcon}`} aria-hidden="true"></i>
      </button>

      {showDropdown && (
        <div 
          id="entreprise-dropdown-main"
          className={styles.dropdownMenu}
          role="listbox"
          aria-label="Liste des entreprises"
        >
          {/* Informations utilisateur */}
          <div className={styles.dropdownHeader}>
            <div className={styles.userAvatar}>
              <i className="bi bi-person-fill" aria-hidden="true"></i>
            </div>
            <div className={styles.dropdownUserInfo}>
              <div className={styles.dropdownUserName}>{getUserDisplayName()}</div>
              <div className={styles.dropdownUserEmail}>{currentUser?.email}</div>
            </div>
          </div>
          
          <div className={styles.dropdownDivider}></div>
          
          {/* Liste des entreprises existantes */}
          <div className={styles.dropdownSection}>
            <div className={styles.dropdownSectionTitle}>Mes entreprises</div>
            
            {userEntreprises.map((entreprise, index) => (
              <button
                key={entreprise.id}
                className={`${styles.dropdownItem} ${entreprise.id === currentEntreprise?.id ? styles.dropdownItemActive : ''}`}
                onClick={() => handleEntrepriseChange(entreprise.id)}
                role="option"
                aria-selected={entreprise.id === currentEntreprise?.id}
                data-index={index}
                tabIndex={selectedIndex === index ? 0 : -1}
              >
                <div className={styles.itemContent}>
                  <div className={styles.itemInfo}>
                    <div className={styles.itemTitle}>
                      {entreprise.name}
                      {entreprise.userRole === 'owner' && ' (Propriétaire)'}
                      {entreprise.userRole === 'admin' && ' (Admin)'}
                    </div>
                    <div className={styles.itemSubtitle}>
                      {entreprise.settings?.timezone || 'Europe/Paris'} • {entreprise.settings?.currency || 'EUR'}
                    </div>
                  </div>
                  {entreprise.id === currentEntreprise?.id && (
                    <i className={`bi bi-check-circle-fill ${styles.activeIcon}`} aria-hidden="true"></i>
                  )}
                </div>
              </button>
            ))}
          </div>
          
          <div className={styles.dropdownDivider}></div>
          
          {/* Actions pour créer/rejoindre */}
          <div className={styles.dropdownSection}>
            <div className={styles.dropdownSectionTitle}>Actions</div>
            
            <button
              className={styles.dropdownItem}
              onClick={handleCreateEntreprise}
              data-index={userEntreprises.length}
              tabIndex={selectedIndex === userEntreprises.length ? 0 : -1}
            >
              <div className={styles.itemContent}>
                <i className={`bi bi-plus-circle ${styles.itemIcon}`} aria-hidden="true"></i>
                <span>Créer une entreprise</span>
              </div>
            </button>
            
            <button
              className={styles.dropdownItem}
              onClick={handleJoinEntreprise}
              data-index={userEntreprises.length + 1}
              tabIndex={selectedIndex === userEntreprises.length + 1 ? 0 : -1}
            >
              <div className={styles.itemContent}>
                <i className={`bi bi-people ${styles.itemIcon}`} aria-hidden="true"></i>
                <span>Rejoindre une entreprise</span>
              </div>
            </button>
            
            <div className={styles.dropdownDivider}></div>
            
            <button
              className={styles.dropdownItem}
              onClick={() => {
                setShowDropdown(false);
                if (openTab) {
                  openTab({
                    id: 'collaboration-parametrage',
                    title: 'Paramétrage Collaboration',
                    path: '/collaboration/parametrage/entreprise',
                    component: 'CollaborationParametragePage',
                    icon: 'bi-gear'
                  });
                } else {
                  window.location.href = '/collaboration/parametrage/entreprise';
                }
              }}
              data-index={userEntreprises.length + 2}
              tabIndex={selectedIndex === userEntreprises.length + 2 ? 0 : -1}
            >
              <div className={styles.itemContent}>
                <i className={`bi bi-gear ${styles.itemIcon}`} aria-hidden="true"></i>
                <span>Gérer les entreprises</span>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Overlay pour fermer le dropdown */}
      {showDropdown && (
        <div 
          className={styles.dropdownOverlay}
          onClick={() => setShowDropdown(false)}
          aria-hidden="true"
        />
      )}
    </div>
  );
};

export default EntrepriseSelector;