import React from 'react';
import Badge from '@/components/ui/Badge';
import styles from './StatusWithInfo.module.css';

/**
 * Reusable status badge component with tooltip support
 * Harmonisé avec la maquette TourCraft
 */
const StatusWithInfo = ({ icon, label, variant, tooltip, additionalInfo }) => {
  // Mapping des variantes Bootstrap vers nos nouvelles variantes
  const mapVariant = (bootstrapVariant) => {
    const variantMap = {
      'primary': 'blue',
      'info': 'blue',
      'success': 'green',
      'warning': 'yellow',
      'danger': 'red',
      'secondary': 'gray',
      'light': 'gray',
      'dark': 'gray'
    };
    return variantMap[bootstrapVariant] || 'blue';
  };

  const content = (
    <div className={styles.statusBadgeContainer} title={tooltip}>
      <Badge variant={mapVariant(variant)} className={styles.statusBadge}>
        <div className={styles.badgeContent}>
          {icon && <span className={styles.statusIcon}>{icon}</span>}
          <span>{label}</span>
          {additionalInfo && (
            <span className={styles.additionalInfo}>{additionalInfo}</span>
          )}
        </div>
      </Badge>
    </div>
  );

  return content;
};

export default StatusWithInfo;