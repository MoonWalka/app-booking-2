import React, { useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import ConcertsList from '@/components/concerts/ConcertsList.js';
import ConcertForm from '@/components/concerts/ConcertForm/';
import ConcertDetails from '@/components/concerts/ConcertDetails';
import FormValidationInterface from '@/components/forms/desktop/FormValidationInterface';



function ConcertsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Log pour suivre chaque rendu de ConcertsPage et l'URL active
  useEffect(() => {
    console.log(`[🔍 ROUTE] ConcertsPage rendu à ${location.pathname}`);
    console.log("[ConcertsPage] Rendu. Location:", location.pathname);
    return () => {
      console.log(`[🔍 ROUTE] ConcertsPage démonté depuis ${location.pathname}`);
    };
  }, [location.pathname]);
  
  return (
    <div className="concerts-page">
      <Routes>
        <Route path="/" element={<ConcertsList />} />
        <Route 
          path="/nouveau" 
          element={
            <React.Profiler id="ConcertForm-nouveau" onRender={(id, phase) => {
              console.log(`[🔍 ROUTE] ${id} ${phase}`);
              console.log("[ConcertsPage] Route: /nouveau");
            }}>
              <ConcertForm />
            </React.Profiler>
          } 
        />
        <Route 
          path="/:id" 
          element={
            <React.Profiler id="ConcertDetails" onRender={(id, phase) => {
              console.log(`[🔍 ROUTE] ${id} ${phase}`);
              console.log("[ConcertsPage] Route: /:id");
            }}>
              <ConcertDetails />
            </React.Profiler>
          } 
        />
        <Route 
          path="/:id/edit" 
          element={
            <React.Profiler id="ConcertForm-edit" onRender={(id, phase) => {
              console.log(`[🔍 ROUTE] ${id} ${phase}`);
              console.log("[ConcertsPage] Route: /:id/edit");
            }}>
              <ConcertForm />
            </React.Profiler>
          } 
        />
        <Route path="/:id/form" element={<FormValidationInterface />} />
      </Routes>
    </div>
  );
}

export default ConcertsPage;
