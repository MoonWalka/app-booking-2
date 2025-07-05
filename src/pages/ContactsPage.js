import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import ContactsList from '@/components/contacts/ContactsList';
import ContactView from '@/components/contacts/desktop/ContactView';
import ContactForm from '@/components/contacts/desktop/ContactForm';
import ContactTypeSelector from '@/components/contacts/ContactTypeSelector';

const ContactsPage = ({ tabPath }) => {
  const location = useLocation();
  
  console.log('[ContactsPage] Rendu avec location.pathname:', location.pathname);
  console.log('[ContactsPage] window.location.pathname:', window.location.pathname);
  console.log('[ContactsPage] tabPath reçu:', tabPath);
  
  // Utiliser le tabPath de l'onglet au lieu de l'URL du navigateur
  const effectivePath = tabPath || window.location.pathname;
  const subPath = effectivePath.replace('/contacts', '') || '/';
  
  console.log('[ContactsPage] effectivePath:', effectivePath);
  console.log('[ContactsPage] subPath calculé:', subPath);
  
  // Note: Les modals sont maintenant gérées globalement dans ContactModalsContainer
  
  // Pour la route racine "/contacts", afficher directement la liste
  if (subPath === '/') {
    return (
      <div className="contacts-page">
        <ContactsList />
      </div>
    );
  }
  
  // Rendu direct basé sur le chemin de l'onglet
  if (subPath.startsWith('/nouveau/')) {
    const type = subPath.split('/')[2]; // Extraire 'structure' ou 'personne'
    console.log('[ContactsPage] Type détecté:', type);
    
    // Pour les créations, rediriger vers la liste des contacts
    // Les modals sont gérées globalement maintenant
    return (
      <div className="contacts-page">
        <ContactsList />
      </div>
    );
  }
  
  if (subPath === '/nouveau') {
    return (
      <div className="contacts-page">
        <ContactTypeSelector />
      </div>
    );
  }
  
  // Rendu par défaut avec React Router pour les autres cas
  return (
    <div className="contacts-page">
      <Routes>
        <Route path="/" element={<ContactsList />} />
        <Route path="/nouveau" element={<ContactTypeSelector />} />
        <Route path="/:id/edit" element={<ContactForm />} />
        <Route path="/:id" element={<ContactView />} />
        <Route path="*" element={<Navigate to="/contacts" replace />} />
      </Routes>
    </div>
  );
};

export default ContactsPage;
