import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ContactsList from '@/components/contacts/ContactsList';
import ContactDetails from '@/components/contacts/ContactDetails';
// import ContactDetailsModern from '@/components/contacts/ContactDetailsModern';
import ContactFormMaquette from '@/components/contacts/desktop/ContactFormMaquette';
import ContactsDebug from '@/components/contacts/ContactsDebug';
import ContactMigrationDebug from '@/components/debug/ContactMigrationDebug';
import ProgrammateurMigrationButton from '@/components/debug/ProgrammateurMigrationButton';

const ContactsPage = () => {
  return (
    <div className="contacts-page">
      <ProgrammateurMigrationButton />
      <ContactMigrationDebug />
      <ContactsDebug />
      <Routes>
        <Route path="/" element={<ContactsList />} />
        <Route path="/nouveau" element={<ContactFormMaquette />} />
        <Route path="/:id/edit" element={<ContactFormMaquette />} />
        <Route path="/:id" element={<ContactDetails />} />
      </Routes>
    </div>
  );
};

export default ContactsPage;
