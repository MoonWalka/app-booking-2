import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ProgrammateursList from '@/components/programmateurs/ProgrammateursList';
import ProgrammateurDetails from '@/components/programmateurs/ProgrammateurDetails';
import ProgrammateurFormMaquette from '@/components/programmateurs/desktop/ProgrammateurFormMaquette';

const ProgrammateursPage = () => {
  return (
    <div className="programmateurs-page">
      <Routes>
        <Route path="/" element={<ProgrammateursList />} />
        <Route path="/nouveau" element={<ProgrammateurFormMaquette />} />
        <Route path="/:id/edit" element={<ProgrammateurFormMaquette />} />
        <Route path="/:id" element={<ProgrammateurDetails />} />
      </Routes>
    </div>
  );
};

export default ProgrammateursPage;
