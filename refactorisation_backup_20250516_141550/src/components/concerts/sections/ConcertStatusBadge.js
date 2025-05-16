import React from 'react';
import StatusWithInfo from '@/components/common/StatusWithInfo';

const ConcertStatusBadge = ({ concert, statusDetails }) => {
  if (!concert || !statusDetails) return null;
  
  const { icon, label, variant, tooltip } = statusDetails;
  
  return (
    <StatusWithInfo
      icon={icon}
      label={label}
      variant={variant}
      tooltip={tooltip}
    />
  );
};

export default ConcertStatusBadge;