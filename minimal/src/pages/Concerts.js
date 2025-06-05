import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ConcertsList from '../components/ConcertsList';
import ConcertDetails from '../components/ConcertDetails';

function Concerts() {
  return (
    <>
      <div className="page-header">
        <h1>Concerts</h1>
        <p>Gestion de vos concerts</p>
      </div>
      <div className="page-content">
        <Routes>
          <Route index element={<ConcertsList />} />
          <Route path=":id" element={<ConcertDetails />} />
        </Routes>
      </div>
    </>
  );
}

export default Concerts;