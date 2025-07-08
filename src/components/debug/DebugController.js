/**
 * Contrôleur pour afficher/masquer le panneau de debug
 * Bouton flottant discret dans le coin de l'écran
 */
import React, { useState } from 'react';
// import OrganizationIdDebug from './OrganizationIdDebug'; // Supprimé
import styles from './DebugController.module.css';

const DebugController = () => {
  const [isDebugVisible, setIsDebugVisible] = useState(false);

  return (
    <>
      {/* Bouton flottant pour ouvrir le debug */}
      <button
        className={styles.debugButton}
        onClick={() => setIsDebugVisible(true)}
        title="Ouvrir le panneau de debug OrganizationId"
      >
        🔍
      </button>

      {/* Panneau de debug */}
      {/* <OrganizationIdDebug
        isVisible={isDebugVisible}
        onClose={() => setIsDebugVisible(false)}
        initialPosition={{ x: 20, y: 100 }}
      /> */}
    </>
  );
};

export default DebugController; 