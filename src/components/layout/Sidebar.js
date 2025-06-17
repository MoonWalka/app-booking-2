import React, { useContext } from 'react';
import { useLocation } from 'react-router-dom';
import { AuthContext } from '@/context/AuthContext';
import { APP_NAME } from '@/config.js';
import { sidebarConfig } from '@/config/sidebarConfig';
import SidebarItem from './SidebarItem';
import styles from './Sidebar.module.css';

const Sidebar = () => {
  console.log("Le composant Sidebar est rendu avec nouvelle structure hiérarchique");
  
  const location = useLocation();
  const currentPath = location.pathname;
  
  // Récupération du rôle utilisateur pour les éléments adminOnly
  const { user } = useContext(AuthContext) || {};
  const userRole = user?.role || 'user';

  return (
    <div className={styles.sidebar}>
      <div className={styles.sidebarHeader}>
        <h5>{APP_NAME}</h5>
      </div>
      <div className={styles.sidebarContent}>
        <ul className={styles.navLinks}>
          {sidebarConfig.map(item => (
            <SidebarItem 
              key={item.id}
              item={item}
              currentPath={currentPath}
              userRole={userRole}
            />
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
