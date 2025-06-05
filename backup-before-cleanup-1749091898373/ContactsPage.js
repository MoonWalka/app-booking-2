import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ContactsList from '@/components/contacts/ContactsList';
import ContactViewModern from '@/components/contacts/desktop/ContactViewModern';
import ContactFormMaquette from '@/components/contacts/desktop/ContactFormMaquette';

const ContactsPage = () => {
  return (
    <div className="contacts-page">
      <Routes>
        <Route path="/" element={<ContactsList />} />
        <Route path="/nouveau" element={<ContactFormMaquette />} />
        <Route path="/:id/edit" element={<ContactFormMaquette />} />
        <Route path="/:id" element={<ContactViewModern />} />
      </Routes>
    </div>
  );
};

export default ContactsPage;
