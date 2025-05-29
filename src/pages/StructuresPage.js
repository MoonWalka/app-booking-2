import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import StructuresList from '../components/structures/desktop/StructuresList';
import StructureFormEnhanced from '../components/structures/desktop/StructureFormEnhanced';
import StructureDetails from '../components/structures/desktop/StructureDetails';
import useResponsive from '../hooks/common/useResponsive';
import MobileStructuresList from '../components/structures/mobile/StructuresList';
import MobileStructureDetails from '../components/structures/mobile/StructureDetails';
import MobileStructureForm from '../components/structures/mobile/StructureForm';

const StructuresPage = () => {
  const { isMobile } = useResponsive();

  // Utiliser les composants adaptés selon le type d'appareil
  return (
    <Routes>
      <Route path="/" element={isMobile ? <MobileStructuresList /> : <StructuresList />} />
      <Route path="/nouveau" element={isMobile ? <MobileStructureForm /> : <StructureFormEnhanced />} />
      <Route path="/new" element={<Navigate to="/structures/nouveau" replace />} />
      <Route path="/:id" element={isMobile ? <MobileStructureDetails /> : <StructureDetails />} />
      <Route path="/:id/edit" element={isMobile ? <MobileStructureForm /> : <StructureFormEnhanced />} />
      <Route path="*" element={<Navigate to="/structures" replace />} />
    </Routes>
  );
};

export default StructuresPage;