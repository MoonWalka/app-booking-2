import React, { useState } from 'react';

function Contacts() {
  const [activeSection, setActiveSection] = useState('liste');

  const renderContent = () => {
    switch(activeSection) {
      case 'liste':
        return (
          <div>
            <h2>Liste des contacts</h2>
            <p style={{ marginTop: '15px', color: '#7f8c8d' }}>
              Ici s'affichera la liste de tous vos contacts avec leurs informations principales.
            </p>
            <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
              <strong>Exemple de contact :</strong><br />
              Jean Dupont - jean.dupont@example.com - 06 12 34 56 78
            </div>
          </div>
        );
      case 'nouveau':
        return (
          <div>
            <h2>Nouveau contact</h2>
            <p style={{ marginTop: '15px', color: '#7f8c8d' }}>
              Formulaire pour créer un nouveau contact.
            </p>
            <div style={{ marginTop: '20px' }}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Nom :</label>
                <input type="text" style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Email :</label>
                <input type="email" style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Téléphone :</label>
                <input type="tel" style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
              </div>
            </div>
          </div>
        );
      case 'recherche':
        return (
          <div>
            <h2>Recherche de contacts</h2>
            <p style={{ marginTop: '15px', color: '#7f8c8d' }}>
              Outils de recherche et filtrage des contacts.
            </p>
            <div style={{ marginTop: '20px' }}>
              <input 
                type="text" 
                placeholder="Rechercher un contact..." 
                style={{ 
                  width: '100%', 
                  padding: '12px', 
                  border: '1px solid #ddd', 
                  borderRadius: '4px',
                  fontSize: '16px'
                }} 
              />
            </div>
          </div>
        );
      default:
        return <div>Section non trouvée</div>;
    }
  };

  return (
    <>
      <div className="page-header">
        <h1>Contacts</h1>
        <p>Gestion de vos contacts</p>
      </div>
      <div className="page-content">
        <div className="contact-layout">
          <div className="contact-menu">
            <h3>Menu</h3>
            <ul>
              <li>
                <a 
                  href="#" 
                  className={activeSection === 'liste' ? 'active' : ''}
                  onClick={(e) => { e.preventDefault(); setActiveSection('liste'); }}
                >
                  Liste
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  className={activeSection === 'nouveau' ? 'active' : ''}
                  onClick={(e) => { e.preventDefault(); setActiveSection('nouveau'); }}
                >
                  Nouveau
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  className={activeSection === 'recherche' ? 'active' : ''}
                  onClick={(e) => { e.preventDefault(); setActiveSection('recherche'); }}
                >
                  Recherche
                </a>
              </li>
            </ul>
          </div>
          <div className="contact-container">
            {renderContent()}
          </div>
        </div>
      </div>
    </>
  );
}

export default Contacts;