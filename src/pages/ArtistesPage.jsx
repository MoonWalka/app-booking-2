import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ArtistesList from '../components/artistes/ArtistesList';
import ArtisteForm from '../components/artistes/ArtisteForm';
import ArtisteDetail from '../components/artistes/ArtisteDetail';

function ArtistesPage() {
  return (
    <div className="artistes-page">
      <Routes>
        <Route path="/" element={<ArtistesList />} />
        <Route path="/nouveau" element={<ArtisteForm />} />
        <Route path="/:id" element={<ArtisteDetail />} />
        <Route path="/:id/modifier" element={<ArtisteForm />} />
        {/* Route de secours pour rediriger les chemins inconnus */}
        <Route path="*" element={<Navigate to="/artistes" replace />} />
      </Routes>
    </div>
  );
}


export default ArtistesPage;
