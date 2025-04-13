import React from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import ConcertsList from '../components/concerts/ConcertsList';
import ConcertForm from '../components/concerts/ConcertForm';
import ConcertDetails from '../components/concerts/ConcertDetails';

function ConcertsPage() {
  const navigate = useNavigate();
  
  return (
    <div className="concerts-page">
      <Routes>
        <Route path="/" element={<ConcertsList />} />
        <Route path="/nouveau" element={<ConcertForm />} />
        <Route path="/:id" element={<ConcertDetails />} />
        {/* Ajoutez cette route pour la modification */}
        <Route path="/:id/edit" element={<ConcertForm />} />
        {/* Ajoutez cette route si vous avez besoin d'une vue de formulaire spécifique */}
        <Route path="/:id/form" element={<ConcertDetails formView={true} />} />
      </Routes>
    </div>
  );
}

export default ConcertsPage;
