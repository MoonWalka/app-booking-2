import React, { useState } from 'react';
import styles from './ContactWithRoleSelector.module.css';

/**
 * Composant pour sélectionner le rôle d'un contact
 * Utilisé dans UnifiedContactSelector pour attribuer des rôles aux contacts
 */
const ContactWithRoleSelector = ({ 
  contact, 
  onRoleChange, 
  currentRole = 'coordinateur',
  availableRoles = null 
}) => {
  const [showRoleSelector, setShowRoleSelector] = useState(false);

  // Rôles par défaut si non fournis
  const defaultRoles = [
    { value: 'coordinateur', label: 'Coordinateur', icon: 'bi-person-badge' },
    { value: 'signataire', label: 'Signataire', icon: 'bi-pen' },
    { value: 'technique', label: 'Technique', icon: 'bi-tools' },
    { value: 'administratif', label: 'Administratif', icon: 'bi-briefcase' },
    { value: 'commercial', label: 'Commercial', icon: 'bi-currency-euro' },
    { value: 'autre', label: 'Autre', icon: 'bi-person' }
  ];

  const roles = availableRoles || defaultRoles;
  const currentRoleData = roles.find(r => r.value === currentRole) || roles[0];

  const handleRoleSelect = (roleValue) => {
    onRoleChange(contact.id, roleValue);
    setShowRoleSelector(false);
  };

  return (
    <div className={styles.roleContainer}>
      <button
        type="button"
        className={styles.roleButton}
        onClick={() => setShowRoleSelector(!showRoleSelector)}
        title="Changer le rôle"
      >
        <i className={`bi ${currentRoleData.icon}`}></i>
        <span>{currentRoleData.label}</span>
        <i className="bi bi-chevron-down"></i>
      </button>

      {showRoleSelector && (
        <div className={styles.roleDropdown}>
          {roles.map(role => (
            <button
              key={role.value}
              type="button"
              className={`${styles.roleOption} ${role.value === currentRole ? styles.selected : ''}`}
              onClick={() => handleRoleSelect(role.value)}
            >
              <i className={`bi ${role.icon}`}></i>
              <span>{role.label}</span>
              {role.value === currentRole && <i className="bi bi-check"></i>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ContactWithRoleSelector;