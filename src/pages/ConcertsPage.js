import React from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import ConcertsList from '@components/concerts/ConcertsList.js';
import ConcertForm from '../components/concerts/desktop/ConcertForm.js.systematic_bak';
import ConcertDetails from '../components/concerts/ConcertDetails.js.path_bak';
import FormValidationInterface from '@components/forms/desktop/FormValidationInterface.js';

function ConcertsPage() {
  const navigate = useNavigate();
  
  return (
    <div className="concerts-page">
      <Routes>
        <Route path="/" element={<ConcertsList />} />
        <Route path="/nouveau" element={<ConcertForm />} />
        <Route path="/:id" element={<ConcertDetails />} />
        <Route path="/:id/edit" element={<ConcertForm />} />
        <Route path="/:id/form" element={<FormValidationInterface />} />
      </Routes>
    </div>
  );
}


export default ConcertsPage;
