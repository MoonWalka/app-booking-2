// components/common/PublicFormLayout.jsx
import React from 'react';
import { APP_NAME } from '@/config.js';

function PublicFormLayout({ children }) {
  return (
    <div className="form-isolated-container">
      <header className="form-header">
        <div className="form-logo">
          <h2>{APP_NAME}</h2>
        </div>
      </header>
      
      <main className="form-content">
        {children}
      </main>
      
      <footer className="form-footer">
        <p>© {new Date().getFullYear()} TourCraft - Formulaire sécurisé</p>
      </footer>
    </div>
  );
}

export default PublicFormLayout;
