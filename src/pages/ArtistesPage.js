import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ArtistesList from '@/components/artistes/ArtistesList';
import ArtisteForm from '@/components/artistes/ArtisteForm';
import ArtisteDetail from '@/components/artistes/ArtisteDetail';

// Imports modifiés de la branche refacto-structure-scriptshell - pour implémentation future
// Note: Les imports utilisent des alias différents comme '@components' au lieu de '@/components'
// et un nom de composant différent 'ArtisteDetails' au lieu de 'ArtisteDetail'
// Vous devrez vérifier que ces alias sont correctement configurés dans votre projet

function ArtistesPage() {
  return (
    <div className="artistes-page">
      <Routes>
        <Route path="/" element={<ArtistesList />} />
        <Route path="/nouveau" element={<ArtisteForm />} />
        <Route path=":id" element={<ArtisteDetail />} />
        <Route path=":id/modifier" element={<ArtisteForm />} />
        {/* 
        Pour adopter la structure de la branche refacto-structure-scriptshell - pour implémentation future
        <Route path="/" element={<ArtistesList />} />
        <Route path="/nouveau" element={<ArtisteForm />} />
        <Route path=":id" element={<ArtisteDetails />} /> 
        <Route path=":id/modifier" element={<ArtisteForm />} />
        <Route path="*" element={<Navigate to="/artistes" replace />} />
        */}
        {/* Note: La principale différence est l'utilisation de ArtisteDetails au lieu de ArtisteDetail
           et l'ajout d'une route wildcard avec redirection */}
        <Route path="*" element={<Navigate to="/artistes" replace />} />
      </Routes>
    </div>
  );
}

export default ArtistesPage;
