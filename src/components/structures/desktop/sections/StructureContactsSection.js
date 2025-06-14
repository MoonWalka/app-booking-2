import React from 'react';
import UnifiedContactSelector from '@/components/common/UnifiedContactSelector';

/**
 * Section component for managing structure contacts
 * Uses UnifiedContactSelector for consistent UI
 * 
 * @param {Object} props - Component props
 * @param {Array} props.contactIds - Array of contact IDs
 * @param {Function} props.onChange - Handler for contact changes
 * @param {string} props.entityId - Structure ID for bidirectional relations
 * @param {boolean} props.isEditing - Whether in edit mode
 */
const StructureContactsSection = ({ 
  contactIds = [], 
  onChange, 
  entityId,
  isEditing = true 
}) => {
  return (
    <UnifiedContactSelector
        multiple={true}
        value={contactIds}
        onChange={onChange}
        isEditing={isEditing}
        entityId={entityId}
        entityType="structure"
        label="Contacts associés"
        required={false}
      />
  );
};

export default StructureContactsSection;