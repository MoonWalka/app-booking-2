import React from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import ConcertsList from '../components/concerts/ConcertsList';
import ConcertForm from '../components/concerts/ConcertForm';
import ConcertDetails from '../components/concerts/ConcertDetails';
import FormValidationInterface from '../components/forms/FormValidationInterface';

function ConcertsPage() {
  const navigate = useNavigate();
  
  return (
    <div className="concerts-page">
      <Routes>
        <Route path="/" element={<ConcertsList />} />
        <Route path="/nouveau" element={<ConcertForm />} />
        <Route path="/:id" element={<ConcertDetails />} />
        <Route path="/:id/edit" element={<ConcertForm />} />
        {/* Route modifiée pour utiliser le composant FormValidationInterface */}
        <Route path="/:id/form" element={<FormValidationInterface />} />
      </Routes>
    </div>
  );
}

export default ConcertsPage;
