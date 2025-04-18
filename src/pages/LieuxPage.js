import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LieuxList from '../components/lieux/LieuxList';
import LieuDetails from '../components/lieux/LieuDetails';
import LieuForm from '../components/forms/LieuForm';

const LieuxPage = () => {
  return (
    <div>
      <h1>Lieux</h1>
      <Routes>
        <Route path="/" element={<LieuxList />} />
        <Route path="/nouveau" element={<LieuForm />} />
        <Route path="/edit/:id" element={<LieuForm />} />
        <Route path="/:id" element={<LieuDetails />} />
      </Routes>
    </div>
  );
};

export default LieuxPage;
