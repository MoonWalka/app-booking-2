import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ProgrammateursList from '@/components/programmateurs/ProgrammateursList';
import ProgrammateurDetails from '@/components/programmateurs/ProgrammateurDetails';
import ProgrammateurForm from '@/components/programmateurs/ProgrammateurForm';

const ProgrammateursPage = () => {
  return (
    <div>
      <h1>Programmateurs</h1>
      <Routes>
        <Route path="/" element={<ProgrammateursList />} />
        <Route path="/nouveau" element={<ProgrammateurForm />} />
        <Route path="/edit/:id" element={<ProgrammateurForm />} />
        <Route path="/:id" element={<ProgrammateurDetails />} />
      </Routes>
    </div>
  );
};

export default ProgrammateursPage;
