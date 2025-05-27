import React, { useState } from 'react';
import PropTypes from 'prop-types';
import '../../styles/components/navigation.css';

/**
 * Composant de navigation par onglets standardisé TourCraft
 *
 * @param {Array} tabs - Liste des onglets [{ label, content, icon, disabled }]
 * @param {number} initialActive - Index de l'onglet actif par défaut
 * @param {function} onTabChange - Callback appelé lors du changement d'onglet (index)
 * @param {number} activeTab - (optionnel) Contrôle externe de l'onglet actif
 * @param {boolean} vertical - Affichage vertical (colonne)
 */
const TabNavigation = ({
  tabs = [],
  initialActive = 0,
  onTabChange,
  activeTab,
  vertical = false
}) => {
  const [internalActive, setInternalActive] = useState(initialActive);
  const currentActive = typeof activeTab === 'number' ? activeTab : internalActive;

  const handleTabClick = (idx, disabled) => {
    if (disabled) return;
    if (typeof activeTab !== 'number') setInternalActive(idx);
    if (onTabChange) onTabChange(idx);
  };

  return (
    <div>
      <nav
        className={`tc-tabs${vertical ? ' tc-tabs-vertical' : ''}`}
        role="tablist"
        aria-orientation={vertical ? 'vertical' : 'horizontal'}
      >
        {tabs.map((tab, idx) => (
          <button
            key={tab.label || idx}
            className={`tc-tab${currentActive === idx ? ' tc-active' : ''}`}
            role="tab"
            aria-selected={currentActive === idx}
            aria-controls={`tab-panel-${idx}`}
            id={`tab-${idx}`}
            tabIndex={tab.disabled ? -1 : 0}
            disabled={tab.disabled}
            type="button"
            onClick={() => handleTabClick(idx, tab.disabled)}
            style={vertical ? { width: '100%', textAlign: 'left' } : {}}
          >
            {tab.icon && <span className="tc-tab-icon">{tab.icon}</span>}
            {tab.label}
          </button>
        ))}
      </nav>
      {tabs.map((tab, idx) => (
        tab.content ? (
          <div
            key={tab.label || idx}
            className={`tc-tab-content${currentActive === idx ? ' tc-active' : ''}`}
            role="tabpanel"
            id={`tab-panel-${idx}`}
            aria-labelledby={`tab-${idx}`}
            hidden={currentActive !== idx}
          >
            {tab.content}
          </div>
        ) : null
      ))}
    </div>
  );
};

TabNavigation.propTypes = {
  tabs: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.node.isRequired,
      content: PropTypes.node, // Rendu optionnel pour permettre null
      icon: PropTypes.node,
      disabled: PropTypes.bool
    })
  ).isRequired,
  initialActive: PropTypes.number,
  onTabChange: PropTypes.func,
  activeTab: PropTypes.number,
  vertical: PropTypes.bool
};

export default TabNavigation;
