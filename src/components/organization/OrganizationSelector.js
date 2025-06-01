import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useOrganization } from '@/context/OrganizationContext';
import { useAuth } from '@/context/AuthContext';
import styles from './OrganizationSelector.module.css';

const OrganizationSelector = ({ className = '', isMobile = false }) => {
  const { currentUser } = useAuth();
  const { 
    currentOrg, 
    userOrgs, 
    switchOrganization, 
    loading 
  } = useOrganization();

  const [showDropdown, setShowDropdown] = useState(false);
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

  const handleOrganizationChange = useCallback(async (orgId) => {
    if (orgId && orgId !== currentOrg?.id) {
      await switchOrganization(orgId);
      setShowDropdown(false);
      // Recharger la page pour s'assurer que toutes les données sont mises à jour
      window.location.reload();
    }
  }, [currentOrg?.id, switchOrganization]);

  const handleCreateOrganization = useCallback(() => {
    setShowDropdown(false);
    // Rediriger vers la page d'onboarding en mode création
    window.location.href = '/onboarding?action=create';
  }, []);

  const handleJoinOrganization = useCallback(() => {
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
    const totalItems = !userOrgs || userOrgs.length === 0 ? 2 : userOrgs.length + 3;
    
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
        if (!userOrgs || userOrgs.length === 0) {
          if (selectedIndex === 0) {
            handleCreateOrganization();
          } else if (selectedIndex === 1) {
            handleJoinOrganization();
          }
        } else {
          // Utilisateur avec organisations existantes
          if (userOrgs && selectedIndex >= 0 && selectedIndex < userOrgs.length) {
            const selectedOrg = userOrgs[selectedIndex];
            handleOrganizationChange(selectedOrg.id);
          } else if (selectedIndex === (userOrgs?.length || 0)) {
            handleCreateOrganization();
          } else if (selectedIndex === (userOrgs?.length || 0) + 1) {
            handleJoinOrganization();
          } else if (selectedIndex === (userOrgs?.length || 0) + 2) {
            setShowDropdown(false);
            window.location.href = '/parametres/organisations';
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
  }, [showDropdown, selectedIndex, userOrgs, handleOrganizationChange, handleCreateOrganization, handleJoinOrganization]);

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

  // Si l'utilisateur n'a pas d'organisations, afficher les options d'inscription
  if (!userOrgs || userOrgs.length === 0) {
    return (
      <div className={`${styles.organizationSelector} ${className}`}>
        <button
          ref={buttonRef}
          className={styles.userProfileButton}
          type="button"
          onClick={() => setShowDropdown(!showDropdown)}
          onKeyDown={handleKeyDown}
          aria-expanded={showDropdown}
          aria-haspopup="listbox"
          aria-controls="organization-dropdown"
          aria-label="Sélecteur d'organisation et profil utilisateur"
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
            id="organization-dropdown"
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
                Bienvenue ! Commencez par créer ou rejoindre une organisation.
              </div>
            </div>
            
            <div className={styles.dropdownDivider}></div>
            
            {/* Actions pour créer/rejoindre */}
            <div className={styles.dropdownSection}>
              <div className={styles.dropdownSectionTitle}>Premiers pas</div>
              
              <button
                className={styles.dropdownItem}
                onClick={handleCreateOrganization}
                data-index={0}
                tabIndex={selectedIndex === 0 ? 0 : -1}
              >
                <div className={styles.itemContent}>
                  <i className={`bi bi-plus-circle ${styles.itemIcon}`} aria-hidden="true"></i>
                  <div className={styles.itemInfo}>
                    <div className={styles.itemTitle}>Créer une organisation</div>
                    <div className={styles.itemSubtitle}>Configurez votre propre espace de travail</div>
                  </div>
                </div>
              </button>
              
              <button
                className={styles.dropdownItem}
                onClick={handleJoinOrganization}
                data-index={1}
                tabIndex={selectedIndex === 1 ? 0 : -1}
              >
                <div className={styles.itemContent}>
                  <i className={`bi bi-people ${styles.itemIcon}`} aria-hidden="true"></i>
                  <div className={styles.itemInfo}>
                    <div className={styles.itemTitle}>Rejoindre une organisation</div>
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
      <div className={`${styles.organizationSelector} ${className}`}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner} role="status" aria-label="Chargement..."></div>
          <span className={styles.loadingText}>Chargement...</span>
        </div>
      </div>
    );
  }

  // Interface utilisateur avec dropdown d'organisations
  return (
    <div className={`${styles.organizationSelector} ${isMobile ? 'mobile' : ''} ${className}`} ref={dropdownRef}>
      <button
        ref={buttonRef}
        className={styles.userProfileButton}
        type="button"
        onClick={() => setShowDropdown(!showDropdown)}
        onKeyDown={handleKeyDown}
        aria-expanded={showDropdown}
        aria-haspopup="listbox"
        aria-controls="organization-dropdown-main"
        aria-label="Sélecteur d'organisation et profil utilisateur"
        role="combobox"
      >
        <div className={styles.userAvatar}>
          <i className="bi bi-person-fill" aria-hidden="true"></i>
        </div>
        
        <div className={styles.userInfo}>
          <div className={styles.userName}>
            {getUserDisplayName()}
          </div>
          
          <div className={styles.organizationInfo}>
            {currentOrg ? (
              <>
                <i className="bi bi-building" aria-hidden="true"></i>
                <span>{currentOrg.name}</span>
              </>
            ) : (
              <>
                <i className="bi bi-exclamation-circle" aria-hidden="true"></i>
                <span>Aucune organisation</span>
              </>
            )}
          </div>
        </div>
        
        <i className={`bi bi-chevron-up ${styles.dropdownIcon}`} aria-hidden="true"></i>
      </button>

      {showDropdown && (
        <div 
          id="organization-dropdown-main"
          className={styles.dropdownMenu}
          role="listbox"
          aria-label="Liste des organisations"
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
          
          {/* Liste des organisations existantes */}
          <div className={styles.dropdownSection}>
            <div className={styles.dropdownSectionTitle}>Mes organisations</div>
            
            {userOrgs.map((org, index) => (
              <button
                key={org.id}
                className={`${styles.dropdownItem} ${org.id === currentOrg?.id ? styles.dropdownItemActive : ''}`}
                onClick={() => handleOrganizationChange(org.id)}
                role="option"
                aria-selected={org.id === currentOrg?.id}
                data-index={index}
                tabIndex={selectedIndex === index ? 0 : -1}
              >
                <div className={styles.itemContent}>
                  <div className={styles.itemInfo}>
                    <div className={styles.itemTitle}>
                      {org.name}
                      {org.userRole === 'owner' && ' (Propriétaire)'}
                      {org.userRole === 'admin' && ' (Admin)'}
                    </div>
                    <div className={styles.itemSubtitle}>
                      {org.settings?.timezone || 'Europe/Paris'} • {org.settings?.currency || 'EUR'}
                    </div>
                  </div>
                  {org.id === currentOrg?.id && (
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
              onClick={handleCreateOrganization}
              data-index={userOrgs.length}
              tabIndex={selectedIndex === userOrgs.length ? 0 : -1}
            >
              <div className={styles.itemContent}>
                <i className={`bi bi-plus-circle ${styles.itemIcon}`} aria-hidden="true"></i>
                <span>Créer une organisation</span>
              </div>
            </button>
            
            <button
              className={styles.dropdownItem}
              onClick={handleJoinOrganization}
              data-index={userOrgs.length + 1}
              tabIndex={selectedIndex === userOrgs.length + 1 ? 0 : -1}
            >
              <div className={styles.itemContent}>
                <i className={`bi bi-people ${styles.itemIcon}`} aria-hidden="true"></i>
                <span>Rejoindre une organisation</span>
              </div>
            </button>
            
            <div className={styles.dropdownDivider}></div>
            
            <button
              className={styles.dropdownItem}
              onClick={() => {
                setShowDropdown(false);
                window.location.href = '/parametres/organisations';
              }}
              data-index={userOrgs.length + 2}
              tabIndex={selectedIndex === userOrgs.length + 2 ? 0 : -1}
            >
              <div className={styles.itemContent}>
                <i className={`bi bi-gear ${styles.itemIcon}`} aria-hidden="true"></i>
                <span>Gérer les organisations</span>
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

export default OrganizationSelector; 