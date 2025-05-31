import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import StructuresListSimple from '../components/structures/StructuresListSimple';
import StructureFormEnhanced from '../components/structures/desktop/StructureFormEnhanced';
import StructureDetails from '../components/structures/desktop/StructureDetails';

const StructuresPage = () => {
  // Utiliser la version simple qui fonctionne sans hooks complexes
  return (
    <Routes>
      <Route path="/" element={<StructuresListSimple />} />
      <Route path="/nouveau" element={<StructureFormEnhanced />} />
      <Route path="/new" element={<Navigate to="/structures/nouveau" replace />} />
      <Route path="/:id" element={<StructureDetails />} />
      <Route path="/:id/edit" element={<StructureFormEnhanced />} />
      <Route path="*" element={<Navigate to="/structures" replace />} />
    </Routes>
  );
};

export default StructuresPage;