import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ProgrammateurForm from '../components/forms/ProgrammateurForm';
import FormValidationInterface from '../components/forms/FormValidationInterface';

function FormResponsePage() {
  return (
    <div className="form-response-page">
      <Routes>
        <Route path="/:concertId/:token" element={<ProgrammateurForm />} />
        <Route path="/validation/:id" element={<FormValidationInterface />} />
      </Routes>
    </div>
  );
}

export default FormResponsePage;
