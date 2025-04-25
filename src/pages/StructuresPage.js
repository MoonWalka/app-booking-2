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
  const isMobile = useIsMobile();

  // Utiliser les composants adaptés selon le type d'appareil
  return (
    <Routes>
      <Route path="/" element={isMobile ? <MobileStructuresList /> : <StructuresList />} />
      <Route path="/nouveau" element={isMobile ? <MobileStructureForm /> : <StructureForm />} />
      <Route path="/:id" element={isMobile ? <MobileStructureDetails /> : <StructureDetails />} />
      <Route path="/:id/edit" element={isMobile ? <MobileStructureForm /> : <StructureForm />} />
      <Route path="*" element={<Navigate to="/structures" replace />} />
    </Routes>
  );
};

export default StructuresPage;