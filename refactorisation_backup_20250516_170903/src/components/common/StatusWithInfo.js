import React from 'react';
import { OverlayTrigger, Tooltip, Badge } from 'react-bootstrap';
import styles from './StatusWithInfo.module.css';

/**
 * Reusable status badge component with tooltip support
 */
const StatusWithInfo = ({ icon, label, variant, tooltip, additionalInfo }) => {
  const content = (
    <Badge 
      bg={variant} 
      className={`d-flex align-items-center gap-2 ${styles.statusBadge}`}
    >
      {icon && <span className={styles.statusIcon}>{icon}</span>}
      <span>{label}</span>
      {additionalInfo && (
        <span className={styles.additionalInfo}>{additionalInfo}</span>
      )}
    </Badge>
  );

  if (tooltip) {
    return (
      <OverlayTrigger
        placement="top"
        overlay={<Tooltip>{tooltip}</Tooltip>}
      >
        {content}
      </OverlayTrigger>
    );
  }

  return content;
};

export default StatusWithInfo;