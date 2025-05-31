import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import StructuresList from '../components/structures/StructuresList';
import StructureForm from '../components/structures/desktop/StructureForm';
import StructureDetails from '../components/structures/desktop/StructureDetails';

const StructuresPage = () => {
  // Utiliser la version simple qui fonctionne sans hooks complexes
  return (
    <Routes>
      <Route path="/" element={<StructuresList />} />
      <Route path="/nouveau" element={<StructureForm />} />
      <Route path="/new" element={<Navigate to="/structures/nouveau" replace />} />
      <Route path="/:id" element={<StructureDetails />} />
      <Route path="/:id/edit" element={<StructureForm />} />
      <Route path="*" element={<Navigate to="/structures" replace />} />
    </Routes>
  );
};

export default StructuresPage;