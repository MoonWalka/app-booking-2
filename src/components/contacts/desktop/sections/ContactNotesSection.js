// src/components/contacts/desktop/sections/ContactNotesSection.js
import React from 'react';
import SectionWithBubbleTitle from '@/components/ui/SectionWithBubbleTitle';
import FormField from '@/components/ui/FormField';
import Alert from '@/components/ui/Alert';

/**
 * Section Notes du contact
 */
const ContactNotesSection = ({ 
  notes, 
  onChange, 
  isEditMode,
  isEditing 
}) => {
  
  return (
    <SectionWithBubbleTitle
      title="Notes et commentaires"
      icon={<i className="bi bi-journal-text"></i>}
    >
      {(isEditMode || isEditing) ? (
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
          <div className="notes-content" style={{ whiteSpace: 'pre-wrap' }}>
            {notes}
          </div>
        ) : (
          <Alert variant="info">
            Aucune note n'a été ajoutée pour ce contact.
          </Alert>
        )
      )}
    </SectionWithBubbleTitle>
  );
};

export default ContactNotesSection;