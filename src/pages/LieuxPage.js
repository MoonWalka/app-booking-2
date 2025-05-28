import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LieuxList from '@/components/lieux/LieuxList';
import LieuDetails from '@/components/lieux/LieuDetails';
import LieuForm from '@/components/lieux/LieuForm';
import '@styles/index.css';

const LieuxPage = () => {
  return (
    <div className="lieux-page">
      <Routes>
        <Route path="/" element={<LieuxList />} />
        <Route path="/nouveau" element={<LieuForm />} />
        <Route path="/:id" element={<LieuDetails />} />
        <Route path="/:id/edit" element={<LieuForm />} />
      </Routes>
    </div>
  );
};

export default LieuxPage;
