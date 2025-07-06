import React from 'react';
import DateSelectorRelational from '@/components/common/DateSelectorRelational';

/**
 * Section component for managing structure concerts
 * Uses DateSelectorRelational for consistent UI
 * 
 * @param {Object} props - Component props
 * @param {Array} props.dateIds - Array of date IDs
 * @param {Function} props.onChange - Handler for date changes
 * @param {string} props.entityId - Structure ID for bidirectional relations
 * @param {boolean} props.isEditing - Whether in edit mode
 */
const StructureDatesManagementSection = ({ 
  dateIds = [], 
  onChange, 
  entityId,
  isEditing = true 
}) => {
  return (
    <DateSelectorRelational
      multiple={true}
      value={dateIds}
      onChange={onChange}
      isEditing={isEditing}
      entityId={entityId}
      entityType="structure"
      label="Dates associés"
      required={false}
    />
  );
};

export default StructureDatesManagementSection;