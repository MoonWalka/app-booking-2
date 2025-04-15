// components/common/PublicFormLayout.jsx
import React from 'react';

function PublicFormLayout({ children }) {
  return (
    <div className="form-isolated-container">
      <header className="form-header">
        <div className="form-logo">
          <h2>Label Musical</h2>
        </div>
      </header>
      
      <main className="form-content">
        {children}
      </main>
      
      <footer className="form-footer">
        <p>© {new Date().getFullYear()} Label Musical - Formulaire sécurisé</p>
      </footer>
    </div>
  );
}

export default PublicFormLayout;
