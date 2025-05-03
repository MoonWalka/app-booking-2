import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import StructuresList from '../components/structures/desktop/StructuresList';
import StructureForm from '../components/structures/desktop/StructureForm';
import StructureDetails from '../components/structures/desktop/StructureDetails';
import { useIsMobile } from '../hooks/useIsMobile';
import MobileStructuresList from '../components/structures/mobile/StructuresList';
import MobileStructureDetails from '../components/structures/mobile/StructureDetails';
import MobileStructureForm from '../components/structures/mobile/StructureForm';

const StructuresPage = () => {
  // TODO: Réactiver le mode mobile plus tard.
  // const isMobile = useIsMobile();
  const isMobile = false; // Force l'utilisation des composants desktop
  
  // Utiliser les composants adaptés selon le type d'appareil
  return (
    <Routes>
      <Route path="/" element={isMobile ? <MobileStructuresList /> : <StructuresList />} />
      <Route path="/nouveau" element={isMobile ? <MobileStructureForm /> : <StructureForm />} />
      <Route path="/new" element={isMobile ? <MobileStructureForm /> : <StructureForm />} /> {/* Ajout de route pour supporter /structures/new */}
      <Route path="/:id" element={isMobile ? <MobileStructureDetails /> : <StructureDetails />} />
      <Route path="/:id/edit" element={isMobile ? <MobileStructureForm /> : <StructureForm />} />
      <Route path="*" element={<Navigate to="/structures" replace />} />
    </Routes>
  );
};

export default StructuresPage;