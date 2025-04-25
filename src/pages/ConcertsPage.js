import React from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import ConcertsList from '@/components/concerts/ConcertsList.js';
import ConcertForm from '@/components/concerts/desktop/ConcertForm';
import ConcertDetails from '@/components/concerts/ConcertDetails';
import FormValidationInterface from '@/components/forms/desktop/FormValidationInterface';

// Imports modifiés de la branche refacto-structure-scriptshell - pour implémentation future
{/* 
import React from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import ConcertsList from '@components/concerts/ConcertsList';
import ConcertDetails from '@components/concerts/ConcertDetails';
import ConcertForm from '@components/concerts/ConcertForm';
import FormValidationInterface from '@components/forms/FormValidationInterface';
import '@styles/index.css';
*/}
// Note: Les imports utilisent des alias différents comme '@components' au lieu de '@/components'
// et les chemins de fichiers sont différents (pas de sous-dossier desktop/)
// Vous devrez vérifier que ces alias sont correctement configurés dans votre projet

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
