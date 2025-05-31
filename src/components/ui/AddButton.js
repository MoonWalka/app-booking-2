import React from 'react';
import { Link } from 'react-router-dom';
import { useResponsive } from '@/hooks/common';
import styles from './AddButton.module.css';

/**
 * Composant bouton d'ajout standardisé pour TourCraft
 * 
 * @param {Object} props - Propriétés du composant
 * @param {string} props.to - URL de destination (pour Link)
 * @param {Function} props.onClick - Fonction de clic (pour button)
 * @param {string} props.children - Texte du bouton (masqué en mobile)
 * @param {string} props.label - Texte du bouton (alias pour children)
 * @param {string} props.icon - Classe d'icône Bootstrap (défaut: "bi-plus-lg")
 * @param {string} props.variant - Variante de style (défaut: "primary")
 * @param {string} props.size - Taille du bouton (défaut: "base")
 * @param {string} props.className - Classes CSS supplémentaires
 * @param {boolean} props.disabled - Bouton désactivé
 * @param {string} props.ariaLabel - Label d'accessibilité
 */
const AddButton = ({
  to,
  onClick,
  children,
  label,
  icon = "bi-plus-lg",
  variant = "primary",
  size = "base",
  className = "",
  disabled = false,
  ariaLabel,
  ...props
}) => {
  const { isMobile } = useResponsive();
  
  // Texte du bouton (children ou label)
  const buttonText = children || label;
  
  const buttonClasses = [
    styles.addButton,
    styles[`addButton--${variant}`],
    styles[`addButton--${size}`],
    isMobile && styles['addButton--mobile'],
    disabled && styles['addButton--disabled'],
    className
  ].filter(Boolean).join(' ');

  const content = (
    <>
      <i className={icon} aria-hidden="true"></i>
      {!isMobile && buttonText && (
        <span className={styles.addButtonText}>{buttonText}</span>
      )}
    </>
  );

  // Si 'to' est fourni, utiliser Link
  if (to && !disabled) {
    return (
      <Link 
        to={to}
        className={buttonClasses}
        aria-label={ariaLabel || buttonText}
        {...props}
      >
        {content}
      </Link>
    );
  }

  // Sinon, utiliser button
  return (
    <button
      type="button"
      className={buttonClasses}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel || buttonText}
      {...props}
    >
      {content}
    </button>
  );
};

export default AddButton; 