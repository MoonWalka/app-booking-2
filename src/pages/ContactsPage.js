import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ContactsList from '@/components/contacts/ContactsList';
import ContactDetails from '@/components/contacts/ContactDetails';
import ContactDetailsRefactored from '@/components/contacts/ContactDetailsRefactored';
import ContactFormMaquette from '@/components/contacts/desktop/ContactFormMaquette';

const ContactsPage = () => {
  return (
    <div className="contacts-page">
      <Routes>
        <Route path="/" element={<ContactsList />} />
        <Route path="/nouveau" element={<ContactFormMaquette />} />
        <Route path="/:id/edit" element={<ContactFormMaquette />} />
        <Route path="/:id" element={<ContactDetails />} />
        <Route path="/:id/refactored" element={<ContactDetailsRefactored />} />
      </Routes>
    </div>
  );
};

export default ContactsPage;
