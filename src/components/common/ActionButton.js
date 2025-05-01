import React from 'react';
import { Link } from 'react-router-dom';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import styles from './ActionButton.module.css';

/**
 * Reusable action button component with tooltip support
 * Can be rendered as either a Link or a button
 */
const ActionButton = ({ to, tooltip, icon, variant, onClick }) => (
  <OverlayTrigger
    placement="top"
    overlay={<Tooltip>{tooltip}</Tooltip>}
  >
    {to ? (
      <Link 
        to={to} 
        className={`btn btn-${variant} ${styles.actionButton}`}
        onClick={(e) => e.stopPropagation()}
      >
        {icon}
      </Link>
    ) : (
      <button 
        onClick={(e) => { 
          e.stopPropagation();
          onClick(); 
        }} 
        className={`btn btn-${variant} ${styles.actionButton}`}
      >
        {icon}
      </button>
    )}
  </OverlayTrigger>
);

export default ActionButton;