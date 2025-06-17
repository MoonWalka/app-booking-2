import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { isMenuItemActive } from '@/config/sidebarConfig';
import styles from './Sidebar.module.css';

const SidebarItem = ({ item, currentPath, userRole }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Vérifier si l'élément doit être masqué (adminOnly)
  if (item.adminOnly && userRole !== 'admin') {
    return null;
  }

  // Élément simple avec lien direct
  if (item.type === 'single' || (!item.type && item.path)) {
    const isActive = isMenuItemActive(item.path, currentPath);
    return (
      <li className={styles.navItem}>
        <Link 
          to={item.path} 
          className={`${styles.navLink} ${isActive ? styles.active : ''}`}
        >
          <i className={item.icon}></i>
          <span className={styles.navLabel}>{item.label}</span>
          <div className={styles.tooltip}>{item.label}</div>
        </Link>
      </li>
    );
  }

  // Section ou sous-section avec éléments enfants
  if (item.type === 'section' || item.type === 'subsection') {
    const hasActiveChild = item.items?.some(child => 
      child.path && isMenuItemActive(child.path, currentPath)
    );
    
    const shouldExpand = hasActiveChild || isExpanded;

    return (
      <li className={`${styles.navItem} ${styles.navSection} ${item.type === 'subsection' ? styles.navSubsection : ''}`}>
        <div 
          className={`${styles.navSectionHeader} ${shouldExpand ? styles.expanded : ''}`}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className={styles.navSectionTitle}>
            <i className={item.icon}></i>
            <span className={styles.navLabel}>{item.label}</span>
          </div>
          <i className={`bi-chevron-right ${styles.expandIcon} ${shouldExpand ? styles.rotated : ''}`}></i>
          <div className={styles.tooltip}>{item.label}</div>
        </div>
        
        {shouldExpand && (
          <ul className={`${styles.navSublist} ${item.type === 'subsection' ? styles.navSubSublist : ''}`}>
            {item.items.map(subItem => (
              <SidebarItem 
                key={subItem.id}
                item={subItem}
                currentPath={currentPath}
                userRole={userRole}
              />
            ))}
          </ul>
        )}
      </li>
    );
  }

  return null;
};

export default SidebarItem;