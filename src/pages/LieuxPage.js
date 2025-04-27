import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LieuxList from '@/components/lieux/LieuxList';
import LieuDetails from '@/components/lieux/desktop/LieuDetails';
import LieuForm from '@/components/forms/LieuForm';
import '@styles/index.css';

const LieuxPage = () => {
  return (
    <div className="lieux-page p-3 p-lg-4">
      <div className="container-fluid px-0">
        <Routes>
          <Route path="/" element={<LieuxList />} />
          <Route path="/nouveau" element={<LieuForm />} />
          <Route path="/edit/:id" element={<LieuForm />} />
          <Route path="/:id" element={<LieuDetails />} />
        </Routes>
      </div>
    </div>
  );
};

export default LieuxPage;
