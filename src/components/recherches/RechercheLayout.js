import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styles from './RechercheLayout.module.css';

/**
 * Layout principal pour les pages de recherche
 * Inclut un menu latéral permanent et un container principal
 */
const RechercheLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('identification');
  const [selectedCriteria, setSelectedCriteria] = useState([]);

  // Configuration du menu de recherche
  const menuItems = [
    {
      id: 'identification',
      label: 'Identification',
      icon: 'bi-person-badge',
    },
    {
      id: 'historique',
      label: 'Historique',
      icon: 'bi-clock-history',
    },
    {
      id: 'personnes',
      label: 'Personnes',
      icon: 'bi-people',
    },
    {
      id: 'activites',
      label: 'Activités',
      icon: 'bi-briefcase',
    },
    {
      id: 'reseaux',
      label: 'Réseaux',
      icon: 'bi-diagram-3',
    },
    {
      id: 'genres',
      label: 'Genres',
      icon: 'bi-music-note-list',
    },
    {
      id: 'mots-cles',
      label: 'Mots-clés',
      icon: 'bi-tags',
    },
    {
      id: 'mes-selections',
      label: 'Mes sélections',
      icon: 'bi-bookmark-star',
    },
    {
      id: 'suivi',
      label: 'Suivi',
      icon: 'bi-eye',
    },
    {
      id: 'geolocalisation',
      label: 'Géolocalisation',
      icon: 'bi-geo-alt',
    },
    {
      id: 'festivals',
      label: 'Festivals',
      icon: 'bi-calendar-event',
    },
    {
      id: 'salles',
      label: 'Salles',
      icon: 'bi-building',
    },
    {
      id: 'docs-promo',
      label: 'Docs promo',
      icon: 'bi-file-earmark-text',
    },
    {
      id: 'infos-artiste',
      label: 'Infos artiste',
      icon: 'bi-info-circle',
    },
    {
      id: 'emailing',
      label: 'eMailing',
      icon: 'bi-envelope',
    },
    {
      id: 'gestion-projets',
      label: 'Gestion de projets',
      icon: 'bi-kanban',
    },
    {
      id: 'dates',
      label: 'Dates',
      icon: 'bi-calendar3',
    }
  ];

  const handleMenuClick = (item) => {
    setActiveSection(item.id);
  };

  // Fonction pour ajouter/supprimer des critères
  const addCriteria = (criteria) => {
    setSelectedCriteria(prev => [...prev, criteria]);
  };

  const removeCriteria = (criteriaId) => {
    setSelectedCriteria(prev => prev.filter(c => c.id !== criteriaId));
  };

  const clearCriteria = () => {
    setSelectedCriteria([]);
  };

  return (
    <div className={styles.rechercheLayout}>
      {/* Menu latéral permanent */}
      <aside className={styles.sideMenu}>
        <div className={styles.menuHeader}>
          <h5>
            <i className="bi bi-search me-2"></i>
            Recherches
          </h5>
        </div>
        
        <nav className={styles.menuNav}>
          {/* Menu items à ajouter */}
          {menuItems.length === 0 ? (
            <p className="text-muted text-center mt-4">
              <i className="bi bi-list-ul me-2"></i>
              Menu en attente de configuration
            </p>
          ) : (
            menuItems.map(item => (
              <button
                key={item.id}
                className={`${styles.menuItem} ${activeSection === item.id ? styles.active : ''}`}
                onClick={() => handleMenuClick(item)}
              >
                <i className={`${item.icon} me-2`}></i>
                <span>{item.label}</span>
              </button>
            ))
          )}
        </nav>
      </aside>

      {/* Container principal avec colonne de critères */}
      <div className={styles.mainContainer}>
        <div className={styles.contentArea}>
          {/* Zone principale où le contenu change */}
          <div className={styles.content}>
            {React.cloneElement(children, { 
              activeSection, 
              onCriteriaChange: addCriteria,
              selectedCriteria 
            })}
          </div>

          {/* Colonne de critères (toujours visible) */}
          <aside className={styles.criteriaColumn}>
            <div className={styles.criteriaHeader}>
              <h6>
                <i className="bi bi-funnel me-2"></i>
                Critères sélectionnés
              </h6>
            </div>
            
            <div className={styles.criteriaContent}>
              {selectedCriteria.length === 0 ? (
                <p className="text-muted text-center mt-4">
                  <i className="bi bi-info-circle me-2"></i>
                  Aucun critère sélectionné
                </p>
              ) : (
                <div className={styles.criteriaList}>
                  {selectedCriteria.map((criteria) => (
                    <div key={criteria.id} className={styles.criteriaItem}>
                      <span className={styles.criteriaLabel}>
                        {criteria.field}: {criteria.operator} {criteria.value}
                      </span>
                      <button
                        className={styles.removeCriteria}
                        onClick={() => removeCriteria(criteria.id)}
                      >
                        <i className="bi bi-x"></i>
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Boutons d'action */}
              <div className={styles.criteriaActions}>
                <button 
                  className="btn btn-primary w-100 mb-2"
                  disabled={selectedCriteria.length === 0}
                >
                  <i className="bi bi-calculator me-2"></i>
                  Calculer
                </button>
                <button 
                  className="btn btn-outline-secondary w-100 mb-2"
                  disabled={selectedCriteria.length === 0}
                >
                  <i className="bi bi-save me-2"></i>
                  Enregistrer
                </button>
                <button 
                  className="btn btn-outline-primary w-100"
                  disabled={selectedCriteria.length === 0}
                >
                  <i className="bi bi-eye me-2"></i>
                  Afficher
                </button>
                {selectedCriteria.length > 0 && (
                  <button 
                    className="btn btn-link w-100 mt-2"
                    onClick={clearCriteria}
                  >
                    <i className="bi bi-trash me-2"></i>
                    Effacer tout
                  </button>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default RechercheLayout;