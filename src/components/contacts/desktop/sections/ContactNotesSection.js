// src/components/contacts/desktop/sections/ContactNotesSection.js
import React from 'react';
import Card from '@/components/ui/Card';
import FormField from '@/components/ui/FormField';
import Alert from '@/components/ui/Alert';

/**
 * Section Notes du contact - Version V2
 */
const ContactNotesSection = ({ 
  notes, 
  onChange, 
  isEditMode 
}) => {
  
  return (
    <Card
      title="Notes et commentaires"
      icon={<i className="bi bi-journal-text"></i>}
    >
      {isEditMode ? (
        <FormField
          label="Notes"
          name="notes"
          type="textarea"
          value={notes || ''}
          onChange={onChange}
          placeholder="Ajoutez vos notes et commentaires sur ce contact..."
          rows={4}
        />
      ) : (
        notes ? (
          <div className="notes-content">
            {notes}
          </div>
        ) : (
          <Alert variant="info">
            Aucune note n'a été ajoutée pour ce contact.
          </Alert>
        )
      )}
    </Card>
  );
};

export default ContactNotesSection;