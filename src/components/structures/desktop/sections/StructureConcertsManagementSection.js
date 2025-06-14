import React from 'react';
import UnifiedConcertSelector from '@/components/common/UnifiedConcertSelector';

/**
 * Section component for managing structure concerts
 * Uses UnifiedConcertSelector for consistent UI
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
    <UnifiedConcertSelector
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