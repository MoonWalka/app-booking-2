import React from 'react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorMessage from '@/components/ui/ErrorMessage';
import styles from './EntityViewTabs.module.css';

function EntityViewTabs({ 
  entity,
  loading,
  error,
  entityType,
  config,
  children,
  activeBottomTab,
  setActiveBottomTab,
  bottomTabContent, // Nouveau : contenu des onglets passé directement
  header,           // Nouveau : header passé directement
  topSections       // Nouveau : sections passées directement
}) {

  // Ne plus retourner directement le spinner pour toute la page

  if (error) {
    return (
      <div className={styles.container}>
        <ErrorMessage 
          message={`Erreur lors du chargement ${entityType === 'contact' ? 'du contact' : 'de la structure'}`}
          details={error} 
        />
      </div>
    );
  }

  if (!entity) {
    return (
      <div className={styles.container}>
        <div className={styles.notFound}>
          <i className={`bi ${config.notFoundIcon}`} style={{ fontSize: '3rem', color: '#6c757d' }}></i>
          <h3>{config.notFoundTitle}</h3>
          <p>{config.notFoundMessage}</p>
        </div>
      </div>
    );
  }

  const renderBottomTabContent = () => {
    // Priorité au contenu passé directement
    if (bottomTabContent) {
      return bottomTabContent;
    }
    
    // Fallback sur la config pour la compatibilité
    if (config.renderBottomTabContent) {
      return config.renderBottomTabContent();
    }

    // Contenu par défaut
    const activeTab = config.bottomTabs.find(tab => tab.id === activeBottomTab);
    return (
      <div className={styles.tabContent}>
        <div className={`${styles.tabContentCentered} ${styles.constructionZone}`}>
          <i className={`${activeTab.icon}`} style={{ fontSize: '3rem', color: activeTab.color }}></i>
          <h3>Section {activeTab.label}</h3>
          <p>En construction</p>
          <small>
            Cette section contiendra bientôt toutes les informations relatives aux {activeTab.label.toLowerCase()} 
            de ce {entityType === 'contact' ? 'contact' : 'cette structure'}.
          </small>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.container}>
      {/* Header optionnel entre les zones du haut et les onglets */}
      {(header || config.header) && !loading && (
        <div className={styles.headerSection}>
          {header || (config.header.render ? config.header.render(entity) : config.header.content)}
        </div>
      )}

      {/* Zones du haut configurables */}
      {loading ? (
        <div className={styles.topSection}>
          <LoadingSpinner />
        </div>
      ) : (
        (topSections || config.topSections) && (
          <div className={styles.topSection}>
            {(topSections || config.topSections).map((section, index) => (
              <div key={index} className={styles[section.className]}>
                <div className={styles.sectionHeader}>
                  <i className={typeof section.icon === 'function' ? section.icon(entity) : section.icon}></i>
                  <h2>{typeof section.title === 'function' ? section.title(entity) : section.title}</h2>
                  {section.actions && (
                    <div className={styles.sectionActions}>
                      {(typeof section.actions === 'function' ? section.actions(entity) : section.actions).map((action, actionIndex) => (
                        <button
                          key={actionIndex}
                          className={styles.actionBubble}
                          onClick={action.onClick}
                          title={action.tooltip || action.label}
                        >
                          {action.icon && <i className={action.icon}></i>}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className={styles.sectionContent}>
                  {section.render ? section.render(entity) : section.content}
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Conteneur unifié onglets + contenu */}
      <div className={styles.bottomTabsContainer}>
        {/* Barre d'onglets */}
        <div className={styles.bottomTabsBar}>
          {config.bottomTabs.map(tab => (
            <button
              key={tab.id}
              className={`${styles.bottomTab} ${activeBottomTab === tab.id ? styles.bottomTabActive : ''}`}
              onClick={() => setActiveBottomTab(tab.id)}
              style={{ 
                '--tab-color': tab.color,
                borderBottomColor: activeBottomTab === tab.id ? tab.color : 'transparent'
              }}
            >
              <i className={tab.icon}></i>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Contenu des onglets */}
        <div className={styles.bottom}>
          {renderBottomTabContent()}
        </div>
      </div>

      {/* Contenu personnalisé supplémentaire */}
      {children}
    </div>
  );
}

export default EntityViewTabs;