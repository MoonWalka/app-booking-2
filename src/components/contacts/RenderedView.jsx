import React from 'react';
import { Link } from 'react-router-dom';

export default function RenderedView({ entity }) {
  const { id, nom, structure, email, telephone } = entity;
  return (
    <div className="contact-details p-4">
      <h2 className="mb-3">{nom}</h2>
      <p><strong>Structure:</strong> {structure || 'Non spécifiée'}</p>
      <p><strong>Email:</strong> {email ? <a href={`mailto:${email}`}>{email}</a> : 'Non spécifié'}</p>
      <p><strong>Téléphone:</strong> {telephone ? <a href={`tel:${telephone}`}>{telephone}</a> : 'Non spécifié'}</p>
      <div className="mt-4">
        <Link to={`/contacts/edit/${id}`} className="tc-btn tc-btn-primary me-2">Modifier</Link>
        <Link to="/contacts" className="tc-btn tc-btn-secondary">Retour à la liste</Link>
      </div>
    </div>
  );
}