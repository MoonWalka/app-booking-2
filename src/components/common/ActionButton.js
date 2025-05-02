import React from 'react';
import { Link } from 'react-router-dom';
import styles from './ActionButton.module.css';
import Button from '../ui/Button';

/**
 * Reusable action button component with tooltip support
 * Uses the enhanced Button component as its foundation
 * @param {Object} props - Component properties
 * @param {string} [props.to] - Link destination (renders as Link if provided)
 * @param {string} props.tooltip - Tooltip text
 * @param {ReactNode} props.icon - Icon element
 * @param {string} [props.variant='primary'] - Button variant
 * @param {string} [props.size=''] - Button size
 * @param {Function} [props.onClick] - Click handler
 */
const ActionButton = ({ 
  to, 
  tooltip, 
  icon, 
  variant = 'primary',
  size = 'sm',
  onClick,
  ...restProps 
}) => {
  // Common props for both button types
  const commonProps = {
    variant,
    size,
    icon,
    iconOnly: true,
    tooltip,
    className: `${styles.actionButton}`,
    ...restProps
  };

  // Return Link or Button based on 'to' prop
  if (to) {
    return (
      <Link 
        to={to} 
        className={styles.actionLink}
        onClick={(e) => e.stopPropagation()}
      >
        <Button {...commonProps} />
      </Link>
    );
  }

  return (
    <Button 
      {...commonProps} 
      onClick={(e) => { 
        e.stopPropagation();
        if (onClick) onClick(e); 
      }}
    />
  );
};

export default ActionButton;