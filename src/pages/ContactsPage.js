import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ContactsList from '@/components/contacts/ContactsList';
import ContactView from '@/components/contacts/desktop/ContactView';
import ContactForm from '@/components/contacts/desktop/ContactForm';

const ContactsPage = () => {
  return (
    <div className="contacts-page">
      <Routes>
        <Route path="/" element={<ContactsList />} />
        <Route path="/nouveau" element={<ContactForm />} />
        <Route path="/:id/edit" element={<ContactForm />} />
        <Route path="/:id" element={<ContactView />} />
      </Routes>
    </div>
  );
};

export default ContactsPage;
