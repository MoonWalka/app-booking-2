import React, { useState } from 'react';
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
      </Routes>
    </div>
  );
}

export default ConcertsPage;
