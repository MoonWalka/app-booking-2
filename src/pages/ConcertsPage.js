import React, { useState } from 'react';
import ConcertsList from '../components/concerts/ConcertsList';
import ConcertForm from '../components/concerts/ConcertForm';

const ConcertsPage = () => {
  const [showForm, setShowForm] = useState(false);

  const handleAddConcert = () => {
    setShowForm(true);
  };

  const handleCancelForm = () => {
    setShowForm(false);
  };

  const handleSubmitForm = (formData) => {
    console.log('Nouveau concert:', formData);
    setShowForm(false);
    // Ici, vous ajouteriez normalement le concert à votre base de données
  };

  return (
    <div className="concerts-page">
      {showForm ? (
        <ConcertForm 
          onCancel={handleCancelForm} 
          onSubmit={handleSubmitForm} 
        />
      ) : (
        <ConcertsList onAddConcert={handleAddConcert} />
      )}
    </div>
  );
};

export default ConcertsPage;
