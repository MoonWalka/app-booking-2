import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ProgrammateursList from '@/components/programmateurs/ProgrammateursList';
import ProgrammateurDetails from '@/components/programmateurs/ProgrammateurDetails';
import ProgrammateurForm from '@/components/programmateurs/ProgrammateurForm';

const ProgrammateursPage = () => {
  return (
    <div className="programmateurs-page">
      <Routes>
        <Route path="/" element={<ProgrammateursList />} />
        <Route path="/nouveau" element={<ProgrammateurForm />} />
        <Route path="/:id/edit" element={<ProgrammateurForm />} />
        <Route path="/:id" element={<ProgrammateurDetails />} />
      </Routes>
    </div>
  );
};

export default ProgrammateursPage;
