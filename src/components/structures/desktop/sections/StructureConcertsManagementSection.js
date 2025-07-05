import React from 'react';
import ConcertSelectorRelational from '@/components/common/ConcertSelectorRelational';

/**
 * Section component for managing structure concerts
 * Uses ConcertSelectorRelational for consistent UI
 * 
 * @param {Object} props - Component props
 * @param {Array} props.concertIds - Array of concert IDs
 * @param {Function} props.onChange - Handler for concert changes
 * @param {string} props.entityId - Structure ID for bidirectional relations
 * @param {boolean} props.isEditing - Whether in edit mode
 */
const StructureConcertsManagementSection = ({ 
  concertIds = [], 
  onChange, 
  entityId,
  isEditing = true 
}) => {
  return (
    <ConcertSelectorRelational
      multiple={true}
      value={concertIds}
      onChange={onChange}
      isEditing={isEditing}
      entityId={entityId}
      entityType="structure"
      label="Concerts associés"
      required={false}
    />
  );
};

export default StructureConcertsManagementSection;