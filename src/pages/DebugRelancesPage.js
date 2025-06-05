/**
 * @fileoverview Page de debug pour les relances automatiques
 * Page autonome accessible via /debug-relances pour tester le système
 * 
 * @author TourCraft Team
 * @since 2025
 */

import React from 'react';
import RelancesAutomatiquesTest from '@/components/debug/RelancesAutomatiquesTest';

/**
 * Page autonome pour tester les relances automatiques
 * Accessible via /debug-relances
 * 
 * @returns {JSX.Element} Page de debug
 */
const DebugRelancesPage = () => {
  return (
    <div className="container-fluid py-4">
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1 className="h3">🤖 Debug Relances Automatiques</h1>
            <div className="text-muted">
              <i className="bi bi-info-circle me-2"></i>
              Page de diagnostic et test des relances automatiques
            </div>
          </div>
          
          <RelancesAutomatiquesTest />
        </div>
      </div>
    </div>
  );
};

export default DebugRelancesPage;